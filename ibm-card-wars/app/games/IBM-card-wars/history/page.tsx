'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import Image from 'next/image';

interface MatchHistoryEntry {
  id: string;
  date: string;
  opponent: {
    name: string;
    image: string | null;
  };
  result: 'win' | 'loss';
  duration: number;
  turns: number;
  userDeck: string;
  opponentDeck: string;
  mmrChange: number;
  xpGained: number;
}

export default function MatchHistoryPage() {
  const { data: session, status } = useSession();
  const [history, setHistory] = useState<MatchHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/api/auth/signin');
    }

    if (status === 'authenticated') {
      fetchHistory();
    }
  }, [status]);

  const fetchHistory = async () => {
    try {
      const res = await fetch('/api/matches/history?limit=50');
      const data = await res.json();
      setHistory(data.history || []);
    } catch (error) {
      console.error('Failed to fetch match history:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p className="text-gray-500">Loading match history...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <h1 className="text-4xl font-bold text-gray-800 mb-6">Match History</h1>

      {history.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg shadow-md">
          <p className="text-gray-500 text-lg">No matches played yet</p>
          <p className="text-gray-400 text-sm mt-2">
            Your match history will appear here after you play your first game!
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                <tr>
                  <th className="px-4 py-3 text-left font-bold">Date</th>
                  <th className="px-4 py-3 text-left font-bold">Opponent</th>
                  <th className="px-4 py-3 text-center font-bold">Result</th>
                  <th className="px-4 py-3 text-left font-bold">Decks</th>
                  <th className="px-4 py-3 text-center font-bold">Duration</th>
                  <th className="px-4 py-3 text-center font-bold">Turns</th>
                  <th className="px-4 py-3 text-right font-bold">MMR</th>
                  <th className="px-4 py-3 text-right font-bold">XP</th>
                </tr>
              </thead>
              <tbody>
                {history.map((match) => (
                  <tr
                    key={match.id}
                    className="border-b border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    {/* Date */}
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {formatDate(match.date)}
                    </td>

                    {/* Opponent */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        {match.opponent.image ? (
                          <Image
                            src={match.opponent.image}
                            alt={match.opponent.name}
                            width={32}
                            height={32}
                            className="rounded-full"
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center">
                            <span className="font-bold text-xs text-gray-600">
                              {match.opponent.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <span className="font-semibold text-gray-800">
                          {match.opponent.name}
                        </span>
                      </div>
                    </td>

                    {/* Result */}
                    <td className="px-4 py-3 text-center">
                      <span
                        className={`inline-block px-3 py-1 rounded-full font-bold text-sm ${
                          match.result === 'win'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {match.result === 'win' ? 'Victory' : 'Defeat'}
                      </span>
                    </td>

                    {/* Decks */}
                    <td className="px-4 py-3 text-sm">
                      <div className="text-gray-700">
                        <div>
                          <span className="font-semibold">You:</span>{' '}
                          {match.userDeck}
                        </div>
                        <div className="text-gray-500">
                          <span className="font-semibold">Opp:</span>{' '}
                          {match.opponentDeck}
                        </div>
                      </div>
                    </td>

                    {/* Duration */}
                    <td className="px-4 py-3 text-center text-gray-600 font-mono">
                      {formatDuration(match.duration)}
                    </td>

                    {/* Turns */}
                    <td className="px-4 py-3 text-center text-gray-600 font-semibold">
                      {match.turns}
                    </td>

                    {/* MMR Change */}
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`font-bold ${
                          match.mmrChange >= 0
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}
                      >
                        {match.mmrChange >= 0 ? '+' : ''}
                        {match.mmrChange}
                      </span>
                    </td>

                    {/* XP Gained */}
                    <td className="px-4 py-3 text-right">
                      <span className="font-bold text-blue-600">
                        +{match.xpGained}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="mt-4 text-center text-sm text-gray-500">
        Showing last {history.length} {history.length === 1 ? 'match' : 'matches'}
      </div>
    </div>
  );
}
