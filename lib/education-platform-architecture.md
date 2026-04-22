# Education Platform Architecture — EduTok Implementation Guide

**Версия:** 2026-04 · **Статус:** Production Architecture  
**Стек:** Next.js 14, Supabase, TypeScript, Tailwind CSS

---

## Обзор: LMS + SIS Integration для EduTok

EduTok — это интегрированная образовательная платформа, которая объединяет две критические системы в одну:

- **LMS (Learning Management System)**: Управление курсами, заданиями, оценками, контентом
- **SIS (Student Information System)**: Управление студентами, их прогрессом, записями, финансами

Архитектура должна работать в режиме реального времени, синхронизируя данные без ручных интервенций.

---

## 1. Концептуальная архитектура данных

```
┌─────────────────────────────────────────────────────────────┐
│                      EduTok Frontend                        │
│  (Next.js 14 App Router + Dashboard + Student Portal)      │
└──────────────────┬──────────────────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
   ┌────▼─────┐          ┌────▼──────┐
   │   LMS    │          │    SIS    │
   │ Database │          │ Database  │
   └────┬─────┘          └────┬──────┘
        │                     │
        │  OneRoster Sync     │
        │  (batch, scheduled) │
        │                     │
        └─────────┬───────────┘
                  │
         ┌────────▼────────┐
         │  Real-time API  │
         │  (LTI 1.3)      │
         └─────────────────┘
```

**Три уровня синхронизации:**

1. **Batch Sync (OneRoster)** — 1x в час
   - Новые студенты зачисляются в курсы
   - Списки классов обновляются
   - Роли пересчитываются

2. **Real-time API (LTI 1.3)** — мгновенно
   - Оценка передается в SIS
   - Посещаемость логируется
   - Прогресс обновляется

3. **Event Stream** — по требованию
   - Уведомления
   - Аналитика
   - Alerts

---

## 2. LMS модели данных

```typescript
// lib/database.ts — добавить эти типы

export interface Course {
  id: string
  code: string // "MATH-101"
  name: string
  description: string
  teacher_id: string
  semester: string // "2026-spring"
  enrollment_count: number
  status: 'active' | 'archived'
  created_at: string
}

export interface Enrollment {
  id: string
  student_id: string
  course_id: string
  role: 'student' | 'teacher' | 'ta'
  status: 'active' | 'completed' | 'dropped'
  joined_at: string
  completed_at: string | null
}

export interface Assignment {
  id: string
  course_id: string
  title: string
  description: string
  due_date: string
  points: number
  type: 'homework' | 'quiz' | 'project' | 'exam'
  rubric?: AssignmentRubric
  status: 'draft' | 'published' | 'closed'
}

export interface Submission {
  id: string
  assignment_id: string
  student_id: string
  submitted_at: string
  late: boolean
  status: 'pending' | 'graded' | 'submitted'
  content: string // JSON или URL
  score: number | null
  feedback: string | null
  graded_at: string | null
}

export interface Grade {
  id: string
  student_id: string
  course_id: string
  assignment_id: string
  score: number // 0-100
  earned_points: number
  max_points: number
  graded_at: string
  comment: string | null
}

export interface AssignmentRubric {
  criteria: RubricCriterion[]
  total_points: number
}

export interface RubricCriterion {
  id: string
  name: string
  description: string
  max_points: number
}
```

---

## 3. SIS модели данных

```typescript
export interface StudentProfile {
  id: string
  user_id: string // Link to auth.users
  name: string
  email: string
  enrollment_status: 'active' | 'suspended' | 'graduated' | 'graduated_pending'
  enrollment_date: string
  gpa: number
  credits_earned: number
  credits_required: number // For graduation
  major: string | null
  minor: string | null
  cohort: string // "Class of 2026"
  created_at: string
}

export interface Attendance {
  id: string
  student_id: string
  course_id: string
  date: string
  status: 'present' | 'absent' | 'late' | 'excused'
  marked_by: string // teacher_id
  timestamp: string
}

export interface ProgressRecord {
  id: string
  student_id: string
  course_id: string
  week: number
  completion_percentage: number
  assignments_submitted: number
  assignments_total: number
  last_activity: string
  engagement_score: number // 0-100 (AI-calculated)
  risk_flag: boolean // AI prediction
}

export interface GradesTranscript {
  id: string
  student_id: string
  course_id: string
  course_code: string
  final_grade: number
  letter_grade: 'A' | 'B' | 'C' | 'D' | 'F'
  semester: string
  credits: number
  completed: boolean
}
```

