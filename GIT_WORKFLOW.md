# Git workflow for three people

## Repository structure
One monorepo, one GitHub repository. Each module owns separate folders (see `docs/MODULES.md`), so merges rarely conflict.

## Branches
| Branch | Purpose | Who |
|---|---|---|
| `main` | Always demo-ready. Deployed by Vercel. Protected: no direct pushes. | merge via PR only |
| `develop` | Integration branch where the three modules meet. | PRs from feature branches |
| `feature/m1-frontend-ui` | Module 1 work | Member 1 |
| `feature/m2-map-data` | Module 2 work | Member 2 |
| `feature/m3-backend-ai` | Module 3 work | Member 3 |

For anything bigger than a few hours, branch off your module branch: `feature/m2-heatmap-tuning`, and merge it back into your module branch.

## Step 0: start the repo (Member 1, once)
```bash
git init && git branch -M main
git add shared/ README.md GIT_WORKFLOW.md docs/ LICENSE .gitignore .env.example package.json vercel.json
git commit -m "chore: project scaffold, shared data contract and docs"
git remote add origin <repo-url> && git push -u origin main
git checkout -b develop && git push -u origin develop
```
Teammates then `git clone` and create their own feature branch from `develop`.

## Step 1: each member commits ONLY their own module
The starter kit already contains working code for all three modules. Each member reviews their module, makes sure they can explain it, and commits it **under their own name** in logical pieces. Use `git status` to check you only stage your paths.

### Member 1: `feature/m1-frontend-ui`
```bash
git checkout -b feature/m1-frontend-ui develop
git add client/package.json client/vite.config.js client/postcss.config.js client/tailwind.config.js client/index.html client/public client/src/index.css client/src/main.jsx
git commit -m "chore(client): add Vite, Tailwind config and design tokens"
git add client/src/components/ui client/src/utils/format.js
git commit -m "feat(ui): add glass card, gradient button, risk badge, score ring and skeleton"
git add client/src/components/layout client/src/app
git commit -m "feat(layout): add navbar, footer and app routing"
git add client/src/components/landing client/src/pages/Landing.jsx
git commit -m "feat(landing): add hero, overview, features, how-it-works and CTA"
git add client/src/components/dashboard client/src/pages/Dashboard.jsx
git commit -m "feat(dashboard): add stat cards, advisor panel, crime stats and recent reports"
git add client/src/pages/About.jsx client/src/data
git commit -m "feat(about): add about page and team data"
```

### Member 2: `feature/m2-map-data`
```bash
git checkout -b feature/m2-map-data develop
git add shared/crimeData.json
git commit -m "feat(data): add 30 sample crime areas across 8 Pakistani cities"
git add client/src/utils/risk.js client/src/utils/geo.js client/src/utils/filters.js client/src/utils/stats.js
git commit -m "feat(utils): add risk, geo, filter and stats helpers"
git add client/src/services/crimeService.js client/src/hooks/useCrimeData.js
git commit -m "feat(data): add crime service and useCrimeData hook"
git add client/src/components/map/CrimeMap.jsx client/src/components/map/HeatLayer.jsx client/src/components/map/MapLegend.jsx
git commit -m "feat(map): add Leaflet map with markers, heat layer and click-to-select"
git add client/src/components/map/SearchBar.jsx client/src/components/map/FilterBar.jsx client/src/components/map/AreaDetails.jsx
git commit -m "feat(map): add search, filters and area details"
```

### Member 3: `feature/m3-backend-ai`
```bash
git checkout -b feature/m3-backend-ai develop
git add shared/riskScore.js
git commit -m "feat(shared): add risk metadata and safety-score formula"
git add server/index.js server/src/app.js server/src/config.js server/src/middleware server/src/routes server/src/controllers server/src/services/crimeRepository.js server/src/services/statsService.js
git commit -m "feat(api): add Express app, crime/stats routes and error handling"
git add server/src/services/fallbackAdvisor.js server/src/services/advisorService.js
git commit -m "feat(advisor): add predefined safety advice and caching"
git add server/src/services/geminiService.js .env.example
git commit -m "feat(ai): integrate Gemini with validation, timeout and fallback"
git add server/tests api vercel.json package.json
git commit -m "test(api): add API and Gemini tests; add Vercel entry"
git add client/src/services/http.js client/src/services/advisorService.js client/src/services/offlineAdvice.js client/src/hooks/useSafetyAdvice.js
git commit -m "feat(client): add advisor service, offline fallback and useSafetyAdvice hook"
```
Push your branch and open a Pull Request into `develop`: `git push -u origin <your-branch>`.

## Merge order
1. **Module 3** (backend + `shared/riskScore.js`): no UI dependencies, and `riskScore.js` is imported by others.
2. **Module 2** (map + data): needs `riskScore.js` from step 1.
3. **Module 1** (UI): the Dashboard page imports hooks and components from both, so it merges last.
4. Pull `develop`, run `npm run install:all && npm run dev`, and click through every page.
5. PR `develop` into `main` and let Vercel deploy.

After each merge, the next member runs `git merge develop` into their branch (or rebases) and re-tests.

## Commit message convention
`type(scope): short imperative summary` with types `feat`, `fix`, `style`, `refactor`, `docs`, `test`, `chore`.
Examples: `fix(map): keep selected marker above others`, `style(landing): tighten hero spacing`, `docs: add AI usage log entry`.

## Conflict avoidance
- **Stay in your folders.** Ownership is in `docs/MODULES.md`.
- **Shared files** (`package.json`, `vite.config.js`, `README.md`): Member 1 edits; others ask in chat.
- **Contracts** (C1-C4 in `docs/MODULES.md`): announce changes before making them.
- **Small, frequent commits** and short-lived branches.
- **Never** commit `.env`, API keys or `node_modules`. `.gitignore` covers them. If a key leaks, rotate it immediately.
- Enable branch protection on `main` (require a PR and one review).

## Daily workflow (all three)
```bash
# Morning
git checkout develop && git pull
git checkout <your-branch> && git merge develop     # pick up teammates' work

# During the day (every 30-60 minutes)
git add <your files> && git commit -m "feat(scope): ..."

# Evening
git push origin <your-branch>
# open or update your PR into develop; ask one teammate to review
```
**Hackathon rhythm:** hour 0 scaffold and branches; hours 1-3 build in parallel; hour 3 merge M3 then M2 then M1; hour 4 polish, screenshots, README names and AI log, deploy.

## Honest-history note
Commit only work you have read and can explain, under your own Git identity. Record AI assistance in the README's **AI usage log** so judges see exactly what was generated and what you changed.
