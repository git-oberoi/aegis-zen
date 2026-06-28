import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import plannerRoutes from './src/routes/planner.routes.js';
import burnoutRoutes from './src/routes/burnout.routes.js';
import survivalRoutes from './src/routes/survival.routes.js';
import inboxRoutes from './src/routes/inbox.routes.js';
import briefingRoutes from './src/routes/briefing.routes.js';
import weeklyRoutes from './src/routes/weekly.routes.js';

const app = express();

// ---------- Middleware ----------
app.use(cors());
app.use(express.json({ limit: '5mb' }));

// ---------- API Routes ----------
// All routes are mounted under /api — mirrors original server.js contracts exactly.
app.use('/api', plannerRoutes);
app.use('/api', burnoutRoutes);
app.use('/api', survivalRoutes);
app.use('/api', inboxRoutes);
app.use('/api', briefingRoutes);
app.use('/api', weeklyRoutes);

// ---------- Health Check ----------
app.get('/health', (_req, res) => res.json({ status: 'ok', service: 'Aegis Backend' }));

// ---------- Serve Static Frontend in Production ----------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../frontend/dist')));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/health')) {
      return next();
    }
    res.sendFile(path.join(__dirname, '../frontend/dist/index.html'));
  });
}

// ---------- 404 Fallback ----------
app.use((_req, res) => res.status(404).json({ error: 'Route not found' }));

export default app;
