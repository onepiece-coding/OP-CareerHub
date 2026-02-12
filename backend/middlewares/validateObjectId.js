const mongoose = require("mongoose");
const createError = require("http-errors");

module.exports = (req, res, next) => {
  if(!mongoose.Types.ObjectId.isValid(req.params.id)) {
    return  next(createError(400, "Invalid ID format"));
  }
  next();
};