---

## 4. Архитектура API маршрутов

```
app/[locale]/api/
├── lms/
│   ├── courses/        # GET/POST курсы
│   ├── assignments/    # GET/POST/PUT/DELETE задания
│   ├── submissions/    # POST студенческие сдачи
│   ├── grades/         # PUT оценки
│   └── analytics/      # GET аналитика курса
├── sis/
│   ├── students/       # GET/POST студенты
│   ├── enrollment/     # POST/DELETE зачисление
│   ├── attendance/     # POST посещаемость
│   ├── progress/       # GET прогресс студента
│   └── transcript/     # GET выписка оценок
├── integration/
│   ├── oneroster/      # POST batch sync (OneRoster 1.2)
│   ├── lti/            # POST LTI 1.3 Advantage handshake
│   └── webhooks/       # POST external service events
└── ai/
    ├── predict/        # GET предиктивная аналитика
    ├── analyze/        # POST анализ успеваемости
    └── feedback/       # POST AI feedback для эссе
```

**Пример: GET /api/lms/courses**

```typescript
// app/[locale]/api/lms/courses/route.ts
import { supabase } from '@/lib/supabase'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('user_id')
  const semester = searchParams.get('semester') || '2026-spring'

  // Fetch courses where user is enrolled
  const { data: enrollments, error } = await supabase
    .from('enrollments')
    .select('course_id')
    .eq('student_id', userId)
    .eq('status', 'active')

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })

  const courseIds = enrollments.map(e => e.course_id)

  const { data: courses } = await supabase
    .from('courses')
    .select('*')
    .in('id', courseIds)
    .eq('semester', semester)

  return NextResponse.json(courses)
}
```

---

## 5. Real-time Synchronization (OneRoster 1.2)

**Когда использовать:** Каждый час синхронизировать новых студентов и обновлять списки классов.

```typescript
// lib/sync/oneroster.ts
import { supabase } from '@/lib/supabase'

export async function syncOneRoster() {
  console.log('[OneRoster Sync] Starting scheduled sync...')

  try {
    // 1. Fetch new enrollments from external SIS (CSV or API)
    const externalEnrollments = await fetchExternalEnrollments()

    // 2. Compare with current Supabase state
    const existingEnrollments = await supabase
      .from('enrollments')
      .select('*')

    // 3. Insert new, update changed, delete dropped
    for (const ext of externalEnrollments) {
      const existing = existingEnrollments.data?.find(
        e => e.student_id === ext.student_id && e.course_id === ext.course_id
      )

      if (!existing) {
        // New enrollment
        await supabase.from('enrollments').insert({
          student_id: ext.student_id,
          course_id: ext.course_id,
          role: ext.role,
          status: 'active',
          joined_at: new Date().toISOString(),
        })
      } else if (existing.status !== ext.status) {
        // Status changed (dropped, etc.)
        await supabase
          .from('enrollments')
          .update({ status: ext.status })
          .eq('id', existing.id)
      }
    }

    console.log('[OneRoster Sync] Completed successfully')
    return { success: true }
  } catch (error) {
    console.error('[OneRoster Sync] Error:', error)
    return { success: false, error }
  }
}

// Schedule this with a cron job (use a background task scheduler)
// E.g., Vercel Cron, AWS EventBridge, or a simple Node.js scheduler
```

**Интеграция с Vercel Cron:**

```json
// vercel.json
{
  "crons": [
    {
      "path": "/api/integration/oneroster/sync",
      "schedule": "0 * * * *"
    }
  ]
}
```

---

## 6. Real-time Grades Sync (LTI 1.3 Advantage)

**Когда использовать:** Когда преподаватель ставит оценку, она мгновенно попадает в SIS.

