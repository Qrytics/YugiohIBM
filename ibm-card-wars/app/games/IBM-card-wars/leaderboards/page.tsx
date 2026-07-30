import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { getRankFromMMR } from '@/lib/progression/rankSystem';
import LeaderboardTable from '@/components/leaderboards/LeaderboardTable';
import PlayerRankCard from '@/components/leaderboards/PlayerRankCard';

export default async function LeaderboardsPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/api/auth/signin');
  }

  // Fetch leaderboard data
  const response = await fetch(
    `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/api/leaderboards?limit=100`,
    { cache: 'no-store' }
  );

  const data = await response.json();

  // Fetch current user's profile for rank card
  const userProfile = await prisma.profile.findUnique({
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

  if (!userProfile) {
    return (
      <div className="container mx-auto p-4">
        <p className="text-center text-red-500">Profile not found</p>
      </div>
    );
  }

  const totalGames = userProfile.wins + userProfile.losses;
  const winRate = totalGames > 0 ? (userProfile.wins / totalGames) * 100 : 0;
  const rankInfo = getRankFromMMR(userProfile.mmr);

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">Leaderboards</h1>

      {/* Current User's Rank Card */}
      <PlayerRankCard
        rank={data.userRank}
        name={userProfile.user.name || 'Player'}
        image={userProfile.user.image}
        level={userProfile.level}
        mmr={userProfile.mmr}
        rankName={rankInfo.name}
        rankDisplayName={rankInfo.displayName}
        rankIcon={rankInfo.icon}
        wins={userProfile.wins}
        losses={userProfile.losses}
        winRate={parseFloat(winRate.toFixed(1))}
        totalPlayers={data.totalPlayers}
      />

      {/* Leaderboard Table */}
      <div className="mb-4 flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-700">Top Players</h2>
        <p className="text-sm text-gray-600">
          {data.totalPlayers} total {data.totalPlayers === 1 ? 'player' : 'players'}
        </p>
      </div>

      <LeaderboardTable
        leaderboard={data.leaderboard}
        currentUserId={session.user.id}
        userRank={data.userRank}
      />
    </div>
  );
}
