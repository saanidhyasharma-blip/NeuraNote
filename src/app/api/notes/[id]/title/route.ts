import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { suggestTitle } from '@/lib/ai';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Check ownership
    const note = await prisma.note.findFirst({
      where: { id, userId: user.id },
    });

    if (!note) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    if (!note.content.trim()) {
      return NextResponse.json({ error: 'Note content is empty' }, { status: 400 });
    }

    // Call AI service
    const suggestedTitle = await suggestTitle(note.content, user.id, note.id);

    // Save to database
    const updatedNote = await prisma.note.update({
      where: { id: note.id },
      data: { title: suggestedTitle },
    });

    return NextResponse.json({ title: updatedNote.title });
  } catch (error) {
    console.error('AI Title error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
