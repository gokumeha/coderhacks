import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Users, Shield, AlertTriangle, BarChart3, Fish,
  CheckCircle, XCircle, TrendingUp, Settings, RefreshCw
} from 'lucide-react';
import { MOCK_VENDORS, MOCK_MARKET_PRICES, HARBORS } from '@/data';

const MOCK_USERS = [
  { id: 'u1', name: 'Raju Kumar',     role: 'fisherman', status: 'active',  harbor: 'Mangalore Central', joinedDays: 45 },
  { id: 'u2', name: 'Rajan Traders',  role: 'vendor',    status: 'active',  harbor: 'Mangalore Central', joinedDays: 120 },
  { id: 'u3', name: 'Sea Pearl Hotel',role: 'buyer',     status: 'active',  harbor: 'N/A',               joinedDays: 30 },
  { id: 'u4', name: 'Mohan Fisheries',role: 'fisherman', status: 'flagged', harbor: 'Bunder Market',     joinedDays: 7 },
  { id: 'u5', name: 'Quick Traders',  role: 'vendor',    status: 'pending', harbor: 'Ullal Harbor',      joinedDays: 2 },
];

const FRAUD_ALERTS = [
  { id: 'f1', vendor: 'Quick Traders', species: 'Tuna',    submitted: 850, consensus: 260, deviation: '227%', severity: 'critical' },
  { id: 'f2', vendor: 'Harbor Depot',  species: 'Sardine', submitted: 12,  consensus: 95,  deviation: '87%',  severity: 'high' },
];

