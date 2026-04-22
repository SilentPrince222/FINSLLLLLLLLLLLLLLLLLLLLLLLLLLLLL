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
                    role: 'admin' | 'teacher' | 'student' | 'parent'
                    full_name: string | null
                    group_name: string | null
                    attendance_rate: number | null
                    created_at: string
                }
                Insert: {
                    id: string
                    email: string
                    role?: 'admin' | 'teacher' | 'student' | 'parent'
                    full_name?: string | null
                    group_name?: string | null
                    attendance_rate?: number | null
                    created_at?: string
                }
                Update: {
                    id?: string
                    email?: string
                    role?: 'admin' | 'teacher' | 'student' | 'parent'
                    full_name?: string | null
                    group_name?: string | null
                    attendance_rate?: number | null
                    created_at?: string
                }
            }
            grades: {
                Row: {
                    id: number
                    student_id: string
                    teacher_id: string | null
                    subject: string
                    score: number
                    semester: string
                    comment: string | null
                    created_at: string
                }
                Insert: {
                    id?: number
                    student_id: string
                    teacher_id?: string | null
                    subject: string
                    score: number
                    semester: string
                    comment?: string | null
                    created_at?: string
                }
                Update: {
                    id?: number
                    student_id?: string
                    teacher_id?: string | null
                    subject?: string
                    score?: number
                    semester?: string
                    comment?: string | null
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
            events: {
                Row: {
                    id: number
                    user_id: string
                    title: string
                    due_date: string
                    description: string | null
                    type: string
                    priority: string
                    created_at: string
                }
                Insert: {
                    id?: number
                    user_id: string
                    title: string
                    due_date: string
                    description?: string | null
                    type: string
                    priority?: string
                    created_at?: string
                }
                Update: {
                    id?: number
                    user_id?: string
                    title?: string
                    due_date?: string
                    description?: string | null
                    type?: string
                    priority?: string
                    created_at?: string
                }
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            get_user_events: {
                Args: {
                    user_id: string
                }
                Returns: {
                    id: number
                    user_id: string
                    title: string
                    due_date: string
                    description: string | null
                    type: string
                    priority: string
                    created_at: string
                }[]
            }
        }
        Enums: {
            user_role: 'admin' | 'teacher' | 'student' | 'parent'
        }
    }
}