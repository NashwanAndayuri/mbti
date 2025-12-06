
import React from 'react';
import { ResponsiveContainer, BarChart, XAxis, YAxis, Tooltip, Bar, Cell } from 'recharts';
import { ChartDataPoint } from '../types';

interface MentalHealthChartProps {
  data: ChartDataPoint[];
}

// Aesthetic Pastel Palette
const COLORS = [
    '#A5B4FC', // Indigo 300
    '#FCA5A5', // Red 300
    '#86EFAC', // Green 300
    '#FDBA74', // Orange 300
    '#C4B5FD'  // Violet 300
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-3 border border-gray-100 dark:border-gray-700 rounded-xl shadow-xl">
        <p className="font-bold text-gray-800 dark:text-gray-200 text-sm mb-1">{`${label}`}</p>
        <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-indigo-500"></div>
            <p className="text-indigo-600 dark:text-indigo-400 font-mono text-sm font-bold">{`${payload[0].value}%`}</p>
        </div>
      </div>
    );
  }
  return null;
};

const MentalHealthChart: React.FC<MentalHealthChartProps> = ({ data }) => {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={40}>
        <XAxis 
          dataKey="name" 
          tick={{ fill: '#9CA3AF', fontSize: 11, fontWeight: 600 }} 
          axisLine={false}
          tickLine={false}
          dy={10}
        />
        <YAxis 
          tick={{ fill: '#9CA3AF', fontSize: 11 }} 
          domain={[0, 100]} 
          axisLine={false}
          tickLine={false}
          tickFormatter={(tick) => `${tick}`}
        />
        <Tooltip content={<CustomTooltip />} cursor={{fill: 'rgba(99, 102, 241, 0.05)', radius: 8}}/>
        <Bar dataKey="percentage" radius={[8, 8, 8, 8]}>
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default MentalHealthChart;
