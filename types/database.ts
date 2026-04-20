export type Json =
    | string
    | number
    | boolean
    | null
    | { [key: string]: Json | undefined }
    | Json[]

export interface Database {
    public: {
        Tables: {
            profiles: {
                Row: {
                    id: string
                    email: string
                    role: 'admin' | 'teacher' | 'student'
                    full_name: string | null
                    created_at: string
                }
                Insert: {
                    id: string
                    email: string
                    role?: 'admin' | 'teacher' | 'student'
                    full_name?: string | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    email?: string
                    role?: 'admin' | 'teacher' | 'student'
                    full_name?: string | null
                    created_at?: string
                }
            }
            grades: {
                Row: {
                    id: number
                    student_id: string
                    subject: string
                    score: number
                    semester: string
                    created_at: string
                }
                Insert: {
                    id?: number
                    student_id: string
                    subject: string
                    score: number
                    semester: string
                    created_at?: string
                }
                Update: {
                    id?: number
                    student_id?: string
                    subject?: string
                    score?: number
                    semester?: string
                    created_at?: string
                }
            }
            timetable: {
                Row: {
                    id: number
                    user_id: string
                    subject: string
                    day: string
                    start_time: string
                    end_time: string
                    room: string | null
                    created_at: string
                }
                Insert: {
                    id?: number
                    user_id: string
                    subject: string
                    day: string
                    start_time: string
                    end_time: string
                    room?: string | null
                    created_at?: string
                }
                Update: {
                    id?: number
                    user_id?: string
                    subject?: string
                    day?: string
                    start_time?: string
                    end_time?: string
                    room?: string | null
                    created_at?: string
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            user_role: 'admin' | 'teacher' | 'student'
        }
    }
}