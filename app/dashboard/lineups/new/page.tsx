'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLineupStore } from '@/lib/store/lineupStore';
import { Formation, MOCK_TEAMS } from '@/lib/data/mockData';
import { useRouter } from 'next/navigation';
import GlassCard from '@/components/ui/GlassCard';
import { Zap } from 'lucide-react';

const FORMATIONS: Formation[] = ['4-3-3', '4-2-3-1', '4-4-2', '3-5-2', '3-4-3', '5-3-2', '4-1-4-1'];

export default function NewLineupPage() {
  const router = useRouter();
  const { saveCurrentLineup, setFormation } = useLineupStore();
  const [name, setName] = useState('');
  const [selectedFormation, setSelectedFormation] = useState<Formation>('4-3-3');
  const [selectedTeam, setSelectedTeam] = useState('');

  const handleCreate = () => {
    if (!name) return;
    setFormation(selectedFormation);
    saveCurrentLineup(name);
    router.push('/dashboard/lineups');
  };

  return (
    <div className="flex items-center justify-center min-h-full p-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <GlassCard className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center">
              <Zap size={18} className="text-cyan-400" />
            </div>
            <div>
              <h1 className="text-base font-bold text-white">New Lineup</h1>
              <p className="text-xs text-white/40">Set up your tactical formation</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <label className="text-xs font-semibold text-white/50 uppercase tracking-wider block mb-1.5">Lineup Name</label>
              <input
                type="text"
                placeholder="e.g. Liverpool Attack XI"
                value={name}
                onChange={e => setName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg glass border border-white/10 text-white placeholder-white/25 text-sm outline-none focus:border-cyan-500/40 transition-all"
                autoFocus
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-white/50 uppercase tracking-wider block mb-1.5">Formation</label>
              <div className="grid grid-cols-4 gap-1.5">
                {FORMATIONS.map(f => (
                  <button
                    key={f}
                    onClick={() => setSelectedFormation(f)}
                    className={`py-2 rounded-lg text-xs font-mono font-bold transition-all border ${
                      selectedFormation === f
                        ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
                        : 'glass border-white/10 text-white/50 hover:text-white hover:border-white/20'
                    }`}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-white/50 uppercase tracking-wider block mb-1.5">Team (optional)</label>
              <select
                value={selectedTeam}
                onChange={e => setSelectedTeam(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg glass border border-white/10 text-white/70 text-sm bg-transparent outline-none focus:border-cyan-500/40 transition-all"
              >
                <option value="" className="bg-[#111118]">No team selected</option>
                {MOCK_TEAMS.map(t => (
                  <option key={t.id} value={t.id} className="bg-[#111118]">{t.name}</option>
                ))}
              </select>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => router.back()}
                className="flex-1 py-2.5 rounded-xl glass border border-white/10 text-white/60 text-sm hover:text-white transition-all"
              >
                Cancel
              </button>
              <motion.button
                whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                onClick={handleCreate}
                disabled={!name}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500/20 to-blue-600/20 border border-cyan-500/40 text-cyan-400 text-sm font-bold hover:from-cyan-500/30 hover:to-blue-600/30 transition-all disabled:opacity-40"
              >
                Create Lineup →
              </motion.button>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
}
