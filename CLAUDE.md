# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Token usage tracking

Every significant Claude Code session in this project ends with an appended cost entry in `docs/token-usage.md`. Estimate input + output tokens (exact counters not exposed inside Claude Code), compute API cost at the model's pricing (Opus 4.7 ≈ $15/M input + $75/M output), and express it as a fraction of the $20/mo Claude Pro baseline in **quarter-dollar buckets** (0.25 / 0.50 / 0.75 / 1.00). Update the monthly running total at the bottom of the file. Skip truly trivial sessions (one-liners, single-file edits under ~$0.25).

## Commands

```bash
npm run dev      # start dev server at localhost:3000
npm run build    # production build
npm run lint     # ESLint
npx vitest run                          # unit + tier tests (184 tests; added in 2026-04-22 bugfix)
npx playwright test                     # run all E2E tests
npx playwright test tests/main.spec.ts  # run specific E2E file
# npm run seed                          # requires scripts/seed.ts + tsx (added per docs/superpowers/specs/2026-04-22-edutok-backend-mvp-design.md §8)
```

## Architecture

**Next.js 14 App Router** with internationalization and role-based access.

### Routing layer

All pages live under `app/[locale]/` — every URL is prefixed with `/ru` or `/kk`. The middleware (`middleware.ts`) handles locale injection via `next-intl`. Navigation primitives (`Link`, `useRouter`, `usePathname`, `redirect`) must be imported from `@/i18n/routing`, not from `next/navigation`, to keep locale prefix correct.

### Auth layer (`lib/auth.ts`)

Currently runs in **mock mode**: in `development`, `AuthProvider` auto-logs in as `student@demo.com` and stores state in `localStorage`. Real Supabase auth is stubbed out. `signIn` checks `MOCK_USERS` first; only falls through to Supabase if the email doesn't match.

Roles: `student | teacher | parent | admin`. Role is stored in `user.user_metadata.role`. Each role routes to a different dashboard:
- `student` → `/dashboard`
- `teacher` → `/teacher`
- `parent` → `/parent`
- `admin` → `/admin`

### Data layer (`lib/database.ts`)

Thin wrappers around Supabase queries. No ORM. Tables: `profiles`, `grades`, `timetable`, `events`. Schema SQL is in `SUPABASE_SCHEMA.md` — apply it via Supabase SQL Editor before connecting a real instance.

### AI endpoint (`app/[locale]/api/ai/analyze/route.ts`)

`POST /api/ai/analyze` — accepts `{ grades: [{subject, score}] }`, returns performance analysis. Currently implemented with pure logic (no external LLM call despite what `AI.md` describes). Rate-limited to 5 req/min per user via in-memory `Map`.

### Component hierarchy

```
components/
  ui/          — primitive cards, inputs, badges, navigation
  charts/      — recharts wrappers (BarChart, LineChart, DonutChart)
  dashboard/   — composed dashboard sections (GradesSection, AIInsightsSection, etc.)
```

### Design tokens

`lib/design-system.ts` exports `colors`, `spacing`, `typography`, `borderRadius`, `shadows`, `transitions` as typed constants. `getGradeColor(score)` and `getStatusColor(status)` are the two utility functions. Tailwind config mirrors these values — prefer Tailwind classes in JSX, use the TS tokens only in inline styles or JS logic.

### i18n

Locales: `ru` (default), `kk`. Translation files at `messages/{ru,kk}.json`. All UI strings must go through `useTranslations()` from `next-intl`.

### Dark mode

Controlled by `next-themes` with `class` strategy. Use `dark:` Tailwind variants. The `LanguageThemeSwitcher` component handles both locale switching and theme toggling.

## Environment variables

Required in `.env.local`:
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
OPENAI_API_KEY=   # only if wiring real LLM to /api/ai/analyze
```

Without Supabase vars the app still runs in mock mode (development only).
