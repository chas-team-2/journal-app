import { NextResponse } from 'next/server'
import { getEntryFileUrl } from '@/lib/api/files'

/**
 * GET /api/entries/[id]/file - Get file info for an entry
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const fileInfo = await getEntryFileUrl(id)

    if (!fileInfo) {
      return NextResponse.json({ file: null }, { status: 200 })
    }

    return NextResponse.json({ file: fileInfo }, { status: 200 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to get file'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
