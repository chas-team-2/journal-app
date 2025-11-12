import { createClient } from '@/lib/supabase/server'

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
