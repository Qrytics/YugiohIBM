import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import {
  generateDailyMissions,
  generateWeeklyMissions,
  getMissionExpiryTime,
} from '@/lib/progression/missionDefinitions';

/**
 * POST /api/missions/generate
 * Generate new missions if none exist or all expired
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Check for active missions
    const activeMissions = await prisma.mission.findMany({
      where: {
        userId,
        expiresAt: {
          gt: new Date(),
        },
      },
    });

    // If user already has active missions, don't generate new ones
    if (activeMissions.length > 0) {
      const daily = activeMissions.filter(m => m.type === 'daily');
      const weekly = activeMissions.filter(m => m.type === 'weekly');
      return NextResponse.json({ daily, weekly, generated: false });
    }

    // Delete expired missions
    await prisma.mission.deleteMany({
      where: {
        userId,
        expiresAt: {
          lte: new Date(),
        },
      },
    });

    // Generate new missions
    const dailyTemplates = generateDailyMissions(); // 3 missions
    const weeklyTemplates = generateWeeklyMissions(); // 1 mission

    const newMissions = [];

    // Create daily missions
    for (const template of dailyTemplates) {
      const mission = await prisma.mission.create({
        data: {
          userId,
          type: 'daily',
          missionId: template.id,
          progress: 0,
          goal: template.goal,
          completed: false,
          claimed: false,
          expiresAt: getMissionExpiryTime('daily'),
        },
      });
      newMissions.push(mission);
    }

    // Create weekly missions
    for (const template of weeklyTemplates) {
      const mission = await prisma.mission.create({
        data: {
          userId,
          type: 'weekly',
          missionId: template.id,
          progress: 0,
          goal: template.goal,
          completed: false,
          claimed: false,
          expiresAt: getMissionExpiryTime('weekly'),
        },
      });
      newMissions.push(mission);
    }

    const daily = newMissions.filter(m => m.type === 'daily');
    const weekly = newMissions.filter(m => m.type === 'weekly');

    return NextResponse.json({ daily, weekly, generated: true });
  } catch (error) {
    console.error('Error generating missions:', error);
    return NextResponse.json(
      { error: 'Failed to generate missions' },
      { status: 500 }
    );
  }
}
