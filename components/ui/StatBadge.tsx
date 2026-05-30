'use client';

import { getStatColor } from '@/lib/utils';

type StatBadgeProps = {
  label: string;
  value: number;
  size?: 'sm' | 'md';
};

export default function StatBadge({ label, value, size = 'md' }: StatBadgeProps) {
  const color = getStatColor(value);

  if (size === 'sm') {
    return (
      <div className="flex flex-col items-center">
        <span className="text-[10px] text-white/40 uppercase tracking-wider">{label}</span>
        <span className="text-sm font-bold font-mono" style={{ color }}>{value}</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center px-2 py-1.5 rounded-lg bg-white/5 border border-white/8">
      <span className="text-[10px] text-white/40 uppercase tracking-wider leading-none mb-1">{label}</span>
      <span
        className="text-base font-bold font-mono leading-none"
        style={{ color, textShadow: `0 0 8px ${color}60` }}
      >
        {value}
      </span>
    </div>
  );
}
