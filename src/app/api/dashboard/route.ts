import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromRequest } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const user = await getUserFromRequest(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 1. Total Notes & Archived Notes Count
    const totalNotes = await prisma.note.count({
      where: { userId: user.id, isArchived: false },
    });

    const archivedNotes = await prisma.note.count({
      where: { userId: user.id, isArchived: true },
    });

    // 2. AI Generations Count (AIUsageLog)
    const aiGenerationsCount = await prisma.aIUsageLog.count({
      where: { userId: user.id },
    });

    // 3. Notes created this week (since 7 days ago)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const notesCreatedThisWeek = await prisma.note.count({
      where: {
        userId: user.id,
        createdAt: { gte: sevenDaysAgo },
      },
    });

    // 4. Recently edited notes (top 5)
    const recentlyEdited = await prisma.note.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: 'desc' },
      take: 5,
      include: {
        category: true,
      },
    });

    // 5. Most used tags (top 6 tags based on note count)
    const tagsWithCounts = await prisma.tag.findMany({
      where: { userId: user.id },
      select: {
        name: true,
        _count: {
          select: { notes: true },
        },
      },
      orderBy: {
        notes: { _count: 'desc' },
      },
      take: 6,
    });

    const mostUsedTags = tagsWithCounts.map(t => ({
      name: t.name,
      count: t._count.notes,
    }));

    // 6. Weekly Activity Graph (Note creation over the past 7 days)
    const activityMap = new Map<string, number>();
    
    // Initialize past 7 days with count 0
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dateString = d.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
      activityMap.set(dateString, 0);
    }

    const notesForActivity = await prisma.note.findMany({
      where: {
        userId: user.id,
        createdAt: { gte: sevenDaysAgo },
      },
      select: {
        createdAt: true,
      },
    });

    // Aggregate counts by date
    for (const note of notesForActivity) {
      const dateString = note.createdAt.toLocaleDateString('en-US', { weekday: 'short', month: 'numeric', day: 'numeric' });
      if (activityMap.has(dateString)) {
        activityMap.set(dateString, (activityMap.get(dateString) || 0) + 1);
      }
    }

    const weeklyActivity = Array.from(activityMap.entries()).map(([date, count]) => ({
      date,
      count,
    }));

    return NextResponse.json({
      stats: {
        totalNotes,
        archivedNotes,
        aiGenerationsCount,
        notesCreatedThisWeek,
      },
      recentlyEdited,
      mostUsedTags,
      weeklyActivity,
    });
  } catch (error) {
    console.error('Fetch dashboard stats error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
