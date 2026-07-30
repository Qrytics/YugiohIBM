import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

/**
 * GET /api/packs
 * Get all unopened packs for the authenticated user
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get all unopened packs
    const packs = await prisma.pack.findMany({
      where: {
        userId,
        openedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ packs });
  } catch (error) {
    console.error('Error fetching packs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch packs' },
      { status: 500 }
    );
  }
}
