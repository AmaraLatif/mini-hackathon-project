# SafeZone AI: Backend API Reference

Owner: Module 3 (Backend and AI). Base URL locally: `http://localhost:5000`. On Vercel the same routes live under the site's own domain.

All responses are JSON. Errors look like `{ "error": "message" }`.

## Data kept separate
| Kind | Where it comes from | Rule |
|---|---|---|
| Sample map data | `shared/crimeData.json` (30 illustrative areas) | Not official. Used only for the map and heatmap. |
| Official statistics | CSV/JSON import (`npm run import:official`) | Always has source name, source link and period. |
| Community reports | Public form | Start as `pending`. Never added to official totals. |

## Public routes

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/health` | Status, active advisor (`gemini` or `built-in`), storage (`json-file` or `postgres`), admin (`enabled` or `disabled`) |
| GET | `/api/crimes?city=&risk=&type=&q=` | List and filter the sample map areas |
| GET | `/api/crimes/:id` | One area. 404 if the id is unknown |
| GET | `/api/advisor/:id` | Safety score, summary, tips, emergency contacts. Uses Gemini when a key is set, otherwise the built-in advisor. Cached 10 minutes. Rate limit: 30 requests per minute per IP |
| GET | `/api/stats` | Aggregate counts and average score of the sample map data |
| GET | `/api/reports/recent?limit=6` | Latest sample-map reports |
| GET | `/api/overview` | Headline numbers: official cases, community counts and sample map size, kept separate |
| GET | `/api/official/summary?source=&periodType=&province=&district=&category=&from=&to=` | Official statistics for ONE source and ONE period type, so nothing is double counted |
| GET | `/api/community-reports?status=&city=&category=` | Pending and verified community reports. Contact details are never included |
| POST | `/api/community-reports` | Submit a report. Always created as `pending`. Rate limit: 10 per minute per IP |

### Advisor response shape
```json
{
  "areaId": "khi-saddar",
  "area": "Saddar",
  "city": "Karachi",
  "safetyScore": 55,
  "riskLevel": "Medium",
  "summary": "...",
  "tips": ["...", "..."],
  "emergency": {
    "actions": ["..."],
    "contacts": [{ "label": "Police", "number": "15" }]
  },
  "source": "gemini | fallback | offline"
}
```
The score and phone numbers always come from our own code. Gemini only writes the summary, tips and emergency actions.

### Community report: protections
- New reports are `pending` until an admin reviews them.
- Rate limit per IP, a hidden honeypot field that silently drops bots, and duplicate flagging (same city, area and category within 24 hours).
- Validation rejects bad categories, too-short text, future or invalid dates and bad coordinates.

## Admin routes
Admin is **disabled** unless `ADMIN_PASSWORD` is set. There is no default password.

| Method | Route | Purpose |
|---|---|---|
| POST | `/api/admin/login` | Body `{ "password": "..." }`. Returns a session token valid for 8 hours. Rate limit: 5 per minute per IP |
| GET | `/api/admin/reports?status=` | All reports including rejected ones and contact details. Needs `Authorization: Bearer <token>` |
| PATCH | `/api/admin/reports/:id` | Body `{ "status": "verified" \| "rejected" \| "pending", "note": "..." }`. Needs the Bearer token. 404 if the id is unknown |

## Environment variables
| Variable | Needed | Meaning |
|---|---|---|
| `PORT` | no | Server port (default 5000) |
| `CLIENT_ORIGIN` | no | Allowed website origin (default `*`) |
| `GEMINI_API_KEY` | no | Without it the built-in advisor is used |
| `GEMINI_MODEL` | no | Gemini model name (check Google's model list) |
| `DATABASE_URL` | on Vercel | PostgreSQL connection string. Without it a local JSON file is used |
| `ADMIN_PASSWORD` | for admin | Enables the admin panel |
| `AUTH_SECRET` | for admin | Signs admin tokens. Use a long random string |

Never commit `.env`. Only `.env.example` (with empty values) is committed.

## Storage
- **Local:** `server/data/store.json` (no setup).
- **PostgreSQL:** set `DATABASE_URL`. Tables `community_reports` and `official_stats` are created automatically at startup from `server/src/db/schema.sql`.

## Official data import
```bash
npm run import:official -- server/data/official-sample.csv --dry-run   # validate only
npm run import:official -- server/data/official-sample.csv             # save
```
Columns: `province, district, category, period (YYYY-MM or YYYY), cases, source_name, source_url, is_sample`. One invalid row rejects the whole file. Re-importing the same source, district, category and period updates the row instead of duplicating it.

## Tests
```bash
npm test
```
22 tests cover the API, Gemini fallback, report validation, moderation, rate limiting, official data rules and the JSON store.
