export const apiKeyMiddleware = (req, res, next) => {
  req.apiKey = req.headers['x-gemini-key'] || process.env.GEMINI_API_KEY || '';
  next();
};
