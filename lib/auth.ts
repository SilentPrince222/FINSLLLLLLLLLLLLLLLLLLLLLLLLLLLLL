"use client";

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from '@/i18n/routing'
import { supabase } from './supabase'
import { getProfile } from './database'
import type { User, Session } from '@supabase/supabase-js'

type Role = 'student' | 'teacher' | 'parent' | 'admin'

type AuthContextType = {
    user: User | null
    role: string | null
    loading: boolean
    signIn: (_email: string, _password: string) => Promise<any>
    signUp: (_email: string, _password: string, _role: Role) => Promise<any>
    signOut: () => Promise<any>
    refreshUser: () => void
    checkRole: (_role: Role) => boolean
    getUserRole: () => string
    getDashboardUrl: () => string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

async function resolveRole(userId: string): Promise<string | null> {
    try {
        const { data } = await getProfile(userId)
        return (data as { role?: string } | null)?.role ?? null
    } catch {
        return null
    }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [role, setRole] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    const refreshUser = async () => {
        const { data: { user: current } } = await supabase.auth.getUser()
        setUser(current)
        setRole(current ? await resolveRole(current.id) : null)
        setLoading(false)
    }

    useEffect(() => {
        let mounted = true

        // onAuthStateChange fires INITIAL_SESSION synchronously on subscribe —
        // use it as the single source of truth instead of racing it against getUser().
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event: string, session: Session | null) => {
            if (!mounted) return
            const current = session?.user ?? null
            setUser(current)
            if (current) {
                const r = await resolveRole(current.id)
                if (mounted) setRole(r)
            } else {
                setRole(null)
            }
            setLoading(false)
        })

        return () => {
            mounted = false
            subscription.unsubscribe()
        }
    }, [router])

    const value = {
        user,
        role,
        loading,
        signIn: (email: string, password: string) => signIn(email, password),
        signUp: (email: string, password: string, r: Role) => signUp(email, password, r),
        signOut: () => signOut(),
        refreshUser,
        checkRole: (r: Role) => checkRole(user, r),
        getUserRole: () => getUserRole(user),
        getDashboardUrl: () => getDashboardUrl(role ?? getUserRole(user)),
    }

    return React.createElement(AuthContext.Provider, { value }, children)
}

export function useAuth() {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

export async function signIn(email: string, password: string) {
    return supabase.auth.signInWithPassword({ email, password })
}

export async function signUp(email: string, password: string, role: Role) {
    return supabase.auth.signUp({
        email,
        password,
        options: { data: { role } },
    })
}

export async function signOut() {
    return supabase.auth.signOut()
}

export function checkRole(user: User | null, role: Role): boolean {
    if (!user) return false
    return user.user_metadata?.role === role
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
