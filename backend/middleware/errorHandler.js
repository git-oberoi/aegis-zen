import { handleDatabaseError } from '../utils/error.js';

export const errorHandler = (err, req, res, next) => {
  console.error('[Global Error Handler]', err);

  // Check if error originates from MongoDB/Mongoose OR if it is a general system error
  const isDbError = 
    err.name === 'ValidationError' || 
    err.name === 'CastError' || 
    err.code === 11000 || 
    err.name === 'MongoNetworkError' || 
    err.name === 'MongoTimeoutError' ||
    err.message.includes('buffering timed out');

  if (isDbError) {
    const dbErr = handleDatabaseError(err);
    return res.status(dbErr.statusCode).json({ error: dbErr.message });
  }

  const statusCode = err.message === 'NO_API_KEY' ? 400 : 500;
  const message = err.message || 'Internal Server Error';

  res.status(statusCode).json({
    error: message
  });
};

