'use client';

import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
} from '@dnd-kit/core';
import { useDraggable } from '@dnd-kit/core';
import { motion, AnimatePresence } from 'framer-motion';
import { useLineupStore, SquadZone } from '@/lib/store/lineupStore';
import { Player, POSITION_COLORS, FORMATION_POSITIONS } from '@/lib/data/mockData';
import { cn, getInitials, getRatingColor } from '@/lib/utils';
import { useState } from 'react';
import { GitCompare, Eye, ChevronDown, ChevronUp } from 'lucide-react';

// ── Draggable player pill ──────────────────────────────────────────────────

type DraggablePlayerProps = {
  player: Player;
  zone: SquadZone;
  slot?: number;
  onView: (player: Player) => void;
};

function DraggablePlayer({ player, zone, slot, onView }: DraggablePlayerProps) {
  const { addToCompare } = useLineupStore();
  const dragId = `squad-${zone}-${player.id}`;
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: dragId,
    data: { player, zone, slot },
  });

  const posColor = POSITION_COLORS[player.position];
  const ratingColor = getRatingColor(player.rating);

  return (
    <motion.div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      suppressHydrationWarning
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: isDragging ? 0.3 : 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={cn(
        'flex items-center gap-2 px-3 py-2 rounded-xl border cursor-grab active:cursor-grabbing select-none transition-colors',
        isDragging ? 'border-white/20 bg-white/5' : 'border-white/8 bg-[#111118] hover:border-white/15 hover:bg-white/5'
      )}
    >
      {/* Avatar */}
      <div
        className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border flex-shrink-0 overflow-hidden"
        style={{ background: `${posColor}25`, borderColor: `${posColor}60` }}
      >
        {player.imageUrl
          ? <img src={player.imageUrl} alt={player.shortName} className="w-full h-full object-cover" />
          : <span className="text-[10px] font-bold text-white">{getInitials(player.shortName)}</span>
        }
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-white truncate leading-none">{player.shortName}</p>
        <div className="flex items-center gap-1 mt-0.5">
          <span className="text-[9px] font-bold" style={{ color: posColor }}>{player.position}</span>
          <span className="text-[9px] text-white/30">·</span>
          <span className="text-[9px] text-white/40 truncate">{player.club}</span>
        </div>
      </div>

      {/* Jersey + Rating */}
      <div className="flex items-center gap-1.5 flex-shrink-0">
        <span className="text-[9px] text-white/30 font-mono">#{player.jerseyNumber}</span>
        <span className="text-xs font-bold font-mono" style={{ color: ratingColor }}>{player.rating}</span>
      </div>

      {/* Action buttons */}
      <div className="flex items-center gap-1 flex-shrink-0">
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); onView(player); }}
          className="w-6 h-6 rounded-md flex items-center justify-center bg-white/5 hover:bg-cyan-500/20 hover:text-cyan-400 text-white/30 transition-all"
        >
          <Eye size={10} />
        </button>
        <button
          onPointerDown={(e) => e.stopPropagation()}
          onClick={(e) => { e.stopPropagation(); addToCompare(player.id); }}
          className="w-6 h-6 rounded-md flex items-center justify-center bg-white/5 hover:bg-purple-500/20 hover:text-purple-400 text-white/30 transition-all"
        >
          <GitCompare size={10} />
        </button>
      </div>
    </motion.div>
  );
}

// ── Drop zone wrapper ──────────────────────────────────────────────────────

type ZoneDropProps = {
  id: string;
  children: React.ReactNode;
  isOver: boolean;
  label: string;
  count: number;
  accentColor: string;
  collapsed: boolean;
  onToggle: () => void;
};

