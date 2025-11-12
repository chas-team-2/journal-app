import { NextRequest, NextResponse } from 'next/server'
import { uploadEntryFile, deleteEntryFile } from '@/lib/api/files'

/**
 * POST /api/files - Upload a PDF file to an entry
 */
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const entryId = formData.get('entryId') as string

    if (!file || !entryId) {
      return NextResponse.json(
        { error: 'File and entry ID are required' },
        { status: 400 }
      )
    }

    const result = await uploadEntryFile(file, entryId)

    return NextResponse.json(result, { status: 200 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Upload failed'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}

/**
 * DELETE /api/files?entryId={id} - Delete file from an entry
 */
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const entryId = searchParams.get('entryId')

    if (!entryId) {
      return NextResponse.json(
        { error: 'Entry ID is required' },
        { status: 400 }
      )
    }

    await deleteEntryFile(entryId)

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Delete failed'
    return NextResponse.json({ error: message }, { status: 400 })
  }
}
