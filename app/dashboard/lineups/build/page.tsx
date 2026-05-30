'use client';

import { useState, useRef, useCallback, useId } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  Formation, FORMATION_POSITIONS, Position, BuildPlayer,
  MOCK_PLAYERS, POSITION_COLORS,
} from '@/lib/data/mockData';
import { useLineupStore } from '@/lib/store/lineupStore';
import GlassCard from '@/components/ui/GlassCard';
import BuildPitch from '@/components/lineup/BuildPitch';
import TextStatsCompare from '@/components/comparison/TextStatsCompare';
import { cn, getInitials } from '@/lib/utils';
import {
  ChevronRight, ChevronLeft, Plus, Trash2, Camera, Loader2,
  Check, Users, Map, GitCompare, Settings, Zap, Save, User,
} from 'lucide-react';

// ── Constants ─────────────────────────────────────────────────────────────────

const POSITIONS: Position[] = ['GK', 'CB', 'LB', 'RB', 'CDM', 'CM', 'CAM', 'LM', 'RM', 'LW', 'RW', 'ST', 'CF'];
const FORMATIONS: Formation[] = ['4-3-3', '4-2-3-1', '4-4-2', '3-5-2', '3-4-3', '5-3-2', '4-1-4-1'];

const PC = POSITION_COLORS as Record<string, string>;

const STEPS = [
  { id: 1, label: 'Setup', icon: Settings },
  { id: 2, label: 'Roster', icon: Users },
  { id: 3, label: 'Arrange', icon: Map },
  { id: 4, label: 'Compare', icon: GitCompare },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

let _uid = 0;
function uid(): string { return `bp-${Date.now()}-${_uid++}`; }

function makePlayer(): BuildPlayer {
  return { id: uid(), name: '', position: 'CM', jerseyNumber: 0, imageUrl: '' };
}

// ── Step Bar ──────────────────────────────────────────────────────────────────

function StepBar({ current, max }: { current: number; max: number }) {
  return (
    <div className="flex items-center gap-1.5 px-6 py-3.5 border-b border-white/5 flex-shrink-0">
      {STEPS.map((step, i) => {
        const Icon = step.icon;
        const done = current > step.id;
        const active = current === step.id;
        return (
          <div key={step.id} className="flex items-center gap-1.5">
            {i > 0 && (
              <div className={cn('h-px w-6 transition-all duration-300', done ? 'bg-cyan-500/50' : 'bg-white/10')} />
            )}
            <motion.div
              animate={{ scale: active ? 1.04 : 1 }}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                active ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 shadow-[0_0_12px_rgba(0,245,255,0.15)]' :
                done ? 'text-cyan-400/50 border border-cyan-500/15' :
                'text-white/25 border border-white/8'
              )}
            >
              {done ? <Check size={10} /> : <Icon size={10} />}
              {step.label}
            </motion.div>
          </div>
        );
      })}
      <div className="ml-auto text-[10px] text-white/25">Step {current} of {max}</div>
    </div>
  );
}

// ── Step 1: Setup ─────────────────────────────────────────────────────────────

