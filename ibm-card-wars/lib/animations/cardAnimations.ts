/**
 * Reusable Framer Motion animation variants for card interactions
 */

export const cardFlipVariants = {
  hidden: {
    rotateY: 180,
    opacity: 0,
    scale: 0.8,
  },
  visible: {
    rotateY: 0,
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.6,
      type: 'spring',
      stiffness: 120,
      damping: 15,
    },
  },
};

export const cardHoverVariants = {
  rest: {
    scale: 1,
    y: 0,
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  hover: {
    scale: 1.05,
    y: -5,
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)',
    transition: {
      duration: 0.2,
      type: 'spring',
      stiffness: 300,
    },
  },
  tap: {
    scale: 0.98,
    y: 0,
  },
};

export const cardDrawVariants = {
  hidden: {
    x: -100,
    opacity: 0,
    rotate: -10,
  },
  visible: (i: number) => ({
    x: 0,
    opacity: 1,
    rotate: 0,
    transition: {
      delay: i * 0.1,
      duration: 0.4,
      type: 'spring',
      stiffness: 200,
    },
  }),
};

export const cardPlayVariants = {
  inHand: {
    scale: 1,
    y: 0,
    rotate: 0,
  },
  playing: {
    scale: 1.2,
    y: -50,
    rotate: 10,
    transition: {
      duration: 0.3,
    },
  },
  onBoard: {
    scale: 1,
    y: 0,
    rotate: 0,
    transition: {
      duration: 0.4,
      type: 'spring',
    },
  },
};

export const damagePopupVariants = {
  hidden: {
    scale: 0,
    opacity: 0,
    y: 0,
  },
  visible: {
    scale: [0, 1.5, 1],
    opacity: [0, 1, 0],
    y: [0, -50, -100],
    transition: {
      duration: 1.5,
      times: [0, 0.3, 1],
    },
  },
};

export const attackAnimationVariants = {
  rest: {
    x: 0,
    scale: 1,
  },
  attacking: {
    x: [0, 50, 0],
    scale: [1, 1.1, 1],
    transition: {
      duration: 0.6,
      times: [0, 0.5, 1],
    },
  },
};

export const cardDeathVariants = {
  alive: {
    opacity: 1,
    scale: 1,
    rotate: 0,
  },
  dying: {
    opacity: [1, 0.5, 0],
    scale: [1, 0.8, 0.5],
    rotate: [0, -15, -30],
    transition: {
      duration: 0.8,
    },
  },
};

export const shimmerVariants = {
  initial: {
    backgroundPosition: '-200% center',
  },
  animate: {
    backgroundPosition: '200% center',
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'linear',
    },
  },
};

export const pulseGlowVariants = {
  initial: {
    boxShadow: '0 0 0 rgba(59, 130, 246, 0)',
  },
  animate: {
    boxShadow: [
      '0 0 0 rgba(59, 130, 246, 0)',
      '0 0 20px rgba(59, 130, 246, 0.5)',
      '0 0 0 rgba(59, 130, 246, 0)',
    ],
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: 'easeInOut',
    },
  },
};
