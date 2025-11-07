import { createClient } from './server'
import { Entry, NewEntry } from '@/types'

/**
 * Fetch all entries for the authenticated user
 * RLS automatically filters by user_id
 */
export async function getEntries(): Promise<Entry[]> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('entries')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return data || []
}

/**
 * Get a single entry by ID
 * RLS ensures user can only access their own entries
 */
export async function getEntry(id: string): Promise<Entry> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('entries')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    throw error
  }

  return data
}

/**
 * Create a new entry for the authenticated user
 * RLS ensures user_id is set correctly
 */
export async function createEntry(entry: NewEntry): Promise<Entry> {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  const { data, error } = await supabase
    .from('entries')
    .insert([
      {
        user_id: user.id,
        title: entry.title,
        content: entry.content,
        created_at: new Date().toISOString()
      }
    ])
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

/**
 * Update an existing entry
 * RLS ensures user can only update their own entries
 */
export async function updateEntry(id: string, entry: NewEntry): Promise<Entry> {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('entries')
    .update({
      title: entry.title,
      content: entry.content
    })
    .eq('id', id)
    .select()
    .single()

  if (error) {
    throw error
  }

  return data
}

/**
 * Delete an entry
 * RLS ensures user can only delete their own entries
 */
export async function deleteEntry(id: string): Promise<void> {
  const supabase = await createClient()

  const { error } = await supabase
    .from('entries')
    .delete()
    .eq('id', id)

  if (error) {
    throw error
  }
}
