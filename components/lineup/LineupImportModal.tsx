'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MOCK_TEAMS, FORMATION_POSITIONS, Formation, POSITION_COLORS, Player } from '@/lib/data/mockData';
import { useLineupStore } from '@/lib/store/lineupStore';
import { X, Zap, Loader2, AlertCircle, CheckCircle2, ChevronDown, Wifi, Search } from 'lucide-react';
import type { ImportedPlayer } from '@/app/api/lineup/route';
import { cn, getInitials } from '@/lib/utils';

type Props = {
  open: boolean;
  onClose: () => void;
};

const DEFAULT_FORMATION: Formation = '4-3-3';

function toPlayer(p: ImportedPlayer, teamName: string): Player {
  return {
    id: `ai-${p.externalId}`,
    name: p.name,
    shortName: p.shortName,
    position: p.position,
    nationality: p.nationality,
    flagEmoji: '🌐',
    club: teamName,
    clubBadge: '⚽',
    age: 0, height: 0, weight: 0,
    foot: 'Right',
    jerseyNumber: p.jerseyNumber,
    rating: 80,
    marketValue: '',
    imageUrl: '',
    stats: {
      pace: 75, shooting: 75, passing: 75, dribbling: 75,
      defending: 75, physical: 75, goals: 0, assists: 0,
      matchRating: 7.0, passAccuracy: 80, sprintSpeed: 30,
      tackles: 50, dribbles: 50, xG: 0,
    },
  };
}

function distributeSquad(squad: ImportedPlayer[], teamName: string) {
  const positions = FORMATION_POSITIONS[DEFAULT_FORMATION];
  const used = new Set<number>();
  const xi: { player: Player; slot: number }[] = [];

  for (const posSlot of positions) {
    const match =
      squad.find(p => !used.has(p.externalId) && p.position === posSlot.position) ??
      squad.find(p => !used.has(p.externalId));
    if (match) {
      used.add(match.externalId);
      xi.push({ player: toPlayer(match, teamName), slot: posSlot.slot });
    }
  }

  const remaining = squad.filter(p => !used.has(p.externalId));
  const subs = remaining.slice(0, 9).map(p => toPlayer(p, teamName));
  const reserves = remaining.slice(9).map(p => toPlayer(p, teamName));

  return { xi, subs, reserves };
}

// ── Types for API-Football responses ─────────────────────────────────────

type ApfTeam = { id: number; name: string; logo: string; country: string };

type ApfPlayer = Player & { _broadPos?: string };

// ── Smart slot distribution using real broad positions ────────────────────

const BROAD_PRIORITY: Record<string, string[]> = {
  Goalkeeper: ['GK'],
  Defender:   ['CB', 'RB', 'LB'],
  Midfielder: ['CDM', 'CM', 'CAM', 'LM', 'RM'],
  Attacker:   ['ST', 'CF', 'RW', 'LW'],
};

function distributeRealSquad(
  players: ApfPlayer[],
  formation: Formation,
): { xi: { player: Player; slot: number }[]; subs: Player[]; reserves: Player[] } {
  const positions = FORMATION_POSITIONS[formation];
  const used = new Set<string>();
  const xi: { player: Player; slot: number }[] = [];

  for (const posSlot of positions) {
    // Find player whose broad position covers this slot's position
    const match = players.find(p => {
      if (used.has(p.id)) return false;
      const allowed = BROAD_PRIORITY[p._broadPos ?? ''] ?? [];
      return allowed.includes(posSlot.position);
    }) ?? players.find(p => !used.has(p.id)); // fallback: any unused

    if (match) {
      used.add(match.id);
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { _broadPos: _, ...cleanPlayer } = match as ApfPlayer & { _broadPos?: string };
      xi.push({ player: cleanPlayer as Player, slot: posSlot.slot });
    }
  }

  const remaining = players.filter(p => !used.has(p.id)).map(p => {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { _broadPos: _, ...clean } = p as ApfPlayer & { _broadPos?: string };
    return clean as Player;
  });

  return { xi, subs: remaining.slice(0, 9), reserves: remaining.slice(9) };
}

