'use client';

import { create } from 'zustand';
import { Formation, Player, SavedLineup, MOCK_LINEUPS, MOCK_PLAYERS } from '@/lib/data/mockData';

export type TacticalArrow = {
  id: string;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
  color: string;
};

type SlottedPlayer = {
  player: Player;
  slot: number;
};

export type SquadZone = 'xi' | 'subs' | 'reserves';

type LineupState = {
  // Active lineup
  activeLineupId: string | null;
  formation: Formation;
  myXI: SlottedPlayer[];
  opponentXI: SlottedPlayer[];
  bench: Player[];
  reserves: Player[];

  // All lineups list
  lineups: SavedLineup[];

  // UI state
  selectedPlayerId: string | null;
  comparePlayerIds: string[];
  sidebarOpen: boolean;

  // Actions
  setFormation: (formation: Formation) => void;
  setActiveLineup: (id: string) => void;
  addPlayerToSlot: (player: Player, slot: number, isOpponent?: boolean) => void;
  removePlayerFromSlot: (slot: number, isOpponent?: boolean) => void;
  movePlayer: (fromSlot: number, toSlot: number, isOpponent?: boolean) => void;
  addToBench: (player: Player) => void;
  removeFromBench: (playerId: string) => void;
  addToReserves: (player: Player) => void;
  removeFromReserves: (playerId: string) => void;
  movePlayerBetweenZones: (playerId: string, from: SquadZone, to: SquadZone, toSlot?: number) => void;
  setFullSquad: (xi: { player: Player; slot: number }[], subs: Player[], reserves: Player[], formation: Formation) => void;
  setSelectedPlayer: (id: string | null) => void;
  addToCompare: (id: string) => void;
  removeFromCompare: (id: string) => void;
  clearCompare: () => void;
  setSidebarOpen: (open: boolean) => void;
  saveCurrentLineup: (name: string) => void;
  // Tactical arrows
  arrows: TacticalArrow[];
  addArrow: (arrow: TacticalArrow) => void;
  clearArrows: () => void;
  // Substitutions
  substitutePlayer: (benchPlayer: Player, slot: number) => void;
  // Player image
  updatePlayerImageUrl: (playerId: string, url: string) => void;
};

