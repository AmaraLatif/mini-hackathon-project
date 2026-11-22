/**
 * Import published statistics into the database.
 *
 *   npm run import:official -- path/to/file.csv           (or .json)
 *   npm run import:official -- path/to/file.csv --dry-run  (validate only)
 *
 * Required columns: province, district, category, period (YYYY-MM or YYYY),
 * cases, source_name, source_url.  Optional: is_sample (true/false).
 * One bad row rejects the whole file, so you never end up with half an import.
 * Re-importing the same source/district/category/period updates it (no duplicates).
 */
import 'dotenv/config';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { getStore } from '../src/store/index.js';
import { validateOfficialRows } from '../src/services/officialService.js';
import { parseCsv } from '../src/utils/csv.js';

const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const file = args.find((a) => !a.startsWith('--'));

if (!file) {
  console.error('Usage: npm run import:official -- <file.csv|file.json> [--dry-run]');
  process.exit(1);
}

const text = await readFile(file, 'utf-8');
const raw = path.extname(file).toLowerCase() === '.json' ? JSON.parse(text) : parseCsv(text);
if (!Array.isArray(raw) || raw.length === 0) {
  console.error('No rows found in the file.');
  process.exit(1);
}

const { rows, errors } = validateOfficialRows(raw);
if (errors.length) {
  console.error(`Rejected: ${errors.length} invalid row(s). Nothing was saved.`);
  for (const e of errors.slice(0, 20)) console.error(`  row ${e.row}: ${e.message}`);
  if (errors.length > 20) console.error(`  ...and ${errors.length - 20} more`);
  process.exit(1);
}

const sources = [...new Set(rows.map((r) => r.sourceName))];
console.log(`${rows.length} valid row(s) from ${sources.length} source(s): ${sources.join(', ')}`);
if (rows.some((r) => r.isSample)) console.log('Note: some rows are marked is_sample=true and will be labelled SAMPLE in the dashboard.');

if (dryRun) {
  console.log('Dry run: nothing saved.');
} else {
  const store = await getStore();
  const result = await store.upsertOfficial(rows);
  console.log(`Saved to ${store.kind}: ${result.inserted} new, ${result.updated} updated.`);
  await store.close();
}
