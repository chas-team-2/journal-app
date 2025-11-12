import { createClient } from '@/lib/supabase/server'

const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB
const ALLOWED_TYPE = 'application/pdf'

/**
 * Get signed URL for a file attached to an entry
 * Returns null if no file exists
 */
export async function getEntryFileUrl(entryId: string): Promise<{ fileName: string; fileUrl: string } | null> {
  const supabase = await createClient()

  // Get current user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    throw new Error('Unauthorized')
  }

  // Check if entry belongs to user
  const { data: entry, error: entryError } = await supabase
    .from('entries')
    .select('user_id')
    .eq('id', entryId)
    .single()

  if (entryError || !entry || entry.user_id !== user.id) {
    throw new Error('Entry not found or unauthorized')
  }

  // List files in the user's entry folder
  const folderPath = `${user.id}/${entryId}`
  
  const { data: files, error: listError } = await supabase.storage
    .from('entry-files')
    .list(folderPath)

  if (listError) {
    console.error('Error listing files:', listError)
    return null
  }

  // If no files, return null
  if (!files || files.length === 0) {
    return null
  }

  // Get the first file
  const firstFile = files[0]
  const filePath = `${folderPath}/${firstFile.name}`

  // Create signed URL (valid for 1 hour)
  const { data: signedUrlData, error: urlError } = await supabase.storage
    .from('entry-files')
    .createSignedUrl(filePath, 3600)

  if (urlError) {
    console.error('Error creating signed URL:', urlError)
    return null
  }

  return {
    fileName: firstFile.name,
    fileUrl: signedUrlData.signedUrl,
  }
}

/**
 * Upload a PDF file to an entry
 * Replaces existing file if one exists
 */
export async function uploadEntryFile(file: File, entryId: string): Promise<{ fileName: string; fileUrl: string }> {
  const supabase = await createClient()

  // Validate user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    throw new Error('Unauthorized')
  }

  // Validate file type
  if (file.type !== ALLOWED_TYPE) {
    throw new Error('Only PDF files are allowed')
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    throw new Error('File is too large (max 2MB)')
  }

  // Check if entry belongs to user
  const { data: entry, error: entryError } = await supabase
    .from('entries')
    .select('user_id')
    .eq('id', entryId)
    .single()

  if (entryError || !entry || entry.user_id !== user.id) {
    throw new Error('Entry not found or unauthorized')
  }

  // Delete existing files in the folder
  const folderPath = `${user.id}/${entryId}`
  const { data: existingFiles } = await supabase.storage
    .from('entry-files')
    .list(folderPath)

  if (existingFiles && existingFiles.length > 0) {
    const filesToDelete = existingFiles.map(f => `${folderPath}/${f.name}`)
    await supabase.storage
      .from('entry-files')
      .remove(filesToDelete)
  }

  // Upload new file
  const filePath = `${folderPath}/${file.name}`
  const { error: uploadError } = await supabase.storage
    .from('entry-files')
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false
    })

  if (uploadError) {
    throw new Error(`Upload failed: ${uploadError.message}`)
  }

  // Create signed URL
  const { data: signedUrlData, error: urlError } = await supabase.storage
    .from('entry-files')
    .createSignedUrl(filePath, 3600)

  if (urlError) {
    throw new Error('Failed to generate file URL')
  }

  return {
    fileName: file.name,
    fileUrl: signedUrlData.signedUrl,
  }
}

/**
 * Delete file attached to an entry
 */
export async function deleteEntryFile(entryId: string): Promise<void> {
  const supabase = await createClient()

  // Validate user
  const { data: { user }, error: userError } = await supabase.auth.getUser()
  if (userError || !user) {
    throw new Error('Unauthorized')
  }

  // Check if entry belongs to user
  const { data: entry, error: entryError } = await supabase
    .from('entries')
    .select('user_id')
    .eq('id', entryId)
    .single()

  if (entryError || !entry || entry.user_id !== user.id) {
    throw new Error('Entry not found or unauthorized')
  }

  // List and delete all files in the folder
  const folderPath = `${user.id}/${entryId}`
  const { data: files, error: listError } = await supabase.storage
    .from('entry-files')
    .list(folderPath)

  if (listError) {
    throw new Error('Failed to list files')
  }

  if (!files || files.length === 0) {
    throw new Error('No file to delete')
  }

  const filesToDelete = files.map(f => `${folderPath}/${f.name}`)
  const { error: deleteError } = await supabase.storage
    .from('entry-files')
    .remove(filesToDelete)

  if (deleteError) {
    throw new Error(`Delete failed: ${deleteError.message}`)
  }
}
