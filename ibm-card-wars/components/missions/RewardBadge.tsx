interface Reward {
  type: 'pack' | 'xp';
  packType?: string;
  quantity?: number;
  amount?: number;
}

interface RewardBadgeProps {
  reward: Reward;
}

const PACK_ICONS: Record<string, string> = {
  standard: '📦',
  rare: '🎁',
  epic: '💎',
};

export default function RewardBadge({ reward }: RewardBadgeProps) {
  if (reward.type === 'pack') {
    return (
      <div className="flex items-center gap-1 px-3 py-1 bg-purple-100 border border-purple-300 rounded-full text-sm">
        <span>{PACK_ICONS[reward.packType || 'standard']}</span>
        <span className="font-semibold text-purple-700">
          {reward.quantity}x {reward.packType}
        </span>
      </div>
    );
  }

  if (reward.type === 'xp') {
    return (
      <div className="flex items-center gap-1 px-3 py-1 bg-blue-100 border border-blue-300 rounded-full text-sm">
        <span>⭐</span>
        <span className="font-semibold text-blue-700">+{reward.amount} XP</span>
      </div>
    );
  }

  return null;
}
