import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Award, Star, TrendingUp, Plus, CheckCircle, AlertTriangle, BarChart3 } from 'lucide-react';
import { MOCK_VENDORS, MOCK_MARKET_PRICES, FISH_SPECIES } from '@/data';
import { aiService } from '@/services/ai/aiService';
import { useAuthStore, useMarketStore } from '@/store';

export const VendorPage: React.FC = () => {
  const { user } = useAuthStore();
  const [priceInput, setPriceInput] = useState('');
  const [selectedSpecies, setSelectedSpecies] = useState('Tuna');
  const [validation, setValidation] = useState<{ valid: boolean; reason?: string } | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const myVendor = MOCK_VENDORS[0];

  const validateAndSubmit = async () => {
    const price = Number(priceInput);
    if (!price) return;
    setSubmitting(true);
    await new Promise(r => setTimeout(r, 600));
    const result = aiService.validatePrice(price, selectedSpecies);
    setValidation(result);
    if (result.valid) {
      useMarketStore.getState().addVendorPrice({
        id: `vp_${Date.now()}`,
        species: selectedSpecies,
        price,
        vendorId: myVendor.id,
        vendorName: myVendor.name,
        timestamp: Date.now()
      });
      setSubmitted(true);
    }
    setSubmitting(false);
  };

  return (
    <div className="min-h-screen gradient-bg-primary pt-20 px-4 pb-12">
      <div className="max-w-6xl mx-auto">

        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-2xl font-black text-white">Vendor Hub</h1>
          <p className="text-slate-400 text-sm">Manage prices, earn rewards, build trust.</p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Profile card */}
          <div className="lg:col-span-1 space-y-4">
            <div className="glass-strong rounded-2xl border border-cyan-500/20 p-6">
              <div className="flex items-center gap-3 mb-5">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center text-2xl">🏪</div>
                <div>
                  <p className="text-white font-bold">{myVendor.name}</p>
                  <div className="flex gap-1 mt-1">
                    {myVendor.badges.map(b => (
                      <span key={b} className={`text-[10px] px-1.5 py-0.5 rounded-full border ${
                        b === 'verified' ? 'border-cyan-500/30 text-cyan-400' :
                        b === 'top-seller' ? 'border-amber-500/30 text-amber-400' :
                        'border-emerald-500/30 text-emerald-400'}`}>
                        {b === 'verified' ? '✓' : b === 'top-seller' ? '⭐' : '🛡️'} {b}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Trust Score</span>
                  <span className="text-cyan-400 font-bold">{myVendor.trustScore}%</span>
                </div>
                <div className="h-2 rounded-full bg-white/5">
                  <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-400" style={{ width: `${myVendor.trustScore}%` }} />
                </div>

                <div className="flex items-center justify-between pt-2">
                  <span className="text-sm text-slate-400">Reward Points</span>
                  <span className="text-amber-400 font-bold">⭐ {myVendor.rewardPoints.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Rank</span>
                  <span className="text-white font-bold">#1 of {MOCK_VENDORS.length}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-400">Price Updates</span>
                  <span className="text-white font-bold">{myVendor.priceUpdatesCount}</span>
                </div>
              </div>
            </div>

            {/* Badges */}
            <div className="glass rounded-2xl border border-white/5 p-5">
              <h3 className="text-white font-semibold mb-3 flex items-center gap-2"><Award size={16} className="text-amber-400" /> Achievements</h3>
              <div className="grid grid-cols-3 gap-2">
                {['🥇 Top Seller','🛡️ Trusted','✅ Verified','📊 100 Updates','⭐ 5-Star','🌟 Elite'].map(b => (
                  <div key={b} className="glass rounded-xl p-2 text-center">
                    <p className="text-xs text-slate-300 leading-tight">{b}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className="lg:col-span-2 space-y-5">
            {/* Submit price */}
            <div className="glass rounded-2xl border border-cyan-500/15 p-5">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2"><Plus size={16} className="text-cyan-400" /> Submit Price Update</h3>
              <div className="grid sm:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="text-xs text-slate-400 mb-1.5 block">Fish Species</label>
                  <select value={selectedSpecies} onChange={e => { setSelectedSpecies(e.target.value); setValidation(null); setSubmitted(false); }}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-cyan-500/50 transition-all">
                    {FISH_SPECIES.map(f => <option key={f.id} value={f.name} className="bg-slate-900">{f.icon} {f.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-slate-400 mb-1.5 block">Price (₹/kg)</label>
                  <input type="number" value={priceInput} onChange={e => { setPriceInput(e.target.value); setValidation(null); setSubmitted(false); }}
                    placeholder="e.g. 260"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-3 py-2.5 text-white text-sm outline-none focus:border-cyan-500/50 transition-all placeholder-slate-500" />
                </div>
              </div>

              {validation && (
                <div className={`flex items-center gap-2 px-4 py-3 rounded-xl mb-4 text-sm ${validation.valid ? 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-400' : 'bg-rose-500/10 border border-rose-500/20 text-rose-400'}`}>
                  {validation.valid ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
                  {validation.valid ? 'Price validated by AI ✓ Submitted successfully!' : `AI Fraud Alert: ${validation.reason}`}
                </div>
              )}

              <button onClick={validateAndSubmit} disabled={!priceInput || submitting}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-medium text-sm hover:opacity-90 transition-all disabled:opacity-40">
                {submitting ? <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : <Shield size={16} />}
                {submitting ? 'AI Validating...' : 'Submit & AI Validate'}
              </button>
            </div>

            {/* Leaderboard */}
            <div className="glass rounded-2xl border border-white/5 p-5">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2"><Star size={16} className="text-amber-400" /> Vendor Leaderboard</h3>
              <div className="space-y-2">
                {MOCK_VENDORS.map((v, i) => (
                  <motion.div key={v.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                    className={`flex items-center gap-4 px-4 py-3 rounded-xl transition-all ${v.id === 'v1' ? 'bg-cyan-500/10 border border-cyan-500/20' : 'hover:bg-white/3'}`}>
                    <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black ${
                      i === 0 ? 'bg-amber-400 text-black' : i === 1 ? 'bg-slate-300 text-black' : i === 2 ? 'bg-amber-700 text-white' : 'bg-white/10 text-slate-300'
                    }`}>{i + 1}</span>
                    <div className="flex-1">
                      <p className="text-white text-sm font-medium">{v.name}</p>
                      <p className="text-slate-500 text-xs">{v.priceUpdatesCount} updates · Zone {i + 1}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-cyan-400 text-sm font-bold">{v.trustScore}%</p>
                      <p className="text-amber-400 text-xs">⭐ {v.rewardPoints.toLocaleString()}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Live analytics */}
            <div className="glass rounded-2xl border border-white/5 p-5">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2"><BarChart3 size={16} className="text-purple-400" /> Market Analytics</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                  { label: 'Avg Trust Score', value: '91%',   color: 'text-cyan-400' },
                  { label: 'Active Vendors',  value: '23',    color: 'text-emerald-400' },
                  { label: 'Prices Today',   value: '187',   color: 'text-purple-400' },
                  { label: 'Fraud Blocked',  value: '4',     color: 'text-rose-400' },
                ].map(s => (
                  <div key={s.label} className="glass rounded-xl p-3 text-center">
                    <p className={`text-2xl font-black ${s.color}`}>{s.value}</p>
                    <p className="text-xs text-slate-400 mt-1">{s.label}</p>
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
