'use client';

import { useState, useRef, useCallback, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MOCK_PLAYERS, POSITION_COLORS } from '@/lib/data/mockData';
import { getRatingColor, getStatColor, getInitials, cn } from '@/lib/utils';
import PlayerRadarChart from '@/components/comparison/RadarChart';
import {
  Search, X, Sparkles, Loader2, Camera, Plus, Trash2,
  ChevronDown, ChevronUp, GitCompare, User, Edit3, Check,
} from 'lucide-react';

// ── Types ─────────────────────────────────────────────────────────────────

type PlayerStats = {
  pace: number; shooting: number; passing: number; dribbling: number;
  defending: number; physical: number; goals: number; assists: number;
  matchRating: number; passAccuracy: number; sprintSpeed: number;
  tackles: number; dribbles: number; xG: number;
};

type Characteristics = {
  strengths: string[];
  weaknesses: string[];
  playingStyle: string;
  bestRole: string;
  tacticalNotes: string;
};

type ComparePlayer = {
  id: string;
  name: string;
  shortName: string;
  position: string;
  club: string;
  nationality: string;
  age: number;
  height: number;
  weight: number;
  foot: string;
  jerseyNumber: number;
  marketValue: string;
  imageUrl: string;
  stats: PlayerStats;
  characteristics: Characteristics;
};

// ── Defaults ──────────────────────────────────────────────────────────────

const EMPTY_STATS: PlayerStats = {
  pace: 70, shooting: 70, passing: 70, dribbling: 70,
  defending: 50, physical: 70, goals: 0, assists: 0,
  matchRating: 7.0, passAccuracy: 75, sprintSpeed: 30,
  tackles: 30, dribbles: 50, xG: 0,
};

const EMPTY_CHARS: Characteristics = {
  strengths: [],
  weaknesses: [],
  playingStyle: '',
  bestRole: '',
  tacticalNotes: '',
};

function blankPlayer(side: 1 | 2): ComparePlayer {
  return {
    id: `custom-${side}-${Date.now()}`,
    name: '', shortName: '', position: 'ST', club: '', nationality: '',
    age: 0, height: 180, weight: 75, foot: 'Right', jerseyNumber: 0,
    marketValue: '', imageUrl: '', stats: { ...EMPTY_STATS }, characteristics: { ...EMPTY_CHARS, strengths: [], weaknesses: [] },
  };
}

function fromMock(p: typeof MOCK_PLAYERS[0]): ComparePlayer {
  return {
    id: p.id, name: p.name, shortName: p.shortName, position: p.position,
    club: p.club, nationality: p.nationality, age: p.age, height: p.height,
    weight: p.weight, foot: p.foot, jerseyNumber: p.jerseyNumber,
    marketValue: p.marketValue, imageUrl: p.imageUrl,
    stats: { ...p.stats },
    characteristics: { ...EMPTY_CHARS, strengths: [], weaknesses: [] },
  };
}

// ── Player Search Dropdown ────────────────────────────────────────────────