```typescript
// app/[locale]/api/lms/grades/route.ts
import { supabase } from '@/lib/supabase'
import { verifyLTIToken } from '@/lib/lti'
import { NextRequest, NextResponse } from 'next/server'

export async function PUT(request: NextRequest) {
  const token = request.headers.get('authorization')?.split(' ')[1]

  // Verify LTI 1.3 signature
  if (!token || !verifyLTIToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const { assignment_id, student_id, score, feedback } = body

  // 1. Save grade in LMS
  const { data: grade } = await supabase.from('grades').insert({
    assignment_id,
    student_id,
    score,
    graded_at: new Date().toISOString(),
    comment: feedback,
  })

  // 2. Trigger webhook to SIS
  await fetch(`${process.env.SIS_WEBHOOK_URL}/grades`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      student_id,
      course_id: body.course_id,
      score,
      timestamp: new Date().toISOString(),
    }),
  })

  return NextResponse.json({ success: true, grade })
}
```

---

## 7. AI Predictive Analytics

**Предиктивный анализ для раннего предупреждения об отсеве.**

```typescript
// lib/ai/predict-risk.ts
import { supabase } from '@/lib/supabase'

export async function predictStudentRisk(studentId: string, courseId: string) {
  // Fetch student's activity data
  const { data: submissions } = await supabase
    .from('submissions')
    .select('submitted_at, late')
    .eq('student_id', studentId)
    .eq('course_id', courseId)

  const { data: attendance } = await supabase
    .from('attendance')
    .select('status')
    .eq('student_id', studentId)
    .eq('course_id', courseId)

  const { data: grades } = await supabase
    .from('grades')
    .select('score')
    .eq('student_id', studentId)
    .eq('course_id', courseId)

  // Simple risk scoring (в реальности используйте ML model)
  const lateSubmissions = submissions?.filter(s => s.late).length || 0
  const absences = attendance?.filter(a => a.status === 'absent').length || 0
  const avgScore = grades
    ? grades.reduce((sum, g) => sum + g.score, 0) / grades.length
    : 0

  // Risk formula: 0-100
  const riskScore =
    Math.min(100, (lateSubmissions * 5) + (absences * 3) + (100 - avgScore) * 0.5)

  return {
    risk_flag: riskScore > 60, // Red flag at 60%+
    risk_score: Math.round(riskScore),
    factors: {
      late_submissions: lateSubmissions,
      absences,
      average_score: Math.round(avgScore),
    },
  }
}
```

**API endpoint:**

```typescript
// app/[locale]/api/ai/predict/route.ts
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const studentId = searchParams.get('student_id')
  const courseId = searchParams.get('course_id')

  const prediction = await predictStudentRisk(studentId, courseId)

  return NextResponse.json(prediction)
}
```

---

## 8. Dashboard реального времени для учителя

**Когда учитель открывает курс, он видит живую информацию о каждом студенте.**

