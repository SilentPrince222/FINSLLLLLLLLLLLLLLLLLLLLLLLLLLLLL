# 🏗️ System Architecture

Simple, fast to build architecture optimized for hackathons and rapid development.

---

## 📌 System Overview

This is a **full stack monolithic application** with zero unnecessary complexity. There are no microservices, no message queues, no extra layers. Just 3 parts.

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Next.js Front  │────▶│  Next.js API    │────▶│   Supabase DB   │
│ (User Browser)  │     │     Routes      │     │ (Database/Auth) │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                ▲
                                │
                                ▼
                        ┌─────────────────┐
                        │  OpenAI API     │
                        │  (AI Grading)   │
                        └─────────────────┘
```

---

## 🎨 Frontend Layer (Next.js)

✅ **What it does:**
- Renders all UI pages
- Handles user navigation
- Client side state management
- Form validation
- Responsive layouts

✅ **Stack:**
- Next.js 14 App Router
- Server Components by default
- Client Components only when interactivity is needed
- Tailwind CSS for all styling
- No global state managers - just native React hooks

---

## ⚡ Backend Layer (API Routes)

✅ **What it does:**
- All business logic lives here
- Proxy for external API calls (OpenAI)
- Permission checks
- Data validation & transformation
- Never expose secrets to frontend

✅ **Rules:**
- All API endpoints live in `src/app/api/`
- Every route is a single file
- Maximum 100 lines per endpoint
- JSON input / JSON output only

---

## 💾 Database Layer (Supabase)

✅ **What it does:**
- All data storage
- User authentication
- Row Level Security (RLS) for permissions
- File storage
- Real time updates

✅ **Why Supabase:**
- You don't write backend auth code
- You don't write backend permission code
- Auto generated typescript types
- One click local development setup
- Zero DevOps required

---

## 🔄 Data Flow Example (AI Grade Analysis)

```
1.  Student opens grades page
2.  Frontend loads raw grade data from Supabase
3.  Student clicks "Analyze Grades" button
4.  Frontend sends grades to `/api/ai/analyze`
5.  API route validates user owns those grades
6.  API forwards formatted grades to OpenAI
7.  OpenAI returns analyzed insights
8.  API sends cleaned response back to frontend
9.  Results are displayed to user
```

✅ **All requests go in one direction. No magic.**

---

## ⚡ Why this architecture wins

| Reason | Benefit |
|---|---|
| **Everything in one repo** | One command to run locally |
| **Zero DevOps** | Deploy to Vercel in 30 seconds |
| **Minimal boilerplate** | Build 10 features in the time other teams build 1 |
| **Type safety end to end** | Supabase generates types automatically |
| **Scales perfectly** | Handles 1 user or 100,000 users with no changes |

This is the fastest possible way to build a production quality full stack application in 2026. No tradeoffs you will actually care about.