function PlayerSearch({
  side, onSelect,
}: {
  side: 1 | 2;
  onSelect: (p: ComparePlayer) => void;
}) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const color = side === 1 ? '#00f5ff' : '#ff006e';

  const filtered = MOCK_PLAYERS.filter(p => {
    const q = query.toLowerCase();
    return (
      p.name.toLowerCase().includes(q) ||
      p.club.toLowerCase().includes(q) ||
      p.nationality.toLowerCase().includes(q) ||
      p.position.toLowerCase().includes(q)
    );
  }).slice(0, 8);

  return (
    <div className="relative">
      <div
        className="flex items-center gap-2 px-3 py-2 rounded-xl border glass focus-within:border-opacity-60 transition-all"
        style={{ borderColor: `${color}30` }}
        onClick={() => setOpen(true)}
      >
        <Search size={13} style={{ color: `${color}80` }} />
        <input
          value={query}
          onChange={e => { setQuery(e.target.value); setOpen(true); }}
          onFocus={() => setOpen(true)}
          placeholder="Search by name, club or nationality…"
          className="flex-1 bg-transparent text-white text-sm outline-none placeholder-white/30"
        />
        {query && (
          <button onClick={() => { setQuery(''); setOpen(false); }}>
            <X size={12} className="text-white/30 hover:text-white/60" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="absolute top-full mt-1 left-0 right-0 glass-card border rounded-xl overflow-hidden shadow-2xl z-20"
              style={{ borderColor: `${color}20` }}
            >
              {filtered.length === 0 ? (
                <p className="px-3 py-3 text-xs text-white/30 text-center">No players found</p>
              ) : (
                filtered.map(p => {
                  const posColor = POSITION_COLORS[p.position as keyof typeof POSITION_COLORS] ?? '#888';
                  return (
                    <button
                      key={p.id}
                      onClick={() => { onSelect(fromMock(p)); setOpen(false); setQuery(''); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-white/5 transition-all text-left"
                    >
                      <div
                        className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold flex-shrink-0 overflow-hidden border"
                        style={{ background: `${posColor}20`, borderColor: `${posColor}40` }}
                      >
                        {p.imageUrl
                          ? <img src={p.imageUrl} alt={p.shortName} className="w-full h-full object-cover" />
                          : getInitials(p.shortName)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-white truncate">{p.name}</p>
                        <p className="text-[10px] text-white/40 truncate">{p.club} · {p.nationality}</p>
                      </div>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ color: posColor, background: `${posColor}20` }}>
                        {p.position}
                      </span>
                      <span className="text-xs font-black font-mono" style={{ color: getRatingColor(p.rating) }}>{p.rating}</span>
                    </button>
                  );
                })
              )}

              {/* Custom player option */}
              <button
                onClick={() => { onSelect(blankPlayer(side)); setOpen(false); setQuery(''); }}
                className="w-full flex items-center gap-2 px-3 py-2.5 border-t border-white/5 hover:bg-white/5 transition-all text-left"
              >
                <div className="w-8 h-8 rounded-full border border-dashed border-white/20 flex items-center justify-center flex-shrink-0">
                  <Plus size={12} className="text-white/30" />
                </div>
                <div>
                  <p className="text-xs font-semibold text-white/60">Custom player</p>
                  <p className="text-[10px] text-white/30">Enter any player manually or fetch from AI</p>
                </div>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Photo Upload (local, self-contained) ──────────────────────────────────

function PhotoUpload({
  imageUrl, name, color, onUpload,
}: {
  imageUrl: string; name: string; color: string; onUpload: (url: string) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setLoading(true);
    const url = URL.createObjectURL(file);
    setTimeout(() => { onUpload(url); setLoading(false); }, 200);
  };

  return (
    <div className="relative group">
      <input ref={inputRef} type="file" accept="image/*" className="hidden"
        onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])} />
      <button
        onClick={() => inputRef.current?.click()}
        className="relative w-28 h-28 rounded-full overflow-hidden flex items-center justify-center"
        style={{ border: `3px solid ${color}`, boxShadow: `0 0 30px ${color}40` }}
      >
        {imageUrl ? (
          <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center gap-1"
            style={{ background: `radial-gradient(circle, ${color}20, transparent)` }}>
            <span className="text-2xl font-black text-white/60">{getInitials(name) || '?'}</span>
          </div>
        )}
        {/* Hover overlay */}
        {!loading && (
          <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
            <Camera size={18} className="text-white" />
            <span className="text-[9px] text-white/80 font-medium">Upload</span>
          </div>
        )}
        {loading && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center rounded-full">
            <Loader2 size={16} className="text-white animate-spin" />
          </div>
        )}
      </button>
    </div>
  );
}

// ── Inline Editable Field ─────────────────────────────────────────────────

function EditField({
  label, value, onChange, type = 'text', className = '',
}: {
  label: string; value: string | number; onChange: (v: string) => void;
  type?: string; className?: string;
}) {
  return (
    <div className={cn('flex flex-col gap-0.5', className)}>
      <span className="text-[9px] text-white/30 uppercase tracking-wider font-semibold">{label}</span>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        className="bg-transparent border-b border-white/10 focus:border-white/30 text-white text-sm outline-none transition-colors pb-0.5 min-w-0 w-full"
      />
    </div>
  );
}

// ── Stat Slider ───────────────────────────────────────────────────────────

function StatSlider({ label, value, onChange }: { label: string; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-[10px] text-white/40 w-20 flex-shrink-0">{label}</span>
      <input
        type="range" min={0} max={99} value={value}
        onChange={e => onChange(Number(e.target.value))}
        className="flex-1 h-1 accent-cyan-500"
      />
      <input
        type="number" min={0} max={99} value={value}
        onChange={e => onChange(Math.min(99, Math.max(0, Number(e.target.value))))}
        className="w-10 text-center bg-transparent border border-white/10 rounded text-xs text-white/70 outline-none focus:border-white/30 transition-colors py-0.5"
      />
    </div>
  );
}

// ── Tag Input (strengths / weaknesses) ───────────────────────────────────

