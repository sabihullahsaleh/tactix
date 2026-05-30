'use client';

import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, Radar, Tooltip } from 'recharts';
import { Player } from '@/lib/data/mockData';

type RadarChartProps = {
  player1: Player;
  player2?: Player;
};

export default function PlayerRadarChart({ player1, player2 }: RadarChartProps) {
  const data = [
    { stat: 'Pace', a: player1.stats.pace, b: player2?.stats.pace ?? 0 },
    { stat: 'Shooting', a: player1.stats.shooting, b: player2?.stats.shooting ?? 0 },
    { stat: 'Passing', a: player1.stats.passing, b: player2?.stats.passing ?? 0 },
    { stat: 'Dribbling', a: player1.stats.dribbling, b: player2?.stats.dribbling ?? 0 },
    { stat: 'Defending', a: player1.stats.defending, b: player2?.stats.defending ?? 0 },
    { stat: 'Physical', a: player1.stats.physical, b: player2?.stats.physical ?? 0 },
  ];

  return (
    <ResponsiveContainer width="100%" height={260}>
      <RadarChart data={data} margin={{ top: 10, right: 20, bottom: 10, left: 20 }}>
        <PolarGrid stroke="rgba(255,255,255,0.1)" />
        <PolarAngleAxis
          dataKey="stat"
          tick={{ fill: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: 600 }}
        />
        <Radar
          name={player1.shortName}
          dataKey="a"
          stroke="#00f5ff"
          fill="#00f5ff"
          fillOpacity={0.2}
          strokeWidth={2}
        />
        {player2 && (
          <Radar
            name={player2.shortName}
            dataKey="b"
            stroke="#ff006e"
            fill="#ff006e"
            fillOpacity={0.2}
            strokeWidth={2}
          />
        )}
        <Tooltip
          contentStyle={{
            background: 'rgba(10,10,15,0.95)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: 8,
            color: 'white',
            fontSize: 12,
          }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
