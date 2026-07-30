'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import MissionCard from '@/components/missions/MissionCard';

interface Mission {
  id: string;
  type: string;
  missionId: string;
  progress: number;
  goal: number;
  completed: boolean;
  claimed: boolean;
  expiresAt: string;
}

export default function MissionsPage() {
  const { data: session, status } = useSession();
  const [missions, setMissions] = useState<{ daily: Mission[]; weekly: Mission[] }>({
    daily: [],
    weekly: [],
  });
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/api/auth/signin');
    }

    if (status === 'authenticated') {
      initializeMissions();
    }
  }, [status]);

  const initializeMissions = async () => {
    try {
      await fetch('/api/missions/generate', { method: 'POST' });
      fetchMissions();
    } catch (error) {
      console.error('Failed to initialize missions:', error);
      setLoading(false);
    }
  };

  const fetchMissions = async () => {
    try {
      const res = await fetch('/api/missions');
      const data = await res.json();
      setMissions(data);
    } catch (error) {
      console.error('Failed to fetch missions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClaim = async (missionId: string) => {
    setClaiming(missionId);
    try {
      const res = await fetch(`/api/missions/${missionId}/claim`, {
        method: 'POST',
      });

      if (!res.ok) {
        const error = await res.json();
        alert(error.error || 'Failed to claim mission');
        return;
      }

      const data = await res.json();
      alert(
        `Rewards claimed! ${data.rewards
          .map((r: any) =>
            r.type === 'pack'
              ? `${r.quantity}x ${r.packType} pack`
              : `+${r.amount} XP`
          )
          .join(', ')}`
      );

      fetchMissions();
    } catch (error) {
      console.error('Failed to claim mission:', error);
      alert('Failed to claim mission');
    } finally {
      setClaiming(null);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-4 text-center">
        <p className="text-gray-500">Loading missions...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Missions</h1>

      <div className="mb-8">
        <h2 className="text-2xl font-bold text-gray-700 mb-4">📅 Daily Missions</h2>
        {missions.daily.length === 0 ? (
          <p className="text-gray-500">No daily missions available</p>
        ) : (
          <div className="space-y-4">
            {missions.daily.map((mission) => (
              <MissionCard
                key={mission.id}
                mission={mission}
                onClaim={handleClaim}
                claiming={claiming === mission.id}
              />
            ))}
          </div>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-700 mb-4">🗓️ Weekly Missions</h2>
        {missions.weekly.length === 0 ? (
          <p className="text-gray-500">No weekly missions available</p>
        ) : (
          <div className="space-y-4">
            {missions.weekly.map((mission) => (
              <MissionCard
                key={mission.id}
                mission={mission}
                onClaim={handleClaim}
                claiming={claiming === mission.id}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