```tsx
// components/dashboard/TeacherCourseOverview.tsx
'use client'

import { useEffect, useState } from 'react'
import { GlassCard } from '@/components/ui/GlassCard'
import { NeonButton } from '@/components/ui/NeonButton'

interface StudentOverview {
  student_id: string
  name: string
  risk_score: number
  avg_grade: number
  submissions_pending: number
  attendance_rate: number
}

export function TeacherCourseOverview({ courseId }: { courseId: string }) {
  const [students, setStudents] = useState<StudentOverview[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStudents = async () => {
      const res = await fetch(`/api/lms/analytics?course_id=${courseId}`)
      const data = await res.json()
      setStudents(data)
      setLoading(false)
    }

    fetchStudents()
    // Refresh every 30 seconds
    const interval = setInterval(fetchStudents, 30000)
    return () => clearInterval(interval)
  }, [courseId])

  return (
    <div className="space-y-4">
      <GlassCard neon="cyan" className="p-6">
        <h2 className="text-2xl font-bold text-white mb-4">Обзор класса</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <MetricCard label="Студентов" value={students.length} />
          <MetricCard 
            label="Риск отсева" 
            value={students.filter(s => s.risk_score > 60).length}
            color="danger"
          />
          <MetricCard 
            label="Средняя оценка" 
            value={Math.round(
              students.reduce((sum, s) => sum + s.avg_grade, 0) / students.length
            )}
          />
          <MetricCard 
            label="Ожидают проверки" 
            value={students.reduce((sum, s) => sum + s.submissions_pending, 0)}
          />
        </div>
      </GlassCard>

      {/* Student List with Risk Flags */}
      <GlassCard neon="magenta" className="p-6">
        <h3 className="text-xl font-bold text-white mb-4">Студенты с риском</h3>
        <div className="space-y-2">
          {students
            .filter(s => s.risk_score > 60)
            .sort((a, b) => b.risk_score - a.risk_score)
            .map(student => (
              <div 
                key={student.student_id}
                className="flex items-center justify-between p-4 bg-red-500/10 border border-red-500/30 rounded-lg"
              >
                <div>
                  <p className="font-semibold text-white">{student.name}</p>
                  <p className="text-sm text-red-400">
                    Риск: {student.risk_score}% · Оценка: {student.avg_grade}/100
                  </p>
                </div>
                <NeonButton neon="magenta" size="sm">
                  Мониторить
                </NeonButton>
              </div>
            ))}
        </div>
      </GlassCard>
    </div>
  )
}

function MetricCard({ 
  label, 
  value, 
  color = 'default' 
}: { 
  label: string
  value: number
  color?: 'default' | 'danger'
}) {
  return (
    <div className={`p-4 rounded-lg ${color === 'danger' ? 'bg-red-500/10' : 'bg-cyan-500/10'}`}>
      <p className="text-sm text-slate-400 mb-1">{label}</p>
      <p className={`text-3xl font-bold ${color === 'danger' ? 'text-red-400' : 'text-cyan-400'}`}>
        {value}
      </p>
    </div>
  )
}
```

---

## 9. Student Progress Portal

**Студент видит свой прогресс в режиме реального времени.**

```tsx
// components/dashboard/StudentProgressDashboard.tsx
'use client'

import { useEffect, useState } from 'react'
import { GlassCard } from '@/components/ui/GlassCard'

interface CourseProgress {
  course_id: string
  course_name: string
  progress_percentage: number
  current_grade: number
  assignments_submitted: number
  assignments_total: number
  attendance_rate: number
}

export function StudentProgressDashboard({ studentId }: { studentId: string }) {
  const [courses, setCourses] = useState<CourseProgress[]>([])

  useEffect(() => {
    const fetchProgress = async () => {
      const res = await fetch(`/api/sis/progress?student_id=${studentId}`)
      const data = await res.json()
      setCourses(data)
    }

    fetchProgress()
    const interval = setInterval(fetchProgress, 60000) // Refresh every minute
    return () => clearInterval(interval)
  }, [studentId])

  return (
    <div className="space-y-6">
      {courses.map(course => (
        <GlassCard key={course.course_id} neon="cyan" className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold text-white">{course.course_name}</h3>
              <p className="text-sm text-slate-400">
                {course.assignments_submitted}/{course.assignments_total} заданий сдано
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-neon-cyan">{course.current_grade}</p>
              <p className="text-xs text-slate-400">текущая оценка</p>
            </div>
          </div>

          {/* Progress bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-xs text-slate-400">
              <span>Прогресс курса</span>
              <span>{course.progress_percentage}%</span>
            </div>
            <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-cyan-400 to-magenta-400 h-full transition-all duration-500"
                style={{ width: `${course.progress_percentage}%` }}
              />
            </div>
          </div>

          {/* Attendance */}
          <div className="mt-4 p-3 bg-slate-700/50 rounded-lg">
            <p className="text-sm text-slate-300">
              Посещаемость: <span className="text-cyan-400 font-semibold">
                {Math.round(course.attendance_rate * 100)}%
              </span>
            </p>
          </div>
        </GlassCard>
      ))}
    </div>
  )
}
```

---

## 10. Таблица данных в базе (Migrations)

