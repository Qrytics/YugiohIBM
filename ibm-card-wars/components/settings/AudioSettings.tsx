'use client';

import { useState, useEffect } from 'react';
import { soundManager } from '@/lib/audio/SoundManager';
import { musicManager } from '@/lib/audio/MusicManager';

export default function AudioSettings() {
  const [sfxVolume, setSfxVolume] = useState(0.7);
  const [sfxMuted, setSfxMuted] = useState(false);
  const [musicVolume, setMusicVolume] = useState(0.5);
  const [musicMuted, setMusicMuted] = useState(false);

  useEffect(() => {
    // Initialize audio managers
    soundManager.init();
    musicManager.init();

    // Load current settings
    setSfxVolume(soundManager.getVolume());
    setSfxMuted(soundManager.isMuted());
    setMusicVolume(musicManager.getVolume());
    setMusicMuted(musicManager.isMuted());
  }, []);

  const handleSfxVolumeChange = (value: number) => {
    setSfxVolume(value);
    soundManager.setVolume(value);
  };

  const handleSfxMuteToggle = () => {
    const newMuted = !sfxMuted;
    setSfxMuted(newMuted);
    soundManager.setMuted(newMuted);
  };

  const handleMusicVolumeChange = (value: number) => {
    setMusicVolume(value);
    musicManager.setVolume(value);
  };

  const handleMusicMuteToggle = () => {
    const newMuted = !musicMuted;
    setMusicMuted(newMuted);
    musicManager.setMuted(newMuted);
  };

  const handleTestSound = () => {
    soundManager.playTest();
  };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800 mb-4">Audio Settings</h2>

      {/* Sound Effects */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-700">Sound Effects</h3>
          <button
            onClick={handleSfxMuteToggle}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              sfxMuted
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            {sfxMuted ? '🔇 Muted' : '🔊 Unmuted'}
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-600">Volume</label>
              <span className="text-sm font-bold text-gray-700">
                {Math.round(sfxVolume * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={sfxVolume}
              onChange={(e) => handleSfxVolumeChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
              disabled={sfxMuted}
            />
          </div>

          <button
            onClick={handleTestSound}
            disabled={sfxMuted}
            className="w-full px-4 py-2 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Test Sound
          </button>
        </div>
      </div>

      {/* Background Music */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-700">Background Music</h3>
          <button
            onClick={handleMusicMuteToggle}
            className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
              musicMuted
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            {musicMuted ? '🔇 Muted' : '🎵 Playing'}
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-600">Volume</label>
              <span className="text-sm font-bold text-gray-700">
                {Math.round(musicVolume * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.01"
              value={musicVolume}
              onChange={(e) => handleMusicVolumeChange(parseFloat(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
              disabled={musicMuted}
            />
          </div>

          <div className="text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
            <p className="font-semibold mb-1">Note:</p>
            <p>
              Background music will play automatically during gameplay. Use these controls
              to adjust volume or mute music entirely.
            </p>
          </div>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <span className="font-semibold">💡 Tip:</span> Your audio settings are saved
          automatically and will persist across sessions.
        </p>
      </div>
    </div>
  );
}
