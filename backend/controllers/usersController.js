const User = require("../models/User.js");
const Job = require("../models/Job.js");
const Application = require("../models/Application.js");
const Notification = require("../models/Notification.js");
const createError = require("http-errors");
const bcrypt = require("bcrypt");
const path = require("node:path");
const fs = require("node:fs");
const {
  cloudinaryUploadPDF,
  cloudinaryRemovePDF,
  cloudinaryRemoveMultiplePDFs,
  cloudinaryUploadImage,
  cloudinaryRemoveImage,
  cloudinaryRemoveMultipleImages,
} = require("../utils/cloudinary.js");

/**------------------------------------
 * @desc   Get All Users
 * @route  /api/v1/users
 * @method GET
 * @access private (only admin)
---------------------------------------*/
module.exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find({}).select("-password");
    return res.status(200).json({
      status: true,
      count: users.length,
      users,
    });
  } catch (error) {
    next(createError(500, error.message));
  }
};

/**-------------------------------------------
 * @desc   Get Single User
 * @route  /api/v1/users/:id
 * @method GET
 * @access private (only admin)
----------------------------------------------*/
module.exports.getSingleUser = async (req, res, next) => {
  try {
    let user = await User.findById(req.params.id).select("-password");
    if (!user) {
      return next(createError(404, "Utilisateur non trouvé"));
    }
    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(createError(500, error.message));
  }
};

/**-------------------------------------------
 * @desc   Update User
 * @route  /api/v1/users/:id
 * @method PATCH
 * @access private (only user himself)
----------------------------------------------*/
module.exports.updateUser = async (req, res, next) => {
  try {
    // 1. Permission check
    if (req.user._id.toString() !== req.params.id) {
      return next(createError(403, "Accès non autorisé"));
    }

    // 2. Handle resume upload if present
    let resumeData = {};
    if (req.file) {
      // Delete old resume if exists
      const user = await User.findById(req.user._id);
      if (user.resume?.publicId) {
        await cloudinaryRemovePDF(user.resume.publicId);
      }

      // Upload new resume
      const pdfDataURI = `data:application/pdf;base64,${req.file.buffer.toString(
        "base64"
      )}`;
      const cloudinaryRes = await cloudinaryUploadPDF(pdfDataURI);

      resumeData = {
        resume: {
          url: cloudinaryRes.secure_url,
          publicId: cloudinaryRes.public_id,
        },
      };
    }

    // 3. Prepare update data
    const allowedFields = [
      "username",
      "email",
      "password",
      "location",
      "gender",
    ];
    const updateData = { ...resumeData };

    Object.keys(req.body).forEach((field) => {
      if (allowedFields.includes(field) && req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    // 4. Hash password if updated
    if (updateData.password) {
      const salt = await bcrypt.genSalt(16);
      updateData.password = await bcrypt.hash(updateData.password, salt);
    }

    // 5. Update user
    const updatedUser = await User.findByIdAndUpdate(req.user._id, updateData, {
      new: true,
      runValidators: true, // Enforce schema validations
      select: "-password -__v",
    });

    if (!updatedUser) {
      return next(createError(404, "Utilisateur non trouvé"));
    }

    return res.status(200).json({
      success: true,
      message: "Profil mis à jour avec succès",
      data: updatedUser,
    });
  } catch (error) {
    next(createError(500, `Quelque chose s'est mal passé: ${error.message}`));
  }
};

/**---------------------------------------------------
 * @desc   Profile Photo Upload
 * @route  /api/v1/users/profile/profile-photo-upload
 * @method POST
 * @access private (only logged in user)
------------------------------------------------------*/
module.exports.profilePhotoUploadCtrl = async (req, res) => {
  console.log(req.file);

  if (!req.file) {
    return next(createError(400, "no file provided"));
  }

  const imagePath = path.join(__dirname, `../images/${req.file.filename}`);

  const result = await cloudinaryUploadImage(imagePath);

  const user = await User.findById(req.user.id);

  if (user.profilePhoto.publicId !== null) {
    await cloudinaryRemoveImage(user.profilePhoto.publicId);
  }

  user.profilePhoto = {
    url: result.secure_url,
    publicId: result.public_id,
  };

  await user.save();

  res.status(200).json({
    message: "your profile photo uploaded successfully",
    profilePhoto: { url: result.secure_url, publicId: result.public_id },
  });

  fs.unlinkSync(imagePath);
};

/**-------------------------------------------
 * @desc   Delete User
 * @route  /api/v1/users/:id
 * @method DELETE
 * @access private (only admin)
----------------------------------------------*/
module.exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return next(createError(404, "Utilisateur non trouvé"));
    }

    if (user.profilePhoto.publicId !== null) {
      await cloudinaryRemoveImage(user.profilePhoto.publicId);
    }

    // Delete associated data based on role
    if (user.role === "user") {
      // Delete all user's applications
      await Application.deleteMany({ applicantId: user._id });
    } else if (user.role === "recruiter") {
      // Get recruiter's jobs
      const jobs = await Job.find({ createdBy: user._id });
      const jobIds = jobs.map((job) => job._id);

      // Delete applications to these jobs
      await Application.deleteMany({ jobId: { $in: jobIds } });

      // Delete the jobs themselves
      await Job.deleteMany({ createdBy: user._id });
    }

    // Remove resume from Cloudinary
    if (user.resume?.publicId) {
      await cloudinaryRemovePDF(user.resume.publicId);
    }

    // Delete all notifications where the user is the recipient
    await Notification.deleteMany({ recipient: user._id });

    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: true,
      message: "L'utilisateur a été supprimé avec succès",
    });
  } catch (error) {
    next(createError(500, `Échec de la suppression: ${error.message}`));
  }
};

