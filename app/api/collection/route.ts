import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const collection = await prisma.cardOwnership.findMany({
      where: {
        userId: session.user.id,
      },
      select: {
        cardId: true,
        quantity: true,
      },
    });

    return NextResponse.json({ collection });
  } catch (error) {
    console.error('Error fetching collection:', error);
    return NextResponse.json(
      { error: 'Failed to fetch collection' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { cards } = body;

    if (!Array.isArray(cards)) {
      return NextResponse.json(
        { error: 'Invalid request. Expected an array of cards.' },
        { status: 400 }
      );
    }

    // Validate card entries
    for (const card of cards) {
      if (!card.cardId || typeof card.cardId !== 'string') {
        return NextResponse.json(
          { error: 'Invalid card entry. Each card must have a cardId string.' },
          { status: 400 }
        );
      }
      if (typeof card.quantity !== 'number' || card.quantity < 1) {
        return NextResponse.json(
          { error: 'Invalid card entry. Each card must have a positive quantity.' },
          { status: 400 }
        );
      }
    }

    // Process each card - upsert to handle existing cards
    const results = [];
    for (const card of cards) {
      const { cardId, quantity } = card;

      // Check if user already owns this card
      const existingOwnership = await prisma.cardOwnership.findUnique({
        where: {
          userId_cardId: {
            userId: session.user.id,
            cardId,
          },
        },
      });

      if (existingOwnership) {
        // Update quantity (add to existing)
        const updated = await prisma.cardOwnership.update({
          where: {
            userId_cardId: {
              userId: session.user.id,
              cardId,
            },
          },
          data: {
            quantity: existingOwnership.quantity + quantity,
          },
        });
        results.push(updated);
      } else {
        // Create new ownership
        const created = await prisma.cardOwnership.create({
          data: {
            userId: session.user.id,
            cardId,
            quantity,
          },
        });
        results.push(created);
      }
    }

    return NextResponse.json(
      {
        message: 'Cards added to collection successfully',
        collection: results.map(r => ({ cardId: r.cardId, quantity: r.quantity })),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error adding cards to collection:', error);
    return NextResponse.json(
      { error: 'Failed to add cards to collection' },
      { status: 500 }
    );
  }
}
