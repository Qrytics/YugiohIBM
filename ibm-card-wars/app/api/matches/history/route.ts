import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * GET /api/matches/history?limit=20
 * Get match history for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '20', 10);

    const userId = session.user.id;

    // Get matches where user was either player1 or player2
    const matches = await prisma.match.findMany({
      where: {
        OR: [{ player1Id: userId }, { player2Id: userId }],
      },
      include: {
        player1: {
          select: {
            name: true,
            image: true,
          },
        },
        player2: {
          select: {
            name: true,
            image: true,
          },
        },
        player1Deck: {
          select: {
            name: true,
          },
        },
        player2Deck: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: limit,
    });

    // Format match history
    const history = matches.map((match) => {
      const isPlayer1 = match.player1Id === userId;
      const won = match.winnerId === userId;
      const opponent = isPlayer1 ? match.player2 : match.player1;
      const opponentDeck = isPlayer1
        ? match.player2Deck
        : match.player1Deck;
      const userDeck = isPlayer1 ? match.player1Deck : match.player2Deck;

      return {
        id: match.id,
        date: match.createdAt,
        opponent: {
          name: opponent.name || 'Player',
          image: opponent.image,
        },
        result: won ? 'win' : 'loss',
        duration: match.duration,
        turns: match.turns,
        userDeck: userDeck?.name || 'Unknown Deck',
        opponentDeck: opponentDeck?.name || 'Unknown Deck',
        mmrChange: isPlayer1 ? match.player1MMRChange : match.player2MMRChange,
        xpGained: isPlayer1 ? match.player1XPGained : match.player2XPGained,
      };
    });

    return NextResponse.json({ history });
  } catch (error) {
    console.error('Error fetching match history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch match history' },
      { status: 500 }
    );
  }
}
