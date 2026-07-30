'use client';

import MissionProgress from './MissionProgress';
import RewardBadge from './RewardBadge';
import { getMissionTemplate } from '@/lib/progression/missionDefinitions';

interface Mission {
  id: string;
  type: string;
  missionId: string;
  progress: number;
  goal: number;
  completed: boolean;
  claimed: boolean;
  expiresAt: string;
}

interface MissionCardProps {
  mission: Mission;
  onClaim: (missionId: string) => void;
  claiming: boolean;
}

export default function MissionCard({ mission, onClaim, claiming }: MissionCardProps) {
  const template = getMissionTemplate(mission.missionId);

  if (!template) {
    return null;
  }

  const timeRemaining = new Date(mission.expiresAt).getTime() - Date.now();
  const hoursRemaining = Math.floor(timeRemaining / (1000 * 60 * 60));

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border-2 border-gray-200 hover:border-blue-400 transition-colors">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-bold text-gray-800">{template.name}</h3>
          <p className="text-sm text-gray-600 mt-1">{template.description}</p>
        </div>
        <div className="text-xs text-gray-500 text-right">
          <div>{mission.type === 'daily' ? '📅 Daily' : '🗓️ Weekly'}</div>
          <div className="mt-1">{hoursRemaining}h left</div>
        </div>
      </div>

      <MissionProgress progress={mission.progress} goal={mission.goal} />

      <div className="mt-4 flex items-center justify-between">
        <div className="flex gap-2">
          {template.rewards.map((reward, index) => (
            <RewardBadge key={index} reward={reward} />
          ))}
        </div>

        {mission.completed && !mission.claimed && (
          <button
            onClick={() => onClaim(mission.id)}
            disabled={claiming}
            className="px-4 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed animate-pulse"
          >
            {claiming ? 'Claiming...' : 'Claim'}
          </button>
        )}

        {mission.claimed && (
          <div className="px-4 py-2 bg-gray-300 text-gray-600 font-bold rounded-lg">
            Claimed ✓
          </div>
        )}

        {!mission.completed && (
          <div className="px-4 py-2 bg-gray-200 text-gray-500 font-bold rounded-lg">
            In Progress
          </div>
        )}
      </div>
    </div>
  );
}
