'use client'

import { supabase } from './supabase'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import type { User } from '@supabase/supabase-js'

export function useAuth() {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        let mounted = true
        
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            if (mounted) {
                setUser(user)
                setLoading(false)
            }
        }

        getUser()

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            if (mounted) {
                setUser(session?.user ?? null)
                setLoading(false)
            }
        })

        return () => {
            mounted = false
            subscription.unsubscribe()
        }
    }, [router])

    return { user, loading }
}

export async function signIn(email: string, password: string) {
    return supabase.auth.signInWithPassword({ email, password })
}

export async function signUp(email: string, password: string, role: 'student' | 'teacher') {
    return supabase.auth.signUp({
        email,
        password,
        options: {
            data: { role }
        }
    })
}

export async function signOut() {
    return supabase.auth.signOut()
}

export function checkRole(user: User | null, role: 'student' | 'teacher' | 'parent' | 'admin'): boolean {
    if (!user) return false
    const userRole = user.user_metadata?.role
    return userRole === role
}

export function getUserRole(user: User | null): string {
    return user?.user_metadata?.role || 'student'
}

export function getDashboardUrl(role: string): string {
    switch (role) {
        case 'admin': return '/admin'
        case 'teacher': return '/teacher'
        case 'parent': return '/parent'
        default: return '/dashboard'
    }
}