import { Tables, TablesInsert } from './supabase'

// Re-export Supabase types for convenience
export type { Database } from './supabase'

// Database types
export type Entry = Tables<'entries'>
export type NewEntry = Omit<TablesInsert<'entries'>, 'user_id' | 'id' | 'created_at'>

// Auth types
export type LoginCredentials = {
  email: string
  password: string
}

export type SignupCredentials = {
  email: string
  password: string
}
