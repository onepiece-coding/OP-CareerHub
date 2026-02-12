const User = require("../models/User.js");
const Job = require("../models/Job.js");
const mongoose = require("mongoose");
const createError = require("http-errors");
const day = require("dayjs");

/**------------------------------------
 * @desc   Get All Info
 * @route  /api/v1/admin/info
 * @method GET
 * @access private (only admin)
---------------------------------------*/
module.exports.getAllInfo = async (req, res, next) => {
  try {
    const users = await User.find({});
    const admin = await User.find({ role: "admin" });
    const recruiter = await User.find({ role: "recruiter" });
    const applicant = await User.find({ role: "user" });

    const jobs = await Job.find({});

    const interviewJobs = await Job.find({ jobStatus: "en attente" });
    const pendingJobs = await Job.find({ jobStatus: "entretien" });
    const declinedJobs = await Job.find({ jobStatus: "refusé" });

    res.status(200).json({
      utilisateurs: users?.length || 0,
      administrateurs: admin?.length || 0,
      recruteurs: recruiter?.length || 0,
      candidats: applicant?.length || 0,
      emplois: jobs?.length || 0,
      entretien: interviewJobs?.length || 0,
      "en attente": pendingJobs?.length || 0,
      "refusé": declinedJobs?.length || 0,
    });
  } catch (error) {
    next(createError(500, error.message));
  }
};

/**------------------------------------
 * @desc   Get Monthly Stats
 * @route  /api/v1/admin/stats
 * @method GET
 * @access private (only admin)
---------------------------------------*/
module.exports.getMonthlyStats = async (req, res, next) => {
  try {
    // let stats = await Job.aggregate([
    //     { $match: { createdBy: new mongoose.Types.ObjectId(req.user._id) } },
    //     { $group: { _id: "$jobStatus", count: { $sum: 1 } } },
    // ]);
    let stats = await Job.aggregate([
      { $group: { _id: "$jobStatus", count: { $sum: 1 } } },
    ]);

    stats = stats.reduce((acc, current) => {
      const { _id: title, count } = current;
      acc[title] = count;
      return acc;
    }, {});

    console.log("stats:", stats);

    const defaultStats = [
      { name: "en attente", value: stats["en attente"] || 0 },
      { name: "entretien", value: stats["entretien"] || 0 },
      { name: "refusé", value: stats["refusé"] || 0 },
    ];

    // monthly
    // let monthly_stats = await Job.aggregate([
    //     { $match: { createdBy: new mongoose.Types.ObjectId(req.user._id) } },
    //     {
    //         $group: {
    //             _id: {
    //                 year: { $year: "$createdAt" },
    //                 month: { $month: "$createdAt" },
    //             },
    //             count: { $sum: 1 },
    //         },
    //     },
    //     { $sort: { "_id:year": -1, "_id.month": -1 } },
    //     { $limit: 6 }, // how many return(last six month's value will return)
    // ]);

    let monthly_stats = await Job.aggregate([
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": -1, "_id.month": -1 } },
      { $limit: 6 }, // how many return(last six month's value will return)
    ]);

    monthly_stats = monthly_stats
      .map((item) => {
        const {
          _id: { year, month },
          count,
        } = item;
        const date = day()
          .month(month - 1)
          .year(year)
          .format("MMM YY");
        return { date, count };
      })
      .reverse(); // reverse: to get latest 6 ones
    res.status(200).json({ defaultStats, monthly_stats });
  } catch (error) {
    next(createError(500, error.message));
  }
};

/**------------------------------------
 * @desc   Update User Role
 * @route  /api/v1/admin/update-role
 * @method PATCH
 * @access private (only admin)
---------------------------------------*/
module.exports.updateUserRole = async (req, res, next) => {
  const { id, role } = req.body;
  try {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      next(createError(400, "Format d'ID utilisateur non valide"));
    } else {
      const updateUser = await User.findByIdAndUpdate(
        { _id: id },
        { $set: { role: role } },
        {
          new: true,
        }
      );
      res.status(200).json({
        status: true,
        message: "Rôle mis à jour",
      });
    }
  } catch (error) {
    next(createError(500, `Quelque chose s'est mal passé: ${error.message}`));
  }
};
