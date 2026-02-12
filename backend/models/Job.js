const mongoose = require("mongoose");
const { JOB_STATUS, JOB_TYPE } = require("../utils/jobConstants.js");

// const Application = require("../models/Application.js");

const JobSchema = new mongoose.Schema(
  {
    company: {
      type: String,
      requried: [true, "obligatoire"],
      trim: true,
      minLength: [5, "Entreprise est tres petit"],
      maxLength: [100, "Entreprise est tres grand"],
    },
    position: {
      type: String,
      requried: [true, "position obligatoire"],
      trim: true,
      minLength: [5, "position est tres petit"], 
      maxLength: [200, "position est tres grand"],
    },
    jobStatus: {
      type: String,
      enum: Object.values(JOB_STATUS),
      default: JOB_STATUS.PENDING,
    },
    jobType: {
      type: String,
      enum: Object.values(JOB_TYPE),
      default: JOB_TYPE.FULL_TIME,
    },
    jobLocation: {
      type: String,
      required: [true, "obligatoire"],
    },
    createdBy: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    jobVacancy: {
      type: String,
      requried: [true, "obligatoire"],
      trim: true,
    },
    jobSalary: {
      type: String,
      requried: [true, "obligatoire"],
      trim: true,
    },
    jobDeadline: {
      type: String,
      requried: [true, "obligatoire"],
      trim: true,
    },
    jobDescription: {
      type: String,
      requried: [true, "description obligatoire"],
      trim: true,
      minLength: [5, "description est tres petit"],
      maxLength: [100, "Job Description is too long"],
    },
    jobSkills: {
      type: [],
      requried: [true, "Des compétences professionnelles sont requises"],
      trim: true,
    },
    jobFacilities: {
      type: [],
      requried: [true, "Des facilités d'emploi sont requises"],
      trim: true,
    },
    jobContact: {
      type: String,
      requried: [true, "Un contact professionnel est requis"],
      trim: true,
    },
  },
  { timestamps: true } // to keep track
);

// Populate application for this job

// JobSchema.virtual("applications", {
//   ref: "Application",
//   foreignField: "jobId",
//   localField: "_id",
// });

// Deletion done in job controller - you can remove it there and use this code instead
// JobSchema.pre("remove", async function (next) {
//     try {
//         // 'this' refers to the job being removed
//         await Application.deleteMany({ jobId: this._id });
//         next();
//     } catch (error) {
//         next(error);
//     }
// });

const Job = mongoose.model("Job", JobSchema);
module.exports = Job;
