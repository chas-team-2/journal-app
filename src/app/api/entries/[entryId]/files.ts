import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ entryId: string }> }
) {
  try {
    const { entryId } = await params;
    const supabase = await createClient();

    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // List files in the user's entry folder
    const folderPath = `${user.id}/${entryId}`;

    const { data: files, error: listError } = await supabase.storage
      .from('entry-files')
      .list(folderPath);

    if (listError) {
      return NextResponse.json(
        { error: 'Failed to list files' },
        { status: 500 }
      );
    }

    // If no files, return empty response
    if (!files || files.length === 0) {
      return NextResponse.json({ fileName: null, fileUrl: null });
    }

    // Get the first file
    const firstFile = files[0];
    const filePath = `${folderPath}/${firstFile.name}`;

    // Create signed URL (valid for 1 hour)
    const { data: signedUrlData, error: urlError } = await supabase.storage
      .from('entry-files')
      .createSignedUrl(filePath, 3600);

    if (urlError) {
      return NextResponse.json(
        { error: 'Failed to generate signed URL' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      fileName: firstFile.name,
      fileUrl: signedUrlData.signedUrl,
    });
  } catch (error) {
    console.error('Error in /api/entries/[entryId]/files:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
