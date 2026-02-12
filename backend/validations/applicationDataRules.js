const { check } = require("express-validator");
const mongoose = require("mongoose");

module.exports.checkInput = [
  check("jobId")
    .trim()
    .notEmpty()
    .withMessage("La candidature doit avoir un identifiant d'emploi")
    .custom(async (jobId, { req }) => {
      if (!mongoose.Types.ObjectId.isValid(jobId)) {
        throw new Error("ID de travail non valide");
      }
    }),
  check("dateOfApplication")
    .optional()
    .notEmpty()
    .withMessage("La date de candidature est obligatoire")
    .isDate()
    .withMessage("Format de date invalide. Veuillez saisir une date valide."),
];
