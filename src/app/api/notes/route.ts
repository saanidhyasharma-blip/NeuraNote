import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';
import { z } from 'zod';

const createNoteSchema = z.object({
  title: z.string().min(1, 'Title is required').default('Untitled Note'),
  content: z.string().default(''),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
});

export async function GET(req: Request) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get('search') || '';
    const tag = searchParams.get('tag') || '';
    const category = searchParams.get('category') || '';
    const sort = searchParams.get('sort') || 'recent'; // recent, oldest, alphabetical
    const archivedParam = searchParams.get('archived');
    const favoritesParam = searchParams.get('favorites');

    // Build filter query
    const where: any = {
      userId: user.id,
    };

    // Handle archived status
    if (archivedParam === 'true') {
      where.isArchived = true;
    } else {
      where.isArchived = false;
    }

    // Handle favorites only
    if (favoritesParam === 'true') {
      where.isFavorite = true;
    }

    // Handle search (title or content containing search string)
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { content: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Filter by tag
    if (tag) {
      where.tags = {
        some: {
          name: { equals: tag, mode: 'insensitive' },
        },
      };
    }

    // Filter by category
    if (category) {
      where.category = {
        name: { equals: category, mode: 'insensitive' },
      };
    }

    // Determine sorting
    let orderBy: any = { updatedAt: 'desc' };
    if (sort === 'oldest') {
      orderBy = { createdAt: 'asc' };
    } else if (sort === 'alphabetical') {
      orderBy = { title: 'asc' };
    } else if (sort === 'recent') {
      orderBy = { updatedAt: 'desc' };
    }

    const notes = await prisma.note.findMany({
      where,
      orderBy,
      include: {
        category: true,
        tags: true,
      },
    });

    return NextResponse.json({ notes });
  } catch (error) {
    console.error('Fetch notes error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const result = createNoteSchema.safeParse(body);
    
    if (!result.success) {
      return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
    }

    const { title, content, category, tags } = result.data;

    // Handle category relation
    let categoryRelation: any = undefined;
    if (category) {
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
        categoryRelation = { connect: { id: existingCategory.id } };
      } else {
        categoryRelation = {
          create: {
            name: normalizedCategory,
            userId: user.id,
          },
        };
      }
    }

    // Handle tags relation
    const tagConnectOrCreate = [];
    if (tags && tags.length > 0) {
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
    }

    const note = await prisma.note.create({
      data: {
        title,
        content,
        user: { connect: { id: user.id } },
        category: categoryRelation,
        tags: tagConnectOrCreate.length > 0 ? { connectOrCreate: tagConnectOrCreate } : undefined,
      },
      include: {
        category: true,
        tags: true,
      },
    });

    return NextResponse.json({ note }, { status: 201 });
  } catch (error) {
    console.error('Create note error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
