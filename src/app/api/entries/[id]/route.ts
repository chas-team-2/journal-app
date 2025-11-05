import { NextResponse } from 'next/server'
import { getEntry, updateEntry } from '@/lib/supabase/queries'

/**
 * GET /api/entries/[id] - Get single entry
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const entry = await getEntry(id)
    return NextResponse.json({ entry }, { status: 200 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to fetch entry'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

/**
 * PUT /api/entries/[id] - Update entry
 */
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { title, content } = body

    if (!title || !content) {
      return NextResponse.json(
        { error: 'Title and content are required' },
        { status: 400 }
      )
    }

    const entry = await updateEntry(id, { title, content })
    return NextResponse.json({ entry }, { status: 200 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update entry'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
