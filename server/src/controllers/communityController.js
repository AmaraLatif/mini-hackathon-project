import { getStore } from '../store/index.js';
import { listPublicReports, submitReport, toPublicReport } from '../services/reportService.js';

export async function createReport(req, res) {
  const result = await submitReport(req.body, { ip: req.ip }, { store: await getStore() });
  // Bots get the same answer as people, so they cannot tell the honeypot worked.
  if (result.ignored) return res.status(201).json({ message: 'Report received. It will appear after review.' });
  res.status(201).json({
    message: 'Thank you. Your report is pending review and is not counted in official statistics.',
    report: toPublicReport(result.report),
  });
}

export async function listReports(req, res) {
  const { status, city, category, limit } = req.query;
  const data = await listPublicReports({ status, city, category, limit }, { store: await getStore() });
  res.json({ count: data.length, data });
}
