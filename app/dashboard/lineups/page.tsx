'use client';

import { motion } from 'framer-motion';
import { useLineupStore } from '@/lib/store/lineupStore';
import GlassCard from '@/components/ui/GlassCard';
import Link from 'next/link';
import { Plus, ArrowRight, Trash2, Zap } from 'lucide-react';

export default function LineupsPage() {
  const { lineups, activeLineupId, setActiveLineup } = useLineupStore();

  return (
    <div className="p-6 space-y-5 max-w-5xl mx-auto">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">My Lineups</h1>
          <p className="text-white/40 text-sm">{lineups.length} saved formations</p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/dashboard/lineups/build">
            <motion.span
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500/15 to-blue-600/15 border border-cyan-500/40 text-cyan-400 text-sm font-semibold hover:from-cyan-500/25 hover:to-blue-600/25 transition-all cursor-pointer shadow-[0_0_12px_rgba(0,245,255,0.1)]"
            >
              <Zap size={14} /> Build from Scratch
            </motion.span>
          </Link>
          <Link href="/dashboard/lineups/new">
            <motion.span
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl glass border border-white/15 text-white/60 text-sm font-semibold hover:text-white hover:border-white/25 transition-all cursor-pointer"
            >
              <Plus size={14} /> New Lineup1
            </motion.span>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {lineups.map((lineup, i) => (
          <motion.div key={lineup.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <GlassCard
              glow={activeLineupId === lineup.id ? 'cyan' : 'none'}
              hover
              className="p-4"
              onClick={() => setActiveLineup(lineup.id)}
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl glass border border-white/10">
                  {lineup.teamBadge}
                </div>
                {activeLineupId === lineup.id && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 font-semibold">Active</span>
                )}
              </div>
              <p className="text-sm font-bold text-white">{lineup.name}</p>
              <p className="text-xs text-white/40 mt-0.5">{lineup.teamName}</p>
              <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
                <span className="text-xs font-mono text-white/50 bg-white/5 px-2 py-0.5 rounded">{lineup.formation}</span>
                <span className="text-xs text-white/30">{lineup.createdAt}</span>
              </div>
              <Link href={`/dashboard/lineups/${lineup.id}`}>
                <div className="flex items-center gap-1 mt-3 text-xs text-cyan-400 hover:text-cyan-300 transition-colors">
                  Open Editor <ArrowRight size={12} />
                </div>
              </Link>
            </GlassCard>
          </motion.div>
        ))}

        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: lineups.length * 0.05 }}>
          <Link href="/dashboard/lineups/new">
            <div className="h-full min-h-[160px] rounded-xl border border-dashed border-white/15 hover:border-cyan-500/40 hover:bg-cyan-500/5 cursor-pointer transition-all flex flex-col items-center justify-center gap-2 text-white/30 hover:text-cyan-400">
              <Plus size={24} />
              <span className="text-sm font-medium">Create New Lineup</span>
            </div>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