function ZoneDrop({ id, children, isOver, label, count, accentColor, collapsed, onToggle }: ZoneDropProps) {
  const { setNodeRef } = useDroppable({ id });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'rounded-2xl border transition-all',
        isOver ? 'border-opacity-60 bg-white/3' : 'border-white/8'
      )}
      style={{ borderColor: isOver ? accentColor : undefined }}
    >
      {/* Zone header */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between px-4 py-3 hover:bg-white/3 transition-all rounded-t-2xl"
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full" style={{ background: accentColor }} />
          <span className="text-xs font-bold text-white uppercase tracking-wider">{label}</span>
          <span
            className="text-[10px] font-bold px-1.5 py-0.5 rounded-full"
            style={{ background: `${accentColor}20`, color: accentColor }}
          >
            {count}
          </span>
        </div>
        {collapsed ? <ChevronDown size={14} className="text-white/30" /> : <ChevronUp size={14} className="text-white/30" />}
      </button>

      {/* Zone content */}
      <AnimatePresence>
        {!collapsed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-3 pb-3 space-y-1.5 min-h-[60px]">
              {count === 0 && (
                <div
                  className="flex items-center justify-center py-4 rounded-xl border border-dashed text-xs"
                  style={{ borderColor: `${accentColor}30`, color: `${accentColor}60` }}
                >
                  Drop players here
                </div>
              )}
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ── Main SquadManager ──────────────────────────────────────────────────────

type SquadManagerProps = {
  onViewPlayer: (player: Player) => void;
};

export default function SquadManager({ onViewPlayer }: SquadManagerProps) {
  const { myXI, bench, reserves, formation, movePlayerBetweenZones, movePlayer } = useLineupStore();
  const [activeItem, setActiveItem] = useState<{ player: Player; zone: SquadZone } | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const [collapsed, setCollapsed] = useState<Record<SquadZone, boolean>>({ xi: false, subs: false, reserves: false });

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));
  const positions = FORMATION_POSITIONS[formation];

  const handleDragStart = (e: DragStartEvent) => {
    const d = e.active.data.current as { player: Player; zone: SquadZone };
    setActiveItem(d);
  };

  const handleDragOver = (e: DragOverEvent) => {
    setOverId(e.over?.id as string ?? null);
  };

  const handleDragEnd = (e: DragEndEvent) => {
    setActiveItem(null);
    setOverId(null);
    const { over, active } = e;
    if (!over) return;

    const fromData = active.data.current as { player: Player; zone: SquadZone; slot?: number };
    const toZone = over.id as SquadZone;

    if (!['xi', 'subs', 'reserves'].includes(toZone)) return;
    if (fromData.zone === toZone) return;

    // When moving to XI, pick the first empty slot, or if no empty slot, don't place
    if (toZone === 'xi') {
      const occupiedSlots = new Set(myXI.map(s => s.slot));
      const emptySlot = positions.find(p => !occupiedSlots.has(p.slot));
      if (!emptySlot) return; // XI full
      movePlayerBetweenZones(fromData.player.id, fromData.zone, 'xi', emptySlot.slot);
    } else {
      movePlayerBetweenZones(fromData.player.id, fromData.zone, toZone);
    }
  };

  const toggleZone = (zone: SquadZone) =>
    setCollapsed(c => ({ ...c, [zone]: !c[zone] }));

  const posColor = activeItem ? POSITION_COLORS[activeItem.player.position] : '#fff';

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-3">
        {/* Starting XI */}
        <ZoneDrop
          id="xi"
          isOver={overId === 'xi'}
          label="Starting XI"
          count={myXI.length}
          accentColor="#00f5ff"
          collapsed={collapsed.xi}
          onToggle={() => toggleZone('xi')}
        >
          {myXI.map(({ player, slot }) => {
            const pos = positions.find(p => p.slot === slot);
            return (
              <DraggablePlayer
                key={player.id}
                player={player}
                zone="xi"
                slot={slot}
                onView={onViewPlayer}
              />
            );
          })}
        </ZoneDrop>

        {/* Substitutes */}
        <ZoneDrop
          id="subs"
          isOver={overId === 'subs'}
          label="Substitutes"
          count={bench.length}
          accentColor="#facc15"
          collapsed={collapsed.subs}
          onToggle={() => toggleZone('subs')}
        >
          {bench.map((player) => (
            <DraggablePlayer
              key={player.id}
              player={player}
              zone="subs"
              onView={onViewPlayer}
            />
          ))}
        </ZoneDrop>

        {/* Reserves */}
        <ZoneDrop
          id="reserves"
          isOver={overId === 'reserves'}
          label="Reserves"
          count={reserves.length}
          accentColor="#a78bfa"
          collapsed={collapsed.reserves}
          onToggle={() => toggleZone('reserves')}
        >
          {reserves.map((player) => (
            <DraggablePlayer
              key={player.id}
              player={player}
              zone="reserves"
              onView={onViewPlayer}
            />
          ))}
        </ZoneDrop>
      </div>

      {/* Drag overlay */}
      <DragOverlay>
        {activeItem && (
          <div
            className="flex items-center gap-2 px-3 py-2 rounded-xl border bg-[#111118] shadow-2xl opacity-95 rotate-1"
            style={{ borderColor: `${posColor}60` }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-bold text-white border"
              style={{ background: `${posColor}25`, borderColor: `${posColor}60` }}
            >
              {activeItem.player.imageUrl
                ? <img src={activeItem.player.imageUrl} alt="" className="w-full h-full rounded-full object-cover" />
                : getInitials(activeItem.player.shortName)
              }
            </div>
            <div>
              <p className="text-xs font-semibold text-white">{activeItem.player.shortName}</p>
              <p className="text-[9px] font-bold" style={{ color: posColor }}>{activeItem.player.position}</p>
            </div>
            <span className="text-xs font-bold font-mono ml-2" style={{ color: getRatingColor(activeItem.player.rating) }}>
              {activeItem.player.rating}
            </span>
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
