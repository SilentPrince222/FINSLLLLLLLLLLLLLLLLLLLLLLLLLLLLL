'use client'

import { supabase } from './supabase'
import type { Database } from '@/types/database'

// ==================== PROFILES ====================
export async function getProfile(userId: string) {
    return supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()
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

export async function createGrade(data: any) {
    return supabase
        .from('grades')
        .insert(data)
        .select()
        .single()
}

export async function updateGrade(id: number, data: any) {
    return supabase
        .from('grades')
        // @ts-ignore - Supabase typing issue with update method
        .update(data)
        .eq('id', id)
        .select()
        .single()
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

export async function createTimetableEntry(data: any) {
    return supabase
        .from('timetable')
        .insert(data)
        .select()
        .single()
}

export async function deleteTimetableEntry(id: number) {
    return supabase
        .from('timetable')
        .delete()
        .eq('id', id)
}