'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import CollectionGrid from '@/components/collection/CollectionGrid';
import CollectionFilters from '@/components/collection/CollectionFilters';
import { getAllCards } from '@/lib/cards/cardData';

interface CardOwnership {
  cardId: string;
  quantity: number;
}

export default function CollectionPage() {
  const { data: session, status } = useSession();
  const [ownership, setOwnership] = useState<CardOwnership[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProfession, setSelectedProfession] = useState('all');
  const [selectedRarity, setSelectedRarity] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/api/auth/signin');
    }

    if (status === 'authenticated') {
      fetchCollection();
    }
  }, [status]);

  const fetchCollection = async () => {
    try {
      const res = await fetch('/api/collection');
      const data = await res.json();
      setOwnership(data.cards || []);
    } catch (error) {
      console.error('Failed to fetch collection:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p className="text-gray-500">Loading collection...</p>
      </div>
    );
  }

  const allCards = getAllCards();
  const ownedCardIds = new Set(ownership.map((o) => o.cardId));

  let filteredCards = allCards.map((card) => ({
    card,
    quantity: ownership.find((o) => o.cardId === card.id)?.quantity || 0,
    owned: ownedCardIds.has(card.id),
  }));

  if (selectedProfession !== 'all') {
    filteredCards = filteredCards.filter(
      (item) => item.card.profession === selectedProfession
    );
  }

  if (selectedRarity !== 'all') {
    filteredCards = filteredCards.filter(
      (item) => item.card.rarity === selectedRarity
    );
  }

  if (searchTerm) {
    const term = searchTerm.toLowerCase();
    filteredCards = filteredCards.filter((item) =>
      item.card.name.toLowerCase().includes(term)
    );
  }

  const ownedCount = filteredCards.filter((item) => item.owned).length;
  const totalCount = filteredCards.length;

  return (
    <div className="container mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Card Collection</h1>
        <p className="text-gray-600">
          {ownedCount} / {totalCount} cards owned ({((ownedCount / totalCount) * 100).toFixed(1)}%)
        </p>
      </div>

      <CollectionFilters
        selectedProfession={selectedProfession}
        selectedRarity={selectedRarity}
        searchTerm={searchTerm}
        onProfessionChange={setSelectedProfession}
        onRarityChange={setSelectedRarity}
        onSearchChange={setSearchTerm}
      />

      <CollectionGrid cards={filteredCards} />
    </div>
  );
}
