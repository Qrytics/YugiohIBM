'use client';

interface Pack {
  id: string;
  type: string;
  source: string;
  createdAt: string;
}

interface PackInventoryProps {
  packs: Pack[];
  onOpenPack: (packId: string) => void;
}

const PACK_ICONS: Record<string, string> = {
  standard: '📦',
  rare: '🎁',
  epic: '💎',
};

const PACK_COLORS: Record<string, string> = {
  standard: 'from-gray-400 to-gray-600',
  rare: 'from-blue-400 to-blue-600',
  epic: 'from-purple-500 to-purple-700',
};

export default function PackInventory({ packs, onOpenPack }: PackInventoryProps) {
  if (packs.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-6xl mb-4">📭</p>
        <p className="text-gray-500 text-lg">No unopened packs</p>
        <p className="text-gray-400 text-sm mt-2">
          Level up or complete missions to earn packs!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {packs.map((pack) => (
        <button
          key={pack.id}
          onClick={() => onOpenPack(pack.id)}
          className="group relative"
        >
          <div
            className={`bg-gradient-to-br ${
              PACK_COLORS[pack.type] || PACK_COLORS.standard
            } rounded-lg p-8 shadow-lg transition-all hover:scale-105 hover:shadow-xl`}
          >
            <div className="text-center">
              <div className="text-6xl mb-4 animate-bounce">
                {PACK_ICONS[pack.type] || PACK_ICONS.standard}
              </div>
              <h3 className="text-xl font-bold text-white mb-2">
                {pack.type.charAt(0).toUpperCase() + pack.type.slice(1)} Pack
              </h3>
              <p className="text-sm text-white opacity-80">Click to open</p>
            </div>
          </div>
          <div className="absolute inset-0 rounded-lg bg-white opacity-0 group-hover:opacity-20 transition-opacity pointer-events-none" />
        </button>
      ))}
    </div>
  );
}
