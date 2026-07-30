'use client';

import Image from 'next/image';

interface LeaderboardEntry {
  rank: number;
  userId: string;
  name: string;
  image: string | null;
  level: number;
  mmr: number;
  rankName: string;
  rankDisplayName: string;
  rankIcon: string;
  wins: number;
  losses: number;
  winRate: number;
}

interface LeaderboardTableProps {
  leaderboard: LeaderboardEntry[];
  currentUserId?: string;
  userRank?: number | null;
}

const RANK_COLORS: Record<string, string> = {
  bronze: 'text-orange-600',
  silver: 'text-gray-400',
  gold: 'text-yellow-500',
  platinum: 'text-cyan-400',
  diamond: 'text-blue-500',
  master: 'text-purple-600',
  grandmaster: 'text-red-600',
};

export default function LeaderboardTable({
  leaderboard,
  currentUserId,
  userRank,
}: LeaderboardTableProps) {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <tr>
              <th className="px-4 py-3 text-left font-bold">Rank</th>
              <th className="px-4 py-3 text-left font-bold">Player</th>
              <th className="px-4 py-3 text-center font-bold">Level</th>
              <th className="px-4 py-3 text-center font-bold">Rank</th>
              <th className="px-4 py-3 text-right font-bold">MMR</th>
              <th className="px-4 py-3 text-center font-bold">W/L</th>
              <th className="px-4 py-3 text-right font-bold">Win Rate</th>
            </tr>
          </thead>
          <tbody>
            {leaderboard.map((entry) => {
              const isCurrentUser = entry.userId === currentUserId;
              const rankColor = RANK_COLORS[entry.rankName] || 'text-gray-600';

              return (
                <tr
                  key={entry.userId}
                  className={`border-b border-gray-200 hover:bg-gray-50 transition-colors ${
                    isCurrentUser ? 'bg-blue-50 border-blue-300' : ''
                  }`}
                >
                  {/* Rank */}
                  <td className="px-4 py-3">
                    <div
                      className={`font-bold text-lg ${
                        entry.rank === 1
                          ? 'text-yellow-500'
                          : entry.rank === 2
                          ? 'text-gray-400'
                          : entry.rank === 3
                          ? 'text-orange-600'
                          : 'text-gray-700'
                      }`}
                    >
                      {entry.rank === 1 && '🥇'}
                      {entry.rank === 2 && '🥈'}
                      {entry.rank === 3 && '🥉'}
                      {entry.rank > 3 && `#${entry.rank}`}
                    </div>
                  </td>

                  {/* Player */}
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      {entry.image ? (
                        <Image
                          src={entry.image}
                          alt={entry.name}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="font-bold text-gray-600">
                            {entry.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <div>
                        <div className="font-semibold text-gray-800">
                          {entry.name}
                          {isCurrentUser && (
                            <span className="ml-2 text-xs bg-blue-600 text-white px-2 py-1 rounded-full">
                              You
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Level */}
                  <td className="px-4 py-3 text-center">
                    <span className="inline-block bg-yellow-400 text-yellow-900 font-bold px-3 py-1 rounded-full text-sm">
                      {entry.level}
                    </span>
                  </td>

                  {/* Rank */}
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span className="text-2xl">{entry.rankIcon}</span>
                      <span className={`font-semibold ${rankColor}`}>
                        {entry.rankDisplayName}
                      </span>
                    </div>
                  </td>

                  {/* MMR */}
                  <td className="px-4 py-3 text-right">
                    <span className="font-bold text-purple-600 text-lg">
                      {entry.mmr}
                    </span>
                  </td>

                  {/* W/L */}
                  <td className="px-4 py-3 text-center">
                    <div className="text-sm">
                      <span className="text-green-600 font-semibold">
                        {entry.wins}
                      </span>
                      <span className="text-gray-400 mx-1">/</span>
                      <span className="text-red-600 font-semibold">
                        {entry.losses}
                      </span>
                    </div>
                  </td>

                  {/* Win Rate */}
                  <td className="px-4 py-3 text-right">
                    <span className="font-semibold text-blue-600">
                      {entry.winRate}%
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {leaderboard.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          No players on the leaderboard yet. Be the first to play!
        </div>
      )}
    </div>
  );
}
