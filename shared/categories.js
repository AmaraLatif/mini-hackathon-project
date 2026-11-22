/**
 * shared/categories.js - lists used by BOTH the report form (client) and the
 * report validation (server), so a category the form offers is always accepted.
 */
export const REPORT_CATEGORIES = [
  'Mobile Snatching',
  'Street Theft',
  'Vehicle Theft',
  'Burglary',
  'Highway Robbery',
  'Harassment',
  'Vandalism',
  'Fraud / Scams',
  'Other',
];

/** pending = waiting for an admin, verified = confirmed by an admin, rejected = hidden from the public. */
export const REPORT_STATUSES = ['pending', 'verified', 'rejected'];

/** Rough bounding box of Pakistan; rejects obviously wrong coordinates. */
export const PAKISTAN_BOUNDS = { minLat: 23.5, maxLat: 37.2, minLng: 60.8, maxLng: 77.9 };
