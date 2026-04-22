# Token Usage — edutok

Tracks Claude Code session costs for the edutok project. Appended at the end of each significant session. Rule source: project `CLAUDE.md` + memory `project_token_tracking.md`.

**Baseline:** Claude Pro = $20/month. Fractions bucketed in quarters ($5 each → 0.25 / 0.50 / 0.75 / 1.00).

**Pricing assumed:** Opus 4.7 (1M context) — ~$15/M input, ~$75/M output. Sonnet 4.6 — ~$3/M input, ~$15/M output. Exact token counters are **not exposed** to the assistant inside Claude Code; numbers below are conservative estimates (no cache-read discount applied — if caching is active, actual cost is lower).

---

## 2026-04

### 2026-04-22 — backend MVP spec review & fixes

| Field | Value |
|---|---|
| Topic | Verified Gemini SDK via Context7 + `ai.google.dev` WebFetch; applied 9 accepted agent-review fixes to `docs/superpowers/specs/2026-04-22-edutok-backend-mvp-design.md`; added §16 review protocol; added VERIFIED markers in §5.1/§6.1/§6.2 to prevent future agent drift; flagged timeline A/B/C as open |
| Model | Opus 4.7 (1M context) |
| Input tokens (est) | ~150K |
| Output tokens (est) | ~25K |
| API cost (est) | ~$4.10 |
| **% of $20 Pro** | **0.25** (0.205 raw, rounded up to nearest quarter) |

**Notes:** Heavy Context7 + WebFetch usage; multi-hundred-line spec rewrite; long agent-finding analysis tables. Estimate is pre-cache-discount and therefore an upper bound.

### 2026-04-22 — bug fix session Tiers 1–3 (107 bugs)

| Field | Value |
|---|---|
| Topic | Fixed Tiers 1–3 of 107 bugs from `bugs.md` using 3 parallel Sonnet agents; null-guard on 10 dashboard components; tsconfig strictNullChecks + ES2020; API route rate-limiting + Content-Type fix; database singleOrNull wrapper; hooks cleanup (AbortController, mountedRef, userId primitive dep); ESLint no-unused-vars across 17 files; 184/184 tests passing |
| Model | Sonnet 4.6 ($3/M input, $15/M output) |
| Agents | 4 total: main + Tier2 (131K tokens) + Tier3 (131K tokens) + ESLint (101K tokens) |
| Input tokens (est) | ~450K |
| Output tokens (est) | ~115K |
| API cost (est) | ~$3.10 |
| **% of $20 Pro** | **0.25** (0.155 raw, rounded up to nearest quarter) |

**Notes:** 3 background Sonnet agents dispatched in parallel (Tier2/Tier3/ESLint). Sub-agent token counts confirmed via task output. Main agent ~120K est. Estimate is pre-cache-discount.

---

## Monthly totals

| Month | Sessions | Cost est | Pro fraction |
|---|---:|---:|---:|
| 2026-04 | 2 | $7.20 | 0.50 |
