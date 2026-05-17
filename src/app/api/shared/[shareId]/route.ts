import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ shareId: string }> }
) {
  try {
    const { shareId } = await params;

    if (!shareId) {
      return NextResponse.json({ error: 'Share ID is required' }, { status: 400 });
    }

    // Find the note that is public and has this shareId
    const note = await prisma.note.findFirst({
      where: {
        shareId,
        isPublic: true,
      },
      include: {
        category: true,
        tags: true,
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    if (!note) {
      return NextResponse.json({ error: 'Note not found or is no longer public' }, { status: 404 });
    }

    return NextResponse.json({ note });
  } catch (error) {
    console.error('Fetch shared note error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
