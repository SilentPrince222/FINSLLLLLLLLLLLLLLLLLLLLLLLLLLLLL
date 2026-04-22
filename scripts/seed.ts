/**
 * Seed script — creates 2 teachers, 30 students, ~450 grades in Supabase.
 * Spec: docs/superpowers/specs/2026-04-22-edutok-backend-mvp-design.md §8
 *
 * Run: npm run seed
 *
 * Env required (in .env.local):
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY  — bypasses RLS; NEVER leak to the browser bundle
 */

import { createClient } from '@supabase/supabase-js'
import { config } from 'dotenv'
import { SEMESTER, SUBJECTS } from '../lib/constants'
import type { Database } from '../types/database'

config({ path: '.env.local' })

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
    process.exit(1)
}

const supabase = createClient<Database>(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
})

const PASSWORD = 'demo12345'

// §8.3a Box-Muller — uniform → N(μ, σ). Not cryptographic; seed data only.
function normalSample(mu: number, sigma: number): number {
    const u1 = Math.random() || 1e-9
    const u2 = Math.random()
    const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2)
    return mu + sigma * z
}

function clamp(v: number, lo: number, hi: number): number {
    return Math.max(lo, Math.min(hi, v))
}

function randomChoice<T>(arr: readonly T[]): T {
    return arr[Math.floor(Math.random() * arr.length)]
}

// §8.2 fixed lists — reproducible seed data
const TEACHERS = [
    { email: 'teacher@demo.edu', full_name: 'Жанар Мұратқызы' },
    { email: 'teacher2@demo.edu', full_name: 'Серік Алиұлы Қасенов' },
]

const STUDENTS_IT21 = [
    'Айдар Алимов', 'Айгерим Серикбаева', 'Бауыржан Жумагулов', 'Ерлан Нұрланов',
    'Қайрат Ормантаев', 'Нұрлан Искаков', 'Санжар Кабылбеков', 'Шолпан Айтуарова',
    'Еркебулан Жаксыбаев', 'Рахат Сейтқасымов', 'Арайлым Мусина', 'Нұрай Сатыбалдиева',
    'Айдана Абенова', 'Бақыт Тулегенов', 'Асхат Токтаров',
]

const STUDENTS_IT22 = [
    'Арман Бекетов', 'Асель Касымова', 'Дәурен Мукашев', 'Жанара Хасенова',
    'Мадина Жунусова', 'Салтанат Абдрахманова', 'Талгат Суюнбаев', 'Айша Тұрсынова',
    'Медет Байжанов', 'Динара Омарова', 'Ильяс Каримов', 'Улан Рахымов',
    'Камила Есенова', 'Жандос Алтынбеков', 'Балнұр Сатова',
]

// Transliterate Kazakh/Cyrillic → ASCII for email local-part
const CYRILLIC_TO_LATIN: Record<string, string> = {
    'а':'a','ә':'a','б':'b','в':'v','г':'g','ғ':'g','д':'d','е':'e','ё':'yo','ж':'zh','з':'z',
    'и':'i','й':'y','к':'k','қ':'q','л':'l','м':'m','н':'n','ң':'ng','о':'o','ө':'o',
    'п':'p','р':'r','с':'s','т':'t','у':'u','ұ':'u','ү':'u','ф':'f','х':'h','һ':'h',
    'ц':'ts','ч':'ch','ш':'sh','щ':'sch','ъ':'','ы':'y','і':'i','ь':'','э':'e','ю':'yu','я':'ya',
}

function slug(name: string): string {
    return name
        .toLowerCase()
        .split(/\s+/)
        .map(part => [...part].map(ch => CYRILLIC_TO_LATIN[ch] ?? ch).join(''))
        .join('.')
}

function emailFor(full_name: string): string {
    return `${slug(full_name)}@demo.edu`
}

// §8.1 step 1 — paginated wipe of all @demo.edu users
async function wipeDemoUsers(): Promise<void> {
    console.log('1. Wiping existing @demo.edu users...')
    let page = 1
    const perPage = 1000
    let deleted = 0

    while (true) {
        const { data, error } = await supabase.auth.admin.listUsers({ page, perPage })
        if (error) throw error
        if (!data?.users?.length) break

        for (const u of data.users) {
            if (u.email?.endsWith('@demo.edu')) {
                const { error: delErr } = await supabase.auth.admin.deleteUser(u.id)
                if (delErr) throw delErr
                deleted++
            }
        }

        if (data.users.length < perPage) break
        page++
    }
    console.log(`   ${deleted} users deleted.`)
}

// Bounded poll for the handle_new_user trigger to materialize the profile row.
// Cold Free-tier projects can take multi-second to warm up — 8s covers the practical worst case.
async function waitForProfile(id: string, timeoutMs = 8000): Promise<void> {
    const deadline = Date.now() + timeoutMs
    while (Date.now() < deadline) {
        const { data } = await supabase.from('profiles').select('id').eq('id', id).maybeSingle()
        if (data) return
        await new Promise(r => setTimeout(r, 100))
    }
    throw new Error(
        `handle_new_user did not create profile for ${id} within ${timeoutMs}ms — ` +
        `project may be cold. Re-run after 30s or verify the trigger is installed.`
    )
}

