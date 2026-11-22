/**
 * server/src/app.js - builds the Express app (no listen() here so it can be
 * reused by local dev, tests and Vercel).
 */
import express from 'express';
import cors from 'cors';
import { config } from './config.js';
import crimeRoutes from './routes/crimeRoutes.js';
import advisorRoutes from './routes/advisorRoutes.js';
import insightRoutes from './routes/insightRoutes.js';
import communityRoutes from './routes/communityRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import officialRoutes from './routes/officialRoutes.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

const app = express();

app.disable('x-powered-by');
// One proxy hop (Vercel etc.): without this req.ip is the proxy, so every visitor would share one rate-limit bucket.
app.set('trust proxy', 1);
app.use(
  cors({
    origin: config.clientOrigin === '*' ? true : config.clientOrigin.split(',').map((o) => o.trim()),
  })
);
app.use(express.json({ limit: '50kb' }));

app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'safezone-ai-api',
    advisor: config.geminiApiKey ? 'gemini' : 'built-in',
    storage: config.databaseUrl ? 'postgres' : 'json-file',
    admin: config.adminPassword ? 'enabled' : 'disabled',
    time: new Date().toISOString(),
  });
});

app.use('/api/crimes', crimeRoutes);
app.use('/api/advisor', advisorRoutes);
app.use('/api/official', officialRoutes);
app.use('/api/community-reports', communityRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api', insightRoutes); // /api/stats and /api/reports/recent

app.use(notFound);
app.use(errorHandler);

export default app;
