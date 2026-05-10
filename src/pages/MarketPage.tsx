import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus, RefreshCw, Shield, AlertTriangle } from 'lucide-react';
import { MOCK_MARKET_PRICES, MOCK_VENDORS } from '@/data';
import { PriceChart } from '@/components/charts/PriceChart';
import type { MarketPrice } from '@/types';

const TrendIcon = ({ trend }: { trend: string }) =>
  trend === 'up' ? <TrendingUp size={14} className="text-emerald-400" /> :
  trend === 'down' ? <TrendingDown size={14} className="text-rose-400" /> :
  <Minus size={14} className="text-slate-400" />;

export const MarketPage: React.FC = () => {
  const [prices, setPrices] = useState<MarketPrice[]>(MOCK_MARKET_PRICES);
  const [lastUpdate, setLastUpdate] = useState(new Date());
  const [updating, setUpdating] = useState(false);

  const refresh = async () => {
    setUpdating(true);
    await new Promise(r => setTimeout(r, 800));
    setPrices(prev => prev.map(p => ({
      ...p,
      consensusPrice: p.consensusPrice + Math.floor((Math.random() - 0.5) * 10),
      updatedAt: new Date(),
    })));
    setLastUpdate(new Date());
    setUpdating(false);
  };

  useEffect(() => {
    const id = setInterval(refresh, 15000);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="min-h-screen gradient-bg-primary pt-20 px-4 pb-12">
      <div className="max-w-6xl mx-auto">

        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-white">Live Market Prices</h1>
            <p className="text-slate-400 text-sm">AI-validated consensus pricing · Mangalore Harbor</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-400">Updated {lastUpdate.toLocaleTimeString()}</span>
            <button onClick={refresh} disabled={updating}
              className="flex items-center gap-2 px-4 py-2 rounded-xl glass border border-cyan-500/20 text-cyan-300 text-sm hover:border-cyan-400/50 transition-all disabled:opacity-50">
              <RefreshCw size={14} className={updating ? 'animate-spin' : ''} />
              Refresh
            </button>
          </div>
        </motion.div>

        {/* Price Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-8">
          {prices.map((p, i) => (
            <motion.div key={p.species} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="glass rounded-2xl border border-cyan-500/10 hover:border-cyan-500/25 p-5 transition-all group">
              <div className="flex items-center justify-between mb-3">
                <span className="text-slate-300 font-medium">🐟 {p.species}</span>
                <TrendIcon trend={p.trend} />
              </div>
              <p className="text-3xl font-black text-white mb-1">₹{p.consensusPrice}<span className="text-sm text-slate-400 font-normal">/kg</span></p>
              <div className="flex gap-2 text-xs text-slate-500 mb-3">
                <span>Low: ₹{p.minPrice}</span>
                <span>·</span>
                <span>High: ₹{p.maxPrice}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium border ${
                  p.demand === 'HIGH' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                  p.demand === 'MEDIUM' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                  'bg-rose-500/10 text-rose-400 border-rose-500/20'}`}>
                  {p.demand} demand
                </span>
                <div className="flex items-center gap-1 text-xs text-slate-500">
                  <Shield size={11} className="text-cyan-400" />
                  <span className="text-cyan-400">AI Verified</span>
                </div>
              </div>
              <div className="mt-3 h-1 rounded-full bg-white/5 overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-600" style={{ width: `${Math.round((1 - p.volatility) * 100)}%` }} />
              </div>
              <p className="text-[10px] text-slate-500 mt-1">Price Stability: {Math.round((1 - p.volatility) * 100)}%</p>
            </motion.div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2"><PriceChart /></div>

          {/* Vendor Leaderboard */}
          <div className="glass rounded-2xl border border-cyan-500/10 p-5">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <Shield size={16} className="text-cyan-400" /> Trusted Vendors
            </h3>
            <div className="space-y-3">
              {MOCK_VENDORS.map((v, i) => (
                <div key={v.id} className="flex items-center gap-3 py-2 border-b border-white/5 last:border-0">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                    i === 0 ? 'bg-amber-500 text-black' : i === 1 ? 'bg-slate-400 text-black' : i === 2 ? 'bg-amber-700 text-white' : 'bg-white/10 text-slate-400'
                  }`}>{i + 1}</span>
                  <div className="flex-1">
                    <p className="text-sm text-white font-medium">{v.name}</p>
                    <div className="flex gap-1">
                      {v.badges.includes('verified') && <span className="text-[10px] text-cyan-400">✓ Verified</span>}
                      {v.badges.includes('top-seller') && <span className="text-[10px] text-amber-400">⭐ Top</span>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-cyan-400 font-bold">{v.trustScore}%</p>
                    <p className="text-[10px] text-slate-500">Trust</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
