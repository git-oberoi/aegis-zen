/**
 * Helper utility to parse Mongoose/MongoDB database exception objects 
 * and return structured, user-friendly errors with proper HTTP status codes.
 */
export const handleDatabaseError = (err) => {
  // 1. Mongoose Validation Error
  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return {
      statusCode: 400,
      message: `Database Validation Error: ${messages.join(', ')}`
    };
  }

  // 2. Mongoose Cast Error (e.g. Invalid ObjectId format)
  if (err.name === 'CastError') {
    return {
      statusCode: 400,
      message: `Invalid Database Identifier format for: ${err.path} (${err.value})`
    };
  }

  // 3. MongoDB Duplicate Key Error (Code 11000)
  if (err.code === 11000) {
    const fields = Object.keys(err.keyValue || {});
    return {
      statusCode: 400,
      message: `Duplicate resource constraint error. A record already exists with field: ${fields.join(', ')}`
    };
  }

  // 4. MongoDB Unavailability / Network Errors
  if (
    err.name === 'MongoNetworkError' ||
    err.name === 'MongoTimeoutError' ||
    err.message.includes('topology') ||
    err.message.includes('buffering timed out')
  ) {
    return {
      statusCode: 503,
      message: 'Database storage service is temporarily unavailable. Please try again shortly.'
    };
  }

  // Default Fallback
  return {
    statusCode: 500,
    message: err.message || 'An unexpected database error occurred.'
  };
};
