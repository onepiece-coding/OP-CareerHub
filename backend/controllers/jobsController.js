const Job = require("../models/Job.js");
const Application = require("../models/Application.js");
const Notification = require("../models/Notification.js");

const createError = require("http-errors");
const { sendNotification } = require("../services/socketService.js");

/**------------------------------------
 * @desc   Get All Jobs
 * @route  /api/v1/jobs
 * @method GET
 * @access public
---------------------------------------*/
module.exports.getAllJobs = async (req, res, next) => {
  try {
    // 1. Destructure query parameters and gather additional filters
    const {
      sort,
      fields,
      page: pageParam,
      limit: limitParam,
      search,
      ...queryParams
    } = req.query;

    // 2. Build filters object from remaining query parameters
    const filters = { ...queryParams };

    // 3. If a search term is provided, apply it to multiple fields using $or
    if (search) {
      filters.$or = [
        "company",
        "position",
        "jobStatus",
        "jobType",
        "jobLocation",
      ].map((field) => ({
        [field]: { $regex: search, $options: "i" },
      }));
    }

    // 4. Set up pagination with defaults (page 1, limit 10) and ensure values are positive numbers
    const page = Math.max(parseInt(pageParam, 10) || 1, 1);
    const limit = Math.max(parseInt(limitParam, 10) || 5, 1);
    const skip = (page - 1) * limit;

    // 5. Define sort options and select the sort criteria
    const sortOptions = {
      newest: { createdAt: -1 },
      oldest: { createdAt: 1 },
      "a-z": { position: 1 },
      "z-a": { position: -1 },
    };
    const sortBy = sortOptions[sort] || sortOptions.newest;

    // 6. Handle field selection, defaulting to exclude __v field if not provided
    const fieldSelection = fields ? fields.split(",").join(" ") : "-__v";

    // 7. Execute both the data query and count query concurrently for performance
    const [jobs, totalJobs] = await Promise.all([
      Job.find(filters)
        .sort(sortBy)
        .select(fieldSelection)
        .skip(skip)
        .limit(limit)
        .lean(),
      Job.countDocuments(filters),
    ]);

    // 8. Calculate the total number of pages for pagination metadata
    const pageCount = Math.ceil(totalJobs / limit);

    // 9. Respond with the results in a consistent format
    return res.status(200).json({
      success: true,
      count: jobs.length,
      total: totalJobs,
      pagination: {
        current: page,
        limit,
        totalPages: pageCount,
        results: totalJobs,
      },
      data: jobs,
    });
  } catch (error) {
    return next(createError(500, "Échec de la récupération des tâches"));
  }
};

/**------------------------------------
 * @desc   Get My Jobs
 * @route  /api/v1/jobs/my-jobs
 * @method GET
 * @access private(only recruiter)
---------------------------------------*/
module.exports.getMyJobs = async (req, res, next) => {
  try {
    // Find jobs created by the authenticated user and populate specific fields from the user document
    const jobs = await Job.find({ createdBy: req.user._id }).populate(
      "createdBy",
      "username email"
    );

    if (!jobs || jobs.length === 0) {
      return next(createError(404, "Aucun emploi trouvé pour cet utilisateur"));
    }

    return res.status(200).json({
      status: true,
      data: jobs,
    });
  } catch (error) {
    return next(
      createError(500, `Quelque chose s'est mal passé: ${error.message}`)
    );
  }
};

/**------------------------------------
 * @desc   Get Single Job
 * @route  /api/v1/jobs/:id
 * @method GET
 * @access public
---------------------------------------*/
module.exports.getSingleJob = async (req, res, next) => {
  try {
    const result = await Job.findById(req.params.id);
    if (!result) {
      return next(createError(404, "Emploi non trouvé"));
    } else {
      return res.status(200).json({
        status: true,
        result,
      });
    }
  } catch (error) {
    next(createError(500, `Quelque chose ne va pas: ${error.message}`));
  }
};