function TagInput({ tags, onChange, color, placeholder }: {
  tags: string[]; onChange: (t: string[]) => void; color: string; placeholder: string;
}) {
  const [draft, setDraft] = useState('');

  const add = () => {
    const t = draft.trim();
    if (t && !tags.includes(t)) onChange([...tags, t]);
    setDraft('');
  };

  return (
    <div className="space-y-1.5">
      <div className="flex flex-wrap gap-1.5">
        {tags.map(tag => (
          <span key={tag} className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium"
            style={{ background: `${color}20`, color, border: `1px solid ${color}30` }}>
            {tag}
            <button onClick={() => onChange(tags.filter(t => t !== tag))} className="opacity-60 hover:opacity-100">
              <X size={9} />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-1">
        <input
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && add()}
          placeholder={placeholder}
          className="flex-1 bg-transparent border-b border-white/10 focus:border-white/30 text-white text-xs outline-none transition-colors py-0.5 placeholder-white/20"
        />
        <button onClick={add} className="text-white/30 hover:text-white/60 transition-colors">
          <Plus size={12} />
        </button>
      </div>
    </div>
  );
}

// ── Player Panel ──────────────────────────────────────────────────────────

type Side = 1 | 2;

function PlayerPanel({
  side, player, onChange, onClear,
}: {
  side: Side;
  player: ComparePlayer | null;
  onChange: (p: ComparePlayer) => void;
  onClear: () => void;
}) {
  const color = side === 1 ? '#00f5ff' : '#ff006e';
  const [editOpen, setEditOpen] = useState(false);
  const [statsOpen, setStatsOpen] = useState(false);
  const [charOpen, setCharOpen] = useState(true);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiError, setAiError] = useState('');

  const fetchFromAI = async () => {
    if (!player?.name) { setAiError('Enter a player name first.'); return; }
    setAiLoading(true);
    setAiError('');
    try {
      const res = await fetch('/api/player-lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName: player.name }),
      });
      const data = await res.json();
      if (data.error === 'NO_API_KEY') {
        setAiError('No OpenAI key configured — edit stats manually below.');
        return;
      }
      if (data.error) { setAiError(data.error); return; }
      const p = data.player as Partial<ComparePlayer>;
      onChange({
        ...player,
        name: p.name ?? player.name,
        shortName: p.shortName ?? player.shortName,
        position: p.position ?? player.position,
        club: p.club ?? player.club,
        nationality: p.nationality ?? player.nationality,
        age: p.age ?? player.age,
        height: p.height ?? player.height,
        weight: p.weight ?? player.weight,
        foot: p.foot ?? player.foot,
        jerseyNumber: p.jerseyNumber ?? player.jerseyNumber,
        marketValue: (p as { marketValue?: string }).marketValue ?? player.marketValue,
        stats: { ...player.stats, ...(p.stats ?? {}) },
        characteristics: {
          strengths: p.characteristics?.strengths ?? player.characteristics.strengths,
          weaknesses: p.characteristics?.weaknesses ?? player.characteristics.weaknesses,
          playingStyle: p.characteristics?.playingStyle ?? player.characteristics.playingStyle,
          bestRole: p.characteristics?.bestRole ?? player.characteristics.bestRole,
          tacticalNotes: p.characteristics?.tacticalNotes ?? player.characteristics.tacticalNotes,
        },
      });
      setCharOpen(true);
    } catch {
      setAiError('Request failed. Try again.');
    } finally {
      setAiLoading(false);
    }
  };

  const set = useCallback(<K extends keyof ComparePlayer>(key: K, val: ComparePlayer[K]) => {
    if (!player) return;
    onChange({ ...player, [key]: val });
  }, [player, onChange]);

  const setStat = useCallback((key: keyof PlayerStats, val: number) => {
    if (!player) return;
    onChange({ ...player, stats: { ...player.stats, [key]: val } });
  }, [player, onChange]);

  const setChar = useCallback(<K extends keyof Characteristics>(key: K, val: Characteristics[K]) => {
    if (!player) return;
    onChange({ ...player, characteristics: { ...player.characteristics, [key]: val } });
  }, [player, onChange]);

  const posColor = player ? (POSITION_COLORS[player.position as keyof typeof POSITION_COLORS] ?? color) : color;
  const ratingVal = player ? Math.round(
    (player.stats.pace + player.stats.shooting + player.stats.passing +
      player.stats.dribbling + player.stats.defending + player.stats.physical) / 6
  ) : 0;

  if (!player) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4 py-12">
        <div className="w-20 h-20 rounded-full border-2 border-dashed flex items-center justify-center"
          style={{ borderColor: `${color}30` }}>
          <User size={28} style={{ color: `${color}40` }} />
        </div>
        <p className="text-sm text-white/30 font-medium">Select Player {side}</p>
        <p className="text-xs text-white/20">Use the search above</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Hero */}
      <div className="flex flex-col items-center gap-3 py-2">
        <PhotoUpload
          imageUrl={player.imageUrl}
          name={player.shortName || player.name}
          color={color}
          onUpload={url => set('imageUrl', url)}
        />
        {/* Name + position */}
        <div className="text-center">
          <h2 className="text-lg font-black text-white leading-tight">
            {player.name || <span className="text-white/30 italic">Unnamed Player</span>}
          </h2>
          <div className="flex items-center justify-center gap-2 mt-1 flex-wrap">
            <span className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ color: posColor, background: `${posColor}20`, border: `1px solid ${posColor}30` }}>
              {player.position}
            </span>
            {player.club && <span className="text-xs text-white/40">{player.club}</span>}
            {player.nationality && <span className="text-xs text-white/30">· {player.nationality}</span>}
          </div>
          {ratingVal > 0 && (
            <p className="text-3xl font-black font-mono mt-1" style={{ color: getRatingColor(ratingVal) }}>
              {ratingVal}
            </p>
          )}
        </div>

        {/* AI fetch + clear */}
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
            onClick={fetchFromAI}
            disabled={aiLoading}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all disabled:opacity-50"
            style={{ background: `${color}15`, border: `1px solid ${color}30`, color }}
          >
            {aiLoading ? <Loader2 size={11} className="animate-spin" /> : <Sparkles size={11} />}
            {aiLoading ? 'Fetching…' : 'Fetch from AI'}
          </motion.button>
          <button onClick={onClear}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs text-white/30 hover:text-red-400 glass border border-white/8 hover:border-red-500/30 transition-all">
            <Trash2 size={10} /> Clear
          </button>
        </div>
        {aiError && <p className="text-[10px] text-yellow-400/80 text-center max-w-[200px] leading-snug">{aiError}</p>}
      </div>

      {/* Edit basic info */}
      <div className="rounded-xl border border-white/8 overflow-hidden">
        <button
          onClick={() => setEditOpen(o => !o)}
          className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-white/3 transition-all"
        >
          <div className="flex items-center gap-2">
            <Edit3 size={11} className="text-white/30" />
            <span className="text-xs font-semibold text-white/50">Edit Info</span>
          </div>
          {editOpen ? <ChevronUp size={12} className="text-white/30" /> : <ChevronDown size={12} className="text-white/30" />}
        </button>
        <AnimatePresence>
          {editOpen && (
            <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
              className="overflow-hidden border-t border-white/5">
              <div className="p-3 grid grid-cols-2 gap-3">
                <EditField label="Name" value={player.name} onChange={v => set('name', v)} className="col-span-2" />
                <EditField label="Short Name" value={player.shortName} onChange={v => set('shortName', v)} />
                <EditField label="Position" value={player.position} onChange={v => set('position', v)} />
                <EditField label="Club" value={player.club} onChange={v => set('club', v)} />
                <EditField label="Nationality" value={player.nationality} onChange={v => set('nationality', v)} />
                <EditField label="Age" value={player.age || ''} type="number" onChange={v => set('age', Number(v))} />
                <EditField label="Market Value" value={player.marketValue} onChange={v => set('marketValue', v)} />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Edit stats */}
      <div className="rounded-xl border border-white/8 overflow-hidden">
        <button
          onClick={() => setStatsOpen(o => !o)}
          className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-white/3 transition-all"
        >
          <div className="flex items-center gap-2">
            <GitCompare size={11} className="text-white/30" />
            <span className="text-xs font-semibold text-white/50">Edit Stats</span>
          </div>
          {statsOpen ? <ChevronUp size={12} className="text-white/30" /> : <ChevronDown size={12} className="text-white/30" />}
        </button>
        <AnimatePresence>
          {statsOpen && (
            <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
              className="overflow-hidden border-t border-white/5">
              <div className="p-3 space-y-2.5">
                {(
                  [
                    ['pace', 'Pace'], ['shooting', 'Shooting'], ['passing', 'Passing'],
                    ['dribbling', 'Dribbling'], ['defending', 'Defending'], ['physical', 'Physical'],
                  ] as [keyof PlayerStats, string][]
                ).map(([key, label]) => (
                  <StatSlider key={key} label={label} value={player.stats[key] as number}
                    onChange={v => setStat(key, v)} />
                ))}
                <div className="border-t border-white/5 pt-2.5 space-y-2.5">
                  {(
                    [
                      ['goals', 'Goals', 60], ['assists', 'Assists', 30],
                      ['matchRating', 'Rating', 10], ['passAccuracy', 'Pass Acc. %', 100],
                      ['sprintSpeed', 'Sprint km/h', 45], ['tackles', 'Tackles', 150],
                      ['dribbles', 'Dribbles', 200], ['xG', 'xG', 35],
                    ] as [keyof PlayerStats, string, number][]
                  ).map(([key, label, max]) => (
                    <div key={key} className="flex items-center gap-2">
                      <span className="text-[10px] text-white/40 w-20 flex-shrink-0">{label}</span>
                      <input type="number" min={0} max={max} step={key === 'matchRating' || key === 'xG' ? 0.1 : 1}
                        value={player.stats[key]}
                        onChange={e => setStat(key, Number(e.target.value))}
                        className="w-20 bg-transparent border border-white/10 rounded px-2 py-0.5 text-xs text-white/70 outline-none focus:border-white/30 transition-colors"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Characteristics */}
      <div className="rounded-xl border overflow-hidden" style={{ borderColor: `${color}20` }}>
        <button
          onClick={() => setCharOpen(o => !o)}
          className="w-full flex items-center justify-between px-3 py-2.5 hover:bg-white/3 transition-all"
        >
          <div className="flex items-center gap-2">
            <Check size={11} style={{ color: `${color}80` }} />
            <span className="text-xs font-semibold" style={{ color: `${color}80` }}>Characteristics</span>
          </div>
          {charOpen ? <ChevronUp size={12} className="text-white/30" /> : <ChevronDown size={12} className="text-white/30" />}
        </button>
        <AnimatePresence>
          {charOpen && (
            <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }}
              className="overflow-hidden border-t" style={{ borderColor: `${color}15` }}>
              <div className="p-3 space-y-4">

                <div>
                  <p className="text-[10px] text-white/40 uppercase tracking-wider mb-2 font-semibold">Strengths</p>
                  <TagInput tags={player.characteristics.strengths}
                    onChange={v => setChar('strengths', v)} color="#4ade80" placeholder="Add strength + Enter" />
                </div>

                <div>
                  <p className="text-[10px] text-white/40 uppercase tracking-wider mb-2 font-semibold">Weaknesses</p>
                  <TagInput tags={player.characteristics.weaknesses}
                    onChange={v => setChar('weaknesses', v)} color="#f87171" placeholder="Add weakness + Enter" />
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">Playing Style</p>
                  <textarea
                    value={player.characteristics.playingStyle}
                    onChange={e => setChar('playingStyle', e.target.value)}
                    rows={2}
                    placeholder="How does this player play…"
                    className="w-full bg-white/3 border border-white/8 rounded-lg px-3 py-2 text-xs text-white/70 outline-none focus:border-white/20 resize-none transition-colors placeholder-white/20"
                  />
                </div>

                <div>
                  <p className="text-[10px] text-white/40 uppercase tracking-wider mb-1 font-semibold">Best Role</p>
                  <input
                    value={player.characteristics.bestRole}
                    onChange={e => setChar('bestRole', e.target.value)}
                    placeholder="e.g. Advanced Striker"
                    className="w-full bg-transparent border-b border-white/10 focus:border-white/30 text-white text-xs outline-none transition-colors py-0.5 placeholder-white/20"
                  />
                </div>

                <div className="space-y-2">
                  <p className="text-[10px] text-white/40 uppercase tracking-wider font-semibold">Tactical Notes</p>
                  <textarea
                    value={player.characteristics.tacticalNotes}
                    onChange={e => setChar('tacticalNotes', e.target.value)}
                    rows={2}
                    placeholder="What system suits them best…"
                    className="w-full bg-white/3 border border-white/8 rounded-lg px-3 py-2 text-xs text-white/70 outline-none focus:border-white/20 resize-none transition-colors placeholder-white/20"
                  />
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

// ── Dual Stat Bar ──────────────────────────────────────────────────────────

function DualStatBar({ label, v1, v2, max = 100 }: { label: string; v1: number; v2: number; max?: number }) {
  const p1 = Math.min((v1 / max) * 100, 100);
  const p2 = Math.min((v2 / max) * 100, 100);
  const c1 = getStatColor(max === 100 ? v1 : p1);
  const c2 = getStatColor(max === 100 ? v2 : p2);

  return (
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
      {/* Left val + bar */}
      <div className="flex items-center gap-2 justify-end">
        <motion.div
          initial={{ width: 0 }} animate={{ width: `${p1}%` }} transition={{ duration: 0.7, delay: 0.05 }}
          className="h-1.5 rounded-full max-w-full"
          style={{ background: `linear-gradient(270deg, ${c1}, ${c1}40)` }}
        />
        <span className={cn('text-xs font-bold font-mono w-8 text-right', v1 > v2 ? 'text-white' : 'text-white/40')}
          style={v1 > v2 ? { color: c1 } : {}}>
          {v1}
        </span>
      </div>
      {/* Label */}
      <span className="text-[10px] text-white/40 text-center whitespace-nowrap px-2 w-28">{label}</span>
      {/* Right bar + val */}
      <div className="flex items-center gap-2 justify-start">
        <span className={cn('text-xs font-bold font-mono w-8', v2 > v1 ? 'text-white' : 'text-white/40')}
          style={v2 > v1 ? { color: c2 } : {}}>
          {v2}
        </span>
        <motion.div
          initial={{ width: 0 }} animate={{ width: `${p2}%` }} transition={{ duration: 0.7, delay: 0.1 }}
          className="h-1.5 rounded-full max-w-full"
          style={{ background: `linear-gradient(90deg, ${c2}40, ${c2})` }}
        />
      </div>
    </div>
  );
}

// ── AI Scout Analysis ──────────────────────────────────────────────────────

function AIAnalysis({ p1, p2 }: { p1: ComparePlayer; p2: ComparePlayer }) {
  const [analysis, setAnalysis] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const run = async () => {
    setLoading(true); setAnalysis(''); setError('');
    try {
      const res = await fetch('/api/compare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          player1: p1.name, player2: p2.name,
          stats1: p1.stats, stats2: p2.stats,
        }),
      });
      const data = await res.json();
      if (data.error) { setError(data.error); return; }
      setAnalysis(data.analysis ?? '');
    } catch {
      setError('Request failed. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="rounded-2xl border border-purple-500/20 bg-purple-500/5 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center">
            <Sparkles size={13} className="text-purple-400" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">AI Scout Analysis</p>
            <p className="text-[10px] text-white/30">Powered by OpenAI · requires API key in .env</p>
          </div>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.97 }}
          onClick={run} disabled={loading}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-purple-500/15 border border-purple-500/30 text-purple-400 text-xs font-bold hover:bg-purple-500/25 transition-all disabled:opacity-50"
        >
          {loading ? <><Loader2 size={12} className="animate-spin" /> Analyzing…</> : <><Sparkles size={12} /> Run Analysis</>}
        </motion.button>
      </div>

      {!analysis && !loading && !error && (
        <p className="text-white/25 text-sm text-center py-6 leading-relaxed">
          Click &ldquo;Run Analysis&rdquo; to get an AI-powered scouting report comparing<br />
          <span className="text-cyan-400/60">{p1.name || 'Player 1'}</span>
          {' vs '}
          <span className="text-pink-400/60">{p2.name || 'Player 2'}</span>
        </p>
      )}

      {loading && (
        <div className="space-y-2 py-3">
          {[100, 88, 75, 60].map((w, i) => (
            <div key={i} className="h-3 rounded skeleton" style={{ width: `${w}%` }} />
          ))}
        </div>
      )}

      {error && (
        <div className="text-yellow-400/80 text-sm text-center py-4 bg-yellow-500/5 rounded-xl border border-yellow-500/15">
          {error}
        </div>
      )}

      {analysis && (
        <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
          className="text-sm text-white/75 leading-relaxed whitespace-pre-wrap">
          {analysis}
        </motion.div>
      )}
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────

function CompareContent() {
  const [p1, setP1] = useState<ComparePlayer | null>(null);
  const [p2, setP2] = useState<ComparePlayer | null>(null);

  const bothSelected = p1 !== null && p2 !== null;

  const p1AsPlayer = p1 ? { ...p1, rating: Math.round((p1.stats.pace + p1.stats.shooting + p1.stats.passing + p1.stats.dribbling + p1.stats.defending + p1.stats.physical) / 6), flagEmoji: '', stats: p1.stats } : null;
  const p2AsPlayer = p2 ? { ...p2, rating: Math.round((p2.stats.pace + p2.stats.shooting + p2.stats.passing + p2.stats.dribbling + p2.stats.defending + p2.stats.physical) / 6), flagEmoji: '', stats: p2.stats } : null;

  const statRows: { label: string; key: keyof PlayerStats; max: number }[] = [
    { label: 'Pace', key: 'pace', max: 99 },
    { label: 'Shooting', key: 'shooting', max: 99 },
    { label: 'Passing', key: 'passing', max: 99 },
    { label: 'Dribbling', key: 'dribbling', max: 99 },
    { label: 'Defending', key: 'defending', max: 99 },
    { label: 'Physical', key: 'physical', max: 99 },
    { label: 'Goals', key: 'goals', max: 50 },
    { label: 'Assists', key: 'assists', max: 30 },
    { label: 'xG', key: 'xG', max: 35 },
    { label: 'Pass Acc. %', key: 'passAccuracy', max: 100 },
    { label: 'Sprint km/h', key: 'sprintSpeed', max: 42 },
    { label: 'Tackles', key: 'tackles', max: 150 },
    { label: 'Dribbles', key: 'dribbles', max: 200 },
  ];

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* ── Header ── */}
      <div className="flex-shrink-0 px-6 py-4 border-b border-white/5 flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-cyan-500/20 to-pink-500/20 border border-white/10 flex items-center justify-center flex-shrink-0">
          <GitCompare size={15} className="text-white/70" />
        </div>
        <div>
          <h1 className="text-base font-black text-white leading-none">Player Comparison</h1>
          <p className="text-[11px] text-white/30 mt-0.5">Select players · upload photos · fetch data from AI</p>
        </div>
      </div>

      {/* ── Search row ── */}
      <div className="flex-shrink-0 grid grid-cols-[1fr_auto_1fr] items-center gap-4 px-6 py-3 border-b border-white/5">
        <PlayerSearch side={1} onSelect={setP1} />
        <div className="flex items-center justify-center">
          <span className="text-xs font-black text-white/20 px-3 py-1 rounded-full glass border border-white/8">VS</span>
        </div>
        <PlayerSearch side={2} onSelect={setP2} />
      </div>

      {/* ── Main scrollable body ── */}
      <div className="flex-1 overflow-auto">
        <div className="p-6 space-y-6 max-w-7xl mx-auto">

          {/* ── Three-column hero ── */}
          <div className="grid grid-cols-[1fr_auto_1fr] gap-6 items-start">
            {/* Player 1 */}
            <div className="glass-card border border-cyan-500/15 rounded-2xl p-4">
              <PlayerPanel side={1} player={p1} onChange={setP1} onClear={() => setP1(null)} />
            </div>

            {/* Center column: radar + info */}
            <div className="w-72 flex flex-col gap-4">
              {bothSelected && p1AsPlayer && p2AsPlayer ? (
                <>
                  <div className="glass-card border border-white/8 rounded-2xl p-4">
                    <p className="text-[10px] text-white/30 uppercase tracking-wider font-semibold mb-3 text-center">Attribute Radar</p>
                    <div className="flex justify-center gap-4 mb-2">
                      <span className="flex items-center gap-1 text-[10px] text-cyan-400/80">
                        <span className="w-3 h-0.5 inline-block rounded" style={{ background: '#00f5ff' }} />
                        {p1.shortName || p1.name}
                      </span>
                      <span className="flex items-center gap-1 text-[10px] text-pink-400/80">
                        <span className="w-3 h-0.5 inline-block rounded" style={{ background: '#ff006e' }} />
                        {p2.shortName || p2.name}
                      </span>
                    </div>
                    <PlayerRadarChart
                      player1={{ ...p1AsPlayer!, clubBadge: '' } as Parameters<typeof PlayerRadarChart>[0]['player1']}
                      player2={{ ...p2AsPlayer!, clubBadge: '' } as Parameters<typeof PlayerRadarChart>[0]['player2']}
                    />
                  </div>
                  {/* Quick info badges */}
                  <div className="glass-card border border-white/8 rounded-2xl p-4 space-y-2">
                    <p className="text-[10px] text-white/30 uppercase tracking-wider font-semibold">At a Glance</p>
                    {[
                      { label: 'Age', v1: p1.age, v2: p2.age },
                      { label: 'Height', v1: p1.height, v2: p2.height, unit: 'cm' },
                      { label: 'Sprint', v1: p1.stats.sprintSpeed, v2: p2.stats.sprintSpeed, unit: 'km/h' },
                    ].map(({ label, v1, v2, unit }) => (
                      <div key={label} className="flex items-center justify-between text-xs">
                        <span className={cn('font-bold', Number(v1) >= Number(v2) ? 'text-cyan-400' : 'text-white/40')}>{v1}{unit}</span>
                        <span className="text-white/20 text-[10px]">{label}</span>
                        <span className={cn('font-bold', Number(v2) >= Number(v1) ? 'text-pink-400' : 'text-white/40')}>{v2}{unit}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex items-center justify-center h-64 glass-card border border-white/5 rounded-2xl">
                  <p className="text-xs text-white/20 text-center px-4">Select both players<br />to see comparison</p>
                </div>
              )}
            </div>

            {/* Player 2 */}
            <div className="glass-card border border-pink-500/15 rounded-2xl p-4">
              <PlayerPanel side={2} player={p2} onChange={setP2} onClear={() => setP2(null)} />
            </div>
          </div>

          {/* ── Stat comparison bars ── */}
          {bothSelected && p1 && p2 && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
              className="glass-card border border-white/8 rounded-2xl p-5">
              <div className="flex items-center justify-between mb-5">
                <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">Head-to-Head Stats</p>
                <div className="flex items-center gap-4 text-xs">
                  <span className="text-cyan-400 font-bold">{p1.shortName || p1.name}</span>
                  <span className="text-white/20">vs</span>
                  <span className="text-pink-400 font-bold">{p2.shortName || p2.name}</span>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-10 gap-y-3">
                {statRows.map(({ label, key, max }) => (
                  <DualStatBar key={key} label={label} v1={Number(p1.stats[key])} v2={Number(p2.stats[key])} max={max} />
                ))}
              </div>
            </motion.div>
          )}

          {/* ── Characteristics side-by-side summary ── */}
          {bothSelected && p1 && p2 && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className="grid grid-cols-2 gap-6">
              {[{ player: p1, color: '#00f5ff' }, { player: p2, color: '#ff006e' }].map(({ player, color }) => {
                const hasChars = player.characteristics.strengths.length > 0
                  || player.characteristics.weaknesses.length > 0
                  || player.characteristics.playingStyle
                  || player.characteristics.bestRole
                  || player.characteristics.tacticalNotes;
                if (!hasChars) return null;
                return (
                  <div key={player.id} className="rounded-2xl border p-4 space-y-3" style={{ borderColor: `${color}20`, background: `${color}05` }}>
                    <p className="text-xs font-bold" style={{ color }}>
                      {player.shortName || player.name} — Scouting Report
                    </p>
                    {player.characteristics.strengths.length > 0 && (
                      <div>
                        <p className="text-[9px] text-white/30 uppercase tracking-wider mb-1.5 font-semibold">Strengths</p>
                        <div className="flex flex-wrap gap-1.5">
                          {player.characteristics.strengths.map(s => (
                            <span key={s} className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-green-500/15 text-green-400 border border-green-500/20">{s}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {player.characteristics.weaknesses.length > 0 && (
                      <div>
                        <p className="text-[9px] text-white/30 uppercase tracking-wider mb-1.5 font-semibold">Weaknesses</p>
                        <div className="flex flex-wrap gap-1.5">
                          {player.characteristics.weaknesses.map(w => (
                            <span key={w} className="text-[10px] px-2 py-0.5 rounded-full font-medium bg-red-500/15 text-red-400 border border-red-500/20">{w}</span>
                          ))}
                        </div>
                      </div>
                    )}
                    {player.characteristics.playingStyle && (
                      <div>
                        <p className="text-[9px] text-white/30 uppercase tracking-wider mb-1 font-semibold">Style</p>
                        <p className="text-xs text-white/60 leading-relaxed">{player.characteristics.playingStyle}</p>
                      </div>
                    )}
                    {player.characteristics.bestRole && (
                      <div>
                        <p className="text-[9px] text-white/30 uppercase tracking-wider mb-1 font-semibold">Best Role</p>
                        <span className="text-[10px] px-2 py-0.5 rounded-full font-medium" style={{ color, background: `${color}15`, border: `1px solid ${color}25` }}>
                          {player.characteristics.bestRole}
                        </span>
                      </div>
                    )}
                    {player.characteristics.tacticalNotes && (
                      <div>
                        <p className="text-[9px] text-white/30 uppercase tracking-wider mb-1 font-semibold">Tactical Notes</p>
                        <p className="text-xs text-white/55 leading-relaxed">{player.characteristics.tacticalNotes}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </motion.div>
          )}

          {/* ── AI Analysis ── */}
          {bothSelected && p1 && p2 && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
              <AIAnalysis p1={p1} p2={p2} />
            </motion.div>
          )}

          {/* ── Empty state ── */}
          {!bothSelected && (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="flex -space-x-4">
                {[{ color: '#00f5ff', label: '1' }, { color: '#ff006e', label: '2' }].map(({ color, label }) => (
                  <div key={label}
                    className="w-16 h-16 rounded-full border-2 flex items-center justify-center"
                    style={{ borderColor: `${color}40`, background: `${color}10` }}>
                    <span className="text-lg font-black" style={{ color: `${color}60` }}>{label}</span>
                  </div>
                ))}
              </div>
              <p className="text-white/30 text-sm">Search for two players above to compare</p>
              <p className="text-white/15 text-xs">Supports players from your squad, any custom name, and AI-fetched data</p>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

export default function ComparePage() {
  return (
    <Suspense fallback={<div className="p-6 text-white/40 text-sm">Loading…</div>}>
      <CompareContent />
    </Suspense>
  );
}
