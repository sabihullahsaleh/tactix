'use client';

import { motion } from 'framer-motion';
import { MOCK_MATCHES } from '@/lib/data/mockData';
import GlassCard from '@/components/ui/GlassCard';
import { Activity, Plus } from 'lucide-react';
import Link from 'next/link';

export default function MatchesPage() {
  return (
    <div className="p-6 space-y-5 max-w-4xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Match Logs</h1>
          <p className="text-white/40 text-sm">{MOCK_MATCHES.length} matches recorded</p>
        </div>
        <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 text-sm font-semibold hover:bg-cyan-500/25 transition-all">
          <Plus size={14} /> Log Match
        </button>
      </div>

      {/* Summary row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Won', value: MOCK_MATCHES.filter(m => m.homeScore > m.awayScore).length, color: '#39ff14' },
          { label: 'Drawn', value: MOCK_MATCHES.filter(m => m.homeScore === m.awayScore).length, color: '#f59e0b' },
          { label: 'Lost', value: MOCK_MATCHES.filter(m => m.homeScore < m.awayScore).length, color: '#ff006e' },
        ].map(({ label, value, color }) => (
          <GlassCard key={label} className="p-4 text-center">
            <p className="text-2xl font-black font-mono" style={{ color, textShadow: `0 0 12px ${color}60` }}>{value}</p>
            <p className="text-xs text-white/40 mt-1">{label}</p>
          </GlassCard>
        ))}
      </div>

      {/* Match list */}
      <div className="space-y-3">
        {MOCK_MATCHES.map((match, i) => {
          const won = match.homeScore > match.awayScore;
          const draw = match.homeScore === match.awayScore;
          const resultColor = draw ? '#f59e0b' : won ? '#39ff14' : '#ff006e';
          const resultLabel = draw ? 'D' : won ? 'W' : 'L';
          return (
            <motion.div key={match.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }}>
              <GlassCard className="p-4">
                <div className="flex items-center gap-4">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black border flex-shrink-0"
                    style={{ color: resultColor, borderColor: resultColor, background: `${resultColor}15` }}
                  >
                    {resultLabel}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <p className="text-base font-bold text-white">
                        {match.homeTeam}
                        <span className="mx-2 text-white/30">·</span>
                        <span style={{ color: resultColor }}>{match.homeScore}–{match.awayScore}</span>
                        <span className="mx-2 text-white/30">·</span>
                        {match.awayTeam}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-white/30">
                      <span>{match.competition}</span>
                      <span>·</span>
                      <span>{match.date}</span>
                      <span>·</span>
                      <span className="font-mono text-white/50">{match.formation}</span>
                    </div>
                  </div>
                  <Link href={`/dashboard/lineups/${match.lineupId}`} className="text-xs text-cyan-400 hover:text-cyan-300 transition-colors px-3 py-1.5 rounded-lg glass border border-white/8 hover:border-cyan-500/30">
                    View Lineup
                  </Link>
                </div>
              </GlassCard>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
