const Application = require("../models/Application.js");
const Notification = require("../models/Notification.js");
const User = require("../models/User.js");
const Job = require("../models/Job.js");
const createError = require("http-errors");
const { sendNotification } = require("../services/socketService.js");
const axios = require("axios");
const pdfParse = require("pdf-parse");

/**----------------------------------------------
 * @desc   Get Candidate Applied Jobs
 * @route  /api/v1/applications/applicant-jobs
 * @method GET
 * @access private (only authenticated user)
-------------------------------------------------*/
module.exports.getCandidateAppliedJobs = async (req, res, next) => {
  try {
    // Extract query params and set applicant filter
    const {
      sort,
      fields,
      limit: limitParam,
      page: pageParam,
      search,
      ...filters
    } = req.query;
    filters.applicantId = req.user._id;

    // 4. Set up pagination with defaults (page 1, limit 5) and ensure values are positive numbers
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
    const [applications, totalApplications] = await Promise.all([
      Application.find(filters)
        .sort(sortBy)
        .select(fieldSelection)
        .skip(skip)
        .limit(limit)
        .lean()
        .populate("jobId", "company position"),
      Application.countDocuments(filters),
    ]);

    // 8. Calculate the total number of pages for pagination metadata
    const pageCount = Math.ceil(totalApplications / limit);

    // 9. Respond with the results in a consistent format
    return res.status(200).json({
      success: true,
      count: applications.length,
      total: totalApplications,
      pagination: {
        current: page,
        limit,
        totalPages: pageCount,
        results: totalApplications,
      },
      data: applications,
    });
  } catch (error) {
    return next(
      createError(
        500,
        `Échec de la récupération des emplois postulés: ${error.message}`
      )
    );
  }
};

/**-------------------------------------------------
 * @desc   Get Recruiter Posted Jobs Apllications
 * @route  /api/v1/applications/recruiter-jobs
 * @method GET
 * @access private (only recruiter)
----------------------------------------------------*/
module.exports.getRecruiterPostJobs = async (req, res, next) => {
  const filter = { recruiterId: req.user._id };
  try {
    const result = await Application.find(filter).populate("jobId");
    const totalJobsApplications = await Application.countDocuments(filter);
    // response
    if (result.length !== 0) {
      return res.status(200).json({
        status: true,
        totalJobsApplications,
        result,
      });
    } else {
      return next(createError(404, "Aucun emploi trouvé"));
    }
  } catch (error) {
    return next(createError(500, error.message));
  }
};

// /**-------------------------------------------------
//  * @desc   Get Recruiter Job Applications By ID
//  * @route  /api/v1/applications/recruiter-jobs/:jobId
//  * @method GET
//  * @access private (only recruiter)
// ----------------------------------------------------*/
// module.exports.getRecruiterJobApplications = async (req, res, next) => {
//   const { jobId } = req.params;
//   const filter = { recruiterId: req.user._id, jobId };
//   try {
//     const result = await Application.find(filter).populate("jobId");
//     const totalJobsApplications = await Application.countDocuments(filter);
//     // response
//     if (result.length !== 0) {
//       return res.status(200).json({
//         status: true,
//         totalJobsApplications,
//         result,
//       });
//     } else {
//       return next(createError(404, "No Applications Found!"));
//     }
//   } catch (error) {
//     return next(createError(500, error.message));
//   }
// };

/**-------------------------------------------------
 * @desc   Apply to a Job
 * @route  /api/v1/applications/apply
 * @method POST
 * @access private (only users)
----------------------------------------------------*/
module.exports.applyInJob = async (req, res, next) => {
  try {
    const alreadyApplied = await Application.findOne({
      applicantId: req.user._id,
      jobId: req.body.jobId,
    });

    if (alreadyApplied) {
      return next(createError(409, "Déjà appliqué"));
    }

    const job = await Job.findById(req.body.jobId).select("createdBy");
    if (!job) {
      return next(createError(404, "Emploi non trouvé"));
    }

    // Check user has a resume
    const applicant = await User.findById(req.user._id).select("resume");
    if (!applicant.resume?.url || !applicant.resume?.publicId) {
      return next(
        createError(
          400,
          "Veuillez télécharger un CV (PDF) sur votre profil avant de postuler à des emplois"
        )
      );
    }

    const applicationData = {
      ...req.body, // Include other fields from the request body
      applicantId: req.user._id, // Set applicantId from the authenticated user
      recruiterId: job.createdBy, // Set recruiterId from the job details
      resume: {
        url: applicant.resume.url,
        publicId: applicant.resume.publicId,
      },
    };

    const application = new Application(applicationData);
    const result = await application.save();

    // Trigger notification for recruiter
    const notification = await Notification.create({
      recipient: applicationData.recruiterId,
      type: "new_application",
      message: `Vous avez reçu une nouvelle candidature pour votre offre d'emploi.`,
      relatedId: application._id,
    });

    // Send real-time notification
    sendNotification(applicationData.recruiterId, notification);

    return res.status(201).json({
      status: true,
      message: "Postulé avec succès",
      data: result,
    });
  } catch (error) {
    next(createError(500, error.message));
  }
};

