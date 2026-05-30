'use client';

import { motion } from 'framer-motion';
import { MOCK_LINEUPS, MOCK_MATCHES, MOCK_PLAYERS } from '@/lib/data/mockData';
import { useLineupStore } from '@/lib/store/lineupStore';
import GlassCard from '@/components/ui/GlassCard';
import PlayerCard from '@/components/cards/PlayerCard';
import { ClipboardList, Users, Activity, Zap, ArrowRight, GitCompare } from 'lucide-react';
import Link from 'next/link';
import { useState, useEffect } from 'react';

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 16 }, show: { opacity: 1, y: 0 } };

export default function DashboardPage() {
  const { comparePlayerIds, addToCompare } = useLineupStore();
  const [compareP1, setCompareP1] = useState('');
  const [compareP2, setCompareP2] = useState('');
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const stats = [
    { icon: ClipboardList, label: 'Saved Lineups', value: MOCK_LINEUPS.length, color: '#00f5ff', glow: 'cyan' as const },
    { icon: Users, label: 'Players Tracked', value: MOCK_PLAYERS.length, color: '#39ff14', glow: 'green' as const },
    { icon: Activity, label: 'Matches Logged', value: MOCK_MATCHES.length, color: '#ff006e', glow: 'pink' as const },
    { icon: Zap, label: 'AI Analyses', value: 7, color: '#bf5fff', glow: 'purple' as const },
  ];

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Welcome */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold text-white">
          Good evening <span className="text-glow-cyan" style={{ color: '#00f5ff' }}>⚡</span>
        </h1>
        <p className="text-white/40 text-sm mt-0.5">Here&apos;s your tactical overview</p>
      </motion.div>

      {/* Stat cards */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map(({ icon: Icon, label, value, color, glow }) => (
          <motion.div key={label} variants={item}>
            <GlassCard glow={glow} className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-xs text-white/40 font-medium">{label}</p>
                  <p className="text-3xl font-black font-mono mt-1" style={{ color, textShadow: `0 0 16px ${color}60` }}>
                    {value}
                  </p>
                </div>
                <div className="p-2 rounded-lg" style={{ background: `${color}15`, border: `1px solid ${color}30` }}>
                  <Icon size={18} style={{ color }} />
                </div>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </motion.div>

      {/* Main grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent lineups */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="lg:col-span-2">
          <GlassCard className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-white">Recent Lineups</h2>
              <Link href="/dashboard/lineups">
                <span className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors">
                  See all <ArrowRight size={12} />
                </span>
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {MOCK_LINEUPS.map((lineup) => (
                <Link key={lineup.id} href={`/dashboard/lineups/${lineup.id}`}>
                  <motion.div
                    whileHover={{ scale: 1.01, y: -1 }}
                    className="p-3 rounded-xl glass border border-white/8 hover:border-white/15 cursor-pointer transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl glass border border-white/10 flex-shrink-0">
                        {lineup.teamBadge}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-white truncate group-hover:text-cyan-400 transition-colors">{lineup.name}</p>
                        <p className="text-xs text-white/40">{lineup.formation} · {lineup.createdAt}</p>
                      </div>
                      <ArrowRight size={14} className="text-white/20 group-hover:text-cyan-400 ml-auto flex-shrink-0 transition-colors" />
                    </div>
                  </motion.div>
                </Link>
              ))}
              <Link href="/dashboard/lineups/new">
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  className="p-3 rounded-xl border border-dashed border-white/15 hover:border-cyan-500/40 hover:bg-cyan-500/5 cursor-pointer transition-all flex items-center justify-center gap-2 text-white/30 hover:text-cyan-400"
                >
                  <Zap size={14} />
                  <span className="text-sm">New Lineup</span>
                </motion.div>
              </Link>
            </div>
          </GlassCard>
        </motion.div>

        {/* Quick compare */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <GlassCard className="p-5 h-full">
            <div className="flex items-center gap-2 mb-4">
              <GitCompare size={15} className="text-cyan-400" />
              <h2 className="text-sm font-semibold text-white">Quick Compare</h2>
            </div>
            <div className="space-y-2">
              <select
                value={compareP1}
                onChange={e => setCompareP1(e.target.value)}
                className="w-full px-3 py-2 rounded-lg glass border border-white/10 text-white/70 text-sm bg-transparent outline-none hover:border-white/20 focus:border-cyan-500/40 transition-all"
                suppressHydrationWarning
              >
                <option value="" className="bg-[#111118]">Select Player 1...</option>
                {mounted && MOCK_PLAYERS.map(p => (
                  <option key={p.id} value={p.id} className="bg-[#111118]">{p.name}</option>
                ))}
              </select>
              <div className="flex items-center justify-center">
                <span className="text-xs font-bold text-white/20 px-2">VS</span>
              </div>
              <select
                value={compareP2}
                onChange={e => setCompareP2(e.target.value)}
                className="w-full px-3 py-2 rounded-lg glass border border-white/10 text-white/70 text-sm bg-transparent outline-none hover:border-white/20 focus:border-pink-500/40 transition-all"
                suppressHydrationWarning
              >
                <option value="" className="bg-[#111118]">Select Player 2...</option>
                {mounted && MOCK_PLAYERS.map(p => (
                  <option key={p.id} value={p.id} className="bg-[#111118]">{p.name}</option>
                ))}
              </select>
            </div>
            <Link href={compareP1 && compareP2 ? `/dashboard/compare?p1=${compareP1}&p2=${compareP2}` : '#'}>
              <motion.span
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`w-full mt-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 text-cyan-400 text-sm font-semibold hover:from-cyan-500/30 hover:to-blue-600/30 transition-all flex items-center justify-center ${(!compareP1 || !compareP2) ? 'opacity-40 cursor-not-allowed pointer-events-none' : 'cursor-pointer'}`}
              >
                Compare Now →
              </motion.span>
            </Link>
          </GlassCard>
        </motion.div>
      </div>

      {/* Match logs + top players */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Match logs */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="lg:col-span-2">
          <GlassCard className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-white">Recent Matches</h2>
              <Link href="/dashboard/matches">
                <span className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1">See all <ArrowRight size={12} /></span>
              </Link>
            </div>
            <div className="space-y-2">
              {MOCK_MATCHES.map((match) => {
                const won = match.homeScore > match.awayScore;
                const draw = match.homeScore === match.awayScore;
                const resultColor = draw ? '#f59e0b' : won ? '#39ff14' : '#ff006e';
                const resultLabel = draw ? 'D' : won ? 'W' : 'L';
                return (
                  <div key={match.id} className="flex items-center gap-3 p-3 rounded-xl glass border border-white/8 hover:border-white/15 transition-all">
                    <div className="w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-black border" style={{ color: resultColor, borderColor: resultColor, background: `${resultColor}15` }}>
                      {resultLabel}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-white font-medium">
                        {match.homeTeam} <span className="font-black">{match.homeScore}–{match.awayScore}</span> {match.awayTeam}
                      </p>
                      <p className="text-xs text-white/30">{match.competition} · {match.date} · {match.formation}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </GlassCard>
        </motion.div>

        {/* Top players */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
          <GlassCard className="p-5">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-white">Top Players</h2>
              <Link href="/dashboard/players">
                <span className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1">All <ArrowRight size={12} /></span>
              </Link>
            </div>
            <div className="space-y-2">
              {MOCK_PLAYERS.sort((a, b) => b.rating - a.rating).slice(0, 5).map((player, i) => (
                <Link key={player.id} href={`/dashboard/players/${player.id}`}>
                  <div className="flex items-center gap-2.5 py-1.5 hover:bg-white/3 rounded-lg px-1 transition-all cursor-pointer group">
                    <span className="text-xs font-bold text-white/20 w-4">{i + 1}</span>
                    <span className="text-base">{player.flagEmoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-white/80 group-hover:text-white truncate">{player.shortName}</p>
                      <p className="text-[10px] text-white/30">{player.position} · {player.club}</p>
                    </div>
                    <span className="text-sm font-black font-mono" style={{ color: player.rating >= 90 ? '#f59e0b' : player.rating >= 85 ? '#00f5ff' : '#39ff14' }}>
                      {player.rating}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </GlassCard>
        </motion.div>
      </div>
    </div>
  );
}
