'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { MOCK_PLAYERS, POSITIONS, LEAGUES } from '@/lib/data/mockData';
import PlayerCard from '@/components/cards/PlayerCard';
import { useLineupStore } from '@/lib/store/lineupStore';
import { Search, LayoutGrid, List, Filter } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function PlayersPage() {
  const [search, setSearch] = useState('');
  const [posFilter, setPosFilter] = useState('All');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const { selectedPlayerId, setSelectedPlayer } = useLineupStore();

  const filtered = MOCK_PLAYERS.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || p.club.toLowerCase().includes(search.toLowerCase());
    const matchPos = posFilter === 'All' || p.position === posFilter;
    return matchSearch && matchPos;
  });

  const posFilters = ['All', 'GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LW', 'RW', 'ST'];

  return (
    <div className="p-6 space-y-5 max-w-7xl mx-auto">
      <div>
        <h1 className="text-xl font-bold text-white">Player Database</h1>
        <p className="text-white/40 text-sm">{filtered.length} players found</p>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        {/* Search */}
        <div className="flex items-center gap-2 px-3 py-2 rounded-xl glass border border-white/8 hover:border-white/15 transition-all flex-1 min-w-[200px] max-w-xs">
          <Search size={14} className="text-white/40 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search players..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="bg-transparent text-sm text-white placeholder-white/30 outline-none w-full"
          />
        </div>

        {/* Position filter */}
        <div className="flex gap-1.5 flex-wrap">
          {posFilters.map(pos => (
            <button
              key={pos}
              onClick={() => setPosFilter(pos)}
              className={cn(
                'px-2.5 py-1 rounded-lg text-xs font-semibold transition-all',
                posFilter === pos
                  ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-400'
                  : 'glass border border-white/8 text-white/40 hover:text-white/70'
              )}
            >
              {pos}
            </button>
          ))}
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-1 glass border border-white/8 rounded-lg p-0.5 ml-auto">
          {[{ id: 'grid', icon: LayoutGrid }, { id: 'list', icon: List }].map(({ id, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setViewMode(id as 'grid' | 'list')}
              className={cn(
                'p-1.5 rounded-md transition-all',
                viewMode === id ? 'bg-cyan-500/20 text-cyan-400' : 'text-white/30 hover:text-white/60'
              )}
            >
              <Icon size={15} />
            </button>
          ))}
        </div>
      </div>

      {/* Players grid / list */}
      {viewMode === 'grid' ? (
        <motion.div layout className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3">
          {filtered.map((player, i) => (
            <motion.div
              key={player.id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.03 }}
            >
              <PlayerCard
                player={player}
                variant="full"
                selected={selectedPlayerId === player.id}
                onClick={() => setSelectedPlayer(selectedPlayerId === player.id ? null : player.id)}
              />
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <div className="space-y-2">
          {/* Table header */}
          <div className="grid grid-cols-12 px-4 py-2 text-[10px] font-semibold text-white/30 uppercase tracking-wider">
            <span className="col-span-1">#</span>
            <span className="col-span-3">Player</span>
            <span className="col-span-1">Pos</span>
            <span className="col-span-2">Club</span>
            <span className="col-span-1 text-center">OVR</span>
            <span className="col-span-1 text-center">Goals</span>
            <span className="col-span-1 text-center">Ast</span>
            <span className="col-span-1 text-center">PAC</span>
            <span className="col-span-1 text-center">SHO</span>
          </div>
          {filtered.map((player, i) => (
            <motion.div
              key={player.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.02 }}
              className="grid grid-cols-12 items-center px-4 py-3 rounded-xl glass border border-white/5 hover:border-white/12 transition-all cursor-pointer"
              onClick={() => setSelectedPlayer(selectedPlayerId === player.id ? null : player.id)}
            >
              <span className="col-span-1 text-sm font-bold text-white/20">{i + 1}</span>
              <div className="col-span-3 flex items-center gap-2">
                <span className="text-base">{player.flagEmoji}</span>
                <div>
                  <p className="text-sm font-semibold text-white">{player.name}</p>
                  <p className="text-[10px] text-white/30">{player.nationality} · {player.age}y</p>
                </div>
              </div>
              <span className="col-span-1 text-xs text-white/50">{player.position}</span>
              <span className="col-span-2 text-xs text-white/50 truncate">{player.club}</span>
              <span className="col-span-1 text-center text-sm font-black font-mono" style={{ color: player.rating >= 90 ? '#f59e0b' : '#00f5ff' }}>{player.rating}</span>
              <span className="col-span-1 text-center text-xs text-white/60">{player.stats.goals}</span>
              <span className="col-span-1 text-center text-xs text-white/60">{player.stats.assists}</span>
              <span className="col-span-1 text-center text-xs text-white/60">{player.stats.pace}</span>
              <span className="col-span-1 text-center text-xs text-white/60">{player.stats.shooting}</span>
            </motion.div>
          ))}
        </div>
      )}

      {filtered.length === 0 && (
        <div className="text-center py-12 text-white/30">
          <p className="text-sm">No players found for &quot;{search}&quot;</p>
        </div>
      )}
    </div>
  );
}
