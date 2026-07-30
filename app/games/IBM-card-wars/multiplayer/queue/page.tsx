'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { MatchmakingQueue } from '@/components/multiplayer/MatchmakingQueue';

export default function MultiplayerQueuePage() {
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const [decks, setDecks] = useState<any[]>([]);
  const [selectedDeck, setSelectedDeck] = useState<string | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [inQueue, setInQueue] = useState(false);

  useEffect(() => {
    if (sessionStatus === 'loading') return;

    if (sessionStatus === 'unauthenticated') {
      router.push('/auth/signin');
      return;
    }

    // Load user's decks and profile
    Promise.all([
      fetch('/api/decks').then((res) => res.json()),
      fetch('/api/profile').then((res) => res.json()),
    ])
      .then(([decksData, profileData]) => {
        setDecks(decksData);
        setProfile(profileData);

        // Auto-select first deck
        if (decksData.length > 0) {
          setSelectedDeck(decksData[0].id);
        }
      })
      .catch((err) => {
        console.error('Error loading data:', err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [sessionStatus, router]);

  const handleFindMatch = () => {
    if (!selectedDeck) {
      alert('Please select a deck');
      return;
    }
    setInQueue(true);
  };

  const handleCancelQueue = () => {
    setInQueue(false);
  };

  if (sessionStatus === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin h-12 w-12 border-4 border-ibm-cyan border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (inQueue && selectedDeck) {
    return <MatchmakingQueue deckId={selectedDeck} onCancel={handleCancelQueue} />;
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">
            <span className="bg-gradient-to-r from-ibm-blue via-ibm-cyan to-ibm-purple bg-clip-text text-transparent">
              Ranked Match
            </span>
          </h1>
          <p className="text-foreground/70">Compete against players worldwide</p>
        </div>

        {/* Profile Card */}
        {profile && (
          <div className="glass-strong rounded-xl p-6 mb-8">
            <div className="flex items-center gap-6">
              <div className="h-20 w-20 bg-gradient-to-br from-ibm-cyan to-ibm-purple rounded-full flex items-center justify-center text-3xl font-bold">
                {profile.user?.name?.[0]?.toUpperCase() || 'P'}
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-1">{profile.user?.name || 'Player'}</h2>
                <div className="flex gap-4 text-sm">
                  <span className="text-foreground/70">
                    Level <span className="text-ibm-cyan font-bold">{profile.level}</span>
                  </span>
                  <span className="text-foreground/70">
                    Rank:{' '}
                    <span className="text-ibm-cyan font-bold capitalize">{profile.rank}</span>
                  </span>
                  <span className="text-foreground/70">
                    MMR <span className="text-ibm-cyan font-bold">{profile.mmr}</span>
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-success-green">{profile.wins}</div>
                <div className="text-sm text-foreground/60">Wins</div>
              </div>
              <div className="text-right">
                <div className="text-3xl font-bold text-error-red">{profile.losses}</div>
                <div className="text-sm text-foreground/60">Losses</div>
              </div>
            </div>
          </div>
        )}

        {/* Deck Selection */}
        <div className="glass-strong rounded-xl p-6 mb-8">
          <h2 className="text-xl font-bold mb-4">Select Deck</h2>

          {decks.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-foreground/70 mb-4">You don't have any decks yet</p>
              <button
                onClick={() => router.push('/games/IBM-card-wars/deck-builder')}
                className="px-6 py-3 rounded-lg glass-strong border border-ibm-cyan text-ibm-cyan hover:bg-ibm-cyan hover:text-background transition-colors font-medium"
              >
                Build a Deck
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {decks.map((deck) => {
                const cardIds = JSON.parse(deck.cardIds);
                const isSelected = selectedDeck === deck.id;

                return (
                  <button
                    key={deck.id}
                    onClick={() => setSelectedDeck(deck.id)}
                    className={`glass rounded-lg p-4 text-left transition-all ${
                      isSelected
                        ? 'border-2 border-ibm-cyan bg-ibm-cyan/10'
                        : 'border border-foreground/20 hover:border-ibm-cyan/50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-bold">{deck.name}</h3>
                      {isSelected && (
                        <div className="h-6 w-6 rounded-full bg-ibm-cyan flex items-center justify-center">
                          <svg className="h-4 w-4 text-background" fill="currentColor" viewBox="0 0 20 20">
                            <path
                              fillRule="evenodd"
                              d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="text-sm text-foreground/60">{cardIds.length} cards</div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Find Match Button */}
        {decks.length > 0 && (
          <div className="flex gap-4">
            <button
              onClick={handleFindMatch}
              disabled={!selectedDeck}
              className="flex-1 px-8 py-4 rounded-lg glass-strong border-2 border-ibm-cyan text-ibm-cyan hover:bg-ibm-cyan hover:text-background transition-colors font-bold text-xl disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Find Match
            </button>
            <button
              onClick={() => router.push('/games/IBM-card-wars')}
              className="px-8 py-4 rounded-lg glass-strong border border-foreground/20 text-foreground/70 hover:border-ibm-cyan hover:text-ibm-cyan transition-colors font-medium"
            >
              Back
            </button>
          </div>
        )}

        {/* Info Box */}
        <div className="glass rounded-lg p-4 mt-8 border border-ibm-cyan/30">
          <h3 className="font-bold mb-2 text-ibm-cyan">How Ranked Works</h3>
          <ul className="text-sm text-foreground/70 space-y-1">
            <li>• Matchmaking pairs you with players of similar MMR (skill rating)</li>
            <li>• Win matches to gain MMR and climb the ranks</li>
            <li>• Ranks: Bronze → Silver → Gold → Platinum → Diamond → Master → Grandmaster</li>
            <li>• Earn XP, rewards, and climb the leaderboard</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
