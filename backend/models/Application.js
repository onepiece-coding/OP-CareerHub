const mongoose = require("mongoose");
const { STATUS } = require("../utils/applicationConstants.js");

const ApplicationSchema = new mongoose.Schema(
  {
    applicantId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(STATUS),
      default: STATUS.PENDING,
      required: true,
    },
    resume: {
      type: Object,
      default: {
        url: "",
        publicId: null,
      },
    },
    aiAnalysis: {
      score: Number,
      reasons: [String],
      lastAnalyzed: Date,
    },
    dateOfApplication: {
      type: Date,
      default: Date.now,
    },
    dateOfJoining: {
      type: Date,
      validate: [
        {
          validator: function (value) {
            return this.dateOfApplication <= value;
          },
          message: "dateOfJoining should be greater than dateOfApplication",
        },
      ],
    },
  },
  { timestamps: true }
);

const Application = mongoose.model("Application", ApplicationSchema);
module.exports = Application;
