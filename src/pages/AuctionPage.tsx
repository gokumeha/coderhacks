import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, Clock, TrendingUp, Award, Fish, Plus, X } from 'lucide-react';
import { useAuthStore, useAuctionStore } from '@/store';
import type { AuctionListing } from '@/types';

const useCountdown = (endsAt: Date | string | number) => {
  const [timeLeft, setTimeLeft] = useState('');
  useEffect(() => {
    const tick = () => {
      const end = new Date(endsAt);
      const diff = Math.max(0, end.getTime() - Date.now());
      const m = Math.floor(diff / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${m}:${s.toString().padStart(2, '0')}`);
    };
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, [endsAt]);
  return timeLeft;
};

const AuctionCard = ({ lot, onBid, isFisherman }: { lot: AuctionListing; onBid: (id: string, amount: number) => void; isFisherman: boolean }) => {
  const timeLeft = useCountdown(lot.endsAt);
  const [bidding, setBidding] = useState(false);
  const urgency = new Date(lot.endsAt).getTime() - Date.now() < 10 * 60000;

  const placeBid = async () => {
    setBidding(true);
    await new Promise(r => setTimeout(r, 700));
    onBid(lot.id, lot.currentBid + 20);
    setBidding(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      className={`glass rounded-2xl border p-5 hover:border-cyan-500/30 transition-all ${urgency ? 'border-amber-500/30 animate-pulse-glow' : 'border-cyan-500/15'}`}>
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-white font-bold">🐟 {lot.species}</span>
            {lot.grade_certified && <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400">AI Certified {lot.grade}</span>}
          </div>
          <p className="text-slate-400 text-sm">{lot.weight} kg · Grade {lot.grade}</p>
        </div>
        <div className={`flex items-center gap-1 text-sm font-mono font-bold ${urgency ? 'text-amber-400' : 'text-cyan-400'}`}>
          <Clock size={14} /> {timeLeft}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="glass rounded-xl p-3">
          <p className="text-xs text-slate-400">Start Price</p>
          <p className="text-white font-semibold">₹{lot.startPrice}/kg</p>
        </div>
        <div className="glass rounded-xl p-3">
          <p className="text-xs text-slate-400">Current Bid</p>
          <p className="text-emerald-400 font-bold text-lg">₹{lot.currentBid}/kg</p>
        </div>
      </div>

      <div className="flex gap-2">
        {isFisherman ? (
          <button disabled className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-800 text-slate-500 font-semibold text-sm border border-slate-700 cursor-not-allowed">
            Fishermen cannot bid
          </button>
        ) : (
          <button onClick={placeBid} disabled={bidding}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-sm hover:opacity-90 transition-all disabled:opacity-50">
            {bidding ? <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : <Zap size={14} />}
            Bid ₹{lot.currentBid + 20}/kg
          </button>
        )}
        <div className="px-3 py-2.5 rounded-xl glass border border-white/5 text-center">
          <p className="text-[10px] text-slate-400">Total</p>
          <p className="text-xs text-white font-bold">₹{Math.round(lot.currentBid * lot.weight).toLocaleString()}</p>
        </div>
      </div>
    </motion.div>
  );
};

export const AuctionPage: React.FC = () => {
  const { user } = useAuthStore();
  const { auctions, addAuction, updateBid } = useAuctionStore();
  const isFisherman = user?.role === 'fisherman';
  const [showForm, setShowForm] = useState(false);
  
  // Form State
  const [newSpecies, setNewSpecies] = useState('Red Snapper');
  const [newWeight, setNewWeight] = useState('10');
  const [newPrice, setNewPrice] = useState('400');

  const handleBid = (id: string, amount: number) => {
    updateBid(id, amount);
  };

  const handleAddLot = (e: React.FormEvent) => {
    e.preventDefault();
    const newLot: AuctionListing = {
      id: `a${Date.now()}`,
      species: newSpecies,
      weight: parseFloat(newWeight) || 0,
      grade: 'A',
      grade_certified: false,
      startPrice: parseInt(newPrice) || 0,
      currentBid: parseInt(newPrice) || 0,
      endsAt: new Date(Date.now() + 60 * 60000), // 1 hour from now
      sellerId: user?.uid || 's1',
      status: 'active'
    };
    addAuction(newLot);
    setShowForm(false);
  };

  return (
    <div className="min-h-screen gradient-bg-primary pt-20 px-4 pb-12">
      <div className="max-w-5xl mx-auto">

        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl font-black text-white">Premium Auction</span>
            <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse inline-block" /> LIVE
            </span>
            {isFisherman && (
              <button 
                onClick={() => setShowForm(!showForm)} 
                className="ml-auto flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:opacity-90 text-white font-bold rounded-xl transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)]"
              >
                {showForm ? <X size={18} /> : <Plus size={18} />}
                {showForm ? 'Cancel' : 'Add Fish'}
              </button>
            )}
          </div>
          <p className="text-slate-400 text-sm">AI-certified premium fish lots. Hotels, restaurants & exporters bid here.</p>
        </motion.div>

        {/* Add Form */}
        {showForm && isFisherman && (
          <motion.form 
            initial={{ opacity: 0, height: 0 }} 
            animate={{ opacity: 1, height: 'auto' }} 
            onSubmit={handleAddLot}
            className="glass rounded-2xl border border-cyan-500/30 p-5 mb-6 shadow-[0_0_20px_rgba(6,182,212,0.1)]"
          >
            <h3 className="text-white font-bold mb-4 flex items-center gap-2"><Fish size={18} className="text-cyan-400"/> New Auction Lot</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1">Fish Species</label>
                <input required type="text" value={newSpecies} onChange={e => setNewSpecies(e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-cyan-500/50" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Total Weight (kg)</label>
                <input required type="number" step="0.1" value={newWeight} onChange={e => setNewWeight(e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-cyan-500/50" />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1">Starting Price (₹/kg)</label>
                <input required type="number" value={newPrice} onChange={e => setNewPrice(e.target.value)} className="w-full bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-white outline-none focus:border-cyan-500/50" />
              </div>
            </div>
            <button type="submit" className="w-full sm:w-auto px-6 py-2.5 bg-cyan-500 hover:bg-cyan-600 text-white font-bold rounded-xl transition-colors">
              List for Auction
            </button>
          </motion.form>
        )}

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
          {[
            { label: 'Active Lots',    value: auctions.length,                                icon: Fish,       color: 'text-cyan-400' },
            { label: 'Total Bids',     value: '47',                                           icon: TrendingUp, color: 'text-emerald-400' },
            { label: 'Highest Bid',    value: `₹${Math.max(...auctions.map(a => a.currentBid))}/kg`, icon: Award,  color: 'text-amber-400' },
            { label: 'AI Certified',   value: `${auctions.filter(a => a.grade_certified).length}/${auctions.length}`, icon: Zap, color: 'text-purple-400' },
          ].map(s => (
            <div key={s.label} className="glass rounded-2xl border border-white/5 p-4">
              <div className="flex items-center gap-2 mb-1">
                <s.icon size={14} className={s.color} />
                <span className="text-xs text-slate-400">{s.label}</span>
              </div>
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        <div className="grid sm:grid-cols-2 gap-5">
          {auctions.map(lot => <AuctionCard key={lot.id} lot={lot} onBid={handleBid} isFisherman={isFisherman} />)}
        </div>
      </div>
    </div>
  );
};
