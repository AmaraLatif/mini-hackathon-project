/**
 * api/index.js - Vercel serverless entry. Vercel treats the default export of
 * an Express app as a request handler, so every /api/* call lands here.
 */
import app from '../server/src/app.js';

export default app;
