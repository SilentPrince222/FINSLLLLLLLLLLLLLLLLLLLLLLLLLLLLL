'use client'

import { supabase } from './supabase'
import type { Database } from '@/types/database'

// Bug 2.1: .single() throws when 0 rows are returned. Wrap it so we return
// { data: null, error: null } instead of propagating the PGRST116 error.
async function singleOrNull<T>(
    query: PromiseLike<{ data: T | null; error: { code?: string; message: string } | null }>
): Promise<{ data: T | null; error: { code?: string; message: string } | null }> {
    const result = await query
    if (result.error && result.error.code === 'PGRST116') {
        return { data: null, error: null }
    }
    return result
}

// ==================== PROFILES ====================
export async function getProfile(userId: string) {
    return singleOrNull(
        supabase
            .from('profiles')
            .select('*')
            .eq('id', userId)
            .single()
    )
}

export async function getAllProfiles() {
    return supabase
        .from('profiles')
        .select('*')
        .order('full_name')
}

// ==================== GRADES ====================
export async function getGrades(studentId: string) {
    return supabase
        .from('grades')
        .select('*')
        .eq('student_id', studentId)
        .order('created_at', { ascending: false })
}

// Bug 2.2: tighten type so score must be number — passing 'abc' is a compile error
export async function createGrade(data: Database['public']['Tables']['grades']['Insert']) {
    return singleOrNull(
        supabase
            .from('grades')
            .insert(data)
            .select()
            .single()
    )
}

export async function updateGrade(id: number, data: Database['public']['Tables']['grades']['Update']) {
    return singleOrNull(
        supabase
            .from('grades')
            .update(data)
            .eq('id', id)
            .select()
            .single()
    )
}

export async function deleteGrade(id: number) {
    return supabase
        .from('grades')
        .delete()
        .eq('id', id)
}

// ==================== TIMETABLE ====================
export async function getTimetable(userId: string) {
    return supabase
        .from('timetable')
        .select('*')
        .eq('user_id', userId)
        .order('day')
        .order('start_time')
}

export async function createTimetableEntry(data: Database['public']['Tables']['timetable']['Insert']) {
    return singleOrNull(
        supabase
            .from('timetable')
            .insert(data)
            .select()
            .single()
    )
}

export async function deleteTimetableEntry(id: number) {
    return supabase
        .from('timetable')
        .delete()
        .eq('id', id)
}

// ==================== EVENTS ====================
export async function getEvents(userId: string) {
    return supabase
        .from('events')
        .select('*')
        .eq('user_id', userId)
        .order('due_date', { ascending: true })
}

export async function createEvent(data: Database['public']['Tables']['events']['Insert']) {
    return singleOrNull(
        supabase
            .from('events')
            .insert(data)
            .select()
            .single()
    )
}

export async function updateEvent(id: number, data: Database['public']['Tables']['events']['Update']) {
    return singleOrNull(
        supabase
            .from('events')
            .update(data)
            .eq('id', id)
            .select()
            .single()
    )
}

export async function deleteEvent(id: number) {
    return supabase
        .from('events')
        .delete()
        .eq('id', id)
}