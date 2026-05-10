import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Volume2, TrendingUp, MapPin, Shield, Fish, Bell,
  RefreshCw, MessageSquare, Clock, CheckCircle
} from 'lucide-react';
import { useAuthStore, useRecommendationStore, useLangStore, useMarketStore } from '@/store';
import { speechService } from '@/services/speech/speechService';
import { smsService } from '@/services/sms/smsService';
import { aiService } from '@/services/ai/aiService';
import { PriceChart } from '@/components/charts/PriceChart';
import type { SMSNotification } from '@/types';
import { MOCK_MARKET_PRICES } from '@/data';

const DemandBadge = ({ demand }: { demand: string }) => {
  const color = demand === 'HIGH' ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/25'
    : demand === 'MEDIUM' ? 'bg-amber-500/15 text-amber-400 border-amber-500/25'
    : 'bg-rose-500/15 text-rose-400 border-rose-500/25';
  return <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${color}`}>{demand}</span>;
};

export const FishermanDashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { current: rec, setRecommendation, isAnalyzing, setAnalyzing } = useRecommendationStore();
  const { language } = useLangStore();
  const [smsLog, setSmsLog] = useState<SMSNotification[]>([]);
  const { vendorPrices, congestion } = useMarketStore();

  // Initial load using real AI engine instead of mock
  useEffect(() => {
    const fetchInitial = async () => {
      if (!rec) {
        setAnalyzing(true);
        const fresh = await aiService.generateRecommendation('Tuna', 'A', user?.uid ?? 'user1');
        setRecommendation(fresh);
        setAnalyzing(false);
      }
    };
    fetchInitial();
  }, []);

  // Real-time listener: Auto-recalculate recommendation when market data changes
  useEffect(() => {
    if (rec && !isAnalyzing) {
      aiService.generateRecommendation(rec.species, rec.grade, user?.uid ?? 'user1').then(fresh => {
        setRecommendation(fresh);
      });
    }
  }, [vendorPrices, congestion]);

  const refreshRec = async () => {
    setAnalyzing(true);
    await new Promise(r => setTimeout(r, 1800));
    const fresh = await aiService.generateRecommendation('Tuna', 'A', user?.uid ?? 'user1');
    setRecommendation(fresh);
    setAnalyzing(false);
    // Trigger SMS
    const sms = await smsService.send(user?.phone ?? '+91 9876543210', fresh.species, fresh.harbor.name, fresh.expectedPrice, fresh.demand, language);
    setSmsLog(p => [sms, ...p].slice(0, 5));
  };

  const congestionColor = rec?.congestionLevel === 'LOW' ? 'text-emerald-400' : rec?.congestionLevel === 'MEDIUM' ? 'text-amber-400' : 'text-rose-400';

  return (
    <div className="min-h-screen gradient-bg-primary pt-20 px-4 pb-10">
      <div className="max-w-5xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-white">Welcome, {user?.displayName?.split(' ')[0]} 👋</h1>
            <p className="text-slate-400 text-sm">Today's AI recommendation is ready for you.</p>
          </div>
          <button onClick={refreshRec} disabled={isAnalyzing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl glass border border-cyan-500/20 text-cyan-300 text-sm hover:border-cyan-400/50 transition-all disabled:opacity-50"
          >
            <RefreshCw size={14} className={isAnalyzing ? 'animate-spin' : ''} />
            {isAnalyzing ? 'Analyzing...' : 'Refresh'}
          </button>
        </motion.div>

        {/* ── THE BIG RECOMMENDATION CARD ── */}
        <motion.div
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="relative glass-strong rounded-3xl border border-cyan-500/30 p-8 mb-6 overflow-hidden glow-cyan"
        >
          {/* Animated background */}
          <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-blue-600/5" />
          <div className="absolute top-4 right-4 w-32 h-32 rounded-full bg-cyan-500/5 blur-2xl" />

          {isAnalyzing ? (
            <div className="flex flex-col items-center py-10 gap-4 relative z-10">
              <div className="w-16 h-16 rounded-full border-4 border-cyan-500/30 border-t-cyan-400 animate-spin" />
              <p className="text-cyan-400 font-semibold">AI is analyzing market data...</p>
              <p className="text-slate-400 text-sm">Checking congestion, prices, demand...</p>
            </div>
          ) : rec ? (
            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xs uppercase tracking-widest text-cyan-400 font-semibold">🤖 AI Recommendation</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/15 border border-cyan-500/25 text-cyan-300">
                  {rec.confidence}% Confidence
                </span>
              </div>

              <div className="grid sm:grid-cols-2 gap-6">
                <div>
                  <p className="text-slate-300 text-sm mb-1">Best Option</p>
                  <p className="text-4xl font-black text-white mb-1">Sell {rec.species}</p>
                  <div className="flex items-center gap-2 text-cyan-400 mb-4">
                    <MapPin size={16} />
                    <span className="font-semibold text-lg">{rec.harbor.name}</span>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="glass rounded-xl p-3 text-center">
                      <p className="text-xs text-slate-400 mb-1">Price</p>
                      <p className="text-emerald-400 font-black text-xl">₹{rec.expectedPrice}</p>
                      <p className="text-xs text-slate-500">/kg</p>
                    </div>
                    <div className="glass rounded-xl p-3 text-center">
                      <p className="text-xs text-slate-400 mb-1">Demand</p>
                      <p className={`font-black text-lg ${rec.demand === 'HIGH' ? 'text-emerald-400' : 'text-amber-400'}`}>{rec.demand}</p>
                    </div>
                    <div className="glass rounded-xl p-3 text-center">
                      <p className="text-xs text-slate-400 mb-1">Risk</p>
                      <p className={`font-black text-lg ${rec.riskLevel === 'LOW' ? 'text-emerald-400' : 'text-amber-400'}`}>{rec.riskLevel}</p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="glass rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin size={14} className={congestionColor} />
                      <span className="text-xs text-slate-400">Harbor Congestion</span>
                    </div>
                    <p className={`font-bold ${congestionColor}`}>{rec.congestionLevel} · {rec.harbor.activeVendors} active vendors</p>
                  </div>

                  <div className="glass rounded-xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <Shield size={14} className="text-cyan-400" />
                      <span className="text-xs text-slate-400">AI Reasoning</span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">{rec.reasoning}</p>
                  </div>

                </div>
              </div>
            </div>
          ) : null}
        </motion.div>

        {/* Stats row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Earnings Today', value: '₹4,820', icon: TrendingUp, color: 'text-emerald-400' },
            { label: 'Fish Scans',     value: '12',     icon: Fish,       color: 'text-cyan-400' },
            { label: 'SMS Sent',       value: '3',      icon: Bell,       color: 'text-amber-400' },
            { label: 'Harbor Zone',    value: 'Zone A', icon: MapPin,     color: 'text-purple-400' },
          ].map(s => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="glass rounded-2xl border border-white/5 p-4">
              <div className="flex items-center gap-2 mb-2">
                <s.icon size={16} className={s.color} />
                <span className="text-xs text-slate-400">{s.label}</span>
              </div>
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            </motion.div>
          ))}
        </div>

        {/* Market prices + SMS log */}
        <div className="grid lg:grid-cols-2 gap-5 mb-6">
          {/* Live prices */}
          <div className="glass rounded-2xl border border-cyan-500/10 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-white font-semibold">Live Market Prices</h3>
              <span className="text-xs text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" />LIVE
              </span>
            </div>
            <div className="space-y-2">
              {MOCK_MARKET_PRICES.slice(0, 5).map(p => (
                <div key={p.species} className="flex items-center justify-between py-2 border-b border-white/5 last:border-0">
                  <span className="text-slate-300 text-sm">🐟 {p.species}</span>
                  <div className="flex items-center gap-3">
                    <DemandBadge demand={p.demand} />
                    <span className="text-white font-semibold text-sm">₹{p.consensusPrice}/kg</span>
                    <span className={`text-xs ${p.trend === 'up' ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {p.trend === 'up' ? '▲' : '▼'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* SMS log */}
          <div className="glass rounded-2xl border border-cyan-500/10 p-5">
            <div className="flex items-center gap-2 mb-4">
              <MessageSquare size={16} className="text-cyan-400" />
              <h3 className="text-white font-semibold">SMS Notification Log</h3>
            </div>
            {smsLog.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 text-slate-500">
                <Bell size={32} className="mb-2 opacity-30" />
                <p className="text-sm">No SMS sent yet. Refresh recommendation to trigger.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {smsLog.map(sms => (
                  <div key={sms.id} className="glass rounded-xl p-3 border border-emerald-500/15">
                    <div className="flex items-center gap-2 mb-1">
                      <CheckCircle size={12} className="text-emerald-400" />
                      <span className="text-xs text-emerald-400">Sent</span>
                      <span className="text-xs text-slate-500 ml-auto flex items-center gap-1">
                        <Clock size={10} /> {sms.timestamp.toLocaleTimeString()}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 whitespace-pre-line leading-relaxed">{sms.message}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <PriceChart />
      </div>
    </div>
  );
};
