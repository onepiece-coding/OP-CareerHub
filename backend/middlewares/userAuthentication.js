const createHttpError = require("http-errors");
const jwt = require("jsonwebtoken");
const User = require("../models/User.js");

module.exports.authenticateUser = async (req, res, next) => {
  const token = req.signedCookies[process.env.COOKIE_NAME];

  if (!token) {
    return next(createHttpError(401, "Unauthorized User"));
  }
  try {
    const { ID, role } = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findOne({ _id: ID, role }).select("-password");
    next();
  } catch (error) {
    next(createHttpError(401, "Unauthorized User"));
  }
};
