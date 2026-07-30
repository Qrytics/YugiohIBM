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

    const decks = await prisma.deck.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: {
        updatedAt: 'desc',
      },
    });

    return NextResponse.json({ decks });
  } catch (error) {
    console.error('Error fetching decks:', error);
    return NextResponse.json(
      { error: 'Failed to fetch decks' },
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
    const { name, cardIds } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'Invalid deck name' },
        { status: 400 }
      );
    }

    if (!cardIds || typeof cardIds !== 'string') {
      return NextResponse.json(
        { error: 'Invalid cardIds format. Must be a JSON stringified array.' },
        { status: 400 }
      );
    }

    // Validate that cardIds is valid JSON
    try {
      JSON.parse(cardIds);
    } catch {
      return NextResponse.json(
        { error: 'cardIds must be a valid JSON string' },
        { status: 400 }
      );
    }

    const deck = await prisma.deck.create({
      data: {
        userId: session.user.id,
        name,
        cardIds,
        isPublic: body.isPublic || false,
      },
    });

    return NextResponse.json({ deck }, { status: 201 });
  } catch (error) {
    console.error('Error creating deck:', error);
    return NextResponse.json(
      { error: 'Failed to create deck' },
      { status: 500 }
    );
  }
}
