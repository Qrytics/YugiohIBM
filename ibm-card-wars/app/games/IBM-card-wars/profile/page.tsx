import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import ProfileHeader from '@/components/profile/ProfileHeader';
import StatsCard from '@/components/profile/StatsCard';
import XPBar from '@/components/profile/XPBar';
import RankBadge from '@/components/profile/RankBadge';
import { getProgressToNextLevel } from '@/lib/progression/levelSystem';

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/api/auth/signin');
  }

  const profile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
    include: {
      user: {
        select: {
          name: true,
          image: true,
        },
      },
    },
  });

  if (!profile) {
    return (
      <div className="container mx-auto p-4">
        <p className="text-center text-red-500">Profile not found</p>
      </div>
    );
  }

  const progress = getProgressToNextLevel(profile.xp);

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <ProfileHeader
        name={profile.user.name || 'Player'}
        level={profile.level}
        avatar={profile.user.image}
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <StatsCard wins={profile.wins} losses={profile.losses} mmr={profile.mmr} />
        <RankBadge mmr={profile.mmr} />
      </div>

      <XPBar
        currentXP={progress.progressXP}
        requiredXP={progress.requiredXP}
        percent={progress.percent}
        currentLevel={profile.level}
        nextLevel={progress.nextLevel}
      />
    </div>
  );
}
