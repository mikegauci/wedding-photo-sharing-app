import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      events: {
        Row: {
          id: string
          name: string
          date: string
          access_code: string
          admin_code: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          date: string
          access_code: string
          admin_code: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          date?: string
          access_code?: string
          admin_code?: string
          created_at?: string
        }
      }
      media: {
        Row: {
          id: string
          event_id: string
          file_name: string
          file_path: string
          file_type: string
          file_size: number
          uploaded_by: string | null
          message: string | null
          created_at: string
        }
        Insert: {
          id?: string
          event_id: string
          file_name: string
          file_path: string
          file_type: string
          file_size: number
          uploaded_by?: string | null
          message?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          event_id?: string
          file_name?: string
          file_path?: string
          file_type?: string
          file_size?: number
          uploaded_by?: string | null
          message?: string | null
          created_at?: string
        }
      }
    }
  }
}