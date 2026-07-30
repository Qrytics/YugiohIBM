import { getRankFromMMR, getProgressToNextRank } from '@/lib/progression/rankSystem';

interface RankBadgeProps {
  mmr: number;
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

export default function RankBadge({ mmr }: RankBadgeProps) {
  const rankInfo = getRankFromMMR(mmr);
  const progress = getProgressToNextRank(mmr);
  const gradient = RANK_COLORS[rankInfo.name] || 'from-gray-400 to-gray-600';

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Rank</h2>
      <div className={`bg-gradient-to-br ${gradient} rounded-lg p-6 text-center`}>
        <div className="text-5xl mb-2">{rankInfo.icon}</div>
        <h3 className="text-2xl font-bold text-white mb-1">
          {rankInfo.displayName}
        </h3>
        <p className="text-sm text-white opacity-90">
          {rankInfo.minMMR} - {rankInfo.maxMMR} MMR
        </p>
      </div>
      {progress.nextRank && (
        <div className="mt-4">
          <div className="flex justify-between text-sm text-gray-600 mb-1">
            <span>Progress to {progress.nextRank.displayName}</span>
            <span>{progress.percent}%</span>
          </div>
          <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full bg-gradient-to-r ${gradient} transition-all duration-300`}
              style={{ width: `${progress.percent}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-1 text-center">
            {progress.progressMMR} / {progress.nextRank.minMMR - rankInfo.minMMR} MMR
          </p>
        </div>
      )}
    </div>
  );
}
