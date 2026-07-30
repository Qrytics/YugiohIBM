interface MissionProgressProps {
  progress: number;
  goal: number;
}

export default function MissionProgress({ progress, goal }: MissionProgressProps) {
  const percent = Math.min((progress / goal) * 100, 100);

  return (
    <div>
      <div className="flex justify-between text-sm text-gray-600 mb-1">
        <span>Progress</span>
        <span>
          {progress} / {goal}
        </span>
      </div>
      <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-300"
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}
