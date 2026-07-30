'use client';

interface LevelUpModalProps {
  oldLevel: number;
  newLevel: number;
  rewards: Array<{ type: string; packType?: string; quantity?: number }>;
  onClose: () => void;
}

export default function LevelUpModal({
  oldLevel,
  newLevel,
  rewards,
  onClose,
}: LevelUpModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-200 via-purple-200 to-blue-200 opacity-30 animate-pulse" />

        <div className="relative z-10">
          <h2 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-500 via-purple-600 to-blue-600 mb-4 animate-bounce">
            LEVEL UP!
          </h2>

          <div className="text-6xl font-bold text-gray-800 mb-2">
            {oldLevel} → {newLevel}
          </div>

          <p className="text-lg text-gray-600 mb-6">
            Congratulations on reaching level {newLevel}!
          </p>

          {rewards.length > 0 && (
            <div className="bg-purple-50 rounded-lg p-4 mb-6 border-2 border-purple-300">
              <h3 className="text-lg font-bold text-purple-800 mb-2">Rewards</h3>
              <div className="space-y-2">
                {rewards.map((reward, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-center gap-2 text-purple-700"
                  >
                    {reward.type === 'pack' && (
                      <>
                        <span className="text-2xl">🎁</span>
                        <span className="font-semibold">
                          {reward.quantity}x {reward.packType} Pack
                        </span>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={onClose}
            className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white font-bold rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all transform hover:scale-105"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
