'use client';

import { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, X, Sparkles, BarChart3, Camera, Loader2 } from 'lucide-react';
import {
  Radar, RadarChart, PolarGrid, PolarAngleAxis,
  ResponsiveContainer, Tooltip, Legend,
} from 'recharts';
import { cn, getInitials } from '@/lib/utils';

// ── Constants ──────────────────────────────────────────────────────────────

const PLAYER_COLORS = ['#00f5ff', '#ff006e', '#39ff14', '#bf5fff', '#facc15', '#fb923c'];

const RADAR_KEYS = ['goals', 'assist', 'red card', 'yellow card', 'appearances', 'clean sheet', 'saves'];

// ── Parser ─────────────────────────────────────────────────────────────────

function canon(s: string): string {
  const stopWords = new Set(['and', 'with', 'the', 'a', 'an', 'per', 'in', 'of', 'for', 'has', 'is', 'are', 'was', 'were', 'also', 'plus', 'total']);
  const clean = s.trim().toLowerCase().replace(/\s+/g, ' ').replace(/s$/, '');
  if (clean.length < 2 || stopWords.has(clean)) return '';
  return clean;
}

export function parsePlayerStats(text: string): Record<string, number> {
  const out: Record<string, number> = {};
  const lower = text.toLowerCase();

  // Pass 1: "label: value" or "label = value"
  const colonRe = /\b([a-z][a-z ]{0,22}?)\s*[:=]\s*(\d+(?:\.\d+)?)/g;
  for (const [, label, val] of lower.matchAll(colonRe)) {
    const k = canon(label);
    if (k) out[k] = +val;
  }

  // Pass 2: "value label(s)" — scan token by token
  const tokens = lower.split(/\s+/);
  let i = 0;
  while (i < tokens.length) {
    const raw = tokens[i].replace(/[^0-9.]/g, '');
    const num = parseFloat(raw);
    if (!isNaN(num) && raw.length > 0) {
      // Collect up to 3 following word tokens as the stat label
      const words: string[] = [];
      for (let j = i + 1; j <= i + 3 && j < tokens.length; j++) {
        const t = tokens[j].replace(/[^a-z]/g, '');
        if (!t) break;
        const asNum = parseFloat(tokens[j].replace(/[^0-9.]/g, ''));
        if (!isNaN(asNum) && tokens[j].replace(/[^0-9.]/g, '').length > 0) break;
        words.push(t);
      }
      if (words.length > 0) {
        const k = canon(words.join(' '));
        if (k && !(k in out)) {
          out[k] = num;
          i += words.length;
        }
      }
    }
    i++;
  }

  return out;
}

// ── Types ──────────────────────────────────────────────────────────────────

type StatEntry = {
  id: string;
  name: string;
  rawText: string;
  parsedStats: Record<string, number>;
  imageUrl: string;
};

function makeEntry(n: number): StatEntry {
  return { id: `e${Date.now()}-${n}`, name: '', rawText: '', parsedStats: {}, imageUrl: '' };
}

// ── Photo Upload (reused pattern from compare page) ────────────────────────

function MiniPhotoUpload({
  imageUrl, name, color, onUpload,
}: { imageUrl: string; name: string; color: string; onUpload: (url: string) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(false);

  const handle = (file: File) => {
    if (!file.type.startsWith('image/')) return;
    setLoading(true);
    const url = URL.createObjectURL(file);
    setTimeout(() => { onUpload(url); setLoading(false); }, 150);
  };

  return (
    <div className="relative group flex-shrink-0">
      <input ref={ref} type="file" accept="image/*" className="hidden"
        onChange={e => e.target.files?.[0] && handle(e.target.files[0])} />
      <button
        onClick={() => ref.current?.click()}
        className="relative w-10 h-10 rounded-full overflow-hidden flex items-center justify-center"
        style={{ border: `2px solid ${color}50`, background: `${color}15` }}
      >
        {imageUrl
          ? <img src={imageUrl} alt={name} className="w-full h-full object-cover" />
          : <span className="text-[9px] font-black text-white/50">{getInitials(name) || '?'}</span>}
        {!loading && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
            <Camera size={12} className="text-white" />
          </div>
        )}
        {loading && (
          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
            <Loader2 size={10} className="text-white animate-spin" />
          </div>
        )}
      </button>
    </div>
  );
}

// ── Multi-bar stat row ─────────────────────────────────────────────────────

