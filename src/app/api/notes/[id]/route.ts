import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { z } from 'zod';
import crypto from 'crypto';

const updateNoteSchema = z.object({
  title: z.string().min(1, 'Title is required').optional(),
  content: z.string().optional(),
  summary: z.string().nullable().optional(),
  actionItems: z.any().nullable().optional(), // Can be JSON array
  isArchived: z.boolean().optional(),
  isPublic: z.boolean().optional(),
  isPinned: z.boolean().optional(),
  isFavorite: z.boolean().optional(),
  category: z.string().nullable().optional(),
  tags: z.array(z.string()).optional(),
});

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const result = updateNoteSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    // Check note ownership
    const existingNote = await prisma.note.findFirst({
      where: { id, userId: user.id },
    });

    if (!existingNote) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    const {
      title,
      content,
      summary,
      actionItems,
      isArchived,
      isPublic,
      isPinned,
      isFavorite,
      category,
      tags,
    } = result.data;

    // Build update object
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (summary !== undefined) updateData.summary = summary;
    if (actionItems !== undefined) updateData.actionItems = actionItems;
    if (isArchived !== undefined) updateData.isArchived = isArchived;
    if (isPinned !== undefined) updateData.isPinned = isPinned;
    if (isFavorite !== undefined) updateData.isFavorite = isFavorite;
    
    // Handle public link generation
    if (isPublic !== undefined) {
      updateData.isPublic = isPublic;
      if (isPublic && !existingNote.shareId) {
        updateData.shareId = crypto.randomBytes(16).toString('hex');
      } else if (!isPublic) {
        updateData.shareId = null; // Revoke share link when private
      }
    }

    // Handle Category update
    if (category !== undefined) {
      if (category === null) {
        updateData.category = { disconnect: true };
      } else {
        const normalizedCategory = category.trim();
        const existingCategory = await prisma.category.findUnique({
          where: {
            name_userId: {
              name: normalizedCategory,
              userId: user.id,
            },
          },
        });

        if (existingCategory) {
          updateData.category = { connect: { id: existingCategory.id } };
        } else {
          updateData.category = {
            create: {
              name: normalizedCategory,
              userId: user.id,
            },
          };
        }
      }
    }

    // Handle Tags update (disconnect existing, connectOrCreate new)
    if (tags !== undefined) {
      // 1. Disconnect all current tags first
      await prisma.note.update({
        where: { id },
        data: {
          tags: {
            set: [],
          },
        },
      });

      // 2. Map new tags
      const tagConnectOrCreate = [];
      for (const t of tags) {
        const normalizedTag = t.trim();
        if (!normalizedTag) continue;

        tagConnectOrCreate.push({
          where: {
            name_userId: {
              name: normalizedTag,
              userId: user.id,
            },
          },
          create: {
            name: normalizedTag,
            userId: user.id,
          },
        });
      }

      if (tagConnectOrCreate.length > 0) {
        updateData.tags = {
          connectOrCreate: tagConnectOrCreate,
        };
      }
    }

    // Apply main updates
    const updatedNote = await prisma.note.update({
      where: { id },
      data: updateData,
      include: {
        category: true,
        tags: true,
      },
    });

    return NextResponse.json({ note: updatedNote });
  } catch (error) {
    console.error('Update note error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { id } = await params;

    // Check note ownership
    const existingNote = await prisma.note.findFirst({
      where: { id, userId: user.id },
    });

    if (!existingNote) {
      return NextResponse.json({ error: 'Note not found' }, { status: 404 });
    }

    // Delete note
    await prisma.note.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Note deleted successfully' });
  } catch (error) {
    console.error('Delete note error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
