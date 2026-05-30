'use client';

import { TacticalArrow } from '@/lib/store/lineupStore';

type Props = {
  arrows: TacticalArrow[];
  drawingArrow: { fromX: number; fromY: number; toX: number; toY: number } | null;
};

export default function TacticalArrows({ arrows, drawingArrow }: Props) {
  const allArrows = drawingArrow
    ? [...arrows, { id: '__preview', fromX: drawingArrow.fromX, fromY: drawingArrow.fromY, toX: drawingArrow.toX, toY: drawingArrow.toY, color: '#facc15' }]
    : arrows;

  if (allArrows.length === 0) return null;

  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none"
      viewBox="0 0 100 62"
      preserveAspectRatio="none"
      style={{ zIndex: 20 }}
    >
      <defs>
        {['#00f5ff', '#39ff14', '#facc15', '#ff006e', '#bf5fff'].map(color => (
          <marker
            key={color}
            id={`arrow-${color.replace('#', '')}`}
            markerWidth="6"
            markerHeight="6"
            refX="5"
            refY="3"
            orient="auto"
          >
            <path d="M0,0 L0,6 L6,3 z" fill={color} />
          </marker>
        ))}
      </defs>
      {allArrows.map((arrow) => {
        const markerId = `arrow-${arrow.color.replace('#', '')}`;
        return (
          <line
            key={arrow.id}
            x1={arrow.fromX}
            y1={arrow.fromY}
            x2={arrow.toX}
            y2={arrow.toY}
            stroke={arrow.color}
            strokeWidth="0.8"
            strokeDasharray={arrow.id === '__preview' ? '2 1' : undefined}
            markerEnd={`url(#${markerId})`}
            opacity={arrow.id === '__preview' ? 0.7 : 0.9}
          />
        );
      })}
    </svg>
  );
}
