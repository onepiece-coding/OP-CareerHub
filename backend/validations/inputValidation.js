const { validationResult } = require("express-validator");
const createError = require("http-errors");

module.exports.inputValidation = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ error: errors.array() });
    }
    next();
};
