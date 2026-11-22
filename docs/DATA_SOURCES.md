# Data sources policy

SafeZone AI shows three kinds of data and never mixes them:

| Kind | Where it comes from | Counts as official? |
|---|---|---|
| Official statistics | Published police / government reports, imported by an admin | Yes, with source + period |
| Community reports | Public form, reviewed by an admin | **No**, ever |
| Sample map data | `shared/crimeData.json` (illustrative) | **No** |

## Importing a published report
1. Find the report on the publisher's own website. Copy the **exact page or PDF link** into `source_url`.
2. Copy the figures into the CSV template (`server/data/official-template.csv`). One row per district + category + period. Use the publisher's own category names.
3. `period` is `YYYY-MM` for monthly reports or `YYYY` for yearly ones.
4. Run `npm run import:official -- file.csv --dry-run`, fix any rows it rejects, then run it without `--dry-run`.
5. Check the Official stats page: the source name, link and latest period must match the report.

## Rules that protect accuracy
- **Never invent or estimate figures.** If a report does not give a number, leave the row out.
- **One source, one period type per total.** Two agencies, or a yearly total plus its months, describe the same cases. The dashboard therefore sums within a single source and period type; a dropdown switches between them.
- **Real vs sample.** Rows with `is_sample=true` are labelled "Sample data" everywhere and sort after real sources.
- **Registered cases, not "all crime".** Published statistics only reflect cases that were reported and registered. Say so when presenting them.

## About "live" data
Police agencies in Pakistan publish periodic reports; do not assume a public real-time API exists. Check each publisher's site before promising live data. Until a verified feed exists, show the report's period and the import date, as the dashboard does.
