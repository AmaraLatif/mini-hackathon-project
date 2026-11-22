/**
 * server/index.js - local entry point (npm run dev:server / npm start).
 * On Vercel the same Express app is exported by /api/index.js instead.
 */
import 'dotenv/config';
import app from './src/app.js';
import { config } from './src/config.js';

app.listen(config.port, () => {
  const ai = config.geminiApiKey ? `Gemini (${config.geminiModel})` : 'built-in advisor (no GEMINI_API_KEY)';
  console.log(`SafeZone AI API listening on http://localhost:${config.port}`);
  console.log(`Safety advice source: ${ai}`);
});
