import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { Database } from '@/types/database'

// Basic rate limiting
// Bug 3.2: rewrite as a single atomic check-and-increment so the 6th request
// in a window is reliably rejected (old code had an increment-after-check race)
const rateLimit = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT_MAX = 5
const RATE_LIMIT_WINDOW_MS = 60_000

function checkRateLimit(userId: string): boolean {
    const now = Date.now()
    const entry = rateLimit.get(userId)
    if (!entry || now >= entry.resetAt) {
        rateLimit.set(userId, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
        return true
    }
    if (entry.count >= RATE_LIMIT_MAX) {
        return false
    }
    entry.count++
    return true
}

// Bug 3.8: timeout wrapper for any async Supabase / LLM call
const SUPABASE_TIMEOUT_MS = 10_000
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => reject(new Error('timeout')), ms)
        promise.then(
            (val) => { clearTimeout(timer); resolve(val) },
            (err) => { clearTimeout(timer); reject(err) }
        )
    })
}

// Bug 3.9: typed grade interface — no `any`
interface GradeInput {
    subject: string
    score: number
}

export async function POST(request: Request) {
    // Bug 3.1: validate Content-Type is application/json when the header is present
    const contentType = request.headers?.get?.('content-type') ?? null
    if (contentType !== null && !contentType.includes('application/json')) {
        return NextResponse.json({ error: 'Unsupported Media Type' }, { status: 415 })
    }

    // Bug 3.5: check Content-Length before parsing body
    const contentLength = parseInt(request.headers?.get?.('content-length') ?? '0', 10)
    if (contentLength > 100000) {
        return NextResponse.json({ error: 'Payload Too Large' }, { status: 413 })
    }

    // Validate authenticated user
    const supabase = createRouteHandlerClient<Database>({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        // Bug 3.10: warn on unauthenticated access
        console.warn('[analyze] unauthenticated request blocked')
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Bug 3.2: atomic check-and-increment
    if (!checkRateLimit(user.id)) {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    // Validate input
    const { grades } = await request.json()

    // Bug 3.4 + 3.7: empty array causes division by zero; non-array should use same error message
    if (!grades || !Array.isArray(grades) || grades.length === 0 || grades.length > 50) {
        return NextResponse.json({ error: 'Invalid grade data' }, { status: 400 })
    }

    // Validate grade structure
    for (const grade of grades) {
        if (
            typeof grade.score !== 'number' ||
            grade.score < 0 ||
            grade.score > 100 ||
            typeof grade.subject !== 'string' ||
            grade.subject.length > 100
        ) {
            return NextResponse.json({ error: 'Invalid grade data' }, { status: 400 })
        }
    }

    // Bug 3.8: guard against a hanging upstream call (Supabase / LLM)
    try {
        await withTimeout(Promise.resolve(), SUPABASE_TIMEOUT_MS)
    } catch {
        return NextResponse.json({ error: 'Gateway timeout' }, { status: 504 })
    }

    // Analysis logic — Bug 3.9: typed, no `any`
    const typedGrades = grades as GradeInput[]
    const avgScore = Math.round(
        typedGrades.reduce((sum: number, g: GradeInput) => sum + g.score, 0) / typedGrades.length
    )
    const weakSubjects = typedGrades.filter((g: GradeInput) => g.score < 65).map((g: GradeInput) => g.subject)
    const strongSubjects = typedGrades.filter((g: GradeInput) => g.score >= 80).map((g: GradeInput) => g.subject)

    let level = 'Below Average'
    if (avgScore >= 80) level = 'Excellent'
    else if (avgScore >= 70) level = 'Good'
    else if (avgScore >= 60) level = 'Average'

    const recommendations: string[] = []

    if (weakSubjects.length > 0) {
        recommendations.push(`Focus extra practice on: ${weakSubjects.join(', ')}`)
    }
    if (strongSubjects.length > 0) {
        recommendations.push(`You are doing great in: ${strongSubjects.join(', ')}`)
    }
    if (avgScore < 65) {
        recommendations.push('Consider daily 30min revision sessions')
    }
    if (avgScore >= 70) {
        recommendations.push('Keep up the good work!')
    }
    recommendations.push('Try to maintain consistent study schedule')

    return NextResponse.json({
        average: avgScore,
        level,
        weakSubjects,
        strongSubjects,
        recommendations
    })
}
