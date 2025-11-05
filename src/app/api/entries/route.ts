import { NextResponse } from 'next/server'
import { getEntries, createEntry } from '@/lib/supabase/queries'

/**
 * GET /api/entries - Get all entries
 */
export async function GET() {
  try {
    const entries = await getEntries()
    return NextResponse.json({ entries }, { status: 200 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch entries'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

/**
 * POST /api/entries - Create new entry
 */
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, content } = body

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      )
    }

    const entry = await createEntry({ title, content })
    return NextResponse.json({ entry }, { status: 201 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create entry'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
