import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getMissionTemplate } from '@/lib/progression/missionDefinitions';

/**
 * POST /api/missions/[id]/claim
 * Claim rewards for a completed mission
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const missionId = params.id;

    // Get mission
    const mission = await prisma.mission.findUnique({
      where: { id: missionId },
    });

    if (!mission) {
      return NextResponse.json({ error: 'Mission not found' }, { status: 404 });
    }

    if (mission.userId !== userId) {
      return NextResponse.json({ error: 'Not your mission' }, { status: 403 });
    }

    if (!mission.completed) {
      return NextResponse.json(
        { error: 'Mission not completed' },
        { status: 400 }
      );
    }

    if (mission.claimed) {
      return NextResponse.json(
        { error: 'Rewards already claimed' },
        { status: 400 }
      );
    }

    // Get mission template to know rewards
    const template = getMissionTemplate(mission.missionId);

    if (!template) {
      return NextResponse.json(
        { error: 'Mission template not found' },
        { status: 500 }
      );
    }

    const newPacks = [];

    // Award rewards
    for (const reward of template.rewards) {
      if (reward.type === 'pack') {
        const quantity = reward.quantity || 1;
        for (let i = 0; i < quantity; i++) {
          const pack = await prisma.pack.create({
            data: {
              userId,
              type: reward.packType!,
              source: `mission_${mission.missionId}`,
            },
          });
          newPacks.push(pack);
        }
      } else if (reward.type === 'xp') {
        // Add XP to profile
        await prisma.profile.update({
          where: { userId },
          data: {
            xp: {
              increment: reward.amount || 0,
            },
          },
        });
      }
    }

    // Mark mission as claimed
    await prisma.mission.update({
      where: { id: missionId },
      data: {
        claimed: true,
      },
    });

    return NextResponse.json({
      rewards: template.rewards,
      newPacks,
    });
  } catch (error) {
    console.error('Error claiming mission:', error);
    return NextResponse.json(
      { error: 'Failed to claim mission' },
      { status: 500 }
    );
  }
}
