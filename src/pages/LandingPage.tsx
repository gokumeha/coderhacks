import React, { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Fish, Zap, Shield, Globe, MessageCircle, Map, TrendingUp,
  ChevronRight, Volume2, Smartphone, Award, ArrowRight
} from 'lucide-react';
import { MOCK_MARKET_PRICES, LANGUAGES } from '@/data';
import { useAuthStore } from '@/store';

const fadeUp = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0 } };
const stagger = { show: { transition: { staggerChildren: 0.1 } } };

const FeatureCard = ({ icon: Icon, title, desc, color }: any) => (
  <motion.div variants={fadeUp} className="glass rounded-2xl p-6 border border-cyan-500/10 hover:border-cyan-500/30 transition-all group">
    <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
      <Icon size={22} className="text-white" />
    </div>
    <h3 className="text-white font-semibold mb-2">{title}</h3>
    <p className="text-slate-400 text-sm leading-relaxed">{desc}</p>
  </motion.div>
);

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const tickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) navigate(user.role === 'admin' ? '/admin' : `/${user.role === 'fisherman' ? 'dashboard' : user.role}`);
  }, [user]);

  // Animate price ticker
  useEffect(() => {
    const el = tickerRef.current;
    if (!el) return;
    let x = 0;
    const tick = () => {
      x -= 0.5;
      if (x < -el.scrollWidth / 2) x = 0;
      el.style.transform = `translateX(${x}px)`;
      requestAnimationFrame(tick);
    };
    const id = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(id);
  }, []);

  const features = [
    { icon: Zap,          title: 'AI Recommendations',     desc: 'One smart decision. No analysis needed. Sell at the best price today.',         color: 'bg-cyan-500/20 border border-cyan-500/30' },
    { icon: Fish,         title: 'Smart Fish Scanner',     desc: 'Scan fish via camera. AI detects species, freshness & grade instantly.',        color: 'bg-blue-500/20 border border-blue-500/30' },
    { icon: Globe,        title: 'Multilingual Voice AI',  desc: 'Speaks in Kannada, Hindi, Tamil & 7 more. Truly local and accessible.',          color: 'bg-purple-500/20 border border-purple-500/30' },
    { icon: Map,          title: 'Harbor Congestion Map',  desc: 'Real-time harbor traffic. Know where to go before you arrive.',                  color: 'bg-emerald-500/20 border border-emerald-500/30' },
    { icon: TrendingUp,   title: 'Live Market Pricing',    desc: 'AI-validated consensus prices. No fake data. Trusted vendor network.',           color: 'bg-amber-500/20 border border-amber-500/30' },
    { icon: MessageCircle,title: 'AI Chatbot Assistant',   desc: 'Ask anything in your language. Smart, fast, fisherman-friendly answers.',        color: 'bg-rose-500/20 border border-rose-500/30' },
    { icon: Smartphone,   title: 'SMS Notifications',     desc: 'Get AI selling recommendations via SMS. Works without internet.',                 color: 'bg-indigo-500/20 border border-indigo-500/30' },
    { icon: Award,        title: 'Premium Auctions',       desc: 'Hotels & exporters bid for your premium fish. Get best value.',                  color: 'bg-teal-500/20 border border-teal-500/30' },
  ];

  return (
    <div className="min-h-screen gradient-bg-primary overflow-x-hidden">

      {/* ── Navbar ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 glass-strong border-b border-cyan-500/10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center glow-cyan-sm">
            <Fish size={18} className="text-white" />
          </div>
          <span className="font-bold text-white text-lg">Fish<span className="text-cyan-400">Flow</span> <span className="text-xs text-cyan-500 font-normal">AI</span></span>
        </div>
        <div className="flex gap-3">
          <button onClick={() => navigate('/login')} className="px-4 py-2 rounded-xl text-slate-300 hover:text-white text-sm transition-all">Login</button>
          <button onClick={() => navigate('/scanner')} className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-medium hover:opacity-90 glow-cyan-sm transition-all">
            Try AI Scanner
          </button>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-20 overflow-hidden">
        {/* Animated orbs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-cyan-500/5 blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-blue-600/5 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full border border-cyan-500/5 animate-spin-slow" />

        <motion.div initial="hidden" animate="show" variants={stagger} className="text-center max-w-4xl z-10">
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-cyan-500/25 text-cyan-400 text-sm mb-6">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
            AI-Powered Smart Harbor Platform · Mangalore
          </motion.div>

          <motion.h1 variants={fadeUp} className="text-5xl sm:text-7xl font-black text-white mb-4 leading-tight">
            Fish<span className="gradient-text glow-text">Flow</span>{' '}
            <span className="text-cyan-400">AI</span>
          </motion.h1>

          <motion.p variants={fadeUp} className="text-xl sm:text-2xl text-slate-400 mb-3 font-light">
            AI-Assisted Real-Time Fish Pricing & Smart Selling
          </motion.p>
          <motion.p variants={fadeUp} className="text-slate-500 mb-10 max-w-2xl mx-auto text-sm">
            One recommendation. One decision. The right price — every time.
            Built for real fishermen in Mangalore harbor. Multilingual. Voice-enabled. Offline-ready.
          </motion.p>

          <motion.div variants={fadeUp} className="flex flex-wrap gap-4 justify-center">
            <button onClick={() => navigate('/login')} className="flex items-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold text-lg hover:opacity-90 glow-cyan transition-all hover:scale-105 active:scale-95">
              Get Started <ChevronRight size={20} />
            </button>
            <button onClick={() => navigate('/scanner')} className="flex items-center gap-2 px-8 py-4 rounded-2xl glass border border-cyan-500/30 text-cyan-300 font-semibold text-lg hover:bg-cyan-500/10 transition-all">
              <Fish size={20} /> Try AI Scanner
            </button>
            <button onClick={() => navigate('/market')} className="flex items-center gap-2 px-8 py-4 rounded-2xl glass border border-white/10 text-slate-300 font-semibold text-lg hover:bg-white/5 transition-all">
              <TrendingUp size={20} /> Live Demo
            </button>
          </motion.div>
        </motion.div>

        {/* Hero recommendation card preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.6 }}
          className="relative z-10 mt-16 w-full max-w-sm"
        >
          <div className="glass-strong rounded-3xl border border-cyan-500/25 p-6 glow-cyan text-center">
            <p className="text-slate-400 text-xs uppercase tracking-widest mb-3">🤖 AI Recommendation</p>
            <p className="text-slate-300 text-sm mb-2">Best Option</p>
            <p className="text-2xl font-black text-white mb-1">Sell Tuna at</p>
            <p className="text-cyan-400 font-bold text-xl mb-3">Mangalore Central Harbor</p>
            <div className="flex justify-center gap-4 mb-4">
              <div className="glass rounded-xl px-4 py-2">
                <p className="text-xs text-slate-400">Expected Price</p>
                <p className="text-emerald-400 font-bold text-lg">₹260/kg</p>
              </div>
              <div className="glass rounded-xl px-4 py-2">
                <p className="text-xs text-slate-400">Demand</p>
                <p className="text-emerald-400 font-bold text-lg">HIGH</p>
              </div>
            </div>
            <button className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-sm hover:bg-cyan-500/25 transition-all">
              <Volume2 size={14} /> Read Recommendation Aloud
            </button>
          </div>
        </motion.div>
      </section>

      {/* ── Live Price Ticker ── */}
      <div className="w-full overflow-hidden bg-cyan-500/5 border-y border-cyan-500/10 py-2.5">
        <div className="flex gap-8 whitespace-nowrap" ref={tickerRef}>
          {[...MOCK_MARKET_PRICES, ...MOCK_MARKET_PRICES].map((p, i) => (
            <span key={i} className="inline-flex items-center gap-2 text-sm text-slate-400 shrink-0">
              <span className="text-cyan-400 font-medium">🐟 {p.species}</span>
              <span className="text-white font-semibold">₹{p.consensusPrice}/kg</span>
              <span className={`text-xs ${p.trend === 'up' ? 'text-emerald-400' : 'text-rose-400'}`}>
                {p.trend === 'up' ? '▲' : '▼'}
              </span>
              <span className="text-slate-600">|</span>
            </span>
          ))}
        </div>
      </div>

      {/* ── Features Grid ── */}
      <section className="px-6 py-24 max-w-7xl mx-auto">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
          <motion.div variants={fadeUp} className="text-center mb-16">
            <span className="text-cyan-400 text-sm font-medium uppercase tracking-widest">Platform Features</span>
            <h2 className="text-4xl font-black text-white mt-3 mb-4">
              One Platform. Every <span className="gradient-text">Harbor Need.</span>
            </h2>
            <p className="text-slate-400 max-w-2xl mx-auto">
              From AI fish scanning to live auctions, multilingual voice assistance to SMS alerts — FishFlow AI has everything fishermen need.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {features.map(f => <FeatureCard key={f.title} {...f} />)}
          </div>
        </motion.div>
      </section>

      {/* ── Languages Showcase ── */}
      <section className="px-6 py-20 bg-gradient-to-b from-transparent to-cyan-500/5">
        <div className="max-w-5xl mx-auto text-center">
          <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
            <motion.div variants={fadeUp}>
              <span className="text-cyan-400 text-sm font-medium uppercase tracking-widest">Multilingual</span>
              <h2 className="text-3xl font-black text-white mt-3 mb-4">Speaks Your Language</h2>
              <p className="text-slate-400 mb-10">Voice output, UI labels, SMS — all in 10 Indian languages.</p>
            </motion.div>
            <motion.div variants={fadeUp} className="flex flex-wrap gap-3 justify-center">
              {LANGUAGES.map(l => (
                <div key={l.code} className="glass rounded-xl px-5 py-3 border border-cyan-500/15 hover:border-cyan-500/40 transition-all cursor-default">
                  <p className="text-white font-semibold">{l.nativeLabel}</p>
                  <p className="text-xs text-slate-500">{l.label}</p>
                </div>
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="px-6 py-24 text-center">
        <motion.div initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger} className="max-w-3xl mx-auto">
          <motion.h2 variants={fadeUp} className="text-4xl font-black text-white mb-4">
            The Future of <span className="gradient-text">Smart Harbors</span> is Here
          </motion.h2>
          <motion.p variants={fadeUp} className="text-slate-400 mb-10">
            Join fishermen, vendors and premium buyers on FishFlow AI — the operating system of Mangalore harbor.
          </motion.p>
          <motion.button variants={fadeUp} onClick={() => navigate('/login')}
            className="inline-flex items-center gap-3 px-10 py-4 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold text-lg hover:opacity-90 glow-cyan transition-all hover:scale-105"
          >
            Launch FishFlow AI <ArrowRight size={20} />
          </motion.button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="text-center py-8 text-slate-600 text-sm border-t border-white/5">
        <p>FishFlow AI · Built for Mangalore Harbor Fishermen · 2025</p>
      </footer>
    </div>
  );
};