/**-------------------------------------------------
 * @desc   Update Application Status
 * @route  /api/v1/applications/:id
 * @method PATCH
 * @access private (only recruiter)
----------------------------------------------------*/
module.exports.updateApplicationStatus = async (req, res, next) => {
  const { id } = req.params;

  try {
    const job = await Job.findById(req.body.jobId).select("createdBy");
    if (!job) {
      return next(createError(404, "Emploi non trouvé"));
    }

    if (job.createdBy.toString() !== req.user._id.toString()) {
      return next(createError(401, "Non autorisé à mettre à jour ce travail."));
    }

    const application = await Application.findOne({ _id: id });
    if (!application) {
      return next(createError(404, "Application non trouvée"));
    }

    if (application.status !== req.body.status) {
      const updatedApplication = await Application.findByIdAndUpdate(
        id,
        { status: req.body.status },
        { new: true }
      );

      // Trigger notification for applicant
      const notification = await Notification.create({
        recipient: updatedApplication.applicantId,
        type: "application_status_update",
        message: `Le statut de votre candidature a été mis à jour à ${updatedApplication.status}.`,
        relatedId: updatedApplication._id,
      });

      // Send real-time notification
      sendNotification(updatedApplication.applicantId, notification);

      return res.status(200).json({
        status: true,
        message: "Statut de la demande mis à jour",
        data: updatedApplication,
      });
    }

    res.status(200).json({
      status: false,
      message: "Aucune modification n'a été apportée",
    });
  } catch (error) {
    next(createError(500, `Quelque chose ne va pas: ${error.message}`));
  }
};

/**-------------------------------------------------
 * @desc   AI-filter Applications for a Job
 * @route  /api/v1/applications/ai-filter/:jobId
 * @method GET
 * @access private (only recruiter)
----------------------------------------------------*/
module.exports.filterApplicationsAI = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    // 1. Verify job exists and recruiter owns it
    const job = await Job.findOne({ _id: id, createdBy: userId }).select(
      "position jobDescription jobSkills jobFacilities"
    );

    if (!job) {
      return next(createError(404, "Emploi non trouvé ou accès non autorisé"));
    }

    // 2. Get applications with populated applicant data
    const applications = await Application.find({ jobId: id }).populate(
      "applicantId",
      "username location gender resume"
    );

    if (!applications.length) {
      return res.status(200).json({
        status: true,
        message: "Aucune candidature trouvée pour cet emploi",
        data: [],
      });
    }

    // 3. Process applications in batches to avoid rate limits
    const BATCH_SIZE = 5;
    const analyzedApplications = [];

    for (let i = 0; i < applications.length; i += BATCH_SIZE) {
      const batch = applications.slice(i, i + BATCH_SIZE);
      const batchResults = await Promise.all(
        batch.map(async (application) => {
          try {
            // Get resume content
            const pdfResponse = await axios.get(application.resume.url, {
              responseType: "arraybuffer",
              timeout: 10000,
            });

            const pdfText = await pdfParse(pdfResponse.data);
            const cleanResumeText = pdfText.text
              .replace(/[^\w\s]/gi, "")
              .substring(0, 2500);

            // Construct AI prompt
            const prompt = `Analyze job application based on:
Job Title: ${job.position}
Required Skills: ${job.jobSkills.join(", ")}
Job Description: ${job.jobDescription}

Applicant Info:
- Location: ${application.applicantId.location || "Not specified"}
- Resume Content: ${cleanResumeText}

Calculate suitability score (0-100) considering:
1. Skills match
2. Experience depth
3. Position relevance

Respond with VALID JSON ONLY, but please in frensh: {score: number, reasons: string[]}`;

            // Get AI analysis
            const response = await axios.post(
              "https://api.openai.com/v1/chat/completions",
              {
                model: "gpt-4o-mini",
                messages: [{ role: "user", content: prompt }],
                temperature: 0.3,
                max_tokens: 500,
                response_format: { type: "json_object" },
              },
              {
                headers: {
                  Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
                },
              }
            );

            // Validate and parse response
            const rawAnalysis = response.data.choices[0].message.content;
            const analysis = JSON.parse(rawAnalysis);

            if (!analysis.score || !analysis.reasons) {
              throw new Error("Format de réponse AI non valide");
            }

            // Update application with analysis
            const updatedApp = await Application.findByIdAndUpdate(
              application._id,
              {
                aiAnalysis: {
                  score: analysis.score,
                  reasons: analysis.reasons,
                  lastAnalyzed: new Date(),
                },
              },
              { new: true }
            );

            const applicantInfo = application.applicantId;

            return {
              applicationId: updatedApp._id,
              score: updatedApp.aiAnalysis.score,
              reasons: updatedApp.aiAnalysis.reasons,
              status: updatedApp.status,
              applicant: {
                name: applicantInfo.username,
                location: applicantInfo.location,
              },
            };
          } catch (error) {
            console.error(
              `Application ${application._id} analysis failed:`,
              error
            );
            return {
              applicationId: application._id,
              error: "Analysis failed",
              status: application.status,
            };
          }
        })
      );

      analyzedApplications.push(...batchResults);
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Rate limit buffer
    }

    // 4. Filter & sort valid results
    const validResults = analyzedApplications
      .filter((app) => !app.error && app.score)
      .sort((a, b) => b.score - a.score);

    res.status(200).json({
      status: true,
      message: `AI analysis complete. ${validResults.length}/${applications.length} successful`,
      data: validResults,
    });
  } catch (error) {
    next(createError(500, `AI filtering failed: ${error.message}`));
  }
};
