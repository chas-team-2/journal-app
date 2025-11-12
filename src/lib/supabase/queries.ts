import { createClient } from './server'
import { Entry, NewEntry } from '@/types'

/**
 * Fetch all entries for the authenticated user with file information
 * RLS automatically filters by user_id
 */
export async function getEntries(): Promise<Entry[]> {
  const supabase = await createClient()

  const { data: entries, error } = await supabase
    .from('entries')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  if (!entries || entries.length === 0) {
    return []
  }

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    throw new Error('User not authenticated')
  }

  // Fetch file information for all entries in parallel
  const entriesWithFiles = await Promise.all(
    entries.map(async (entry) => {
      try {
        const folderPath = `${user.id}/${entry.id}`
        
        const { data: files } = await supabase.storage
          .from('entry-files')
          .list(folderPath)

        if (files && files.length > 0) {
          const firstFile = files[0]
          const filePath = `${folderPath}/${firstFile.name}`

          const { data: signedUrlData } = await supabase.storage
            .from('entry-files')
            .createSignedUrl(filePath, 3600)

          if (signedUrlData) {
            return {
              ...entry,
              file: {
                fileName: firstFile.name,
                fileUrl: signedUrlData.signedUrl,
              }
            }
          }
        }
      } catch (error) {
        console.error(`Failed to fetch file for entry ${entry.id}:`, error)
      }

      return { ...entry, file: null }
    })
  )

  return entriesWithFiles
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
 * Also deletes associated files from storage
 */
export async function deleteEntry(id: string): Promise<void> {
  const supabase = await createClient()

  // Get current user
  const { data: { user } } = await supabase.auth.getUser()
  
  if (user) {
    // Delete associated files from storage
    const folderPath = `${user.id}/${id}`
    
    try {
      const { data: files } = await supabase.storage
        .from('entry-files')
        .list(folderPath)
      
      if (files && files.length > 0) {
        const filesToDelete = files.map(f => `${folderPath}/${f.name}`)
        await supabase.storage
          .from('entry-files')
          .remove(filesToDelete)
      }
    } catch (storageError) {
      // Log but don't fail the delete if storage cleanup fails
      console.error('Failed to delete storage files:', storageError)
    }
  }

  // Delete the entry from database
  const { error } = await supabase
    .from('entries')
    .delete()
    .eq('id', id)

  if (error) {
    throw error
  }
}
