# 🎓 AI-Powered College Management System

A modern, intelligent college management platform built with Next.js and Supabase, featuring AI-driven grade analysis and complete academic administration tools.

---

## ✨ Features

| Module | Description |
|--------|-------------|
| **🔐 Role-based Authentication** | Secure login system with separate access for Admin, Faculty, and Student roles with proper permission controls |
| **📊 Grades Management** | Complete grading system with mark entry, transcript generation, and academic performance tracking |
| **📅 Timetable System** | Dynamic class scheduling, conflict detection, and personalized timetable views for each user |
| **🤖 AI Grade Analyzer** | Intelligent performance insights, trend prediction, weakness identification, and personalized improvement recommendations |

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 14 (App Router)
- **Backend & Database**: Supabase (PostgreSQL, Auth, Storage)
- **Styling**: Tailwind CSS
- **AI Integration**: OpenAI / GPT for grade analysis
- **Deployment**: Vercel

---

## 🚀 Running Locally

### Prerequisites
- Node.js 18+
- npm / yarn / pnpm
- Supabase account (or local Supabase instance)

### Step 1: Clone the repository
```bash
git clone <repository-url>
cd college-management-system
```

### Step 2: Install dependencies
```bash
npm install
```

### Step 3: Configure environment variables
Create a `.env.local` file in root directory:
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
OPENAI_API_KEY=your_openai_api_key
```

### Step 4: Run development server
```bash
npm run dev
```

Application will be available at `http://localhost:3000`

---

## 📁 Folder Structure

```
src/
├── app/              # Next.js App Router pages & layouts
├── components/       # Reusable UI components
├── lib/              # Supabase client, utilities, AI logic
├── types/            # TypeScript type definitions
└── styles/           # Global Tailwind styles
```

---

## 🔮 Future Improvements

### AI Enhancements
- [ ] Automated attendance pattern analysis
- [ ] Student dropout risk prediction
- [ ] Personalized study path recommendations
- [ ] AI-powered assignment grading

### Analytics & Reporting
- [ ] Department performance dashboards
- [ ] Real-time academic metrics
- [ ] Custom report generation
- [ ] Parent portal with progress updates

### Additional Features
- [ ] Library management integration
- [ ] Examination scheduling system
- [ ] Online assignment submission
- [ ] Internal messaging system

---

<div align="center">
Built with ❤️ for modern educational institutions
</div>