// ── Live Squad tab component ──────────────────────────────────────────────

function LiveSquadTab({ onImported }: { onImported: () => void }) {
  const { setFullSquad } = useLineupStore();
  const [query, setQuery] = useState('');
  const [teams, setTeams] = useState<ApfTeam[]>([]);
  const [searching, setSearching] = useState(false);
  const [searchErr, setSearchErr] = useState('');
  const [selectedTeam, setSelectedTeam] = useState<ApfTeam | null>(null);
  const [squad, setSquad] = useState<ApfPlayer[]>([]);
  const [loadingSquad, setLoadingSquad] = useState(false);
  const [squadErr, setSquadErr] = useState('');
  const [formation, setFormation] = useState<Formation>('4-3-3');
  const [importing, setImporting] = useState(false);
  const [imported, setImported] = useState(false);
  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounced team search
  useEffect(() => {
    if (query.length < 2) { setTeams([]); setSearchErr(''); return; }
    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(async () => {
      setSearching(true);
      setSearchErr('');
      try {
        const res = await fetch(`/api/football/teams?q=${encodeURIComponent(query)}`);
        const data = await res.json();
        if (data.error === 'NO_KEY') {
          setSearchErr('Add API_FOOTBALL_KEY to .env.local to enable live squad data.');
          return;
        }
        if (data.error) { setSearchErr(data.error); return; }
        setTeams(data.teams ?? []);
        if (!data.teams?.length) setSearchErr('No teams found — try a different name.');
      } catch {
        setSearchErr('Search failed. Check your connection.');
      } finally {
        setSearching(false);
      }
    }, 450);
  }, [query]);

  const loadSquad = async (team: ApfTeam) => {
    setSelectedTeam(team);
    setTeams([]);
    setQuery(team.name);
    setSquad([]);
    setSquadErr('');
    setImported(false);
    setLoadingSquad(true);
    try {
      const res = await fetch(
        `/api/football/squad?teamId=${team.id}&teamName=${encodeURIComponent(team.name)}&season=2024`
      );
      const data = await res.json();
      if (data.error) { setSquadErr(data.error); return; }
      setSquad(data.players ?? []);
    } catch {
      setSquadErr('Could not load squad. Try again.');
    } finally {
      setLoadingSquad(false);
    }
  };

  const handleImport = () => {
    if (!squad.length) return;
    setImporting(true);
    const { xi, subs, reserves } = distributeRealSquad(squad, formation);
    setFullSquad(xi, subs, reserves, formation);
    setImported(true);
    setImporting(false);
    setTimeout(onImported, 1200);
  };

  const FORMATIONS: Formation[] = ['4-3-3', '4-2-3-1', '4-4-2', '3-5-2', '3-4-3', '5-3-2', '4-1-4-1'];

  return (
    <div className="space-y-3">
      {/* Team search */}
      <div className="relative">
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl glass border border-cyan-500/20 focus-within:border-cyan-500/40 transition-all">
          {searching ? <Loader2 size={13} className="text-cyan-400/60 animate-spin flex-shrink-0" /> : <Search size={13} className="text-white/30 flex-shrink-0" />}
          <input
            value={query}
            onChange={e => { setQuery(e.target.value); setSelectedTeam(null); setSquad([]); }}
            placeholder="Search any team — e.g. Arsenal, PSG, Bayern…"
            className="flex-1 bg-transparent text-white text-sm outline-none placeholder-white/25"
          />
          {query && (
            <button onClick={() => { setQuery(''); setTeams([]); setSelectedTeam(null); setSquad([]); }}>
              <X size={12} className="text-white/30 hover:text-white/60" />
            </button>
          )}
        </div>

        {/* Team dropdown */}
        <AnimatePresence>
          {teams.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              className="absolute top-full mt-1 left-0 right-0 glass-card border border-white/10 rounded-xl overflow-hidden shadow-2xl z-10"
            >
              {teams.slice(0, 7).map(t => (
                <button
                  key={t.id}
                  onClick={() => loadSquad(t)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 transition-all text-left"
                >
                  {t.logo
                    ? <img src={t.logo} alt={t.name} className="w-7 h-7 object-contain flex-shrink-0" />
                    : <div className="w-7 h-7 rounded-full bg-white/10 flex-shrink-0" />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white truncate">{t.name}</p>
                    <p className="text-[10px] text-white/35">{t.country}</p>
                  </div>
                </button>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {searchErr && (
        <p className="text-xs text-yellow-400/80 flex items-start gap-1.5 px-1">
          <AlertCircle size={12} className="flex-shrink-0 mt-0.5" />
          {searchErr}
        </p>
      )}

      {/* Formation selector */}
      {(selectedTeam || squad.length > 0) && (
        <div className="flex items-center gap-2">
          <span className="text-xs text-white/40">Formation:</span>
          <div className="relative">
            <select
              value={formation}
              onChange={e => setFormation(e.target.value as Formation)}
              className="pl-3 pr-7 py-1.5 rounded-lg glass border border-white/10 text-cyan-400 text-xs font-mono font-bold bg-transparent outline-none appearance-none"
            >
              {FORMATIONS.map(f => <option key={f} value={f} className="bg-[#111118]">{f}</option>)}
            </select>
            <ChevronDown size={11} className="absolute right-2 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
          </div>
        </div>
      )}

      {/* Loading squad */}
      {loadingSquad && (
        <div className="flex items-center justify-center gap-2 py-6 text-white/40 text-sm">
          <Loader2 size={16} className="animate-spin text-cyan-400" />
          Loading squad from API-Football…
        </div>
      )}

      {squadErr && (
        <div className="flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
          <AlertCircle size={13} className="flex-shrink-0 mt-0.5" />
          {squadErr}
        </div>
      )}

      {/* Squad preview */}
      {squad.length > 0 && !imported && (
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs text-white/40 font-semibold uppercase tracking-wider">
              {selectedTeam?.name} — {squad.length} players
            </p>
            {selectedTeam?.logo && (
              <img src={selectedTeam.logo} alt="" className="w-6 h-6 object-contain opacity-70" />
            )}
          </div>
          <div className="max-h-52 overflow-y-auto space-y-1 pr-1">
            {squad.map(p => {
              const posColor = POSITION_COLORS[p.position] ?? '#888';
              return (
                <div key={p.id} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-white/3 border border-white/5">
                  {/* Photo */}
                  <div
                    className="w-7 h-7 rounded-full overflow-hidden flex items-center justify-center flex-shrink-0 border text-[9px] font-bold text-white"
                    style={{ borderColor: `${posColor}40`, background: `${posColor}20` }}
                  >
                    {p.imageUrl
                      ? <img src={p.imageUrl} alt={p.shortName} className="w-full h-full object-cover" onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }} />
                      : getInitials(p.shortName)}
                  </div>
                  {/* Position badge */}
                  <span
                    className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase flex-shrink-0 w-8 text-center"
                    style={{ color: posColor, background: `${posColor}20` }}
                  >
                    {p.position}
                  </span>
                  <span className="text-xs text-white/80 flex-1 truncate">{p.name}</span>
                  {p.jerseyNumber > 0 && (
                    <span className="text-[10px] text-white/30 font-mono flex-shrink-0">#{p.jerseyNumber}</span>
                  )}
                  {/* Stats hint */}
                  <span className="text-[9px] text-white/20 font-mono flex-shrink-0">
                    {p.stats.goals}G {p.stats.assists}A
                  </span>
                </div>
              );
            })}
          </div>
          <button
            onClick={handleImport}
            disabled={importing}
            className="w-full mt-3 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 border border-cyan-500/30 text-cyan-400 text-sm font-semibold hover:from-cyan-500/30 hover:to-emerald-500/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {importing
              ? <><Loader2 size={13} className="animate-spin" /> Importing…</>
              : <>Import to Pitch ({formation})</>}
          </button>
        </div>
      )}

      {imported && (
        <div className="flex items-center justify-center gap-2 text-emerald-400 text-sm font-semibold py-2">
          <CheckCircle2 size={16} />
          Squad imported!
        </div>
      )}

      <p className="text-[10px] text-white/20 text-center pt-1">
        Live data · Powered by API-Football · Season 2024/25
      </p>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────

export default function LineupImportModal({ open, onClose }: Props) {
  const { setFullSquad } = useLineupStore();

  const [mode, setMode] = useState<'preset' | 'custom' | 'live'>('live');
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [customTeam, setCustomTeam] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [preview, setPreview] = useState<{ teamName: string; squad: ImportedPlayer[] } | null>(null);
  const [imported, setImported] = useState(false);

  const resolvedTeamName =
    mode === 'custom'
      ? customTeam.trim()
      : MOCK_TEAMS.find(t => t.id === selectedTeamId)?.name ?? '';

  const handleFetch = async () => {
    if (!resolvedTeamName) return;
    setLoading(true);
    setError('');
    setPreview(null);
    setImported(false);
    try {
      const res = await fetch(`/api/lineup?teamName=${encodeURIComponent(resolvedTeamName)}`);
      const data = await res.json();
      if (!res.ok) {
        setError(data.error ?? 'Failed to fetch lineup');
        return;
      }
      if (!data.squad?.length) {
        setError('No squad data returned. Try a different team name.');
        return;
      }
      setPreview({ teamName: data.teamName, squad: data.squad });
    } catch {
      setError('Network error — could not reach the lineup service.');
    } finally {
      setLoading(false);
    }
  };

  const handleImport = () => {
    if (!preview) return;
    const { xi, subs, reserves } = distributeSquad(preview.squad, preview.teamName);
    setFullSquad(xi, subs, reserves, DEFAULT_FORMATION);
    setImported(true);
    setTimeout(handleClose, 1400);
  };

  const handleClose = () => {
    setSelectedTeamId('');
    setCustomTeam('');
    setPreview(null);
    setError('');
    setImported(false);
    onClose();
  };

  const canFetch = resolvedTeamName.length > 1 && !loading;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            onClick={e => e.stopPropagation()}
            className="glass-card border border-white/10 rounded-2xl p-6 w-full max-w-md"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <div className={cn(
                  'w-6 h-6 rounded-lg flex items-center justify-center',
                  mode === 'live'
                    ? 'bg-emerald-500/20 border border-emerald-500/40'
                    : 'bg-purple-500/20 border border-purple-500/40'
                )}>
                  {mode === 'live'
                    ? <Wifi size={12} className="text-emerald-400" />
                    : <Zap size={12} className="text-purple-400" />}
                </div>
                <h3 className="text-base font-bold text-white">
                  {mode === 'live' ? 'Live Squad Import' : 'AI Squad Import'}
                </h3>
              </div>
              <button
                onClick={handleClose}
                className="w-6 h-6 rounded-full glass flex items-center justify-center text-white/40 hover:text-white transition-all"
              >
                <X size={13} />
              </button>
            </div>

            {/* Mode tabs */}
            <div className="flex items-center gap-1 glass border border-white/8 rounded-lg p-0.5 mb-4">
              <button
                onClick={() => { setMode('live'); setPreview(null); setError(''); }}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-all',
                  mode === 'live' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'text-white/40 hover:text-white/70'
                )}
              >
                <Wifi size={10} /> Live Data
              </button>
              <button
                onClick={() => { setMode('preset'); setPreview(null); setError(''); }}
                className={cn(
                  'flex-1 py-1.5 rounded-md text-xs font-medium transition-all',
                  mode === 'preset' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-white/40 hover:text-white/70'
                )}
              >
                Preset
              </button>
              <button
                onClick={() => { setMode('custom'); setPreview(null); setError(''); }}
                className={cn(
                  'flex-1 py-1.5 rounded-md text-xs font-medium transition-all',
                  mode === 'custom' ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30' : 'text-white/40 hover:text-white/70'
                )}
              >
                AI (any team)
              </button>
            </div>

            {/* Live Squad tab */}
            {mode === 'live' && (
              <LiveSquadTab onImported={handleClose} />
            )}

            {/* AI tabs (preset / custom) */}
            {mode !== 'live' && (
              <>
                <div className="space-y-3">
                  {mode === 'preset' ? (
                    <div className="relative">
                      <select
                        value={selectedTeamId}
                        onChange={e => { setSelectedTeamId(e.target.value); setPreview(null); setError(''); }}
                        className="w-full px-3 py-2.5 rounded-xl glass border border-white/10 text-white text-sm bg-transparent outline-none focus:border-cyan-500/40 transition-all appearance-none"
                      >
                        <option value="" className="bg-[#111118]">Select a team...</option>
                        {MOCK_TEAMS.map(t => (
                          <option key={t.id} value={t.id} className="bg-[#111118]">
                            {t.badge} {t.name}
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={13} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 pointer-events-none" />
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={customTeam}
                      onChange={e => { setCustomTeam(e.target.value); setPreview(null); setError(''); }}
                      onKeyDown={e => e.key === 'Enter' && canFetch && handleFetch()}
                      placeholder="e.g. Borussia Dortmund, PSG, Juventus..."
                      className="w-full px-3 py-2.5 rounded-xl glass border border-white/10 text-white text-sm bg-transparent outline-none focus:border-purple-500/40 transition-all placeholder-white/25"
                    />
                  )}

                  <button
                    onClick={handleFetch}
                    disabled={!canFetch}
                    className="w-full py-2.5 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 text-sm font-semibold hover:bg-purple-500/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading
                      ? <><Loader2 size={14} className="animate-spin" /> Fetching squad...</>
                      : <><Zap size={13} /> Fetch Squad with AI</>}
                  </button>
                </div>

                {/* Error */}
                {error && (
                  <div className="mt-3 flex items-start gap-2 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
                    <AlertCircle size={13} className="flex-shrink-0 mt-0.5" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Squad preview */}
                {preview && !imported && (
                  <div className="mt-4">
                    <p className="text-xs text-white/40 font-semibold uppercase tracking-wider mb-2">
                      {preview.teamName} — {preview.squad.length} players
                    </p>
                    <div className="max-h-52 overflow-y-auto space-y-1 pr-1">
                      {preview.squad.map(p => (
                        <div key={p.externalId} className="flex items-center gap-2 px-2 py-1.5 rounded-lg bg-white/3 border border-white/5">
                          <span
                            className="text-[9px] font-bold px-1.5 py-0.5 rounded uppercase flex-shrink-0"
                            style={{ color: POSITION_COLORS[p.position], background: `${POSITION_COLORS[p.position]}20` }}
                          >
                            {p.position}
                          </span>
                          <span className="text-xs text-white/80 flex-1 truncate">{p.name}</span>
                          {p.jerseyNumber > 0 && (
                            <span className="text-[10px] text-white/30 font-mono flex-shrink-0">#{p.jerseyNumber}</span>
                          )}
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={handleImport}
                      className="w-full mt-3 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500/20 to-purple-600/20 border border-cyan-500/30 text-cyan-400 text-sm font-semibold hover:from-cyan-500/30 hover:to-purple-600/30 transition-all"
                    >
                      Import to Pitch (4-3-3)
                    </button>
                  </div>
                )}

                {/* Success */}
                {imported && (
                  <div className="mt-4 flex items-center justify-center gap-2 text-green-400 text-sm font-semibold">
                    <CheckCircle2 size={16} />
                    Lineup imported!
                  </div>
                )}

                <p className="text-[10px] text-white/20 mt-4 text-center">
                  Powered by AI · Based on training data, not live feeds
                </p>
              </>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
