'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DndContext, DragEndEvent, DragOverlay, DragStartEvent,
  useSensor, useSensors, PointerSensor, useDraggable,
} from '@dnd-kit/core';
import { Formation, FORMATION_POSITIONS, POSITION_COLORS, BuildPlayer } from '@/lib/data/mockData';
import { cn, getInitials } from '@/lib/utils';
import { X, ArrowDown, UserMinus } from 'lucide-react';

// ── Types ──────────────────────────────────────────────────────────────────

type XiSlot = { playerId: string; slot: number };

export type BuildPitchProps = {
  formation: Formation;
  players: BuildPlayer[];
  xi: XiSlot[];
  bench: string[];
  reserves: string[];
  onXiChange: (xi: XiSlot[]) => void;
  onBenchChange: (bench: string[]) => void;
  onReservesChange: (reserves: string[]) => void;
};

const PC = POSITION_COLORS as Record<string, string>;

// ── Helpers ────────────────────────────────────────────────────────────────

function getPlayerById(players: BuildPlayer[], id: string): BuildPlayer | undefined {
  return players.find(p => p.id === id);
}

function getZone(playerId: string, xi: XiSlot[], bench: string[], reserves: string[]): 'xi' | 'bench' | 'reserve' | 'pool' {
  if (xi.some(s => s.playerId === playerId)) return 'xi';
  if (bench.includes(playerId)) return 'bench';
  if (reserves.includes(playerId)) return 'reserve';
  return 'pool';
}

// ── Player token on pitch (free-draggable) ─────────────────────────────────

function PitchToken({
  player, slot, x, y, selected, pending, onClick, disabled,
}: {
  player: BuildPlayer; slot: number; x: number; y: number;
  selected: boolean; pending: boolean; onClick: () => void; disabled: boolean;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `pitch-${slot}`,
    data: { slot, playerId: player.id },
    disabled,
  });

  const posColor = PC[player.position] ?? '#888';

  return (
    <div
      ref={setNodeRef}
      className="absolute"
      style={{
        left: `${x}%`, top: `${y}%`,
        transform: 'translate(-50%, -50%)',
        zIndex: isDragging ? 999 : 10,
      }}
    >
      <motion.button
        {...attributes}
        {...listeners}
        onClick={onClick}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.96 }}
        className={cn(
          'relative flex flex-col items-center justify-center w-11 h-11 rounded-full border-2 transition-all',
          selected ? 'ring-2 ring-white ring-offset-1 ring-offset-transparent' :
          pending ? 'ring-2 ring-yellow-400 ring-offset-1 ring-offset-transparent' : '',
          isDragging ? 'opacity-40' : 'opacity-100',
        )}
        style={{
          background: `${posColor}25`,
          borderColor: selected ? '#fff' : `${posColor}80`,
          boxShadow: selected ? `0 0 12px ${posColor}` : `0 0 8px ${posColor}40`,
        }}
      >
        {player.imageUrl ? (
          <img src={player.imageUrl} alt={player.name} className="w-full h-full rounded-full object-cover" />
        ) : (
          <span className="text-[10px] font-black text-white">{getInitials(player.name) || '?'}</span>
        )}
        {/* Jersey # badge */}
        <span
          className="absolute -top-1 -right-1 text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center text-white"
          style={{ background: posColor }}
        >
          {player.jerseyNumber || '#'}
        </span>
        {/* Position label */}
        <span
          className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-[9px] font-bold whitespace-nowrap"
          style={{ color: posColor }}
        >
          {player.name ? player.name.split(' ').pop() : player.position}
        </span>
      </motion.button>
    </div>
  );
}

// ── Pool player row ────────────────────────────────────────────────────────

