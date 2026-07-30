interface XPBarProps {
  currentXP: number;
  requiredXP: number;
  percent: number;
  currentLevel: number;
  nextLevel: number;
}

export default function XPBar({
  currentXP,
  requiredXP,
  percent,
  currentLevel,
  nextLevel,
}: XPBarProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mt-4">
      <div className="flex justify-between items-center mb-2">
        <h2 className="text-lg font-bold text-gray-800">Experience</h2>
        <span className="text-sm text-gray-600">
          Level {currentLevel} → {nextLevel}
        </span>
      </div>
      <div className="relative w-full h-8 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500 ease-out"
          style={{ width: `${percent}%` }}
        />
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold text-white drop-shadow-md">
            {currentXP} / {requiredXP} XP
          </span>
        </div>
      </div>
      <p className="text-xs text-gray-500 mt-2 text-center">
        {requiredXP - currentXP} XP until next level
      </p>
    </div>
  );
}
