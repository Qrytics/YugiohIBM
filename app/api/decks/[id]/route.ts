import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const deck = await prisma.deck.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!deck) {
      return NextResponse.json(
        { error: 'Deck not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ deck });
  } catch (error) {
    console.error('Error fetching deck:', error);
    return NextResponse.json(
      { error: 'Failed to fetch deck' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify deck belongs to user
    const existingDeck = await prisma.deck.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!existingDeck) {
      return NextResponse.json(
        { error: 'Deck not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { name, cardIds, isPublic } = body;

    const updateData: any = {};

    if (name !== undefined) {
      if (typeof name !== 'string' || !name.trim()) {
        return NextResponse.json(
          { error: 'Invalid deck name' },
          { status: 400 }
        );
      }
      updateData.name = name;
    }

    if (cardIds !== undefined) {
      if (typeof cardIds !== 'string') {
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

      updateData.cardIds = cardIds;
    }

    if (isPublic !== undefined) {
      updateData.isPublic = Boolean(isPublic);
    }

    const deck = await prisma.deck.update({
      where: {
        id: params.id,
      },
      data: updateData,
    });

    return NextResponse.json({ deck });
  } catch (error) {
    console.error('Error updating deck:', error);
    return NextResponse.json(
      { error: 'Failed to update deck' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify deck belongs to user
    const existingDeck = await prisma.deck.findFirst({
      where: {
        id: params.id,
        userId: session.user.id,
      },
    });

    if (!existingDeck) {
      return NextResponse.json(
        { error: 'Deck not found' },
        { status: 404 }
      );
    }

    await prisma.deck.delete({
      where: {
        id: params.id,
      },
    });

    return NextResponse.json({ message: 'Deck deleted successfully' });
  } catch (error) {
    console.error('Error deleting deck:', error);
    return NextResponse.json(
      { error: 'Failed to delete deck' },
      { status: 500 }
    );
  }
}
