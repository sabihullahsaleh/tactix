'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useLineupStore } from '@/lib/store/lineupStore';
import { MOCK_PLAYERS, FORMATION_POSITIONS, Formation, Player } from '@/lib/data/mockData';
import Pitch from '@/components/pitch/Pitch';
import PlayerCard from '@/components/cards/PlayerCard';
import PlayerDetailPanel from '@/components/comparison/PlayerDetailPanel';
import LineupImportModal from '@/components/lineup/LineupImportModal';
import SquadManager from '@/components/squad/SquadManager';
import PlayerQuickView from '@/components/squad/PlayerQuickView';
import GlassCard from '@/components/ui/GlassCard';
import { useState } from 'react';
import { Save, Share2, Download, ChevronDown, Users, Map, Crosshair, LayoutList } from 'lucide-react';

const FORMATIONS: Formation[] = ['4-3-3', '4-2-3-1', '4-4-2', '3-5-2', '3-4-3', '5-3-2', '4-1-4-1'];
const VIEWS = [
  { id: 'pitch', label: 'Pitch', icon: Map },
  { id: 'manager', label: 'Squad', icon: LayoutList },
  { id: 'squad', label: 'Players', icon: Users },
  { id: 'tactics', label: 'Tactics', icon: Crosshair },
];