/**-------------------------------------------
 * @desc   Delete All Users
 * @route  /api/v1/users
 * @method DELETE
 * @access private (only admin)
----------------------------------------------*/
module.exports.deleteAllUsers = async (req, res, next) => {
  try {
    const { role } = req.query;

    // Exclude admin role from deletion
    const filter = role
      ? { role, role: { $ne: "admin" } } // Delete by role (except admin)
      : { role: { $ne: "admin" } }; // Delete all non-admin users

    // Get all users and their data
    const users = await User.find(filter);

    // Count total notifications before deletion
    const totalNotificationsCount = await Notification.countDocuments({});

    // Delete Profile Pictures from Cloudinary
    const imagesPublicIds = users
      ?.map((user) => user.profilePhoto.publicId)
      .filter(Boolean);
    if (imagesPublicIds?.length > 0) {
      await cloudinaryRemoveMultipleImages(imagesPublicIds);
    }

    // Extract all resume public IDs (filtering out falsy values)
    const resumesPublicIds = users
      .map((user) => user.resume?.publicId)
      .filter(Boolean);

    // Separate users by role
    const regularUsers = users
      .filter((u) => u.role === "user")
      .map((u) => u._id);
    const recruiters = users
      .filter((u) => u.role === "recruiter")
      .map((u) => u._id);

    // Compute application counts for regular users
    const regularApplicationsCount = await Application.countDocuments({
      applicantId: { $in: regularUsers },
    });

    // For recruiters, fetch jobs and count related applications
    let recruiterJobs = [];
    let jobIds = [];
    if (recruiters.length > 0) {
      recruiterJobs = await Job.find({ createdBy: { $in: recruiters } });
      jobIds = recruiterJobs.map((job) => job._id);
    }
    const recruiterApplicationsCount =
      jobIds.length > 0
        ? await Application.countDocuments({ jobId: { $in: jobIds } })
        : 0;

    const totalApplicationsCount =
      regularApplicationsCount + recruiterApplicationsCount;

    // Delete resumes from Cloudinary
    if (resumesPublicIds.length > 0) {
      await cloudinaryRemoveMultiplePDFs(resumesPublicIds);
    }

    // Delete applications for regular users
    if (regularUsers.length > 0) {
      await Application.deleteMany({ applicantId: { $in: regularUsers } });
    }

    // Delete recruiters' jobs and related applications
    if (jobIds.length > 0) {
      await Application.deleteMany({ jobId: { $in: jobIds } });
      await Job.deleteMany({ createdBy: { $in: recruiters } });
    }

    // Delete all notifications
    await Notification.deleteMany({});

    // Delete all users
    const result = await User.deleteMany(filter);

    return res.status(200).json({
      status: true,
      message:
        "Tous les utilisateurs non administrateurs et les données associées ont été supprimés avec succès",
      stats: {
        totalUsersDeleted: result.deletedCount,
        resumesDeleted: resumesPublicIds.length,
        applicationsDeleted: totalApplicationsCount,
        jobsDeleted: recruiterJobs.length,
        notificationsDeleted: totalNotificationsCount,
      },
    });
  } catch (error) {
    next(createError(500, `Quelque chose ne va pas: ${error.message}`));
  }
};
