'use client';

import type { Card, BoardCard } from '@/lib/game-engine/types';

interface SimpleCardProps {
  card: Card | BoardCard;
  onClick?: () => void;
  isPlayable?: boolean;
  isInHand?: boolean;
  size?: 'small' | 'normal';
  className?: string;
}

export function SimpleCard({
  card,
  onClick,
  isPlayable = false,
  isInHand = false,
  size = 'normal',
  className = '',
}: SimpleCardProps) {
  const isBoard = 'instanceId' in card;
  const boardCard = isBoard ? (card as BoardCard) : null;

  const sizeClasses = size === 'small'
    ? 'w-20 h-28 p-1 text-[10px]'
    : 'w-32 h-44 p-2 text-xs';

  const costSize = size === 'small' ? 'w-5 h-5 text-[10px]' : 'w-8 h-8 text-xs';
  const statSize = size === 'small' ? 'w-5 h-5 text-[10px]' : 'w-7 h-7 text-xs';

  return (
    <div
      className={`
        relative glass rounded flex flex-col
        ${sizeClasses}
        ${isPlayable ? 'cursor-pointer hover:scale-105 hover:brightness-125 border border-ibm-cyan' : ''}
        ${isInHand ? 'hover:-translate-y-1' : ''}
        transition-all
        ${className}
      `}
      onClick={isPlayable ? onClick : undefined}
    >
      {/* Cost */}
      <div className={`absolute -top-1 -left-1 ${costSize} rounded-full bg-mana flex items-center justify-center font-bold text-white`}>
        {card.cost}
      </div>

      {/* Name */}
      <div className="font-bold text-ibm-cyan truncate leading-tight mb-1">
        {card.name}
      </div>

      {/* Art Area */}
      <div className="flex-1 bg-gradient-to-br from-card-frame to-background rounded flex items-center justify-center opacity-60">
        <div className="text-[8px] uppercase tracking-wider opacity-50">
          {card.profession}
        </div>
      </div>

      {/* Stats for employees */}
      {card.type === 'employee' && (
        <div className="flex justify-between items-center mt-1">
          <div className={`${statSize} rounded-full bg-gradient-to-br from-orange-600 to-orange-700 flex items-center justify-center font-bold text-white`}>
            {boardCard?.currentAttack ?? card.attack}
          </div>
          <div className={`${statSize} rounded-full bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center font-bold text-white`}>
            {boardCard?.currentHealth ?? card.health}
          </div>
        </div>
      )}

      {/* Type for non-employees */}
      {card.type !== 'employee' && size === 'normal' && (
        <div className="text-[9px] text-center opacity-60 capitalize mt-1">
          {card.type}
        </div>
      )}

      {/* Keywords - only show on normal size */}
      {card.keywords.length > 0 && size === 'normal' && (
        <div className="text-[8px] text-ibm-purple truncate mt-1">
          {card.keywords.join(', ')}
        </div>
      )}
    </div>
  );
}