```sql
-- Courses
CREATE TABLE courses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  teacher_id UUID NOT NULL REFERENCES auth.users,
  semester TEXT NOT NULL,
  status TEXT DEFAULT 'active',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enrollments
CREATE TABLE enrollments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users,
  course_id UUID NOT NULL REFERENCES courses,
  role TEXT DEFAULT 'student',
  status TEXT DEFAULT 'active',
  joined_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(student_id, course_id)
);

-- Assignments
CREATE TABLE assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id UUID NOT NULL REFERENCES courses,
  title TEXT NOT NULL,
  description TEXT,
  due_date TIMESTAMP NOT NULL,
  points INT DEFAULT 100,
  type TEXT DEFAULT 'homework',
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMP DEFAULT NOW()
);

-- Submissions
CREATE TABLE submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES assignments,
  student_id UUID NOT NULL REFERENCES auth.users,
  content TEXT,
  submitted_at TIMESTAMP DEFAULT NOW(),
  late BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'submitted'
);

-- Grades
CREATE TABLE grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  assignment_id UUID NOT NULL REFERENCES assignments,
  student_id UUID NOT NULL REFERENCES auth.users,
  course_id UUID NOT NULL REFERENCES courses,
  score INT NOT NULL,
  feedback TEXT,
  graded_at TIMESTAMP DEFAULT NOW()
);

-- Attendance
CREATE TABLE attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users,
  course_id UUID NOT NULL REFERENCES courses,
  date DATE NOT NULL,
  status TEXT NOT NULL, -- 'present', 'absent', 'late'
  marked_at TIMESTAMP DEFAULT NOW()
);

-- Progress tracking
CREATE TABLE progress_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES auth.users,
  course_id UUID NOT NULL REFERENCES courses,
  completion_percentage INT DEFAULT 0,
  engagement_score INT DEFAULT 0,
  risk_flag BOOLEAN DEFAULT FALSE,
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_enrollments_student ON enrollments(student_id);
CREATE INDEX idx_enrollments_course ON enrollments(course_id);
CREATE INDEX idx_grades_student ON grades(student_id);
CREATE INDEX idx_grades_course ON grades(course_id);
CREATE INDEX idx_submissions_student ON submissions(student_id);
CREATE INDEX idx_attendance_student ON attendance(student_id);
```

---

## 11. Доступность (WCAG 2.1 AA для EduTok)

**Критические требования:**

```tsx
// Пример accessible assignment card
export function AssignmentCard({ assignment }) {
  return (
    <article 
      className="glass p-6 rounded-lg"
      role="region"
      aria-label={`Assignment: ${assignment.title}`}
    >
      <h3 className="text-lg font-semibold text-white mb-2">
        {assignment.title}
      </h3>
      
      {/* Due date with semantic meaning */}
      <time dateTime={assignment.due_date} className="text-sm text-slate-400">
        Due: {new Date(assignment.due_date).toLocaleDateString('en-US')}
      </time>

      {/* Points with icon + text (not color alone) */}
      <div className="mt-3 flex items-center gap-2">
        <span className="text-lg">⭐</span>
        <span className="text-slate-300">{assignment.points} points</span>
      </div>

      {/* Accessible button */}
      <button
        className="mt-4 px-4 py-2 bg-cyan-500 text-white rounded-lg focus:outline-2 focus:outline-offset-2 focus:outline-cyan-300"
        aria-label={`Submit assignment: ${assignment.title}`}
      >
        Submit
      </button>
    </article>
  )
}
```

**Контрастность текста:**
```css
/* ✓ WCAG AA compliant */
.body-text {
  color: #E8E8E8; /* На чёрном фоне: контраст 14.3:1 */
  background: #0a0a0a;
}

.heading {
  color: #FFFFFF;  /* На чёрном фоне: контраст 21:1 */
  background: #0a0a0a;
}
```

---

## 12. Микрообучение (Microlearning) для EduTok

**Вместо часовых лекций — короткие 3-5 минутные модули.**

```typescript
// lib/database.ts — добавить

export interface MicroModule {
  id: string
  course_id: string
  title: string
  duration_minutes: number // 3-5 min
  content: string // JSON or markdown
  video_url?: string
  learning_objective: string
  order: number
}

export interface MicroQuiz {
  id: string
  module_id: string
  question: string
  options: string[]
  correct_option: number
  explanation: string
}
```

**Компонент:**

