import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { getRankFromMMR } from '@/lib/progression/rankSystem';

/**
 * GET /api/leaderboards?limit=100&offset=0
 * Get top players by MMR with current user's rank
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '100', 10);
    const offset = parseInt(searchParams.get('offset') || '0', 10);

    // Get top players ordered by MMR
    const topPlayers = await prisma.profile.findMany({
      where: {
        // Only include players who have played at least 1 game
        OR: [
          { wins: { gt: 0 } },
          { losses: { gt: 0 } },
        ],
      },
      include: {
        user: {
          select: {
            name: true,
            image: true,
          },
        },
      },
      orderBy: {
        mmr: 'desc',
      },
      take: limit,
      skip: offset,
    });

    // Get total count of players
    const totalPlayers = await prisma.profile.count({
      where: {
        OR: [
          { wins: { gt: 0 } },
          { losses: { gt: 0 } },
        ],
      },
    });

    // Format leaderboard data
    const leaderboard = topPlayers.map((profile, index) => {
      const totalGames = profile.wins + profile.losses;
      const winRate = totalGames > 0 ? (profile.wins / totalGames) * 100 : 0;
      const rankInfo = getRankFromMMR(profile.mmr);

      return {
        rank: offset + index + 1,
        userId: profile.userId,
        name: profile.user.name || 'Player',
        image: profile.user.image,
        level: profile.level,
        mmr: profile.mmr,
        rankName: rankInfo.name,
        rankDisplayName: rankInfo.displayName,
        rankIcon: rankInfo.icon,
        wins: profile.wins,
        losses: profile.losses,
        winRate: parseFloat(winRate.toFixed(1)),
      };
    });

    // Find current user's rank if authenticated
    let userRank: number | null = null;
    if (session?.user?.id) {
      const userProfile = await prisma.profile.findUnique({
        where: { userId: session.user.id },
      });

      if (userProfile) {
        // Count how many players have higher MMR
        const higherMMRCount = await prisma.profile.count({
          where: {
            mmr: { gt: userProfile.mmr },
            OR: [
              { wins: { gt: 0 } },
              { losses: { gt: 0 } },
            ],
          },
        });
        userRank = higherMMRCount + 1;
      }
    }

    return NextResponse.json({
      leaderboard,
      userRank,
      totalPlayers,
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
}
