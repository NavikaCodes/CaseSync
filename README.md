# CASESYNC — AICTE Complaint Monitoring Dashboard (SIH 2026 prototype)
Team Polar_Pirates · S077 · *One Institution. One Timeline. Coordinated Action.*

Frontend-only prototype (React 18 + Vite + Tailwind CSS 4 + Recharts + Lucide). No backend, DB, API keys or env vars.
**All data is fictional synthetic demo data.** SLA thresholds are demo values, not AICTE timelines.

## Run
    npm install
    npm run dev          # development
    npm run build        # production build
    npm run preview      # preview the build

## What is real vs simulated
- Real (client-side): case CRUD, filters/sort/pagination, CSV export, overlap detection, coordination workflow, SLA calculation, analytics, audit log, in-app notifications, localStorage persistence, reset.
- Simulated: users/roles (display filter only, not security), notifications (in-app only), data (synthetic).
- Needs backend later: real auth/RBAC, shared database, integration with RB/PGRC systems, email/SMS, document storage, NLP/embedding similarity.

## Overlap detection (src/utils/matching.js)
1. Resolve each case's institution: exact AICTE Permanent ID, else fuzzy name (lower-case, strip punctuation, expand abbreviations like Engg/Coll/Inst, drop stop-words, Dice similarity on bigrams ≥ 0.75).
2. Consider only active cases (everything except Disposed) at the same institution handled by different Bureaus/Cells.
3. Score: both active in different cells +10; same Permanent ID +40 (or fuzzy-name match +30); same category +25 / related category +20; shared complaint terms (synonym-normalised Jaccard) up to +25.
4. Flag if score ≥ 60. Bands: ≥80 High, ≥68 Medium, else Low. Shown as a *heuristic demo score*.
5. Decisions (link / reviewed / rejected) are stored by case-pair key; a rejection is hidden only while the two cases' status, bureau and description are unchanged.
Seeded: ABC Institute (PGRC-2026-001 ↔ RB-2026-014), Sunrise College (spelling variation "Sun Rise Coll. of Engg"), Greenfield (unrelated cases, not flagged), Kaveri Polytechnic (several cases, no overlap), plus overdue, approaching and disposed cases.

## SLA
days remaining = expected disposal date − today. Overdue if < 0; approaching if ≤ threshold (default 3, editable in Settings); disposed cases are "Closed".

## Disposal rate
Disposed ÷ total complaints × 100 (shows N/A when there are none).

## Persistence & audit
State is saved to localStorage key `casesync-state-v1`; corrupted/missing data falls back to the seed. Every mutation goes through one `commit()` in `src/store.jsx` that writes an audit entry (and logs newly suggested overlaps). Settings → Reset restores the seed.

## Demo script (≈4 min)
1. Overview: KPIs derive from data; click *Overdue* → filtered list. Show the coordination banner.
2. Institutions → ABC Institute of Technology: PGRC and RB actions on one colour-coded timeline.
3. Add complaint: institution "A.B.C. Inst. of Technolgy", category Laboratory Facilities, bureau AB → new overlap suggested, notification appears.
4. Overlap Detection: read the matching signals and heuristic score; Open side by side; Link cases.
5. Coordination Center: assign lead, record decision, set Awaiting Action/Resolved (cases stay undisposed).
6. SLA & Escalations: overdue first; escalate a case with remarks. Reports: bureau table, export CSV.
7. Audit Trail: show every step above recorded automatically.

## Manual test checklist
- [ ] Every sidebar item opens a page; bell opens, mark one/all read.
- [ ] Add complaint (empty form shows validation); count and charts update.
- [ ] Edit, change status, reassign, add remark, change next action; delete asks for confirmation.
- [ ] Search + filters combine; sort headers; pagination; CSV downloads and opens.
- [ ] Overlaps: link, reject (disappears; Rejected tab), mark reviewed, restore.
- [ ] Coordination: save decision requires lead/coordinator/decision; Resolved doesn't change case status.
- [ ] Refresh page: changes persist. Settings → Reset restores seed. Role view changes visible data.