// Pre-flight: ensure the transliteration slugger doesn't collide two student names to the
// same email. Fails loudly before any auth.admin.createUser is called so the DB stays clean.
function assertUniqueEmails(): void {
    const all = [...STUDENTS_IT21, ...STUDENTS_IT22]
    const seen = new Map<string, string>()
    for (const name of all) {
        const e = emailFor(name)
        const prior = seen.get(e)
        if (prior) {
            throw new Error(`Email collision: "${prior}" and "${name}" both transliterate to ${e}`)
        }
        seen.set(e, name)
    }
}

async function createTeacher(email: string, full_name: string): Promise<string> {
    const { data, error } = await supabase.auth.admin.createUser({
        email,
        password: PASSWORD,
        email_confirm: true,
        user_metadata: { role: 'teacher', full_name },
    })
    if (error || !data.user) throw error ?? new Error('createUser returned no user')
    const id = data.user.id
    await waitForProfile(id)
    // supabase-js generic inference breaks on service-role client for .update(); cast pragmatically
    const { error: upErr } = await (supabase.from('profiles') as any)
        .update({ role: 'teacher', full_name })
        .eq('id', id)
    if (upErr) throw upErr
    return id
}

async function createStudent(full_name: string, group_name: string): Promise<string> {
    const email = emailFor(full_name)
    const { data, error } = await supabase.auth.admin.createUser({
        email,
        password: PASSWORD,
        email_confirm: true,
        user_metadata: { role: 'student', full_name },
    })
    if (error || !data.user) throw error ?? new Error(`createUser failed for ${email}`)
    const id = data.user.id
    await waitForProfile(id)

    const attendance_rate = Math.round(clamp(normalSample(90, 5), 70, 100))
    const { error: upErr } = await (supabase.from('profiles') as any)
        .update({ role: 'student', full_name, group_name, attendance_rate })
        .eq('id', id)
    if (upErr) throw upErr
    return id
}

type GradeInsert = Database['public']['Tables']['grades']['Insert']

function buildGradesForStudent(studentId: string, teacherIds: string[]): GradeInsert[] {
    // Ability profile stratifies the class — some students strong, some weak.
    const abilityRoll = Math.random()
    let muAbility: number
    if (abilityRoll < 0.25) muAbility = 55      // weak (bottom ~25%)
    else if (abilityRoll < 0.75) muAbility = 75  // average
    else muAbility = 90                          // strong (top ~25%)

    const rows: GradeInsert[] = []
    const now = Date.now()
    const ninetyDaysMs = 90 * 24 * 60 * 60 * 1000

    for (const subject of SUBJECTS) {
        for (let i = 0; i < 3; i++) {
            const score = Math.round(clamp(normalSample(muAbility, 8), 30, 100))
            const createdAt = new Date(now - Math.random() * ninetyDaysMs).toISOString()
            rows.push({
                student_id: studentId,
                teacher_id: randomChoice(teacherIds),
                subject,
                score,
                semester: SEMESTER,
                created_at: createdAt,
            })
        }
    }
    return rows
}

async function main() {
    console.log('Seeding Supabase... (semester =', SEMESTER, ')\n')

    assertUniqueEmails()
    await wipeDemoUsers()

    console.log('\n2. Creating 2 teachers...')
    const teacherIds: string[] = []
    for (const t of TEACHERS) {
        const id = await createTeacher(t.email, t.full_name)
        teacherIds.push(id)
        console.log(`   ✓ ${t.email} (${t.full_name})`)
    }

    console.log('\n3. Creating 30 students...')
    const studentIds: string[] = []
    for (const name of STUDENTS_IT21) {
        const id = await createStudent(name, 'IT-21')
        studentIds.push(id)
        console.log(`   ✓ IT-21: ${emailFor(name)}`)
    }
    for (const name of STUDENTS_IT22) {
        const id = await createStudent(name, 'IT-22')
        studentIds.push(id)
        console.log(`   ✓ IT-22: ${emailFor(name)}`)
    }

    console.log('\n4. Generating grades (30 × 5 subjects × 3 grades = 450 rows)...')
    const allGrades: GradeInsert[] = studentIds.flatMap(sid => buildGradesForStudent(sid, teacherIds))
    // batch insert to avoid 1 round-trip per row
    const BATCH = 100
    for (let i = 0; i < allGrades.length; i += BATCH) {
        const chunk = allGrades.slice(i, i + BATCH)
        const { error } = await (supabase.from('grades') as any).insert(chunk)
        if (error) throw error
    }
    console.log(`   ✓ ${allGrades.length} grades inserted.`)

    console.log('\n5. Seed complete. Demo credentials:')
    console.log('   Teacher: teacher@demo.edu  /  demo12345')
    console.log(`   Student: ${emailFor(STUDENTS_IT21[0])}  /  demo12345  (Айдар Алимов)`)
    console.log(`   Student: ${emailFor(STUDENTS_IT22[0])}  /  demo12345  (Арман Бекетов)`)
    console.log('\n6. ⚠️  Run the post-seed DDL in Supabase SQL Editor now (supabase-js has no DDL path):')
    console.log('   alter table grades validate constraint grades_semester_fixed;')
    console.log('   alter table grades alter column teacher_id set not null;')
    console.log('   alter table profiles drop constraint if exists group_name_required_for_students;')
    console.log('   alter table profiles add constraint group_name_required_for_students')
    console.log(`     check (role <> 'student' or group_name is not null);`)
}

main().catch(err => {
    console.error('\nSeed failed:', err)
    process.exit(1)
})