export const useLineupStore = create<LineupState>((set, get) => ({
  activeLineupId: 'l1',
  formation: '4-3-3',
  myXI: [
    { player: MOCK_PLAYERS.find(p => p.id === 'p8')!, slot: 0 },
    { player: MOCK_PLAYERS.find(p => p.id === 'p9')!, slot: 1 },
    { player: MOCK_PLAYERS.find(p => p.id === 'p2')!, slot: 2 },
    { player: MOCK_PLAYERS.find(p => p.id === 'p1')!, slot: 8 },
    { player: MOCK_PLAYERS.find(p => p.id === 'p4')!, slot: 6 },
    { player: MOCK_PLAYERS.find(p => p.id === 'p7')!, slot: 5 },
    { player: MOCK_PLAYERS.find(p => p.id === 'p10')!, slot: 10 },
    { player: MOCK_PLAYERS.find(p => p.id === 'p3')!, slot: 9 },
    { player: MOCK_PLAYERS.find(p => p.id === 'p6')!, slot: 7 },
    { player: MOCK_PLAYERS.find(p => p.id === 'p14')!, slot: 3 },
    { player: MOCK_PLAYERS.find(p => p.id === 'p15')!, slot: 4 },
  ],
  opponentXI: [
    { player: MOCK_PLAYERS.find(p => p.id === 'p12')!, slot: 0 },
    { player: MOCK_PLAYERS.find(p => p.id === 'p13')!, slot: 8 },
    { player: MOCK_PLAYERS.find(p => p.id === 'p5')!, slot: 9 },
    { player: MOCK_PLAYERS.find(p => p.id === 'p11')!, slot: 10 },
  ],
  bench: MOCK_PLAYERS.slice(8, 12),
  reserves: MOCK_PLAYERS.slice(12, 15),
  lineups: MOCK_LINEUPS,
  selectedPlayerId: null,
  comparePlayerIds: [],
  sidebarOpen: true,

  setFormation: (formation) => set({ formation }),

  setActiveLineup: (id) => {
    const lineup = get().lineups.find(l => l.id === id);
    if (!lineup) return;
    set({
      activeLineupId: id,
      formation: lineup.formation,
    });
  },

  addPlayerToSlot: (player, slot, isOpponent = false) => {
    set((state) => {
      const key = isOpponent ? 'opponentXI' : 'myXI';
      const filtered = state[key].filter(p => p.slot !== slot && p.player.id !== player.id);
      return { [key]: [...filtered, { player, slot }] };
    });
  },

  removePlayerFromSlot: (slot, isOpponent = false) => {
    set((state) => {
      const key = isOpponent ? 'opponentXI' : 'myXI';
      return { [key]: state[key].filter(p => p.slot !== slot) };
    });
  },

  movePlayer: (fromSlot, toSlot, isOpponent = false) => {
    set((state) => {
      const key = isOpponent ? 'opponentXI' : 'myXI';
      const xi = [...state[key]];
      const fromIdx = xi.findIndex(p => p.slot === fromSlot);
      const toIdx = xi.findIndex(p => p.slot === toSlot);
      if (fromIdx === -1) return {};
      if (toIdx !== -1) {
        // Swap
        const temp = xi[fromIdx].slot;
        xi[fromIdx] = { ...xi[fromIdx], slot: xi[toIdx].slot };
        xi[toIdx] = { ...xi[toIdx], slot: temp };
      } else {
        xi[fromIdx] = { ...xi[fromIdx], slot: toSlot };
      }
      return { [key]: xi };
    });
  },

  addToBench: (player) => {
    set((state) => ({
      bench: state.bench.find(p => p.id === player.id) ? state.bench : [...state.bench, player],
    }));
  },

  removeFromBench: (playerId) => {
    set((state) => ({ bench: state.bench.filter(p => p.id !== playerId) }));
  },

  addToReserves: (player) => {
    set((state) => ({
      reserves: state.reserves.find(p => p.id === player.id) ? state.reserves : [...state.reserves, player],
    }));
  },

  removeFromReserves: (playerId) => {
    set((state) => ({ reserves: state.reserves.filter(p => p.id !== playerId) }));
  },

  movePlayerBetweenZones: (playerId, from, to, toSlot) => {
    set((state) => {
      // Find the player in the source zone
      let player: Player | undefined;
      if (from === 'xi') {
        player = state.myXI.find(s => s.player.id === playerId)?.player;
      } else if (from === 'subs') {
        player = state.bench.find(p => p.id === playerId);
      } else {
        player = state.reserves.find(p => p.id === playerId);
      }
      if (!player) return {};

      // Remove from source
      let newXI = [...state.myXI];
      let newBench = [...state.bench];
      let newReserves = [...state.reserves];

      if (from === 'xi') newXI = newXI.filter(s => s.player.id !== playerId);
      else if (from === 'subs') newBench = newBench.filter(p => p.id !== playerId);
      else newReserves = newReserves.filter(p => p.id !== playerId);

      // Add to destination
      if (to === 'xi' && toSlot !== undefined) {
        // If slot is occupied, send that player to source zone
        const displaced = newXI.find(s => s.slot === toSlot);
        if (displaced) {
          if (from === 'subs') newBench.push(displaced.player);
          else if (from === 'reserves') newReserves.push(displaced.player);
          else newBench.push(displaced.player);
          newXI = newXI.filter(s => s.slot !== toSlot);
        }
        newXI.push({ player, slot: toSlot });
      } else if (to === 'subs') {
        if (!newBench.find(p => p.id === player!.id)) newBench.push(player);
      } else if (to === 'reserves') {
        if (!newReserves.find(p => p.id === player!.id)) newReserves.push(player);
      }

      return { myXI: newXI, bench: newBench, reserves: newReserves };
    });
  },

  setSelectedPlayer: (id) => set({ selectedPlayerId: id }),

  addToCompare: (id) => {
    set((state) => {
      if (state.comparePlayerIds.includes(id)) return {};
      if (state.comparePlayerIds.length >= 2) return { comparePlayerIds: [state.comparePlayerIds[1], id] };
      return { comparePlayerIds: [...state.comparePlayerIds, id] };
    });
  },

  removeFromCompare: (id) => {
    set((state) => ({ comparePlayerIds: state.comparePlayerIds.filter(pid => pid !== id) }));
  },

  clearCompare: () => set({ comparePlayerIds: [] }),

  setSidebarOpen: (open) => set({ sidebarOpen: open }),

  arrows: [],
  addArrow: (arrow) => set((s) => ({ arrows: [...s.arrows, arrow] })),
  clearArrows: () => set({ arrows: [] }),

  substitutePlayer: (benchPlayer, slot) => {
    set((state) => {
      const existing = state.myXI.find(p => p.slot === slot);
      const newMyXI = state.myXI.filter(p => p.slot !== slot && p.player.id !== benchPlayer.id);
      newMyXI.push({ player: benchPlayer, slot });
      const newBench = state.bench.filter(p => p.id !== benchPlayer.id);
      if (existing) newBench.push(existing.player);
      return { myXI: newMyXI, bench: newBench };
    });
  },

  updatePlayerImageUrl: (playerId, url) => {
    set((state) => ({
      myXI: state.myXI.map(s => s.player.id === playerId ? { ...s, player: { ...s.player, imageUrl: url } } : s),
      opponentXI: state.opponentXI.map(s => s.player.id === playerId ? { ...s, player: { ...s.player, imageUrl: url } } : s),
      bench: state.bench.map(p => p.id === playerId ? { ...p, imageUrl: url } : p),
      reserves: state.reserves.map(p => p.id === playerId ? { ...p, imageUrl: url } : p),
    }));
  },

  setFullSquad: (xi, subs, reserves, formation) => {
    set({ myXI: xi, bench: subs, reserves, formation });
  },

  saveCurrentLineup: (name) => {
    const state = get();
    const newLineup: SavedLineup = {
      id: `l${Date.now()}`,
      name,
      formation: state.formation,
      teamName: 'My Team',
      teamBadge: '⚽',
      players: state.myXI.map(p => ({ playerId: p.player.id, slot: p.slot })),
      opponentPlayers: state.opponentXI.map(p => ({ playerId: p.player.id, slot: p.slot })),
      createdAt: new Date().toISOString().split('T')[0],
    };
    set((s) => ({ lineups: [newLineup, ...s.lineups], activeLineupId: newLineup.id }));
  },
}));
