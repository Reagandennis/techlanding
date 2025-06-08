import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fileId = searchParams.get('id');

    if (!fileId) {
      return NextResponse.json(
        { error: 'File ID is required' },
        { status: 400 }
      );
    }

    // Map file IDs to actual file paths
    const fileMap: { [key: string]: string } = {
      'aws-simulator': 'aws-simulator.zip',
      'security-guide': 'security-guide.pdf',
      'cloud-tutorial': 'cloud-tutorials.zip',
      'cert-prep': 'cert-prep.zip',
    };

    const fileName = fileMap[fileId];
    if (!fileName) {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    // Path to the file in the public directory
    const filePath = path.join(process.cwd(), 'public', 'downloads', fileName);

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      );
    }

    // Read the file
    const fileBuffer = await fs.readFile(filePath);

    // Set appropriate headers
    const headers = new Headers();
    headers.set('Content-Type', 'application/octet-stream');
    headers.set('Content-Disposition', `attachment; filename="${fileName}"`);

    return new NextResponse(fileBuffer, {
      headers,
    });
  } catch (error) {
    console.error('Error downloading file:', error);
    return NextResponse.json(
      { error: 'Failed to download file' },
      { status: 500 }
    );
  }
} 