/**------------------------------------
 * @desc   Add Job
 * @route  /api/v1/jobs
 * @method POST
 * @access private(only recruiter)
---------------------------------------*/
module.exports.addJob = async (req, res, next) => {
  try {
    const jobData = req.body;
    const { company, position, jobVacancy } = jobData;
    const jobExists = await Job.findOne({ company, position, jobVacancy });
    if (jobExists) {
      return next(createError(409, "Le travail existe déjà"));
    }

    jobData.createdBy = req.user._id;
    const newJob = new Job(jobData);
    const result = await newJob.save();

    return res.status(201).json({
      status: true,
      result,
    });
  } catch (error) {
    return next(
      createError(500, `Quelque chose s'est mal passé: ${error.message}`)
    );
  }
};

/**------------------------------------
 * @desc   Update Single Job
 * @route  /api/v1/jobs/:id
 * @method PATCH
 * @access private(only recruiter)
---------------------------------------*/
module.exports.updateSingleJob = async (req, res, next) => {
  const { id } = req.params;
  const data = req.body;
  try {
    const job = await Job.findOne({ _id: id });
    if (!job) {
      return next(createError(404, "Emploi non trouvé"));
    } else {
      const updatedJob = await Job.findByIdAndUpdate(id, data, {
        new: true,
      });

      if (job.jobStatus !== req.body.jobStatus) {
        // Find all applications for the updated job
        const applications = await Application.find({ jobId: updatedJob._id });

        // Trigger notifications for each applicant
        const notifications = applications.map((app) => ({
          recipient: app.applicantId,
          type: "job_status_update",
          message: `Le statut de l'emploi auquel vous avez postulé a été mis à jour à ${updatedJob.jobStatus}.`,
          relatedId: updatedJob._id,
        }));

        await Notification.insertMany(notifications);

        // Send real-time notification
        notifications.forEach((notification) => {
          sendNotification(notification.recipient, notification);
        });
      }

      return res.status(200).json({
        status: true,
        message: "Emploi mis à jour",
        result: updatedJob,
      });
    }
  } catch (error) {
    return next(createError(500, `Quelque chose ne va pas: ${error.message}`));
  }
};

/**------------------------------------
 * @desc   Delete Single Job
 * @route  /api/v1/jobs/:id
 * @method DELETE
 * @access private(only recruiter)
---------------------------------------*/
module.exports.deleteSingleJob = async (req, res, next) => {
  const { id } = req.params;
  try {
    const isJobExists = await Job.findOne({ _id: id });
    if (!isJobExists) {
      return res.status(404).json({
        status: false,
        message: "Emploi non trouvé",
      });
    } else {
      // Find and delete associated applications

      await Application.deleteMany({ jobId: id });
      const result = await Job.findByIdAndDelete(id);

      return res.status(200).json({
        status: true,
        message: "Travail supprimé",
        result,
      });
    }
  } catch (error) {
    return next(createError(500, `Quelque chose ne va pas: ${error.message}`));
  }
};

/**------------------------------------
 * @desc   Delete All Jobs
 * @route  /api/v1/jobs
 * @method DELETE
 * @access private (only admin)
---------------------------------------*/
module.exports.deleteAllJobs = async (req, res, next) => {
  try {
    // Fetch all job IDs
    const jobs = await Job.find({}, "_id");
    const jobIds = jobs.map((job) => job._id);

    // Delete applications that belong to these jobs
    if (jobIds.length > 0) {
      await Application.deleteMany({ jobId: { $in: jobIds } });
    }

    // Delete all jobs
    const result = await Job.deleteMany({});

    return res.status(200).json({
      status: true,
      message:
        "Tous les emplois et leurs applications associées ont été supprimés avec succès.",
      result,
    });
  } catch (error) {
    next(createError(500, `quelque chose s'est mal passé : ${error.message}`));
  }
};
