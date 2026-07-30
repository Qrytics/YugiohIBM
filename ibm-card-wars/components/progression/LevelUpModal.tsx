'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Confetti from 'react-confetti';
import { soundManager } from '@/lib/audio/SoundManager';

interface LevelUpModalProps {
  oldLevel: number;
  newLevel: number;
  rewards: Array<{ type: string; packType?: string; quantity?: number }>;
  onClose: () => void;
}

export default function LevelUpModal({
  oldLevel,
  newLevel,
  rewards,
  onClose,
}: LevelUpModalProps) {
  const [displayLevel, setDisplayLevel] = useState(oldLevel);
  const [showRewards, setShowRewards] = useState(false);

  useEffect(() => {
    // Play level-up sound
    soundManager.play('level-up');

    // Animate level number counting up
    let current = oldLevel;
    const interval = setInterval(() => {
      if (current < newLevel) {
        current++;
        setDisplayLevel(current);
      } else {
        clearInterval(interval);
        // Show rewards after level animation completes
        setTimeout(() => setShowRewards(true), 500);
      }
    }, 100);

    return () => clearInterval(interval);
  }, [oldLevel, newLevel]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <Confetti
        width={window.innerWidth}
        height={window.innerHeight}
        recycle={false}
        numberOfPieces={400}
        gravity={0.2}
      />

      <motion.div
        initial={{ scale: 0.5, opacity: 0, rotateX: -90 }}
        animate={{ scale: 1, opacity: 1, rotateX: 0 }}
        transition={{ duration: 0.6, type: 'spring', stiffness: 200 }}
        className="bg-white rounded-2xl p-8 max-w-md w-full text-center relative overflow-hidden shadow-2xl"
      >
        {/* Animated background gradient */}
        <motion.div
          animate={{
            background: [
              'linear-gradient(45deg, #fbbf24, #a855f7, #3b82f6)',
              'linear-gradient(135deg, #3b82f6, #fbbf24, #a855f7)',
              'linear-gradient(225deg, #a855f7, #3b82f6, #fbbf24)',
              'linear-gradient(315deg, #fbbf24, #a855f7, #3b82f6)',
            ],
          }}
          transition={{ duration: 4, repeat: Infinity, ease: 'linear' }}
          className="absolute inset-0 opacity-20"
        />

        <div className="relative z-10">
          {/* Title */}
          <motion.h2
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, type: 'spring' }}
            className="text-5xl font-bold mb-6"
          >
            <motion.span
              animate={{
                backgroundImage: [
                  'linear-gradient(to right, #fbbf24, #a855f7)',
                  'linear-gradient(to right, #a855f7, #3b82f6)',
                  'linear-gradient(to right, #3b82f6, #fbbf24)',
                  'linear-gradient(to right, #fbbf24, #a855f7)',
                ],
              }}
              transition={{ duration: 3, repeat: Infinity }}
              className="bg-clip-text text-transparent"
            >
              LEVEL UP!
            </motion.span>
          </motion.h2>

          {/* Level display with count-up animation */}
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.5, type: 'spring', stiffness: 200 }}
            className="mb-4"
          >
            <motion.div
              animate={{
                scale: displayLevel === newLevel ? [1, 1.2, 1] : 1,
              }}
              transition={{ duration: 0.3 }}
              className="text-7xl font-bold bg-gradient-to-r from-yellow-500 via-purple-600 to-blue-600 bg-clip-text text-transparent"
            >
              {displayLevel}
            </motion.div>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="text-xl text-gray-700 mb-6 font-semibold"
          >
            Congratulations on reaching level {newLevel}!
          </motion.p>

          {/* Rewards section */}
          <AnimatePresence>
            {showRewards && rewards.length > 0 && (
              <motion.div
                initial={{ y: 50, opacity: 0, scale: 0.8 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: -50, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-6 mb-6 border-2 border-purple-300 shadow-lg"
              >
                <motion.h3
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2, type: 'spring' }}
                  className="text-xl font-bold text-purple-800 mb-4"
                >
                  🎉 Rewards Unlocked!
                </motion.h3>
                <div className="space-y-3">
                  {rewards.map((reward, index) => (
                    <motion.div
                      key={index}
                      initial={{ x: -50, opacity: 0 }}
                      animate={{ x: 0, opacity: 1 }}
                      transition={{ delay: 0.3 + index * 0.1, type: 'spring' }}
                      className="flex items-center justify-center gap-3 bg-white rounded-lg p-3 shadow"
                    >
                      {reward.type === 'pack' && (
                        <>
                          <motion.span
                            animate={{ rotate: [0, 10, -10, 0] }}
                            transition={{ duration: 0.5, repeat: Infinity, delay: index * 0.2 }}
                            className="text-3xl"
                          >
                            🎁
                          </motion.span>
                          <span className="font-bold text-purple-700 text-lg">
                            {reward.quantity}x {reward.packType} Pack
                          </span>
                        </>
                      )}
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Continue button */}
          <motion.button
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: showRewards ? 1.2 : 0.8 }}
            onClick={onClose}
            whileHover={{ scale: 1.05, boxShadow: '0 10px 40px rgba(139, 92, 246, 0.4)' }}
            whileTap={{ scale: 0.95 }}
            className="px-10 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-blue-600 text-white font-bold rounded-xl shadow-lg transition-all text-lg"
          >
            Awesome! 🚀
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
