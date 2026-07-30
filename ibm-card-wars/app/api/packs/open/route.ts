import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';
import { generatePackContents, identifyNewCards, PackType } from '@/lib/progression/packSystem';

/**
 * POST /api/packs/open
 * Open a pack and receive random cards
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const body = await request.json();
    const { packId } = body;

    if (!packId || typeof packId !== 'string') {
      return NextResponse.json(
        { error: 'Pack ID is required' },
        { status: 400 }
      );
    }

    // Verify pack ownership and not already opened
    const pack = await prisma.pack.findUnique({
      where: { id: packId },
    });

    if (!pack) {
      return NextResponse.json({ error: 'Pack not found' }, { status: 404 });
    }

    if (pack.userId !== userId) {
      return NextResponse.json({ error: 'Not your pack' }, { status: 403 });
    }

    if (pack.openedAt) {
      return NextResponse.json(
        { error: 'Pack already opened' },
        { status: 400 }
      );
    }

    // Generate random cards based on pack type
    const cards = generatePackContents(pack.type as PackType);

    // Get user's current collection to identify new cards
    const collection = await prisma.cardOwnership.findMany({
      where: { userId },
      select: { cardId: true },
    });

    const ownedCardIds = new Set(collection.map(c => c.cardId));
    const newCardIds = identifyNewCards(cards, ownedCardIds);

    // Add cards to user's collection (upsert quantities)
    for (const card of cards) {
      await prisma.cardOwnership.upsert({
        where: {
          userId_cardId: {
            userId,
            cardId: card.id,
          },
        },
        create: {
          userId,
          cardId: card.id,
          quantity: 1,
        },
        update: {
          quantity: {
            increment: 1,
          },
        },
      });
    }

    // Mark pack as opened
    await prisma.pack.update({
      where: { id: packId },
      data: {
        openedAt: new Date(),
      },
    });

    return NextResponse.json({
      cards,
      newCards: newCardIds,
    });
  } catch (error) {
    console.error('Error opening pack:', error);
    return NextResponse.json(
      { error: 'Failed to open pack' },
      { status: 500 }
    );
  }
}
