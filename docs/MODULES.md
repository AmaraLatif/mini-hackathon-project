# Module guide: three people, three independent modules

Each module owns separate folders, so **nobody edits the same file** and merges stay clean.
The only things all modules share are the **contracts** below. Change a contract only after telling the other two.

## Contracts

**C1. Crime record** (`shared/crimeData.json`)
```json
{ "id": "khi-saddar", "city": "Karachi", "area": "Saddar", "latitude": 24.8607, "longitude": 67.0099,
  "crimeType": "Mobile Snatching", "riskLevel": "Low | Medium | High",
  "description": "...", "reportedAt": "2026-11-12" }
```

**C2. Advice response** (`GET /api/advisor/:id`)
```json
{ "areaId": "...", "area": "...", "city": "...", "safetyScore": 55, "riskLevel": "Medium",
  "summary": "...", "tips": ["...", "..."],
  "emergency": { "actions": ["..."], "contacts": [{ "label": "Police", "number": "15" }] },
  "source": "gemini | fallback | offline" }
```

**C3. Hooks the Dashboard page consumes**
- `useCrimeData()` (M2) returns `filtered, selected, stats, loading, error, filters, query, suggestions, layers, selectArea, clearSelection, setCity, setType, toggleRisk, resetFilters, toggleLayer ...`
- `useSafetyAdvice(area)` (M3) returns `{ advice, loading, error, retry }`

**C4. Shared scoring** (`shared/riskScore.js`): `calcSafetyScore`, `scoreBand`, `RISK_META`. Owned by M3, imported by everyone. Change the formula once and the UI and API stay in sync.

## Module 1: Frontend and UI
Works with **no backend and no map**: components are props-driven. To develop in isolation, render a component with hard-coded props.

| Path | Purpose |
|---|---|
| `client/src/app/App.jsx`, `main.jsx` | Routes, shell, reduced-motion config |
| `client/src/pages/*` | Landing, Dashboard (composition only), About |
| `client/src/components/ui/*` | GlassCard, GradientButton, RiskBadge, ScoreRing, Skeleton, CountUp, Logo, SectionHeading |
| `client/src/components/layout/*` | Navbar, Footer |
| `client/src/components/landing/*` | Hero, HeatBackdrop, Overview, Features, HowItWorks, CallToAction |
| `client/src/components/dashboard/*` | StatCards, AdvisorPanel, CrimeStats, RecentReports |
| `client/src/utils/format.js`, `data/team.js`, `index.css`, `tailwind.config.js`, `index.html` | Design system and content |

**Done when:** landing page animates and is responsive at 390px, 768px and 1440px; every widget has a loading skeleton; keyboard focus is visible; no horizontal scroll on mobile.

## Module 2: Map and Data
Works with **no backend**: crimes load from `shared/crimeData.json`.

| Path | Purpose |
|---|---|
| `shared/crimeData.json` | The dataset (add or edit areas here) |
| `client/src/components/map/*` | CrimeMap, HeatLayer, MapLegend, SearchBar, FilterBar, AreaDetails |
| `client/src/hooks/useCrimeData.js` | Data, filters, selection, layers |
| `client/src/services/crimeService.js` | Local JSON or API source (`VITE_CRIME_SOURCE`) |
| `client/src/utils/{filters,geo,stats,risk}.js` | Pure helpers (easy to unit test) |
| Leaflet block in `client/src/index.css` | Dark map styling |

**Done when:** zoom/pan/click work, heatmap and markers toggle, search flies to an area, filters update map and stats, selecting a marker opens details.

## Module 3: Backend and AI
Works with **no frontend**: test with `curl` or `npm test`.

| Path | Purpose |
|---|---|
| `server/**`, `api/index.js`, `vercel.json` | Express API and serverless entry |
| `server/src/services/crimeRepository.js` | The only file that knows where data lives (future DB goes here) |
| `server/src/services/geminiService.js` | Gemini call, validation, timeout |
| `server/src/services/fallbackAdvisor.js` | Predefined advice by crime type and risk level |
| `server/src/services/advisorService.js` | cache, Gemini, fallback |
| `shared/riskScore.js` | Safety-score formula (contract C4) |
| `client/src/hooks/useSafetyAdvice.js`, `services/{http,advisorService,offlineAdvice}.js` | Client side of the advisor |
| `.env.example` | Server configuration |

**Done when:** all routes in the README respond, `npm test` passes, Gemini failure silently falls back, and no secret is committed.

## Shared files (change by request only)
`package.json`, `client/package.json`, `client/vite.config.js`, `README.md`: Member 1 merges these; others ask in the team chat. If you need a new dependency, say so before installing it.