function SetupStep({
  lineupName, setLineupName,
  formation, setFormation,
  xiSize, setXiSize,
  benchSize, setBenchSize,
  reserveSize, setReserveSize,
}: {
  lineupName: string; setLineupName: (v: string) => void;
  formation: Formation; setFormation: (v: Formation) => void;
  xiSize: number; setXiSize: (v: number) => void;
  benchSize: number; setBenchSize: (v: number) => void;
  reserveSize: number; setReserveSize: (v: number) => void;
}) {
  return (
    <div className="max-w-lg mx-auto space-y-7 py-6 px-4">
      {/* Name */}
      <div>
        <label className="text-[10px] font-semibold text-white/40 uppercase tracking-wider block mb-2">
          Lineup Name
        </label>
        <input
          type="text"
          value={lineupName}
          onChange={e => setLineupName(e.target.value)}
          placeholder="e.g. My Dream Team"
          autoFocus
          className="w-full px-3 py-2.5 rounded-xl glass border border-white/10 text-white placeholder-white/25 text-sm outline-none focus:border-cyan-500/40 transition-all"
        />
      </div>

      {/* Formation */}
      <div>
        <label className="text-[10px] font-semibold text-white/40 uppercase tracking-wider block mb-2">
          Formation
        </label>
        <div className="grid grid-cols-4 gap-2">
          {FORMATIONS.map(f => (
            <button
              key={f}
              onClick={() => setFormation(f)}
              className={cn(
                'py-2 rounded-xl text-xs font-mono font-bold transition-all border',
                formation === f
                  ? 'bg-cyan-500/20 border-cyan-500/50 text-cyan-400'
                  : 'glass border-white/10 text-white/50 hover:text-white hover:border-white/20'
              )}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Squad sizes */}
      <div>
        <label className="text-[10px] font-semibold text-white/40 uppercase tracking-wider block mb-3">
          Squad Configuration
        </label>
        <div className="space-y-4">
          {[
            { label: 'Starting XI', desc: 'Players on the pitch', value: xiSize, set: setXiSize, max: 11, color: '#00f5ff' },
            { label: 'Bench / Subs', desc: 'Available substitutes', value: benchSize, set: setBenchSize, max: 20, color: '#39ff14' },
            { label: 'Reserves', desc: 'Squad depth', value: reserveSize, set: setReserveSize, max: 20, color: '#bf5fff' },
          ].map(({ label, desc, value, set, max, color }) => (
            <div key={label} className="glass-card border border-white/8 rounded-xl px-4 py-3">
              <div className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-white/80">{label}</p>
                  <p className="text-[10px] text-white/30">{desc}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => set(Math.max(0, value - 1))}
                    className="w-7 h-7 rounded-lg glass border border-white/10 text-white/50 hover:text-white flex items-center justify-center text-base leading-none transition-all"
                  >−</button>
                  <span className="w-8 text-center text-base font-black font-mono" style={{ color }}>
                    {value}
                  </span>
                  <button
                    onClick={() => set(Math.min(max, value + 1))}
                    className="w-7 h-7 rounded-lg glass border border-white/10 text-white/50 hover:text-white flex items-center justify-center text-base leading-none transition-all"
                  >+</button>
                </div>
              </div>
              <div className="mt-2.5 h-1 rounded-full bg-white/5">
                <motion.div
                  animate={{ width: `${(value / max) * 100}%` }}
                  className="h-full rounded-full"
                  style={{ background: color, boxShadow: `0 0 6px ${color}80` }}
                />
              </div>
            </div>
          ))}
        </div>
        <p className="text-[11px] text-white/25 mt-3 text-center">
          Total squad capacity: <span className="text-white/50 font-semibold">{xiSize + benchSize + reserveSize}</span>
        </p>
      </div>
    </div>
  );
}

// ── Player Edit Card ──────────────────────────────────────────────────────────

function PlayerEditCard({
  player, index, zone, onChange, onDelete,
}: {
  player: BuildPlayer; index: number;
  zone: { label: string; color: string };
  onChange: (p: BuildPlayer) => void;
  onDelete: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [imgLoading, setImgLoading] = useState(false);

  const handleFile = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setImgLoading(true);
    const url = URL.createObjectURL(file);
    setTimeout(() => { onChange({ ...player, imageUrl: url }); setImgLoading(false); }, 150);
  };

  const posColor = PC[player.position] ?? '#888';

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex items-center gap-3 px-3 py-2.5 rounded-xl glass border border-white/8 hover:border-white/15 transition-all group"
    >
      {/* Photo upload */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
      />
      <button
        onClick={() => inputRef.current?.click()}
        className="relative w-10 h-10 rounded-full overflow-hidden flex-shrink-0 border transition-all"
        style={{ borderColor: `${posColor}40`, background: `${posColor}15` }}
      >
        {player.imageUrl ? (
          <img src={player.imageUrl} alt={player.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[10px] font-black text-white/40">
            {getInitials(player.name) || <User size={14} className="text-white/25" />}
          </div>
        )}
        {!imgLoading ? (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
            <Camera size={11} className="text-white" />
          </div>
        ) : (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <Loader2 size={11} className="text-white animate-spin" />
          </div>
        )}
      </button>

      {/* Jersey # */}
      <input
        type="number"
        value={player.jerseyNumber || ''}
        onChange={e => onChange({ ...player, jerseyNumber: Math.min(99, Math.max(1, Number(e.target.value))) })}
        placeholder="#"
        className="w-9 text-center bg-transparent border border-white/10 rounded-lg py-1 text-xs text-white/60 outline-none focus:border-white/30 transition-colors"
        min={1} max={99}
      />

      {/* Name */}
      <input
        type="text"
        value={player.name}
        onChange={e => onChange({ ...player, name: e.target.value })}
        placeholder="Player name…"
        className="flex-1 bg-transparent border-b border-white/8 focus:border-white/30 text-white text-sm outline-none transition-colors py-0.5 min-w-0 placeholder-white/25"
      />

      {/* Position */}
      <select
        value={player.position}
        onChange={e => onChange({ ...player, position: e.target.value as Position })}
        className="bg-transparent border border-white/10 rounded-lg px-1.5 py-1 text-xs outline-none focus:border-white/30 transition-colors"
        style={{ color: posColor }}
      >
        {POSITIONS.map(p => (
          <option key={p} value={p} className="bg-[#0d0d16] text-white">{p}</option>
        ))}
      </select>

      {/* Delete */}
      <button
        onClick={onDelete}
        className="opacity-0 group-hover:opacity-100 text-white/20 hover:text-red-400 transition-all flex-shrink-0"
      >
        <Trash2 size={13} />
      </button>
    </motion.div>
  );
}

// ── Step 2: Roster ────────────────────────────────────────────────────────────

function RosterStep({
  players, xiSize, benchSize, reserveSize,
  onChange,
}: {
  players: BuildPlayer[];
  xiSize: number; benchSize: number; reserveSize: number;
  onChange: (players: BuildPlayer[]) => void;
}) {
  const addPlayer = () => onChange([...players, makePlayer()]);

  const zones = [
    { key: 'xi', label: 'Starting XI', count: xiSize, color: '#00f5ff' },
    { key: 'bench', label: 'Bench / Subs', count: benchSize, color: '#39ff14' },
    { key: 'reserve', label: 'Reserves', count: reserveSize, color: '#bf5fff' },
  ].filter(z => z.count > 0);

  // Bucket players into zones by order
  let idx = 0;
  const buckets = zones.map(z => {
    const slice = players.slice(idx, idx + z.count);
    // Pad with empty players if needed
    const padded = [
      ...slice,
      ...Array.from({ length: Math.max(0, z.count - slice.length) }, makePlayer),
    ].slice(0, z.count);
    idx += z.count;
    return { ...z, players: padded, start: idx - z.count };
  });

  const handleChange = (globalIdx: number, updated: BuildPlayer) => {
    const next = [...players];
    if (globalIdx < next.length) {
      next[globalIdx] = updated;
    } else {
      // Filling in a gap — expand
      while (next.length <= globalIdx) next.push(makePlayer());
      next[globalIdx] = updated;
    }
    onChange(next);
  };

  const handleDelete = (globalIdx: number) => {
    const next = [...players];
    next[globalIdx] = makePlayer(); // reset to empty instead of remove (keeps zone structure)
    onChange(next);
  };

  return (
    <div className="max-w-2xl mx-auto py-4 px-4 space-y-7">
      {/* Tip */}
      <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-cyan-500/5 border border-cyan-500/15">
        <Zap size={13} className="text-cyan-400/60 mt-0.5 flex-shrink-0" />
        <p className="text-[11px] text-white/40 leading-relaxed">
          Fill in player names, numbers, and positions. Click the avatar to upload a photo.
          Squad order here maps directly to zones — first {xiSize} players are your XI, next {benchSize} are bench
          {reserveSize > 0 ? `, then ${reserveSize} reserves` : ''}.
        </p>
      </div>

      {buckets.map(bucket => (
        <div key={bucket.key}>
          <div className="flex items-center gap-2 mb-3">
            <span
              className="text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider"
              style={{ color: bucket.color, background: `${bucket.color}15`, border: `1px solid ${bucket.color}25` }}
            >
              {bucket.label}
            </span>
            <span className="text-xs text-white/25">
              {bucket.players.filter(p => p.name).length} / {bucket.count} named
            </span>
          </div>
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {bucket.players.map((player, i) => (
                <PlayerEditCard
                  key={player.id}
                  player={player}
                  index={i}
                  zone={{ label: bucket.label, color: bucket.color }}
                  onChange={updated => handleChange(bucket.start + i, updated)}
                  onDelete={() => handleDelete(bucket.start + i)}
                />
              ))}
            </AnimatePresence>
          </div>
        </div>
      ))}

      {/* Extra players beyond zone capacity */}
      {players.length > xiSize + benchSize + reserveSize && (
        <div>
          <p className="text-[10px] text-white/25 uppercase tracking-wider mb-2 font-semibold">Extra</p>
          <div className="space-y-2">
            {players.slice(xiSize + benchSize + reserveSize).map((player, i) => (
              <PlayerEditCard
                key={player.id}
                player={player}
                index={i}
                zone={{ label: 'Extra', color: '#888' }}
                onChange={updated => handleChange(xiSize + benchSize + reserveSize + i, updated)}
                onDelete={() => handleDelete(xiSize + benchSize + reserveSize + i)}
              />
            ))}
          </div>
        </div>
      )}

      <motion.button
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        onClick={addPlayer}
        className="w-full py-2.5 rounded-xl border border-dashed border-white/15 hover:border-cyan-500/30 hover:bg-cyan-500/5 text-white/30 hover:text-cyan-400 text-sm flex items-center justify-center gap-2 transition-all"
      >
        <Plus size={15} /> Add Player
      </motion.button>
    </div>
  );
}

// ── Step 3: Arrange ───────────────────────────────────────────────────────────

function ArrangeStep({
  formation, players, xi, bench, reserves,
  onXiChange, onBenchChange, onReservesChange,
}: {
  formation: Formation;
  players: BuildPlayer[];
  xi: { playerId: string; slot: number }[];
  bench: string[];
  reserves: string[];
  onXiChange: (xi: { playerId: string; slot: number }[]) => void;
  onBenchChange: (bench: string[]) => void;
  onReservesChange: (reserves: string[]) => void;
}) {
  return (
    <div className="flex flex-col gap-4 px-4 py-4">
      <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-yellow-500/5 border border-yellow-500/15 flex-shrink-0">
        <Map size={13} className="text-yellow-400/60 mt-0.5 flex-shrink-0" />
        <p className="text-[11px] text-white/40 leading-relaxed">
          Click a player on the left to select them, then click a formation slot on the pitch to assign.
          Use the <span className="text-green-400/70">Bench</span> / <span className="text-purple-400/70">Reserve</span> buttons to move players off the pitch.
          Drag assigned players freely to reposition.
        </p>
      </div>

      <div className="flex-1 min-h-0">
        <BuildPitch
          formation={formation}
          players={players.filter(p => p.name)}
          xi={xi}
          bench={bench}
          reserves={reserves}
          onXiChange={onXiChange}
          onBenchChange={onBenchChange}
          onReservesChange={onReservesChange}
        />
      </div>
    </div>
  );
}

// ── Step 4: Compare ───────────────────────────────────────────────────────────

function CompareStep({ playerNames }: { playerNames: string[] }) {
  return (
    <div className="px-4 py-4">
      <div className="flex items-start gap-2 px-3 py-2.5 rounded-xl bg-purple-500/5 border border-purple-500/15 mb-5 flex-shrink-0">
        <GitCompare size={13} className="text-purple-400/60 mt-0.5 flex-shrink-0" />
        <p className="text-[11px] text-white/40 leading-relaxed">
          Compare players by pasting their stats as plain text — e.g. &ldquo;42 goals 31 assists 2 red cards&rdquo; or
          &ldquo;goals: 42, assists: 31&rdquo;. Stats are parsed automatically. Add up to 6 players.
        </p>
      </div>
      <TextStatsCompare initialNames={playerNames} />
    </div>
  );
}

// ── Save Modal ────────────────────────────────────────────────────────────────

function SaveModal({
  lineupName, onConfirm, onCancel,
}: { lineupName: string; onConfirm: (name: string) => void; onCancel: () => void }) {
  const [name, setName] = useState(lineupName);
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onCancel}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
        onClick={e => e.stopPropagation()}
        className="glass-card border border-white/10 rounded-2xl p-6 w-full max-w-sm"
      >
        <div className="flex items-center gap-3 mb-5">
          <div className="w-9 h-9 rounded-xl bg-cyan-500/15 border border-cyan-500/30 flex items-center justify-center">
            <Save size={16} className="text-cyan-400" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">Save Lineup</h3>
            <p className="text-[10px] text-white/35">Adds to your saved lineups</p>
          </div>
        </div>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Lineup name…"
          autoFocus
          className="w-full px-3 py-2.5 rounded-xl glass border border-white/10 text-white placeholder-white/30 text-sm outline-none focus:border-cyan-500/40 transition-all mb-4"
        />
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 py-2 rounded-xl glass border border-white/10 text-white/50 text-sm hover:text-white transition-all"
          >
            Cancel
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => name && onConfirm(name)}
            disabled={!name}
            className="flex-1 py-2 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 text-sm font-bold hover:bg-cyan-500/30 transition-all disabled:opacity-40"
          >
            Save & View
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────

export default function BuildLineupPage() {
  const router = useRouter();
  const { setFullSquad, saveCurrentLineup } = useLineupStore();

  // Step
  const [step, setStep] = useState(1);

  // Step 1 state
  const [lineupName, setLineupName] = useState('');
  const [formation, setFormation] = useState<Formation>('4-3-3');
  const [xiSize, setXiSize] = useState(11);
  const [benchSize, setBenchSize] = useState(7);
  const [reserveSize, setReserveSize] = useState(0);

  // Step 2 state
  const totalSlots = xiSize + benchSize + reserveSize;
  const [players, setPlayers] = useState<BuildPlayer[]>(() =>
    Array.from({ length: Math.max(xiSize + benchSize + reserveSize, 11) }, makePlayer)
  );

  // Step 3 state
  const [xi, setXi] = useState<{ playerId: string; slot: number }[]>([]);
  const [bench, setBench] = useState<string[]>([]);
  const [reserves, setReserves] = useState<string[]>([]);

  // Save modal
  const [saveOpen, setSaveOpen] = useState(false);

  const canAdvance = (): boolean => {
    if (step === 1) return lineupName.trim().length > 0;
    if (step === 2) return players.some(p => p.name.trim().length > 0);
    return true;
  };

  const handleNext = () => {
    if (!canAdvance()) return;
    if (step === 2) {
      // Auto-assign named players to zones by their position in the list
      const named = players.filter(p => p.name);
      const xiPlayers = named.slice(0, xiSize);
      const benchPlayers = named.slice(xiSize, xiSize + benchSize);
      const reservePlayers = named.slice(xiSize + benchSize, xiSize + benchSize + reserveSize);

      const positions = FORMATION_POSITIONS[formation] ?? [];
      const autoXi: { playerId: string; slot: number }[] = xiPlayers.map((p, i) => ({
        playerId: p.id,
        slot: positions[i]?.slot ?? i,
      }));
      setXi(prev => prev.length > 0 ? prev : autoXi);
      setBench(prev => prev.length > 0 ? prev : benchPlayers.map(p => p.id));
      setReserves(prev => prev.length > 0 ? prev : reservePlayers.map(p => p.id));
    }
    setStep(s => Math.min(4, s + 1));
  };

  const handleBack = () => setStep(s => Math.max(1, s - 1));

  const handleSave = (name: string) => {
    // Convert BuildPlayers to the Player shape the store expects
    const fullPlayers = players.filter(p => p.name).map(p => ({
      ...p,
      shortName: p.name.split(' ').pop() ?? p.name,
      nationality: '',
      flagEmoji: '',
      club: '',
      clubBadge: '',
      age: 0,
      height: 180,
      weight: 75,
      foot: 'Right' as const,
      rating: 75,
      marketValue: '',
      stats: {
        pace: 70, shooting: 70, passing: 70, dribbling: 70,
        defending: 50, physical: 70, goals: 0, assists: 0,
        matchRating: 7.0, passAccuracy: 75, sprintSpeed: 30,
        tackles: 30, dribbles: 50, xG: 0,
      },
    }));

    const xiConverted = xi
      .map(s => {
        const player = fullPlayers.find(p => p.id === s.playerId);
        return player ? { player, slot: s.slot } : null;
      })
      .filter(Boolean) as { player: typeof fullPlayers[0]; slot: number }[];

    const benchConverted = bench
      .map(id => fullPlayers.find(p => p.id === id))
      .filter(Boolean) as typeof fullPlayers;

    const reserveConverted = reserves
      .map(id => fullPlayers.find(p => p.id === id))
      .filter(Boolean) as typeof fullPlayers;

    setFullSquad(xiConverted, benchConverted, reserveConverted, formation);
    saveCurrentLineup(name);
    setSaveOpen(false);
    router.push('/dashboard/lineups');
  };

  const namedPlayerNames = players.filter(p => p.name).map(p => p.name);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-6 py-3.5 border-b border-white/5 flex-shrink-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30 flex items-center justify-center flex-shrink-0">
          <Zap size={16} className="text-cyan-400" />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-base font-bold text-white leading-none">
            {lineupName || 'Build Lineup'}
          </h1>
          <p className="text-[10px] text-white/35 mt-0.5">Create from scratch</p>
        </div>
        <div className="flex items-center gap-2">
          {step >= 3 && (
            <motion.button
              whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
              onClick={() => setSaveOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl glass border border-cyan-500/25 text-cyan-400/70 text-xs font-semibold hover:text-cyan-400 hover:border-cyan-500/50 transition-all"
            >
              <Save size={13} /> Save
            </motion.button>
          )}
          <button
            onClick={() => router.back()}
            className="px-3 py-1.5 rounded-xl glass border border-white/10 text-white/40 text-xs hover:text-white transition-all"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* Step indicator */}
      <StepBar current={step} max={4} />

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div key="step1" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}>
              <SetupStep
                lineupName={lineupName} setLineupName={setLineupName}
                formation={formation} setFormation={setFormation}
                xiSize={xiSize} setXiSize={setXiSize}
                benchSize={benchSize} setBenchSize={setBenchSize}
                reserveSize={reserveSize} setReserveSize={setReserveSize}
              />
            </motion.div>
          )}

          {step === 2 && (
            <motion.div key="step2" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}>
              <RosterStep
                players={players}
                xiSize={xiSize}
                benchSize={benchSize}
                reserveSize={reserveSize}
                onChange={setPlayers}
              />
            </motion.div>
          )}

          {step === 3 && (
            <motion.div key="step3" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}>
              <ArrangeStep
                formation={formation}
                players={players}
                xi={xi}
                bench={bench}
                reserves={reserves}
                onXiChange={setXi}
                onBenchChange={setBench}
                onReservesChange={setReserves}
              />
            </motion.div>
          )}

          {step === 4 && (
            <motion.div key="step4" initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -24 }}>
              <CompareStep playerNames={namedPlayerNames.slice(0, 6)} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation footer */}
      <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 border-t border-white/5 gap-3">
        <button
          onClick={handleBack}
          disabled={step === 1}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl glass border border-white/10 text-white/50 text-sm hover:text-white disabled:opacity-30 transition-all"
        >
          <ChevronLeft size={14} /> Back
        </button>

        {/* Progress dots */}
        <div className="flex items-center gap-1.5">
          {STEPS.map(s => (
            <div
              key={s.id}
              className={cn(
                'rounded-full transition-all',
                step === s.id ? 'w-5 h-1.5 bg-cyan-400' :
                step > s.id ? 'w-1.5 h-1.5 bg-cyan-400/40' :
                'w-1.5 h-1.5 bg-white/15'
              )}
            />
          ))}
        </div>

        {step < 4 ? (
          <motion.button
            whileHover={canAdvance() ? { scale: 1.02 } : {}}
            whileTap={canAdvance() ? { scale: 0.98 } : {}}
            onClick={handleNext}
            disabled={!canAdvance()}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-cyan-500/20 border border-cyan-500/40 text-cyan-400 text-sm font-bold hover:bg-cyan-500/30 transition-all disabled:opacity-35 disabled:cursor-not-allowed"
          >
            {step === 1 ? 'Build Roster' :
             step === 2 ? 'Arrange Squad' :
             'Compare Players'}
            <ChevronRight size={14} />
          </motion.button>
        ) : (
          <motion.button
            whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
            onClick={() => setSaveOpen(true)}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-gradient-to-r from-cyan-500/25 to-blue-600/25 border border-cyan-500/50 text-cyan-400 text-sm font-bold hover:from-cyan-500/35 hover:to-blue-600/35 transition-all shadow-[0_0_16px_rgba(0,245,255,0.15)]"
          >
            <Save size={14} /> Save Lineup
          </motion.button>
        )}
      </div>

      {/* Save modal */}
      <AnimatePresence>
        {saveOpen && (
          <SaveModal
            lineupName={lineupName}
            onConfirm={handleSave}
            onCancel={() => setSaveOpen(false)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