function PoolPlayerRow({
  player, zone, pending, onClick,
}: {
  player: BuildPlayer; zone: 'xi' | 'bench' | 'reserve' | 'pool';
  pending: boolean; onClick: () => void;
}) {
  const posColor = PC[player.position] ?? '#888';
  const zoneBadge = zone === 'xi' ? { label: 'XI', bg: '#00f5ff' }
    : zone === 'bench' ? { label: 'SUB', bg: '#39ff14' }
    : zone === 'reserve' ? { label: 'RES', bg: '#bf5fff' }
    : null;

  return (
    <motion.button
      whileHover={{ x: 2 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={cn(
        'w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-all text-left',
        pending
          ? 'bg-yellow-400/15 border border-yellow-400/50'
          : 'hover:bg-white/5 border border-transparent hover:border-white/8',
      )}
    >
      <div
        className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-black text-white flex-shrink-0 overflow-hidden border"
        style={{ background: `${posColor}20`, borderColor: `${posColor}50` }}
      >
        {player.imageUrl
          ? <img src={player.imageUrl} alt={player.name} className="w-full h-full object-cover rounded-full" />
          : (getInitials(player.name) || '?')}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[11px] font-semibold text-white/80 truncate leading-tight">
          {player.name || <span className="text-white/30 italic">Unnamed</span>}
        </p>
        <p className="text-[9px] font-bold" style={{ color: posColor }}>{player.position}</p>
      </div>
      {player.jerseyNumber > 0 && (
        <span className="text-[9px] font-mono text-white/30">#{player.jerseyNumber}</span>
      )}
      {zoneBadge && (
        <span
          className="text-[8px] font-black px-1 py-0.5 rounded"
          style={{ background: `${zoneBadge.bg}20`, color: zoneBadge.bg }}
        >
          {zoneBadge.label}
        </span>
      )}
    </motion.button>
  );
}

// ── Main BuildPitch ────────────────────────────────────────────────────────

export default function BuildPitch({
  formation, players, xi, bench, reserves,
  onXiChange, onBenchChange, onReservesChange,
}: BuildPitchProps) {
  const positions = FORMATION_POSITIONS[formation] ?? [];
  const pitchRef = useRef<HTMLDivElement>(null);

  // pendingPlayer: player selected from pool, waiting to be assigned a slot/zone
  const [pendingId, setPendingId] = useState<string | null>(null);
  // selectedSlot: pitch slot that's selected (to show actions)
  const [selectedSlot, setSelectedSlot] = useState<number | null>(null);
  // customPositions: free-drag overrides
  const [customPos, setCustomPos] = useState<Record<number, { x: number; y: number }>>({});
  const [activeSlot, setActiveSlot] = useState<number | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }));

  const getPos = useCallback((slot: number) => {
    if (customPos[slot]) return customPos[slot];
    const p = positions.find(p => p.slot === slot);
    return p ? { x: p.x, y: p.y } : { x: 50, y: 50 };
  }, [customPos, positions]);

  const getSlottedPlayer = (slot: number) =>
    xi.find(s => s.slot === slot)?.playerId
      ? getPlayerById(players, xi.find(s => s.slot === slot)!.playerId)
      : undefined;

  // Assign pending player to a slot
  const assignToSlot = (slot: number) => {
    if (!pendingId) return;
    const newXi = xi.filter(s => s.slot !== slot && s.playerId !== pendingId);
    // If slot was occupied, move that player to pool (remove from xi)
    newXi.push({ playerId: pendingId, slot });
    // Remove from bench/reserves too
    onBenchChange(bench.filter(id => id !== pendingId));
    onReservesChange(reserves.filter(id => id !== pendingId));
    onXiChange(newXi);
    setPendingId(null);
    setSelectedSlot(null);
  };

  // Assign pending player to bench
  const assignToBench = () => {
    if (!pendingId) return;
    if (!bench.includes(pendingId)) {
      onBenchChange([...bench, pendingId]);
    }
    onXiChange(xi.filter(s => s.playerId !== pendingId));
    onReservesChange(reserves.filter(id => id !== pendingId));
    setPendingId(null);
  };

  // Assign pending player to reserves
  const assignToReserves = () => {
    if (!pendingId) return;
    if (!reserves.includes(pendingId)) {
      onReservesChange([...reserves, pendingId]);
    }
    onXiChange(xi.filter(s => s.playerId !== pendingId));
    onBenchChange(bench.filter(id => id !== pendingId));
    setPendingId(null);
  };

  // Remove player from all zones (back to pool)
  const removeFromZone = (playerId: string) => {
    onXiChange(xi.filter(s => s.playerId !== playerId));
    onBenchChange(bench.filter(id => id !== playerId));
    onReservesChange(reserves.filter(id => id !== playerId));
    if (pendingId === playerId) setPendingId(null);
    setSelectedSlot(null);
  };

  // Handle pitch slot click
  const handleSlotClick = (slot: number) => {
    const slotPlayer = getSlottedPlayer(slot);
    if (pendingId) {
      assignToSlot(slot);
    } else if (slotPlayer) {
      setSelectedSlot(selectedSlot === slot ? null : slot);
    }
  };

  // Handle pool row click
  const handlePoolClick = (playerId: string) => {
    setPendingId(prev => prev === playerId ? null : playerId);
    setSelectedSlot(null);
  };

  // Free drag end (repositioning on pitch)
  const handleDragStart = (e: DragStartEvent) => {
    const data = e.active.data.current as { slot: number };
    setActiveSlot(data.slot);
    setPendingId(null);
    setSelectedSlot(null);
  };

  const handleDragEnd = (e: DragEndEvent) => {
    const { active, delta } = e;
    setActiveSlot(null);
    const data = active.data.current as { slot: number };
    if (!pitchRef.current) return;
    const rect = pitchRef.current.getBoundingClientRect();
    const cur = getPos(data.slot);
    const nx = Math.max(3, Math.min(97, cur.x + (delta.x / rect.width) * 100));
    const ny = Math.max(3, Math.min(97, cur.y + (delta.y / rect.height) * 100));
    setCustomPos(prev => ({ ...prev, [data.slot]: { x: nx, y: ny } }));
  };

  const unassigned = players.filter(p => getZone(p.id, xi, bench, reserves) === 'pool');
  const allZoned = players.filter(p => getZone(p.id, xi, bench, reserves) !== 'pool');

  return (
    <div className="flex gap-4 h-full">
      {/* ── Left: Player Pool ─────────────────────────────────────────────── */}
      <div className="w-48 flex-shrink-0 flex flex-col gap-2">
        <p className="text-[10px] font-semibold text-white/40 uppercase tracking-wider px-1">
          Players ({players.filter(p => p.name).length})
        </p>

        {/* Assignment hint */}
        <AnimatePresence>
          {pendingId && (
            <motion.div
              initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
              className="text-[10px] text-yellow-400 bg-yellow-400/10 border border-yellow-400/30 rounded-lg px-2 py-1.5 leading-snug"
            >
              Tap a pitch slot, bench, or reserve to assign
              <button
                onClick={() => setPendingId(null)}
                className="ml-1 opacity-60 hover:opacity-100 align-middle"
              >
                <X size={10} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Pool zones quick-assign buttons (only shown when player is pending) */}
        <AnimatePresence>
          {pendingId && (
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="flex flex-col gap-1"
            >
              <button
                onClick={assignToBench}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-green-500/10 border border-green-500/30 text-green-400 text-[10px] font-semibold hover:bg-green-500/20 transition-all"
              >
                <ArrowDown size={10} /> Add to Bench
              </button>
              <button
                onClick={assignToReserves}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-purple-500/10 border border-purple-500/30 text-purple-400 text-[10px] font-semibold hover:bg-purple-500/20 transition-all"
              >
                <ArrowDown size={10} /> Add to Reserves
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex-1 overflow-y-auto space-y-0.5 pr-0.5">
          {/* Unassigned section */}
          {unassigned.filter(p => p.name).length > 0 && (
            <div>
              <p className="text-[9px] text-white/25 uppercase tracking-wider px-1 mb-1 mt-1">Unassigned</p>
              {unassigned.filter(p => p.name).map(p => (
                <PoolPlayerRow
                  key={p.id}
                  player={p}
                  zone="pool"
                  pending={pendingId === p.id}
                  onClick={() => handlePoolClick(p.id)}
                />
              ))}
            </div>
          )}
          {/* Assigned section */}
          {allZoned.filter(p => p.name).length > 0 && (
            <div>
              <p className="text-[9px] text-white/25 uppercase tracking-wider px-1 mb-1 mt-2">Assigned</p>
              {allZoned.filter(p => p.name).map(p => (
                <PoolPlayerRow
                  key={p.id}
                  player={p}
                  zone={getZone(p.id, xi, bench, reserves)}
                  pending={pendingId === p.id}
                  onClick={() => handlePoolClick(p.id)}
                />
              ))}
            </div>
          )}
          {players.filter(p => p.name).length === 0 && (
            <p className="text-[10px] text-white/20 text-center py-4 px-2">Add players in the Roster step first</p>
          )}
        </div>
      </div>

      {/* ── Center: Pitch + Rails ──────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col gap-3 min-w-0">
        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          {/* Pitch */}
          <div
            ref={pitchRef}
            className="relative w-full"
            style={{ paddingBottom: '62%' }}
          >
            <div className="absolute inset-0 rounded-2xl overflow-hidden border border-white/10"
              style={{ background: 'linear-gradient(180deg, #1a472a 0%, #1e5230 50%, #1a472a 100%)' }}>
              {/* Stripes */}
              <div className="absolute inset-0 opacity-25" style={{
                backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 8.33%, rgba(255,255,255,0.05) 8.33%, rgba(255,255,255,0.05) 16.66%)'
              }} />
              {/* Markings */}
              <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 62" preserveAspectRatio="none"
                fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="0.3">
                <rect x="2" y="2" width="96" height="58" />
                <line x1="50" y1="2" x2="50" y2="60" />
                <circle cx="50" cy="31" r="8" />
                <circle cx="50" cy="31" r="0.5" fill="rgba(255,255,255,0.5)" />
                <rect x="2" y="13" width="16" height="36" />
                <rect x="2" y="21" width="6" height="20" />
                <circle cx="13" cy="31" r="0.4" fill="rgba(255,255,255,0.5)" />
                <path d="M18,24 Q26,31 18,38" />
                <rect x="82" y="13" width="16" height="36" />
                <rect x="92" y="21" width="6" height="20" />
                <circle cx="87" cy="31" r="0.4" fill="rgba(255,255,255,0.5)" />
                <path d="M82,24 Q74,31 82,38" />
              </svg>

              <div className="absolute top-2 left-1/2 -translate-x-1/2">
                <span className="text-[9px] text-white/25 font-semibold tracking-wider uppercase">Attacking ↑</span>
              </div>

              {/* Empty formation slots */}
              {positions.map(({ slot, position, x, y }) => {
                const occupied = !!getSlottedPlayer(slot);
                if (occupied) return null;
                const isTarget = !!pendingId;
                return (
                  <motion.div
                    key={`empty-${slot}`}
                    className="absolute"
                    style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
                  >
                    <motion.button
                      onClick={() => isTarget && assignToSlot(slot)}
                      animate={isTarget ? { scale: [1, 1.05, 1] } : {}}
                      transition={{ repeat: isTarget ? Infinity : 0, duration: 1.2 }}
                      className={cn(
                        'w-10 h-10 rounded-full border-2 border-dashed flex items-center justify-center transition-all',
                        isTarget
                          ? 'border-yellow-400 bg-yellow-400/15 cursor-pointer'
                          : 'border-white/20 bg-white/5 cursor-default'
                      )}
                    >
                      <span className="text-[8px] text-white/40 font-bold">{position}</span>
                    </motion.button>
                  </motion.div>
                );
              })}

              {/* Assigned pitch players */}
              {xi.map(({ playerId, slot }) => {
                const player = getPlayerById(players, playerId);
                if (!player) return null;
                const { x, y } = getPos(slot);
                return (
                  <PitchToken
                    key={slot}
                    player={player}
                    slot={slot}
                    x={x}
                    y={y}
                    selected={selectedSlot === slot}
                    pending={pendingId === playerId}
                    onClick={() => handleSlotClick(slot)}
                    disabled={!!pendingId}
                  />
                );
              })}
            </div>
          </div>

          <DragOverlay>
            {activeSlot !== null && (() => {
              const p = getSlottedPlayer(activeSlot);
              if (!p) return null;
              const posColor = PC[p.position] ?? '#888';
              return (
                <div className="w-11 h-11 rounded-full flex items-center justify-center opacity-90 rotate-2"
                  style={{ background: `${posColor}30`, border: `2px solid ${posColor}` }}>
                  <span className="text-[10px] font-black text-white">{getInitials(p.name)}</span>
                </div>
              );
            })()}
          </DragOverlay>
        </DndContext>

        {/* Selected player actions */}
        <AnimatePresence>
          {selectedSlot !== null && (() => {
            const p = getSlottedPlayer(selectedSlot);
            if (!p) return null;
            return (
              <motion.div
                initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-xs"
              >
                <span className="font-semibold text-white/70 flex-1 truncate">{p.name || p.position}</span>
                <button onClick={() => { removeFromZone(p.id); onBenchChange([...bench, p.id]); }}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-green-500/15 border border-green-500/30 text-green-400 hover:bg-green-500/25 transition-all">
                  <ArrowDown size={10} /> Bench
                </button>
                <button onClick={() => { removeFromZone(p.id); onReservesChange([...reserves, p.id]); }}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-400 hover:bg-purple-500/25 transition-all">
                  <ArrowDown size={10} /> Reserve
                </button>
                <button onClick={() => removeFromZone(p.id)}
                  className="flex items-center gap-1 px-2 py-1 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400/70 hover:text-red-400 hover:border-red-500/40 transition-all">
                  <UserMinus size={10} /> Remove
                </button>
                <button onClick={() => setSelectedSlot(null)} className="text-white/30 hover:text-white/60 ml-1">
                  <X size={13} />
                </button>
              </motion.div>
            );
          })()}
        </AnimatePresence>

        {/* Bench rail */}
        {bench.length > 0 && (
          <div>
            <p className="text-[9px] text-green-400/50 font-semibold uppercase tracking-wider mb-1.5 px-1">
              Bench / Subs ({bench.length})
            </p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {bench.map(id => {
                const p = getPlayerById(players, id);
                if (!p) return null;
                const posColor = PC[p.position] ?? '#888';
                return (
                  <motion.button
                    key={id}
                    whileHover={{ y: -2 }}
                    onClick={() => handlePoolClick(id)}
                    className={cn(
                      'flex-shrink-0 flex items-center gap-2 px-2.5 py-1.5 rounded-xl border transition-all',
                      pendingId === id
                        ? 'border-yellow-400/60 bg-yellow-400/10'
                        : 'border-white/8 bg-white/3 hover:border-white/20'
                    )}
                  >
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-black text-white border overflow-hidden flex-shrink-0"
                      style={{ background: `${posColor}20`, borderColor: `${posColor}50` }}>
                      {p.imageUrl
                        ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                        : getInitials(p.name) || '?'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold text-white/80 truncate leading-none">{p.name || 'Unnamed'}</p>
                      <p className="text-[8px] font-bold mt-0.5" style={{ color: posColor }}>{p.position}</p>
                    </div>
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={e => { e.stopPropagation(); removeFromZone(id); }}
                      onKeyDown={e => e.key === 'Enter' && removeFromZone(id)}
                      className="text-white/20 hover:text-red-400 transition-colors ml-1 cursor-pointer"
                    >
                      <X size={10} />
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        )}

        {/* Reserve rail */}
        {reserves.length > 0 && (
          <div>
            <p className="text-[9px] text-purple-400/50 font-semibold uppercase tracking-wider mb-1.5 px-1">
              Reserves ({reserves.length})
            </p>
            <div className="flex gap-2 overflow-x-auto pb-1">
              {reserves.map(id => {
                const p = getPlayerById(players, id);
                if (!p) return null;
                const posColor = PC[p.position] ?? '#888';
                return (
                  <motion.button
                    key={id}
                    whileHover={{ y: -2 }}
                    onClick={() => handlePoolClick(id)}
                    className={cn(
                      'flex-shrink-0 flex items-center gap-2 px-2.5 py-1.5 rounded-xl border transition-all',
                      pendingId === id
                        ? 'border-yellow-400/60 bg-yellow-400/10'
                        : 'border-purple-500/15 bg-purple-500/5 hover:border-purple-500/30'
                    )}
                  >
                    <div className="w-7 h-7 rounded-full flex items-center justify-center text-[9px] font-black text-white border overflow-hidden flex-shrink-0"
                      style={{ background: `${posColor}20`, borderColor: `${posColor}50` }}>
                      {p.imageUrl
                        ? <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover" />
                        : getInitials(p.name) || '?'}
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] font-semibold text-white/80 truncate leading-none">{p.name || 'Unnamed'}</p>
                      <p className="text-[8px] font-bold mt-0.5" style={{ color: posColor }}>{p.position}</p>
                    </div>
                    <span
                      role="button"
                      tabIndex={0}
                      onClick={e => { e.stopPropagation(); removeFromZone(id); }}
                      onKeyDown={e => e.key === 'Enter' && removeFromZone(id)}
                      className="text-white/20 hover:text-red-400 transition-colors ml-1 cursor-pointer"
                    >
                      <X size={10} />
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </div>
        )}

        {xi.length === 0 && bench.length === 0 && reserves.length === 0 && (
          <div className="text-center py-4">
            <p className="text-[11px] text-white/25">Click a player on the left, then click a pitch slot to assign them</p>
          </div>
        )}
      </div>
    </div>
  );
}