const StatCard = ({ icon: Icon, label, value, color, sub }: any) => (
  <div className="glass rounded-2xl border border-white/5 p-5">
    <div className="flex items-center gap-2 mb-2">
      <Icon size={16} className={color} />
      <span className="text-xs text-slate-400">{label}</span>
    </div>
    <p className={`text-3xl font-black ${color}`}>{value}</p>
    {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
  </div>
);

export const AdminPage: React.FC = () => {
  const [userFilter, setUserFilter] = useState<'all' | 'fisherman' | 'vendor' | 'buyer'>('all');
  const [refreshing, setRefreshing] = useState(false);

  const filtered = MOCK_USERS.filter(u => userFilter === 'all' || u.role === userFilter);

  const refresh = async () => {
    setRefreshing(true);
    await new Promise(r => setTimeout(r, 1000));
    setRefreshing(false);
  };

  return (
    <div className="min-h-screen gradient-bg-primary pt-20 px-4 pb-12">
      <div className="max-w-7xl mx-auto">

        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-white flex items-center gap-2">
              <Settings size={24} className="text-cyan-400" /> Admin Control Center
            </h1>
            <p className="text-slate-400 text-sm">FishFlow AI · Harbor Authority Dashboard</p>
          </div>
          <button onClick={refresh} disabled={refreshing}
            className="flex items-center gap-2 px-4 py-2 rounded-xl glass border border-cyan-500/20 text-cyan-300 text-sm hover:border-cyan-400/50 disabled:opacity-50 transition-all">
            <RefreshCw size={14} className={refreshing ? 'animate-spin' : ''} />
            Refresh
          </button>
        </motion.div>

        {/* Platform stats */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          {[
            { icon: Users,        label: 'Total Users',    value: '284',   color: 'text-cyan-400',    sub: '+12 this week' },
            { icon: Fish,         label: 'Fish Scans',     value: '1,847', color: 'text-blue-400',    sub: 'All time' },
            { icon: Shield,       label: 'Active Vendors', value: '23',    color: 'text-emerald-400', sub: 'Verified' },
            { icon: AlertTriangle,label: 'Fraud Alerts',   value: '2',     color: 'text-rose-400',    sub: 'Today' },
            { icon: BarChart3,    label: 'Transactions',   value: '₹2.4L', color: 'text-amber-400',   sub: 'Today' },
            { icon: TrendingUp,   label: 'AI Accuracy',    value: '94%',   color: 'text-purple-400',  sub: 'Recommendation' },
          ].map(s => <StatCard key={s.label} {...s} />)}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">

          {/* User Management */}
          <div className="lg:col-span-2 space-y-5">
            <div className="glass rounded-2xl border border-white/5 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-semibold flex items-center gap-2"><Users size={16} className="text-cyan-400" /> User Management</h3>
                <div className="flex gap-1">
                  {(['all', 'fisherman', 'vendor', 'buyer'] as const).map(f => (
                    <button key={f} onClick={() => setUserFilter(f)}
                      className={`px-3 py-1 rounded-lg text-xs transition-all capitalize ${userFilter === f ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' : 'text-slate-400 hover:text-white'}`}>
                      {f}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                {filtered.map(u => (
                  <div key={u.id} className="flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white/3 transition-all">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-xs font-bold text-white shrink-0">
                      {u.name[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white text-sm font-medium truncate">{u.name}</p>
                      <p className="text-slate-500 text-xs capitalize">{u.role} · {u.harbor}</p>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full border capitalize ${
                      u.status === 'active'  ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                      u.status === 'flagged' ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' :
                      'bg-amber-500/10 border-amber-500/20 text-amber-400'}`}>
                      {u.status}
                    </span>
                    <div className="flex gap-1">
                      <button className="p-1.5 rounded-lg hover:bg-emerald-500/10 text-slate-400 hover:text-emerald-400 transition-all"><CheckCircle size={14} /></button>
                      <button className="p-1.5 rounded-lg hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 transition-all"><XCircle size={14} /></button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Harbor overview */}
            <div className="glass rounded-2xl border border-white/5 p-5">
              <h3 className="text-white font-semibold mb-4">Harbor Status Overview</h3>
              <div className="grid sm:grid-cols-2 gap-3">
                {HARBORS.map(h => {
                  const col = h.congestion === 'LOW' ? 'text-emerald-400 border-emerald-500/20' : h.congestion === 'MEDIUM' ? 'text-amber-400 border-amber-500/20' : 'text-rose-400 border-rose-500/20';
                  return (
                    <div key={h.id} className={`glass rounded-xl border p-3 ${col.split(' ')[1]}`}>
                      <p className="text-white text-sm font-medium">{h.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-xs font-semibold ${col.split(' ')[0]}`}>● {h.congestion}</span>
                        <span className="text-slate-500 text-xs">{h.activeVendors} vendors</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right panel */}
          <div className="space-y-5">
            {/* Fraud alerts */}
            <div className="glass rounded-2xl border border-rose-500/20 p-5">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <AlertTriangle size={16} className="text-rose-400" /> AI Fraud Alerts
              </h3>
              {FRAUD_ALERTS.map(f => (
                <div key={f.id} className="glass rounded-xl border border-rose-500/15 p-3 mb-3 last:mb-0">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-white text-sm font-medium">{f.vendor}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${f.severity === 'critical' ? 'bg-rose-500/20 text-rose-400' : 'bg-amber-500/20 text-amber-400'}`}>
                      {f.severity}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">{f.species}: submitted ₹{f.submitted} vs consensus ₹{f.consensus}</p>
                  <p className="text-xs text-rose-400 font-semibold mt-1">+{f.deviation} deviation</p>
                  <div className="flex gap-2 mt-2">
                    <button className="flex-1 text-xs py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20 transition-all">Block</button>
                    <button className="flex-1 text-xs py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20 transition-all">Allow</button>
                  </div>
                </div>
              ))}
            </div>

            {/* Fish trends */}
            <div className="glass rounded-2xl border border-white/5 p-5">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2"><Fish size={16} className="text-cyan-400" /> Fish Demand Trends</h3>
              <div className="space-y-2">
                {MOCK_MARKET_PRICES.map(p => (
                  <div key={p.species} className="flex items-center gap-3">
                    <span className="text-slate-300 text-xs w-20 truncate">🐟 {p.species}</span>
                    <div className="flex-1 h-2 rounded-full bg-white/5 overflow-hidden">
                      <div className={`h-full rounded-full ${p.demand === 'HIGH' ? 'bg-emerald-400' : p.demand === 'MEDIUM' ? 'bg-amber-400' : 'bg-rose-400'}`}
                        style={{ width: p.demand === 'HIGH' ? '85%' : p.demand === 'MEDIUM' ? '55%' : '25%' }} />
                    </div>
                    <span className={`text-xs font-medium w-14 text-right ${p.demand === 'HIGH' ? 'text-emerald-400' : p.demand === 'MEDIUM' ? 'text-amber-400' : 'text-rose-400'}`}>{p.demand}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
