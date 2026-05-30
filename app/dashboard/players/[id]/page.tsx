'use client';

import { use } from 'react';
import { MOCK_PLAYERS, POSITION_COLORS } from '@/lib/data/mockData';
import { getRatingColor, getStatColor } from '@/lib/utils';
import { motion } from 'framer-motion';
import GlassCard from '@/components/ui/GlassCard';
import PlayerRadarChart from '@/components/comparison/RadarChart';
import Link from 'next/link';
import PlayerPhotoUpload from '@/components/players/PlayerPhotoUpload';
import { ArrowLeft, GitCompare, Plus } from 'lucide-react';
import { notFound } from 'next/navigation';

export default function PlayerProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const player = MOCK_PLAYERS.find(p => p.id === id);
  if (!player) return notFound();

  const positionColor = POSITION_COLORS[player.position];
  const ratingColor = getRatingColor(player.rating);

  const statBars = [
    { label: 'Pace', value: player.stats.pace },
    { label: 'Shooting', value: player.stats.shooting },
    { label: 'Passing', value: player.stats.passing },
    { label: 'Dribbling', value: player.stats.dribbling },
    { label: 'Defending', value: player.stats.defending },
    { label: 'Physical', value: player.stats.physical },
  ];

  const seasonStats = [
    { label: 'Goals', value: player.stats.goals, unit: '' },
    { label: 'Assists', value: player.stats.assists, unit: '' },
    { label: 'xG', value: player.stats.xG, unit: '' },
    { label: 'Pass Acc.', value: player.stats.passAccuracy, unit: '%' },
    { label: 'Sprint', value: player.stats.sprintSpeed, unit: ' km/h' },
    { label: 'Tackles', value: player.stats.tackles, unit: '' },
    { label: 'Dribbles', value: player.stats.dribbles, unit: '' },
    { label: 'Rating', value: player.stats.matchRating, unit: '' },
  ];

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Back */}
      <Link href="/dashboard/players" className="flex items-center gap-2 text-white/40 hover:text-white text-sm transition-colors">
        <ArrowLeft size={15} /> Back to Players
      </Link>

      {/* Hero */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <GlassCard className="p-6 relative overflow-hidden">
          {/* Background glow */}
          <div
            className="absolute top-0 right-0 w-64 h-64 rounded-full opacity-10 blur-3xl pointer-events-none"
            style={{ background: positionColor, transform: 'translate(30%, -30%)' }}
          />
          <div className="flex items-center gap-6 relative">
            <div
              className="w-24 h-24 rounded-2xl flex-shrink-0 relative"
              style={{
                border: `2px solid ${positionColor}`,
                boxShadow: `0 0 30px ${positionColor}40`,
                background: `radial-gradient(circle, ${positionColor}20 0%, transparent 70%)`,
              }}
            >
              {player.imageUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={player.imageUrl} alt={player.name} className="w-full h-full rounded-2xl object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-5xl rounded-2xl">{player.flagEmoji}</div>
              )}
              <PlayerPhotoUpload
                playerId={player.id}
                currentImageUrl={player.imageUrl}
                className="absolute inset-0 rounded-2xl"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between flex-wrap gap-2">
                <div>
                  <h1 className="text-2xl font-black text-white">{player.name}</h1>
                  <p className="text-white/50 text-sm mt-0.5">{player.club} · {player.nationality}</p>
                </div>
                <span className="text-4xl font-black font-mono" style={{ color: ratingColor, textShadow: `0 0 20px ${ratingColor}60` }}>
                  {player.rating}
                </span>
              </div>
              <div className="flex items-center gap-3 mt-3 flex-wrap">
                <span className="text-xs font-bold px-2 py-1 rounded-lg" style={{ color: positionColor, background: `${positionColor}20`, border: `1px solid ${positionColor}40` }}>
                  {player.position}
                </span>
                <span className="text-xs text-white/40">#{player.jerseyNumber}</span>
                <span className="text-xs text-white/40">{player.age} years old</span>
                <span className="text-xs text-white/40">{player.height}cm · {player.weight}kg</span>
                <span className="text-xs text-white/40">{player.foot} foot</span>
                <span className="text-xs font-semibold text-emerald-400">{player.marketValue}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-5">
            <Link href={`/dashboard/compare?p1=${player.id}`} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 text-sm font-semibold hover:bg-cyan-500/25 transition-all">
              <GitCompare size={14} /> Compare
            </Link>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl glass border border-white/10 text-white/60 text-sm hover:text-white hover:border-white/20 transition-all">
              <Plus size={14} /> Add to Lineup
            </button>
          </div>
        </GlassCard>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Radar */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <GlassCard className="p-5">
            <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4">Attribute Profile</p>
            <PlayerRadarChart player1={player} />
            <div className="grid grid-cols-3 gap-2 mt-2">
              {statBars.map(({ label, value }) => (
                <div key={label} className="flex flex-col items-center p-2 rounded-lg bg-white/3 border border-white/5">
                  <span className="text-[10px] text-white/40 uppercase">{label}</span>
                  <span className="text-lg font-black font-mono mt-0.5" style={{ color: getStatColor(value) }}>{value}</span>
                  <div className="w-full h-1 rounded-full bg-white/5 mt-1 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${value}%` }}
                      transition={{ duration: 0.6 }}
                      className="h-full rounded-full"
                      style={{ background: getStatColor(value) }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>

        {/* Season stats */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <GlassCard className="p-5">
            <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-4">2024/25 Season</p>
            <div className="grid grid-cols-2 gap-3">
              {seasonStats.map(({ label, value, unit }) => (
                <div key={label} className="p-3 rounded-xl bg-white/3 border border-white/5 flex items-center justify-between">
                  <span className="text-xs text-white/50">{label}</span>
                  <span className="text-lg font-black font-mono" style={{ color: getStatColor(typeof value === 'number' ? value : 50) }}>
                    {value}{unit}
                  </span>
                </div>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
