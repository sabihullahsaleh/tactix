'use client';

import { motion } from 'framer-motion';
import { Player, POSITION_COLORS } from '@/lib/data/mockData';
import { cn, getInitials, getRatingColor } from '@/lib/utils';
import StatBadge from '@/components/ui/StatBadge';
import { GitCompare, User } from 'lucide-react';
import Link from 'next/link';
import { useLineupStore } from '@/lib/store/lineupStore';

type PlayerCardProps = {
  player: Player;
  variant?: 'full' | 'compact' | 'bench';
  selected?: boolean;
  dragging?: boolean;
  onClick?: () => void;
};

export default function PlayerCard({ player, variant = 'full', selected = false, dragging = false, onClick }: PlayerCardProps) {
  const { addToCompare, setSelectedPlayer } = useLineupStore();
  const positionColor = POSITION_COLORS[player.position];
  const ratingColor = getRatingColor(player.rating);

  if (variant === 'bench') {
    return (
      <motion.div
        whileHover={{ y: -2, scale: 1.02 }}
        onClick={onClick}
        className={cn(
          'flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl glass-card border cursor-pointer transition-all',
          selected ? 'border-cyan-500/50 bg-cyan-500/10' : 'border-white/8 hover:border-white/15'
        )}
      >
        <div
          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white border"
          style={{ background: `${positionColor}30`, borderColor: `${positionColor}60` }}
        >
          {getInitials(player.shortName)}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-semibold text-white truncate">{player.shortName}</p>
          <p className="text-[10px] text-white/40">{player.position}</p>
        </div>
        <span className="text-xs font-bold ml-auto" style={{ color: ratingColor }}>{player.rating}</span>
      </motion.div>
    );
  }

  if (variant === 'compact') {
    return (
      <motion.div
        whileHover={{ y: -2 }}
        onClick={onClick}
        className={cn(
          'flex items-center gap-3 p-3 rounded-xl glass-card border cursor-pointer transition-all',
          selected ? 'border-cyan-500/40 bg-cyan-500/8' : 'border-white/8 hover:border-white/15'
        )}
      >
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold border-2 flex-shrink-0"
          style={{ background: `${positionColor}20`, borderColor: `${positionColor}70` }}
        >
          {player.flagEmoji}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-white truncate">{player.name}</p>
          <p className="text-xs text-white/40">{player.club} · <span style={{ color: positionColor }}>{player.position}</span></p>
        </div>
        <div className="flex flex-col items-end gap-1 flex-shrink-0">
          <span className="text-sm font-bold font-mono" style={{ color: ratingColor }}>{player.rating}</span>
          <div className="flex gap-1">
            <StatBadge label="GOL" value={player.stats.goals} size="sm" />
          </div>
        </div>
      </motion.div>
    );
  }

  // Full card
  return (
    <motion.div
      whileHover={!dragging ? { y: -4, scale: 1.01 } : undefined}
      onClick={onClick}
      className={cn(
        'relative rounded-2xl border overflow-hidden cursor-pointer transition-all group',
        selected
          ? 'border-cyan-500/60 shadow-[0_0_24px_rgba(0,245,255,0.2)]'
          : 'border-white/8 hover:border-white/20',
        dragging && 'drag-overlay'
      )}
      style={{
        background: 'linear-gradient(135deg, rgba(17,17,24,0.95) 0%, rgba(10,10,15,0.98) 100%)',
      }}
    >
      {/* Position color top accent */}
      <div className="h-0.5 w-full" style={{ background: `linear-gradient(90deg, transparent, ${positionColor}, transparent)` }} />

      {/* Header */}
      <div className="flex items-center justify-between px-3 pt-3">
        <div className="flex items-center gap-1.5">
          <span className="text-lg">{player.flagEmoji}</span>
          <span
            className="text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider"
            style={{ color: positionColor, background: `${positionColor}20`, border: `1px solid ${positionColor}40` }}
          >
            {player.position}
          </span>
        </div>
        <span
          className="text-xl font-black font-mono"
          style={{ color: ratingColor, textShadow: `0 0 12px ${ratingColor}80` }}
        >
          {player.rating}
        </span>
      </div>

      {/* Player avatar */}
      <div className="flex items-center justify-center py-3">
        <div
          className="w-16 h-16 rounded-full flex items-center justify-center text-2xl border-2 relative"
          style={{
            background: `radial-gradient(circle, ${positionColor}20 0%, transparent 70%)`,
            borderColor: `${positionColor}50`,
            boxShadow: `0 0 20px ${positionColor}30`,
          }}
        >
          {player.imageUrl ? (
            <img src={player.imageUrl} alt={player.name} className="w-full h-full rounded-full object-cover" />
          ) : (
            <span className="text-2xl">{player.flagEmoji}</span>
          )}
          <div
            className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[8px] font-bold text-white border border-[#07070d]"
            style={{ background: positionColor }}
          >
            {player.jerseyNumber}
          </div>
        </div>
      </div>

      {/* Name */}
      <div className="text-center px-2">
        <p className="text-sm font-bold text-white truncate">{player.shortName}</p>
        <p className="text-[10px] text-white/40 truncate">{player.club} · {player.age}y</p>
      </div>

      {/* Stats row */}
      <div className="flex justify-between px-3 py-3 gap-1">
        <StatBadge label="PAC" value={player.stats.pace} size="sm" />
        <StatBadge label="SHO" value={player.stats.shooting} size="sm" />
        <StatBadge label="PAS" value={player.stats.passing} size="sm" />
        <StatBadge label="DRI" value={player.stats.dribbling} size="sm" />
        <StatBadge label="DEF" value={player.stats.defending} size="sm" />
      </div>

      {/* Action buttons - appear on hover */}
      <div className="absolute inset-x-0 bottom-0 p-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity bg-gradient-to-t from-[#07070d] to-transparent pt-6">
        <button
          onClick={(e) => { e.stopPropagation(); addToCompare(player.id); }}
          className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 text-[10px] font-medium hover:bg-cyan-500/25 transition-all"
        >
          <GitCompare size={10} /> Compare
        </button>
        <Link href={`/dashboard/players/${player.id}`} onClick={(e) => e.stopPropagation()} className="flex-1 flex items-center justify-center gap-1 py-1.5 px-3 rounded-lg bg-white/5 border border-white/10 text-white/60 text-[10px] font-medium hover:bg-white/10 transition-all">
          <User size={10} /> Profile
        </Link>
      </div>
    </motion.div>
  );
}
