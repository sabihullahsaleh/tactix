'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Player, POSITION_COLORS, PLAYER_RECENT_MATCHES, RecentMatch } from '@/lib/data/mockData';
import { getRatingColor, getInitials } from '@/lib/utils';
import { useLineupStore } from '@/lib/store/lineupStore';
import { X, GitCompare, Trophy, Building2, Flag, Star } from 'lucide-react';
import Link from 'next/link';

type Props = {
  player: Player | null;
  onClose: () => void;
};

function ResultBadge({ result }: { result: 'W' | 'L' | 'D' }) {
  const styles = {
    W: 'bg-green-500/20 text-green-400 border-green-500/30',
    L: 'bg-red-500/20 text-red-400 border-red-500/30',
    D: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  };
  return (
    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${styles[result]}`}>{result}</span>
  );
}

function RatingDot({ rating }: { rating: number }) {
  const color = getRatingColor(rating);
  return (
    <span className="text-xs font-bold font-mono" style={{ color }}>{rating.toFixed(1)}</span>
  );
}

export default function PlayerQuickView({ player, onClose }: Props) {
  const { addToCompare } = useLineupStore();

  if (!player) return null;

  const posColor = POSITION_COLORS[player.position];
  const ratingColor = getRatingColor(player.rating);
  const matches: RecentMatch[] = PLAYER_RECENT_MATCHES[player.id] ?? [];
  const clubMatches = matches.filter(m => m.type === 'club');
  const countryMatches = matches.filter(m => m.type === 'country');

  const avgRating = matches.length
    ? (matches.reduce((s, m) => s + m.rating, 0) / matches.length).toFixed(1)
    : '-';
  const totalGoals = matches.reduce((s, m) => s + m.goals, 0);
  const totalAssists = matches.reduce((s, m) => s + m.assists, 0);

  return (
    <AnimatePresence>
      <motion.div
        key="overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          key="panel"
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          transition={{ type: 'spring', stiffness: 380, damping: 30 }}
          onClick={e => e.stopPropagation()}
          className="w-full max-w-md glass-card border border-white/10 rounded-2xl overflow-hidden"
          style={{ boxShadow: `0 0 60px ${posColor}20` }}
        >
          {/* Header */}
          <div
            className="relative px-5 pt-5 pb-4"
            style={{ background: `linear-gradient(135deg, ${posColor}15 0%, transparent 60%)` }}
          >
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-7 h-7 rounded-lg flex items-center justify-center bg-white/5 hover:bg-white/10 text-white/40 hover:text-white transition-all"
            >
              <X size={14} />
            </button>

            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center border-2 overflow-hidden flex-shrink-0"
                style={{ borderColor: `${posColor}60`, background: `${posColor}20`, boxShadow: `0 0 20px ${posColor}30` }}
              >
                {player.imageUrl
                  ? <img src={player.imageUrl} alt={player.name} className="w-full h-full object-cover" />
                  : <span className="text-2xl font-bold text-white">{getInitials(player.shortName)}</span>
                }
              </div>

              {/* Identity */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider"
                    style={{ background: `${posColor}25`, color: posColor, border: `1px solid ${posColor}40` }}
                  >
                    {player.position}
                  </span>
                  <span className="text-lg">{player.flagEmoji}</span>
                </div>
                <p className="text-base font-bold text-white leading-tight truncate">{player.name}</p>
                <p className="text-xs text-white/40 mt-0.5">{player.club} · #{player.jerseyNumber}</p>
              </div>

              {/* Rating */}
              <div className="text-right flex-shrink-0">
                <p className="text-3xl font-black font-mono leading-none" style={{ color: ratingColor, textShadow: `0 0 16px ${ratingColor}60` }}>
                  {player.rating}
                </p>
                <p className="text-[9px] text-white/30 uppercase tracking-wider mt-0.5">Overall</p>
              </div>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-4 gap-2 mt-4">
              {[
                { label: 'PAC', val: player.stats.pace },
                { label: 'SHO', val: player.stats.shooting },
                { label: 'PAS', val: player.stats.passing },
                { label: 'DRI', val: player.stats.dribbling },
              ].map(({ label, val }) => (
                <div key={label} className="text-center py-1.5 rounded-lg bg-white/5">
                  <p className="text-[9px] text-white/30 uppercase tracking-wider">{label}</p>
                  <p className="text-sm font-bold font-mono text-white">{val}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Recent form summary */}
          {matches.length > 0 && (
            <div className="px-5 py-3 border-t border-white/5">
              <div className="flex items-center justify-between mb-3">
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Last 5 Matches</p>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-white/40">Avg <span className="font-bold text-white">{avgRating}</span></span>
                  <span className="text-green-400 font-bold">{totalGoals}G</span>
                  <span className="text-cyan-400 font-bold">{totalAssists}A</span>
                </div>
              </div>
              {/* Result row */}
              <div className="flex gap-1.5 mb-3">
                {matches.map((m, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <ResultBadge result={m.result} />
                    <span className="text-[8px] text-white/30 font-mono">{m.score}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Club matches */}
          {clubMatches.length > 0 && (
            <div className="px-5 py-2 border-t border-white/5">
              <div className="flex items-center gap-1.5 mb-2">
                <Building2 size={10} className="text-white/30" />
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider">Club</p>
              </div>
              <div className="space-y-1.5">
                {clubMatches.slice(0, 3).map((m, i) => (
                  <div key={i} className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-white/3 transition-all">
                    <ResultBadge result={m.result} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white/80 font-medium truncate">vs {m.opponent}</p>
                      <p className="text-[9px] text-white/30">{m.competition} · {m.date}</p>
                    </div>
                    <span className="text-[10px] font-mono text-white/50">{m.score}</span>
                    <RatingDot rating={m.rating} />
                    {(m.goals > 0 || m.assists > 0) && (
                      <div className="flex items-center gap-1">
                        {m.goals > 0 && <span className="text-[9px] font-bold text-green-400">{m.goals}G</span>}
                        {m.assists > 0 && <span className="text-[9px] font-bold text-cyan-400">{m.assists}A</span>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Country matches */}
          {countryMatches.length > 0 && (
            <div className="px-5 py-2 border-t border-white/5">
              <div className="flex items-center gap-1.5 mb-2">
                <Flag size={10} className="text-white/30" />
                <p className="text-[10px] font-bold text-white/40 uppercase tracking-wider">
                  International <span className="text-white/20">{player.flagEmoji}</span>
                </p>
              </div>
              <div className="space-y-1.5">
                {countryMatches.slice(0, 2).map((m, i) => (
                  <div key={i} className="flex items-center gap-2 py-1.5 px-2 rounded-lg hover:bg-white/3 transition-all">
                    <ResultBadge result={m.result} />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-white/80 font-medium truncate">vs {m.opponent}</p>
                      <p className="text-[9px] text-white/30">{m.competition} · {m.date}</p>
                    </div>
                    <span className="text-[10px] font-mono text-white/50">{m.score}</span>
                    <RatingDot rating={m.rating} />
                    {(m.goals > 0 || m.assists > 0) && (
                      <div className="flex items-center gap-1">
                        {m.goals > 0 && <span className="text-[9px] font-bold text-green-400">{m.goals}G</span>}
                        {m.assists > 0 && <span className="text-[9px] font-bold text-cyan-400">{m.assists}A</span>}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="px-5 py-4 border-t border-white/5 flex gap-2">
            <button
              onClick={() => { addToCompare(player.id); onClose(); }}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 text-xs font-semibold hover:bg-purple-500/25 transition-all"
            >
              <GitCompare size={12} /> Compare
            </button>
            <Link
              href={`/dashboard/compare?p1=${player.id}`}
              onClick={onClose}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-400 text-xs font-semibold hover:bg-cyan-500/25 transition-all"
            >
              <Star size={12} /> Full Compare
            </Link>
            <Link
              href={`/dashboard/players/${player.id}`}
              onClick={onClose}
              className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-white/5 border border-white/10 text-white/60 text-xs font-semibold hover:bg-white/10 transition-all"
            >
              Profile
            </Link>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
