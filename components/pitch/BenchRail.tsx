'use client';

import { useLineupStore } from '@/lib/store/lineupStore';
import PlayerToken from './PlayerToken';

export default function BenchRail() {
  const { bench } = useLineupStore();

  if (bench.length === 0) return null;

  return (
    <div className="mt-3">
      <p className="text-[10px] text-white/30 font-semibold uppercase tracking-wider mb-2 px-1">
        Bench — drag to substitute
      </p>
      <div className="flex gap-3 overflow-x-auto pb-1 px-1">
        {bench.map((player) => (
          <PlayerToken
            key={player.id}
            player={player}
            slot={-1}
            source="bench"
          />
        ))}
      </div>
    </div>
  );
}
