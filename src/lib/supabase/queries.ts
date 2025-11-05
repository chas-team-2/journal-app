import { supabase } from './client'
import { Entry, NewEntry } from '@/types/database.types'

/**
 * Fetch all entries for the authenticated user
 */
export async function getEntries(): Promise<Entry[]> {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  const { data, error } = await supabase
    .from('entries')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return data || []
}

/**
 * Get a single entry by ID
 */
export async function getEntry(id: string): Promise<Entry> {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  const { data, error } = await supabase
    .from('entries')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error) {
    throw error
  }

  return data
}

/**
 * Create a new entry for the authenticated user
 */
export async function createEntry(entry: NewEntry): Promise<Entry> {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  const { data, error } = await supabase
    .from('entries')
    .insert([
      {
        user_id: user.id,
        title: `Title är: ${entry.title}`,
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
 */
export async function updateEntry(id: string, entry: NewEntry): Promise<Entry> {
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    throw new Error('User not authenticated')
  }

  console.log('Attempting to update entry:', { id, user_id: user.id, entry })

  // First, verify the entry exists and belongs to the user
  const { data: existingEntry, error: fetchError } = await supabase
    .from('entries')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (fetchError) {
    console.error('Fetch error:', fetchError)
    throw new Error('Entry not found or access denied')
  }

  console.log('Found existing entry:', existingEntry)

  // Try update without user_id filter first
  const { data, error, count } = await supabase
    .from('entries')
    .update({
      title: `Title är: ${entry.title}`,
      content: entry.content
    })
    .eq('id', id)
    .select()

  console.log('Update result:', { data, error, count })

  if (error) {
    console.error('Update error:', error)
    throw new Error(error.message || 'Failed to update entry')
  }

  if (!data || data.length === 0) {
    throw new Error('Update returned no data - possible RLS policy issue')
  }

  console.log('Update successful:', data[0])
  return data[0]
}