```tsx
// components/learning/MicroModule.tsx
export function MicroModule({ module }: { module: MicroModule }) {
  return (
    <GlassCard neon="magenta" className="p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-bold text-white">{module.title}</h3>
        <span className="text-sm text-slate-400">
          ⏱️ {module.duration_minutes} min
        </span>
      </div>

      {module.video_url && (
        <video 
          src={module.video_url} 
          className="w-full rounded-lg mb-4"
          controls
        />
      )}

      <p className="text-slate-300 mb-4">{module.content}</p>

      <div className="bg-cyan-500/10 border border-cyan-500/30 rounded-lg p-4">
        <p className="text-sm text-cyan-400 font-semibold">
          🎯 Learning Objective
        </p>
        <p className="text-sm text-slate-300 mt-1">
          {module.learning_objective}
        </p>
      </div>
    </GlassCard>
  )
}
```

---

## 13. Геймификация (для повышения вовлеченности)

```typescript
// lib/gamification.ts

export interface StudentAchievement {
  id: string
  student_id: string
  badge_name: string
  badge_icon: string
  earned_at: string
}

export const BADGES = {
  FIRST_SUBMIT: {
    name: 'First Steps',
    icon: '🚀',
    trigger: 'Submit first assignment',
  },
  PERFECT_SCORE: {
    name: 'Perfection',
    icon: '⭐',
    trigger: 'Score 100% on quiz',
  },
  CONSISTENT: {
    name: 'Reliable',
    icon: '✅',
    trigger: '5 assignments in a row on time',
  },
  HELPER: {
    name: 'Community Helper',
    icon: '🤝',
    trigger: 'Help 3 classmates in forum',
  },
}
```

**API для проверки бейджей:**

```typescript
// app/[locale]/api/lms/achievements/route.ts
export async function POST(request: NextRequest) {
  const body = await request.json()
  const { student_id, trigger_type } = body

  // Check if student earned badge
  const badge = Object.entries(BADGES).find(
    ([_, badge]) => badge.trigger === trigger_type
  )

  if (badge) {
    await supabase.from('achievements').insert({
      student_id,
      badge_name: badge[1].name,
      badge_icon: badge[1].icon,
    })

    // Notify student
    await notifyStudent(student_id, `You earned: ${badge[1].name}`)
  }
}
```

---

## 14. Чек-лист внедрения EduTok

### Phase 1: Core LMS (Week 1-2)
- [ ] Создать таблицы: courses, enrollments, assignments, submissions
- [ ] API endpoints: GET /courses, POST /assignments, POST /submissions
- [ ] UI: Course list, Assignment list
- [ ] Auth: Role-based access (student, teacher)

### Phase 2: SIS Integration (Week 3-4)
- [ ] Таблицы: profiles, grades, attendance, progress_records
- [ ] OneRoster sync scheduler (1x в час)
- [ ] API: GET /student/progress, PUT /grades
- [ ] Teacher dashboard with risk flags

### Phase 3: Real-time Sync (Week 5)
- [ ] LTI 1.3 token verification
- [ ] Webhook integration for grade updates
- [ ] Real-time WebSocket for notifications
- [ ] Student progress portal (live updates)

### Phase 4: AI & Analytics (Week 6-7)
- [ ] Predictive risk scoring
- [ ] Student engagement analytics
- [ ] Alert system (email/in-app)
- [ ] AI essay feedback (placeholder)

### Phase 5: Polish (Week 8)
- [ ] WCAG 2.1 AA audit
- [ ] Microlearning modules
- [ ] Gamification badges
- [ ] Performance optimization

---

## 15. Мониторинг и Metrics

**Ключевые KPI для EduTok:**

```typescript
export interface PlatformMetrics {
  total_users: number
  active_students: number
  courses_active: number
  assignments_pending: number
  avg_submission_time: number // hours
  students_at_risk: number
  platform_uptime: number // percentage
}

// Fetch metrics
export async function getPlatformMetrics() {
  const metrics = await supabase
    .from('analytics_summary')
    .select('*')
    .single()
  
  return metrics.data
}
```

---

## 16. Roadmap 2026

- **Q2:** Core LMS + SIS features
- **Q3:** AI predictive analytics + real-time sync
- **Q4:** Microlearning + gamification + AR/VR experiments

---

**Обновлено:** 2026-04-22  
**Статус:** Ready for development  
**Контакт:** Team Lead
