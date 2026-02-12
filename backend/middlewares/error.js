// Not Found Middleware
const notFound = (req, res, next) => {
  const error = new Error(`not found - ${req.originalUrl}`);
  error.status = 404;
  next(error);
};

// Error Handler Middleware
const errorHandler = (err, req, res, next) => {
  const statusCode = err.status || 500;

  res.status(statusCode).json({
    success: false,
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
};

module.exports = {
  errorHandler,
  notFound
};