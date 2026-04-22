import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { Database } from '@/types/database'

// Basic rate limiting
const rateLimit = new Map<string, { count: number, resetAt: number }>()

function cleanupRateLimit() {
    const now = Date.now()
    for (const [key, value] of rateLimit) {
        if (now > value.resetAt) {
            rateLimit.delete(key)
        }
    }
}

export async function POST(request: Request) {
    // Validate authenticated user
    const supabase = createRouteHandlerClient<Database>({ cookies })
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    cleanupRateLimit()

    // Rate limit: max 5 requests per minute
    const now = Date.now()
    const userLimit = rateLimit.get(user.id)
    
    if (userLimit && now < userLimit.resetAt && userLimit.count >= 5) {
        return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
    }
    
    if (userLimit && now < userLimit.resetAt) {
        userLimit.count++
    } else {
        rateLimit.set(user.id, { count: 1, resetAt: now + 60000 })
    }

    // Validate input
    const { grades } = await request.json()

    if (!grades || !Array.isArray(grades) || grades.length > 50) {
        return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
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

    // Analysis logic
    const avgScore = Math.round(grades.reduce((sum: number, g: any) => sum + g.score, 0) / grades.length)
    const weakSubjects = grades.filter((g: any) => g.score < 65).map((g: any) => g.subject)
    const strongSubjects = grades.filter((g: any) => g.score >= 80).map((g: any) => g.subject)

    let level = 'Below Average'
    if (avgScore >= 80) level = 'Excellent'
    else if (avgScore >= 70) level = 'Good'
    else if (avgScore >= 60) level = 'Average'

    const recommendations = []

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
