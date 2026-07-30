import Image from 'next/image';

interface PlayerRankCardProps {
  rank: number | null;
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
  totalPlayers: number;
}

const RANK_COLORS: Record<string, string> = {
  bronze: 'from-orange-700 to-orange-900',
  silver: 'from-gray-400 to-gray-600',
  gold: 'from-yellow-400 to-yellow-600',
  platinum: 'from-cyan-400 to-cyan-600',
  diamond: 'from-blue-400 to-blue-600',
  master: 'from-purple-500 to-purple-700',
  grandmaster: 'from-red-500 to-red-700',
};

export default function PlayerRankCard({
  rank,
  name,
  image,
  level,
  mmr,
  rankName,
  rankDisplayName,
  rankIcon,
  wins,
  losses,
  winRate,
  totalPlayers,
}: PlayerRankCardProps) {
  const gradient = RANK_COLORS[rankName] || 'from-gray-400 to-gray-600';

  return (
    <div className={`bg-gradient-to-br ${gradient} rounded-lg p-6 text-white shadow-xl mb-6`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {image ? (
            <Image
              src={image}
              alt={name}
              width={60}
              height={60}
              className="rounded-full border-4 border-white shadow-md"
            />
          ) : (
            <div className="w-15 h-15 rounded-full bg-white bg-opacity-20 flex items-center justify-center border-4 border-white shadow-md">
              <span className="text-2xl font-bold">{name.charAt(0).toUpperCase()}</span>
            </div>
          )}
          <div>
            <h2 className="text-2xl font-bold">{name}</h2>
            <p className="text-white opacity-90">Level {level}</p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-5xl mb-2">{rankIcon}</div>
          <p className="text-xl font-bold">{rankDisplayName}</p>
          {rank && (
            <p className="text-sm opacity-90">
              Rank #{rank} of {totalPlayers}
            </p>
          )}
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mt-6 bg-white bg-opacity-10 rounded-lg p-4">
        <div className="text-center">
          <div className="text-3xl font-bold">{mmr}</div>
          <div className="text-xs opacity-80 mt-1">MMR</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-green-300">{wins}</div>
          <div className="text-xs opacity-80 mt-1">Wins</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-red-300">{losses}</div>
          <div className="text-xs opacity-80 mt-1">Losses</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-bold text-blue-300">{winRate}%</div>
          <div className="text-xs opacity-80 mt-1">Win Rate</div>
        </div>
      </div>
    </div>
  );
}
