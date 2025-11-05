import { Entry, NewEntry } from '@/types/database.types'

/**
 * Fetch all entries for the authenticated user
 */
export async function apiGetEntries(): Promise<Entry[]> {
  const response = await fetch('/api/entries', {
    method: 'GET',
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch entries')
  }

  return data.entries
}

/**
 * Get a single entry by ID
 */
export async function apiGetEntry(id: string): Promise<Entry> {
  const response = await fetch(`/api/entries/${id}`, {
    method: 'GET',
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Failed to fetch entry')
  }

  return data.entry
}

/**
 * Create a new entry
 */
export async function apiCreateEntry(entry: NewEntry): Promise<Entry> {
  const response = await fetch('/api/entries', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(entry),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Failed to create entry')
  }

  return data.entry
}

/**
 * Update an existing entry
 */
export async function apiUpdateEntry(id: string, entry: NewEntry): Promise<Entry> {
  const response = await fetch(`/api/entries/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(entry),
  })

  const data = await response.json()

  if (!response.ok) {
    throw new Error(data.error || 'Failed to update entry')
  }

  return data.entry
}
