'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Bell, Zap, ChevronDown } from 'lucide-react';
import { MOCK_PLAYERS } from '@/lib/data/mockData';
import { cn } from '@/lib/utils';
import Link from 'next/link';

export default function TopBar() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchOpen, setSearchOpen] = useState(false);

  const filteredPlayers = searchQuery.length > 1
    ? MOCK_PLAYERS.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.club.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 5)
    : [];

  return (
    <header className="h-14 glass-card border-b border-white/5 flex items-center px-4 gap-4 flex-shrink-0 relative z-20">
      {/* Search */}
      <div className="relative flex-1 max-w-md">
        <div className={cn(
          'flex items-center gap-2 px-3 py-2 rounded-lg border transition-all',
          searchOpen
            ? 'bg-white/8 border-cyan-500/40 shadow-[0_0_12px_rgba(0,245,255,0.15)]'
            : 'glass border-white/8 hover:border-white/15'
        )}>
          <Search size={15} className="text-white/40 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search players, teams..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onFocus={() => setSearchOpen(true)}
            onBlur={() => setTimeout(() => setSearchOpen(false), 150)}
            className="bg-transparent text-sm text-white placeholder-white/30 outline-none w-full"
          />
          {searchQuery && (
            <kbd className="text-[10px] text-white/20 border border-white/10 rounded px-1">ESC</kbd>
          )}
        </div>

        <AnimatePresence>
          {searchOpen && filteredPlayers.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="absolute top-full mt-2 w-full glass-card border border-white/10 rounded-xl overflow-hidden shadow-2xl z-50"
            >
              {filteredPlayers.map((player) => (
                <Link key={player.id} href={`/dashboard/players/${player.id}`}>
                  <div className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 transition-all cursor-pointer">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-white/10 flex items-center justify-center text-xs font-bold text-cyan-400">
                      {player.flagEmoji}
                    </div>
                    <div>
                      <p className="text-sm text-white font-medium">{player.name}</p>
                      <p className="text-xs text-white/40">{player.club} · {player.position}</p>
                    </div>
                    <span className="ml-auto text-xs font-bold text-cyan-400">{player.rating}</span>
                  </div>
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className="flex items-center gap-2 ml-auto">
        {/* Notification */}
        <button className="w-8 h-8 rounded-lg glass border border-white/8 flex items-center justify-center text-white/40 hover:text-white/70 hover:border-white/15 transition-all relative">
          <Bell size={15} />
          <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-cyan-400" />
        </button>

        {/* Quick action */}
        <Link href="/dashboard/lineups/new">
          <motion.span
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 text-xs font-medium hover:bg-cyan-500/25 transition-all cursor-pointer"
            style={{ boxShadow: '0 0 12px rgba(0,245,255,0.1)' }}
          >
            <Zap size={13} />
            New Lineup
          </motion.span>
        </Link>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center text-white text-xs font-bold cursor-pointer hover:opacity-90 transition-all" style={{ boxShadow: '0 0 12px rgba(191,95,255,0.3)' }}>
          S
        </div>
      </div>
    </header>
  );
}
