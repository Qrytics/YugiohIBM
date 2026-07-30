'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import PackInventory from '@/components/packs/PackInventory';
import PackOpeningModal from '@/components/packs/PackOpeningModal';
import { Card } from '@/lib/cards/types';

interface Pack {
  id: string;
  type: string;
  source: string;
  createdAt: string;
}

export default function PacksPage() {
  const { data: session, status } = useSession();
  const [packs, setPacks] = useState<Pack[]>([]);
  const [loading, setLoading] = useState(true);
  const [opening, setOpening] = useState<{ cards: Card[]; newCards: string[] } | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/api/auth/signin');
    }

    if (status === 'authenticated') {
      fetchPacks();
    }
  }, [status]);

  const fetchPacks = async () => {
    try {
      const res = await fetch('/api/packs');
      const data = await res.json();
      setPacks(data.packs || []);
    } catch (error) {
      console.error('Failed to fetch packs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenPack = async (packId: string) => {
    try {
      const res = await fetch('/api/packs/open', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ packId }),
      });

      if (!res.ok) {
        const error = await res.json();
        alert(error.error || 'Failed to open pack');
        return;
      }

      const data = await res.json();
      setOpening(data);
    } catch (error) {
      console.error('Failed to open pack:', error);
      alert('Failed to open pack');
    }
  };

  const handleCloseModal = () => {
    setOpening(null);
    fetchPacks();
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p className="text-gray-500">Loading packs...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Card Packs</h1>
      <PackInventory packs={packs} onOpenPack={handleOpenPack} />

      {opening && (
        <PackOpeningModal
          cards={opening.cards}
          newCards={opening.newCards}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
}
