interface StatsCardProps {
  wins: number;
  losses: number;
  mmr: number;
}

export default function StatsCard({ wins, losses, mmr }: StatsCardProps) {
  const totalGames = wins + losses;
  const winRate = totalGames > 0 ? ((wins / totalGames) * 100).toFixed(1) : '0.0';

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Statistics</h2>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-500">Wins</p>
          <p className="text-2xl font-bold text-green-600">{wins}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Losses</p>
          <p className="text-2xl font-bold text-red-600">{losses}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Win Rate</p>
          <p className="text-2xl font-bold text-blue-600">{winRate}%</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">MMR</p>
          <p className="text-2xl font-bold text-purple-600">{mmr}</p>
        </div>
      </div>
    </div>
  );
}
