import React from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import { PRICE_CHART_DATA } from '@/data';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="glass-strong border border-cyan-500/25 rounded-xl px-3 py-2 text-xs space-y-1">
        <p className="text-cyan-400 font-semibold mb-1">{label}</p>
        {payload.map((p: any) => (
          <p key={p.name} style={{ color: p.color }}>
            {p.name.charAt(0).toUpperCase() + p.name.slice(1)}: ₹{p.value}/kg
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export const PriceChart: React.FC = () => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: 0.2 }}
    className="glass rounded-2xl border border-cyan-500/15 p-5"
  >
    <div className="flex items-center justify-between mb-4">
      <div>
        <h3 className="text-white font-semibold">Live Price Trends</h3>
        <p className="text-xs text-slate-400">Today — Mangalore Harbor</p>
      </div>
      <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />
        LIVE
      </span>
    </div>
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={PRICE_CHART_DATA}>
        <defs>
          {[
            ['tuna',    '#00e5ff'],
            ['sardine', '#a78bfa'],
            ['mackerel','#f59e0b'],
            ['pomfret', '#f43f5e'],
          ].map(([key, color]) => (
            <linearGradient key={key} id={`grad_${key}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor={color} stopOpacity={0.25} />
              <stop offset="95%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          ))}
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
        <XAxis dataKey="time" tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fill: '#64748b', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v}`} />
        <Tooltip content={<CustomTooltip />} />
        <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12, color: '#94a3b8' }} />
        <Area type="monotone" dataKey="tuna"    stroke="#00e5ff" fill="url(#grad_tuna)"    strokeWidth={2} dot={false} />
        <Area type="monotone" dataKey="sardine" stroke="#a78bfa" fill="url(#grad_sardine)" strokeWidth={2} dot={false} />
        <Area type="monotone" dataKey="mackerel"stroke="#f59e0b" fill="url(#grad_mackerel)"strokeWidth={2} dot={false} />
        <Area type="monotone" dataKey="pomfret" stroke="#f43f5e" fill="url(#grad_pomfret)" strokeWidth={2} dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  </motion.div>
);
