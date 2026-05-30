'use client';

import { useLineupStore } from '@/lib/store/lineupStore';
import { MOCK_LINEUPS } from '@/lib/data/mockData';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Users, Building2, ClipboardList,
  GitCompare, Plus, ChevronLeft, ChevronRight,
  Settings, UserCircle, Zap
} from 'lucide-react';

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
  { icon: ClipboardList, label: 'Lineups', href: '/dashboard/lineups' },
  { icon: GitCompare, label: 'Compare', href: '/dashboard/compare' },
  { icon: Users, label: 'Players', href: '/dashboard/players' },
  { icon: Building2, label: 'Teams', href: '/dashboard/teams' },
];

const LEAGUES = ['Premier League', 'La Liga', 'UCL', 'Bundesliga'];

export default function Sidebar() {
  const { sidebarOpen, setSidebarOpen, lineups, activeLineupId, setActiveLineup } = useLineupStore();
  const pathname = usePathname();

  return (
    <motion.aside
      animate={{ width: sidebarOpen ? 240 : 64 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="flex flex-col h-full glass-card border-r border-white/5 overflow-hidden flex-shrink-0 relative z-10"
    >
      {/* Logo */}
      <div className="flex items-center justify-between p-4 border-b border-white/5">
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="flex items-center gap-2"
            >
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-lg" style={{ boxShadow: '0 0 16px rgba(0,245,255,0.4)' }}>
                T
              </div>
              <span className="text-white font-bold text-lg tracking-wider text-glow-cyan">TACTIX</span>
            </motion.div>
          )}
        </AnimatePresence>
        {!sidebarOpen && (
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-white font-bold text-sm mx-auto">
            T
          </div>
        )}
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="w-6 h-6 rounded-full glass flex items-center justify-center text-white/50 hover:text-white hover:bg-white/10 transition-all ml-auto"
        >
          {sidebarOpen ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto overflow-x-hidden py-3 space-y-1">
        {/* Nav items */}
        <div className="px-2 space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href}>
                <motion.div
                  whileHover={{ x: 2 }}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all cursor-pointer group',
                    active
                      ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/20'
                      : 'text-white/50 hover:text-white/80 hover:bg-white/5'
                  )}
                >
                  <item.icon size={18} className={cn('flex-shrink-0', active && 'drop-shadow-[0_0_8px_rgba(0,245,255,0.8)]')} />
                  <AnimatePresence>
                    {sidebarOpen && (
                      <motion.span
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="text-sm font-medium whitespace-nowrap"
                      >
                        {item.label}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.div>
              </Link>
            );
          })}
        </div>

        {/* My Lineups */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="px-3 pt-4"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold text-white/30 uppercase tracking-wider">My Lineups</span>
                <Link href="/dashboard/lineups/new" className="w-5 h-5 rounded flex items-center justify-center text-white/40 hover:text-cyan-400 hover:bg-cyan-500/10 transition-all">
                  <Plus size={12} />
                </Link>
              </div>
              <div className="space-y-1">
                {lineups.slice(0, 5).map((lineup) => (
                  <motion.button
                    key={lineup.id}
                    whileHover={{ x: 2 }}
                    onClick={() => setActiveLineup(lineup.id)}
                    className={cn(
                      'w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left transition-all',
                      activeLineupId === lineup.id
                        ? 'bg-cyan-500/10 text-cyan-400'
                        : 'text-white/40 hover:text-white/70 hover:bg-white/5'
                    )}
                  >
                    <span className="text-base leading-none">{lineup.teamBadge}</span>
                    <div className="min-w-0">
                      <p className="text-xs font-medium truncate">{lineup.name}</p>
                      <p className="text-[10px] text-white/30">{lineup.formation}</p>
                    </div>
                    {activeLineupId === lineup.id && (
                      <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 ml-auto flex-shrink-0 pulse-glow" />
                    )}
                  </motion.button>
                ))}
              </div>

              {/* League filter */}
              <div className="mt-4 mb-2">
                <span className="text-xs font-semibold text-white/30 uppercase tracking-wider">Leagues</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {LEAGUES.map((league) => (
                  <span key={league} className="text-[10px] px-2 py-0.5 rounded-full glass text-white/40 hover:text-cyan-400 hover:border-cyan-500/30 border border-white/5 cursor-pointer transition-all">
                    {league}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom actions */}
      <div className="p-2 border-t border-white/5 space-y-0.5">
        {[
          { icon: Settings, label: 'Settings', href: '#' },
          { icon: UserCircle, label: 'Profile', href: '#' },
        ].map((item) => (
          <Link key={item.label} href={item.href}>
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg text-white/30 hover:text-white/60 hover:bg-white/5 transition-all cursor-pointer">
              <item.icon size={16} className="flex-shrink-0" />
              <AnimatePresence>
                {sidebarOpen && (
                  <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-xs whitespace-nowrap">
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </div>
          </Link>
        ))}
      </div>
    </motion.aside>
  );
}
