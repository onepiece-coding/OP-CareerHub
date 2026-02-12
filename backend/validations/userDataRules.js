const { check } = require("express-validator");
const User = require("../models/User.js");

module.exports.checkRegisterInput = [
  check("username")
    .trim()
    .notEmpty()
    .withMessage("Le nom d'utilisateur est requis"),
  check("email")
    .trim()
    .notEmpty()
    .withMessage("L'e-mail est obligatoire")
    .isEmail()
    .withMessage("E-mail invalide")
    .custom(async (email) => {
      const isEmailExists = await User.findOne({ email });
      if (isEmailExists) {
        throw new Error("Email Existe déjà");
      }
    }),
  check("password")
    .trim()
    .notEmpty()
    .withMessage("Le mot de passe est requis")
    .isLength({ min: 8 })
    .withMessage("Le mot de passe est trop court (min 8)"),
  check("gender").trim().optional(),
];

module.exports.checkLoginInput = [
  check("email")
    .trim()
    .notEmpty()
    .withMessage("L'e-mail est obligatoire")
    .isEmail()
    .withMessage("E-mail invalide"),
  check("password")
    .trim()
    .notEmpty()
    .withMessage("Le mot de passe est requisd"),
];

module.exports.checkUserUpdateInput = [
  check("username")
    .trim()
    .optional() // Field is optional in PATCH
    .notEmpty()
    .withMessage("Le nom d'utilisateur ne peut pas être vide"),
  check("email")
    .trim()
    .optional()
    .isEmail()
    .withMessage("E-mail invalide")
    .custom(async (email, { req }) => {
      // Skip uniqueness check if email is unchanged
      const user = await User.findById(req.user._id);
      if (user.email !== email) {
        const existingUser = await User.findOne({ email });
        if (existingUser) {
          throw new Error("L'e-mail existe déjà");
        }
      }
    }),
  check("password").trim().optional(),
  check("location").trim().optional(),
  check("gender").trim().optional(),
];

module.exports.checkEmail = [
  check("email")
    .trim()
    .notEmpty()
    .withMessage("L'e-mail est obligatoire")
    .isEmail()
    .withMessage("E-mail invalide"),
];

module.exports.checkNewPassword = [
  check("password")
    .trim()
    .notEmpty()
    .withMessage("Le mot de passe est requis")
    .isLength({ min: 8 })
    .withMessage("Le mot de passe est trop court (min 8)"),
];
