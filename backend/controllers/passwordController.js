const createError = require("http-errors");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const JWTGenerator = require("../utils/generateJWT.js");
const User = require("../models/User.js");
const sendEmail = require("../utils/sendEmail.js");

/**------------------------------------
 * @desc   Send Reset Password Link
 * @route  /api/v1/password/forgot-password
 * @method POST
 * @access public
---------------------------------------*/
module.exports.sendResetPasswordLink = async (req, res) => {
  const user = await User.findOne({ email: req.body.email });
  if (!user) {
    return next(createError(404, "User not found!!!"));
  }

  const token = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = token;
  user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
  await user.save();

  const link = `${process.env.ALLOWED_ORIGINS}/reset-password/${token}`;

  const htmlTemplate = `<a href="${link}">Cliquez ici pour réinitialiser votre mot de passe</a>`;

  await sendEmail(user.email, "Réinitialiser le mot de passe", htmlTemplate);

  res.status(200).json({
    message:
      "Lien de réinitialisation du mot de passe envoyé à votre e-mail, veuillez vérifier votre boîte de réception",
  });
};

/**------------------------------------
 * @desc   Get Reset Password Link
 * @route  /api/v1/password/reset-password/:token
 * @method GET
 * @access public
---------------------------------------*/
module.exports.getResetPasswordLink = async (req, res) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(createError(400, "Lien invalide!!!"));
  }

  res.status(200).json({ message: "URL valide" });
};

/**------------------------------------
 * @desc   Reset Password
 * @route  /api/v1/password/reset-password/:token
 * @method POST
 * @access public
---------------------------------------*/
module.exports.resetPassword = async (req, res) => {
  const user = await User.findOne({
    resetPasswordToken: req.params.token,
    resetPasswordExpires: { $gt: Date.now() },
  });
  if (!user) {
    return next(createError(400, "Lien invalide!!!"));
  }

  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  res.status(200).json({
    message:
      "Le mot de passe a été réinitialisé avec succès, veuillez vous connecter",
  });
};
