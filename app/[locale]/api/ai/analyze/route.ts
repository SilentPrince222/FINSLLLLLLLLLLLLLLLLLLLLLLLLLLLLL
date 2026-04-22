import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { GoogleGenAI } from '@google/genai'
import type { Database } from '@/types/database'

// Basic rate limiting — atomic check-and-increment (bugfix 3.2)
const rateLimit = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT_MAX = 5
const RATE_LIMIT_WINDOW_MS = 60_000

// HIGH #11: prune stale entries once per window so the Map doesn't grow unbounded.
// Using a single global interval avoids one timer per request.
let rateLimitCleanupInterval: ReturnType<typeof setInterval> | null = null
if (!rateLimitCleanupInterval) {
    rateLimitCleanupInterval = setInterval(() => {
        const now = Date.now()
        for (const [key, entry] of rateLimit.entries()) {
            if (now >= entry.resetAt) rateLimit.delete(key)
        }
    }, RATE_LIMIT_WINDOW_MS)
    // don't keep the Node process alive just for the sweep
    ;(rateLimitCleanupInterval as any).unref?.()
}

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

// MEDIUM #16: sanitize user-supplied subject names before embedding in prompts/responses
function sanitize(s: string): string {
    return String(s).replace(/[<>&"']/g, c => ({
        '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&#39;',
    }[c] ?? c))
}

interface GradeInput {
    subject: string
    score: number
}

const MODEL = process.env.GEMINI_MODEL ?? 'gemini-3-flash-preview'
const FALLBACK_MODEL = 'gemini-2.5-flash'

export async function POST(request: Request) {
    // Bug 3.1: validate Content-Type
    const contentType = request.headers?.get?.('content-type') ?? null
    if (contentType !== null && !contentType.includes('application/json')) {
        return NextResponse.json({ error: 'Unsupported Media Type' }, { status: 415 })
    }

    // Bug 3.5: Content-Length guard
    const contentLength = parseInt(request.headers?.get?.('content-length') ?? '0', 10)
    if (contentLength > 100000) {
        return NextResponse.json({ error: 'Payload Too Large' }, { status: 413 })
    }

    // Auth
    const supabase = createRouteHandlerClient<Database>({ cookies })
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        console.warn('[analyze] unauthenticated request blocked')
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Rate limit
    if (!checkRateLimit(user.id)) {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }

    // Parse + validate input — guard against malformed JSON bodies
    let body: any
    try {
        body = await request.json()
    } catch {
        return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }
    const grades = body?.grades
    if (!grades || !Array.isArray(grades) || grades.length === 0 || grades.length > 50) {
        return NextResponse.json({ error: 'Invalid grade data' }, { status: 400 })
    }
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

    const typedGrades = grades as GradeInput[]

    // If no API key configured, fail cleanly rather than throwing inside the SDK
    if (!process.env.GEMINI_API_KEY) {
        return NextResponse.json({ error: 'AI temporarily unavailable' }, { status: 503 })
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY })

    // MEDIUM #16: sanitize subjects before embedding in prompt
    const gradeLines = typedGrades.map(g => `${sanitize(g.subject)}: ${g.score}`).join('\n')
    const prompt = `Ты образовательный аналитик казахстанского колледжа.
Студент получил следующие оценки (шкала 0-100):
${gradeLines}

Проанализируй успеваемость. Отвечай ТОЛЬКО валидным JSON в указанной схеме.`

    const schema = {
        type: 'object',
        properties: {
            average: { type: 'number' },
            level: { type: 'string', enum: ['Excellent', 'Good', 'Average', 'Below Average'] },
            weakSubjects: { type: 'array', items: { type: 'string' } },
            strongSubjects: { type: 'array', items: { type: 'string' } },
            summary: { type: 'string' },
            recommendations: { type: 'array', items: { type: 'string' } },
        },
        required: ['average', 'level', 'weakSubjects', 'strongSubjects', 'summary', 'recommendations'],
    }

    const callGemini = (model: string) =>
        ai.models.generateContent({
            model,
            contents: prompt,
            config: { responseMimeType: 'application/json', responseSchema: schema as any },
        })

    let response: Awaited<ReturnType<typeof callGemini>>
    try {
        response = await withTimeout(callGemini(MODEL), SUPABASE_TIMEOUT_MS)
    } catch (err: any) {
        if (err?.status === 404 || /NOT_FOUND/i.test(err?.message ?? '')) {
            try {
                response = await withTimeout(callGemini(FALLBACK_MODEL), SUPABASE_TIMEOUT_MS)
            } catch {
                return NextResponse.json({ error: 'AI temporarily unavailable' }, { status: 503 })
            }
        } else if (err?.message === 'timeout') {
            return NextResponse.json({ error: 'Gateway timeout' }, { status: 504 })
        } else {
            return NextResponse.json({ error: 'AI temporarily unavailable' }, { status: 503 })
        }
    }

    const rawText = response.text
    if (!rawText) {
        return NextResponse.json({ error: 'AI temporarily unavailable' }, { status: 503 })
    }

    try {
        const parsed = JSON.parse(rawText)
        // MEDIUM #16: sanitize any subject names the model echoes back
        if (Array.isArray(parsed.weakSubjects)) parsed.weakSubjects = parsed.weakSubjects.map((s: string) => sanitize(s))
        if (Array.isArray(parsed.strongSubjects)) parsed.strongSubjects = parsed.strongSubjects.map((s: string) => sanitize(s))
        return NextResponse.json(parsed)
    } catch {
        return NextResponse.json({ error: 'AI temporarily unavailable' }, { status: 503 })
    }
}
