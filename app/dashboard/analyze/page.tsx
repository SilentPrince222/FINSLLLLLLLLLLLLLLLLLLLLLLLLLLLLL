'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/auth'
import { getGrades } from '@/lib/database'

type AnalysisResult = {
    average: number
    level: string
    weakSubjects: string[]
    strongSubjects: string[]
    recommendations: string[]
}

export default function AnalyzePage() {
    const { user } = useAuth()
    const [loading, setLoading] = useState(false)
    const [analyzing, setAnalyzing] = useState(false)
    const [grades, setGrades] = useState<any[]>([])
    const [result, setResult] = useState<AnalysisResult | null>(null)

    const loadGrades = useCallback(async () => {
        if (!user) return
        setLoading(true)
        const { data } = await getGrades(user.id)
        if (data) setGrades(data)
        setLoading(false)
    }, [user])

    useEffect(() => {
        if (user) {
            loadGrades()
        }
    }, [user, loadGrades])

    async function runAnalysis() {
        setAnalyzing(true)
        try {
            const res = await fetch('/api/ai/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ grades })
            })
            if (!res.ok) {
                const err = await res.json()
                throw new Error(err.error || 'Analysis failed')
            }
            const data = await res.json()
            setResult(data)
        } catch (err: any) {
            setResult({ average: 0, level: 'Error', weakSubjects: [], strongSubjects: [], recommendations: [err.message] })
        } finally {
            setAnalyzing(false)
        }
    }

    return (
        <div className="max-w-4xl mx-auto py-8 px-4">
            <h1 className="text-2xl font-bold mb-6">AI Grade Analyzer</h1>

            <div className="bg-white p-4 rounded-lg shadow mb-6">
                <div className="flex justify-between items-center">
                    <div>
                        <div className="text-gray-600">Grades available: {grades.length}</div>
                    </div>
                    <button
                        onClick={runAnalysis}
                        disabled={analyzing || grades.length === 0}
                        className="px-6 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
                    >
                        {analyzing ? 'Analyzing...' : '🔍 Analyze My Grades'}
                    </button>
                </div>
            </div>

            {result && (
                <div className="bg-white rounded-lg shadow p-6 space-y-6">
                    <div className="flex justify-between items-center border-b pb-4">
                        <div>
                            <div className="text-gray-600">Overall Average</div>
                            <div className="text-3xl font-bold">{result.average}%</div>
                        </div>
                        <div className="text-xl font-semibold px-4 py-2 rounded bg-gray-100">
                            {result.level}
                        </div>
                    </div>

                    {/* Performance Groups */}
                    <div className="grid grid-cols-3 gap-4">
                        <div className="p-3 bg-red-50 rounded-lg">
                            <div className="text-sm font-semibold text-red-700 mb-2">🔴 Weak</div>
                            <div className="text-2xl font-bold text-red-800">{result.weakSubjects.length}</div>
                        </div>
                        <div className="p-3 bg-yellow-50 rounded-lg">
                            <div className="text-sm font-semibold text-yellow-700 mb-2">🟡 Medium</div>
                            <div className="text-2xl font-bold text-yellow-800">
                                {grades.length - result.weakSubjects.length - result.strongSubjects.length}
                            </div>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg">
                            <div className="text-sm font-semibold text-green-700 mb-2">🟢 Strong</div>
                            <div className="text-2xl font-bold text-green-800">{result.strongSubjects.length}</div>
                        </div>
                    </div>

                    {/* Subjects List */}
                    {result.weakSubjects.length > 0 && (
                        <div>
                            <h4 className="font-bold mb-2 text-red-700">Needs Attention</h4>
                            <div className="flex flex-wrap gap-2">
                                {result.weakSubjects.map((s, i) => (
                                    <span key={i} className="px-3 py-1 bg-red-100 text-red-700 rounded text-sm">{s}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    {result.strongSubjects.length > 0 && (
                        <div>
                            <h4 className="font-bold mb-2 text-green-700">Doing Great</h4>
                            <div className="flex flex-wrap gap-2">
                                {result.strongSubjects.map((s, i) => (
                                    <span key={i} className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm">{s}</span>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Quick Insights */}
                    <div className="p-4 bg-blue-50 rounded-lg">
                        <div className="font-semibold text-blue-800 mb-2">💡 Quick Insight</div>
                        <p className="text-sm text-gray-700">
                            {result.average >= 75
                                ? "You're performing well overall! Keep your focus on the weaker subjects to maintain progress."
                                : result.average >= 60
                                    ? "You're on track. A bit more consistency will get you to the next level."
                                    : "There's room for improvement. Start with the subjects listed above first."
                            }
                        </p>
                    </div>

                    <div>
                        <h3 className="font-bold mb-3">💡 Recommendations</h3>
                        <ul className="space-y-2">
                            {result.recommendations.map((r, i) => (
                                <li key={i} className="flex items-start gap-2">
                                    <span className="text-blue-600">•</span>
                                    <span>{r}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            )}

            {loading && <div>Loading grades...</div>}

            {!loading && grades.length === 0 && !result && (
                <div className="text-center text-gray-500 py-12 bg-white rounded-lg">
                    Add some grades first to run AI analysis
                </div>
            )}
        </div>
    )
}