function MultiStatBar({
  label, values, colors, max,
}: {
  label: string;
  values: { name: string; val: number }[];
  colors: string[];
  max: number;
}) {
  const maxVal = max > 0 ? max : Math.max(...values.map(v => v.val), 1);
  const winner = values.reduce((a, b) => (a.val >= b.val ? a : b), values[0]);

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-white/50 capitalize font-medium">{label}</span>
        <span className="text-[9px] text-white/25">
          {values.map(v => v.val).join(' · ')}
        </span>
      </div>
      {values.map((v, i) => {
        const pct = Math.min((v.val / maxVal) * 100, 100);
        const isWinner = v.name === winner.name && v.val > 0;
        return (
          <div key={v.name} className="flex items-center gap-2">
            <span
              className="text-[9px] font-semibold w-16 truncate flex-shrink-0"
              style={{ color: colors[i] + (isWinner ? 'ff' : '60') }}
            >
              {v.name || `P${i + 1}`}
            </span>
            <div className="flex-1 h-1.5 rounded-full bg-white/5 overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ duration: 0.6, delay: i * 0.06 }}
                className="h-full rounded-full"
                style={{ background: `linear-gradient(90deg, ${colors[i]}60, ${colors[i]})` }}
              />
            </div>
            <span
              className="text-[10px] font-black font-mono w-8 text-right flex-shrink-0"
              style={{ color: isWinner ? colors[i] : '#ffffff40' }}
            >
              {v.val}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ── Radar chart for N players ──────────────────────────────────────────────

function NPlayerRadar({ entries, colors }: { entries: StatEntry[]; colors: string[] }) {
  // Find up to 6 common stats for radar
  const allKeys = entries.flatMap(e => Object.keys(e.parsedStats));
  const keyCounts = allKeys.reduce<Record<string, number>>((acc, k) => {
    acc[k] = (acc[k] ?? 0) + 1;
    return acc;
  }, {});
  const commonKeys = Object.entries(keyCounts)
    .filter(([, c]) => c >= Math.max(2, entries.length - 1))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([k]) => k);

  if (commonKeys.length < 2) return null;

  const radarData = commonKeys.map(key => {
    const row: Record<string, number | string> = { stat: key };
    entries.forEach((e, i) => {
      row[`p${i}`] = e.parsedStats[key] ?? 0;
    });
    return row;
  });

  // Normalize to 0-100 for radar
  const maxPerKey: Record<string, number> = {};
  commonKeys.forEach(k => {
    maxPerKey[k] = Math.max(...entries.map(e => e.parsedStats[k] ?? 0), 1);
  });
  const normalized = radarData.map(row => {
    const nr: Record<string, number | string> = { stat: row.stat };
    entries.forEach((_, i) => {
      nr[`p${i}`] = Math.round(((row[`p${i}`] as number) / maxPerKey[row.stat as string]) * 100);
    });
    return nr;
  });

  return (
    <div className="glass-card border border-white/8 rounded-2xl p-4">
      <p className="text-[10px] text-white/30 uppercase tracking-wider font-semibold mb-3 text-center">
        Attribute Radar
      </p>
      <div className="flex justify-center flex-wrap gap-3 mb-2">
        {entries.map((e, i) => (
          <span key={e.id} className="flex items-center gap-1.5 text-[10px] font-medium" style={{ color: colors[i] + 'cc' }}>
            <span className="w-3 h-0.5 inline-block rounded" style={{ background: colors[i] }} />
            {e.name || `Player ${i + 1}`}
          </span>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={240}>
        <RadarChart data={normalized}>
          <PolarGrid stroke="rgba(255,255,255,0.08)" />
          <PolarAngleAxis
            dataKey="stat"
            tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10, fontWeight: 600 }}
          />
          {entries.map((_, i) => (
            <Radar
              key={i}
              dataKey={`p${i}`}
              stroke={colors[i]}
              fill={colors[i]}
              fillOpacity={0.12}
              strokeWidth={1.5}
            />
          ))}
          <Tooltip
            contentStyle={{
              background: 'rgba(8,8,14,0.95)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8,
              fontSize: 11,
              color: 'white',
            }}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}

// ── Player input card ──────────────────────────────────────────────────────

function PlayerInputCard({
  entry, color, index, onChange, onRemove,
}: {
  entry: StatEntry; color: string; index: number;
  onChange: (e: StatEntry) => void; onRemove: () => void;
}) {
  const hasParsed = Object.keys(entry.parsedStats).length > 0;

  const parse = () => {
    onChange({ ...entry, parsedStats: parsePlayerStats(entry.rawText) });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ delay: index * 0.05 }}
      className="rounded-2xl border p-4 space-y-3"
      style={{ borderColor: `${color}25`, background: `${color}06` }}
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <MiniPhotoUpload
          imageUrl={entry.imageUrl}
          name={entry.name}
          color={color}
          onUpload={url => onChange({ ...entry, imageUrl: url })}
        />
        <input
          type="text"
          value={entry.name}
          onChange={e => onChange({ ...entry, name: e.target.value })}
          placeholder={`Player ${index + 1} name`}
          className="flex-1 bg-transparent border-b text-white text-sm outline-none transition-colors py-0.5 placeholder-white/25 font-semibold"
          style={{ borderColor: `${color}40` }}
        />
        <button onClick={onRemove} className="text-white/20 hover:text-red-400 transition-colors flex-shrink-0">
          <X size={13} />
        </button>
      </div>

      {/* Stats textarea */}
      <div>
        <label className="text-[9px] text-white/30 uppercase tracking-wider font-semibold block mb-1">
          Stats (paste or type freely)
        </label>
        <textarea
          rows={3}
          value={entry.rawText}
          onChange={e => onChange({ ...entry, rawText: e.target.value, parsedStats: parsePlayerStats(e.target.value) })}
          placeholder={`e.g. 42 goals 31 assists 2 red cards\nor goals: 42, assists: 31`}
          className="w-full bg-white/3 border rounded-xl px-3 py-2 text-xs text-white/70 outline-none resize-none transition-all placeholder-white/20"
          style={{ borderColor: `${color}20` }}
          onFocus={e => (e.target.style.borderColor = `${color}50`)}
          onBlur={e => (e.target.style.borderColor = `${color}20`)}
        />
      </div>

      {/* Parsed preview tags */}
      <AnimatePresence>
        {hasParsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <p className="text-[9px] text-white/25 uppercase tracking-wider mb-1.5 font-semibold">Parsed stats</p>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(entry.parsedStats).map(([k, v]) => (
                <span
                  key={k}
                  className="flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium"
                  style={{ background: `${color}15`, color, border: `1px solid ${color}25` }}
                >
                  <span className="opacity-70 capitalize">{k}</span>
                  <span className="font-black">{v}</span>
                </span>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ── Main Component ─────────────────────────────────────────────────────────

export default function TextStatsCompare({ initialNames }: { initialNames?: string[] }) {
  const [entries, setEntries] = useState<StatEntry[]>(() => {
    const names = initialNames ?? [];
    const count = Math.max(2, names.length);
    return Array.from({ length: count }, (_, i) => ({
      ...makeEntry(i),
      name: names[i] ?? '',
    }));
  });

  const updateEntry = useCallback((idx: number, updated: StatEntry) => {
    setEntries(prev => prev.map((e, i) => i === idx ? updated : e));
  }, []);

  const addEntry = () => {
    if (entries.length >= 6) return;
    setEntries(prev => [...prev, makeEntry(prev.length)]);
  };

  const removeEntry = (idx: number) => {
    setEntries(prev => prev.filter((_, i) => i !== idx));
  };

  const active = entries.filter(e => Object.keys(e.parsedStats).length > 0);

  // Gather all stat keys across active entries
  const allKeys = [...new Set(active.flatMap(e => Object.keys(e.parsedStats)))];

  // Split into common (all have it), partial (some have it)
  const commonKeys = allKeys.filter(k => active.every(e => k in e.parsedStats));
  const partialKeys = allKeys.filter(k => !commonKeys.includes(k));

  // Max value per stat for consistent bars
  const maxPerKey: Record<string, number> = {};
  allKeys.forEach(k => {
    maxPerKey[k] = Math.max(...active.map(e => e.parsedStats[k] ?? 0), 1);
  });

  const colors = PLAYER_COLORS.slice(0, entries.length);

  return (
    <div className="space-y-6">
      {/* Player input grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence mode="popLayout">
          {entries.map((entry, i) => (
            <PlayerInputCard
              key={entry.id}
              entry={entry}
              color={colors[i] ?? '#888'}
              index={i}
              onChange={updated => updateEntry(i, updated)}
              onRemove={() => removeEntry(i)}
            />
          ))}
        </AnimatePresence>

        {entries.length < 6 && (
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={addEntry}
            className="min-h-[180px] rounded-2xl border border-dashed border-white/15 hover:border-cyan-500/40 hover:bg-cyan-500/5 flex flex-col items-center justify-center gap-2 text-white/25 hover:text-cyan-400 transition-all"
          >
            <Plus size={20} />
            <span className="text-xs font-medium">Add Player</span>
            <span className="text-[10px] opacity-60">{entries.length}/6</span>
          </motion.button>
        )}
      </div>

      {/* Comparison visualization */}
      {active.length >= 2 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-5"
        >
          {/* Radar */}
          <NPlayerRadar entries={active} colors={colors} />

          {/* Common stats bars */}
          {commonKeys.length > 0 && (
            <div className="glass-card border border-white/8 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-5">
                <BarChart3 size={14} className="text-white/40" />
                <p className="text-xs font-semibold text-white/40 uppercase tracking-wider">
                  Shared Stats
                </p>
                <span className="text-[10px] text-white/20 ml-auto">{commonKeys.length} stats</span>
              </div>
              <div className="space-y-5">
                {commonKeys.map(key => (
                  <MultiStatBar
                    key={key}
                    label={key}
                    values={active.map(e => ({ name: e.name || 'Player', val: e.parsedStats[key] ?? 0 }))}
                    colors={colors}
                    max={maxPerKey[key]}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Partial / uncommon stats */}
          {partialKeys.length > 0 && (
            <div className="glass-card border border-white/5 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles size={13} className="text-white/30" />
                <p className="text-xs font-semibold text-white/30 uppercase tracking-wider">
                  Additional Stats
                </p>
                <span className="text-[10px] text-white/15 ml-auto">{partialKeys.length} stats</span>
              </div>

              {/* Group uncommon stats by which players have them */}
              <div className="space-y-5">
                {partialKeys.map(key => {
                  const having = active.filter(e => key in e.parsedStats);
                  return (
                    <MultiStatBar
                      key={key}
                      label={key}
                      values={active.map(e => ({ name: e.name || 'Player', val: e.parsedStats[key] ?? 0 }))}
                      colors={colors.map((c, i) => active[i] && key in active[i].parsedStats ? c : c + '30')}
                      max={maxPerKey[key]}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* At a glance summary */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {active.map((e, i) => {
              const statCount = Object.keys(e.parsedStats).length;
              const total = Object.values(e.parsedStats).reduce((a, b) => a + b, 0);
              return (
                <motion.div
                  key={e.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.07 }}
                  className="rounded-2xl border p-3 text-center space-y-1"
                  style={{ borderColor: `${colors[i]}25`, background: `${colors[i]}08` }}
                >
                  {e.imageUrl ? (
                    <img src={e.imageUrl} alt={e.name} className="w-10 h-10 rounded-full object-cover mx-auto border-2" style={{ borderColor: colors[i] }} />
                  ) : (
                    <div className="w-10 h-10 rounded-full mx-auto flex items-center justify-center border-2 text-sm font-black text-white/60"
                      style={{ borderColor: `${colors[i]}60`, background: `${colors[i]}15` }}>
                      {getInitials(e.name) || '?'}
                    </div>
                  )}
                  <p className="text-xs font-bold text-white/80 leading-tight truncate px-1">
                    {e.name || `Player ${i + 1}`}
                  </p>
                  <p className="text-[10px] text-white/30">{statCount} stat{statCount !== 1 ? 's' : ''}</p>
                  <p className="text-[10px] font-mono font-semibold" style={{ color: colors[i] }}>Σ {total.toFixed(0)}</p>
                </motion.div>
              );
            })}
          </div>
        </motion.div>
      )}

      {active.length < 2 && (
        <div className="text-center py-10 space-y-2">
          <div className="flex justify-center -space-x-3">
            {entries.map((e, i) => (
              <div key={e.id} className="w-12 h-12 rounded-full border-2 flex items-center justify-center text-lg"
                style={{ borderColor: `${colors[i]}40`, background: `${colors[i]}10` }}>
                <span style={{ color: `${colors[i]}50` }}>{i + 1}</span>
              </div>
            ))}
          </div>
          <p className="text-white/25 text-sm">Add stats for at least 2 players to compare</p>
          <p className="text-white/15 text-xs">
            Paste anything — &ldquo;42 goals 31 assists 2 red cards&rdquo; or &ldquo;goals: 42, assists: 31&rdquo;
          </p>
        </div>
      )}
    </div>
  );
}
