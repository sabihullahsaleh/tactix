'use client';

import { DraggableAttributes, useDraggable } from '@dnd-kit/core';
type SyntheticListenerMap = NonNullable<ReturnType<typeof useDraggable>['listeners']>;
import { Player, POSITION_COLORS } from '@/lib/data/mockData';
import { cn, getInitials } from '@/lib/utils';
import { motion } from 'framer-motion';

export type PlayerTokenProps = {
  player: Player;
  slot: number;
  selected?: boolean;
  onClick?: () => void;
  isOpponent?: boolean;
  disabled?: boolean;
  source?: 'bench' | 'pitch';
  // Passed from parent when drag is managed externally
  dragListeners?: SyntheticListenerMap;
  dragAttributes?: DraggableAttributes;
  isDragging?: boolean;
};

export default function PlayerToken({ player, slot, selected, onClick, isOpponent, disabled, source = 'pitch', dragListeners, dragAttributes, isDragging = false }: PlayerTokenProps) {
  const positionColor = isOpponent ? '#ff006e' : POSITION_COLORS[player.position];

  return (
    <motion.div
      style={undefined}
      {...(dragListeners ?? {})}
      {...(dragAttributes ?? {})}
      suppressHydrationWarning
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: isDragging ? 0.3 : 1 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      onClick={onClick}
      className={cn(
        'flex flex-col items-center gap-1 select-none',
        disabled ? 'cursor-default' : 'cursor-grab active:cursor-grabbing',
        isDragging && 'opacity-30'
      )}
    >
      {/* Token circle */}
      <div
        className={cn(
          'w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold text-white border-2 relative transition-all overflow-hidden',
          selected && 'ring-2 ring-offset-1 ring-offset-transparent pulse-glow'
        )}
        style={{
          background: player.imageUrl
            ? undefined
            : `radial-gradient(circle, ${positionColor}40 0%, ${positionColor}15 100%)`,
          borderColor: selected ? '#00f5ff' : positionColor,
          boxShadow: selected
            ? `0 0 16px rgba(0,245,255,0.6)`
            : `0 0 10px ${positionColor}50`,
        }}
      >
        {player.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={player.imageUrl} alt={player.shortName} className="w-full h-full object-cover" />
        ) : (
          getInitials(player.shortName)
        )}
        {/* Jersey number badge */}
        <div
          className="absolute -top-1 -right-1 w-4 h-4 rounded-full text-[8px] font-black flex items-center justify-center border border-[#07070d] text-white"
          style={{ background: positionColor }}
        >
          {player.jerseyNumber}
        </div>
      </div>

      {/* Name label */}
      <div className="text-center" style={{ maxWidth: 56 }}>
        <p
          className="text-[9px] font-bold leading-none px-1 py-0.5 rounded whitespace-nowrap"
          style={{
            background: 'rgba(7,7,13,0.85)',
            color: selected ? '#00f5ff' : 'rgba(255,255,255,0.9)',
            border: selected ? '1px solid rgba(0,245,255,0.3)' : '1px solid rgba(255,255,255,0.1)',
          }}
        >
          {player.shortName.split(' ').slice(-1)[0]}
        </p>
      </div>
    </motion.div>
  );
}
