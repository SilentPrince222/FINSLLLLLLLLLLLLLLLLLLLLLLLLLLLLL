'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/lib/auth'
import { getGrades } from '@/lib/database'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'

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

    // Process grades for GPA trend chart
    const getGPAData = () => {
        const sortedGrades = grades.sort((a, b) =>
            new Date(a.created_at || 0).getTime() - new Date(b.created_at || 0).getTime()
        )

        return sortedGrades.map((grade, index) => ({
            period: `Period ${index + 1}`,
            gpa: grade.score,
            subject: grade.subject
        }))
    }

    // Mock attendance data - in real app this would come from database
    const attendanceData = [
        { name: 'Attended', value: 85, color: '#10b981' },
        { name: 'Missed', value: 15, color: '#ef4444' }
    ]

    const totalAttendance = attendanceData.reduce((sum, item) => sum + item.value, 0)
    const gpaData = getGPAData()
    const currentGPA = gpaData.length > 0 ? Math.round(gpaData.reduce((sum, item) => sum + item.gpa, 0) / gpaData.length) : 0

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
        <div className="max-w-6xl mx-auto py-8 px-4">
            <h1 className="text-2xl font-bold mb-6">Analytics Dashboard</h1>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="text-sm text-gray-500 mb-2">Current GPA</div>
                    <div className="text-3xl font-bold text-blue-600">{currentGPA}%</div>
                    <div className="text-sm text-gray-500 mt-2">
                        Based on {grades.length} grades
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="text-sm text-gray-500 mb-2">Attendance Rate</div>
                    <div className="text-3xl font-bold text-green-600">{totalAttendance}%</div>
                    <div className="text-sm text-gray-500 mt-2">
                        Classes attended this semester
                    </div>
                </div>
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="text-sm text-gray-500 mb-2">Grade Trend</div>
                    <div className="text-3xl font-bold text-purple-600">
                        {gpaData.length > 1 ?
                            (gpaData[gpaData.length - 1].gpa > gpaData[gpaData.length - 2].gpa ? '↗️' :
                             gpaData[gpaData.length - 1].gpa < gpaData[gpaData.length - 2].gpa ? '↘️' : '➡️')
                            : '📊'}
                    </div>
                    <div className="text-sm text-gray-500 mt-2">
                        Recent performance trend
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                {/* GPA Trend Chart */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">GPA Trend Over Time</h3>
                    {gpaData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={300}>
                            <LineChart data={gpaData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="period" />
                                <YAxis domain={[0, 100]} />
                                <Tooltip
                                    formatter={(value, name) => [`${value}%`, 'GPA']}
                                    labelFormatter={(label, payload) => {
                                        if (payload && payload[0]) {
                                            return `${payload[0].payload.subject} - ${label}`
                                        }
                                        return label
                                    }}
                                />
                                <Line
                                    type="monotone"
                                    dataKey="gpa"
                                    stroke="#3b82f6"
                                    strokeWidth={3}
                                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 6 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="h-64 flex items-center justify-center text-gray-500">
                            Add some grades to see your GPA trend
                        </div>
                    )}
                </div>

                {/* Attendance Chart */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-semibold mb-4">Class Attendance</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={attendanceData}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={100}
                                paddingAngle={5}
                                dataKey="value"
                            >
                                {attendanceData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value) => [`${value}%`, 'Attendance']} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="flex justify-center gap-6 mt-4">
                        {attendanceData.map((item, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <div
                                    className="w-3 h-3 rounded-full"
                                    style={{ backgroundColor: item.color }}
                                />
                                <span className="text-sm text-gray-600">
                                    {item.name}: {item.value}%
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* AI Analysis Section */}
            <div className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold">AI Performance Analysis</h2>
                    <button
                        onClick={runAnalysis}
                        disabled={analyzing || grades.length === 0}
                        className="px-6 py-2 bg-blue-600 text-white rounded disabled:opacity-50"
                    >
                        {analyzing ? 'Analyzing...' : '🔍 Run AI Analysis'}
                    </button>
                </div>

                {result ? (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center border-b pb-4">
                            <div>
                                <div className="text-gray-600">AI Analysis Result</div>
                                <div className="text-3xl font-bold">{result.average}%</div>
                            </div>
                            <div className="text-xl font-semibold px-4 py-2 rounded bg-gray-100">
                                {result.level}
                            </div>
                        </div>

                        {/* Performance Groups */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="p-3 bg-red-50 rounded-lg">
                                <div className="text-sm font-semibold text-red-700 mb-2">🔴 Weak Areas</div>
                                <div className="text-2xl font-bold text-red-800">{result.weakSubjects.length}</div>
                            </div>
                            <div className="p-3 bg-yellow-50 rounded-lg">
                                <div className="text-sm font-semibold text-yellow-700 mb-2">🟡 Average</div>
                                <div className="text-2xl font-bold text-yellow-800">
                                    {grades.length - result.weakSubjects.length - result.strongSubjects.length}
                                </div>
                            </div>
                            <div className="p-3 bg-green-50 rounded-lg">
                                <div className="text-sm font-semibold text-green-700 mb-2">🟢 Strong Areas</div>
                                <div className="text-2xl font-bold text-green-800">{result.strongSubjects.length}</div>
                            </div>
                        </div>

                        {/* AI Insights */}
                        <div className="p-4 bg-blue-50 rounded-lg">
                            <div className="font-semibold text-blue-800 mb-2">🤖 AI Insights</div>
                            <p className="text-sm text-gray-700">
                                {result.average >= 75
                                    ? "You&apos;re performing well overall! Keep your focus on the weaker subjects to maintain progress."
                                    : result.average >= 60
                                        ? "You&apos;re on track. A bit more consistency will get you to the next level."
                                        : "There&apos;s room for improvement. Start with the subjects listed above first."
                                }
                            </p>
                        </div>

                        <div>
                            <h3 className="font-bold mb-3">💡 AI Recommendations</h3>
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
                ) : (
                    <div className="text-center py-12">
                        {loading ? (
                            <div className="text-gray-500">Loading grades...</div>
                        ) : grades.length === 0 ? (
                            <div className="text-gray-500">Add some grades first to run AI analysis</div>
                        ) : (
                            <div className="text-gray-500">Click &quot;Run AI Analysis&quot; to get insights about your performance</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}