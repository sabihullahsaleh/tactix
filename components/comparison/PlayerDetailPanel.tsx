'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useLineupStore } from '@/lib/store/lineupStore';
import { MOCK_PLAYERS, POSITION_COLORS } from '@/lib/data/mockData';
import { getRatingColor, getStatColor } from '@/lib/utils';
import { X, GitCompare, User } from 'lucide-react';
import Link from 'next/link';
import PlayerRadarChart from './RadarChart';
import PlayerPhotoUpload from '@/components/players/PlayerPhotoUpload';

export default function PlayerDetailPanel() {
  const { selectedPlayerId, setSelectedPlayer, addToCompare, comparePlayerIds } = useLineupStore();
  const player = MOCK_PLAYERS.find(p => p.id === selectedPlayerId);

  const statsToShow = [
    { label: 'Goals', value: player?.stats.goals ?? 0, max: 40 },
    { label: 'Assists', value: player?.stats.assists ?? 0, max: 20 },
    { label: 'Pass Acc.', value: player?.stats.passAccuracy ?? 0, max: 100 },
    { label: 'Tackles', value: player?.stats.tackles ?? 0, max: 120 },
    { label: 'Dribbles', value: player?.stats.dribbles ?? 0, max: 200 },
    { label: 'xG', value: player?.stats.xG ?? 0, max: 30 },
  ];

  return (
    <AnimatePresence>
      {player && (
        <motion.aside
          key={player.id}
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          className="w-72 flex-shrink-0 glass-card border-l border-white/5 flex flex-col overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-white/5">
            <span className="text-xs font-semibold text-white/40 uppercase tracking-wider">Player Detail</span>
            <button
              onClick={() => setSelectedPlayer(null)}
              className="w-6 h-6 rounded-full glass flex items-center justify-center text-white/40 hover:text-white transition-all"
            >
              <X size={13} />
            </button>
          </div>

          {/* Player hero */}
          <div className="p-4 text-center border-b border-white/5">
            {(() => {
              const positionColor = POSITION_COLORS[player.position];
              const ratingColor = getRatingColor(player.rating);
              return (
                <>
                  <div
                    className="w-20 h-20 rounded-full mx-auto mb-3 relative"
                    style={{
                      border: `2px solid ${positionColor}`,
                      boxShadow: `0 0 24px ${positionColor}40`,
                      background: `radial-gradient(circle, ${positionColor}30 0%, transparent 70%)`,
                    }}
                  >
                    {player.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={player.imageUrl} alt={player.name} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-4xl">{player.flagEmoji}</div>
                    )}
                    <PlayerPhotoUpload
                      playerId={player.id}
                      currentImageUrl={player.imageUrl}
                      className="absolute inset-0 rounded-full"
                    />
                  </div>
                  <p className="text-white font-bold text-base">{player.name}</p>
                  <p className="text-white/40 text-xs mt-0.5">{player.club} · {player.nationality}</p>
                  <div className="flex items-center justify-center gap-2 mt-2">
                    <span
                      className="text-xs px-2 py-0.5 rounded font-bold"
                      style={{ color: positionColor, background: `${positionColor}20`, border: `1px solid ${positionColor}40` }}
                    >
                      {player.position}
                    </span>
                    <span className="text-lg font-black font-mono" style={{ color: ratingColor }}>{player.rating}</span>
                  </div>
                  <div className="flex justify-center gap-3 mt-2 text-xs text-white/40">
                    <span>{player.height}cm</span>
                    <span>·</span>
                    <span>{player.weight}kg</span>
                    <span>·</span>
                    <span>{player.foot} foot</span>
                  </div>
                </>
              );
            })()}
          </div>

          {/* Radar mini */}
          <div className="p-3 border-b border-white/5">
            <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">Attributes</p>
            <PlayerRadarChart player1={player} />
          </div>

          {/* Season stats */}
          <div className="p-4 border-b border-white/5">
            <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-3">Season Stats</p>
            <div className="space-y-2.5">
              {statsToShow.map(({ label, value, max }) => {
                const pct = Math.min((value / max) * 100, 100);
                const color = getStatColor(typeof value === 'number' && max === 100 ? value : Math.min((value / max) * 100, 100));
                return (
                  <div key={label}>
                    <div className="flex justify-between mb-1">
                      <span className="text-[11px] text-white/50">{label}</span>
                      <span className="text-[11px] font-bold font-mono" style={{ color }}>{value}</span>
                    </div>
                    <div className="h-1 rounded-full bg-white/8 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="h-full rounded-full"
                        style={{ background: `linear-gradient(90deg, ${color}80, ${color})` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="p-4 space-y-2 mt-auto">
            <button
              onClick={() => addToCompare(player.id)}
              disabled={comparePlayerIds.includes(player.id)}
              className="w-full flex items-center justify-center gap-2 py-2 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 text-sm font-medium hover:bg-cyan-500/25 transition-all disabled:opacity-40"
            >
              <GitCompare size={14} />
              {comparePlayerIds.includes(player.id) ? 'Added to Compare' : 'Compare Player'}
            </button>
            <Link href={`/dashboard/players/${player.id}`} className="w-full flex items-center justify-center gap-2 py-2 rounded-lg glass border border-white/10 text-white/60 text-sm font-medium hover:text-white hover:border-white/20 transition-all">
              <User size={14} /> Full Profile
            </Link>
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
