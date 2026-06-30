import mongoose from 'mongoose';
import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import { apiKeyMiddleware } from './middleware/apiKey.js';
import { errorHandler } from './middleware/errorHandler.js';

import plannerRoutes from './routes/planner.routes.js';
import burnoutRoutes from './routes/burnout.routes.js';
import survivalRoutes from './routes/survival.routes.js';
import inboxRoutes from './routes/inbox.routes.js';
import briefingRoutes from './routes/briefing.routes.js';
import weeklyRoutes from './routes/weekly.routes.js';

const app = express();

// ---------- Middleware ----------
app.use(cors());
app.use(express.json({ limit: '5mb' }));

// ---------- API Routes ----------
// Apply API Key resolver middleware globally to all API routes
app.use('/api', apiKeyMiddleware);

app.use('/api', plannerRoutes);
app.use('/api', burnoutRoutes);
app.use('/api', survivalRoutes);
app.use('/api', inboxRoutes);
app.use('/api', briefingRoutes);
app.use('/api', weeklyRoutes);

// ---------- Health Check ----------
app.get('/health', (_req, res) => {
  const states = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };
  const dbState = states[mongoose.connection.readyState] || 'unknown';

  res.json({
    status: 'ok',
    service: 'Aegis Backend',
    database: dbState,
    uptime: Math.floor(process.uptime())
  });
});


// ---------- Serve Static Frontend in Production ----------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  app.get(/.*/, (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/health')) {
      return next();
    }
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  });
}

// ---------- 404 Fallback ----------
app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));

// ---------- Global Error Handler ----------
app.use(errorHandler);


export default app;
