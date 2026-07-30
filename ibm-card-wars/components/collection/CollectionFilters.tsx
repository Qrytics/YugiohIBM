'use client';

interface CollectionFiltersProps {
  selectedProfession: string;
  selectedRarity: string;
  searchTerm: string;
  onProfessionChange: (profession: string) => void;
  onRarityChange: (rarity: string) => void;
  onSearchChange: (term: string) => void;
}

const PROFESSIONS = ['all', 'warrior', 'thief', 'cleric', 'mage'];
const RARITIES = ['all', 'common', 'rare', 'epic', 'legendary'];

export default function CollectionFilters({
  selectedProfession,
  selectedRarity,
  searchTerm,
  onProfessionChange,
  onRarityChange,
  onSearchChange,
}: CollectionFiltersProps) {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Profession
          </label>
          <select
            value={selectedProfession}
            onChange={(e) => onProfessionChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {PROFESSIONS.map((prof) => (
              <option key={prof} value={prof}>
                {prof.charAt(0).toUpperCase() + prof.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Rarity
          </label>
          <select
            value={selectedRarity}
            onChange={(e) => onRarityChange(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {RARITIES.map((rarity) => (
              <option key={rarity} value={rarity}>
                {rarity.charAt(0).toUpperCase() + rarity.slice(1)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Search
          </label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Card name..."
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>
    </div>
  );
}
