'use client';

import { motion } from 'framer-motion';
import { MOCK_TEAMS, LEAGUES, MOCK_PLAYERS } from '@/lib/data/mockData';
import GlassCard from '@/components/ui/GlassCard';
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function TeamsPage() {
  const [activeLeague, setActiveLeague] = useState('All');

  const filtered = activeLeague === 'All' ? MOCK_TEAMS : MOCK_TEAMS.filter(t => t.league === activeLeague);

  const getTeamPlayerCount = (teamName: string) =>
    MOCK_PLAYERS.filter(p => p.club === teamName).length;

  return (
    <div className="p-6 space-y-5 max-w-5xl mx-auto">
      <h1 className="text-xl font-bold text-white">Teams & Leagues</h1>

      {/* League tabs */}
      <div className="flex gap-2 flex-wrap">
        {['All', 'Premier League', 'La Liga', 'Bundesliga', 'UCL'].map(l => (
          <button
            key={l}
            onClick={() => setActiveLeague(l)}
            className={cn(
              'px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border',
              activeLeague === l
                ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-400'
                : 'glass border-white/8 text-white/40 hover:text-white/70'
            )}
          >
            {l}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {filtered.map((team, i) => (
          <motion.div key={team.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}>
            <GlassCard hover className="p-5">
              <div className="flex items-center gap-4">
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl border-2 flex-shrink-0"
                  style={{ borderColor: `${team.primaryColor}60`, background: `${team.primaryColor}15` }}
                >
                  {team.badge}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white">{team.name}</p>
                  <p className="text-xs text-white/40">{team.league}</p>
                  <p className="text-[10px] text-white/25 mt-0.5">{getTeamPlayerCount(team.name)} players tracked</p>
                </div>
              </div>
              <div className="flex items-center justify-between mt-4 pt-3 border-t border-white/5">
                <span className="text-xs text-white/30">{team.country}</span>
                <Link href={`/dashboard/lineups/new`} className="flex items-center gap-1 text-xs text-cyan-400 hover:text-cyan-300 transition-colors">
                  Build Lineup <ArrowRight size={11} />
                </Link>
              </div>
            </GlassCard>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
