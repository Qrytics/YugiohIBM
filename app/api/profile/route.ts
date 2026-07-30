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

    const profile = await prisma.profile.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    if (!profile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Verify profile exists
    const existingProfile = await prisma.profile.findUnique({
      where: {
        userId: session.user.id,
      },
    });

    if (!existingProfile) {
      return NextResponse.json(
        { error: 'Profile not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { level, xp, rank, mmr, wins, losses, draws, cardBacks, avatars, titles } = body;

    const updateData: any = {};

    if (level !== undefined) {
      if (typeof level !== 'number' || level < 1) {
        return NextResponse.json(
          { error: 'Invalid level. Must be a positive number.' },
          { status: 400 }
        );
      }
      updateData.level = level;
    }

    if (xp !== undefined) {
      if (typeof xp !== 'number' || xp < 0) {
        return NextResponse.json(
          { error: 'Invalid xp. Must be a non-negative number.' },
          { status: 400 }
        );
      }
      updateData.xp = xp;
    }

    if (rank !== undefined) {
      if (typeof rank !== 'string') {
        return NextResponse.json(
          { error: 'Invalid rank. Must be a string.' },
          { status: 400 }
        );
      }
      updateData.rank = rank;
    }

    if (mmr !== undefined) {
      if (typeof mmr !== 'number') {
        return NextResponse.json(
          { error: 'Invalid mmr. Must be a number.' },
          { status: 400 }
        );
      }
      updateData.mmr = mmr;
    }

    if (wins !== undefined) {
      if (typeof wins !== 'number' || wins < 0) {
        return NextResponse.json(
          { error: 'Invalid wins. Must be a non-negative number.' },
          { status: 400 }
        );
      }
      updateData.wins = wins;
    }

    if (losses !== undefined) {
      if (typeof losses !== 'number' || losses < 0) {
        return NextResponse.json(
          { error: 'Invalid losses. Must be a non-negative number.' },
          { status: 400 }
        );
      }
      updateData.losses = losses;
    }

    if (draws !== undefined) {
      if (typeof draws !== 'number' || draws < 0) {
        return NextResponse.json(
          { error: 'Invalid draws. Must be a non-negative number.' },
          { status: 400 }
        );
      }
      updateData.draws = draws;
    }

    if (cardBacks !== undefined) {
      if (typeof cardBacks !== 'string') {
        return NextResponse.json(
          { error: 'Invalid cardBacks. Must be a JSON string.' },
          { status: 400 }
        );
      }
      try {
        JSON.parse(cardBacks);
      } catch {
        return NextResponse.json(
          { error: 'cardBacks must be a valid JSON string' },
          { status: 400 }
        );
      }
      updateData.cardBacks = cardBacks;
    }

    if (avatars !== undefined) {
      if (typeof avatars !== 'string') {
        return NextResponse.json(
          { error: 'Invalid avatars. Must be a JSON string.' },
          { status: 400 }
        );
      }
      try {
        JSON.parse(avatars);
      } catch {
        return NextResponse.json(
          { error: 'avatars must be a valid JSON string' },
          { status: 400 }
        );
      }
      updateData.avatars = avatars;
    }

    if (titles !== undefined) {
      if (typeof titles !== 'string') {
        return NextResponse.json(
          { error: 'Invalid titles. Must be a JSON string.' },
          { status: 400 }
        );
      }
      try {
        JSON.parse(titles);
      } catch {
        return NextResponse.json(
          { error: 'titles must be a valid JSON string' },
          { status: 400 }
        );
      }
      updateData.titles = titles;
    }

    const profile = await prisma.profile.update({
      where: {
        userId: session.user.id,
      },
      data: updateData,
    });

    return NextResponse.json({ profile });
  } catch (error) {
    console.error('Error updating profile:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
