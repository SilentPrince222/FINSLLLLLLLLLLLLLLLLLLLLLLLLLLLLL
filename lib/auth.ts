"use client";

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from './supabase'
import type { User } from '@supabase/supabase-js'

// Mock user for development
const MOCK_USERS = [
  {
    id: 'student-1',
    email: 'student@demo.com',
    user_metadata: { role: 'student', full_name: 'Иван Иванов' },
    created_at: new Date().toISOString()
  },
  {
    id: 'teacher-1',
    email: 'teacher@demo.com',
    user_metadata: { role: 'teacher', full_name: 'Мария Петрова' },
    created_at: new Date().toISOString()
  },
  {
    id: 'admin-1',
    email: 'admin@demo.com',
    user_metadata: { role: 'admin', full_name: 'Администратор' },
    created_at: new Date().toISOString()
  }
]

type AuthContextType = {
    user: User | null
    loading: boolean
    signIn: (_email: string, _password: string) => Promise<any>
    signUp: (_email: string, _password: string, _role: 'student' | 'teacher' | 'parent' | 'admin') => Promise<any>
    signOut: () => Promise<any>
    refreshUser: () => void
    checkRole: (_role: 'student' | 'teacher' | 'parent' | 'admin') => boolean
    getUserRole: () => string
    getDashboardUrl: () => string
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    const refreshUser = () => {
        const mockUserData = localStorage.getItem('mock_user')
        if (mockUserData) {
            try {
                const mockUser = JSON.parse(mockUserData)
                setUser(mockUser)
                setLoading(false)
            } catch (e) {
                localStorage.removeItem('mock_user')
                setUser(null)
                setLoading(false)
            }
        } else {
            setUser(null)
            setLoading(false)
        }
    }

    useEffect(() => {
        let mounted = true

        // Check for mock user in localStorage first (development mode)
        const mockUserData = localStorage.getItem('mock_user')
        if (mockUserData) {
            try {
                const mockUser = JSON.parse(mockUserData)
                setUser(mockUser)
                setLoading(false)
                return
            } catch (e) {
                localStorage.removeItem('mock_user')
            }
        }

        // Development mode: auto-login with mock student user, but only if the
        // user has not explicitly signed out (Bug 10.6).
        if (process.env.NODE_ENV === 'development') {
            if (!localStorage.getItem('mock_signed_out')) {
                const devUser = {
                    id: 'student-1',
                    email: 'student@demo.com',
                    user_metadata: { role: 'student', full_name: 'Иван Иванов' },
                    created_at: new Date().toISOString()
                } as unknown as User
                localStorage.setItem('mock_user', JSON.stringify(devUser))
                setUser(devUser)
                setLoading(false)
                return
            }
            // User explicitly signed out in this browser — stay logged out
            setUser(null)
            setLoading(false)
            return
        }

        // Fall back to Supabase auth
        const getUser = async () => {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (mounted) {
                    setUser(user)
                    setLoading(false)
                }
            } catch (error) {
                // If Supabase fails, stay in loading state
                if (mounted) {
                    setLoading(false)
                }
            }
        }

        getUser()

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event: string, session: any) => {
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

    const value = {
        user,
        loading,
        signIn: (email: string, password: string) => signIn(email, password),
        signUp: (email: string, password: string, role: 'student' | 'teacher' | 'parent' | 'admin') => signUp(email, password, role),
        signOut: () => signOut(),
        refreshUser,
        checkRole: (role: any) => checkRole(user, role),
        getUserRole: () => getUserRole(user),
        getDashboardUrl: () => getDashboardUrl(getUserRole(user))
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
    // Bug 10.6: when the user actively signs in, clear the "signed out" flag
    localStorage.removeItem('mock_signed_out')
    // Check for mock users first
    const mockUser = MOCK_USERS.find(u => u.email === email)
    if (mockUser && password === 'demo123') {
        localStorage.setItem('mock_user', JSON.stringify(mockUser))
        return { data: { user: mockUser }, error: null }
    }

    // Fall back to Supabase
    return supabase.auth.signInWithPassword({ email, password })
}

export async function signUp(email: string, password: string, role: 'student' | 'teacher' | 'parent' | 'admin') {
    // For development, just create a mock user
    const mockUser = {
        id: `user-${Date.now()}`,
        email,
        user_metadata: { role, full_name: email.split('@')[0] },
        created_at: new Date().toISOString()
    }

    localStorage.setItem('mock_user', JSON.stringify(mockUser))
    return { data: { user: mockUser }, error: null }

    // In production, use Supabase
    // return supabase.auth.signUp({
    //     email,
    //     password,
    //     options: {
    //         data: { role }
    //     }
    // })
}

export async function signOut() {
    // Bug 10.6: clear mock_user AND mark that the user explicitly logged out
    // so the dev-mode auto-login in AuthProvider does not re-insert the session
    // after the browser is reopened.
    localStorage.removeItem('mock_user')
    localStorage.setItem('mock_signed_out', '1')
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