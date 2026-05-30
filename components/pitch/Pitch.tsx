'use client';

import { useLineupStore, SquadZone } from '@/lib/store/lineupStore';
import { FORMATION_POSITIONS, Player } from '@/lib/data/mockData';
import { DndContext, DragEndEvent, DragOverlay, DragStartEvent, useSensor, useSensors, PointerSensor } from '@dnd-kit/core';
import { useDraggable } from '@dnd-kit/core';
import PlayerToken from './PlayerToken';
import TacticalArrows from './TacticalArrows';
import { useState, useRef, useCallback } from 'react';
import { cn, getInitials, getRatingColor } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { TacticalArrow } from '@/lib/store/lineupStore';
import { Pencil, MousePointer, Trash2, X } from 'lucide-react';
import { POSITION_COLORS as PC } from '@/lib/data/mockData';

// ── Free-drag token (pitch players only) ─────────────────────────────────

type PitchTokenProps = {
  player: Player;
  slot: number;
  x: number;
  y: number;
  selected: boolean;
  onSelect: () => void;
  disabled: boolean;
  isOpponent?: boolean;
};

function PitchDraggableToken({ player, slot, x, y, selected, onSelect, disabled, isOpponent }: PitchTokenProps) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `pitch-${isOpponent ? 'opp-' : ''}${slot}`,
    data: { player, slot, isOpponent, source: 'pitch' },
    disabled,
  });

  return (
    <div
      ref={setNodeRef}
      className="absolute"
      style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)', zIndex: isDragging ? 999 : 10 }}
      suppressHydrationWarning
    >
      <PlayerToken
        player={player}
        slot={slot}
        selected={selected}
        onClick={onSelect}
        disabled={disabled}
        isOpponent={isOpponent}
        source="pitch"
        dragListeners={listeners}
        dragAttributes={attributes}
        isDragging={isDragging}
      />
    </div>
  );
}

// ── Constants ─────────────────────────────────────────────────────────────

const ARROW_COLORS = ['#00f5ff', '#39ff14', '#facc15', '#ff006e', '#bf5fff'];
type DrawingState = { fromX: number; fromY: number; toX: number; toY: number } | null;

// ── Main Pitch ─────────────────────────────────────────────────────────────

