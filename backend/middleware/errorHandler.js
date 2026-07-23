/**
 * Error Handler Middleware
 * Catches errors from route handlers and returns a formatted JSON response.
 */
const errorHandler = (err, req, res, next) => {
  console.error('❌ Error:', err.stack || err.message);

  const statusCode = err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