export default function LineupEditorPage() {
  const { formation, setFormation, myXI, opponentXI, bench, selectedPlayerId, lineups, activeLineupId, saveCurrentLineup } = useLineupStore();
  const [activeView, setActiveView] = useState<'pitch' | 'manager' | 'squad' | 'tactics'>('pitch');
  const [formationOpen, setFormationOpen] = useState(false);
  const [saveModalOpen, setSaveModalOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [saveName, setSaveName] = useState('');
  const [quickViewPlayer, setQuickViewPlayer] = useState<Player | null>(null);

  const activeLineup = lineups.find(l => l.id === activeLineupId);

  return (
    <div className="flex h-full overflow-hidden">
      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Editor topbar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5 flex-shrink-0">
          {/* Team / Formation info */}
          <div className="flex items-center gap-2">
            <span className="text-xl">{activeLineup?.teamBadge ?? '⚽'}</span>
            <div>
              <p className="text-sm font-bold text-white leading-none">{activeLineup?.name ?? 'New Lineup'}</p>
              <p className="text-[10px] text-white/40">{activeLineup?.teamName ?? 'My Team'}</p>
            </div>
          </div>

          {/* Formation picker */}
          <div className="relative ml-2">
            <button
              onClick={() => setFormationOpen(!formationOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass border border-white/10 text-sm text-white/70 hover:text-white hover:border-white/20 transition-all"
            >
              <span className="font-mono font-bold text-cyan-400">{formation}</span>
              <ChevronDown size={13} className={`transition-transform ${formationOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {formationOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  className="absolute top-full mt-1 left-0 glass-card border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50 min-w-[120px]"
                >
                  {FORMATIONS.map(f => (
                    <button
                      key={f}
                      onClick={() => { setFormation(f); setFormationOpen(false); }}
                      className={`w-full text-left px-4 py-2 text-sm font-mono transition-all hover:bg-white/5 ${f === formation ? 'text-cyan-400 bg-cyan-500/10' : 'text-white/60'}`}
                    >
                      {f}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* View tabs */}
          <div className="flex items-center gap-0.5 glass border border-white/8 rounded-lg p-0.5 ml-2">
            {VIEWS.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveView(id as typeof activeView)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  activeView === id
                    ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                    : 'text-white/40 hover:text-white/70'
                }`}
              >
                <Icon size={12} />{label}
              </button>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 ml-auto">
            <button
              onClick={() => setImportModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass border border-cyan-500/20 text-cyan-400/70 text-xs hover:text-cyan-400 hover:border-cyan-500/40 transition-all"
            >
              <Download size={13} /> Import
            </button>
            <button
              onClick={() => setSaveModalOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass border border-white/10 text-white/60 text-xs hover:text-white hover:border-white/20 transition-all"
            >
              <Save size={13} /> Save
            </button>
            <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg glass border border-white/10 text-white/60 text-xs hover:text-white hover:border-white/20 transition-all">
              <Share2 size={13} /> Share
            </button>
          </div>
        </div>

        {/* Editor body */}
        <div className="flex-1 overflow-auto p-4 space-y-4">
          {activeView === 'pitch' && (
            <>
              {/* Pitch + Bench Rail */}
              <div className="max-w-2xl mx-auto">
                <Pitch />
              </div>

              {/* XI panels */}
              <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
                {/* My XI */}
                <GlassCard className="p-3">
                  <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">My XI</p>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {myXI.length === 0 && <p className="text-xs text-white/20 text-center py-4">Drag players to the pitch</p>}
                    {myXI.map(({ player, slot }) => {
                      const pos = FORMATION_POSITIONS[formation]?.[slot];
                      return (
                        <div key={player.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/3 transition-all">
                          <span className="text-sm">{player.flagEmoji}</span>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-white/80 truncate">{player.shortName}</p>
                          </div>
                          <span className="text-[10px] text-white/30 font-mono">{pos?.position}</span>
                        </div>
                      );
                    })}
                  </div>
                </GlassCard>

                {/* Opponent XI */}
                <GlassCard glow="pink" className="p-3">
                  <p className="text-xs font-semibold text-pink-400/70 uppercase tracking-wider mb-2">Opponent XI</p>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {opponentXI.length === 0 && <p className="text-xs text-white/20 text-center py-4">Add opponent players</p>}
                    {opponentXI.map(({ player }) => (
                      <div key={player.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-white/3 transition-all">
                        <span className="text-sm">{player.flagEmoji}</span>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-white/80 truncate">{player.shortName}</p>
                        </div>
                        <span className="text-[10px] text-pink-400/60 font-mono">OPP</span>
                      </div>
                    ))}
                  </div>
                </GlassCard>
              </div>

              {/* Bench */}
              <div className="max-w-2xl mx-auto">
                <GlassCard className="p-3">
                  <p className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2">
                    Bench / Reserves <span className="text-white/20">({bench.length})</span>
                  </p>
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {bench.map((player) => (
                      <PlayerCard key={player.id} player={player} variant="bench" />
                    ))}
                    {MOCK_PLAYERS.filter(p => !myXI.find(m => m.player.id === p.id) && !bench.find(b => b.id === p.id)).slice(0, 3).map(player => (
                      <PlayerCard key={player.id} player={player} variant="bench" />
                    ))}
                  </div>
                </GlassCard>
              </div>
            </>
          )}

          {activeView === 'manager' && (
            <div className="max-w-2xl mx-auto">
              <SquadManager onViewPlayer={setQuickViewPlayer} />
            </div>
          )}

          {activeView === 'squad' && (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 max-w-4xl mx-auto">
              {MOCK_PLAYERS.map(player => (
                <PlayerCard key={player.id} player={player} variant="full" selected={selectedPlayerId === player.id} />
              ))}
            </div>
          )}

          {activeView === 'tactics' && (
            <div className="max-w-2xl mx-auto">
              <GlassCard className="p-6 text-center">
                <p className="text-white/40 text-sm">Tactical overlay tools coming soon</p>
                <p className="text-white/20 text-xs mt-1">Draw pressing triggers, movement arrows, and zone highlights</p>
              </GlassCard>
              <div className="mt-4">
                <Pitch />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Player detail panel */}
      <PlayerDetailPanel />

      {/* Save modal */}
      <AnimatePresence>
        {saveModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSaveModalOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={e => e.stopPropagation()}
              className="glass-card border border-white/10 rounded-2xl p-6 w-full max-w-sm"
            >
              <h3 className="text-base font-bold text-white mb-4">Save Lineup</h3>
              <input
                type="text"
                placeholder="Lineup name..."
                value={saveName}
                onChange={e => setSaveName(e.target.value)}
                className="w-full px-3 py-2.5 rounded-lg glass border border-white/10 text-white placeholder-white/30 text-sm outline-none focus:border-cyan-500/40 transition-all mb-4"
                autoFocus
              />
              <div className="flex gap-2">
                <button onClick={() => setSaveModalOpen(false)} className="flex-1 py-2 rounded-lg glass border border-white/10 text-white/60 text-sm hover:text-white transition-all">
                  Cancel
                </button>
                <button
                  onClick={() => { if (saveName) { saveCurrentLineup(saveName); setSaveModalOpen(false); setSaveName(''); } }}
                  disabled={!saveName}
                  className="flex-1 py-2 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 text-sm font-semibold hover:bg-cyan-500/30 transition-all disabled:opacity-40"
                >
                  Save
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Import modal */}
      <LineupImportModal open={importModalOpen} onClose={() => setImportModalOpen(false)} />

      {/* Player quick view */}
      {quickViewPlayer && (
        <PlayerQuickView player={quickViewPlayer} onClose={() => setQuickViewPlayer(null)} />
      )}
    </div>
  );
}