export default function Pitch() {
  const {
    formation, myXI, opponentXI, bench, reserves,
    selectedPlayerId, setSelectedPlayer,
    movePlayerBetweenZones, arrows, addArrow, clearArrows,
  } = useLineupStore();

  // Free-position state: map slot → custom {x,y} override (CSS % of pitch width/height)
  const [customPositions, setCustomPositions] = useState<Record<string, { x: number; y: number }>>({});

  const [activePlayer, setActivePlayer] = useState<{ player: Player; slot: number; isOpponent?: boolean } | null>(null);
  const [mode, setMode] = useState<'select' | 'draw'>('select');
  const [arrowColor, setArrowColor] = useState('#00f5ff');
  const [drawing, setDrawing] = useState<DrawingState>(null);
  const pitchRef = useRef<HTMLDivElement>(null);

  // Sub/reserve pending substitution
  const [pendingSub, setPendingSub] = useState<{ player: Player; zone: SquadZone } | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: mode === 'draw' ? 99999 : 8 },
    })
  );

  const positions = FORMATION_POSITIONS[formation];

  const getPlayerAtSlot = (slot: number, isOpponent = false) => {
    const xi = isOpponent ? opponentXI : myXI;
    return xi.find(p => p.slot === slot);
  };

  // Convert client coords → pitch viewBox %
  const toViewBox = useCallback((clientX: number, clientY: number) => {
    if (!pitchRef.current) return { x: 0, y: 0 };
    const rect = pitchRef.current.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    return { x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) };
  }, []);

  // ── Draw mode handlers ──────────────────────────────────────────────────

  const handlePointerDown = (e: React.PointerEvent) => {
    if (mode !== 'draw') return;
    e.stopPropagation();
    const { x, y } = toViewBox(e.clientX, e.clientY);
    setDrawing({ fromX: x, fromY: y, toX: x, toY: y });
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (mode !== 'draw' || !drawing) return;
    const { x, y } = toViewBox(e.clientX, e.clientY);
    setDrawing(d => d ? { ...d, toX: x, toY: y } : null);
  };

  const handlePointerUp = (e: React.PointerEvent) => {
    if (mode !== 'draw' || !drawing) return;
    const { x, y } = toViewBox(e.clientX, e.clientY);
    const dx = x - drawing.fromX, dy = y - drawing.fromY;
    if (Math.sqrt(dx * dx + dy * dy) > 3) {
      const arrow: TacticalArrow = {
        id: `a${Date.now()}`,
        fromX: drawing.fromX, fromY: drawing.fromY,
        toX: x, toY: y,
        color: arrowColor,
      };
      addArrow(arrow);
    }
    setDrawing(null);
  };

  // ── Drag handlers (pitch → pitch free positioning) ─────────────────────

  const handleDragStart = (event: DragStartEvent) => {
    const data = event.active.data.current as { player: Player; slot: number; isOpponent?: boolean };
    setActivePlayer({ player: data.player, slot: data.slot, isOpponent: data.isOpponent });
    setPendingSub(null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, delta } = event;
    setActivePlayer(null);

    const fromData = active.data.current as { player: Player; slot: number; isOpponent?: boolean; source: string };
    if (fromData.source !== 'pitch') return;

    if (!pitchRef.current) return;
    const rect = pitchRef.current.getBoundingClientRect();

    // Start from current position (CSS % units), add pixel delta converted to %
    const currentPos = getPosition(fromData.slot, fromData.isOpponent ?? false);
    const deltaXPct = (delta.x / rect.width) * 100;
    const deltaYPct = (delta.y / rect.height) * 100;

    const newX = currentPos.x + deltaXPct;
    const newY = currentPos.y + deltaYPct;

    const clampedX = Math.max(3, Math.min(97, newX));
    const clampedY = Math.max(3, Math.min(97, newY));

    const key = `${fromData.isOpponent ? 'opp-' : ''}${fromData.slot}`;
    setCustomPositions(prev => ({ ...prev, [key]: { x: clampedX, y: clampedY } }));
  };

  // ── Pending sub: click a pitch slot to replace ──────────────────────────

  const handlePitchSlotClick = (slot: number) => {
    if (!pendingSub) return;

    movePlayerBetweenZones(pendingSub.player.id, pendingSub.zone, 'xi', slot);
    setPendingSub(null);
    setSelectedPlayer(null);
  };

  const handleTokenClick = (slot: number, playerId: string) => {
    if (pendingSub) {
      // Replace this player — move current XI player to the sub's zone
      handlePitchSlotClick(slot);
    } else if (mode === 'select') {
      setSelectedPlayer(selectedPlayerId === playerId ? null : playerId);
    }
  };

  // ── Helpers ─────────────────────────────────────────────────────────────

  const getPosition = (slot: number, isOpponent = false) => {
    const key = `${isOpponent ? 'opp-' : ''}${slot}`;
    if (customPositions[key]) return customPositions[key];
    const pos = positions.find(p => p.slot === slot);
    if (!pos) return { x: 50, y: 50 };
    if (isOpponent) return { x: 100 - pos.x, y: 100 - pos.y };
    return { x: pos.x, y: pos.y };
  };

  // Formation y values are already CSS top-% (0-100). No conversion needed.

  return (
    <div className="space-y-2">
      {/* Toolbar */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1 glass border border-white/8 rounded-lg p-0.5">
          <button
            onClick={() => setMode('select')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all',
              mode === 'select' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-white/40 hover:text-white/70'
            )}
          >
            <MousePointer size={12} /> Select
          </button>
          <button
            onClick={() => setMode('draw')}
            className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all',
              mode === 'draw' ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' : 'text-white/40 hover:text-white/70'
            )}
          >
            <Pencil size={12} /> Draw Arrow
          </button>
        </div>

        {mode === 'draw' && (
          <div className="flex items-center gap-1">
            {ARROW_COLORS.map(c => (
              <button
                key={c}
                onClick={() => setArrowColor(c)}
                className={cn('w-5 h-5 rounded-full border-2 transition-all', arrowColor === c ? 'border-white scale-110' : 'border-transparent')}
                style={{ background: c }}
              />
            ))}
          </div>
        )}

        {arrows.length > 0 && (
          <button
            onClick={clearArrows}
            className="flex items-center gap-1 text-xs text-red-400 hover:text-red-300 px-2 py-1.5 rounded-lg glass border border-red-500/20 hover:border-red-500/40 transition-all ml-auto"
          >
            <Trash2 size={12} /> Clear Arrows
          </button>
        )}
      </div>

      {/* Pending sub banner */}
      <AnimatePresence>
        {pendingSub && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="flex items-center justify-between px-3 py-2 rounded-xl bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 text-xs font-medium"
          >
            <span>
              Click a player on the pitch to substitute with{' '}
              <span className="font-bold">{pendingSub.player.shortName}</span>
            </span>
            <button onClick={() => setPendingSub(null)} className="ml-2 hover:text-yellow-200 transition-all">
              <X size={13} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div
          ref={pitchRef}
          className="relative w-full"
          style={{
            paddingBottom: '62%',
            cursor: mode === 'draw' ? 'crosshair' : pendingSub ? 'crosshair' : 'default',
          }}
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={handlePointerUp}
        >
          {/* Pitch background */}
          <div className="absolute inset-0 rounded-2xl overflow-hidden border border-white/10" style={{ background: 'linear-gradient(180deg, #1a472a 0%, #1e5230 50%, #1a472a 100%)' }}>
            {/* Stripes */}
            <div className="absolute inset-0 opacity-30" style={{
              backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 8.33%, rgba(255,255,255,0.05) 8.33%, rgba(255,255,255,0.05) 16.66%)'
            }} />

            {/* Pitch markings */}
            <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 62" preserveAspectRatio="none" fill="none" stroke="rgba(255,255,255,0.55)" strokeWidth="0.3">
              <rect x="2" y="2" width="96" height="58" />
              <line x1="50" y1="2" x2="50" y2="60" />
              <circle cx="50" cy="31" r="8" />
              <circle cx="50" cy="31" r="0.5" fill="rgba(255,255,255,0.55)" />
              <rect x="2" y="13" width="16" height="36" />
              <rect x="2" y="21" width="6" height="20" />
              <circle cx="13" cy="31" r="0.4" fill="rgba(255,255,255,0.55)" />
              <path d="M18,24 Q26,31 18,38" />
              <rect x="82" y="13" width="16" height="36" />
              <rect x="92" y="21" width="6" height="20" />
              <circle cx="87" cy="31" r="0.4" fill="rgba(255,255,255,0.55)" />
              <path d="M82,24 Q74,31 82,38" />
            </svg>

            {/* Tactical arrows */}
            <TacticalArrows arrows={arrows} drawingArrow={drawing} />

            {/* Draw hint */}
            {mode === 'draw' && arrows.length === 0 && !drawing && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <p className="text-yellow-400/60 text-xs font-medium bg-black/30 px-3 py-1.5 rounded-lg">
                  Click and drag on the pitch to draw movement arrows
                </p>
              </div>
            )}

            <div className="absolute top-2 left-1/2 -translate-x-1/2">
              <span className="text-[9px] text-white/30 font-semibold tracking-wider uppercase">Attacking ↑</span>
            </div>

            {/* Empty slot markers (formation positions without players) */}
            {positions.map(({ slot, position, x, y }) => {
              const slotted = getPlayerAtSlot(slot);
              if (slotted) return null;
              const isPendingTarget = !!pendingSub;
              return (
                <motion.div
                  key={`empty-${slot}`}
                  className="absolute"
                  style={{ left: `${x}%`, top: `${y}%`, transform: 'translate(-50%, -50%)' }}
                >
                  <button
                    onClick={() => isPendingTarget && handlePitchSlotClick(slot)}
                    className={cn(
                      'w-10 h-10 rounded-full border-2 border-dashed flex items-center justify-center transition-all',
                      isPendingTarget
                        ? 'border-yellow-400 bg-yellow-400/10 animate-pulse cursor-pointer'
                        : 'border-white/20 bg-white/5 cursor-default'
                    )}
                  >
                    <span className="text-[8px] text-white/40 font-bold">{position}</span>
                  </button>
                </motion.div>
              );
            })}

            {/* My XI */}
            {myXI.map(({ player, slot }) => {
              const { x, y } = getPosition(slot);
              return (
                <PitchDraggableToken
                  key={player.id}
                  player={player}
                  slot={slot}
                  x={x}
                  y={y}
                  selected={selectedPlayerId === player.id}
                  onSelect={() => handleTokenClick(slot, player.id)}
                  disabled={mode === 'draw'}
                  isOpponent={false}
                />
              );
            })}

            {/* Opponent XI */}
            {opponentXI.map(({ player, slot }) => {
              const { x, y } = getPosition(slot, true);
              return (
                <PitchDraggableToken
                  key={`opp-${player.id}`}
                  player={player}
                  slot={slot}
                  x={x}
                  y={y}
                  selected={selectedPlayerId === player.id}
                  onSelect={() => handleTokenClick(slot, player.id)}
                  disabled={mode === 'draw'}
                  isOpponent={true}
                />
              );
            })}
          </div>
        </div>

        {/* Drag overlay */}
        <DragOverlay>
          {activePlayer && (
            <div className="opacity-90 rotate-3">
              <PlayerToken player={activePlayer.player} slot={activePlayer.slot} isOpponent={activePlayer.isOpponent} />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {/* Bench rail — click to initiate substitution */}
      {(bench.length > 0 || reserves.length > 0) && (
        <div className="space-y-2 mt-3">
          {bench.length > 0 && (
            <div>
              <p className="text-[10px] text-white/30 font-semibold uppercase tracking-wider mb-2 px-1">
                Subs — click to substitute
              </p>
              <div className="flex gap-3 overflow-x-auto pb-1 px-1">
                {bench.map((player) => (
                  <SubToken
                    key={player.id}
                    player={player}
                    zone="subs"
                    isPending={pendingSub?.player.id === player.id}
                    onClick={() => setPendingSub(prev => prev?.player.id === player.id ? null : { player, zone: 'subs' })}
                  />
                ))}
              </div>
            </div>
          )}
          {reserves.length > 0 && (
            <div>
              <p className="text-[10px] text-white/30 font-semibold uppercase tracking-wider mb-2 px-1">
                Reserves — click to substitute
              </p>
              <div className="flex gap-3 overflow-x-auto pb-1 px-1">
                {reserves.map((player) => (
                  <SubToken
                    key={player.id}
                    player={player}
                    zone="reserves"
                    isPending={pendingSub?.player.id === player.id}
                    onClick={() => setPendingSub(prev => prev?.player.id === player.id ? null : { player, zone: 'reserves' })}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Sub/Reserve clickable token ────────────────────────────────────────────

function SubToken({ player, isPending, onClick }: { player: Player; zone: SquadZone; isPending: boolean; onClick: () => void }) {
  const posColor = PC[player.position];
  const ratingColor = getRatingColor(player.rating);

  return (
    <motion.button
      whileHover={{ y: -2, scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={onClick}
      className={cn(
        'flex-shrink-0 flex items-center gap-2 px-3 py-2 rounded-xl border cursor-pointer transition-all',
        isPending
          ? 'border-yellow-400/60 bg-yellow-400/10 shadow-[0_0_12px_rgba(250,204,21,0.3)]'
          : 'border-white/8 bg-[#111118] hover:border-white/20'
      )}
    >
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white border overflow-hidden"
        style={{ background: `${posColor}25`, borderColor: `${posColor}60` }}
      >
        {player.imageUrl
          ? <img src={player.imageUrl} alt={player.shortName} className="w-full h-full object-cover" />
          : getInitials(player.shortName)
        }
      </div>
      <div className="min-w-0">
        <p className="text-xs font-semibold text-white truncate leading-none">{player.shortName}</p>
        <p className="text-[9px] font-bold mt-0.5" style={{ color: posColor }}>{player.position}</p>
      </div>
      <span className="text-xs font-bold font-mono ml-1" style={{ color: ratingColor }}>{player.rating}</span>
    </motion.button>
  );
}
