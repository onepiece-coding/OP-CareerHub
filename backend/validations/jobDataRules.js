const { check } = require("express-validator");
const { JOB_TYPE, JOB_STATUS } = require("../utils/jobConstants.js");

module.exports.checkCreateJobInput = [
  check("company")
    .trim()
    .notEmpty()
    .withMessage("Le poste doit avoir une entreprise"),
  check("position")
    .trim()
    .notEmpty()
    .withMessage("Le poste doit avoir un poste"),
  check("jobLocation")
    .trim()
    .notEmpty()
    .withMessage("Le lieu de travail est requis"),
  check("jobStatus")
    .optional()
    .isIn(Object.values(JOB_STATUS))
    .withMessage("Statut d'emploi invalide"),
  check("jobType")
    .optional()
    .isIn(Object.values(JOB_TYPE))
    .withMessage("Type de travail invalide"),
  check("jobVacancy")
    .trim()
    .notEmpty()
    .withMessage("Un poste vacant est requis"),
  check("jobSalary")
    .trim()
    .notEmpty()
    .withMessage("Le salaire du poste est requis"),
  check("jobDeadline")
    .trim()
    .notEmpty()
    .withMessage("La date limite de candidature est obligatoire"),
  check("jobDescription")
    .trim()
    .notEmpty()
    .withMessage("Une description de poste est requise"),
  check("jobSkills")
    .isArray({ min: 1 })
    .withMessage("Des compétences professionnelles sont requises"),
  check("jobFacilities")
    .isArray({ min: 1 })
    .withMessage("Des installations de travail sont requises"),
  check("jobContact")
    .trim()
    .notEmpty()
    .withMessage("Un contact professionnel est requis"),
];

module.exports.checkUpdateJobInput = [
  check("company")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Le poste doit avoir une entreprise"),
  check("position")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Le poste doit avoir un poste"),
  check("jobLocation")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Le lieu de travail est requis"),
  check("jobStatus")
    .optional()
    .isIn(Object.values(JOB_STATUS))
    .withMessage("Statut d'emploi invalide"),
  check("jobType")
    .optional()
    .isIn(Object.values(JOB_TYPE))
    .withMessage("Type de travail invalide"),
  check("jobVacancy")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Un poste vacant est requis"),
  check("jobSalary")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Le salaire du poste est requis"),
  check("jobDeadline")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("La date limite de candidature est obligatoire"),
  check("jobDescription")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Une description de poste est requise"),
  check("jobSkills")
    .optional()
    .isArray({ min: 1 })
    .withMessage("Des compétences professionnelles sont requises"),
  check("jobFacilities")
    .optional()
    .isArray({ min: 1 })
    .withMessage("Des installations de travail sont requises"),
  check("jobContact")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Un contact professionnel est requis"),
];
