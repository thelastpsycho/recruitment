'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface PositionChartProps {
  data: { position: string; count: number }[];
}

export function PositionChart({ data }: PositionChartProps) {
  // Take top 10 positions
  const topPositions = data.slice(0, 10);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={topPositions} layout="horizontal">
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis type="number" />
        <YAxis dataKey="position" type="category" width={150} />
        <Tooltip />
        <Bar dataKey="count" fill="#3d5a80" />
      </BarChart>
    </ResponsiveContainer>
  );
}
