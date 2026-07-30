'use client';

import { useState, useEffect } from 'react';
import type { Card } from '@/lib/game-engine/types';

interface CardFilterProps {
  allCards: Card[];
  onFilterChange: (filtered: Card[]) => void;
}

export function CardFilter({ allCards, onFilterChange }: CardFilterProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [professionFilter, setProfessionFilter] = useState<string>('all');
  const [rarityFilter, setRarityFilter] = useState<string>('all');
  const [costFilter, setCostFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  useEffect(() => {
    let filtered = [...allCards];

    // Search by name
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((card) =>
        card.name.toLowerCase().includes(term) ||
        card.description.toLowerCase().includes(term)
      );
    }

    // Filter by profession
    if (professionFilter !== 'all') {
      filtered = filtered.filter((card) => card.profession === professionFilter);
    }

    // Filter by rarity
    if (rarityFilter !== 'all') {
      filtered = filtered.filter((card) => card.rarity === rarityFilter);
    }

    // Filter by cost
    if (costFilter !== 'all') {
      const cost = parseInt(costFilter);
      filtered = filtered.filter((card) => card.cost === cost);
    }

    // Filter by type
    if (typeFilter !== 'all') {
      filtered = filtered.filter((card) => card.type === typeFilter);
    }

    // Sort by cost, then name
    filtered.sort((a, b) => {
      if (a.cost !== b.cost) return a.cost - b.cost;
      return a.name.localeCompare(b.name);
    });

    onFilterChange(filtered);
  }, [searchTerm, professionFilter, rarityFilter, costFilter, typeFilter, allCards, onFilterChange]);

  const professions = ['all', 'neutral', 'cloud', 'ai', 'security', 'data', 'software', 'devops', 'ux', 'pm', 'business', 'sales', 'mainframe', 'sre'];
  const rarities = ['all', 'common', 'rare', 'epic', 'legendary', 'mythic'];
  const costs = ['all', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10'];
  const types = ['all', 'employee', 'tool', 'executive', 'incident', 'upgrade'];

  return (
    <div className="glass rounded-lg p-4">
      <h3 className="font-bold text-ibm-cyan mb-3">Filters</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Search */}
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search cards..."
          className="glass px-3 py-2 rounded bg-background border border-foreground/20 text-foreground text-sm focus:border-ibm-cyan outline-none"
        />

        {/* Profession */}
        <select
          value={professionFilter}
          onChange={(e) => setProfessionFilter(e.target.value)}
          className="glass px-3 py-2 rounded bg-background border border-foreground/20 text-foreground text-sm outline-none capitalize"
        >
          {professions.map((prof) => (
            <option key={prof} value={prof} className="capitalize">
              {prof}
            </option>
          ))}
        </select>

        {/* Rarity */}
        <select
          value={rarityFilter}
          onChange={(e) => setRarityFilter(e.target.value)}
          className="glass px-3 py-2 rounded bg-background border border-foreground/20 text-foreground text-sm outline-none capitalize"
        >
          {rarities.map((rarity) => (
            <option key={rarity} value={rarity} className="capitalize">
              {rarity}
            </option>
          ))}
        </select>

        {/* Cost */}
        <select
          value={costFilter}
          onChange={(e) => setCostFilter(e.target.value)}
          className="glass px-3 py-2 rounded bg-background border border-foreground/20 text-foreground text-sm outline-none"
        >
          <option value="all">All Costs</option>
          {costs.slice(1).map((cost) => (
            <option key={cost} value={cost}>
              {cost} Mana
            </option>
          ))}
        </select>

        {/* Type */}
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          className="glass px-3 py-2 rounded bg-background border border-foreground/20 text-foreground text-sm outline-none capitalize"
        >
          {types.map((type) => (
            <option key={type} value={type} className="capitalize">
              {type}
            </option>
          ))}
        </select>
      </div>

      {/* Active filters display */}
      {(searchTerm || professionFilter !== 'all' || rarityFilter !== 'all' || costFilter !== 'all' || typeFilter !== 'all') && (
        <div className="flex flex-wrap gap-2 mt-3">
          {searchTerm && (
            <span className="glass px-2 py-1 rounded text-xs text-foreground/70">
              Search: "{searchTerm}"
            </span>
          )}
          {professionFilter !== 'all' && (
            <span className="glass px-2 py-1 rounded text-xs text-ibm-cyan capitalize">
              {professionFilter}
            </span>
          )}
          {rarityFilter !== 'all' && (
            <span className="glass px-2 py-1 rounded text-xs text-ibm-purple capitalize">
              {rarityFilter}
            </span>
          )}
          {costFilter !== 'all' && (
            <span className="glass px-2 py-1 rounded text-xs text-mana">
              {costFilter} mana
            </span>
          )}
          {typeFilter !== 'all' && (
            <span className="glass px-2 py-1 rounded text-xs text-foreground/70 capitalize">
              {typeFilter}
            </span>
          )}
          <button
            onClick={() => {
              setSearchTerm('');
              setProfessionFilter('all');
              setRarityFilter('all');
              setCostFilter('all');
              setTypeFilter('all');
            }}
            className="glass px-2 py-1 rounded text-xs text-error-red hover:bg-error-red hover:text-background transition-colors"
          >
            Clear All
          </button>
        </div>
      )}
    </div>
  );
}
