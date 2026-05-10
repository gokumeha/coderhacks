import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Fish, Mail, Lock, Phone, Eye, EyeOff, ChevronRight } from 'lucide-react';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signInWithPopup, GoogleAuthProvider, RecaptchaVerifier, signInWithPhoneNumber } from 'firebase/auth';
import { auth } from '@/services/firebase/config';
import toast from 'react-hot-toast';
import { useAuthStore } from '@/store';
import type { User, UserRole } from '@/types';

const DEMO_ACCOUNTS: { role: UserRole; name: string; color: string; desc: string }[] = [
  { role: 'fisherman', name: 'Demo Fisherman', color: 'from-cyan-500 to-blue-600',   desc: 'Raju, Mangalore Harbor' },
  { role: 'vendor',    name: 'Demo Vendor',    color: 'from-purple-500 to-pink-600', desc: 'Rajan Traders' },
  { role: 'buyer',     name: 'Demo Buyer',     color: 'from-amber-500 to-orange-600',desc: 'Sea Pearl Hotel' },
  { role: 'admin',     name: 'Demo Admin',     color: 'from-emerald-500 to-teal-600',desc: 'Harbor Authority' },
];

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setUser } = useAuthStore();
  const [tab, setTab] = useState<'email' | 'phone'>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [verificationResult, setVerificationResult] = useState<any>(null);

  const loginAs = async (role: UserRole, name: string) => {
    setLoading(true);
    await new Promise(r => setTimeout(r, 800));
    const user: User = {
      uid: `demo_${role}_${Date.now()}`,
      displayName: name,
      email: `${role}@fishflow.ai`,
      role,
      language: 'en',
      trustScore: role === 'vendor' ? 95 : undefined,
      rewardPoints: role === 'vendor' ? 4520 : undefined,
      createdAt: new Date(),
    };
    setUser(user);
    setLoading(false);
    if (role === 'admin') navigate('/admin');
    else if (role === 'fisherman') navigate('/dashboard');
    else if (role === 'vendor') navigate('/vendor');
    else navigate('/auction');
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: 'select_account' });
      const result = await signInWithPopup(auth, provider);
      toast.success('Google Login Successful!');
      await loginAs('fisherman', result.user.displayName || 'Google User');
    } catch (err: any) {
      console.error('Google Auth Error:', err);
      if (err.code?.includes('api-key-not-valid') || err.code === 'auth/invalid-api-key' || err.code === 'auth/operation-not-allowed' || err.code === 'auth/billing-not-enabled' || err.message?.includes('API key')) {
        toast.error('Firebase Config Issue. Falling back to Demo Login.', { id: 'fallback-toast' });
        await loginAs('fisherman', 'Demo Google User');
      } else {
        toast.error(err.message || 'Google Authentication failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmailLogin = async () => {
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }
    
    setLoading(true);
    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
        toast.success('Firebase Registration Successful!');
      } else {
        await signInWithEmailAndPassword(auth, email, password);
        toast.success('Firebase Login Successful!');
      }
      
      // Simulate fetching role from Firestore, defaulting to fisherman
      await loginAs('fisherman', email.split('@')[0]);
      
    } catch (err: any) {
      console.error('Firebase Auth Error:', err);
      // Fallback for demo
      if (err.code?.includes('api-key-not-valid') || err.code === 'auth/invalid-api-key' || err.code === 'auth/operation-not-allowed' || err.code === 'auth/billing-not-enabled' || err.message?.includes('API key')) {
        toast.error('Firebase Config Issue. Falling back to Demo Login.', { id: 'fallback-toast' });
        await loginAs('fisherman', email.split('@')[0] || 'Demo User');
      } else {
        toast.error(err.message || 'Authentication failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const setupRecaptcha = () => {
    if (!document.getElementById('recaptcha-container')) return;
    
    // Clear old instance to prevent 'element has been removed' error on re-renders
    if ((window as any).recaptchaVerifier) {
      try {
        (window as any).recaptchaVerifier.clear();
      } catch (e) {}
      (window as any).recaptchaVerifier = null;
    }

    (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, 'recaptcha-container', {
      size: 'invisible',
    });
  };

  const handleSendOTP = async () => {
    if (!phone) {
      toast.error('Please enter phone number');
      return;
    }

    // Firebase requires E.164 format (+[country code][number])
    let formattedPhone = phone.replace(/\s+/g, '');
    if (!formattedPhone.startsWith('+')) {
      if (formattedPhone.length === 10) {
        formattedPhone = '+91' + formattedPhone; // Assume India if 10 digits
      } else if (formattedPhone.startsWith('91')) {
        formattedPhone = '+' + formattedPhone;
      } else {
        formattedPhone = '+' + formattedPhone;
      }
    }

    setLoading(true);
    try {
      setupRecaptcha();
      const appVerifier = (window as any).recaptchaVerifier;
      const result = await signInWithPhoneNumber(auth, formattedPhone, appVerifier);
      setVerificationResult(result);
      toast.success('OTP Sent!');
    } catch (err: any) {
      console.error(err);
      if (err.code?.includes('api-key-not-valid') || err.code === 'auth/invalid-api-key' || err.code === 'auth/operation-not-allowed' || err.code === 'auth/billing-not-enabled' || err.message?.includes('API key')) {
        toast.error('Firebase Config Issue. Falling back to Demo Mode.', { id: 'fallback-toast' });
        
        // Simulate OTP sent state instead of instantly logging in
        setVerificationResult({
          isDemo: true,
          confirm: async (otp: string) => {
            if (otp.length >= 4) return true;
            throw new Error('Invalid OTP');
          }
        });
        toast.success('Mock OTP Sent! (Type any 6 digits)');
      } else {
        toast.error(err.message || 'Failed to send OTP');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!otpCode) {
      toast.error('Please enter OTP');
      return;
    }
    setLoading(true);
    try {
      await verificationResult.confirm(otpCode);
      toast.success('Phone Login Successful!');
      await loginAs('fisherman', 'Phone User');
    } catch (err: any) {
      toast.error('Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (tab === 'email') {
      await handleEmailLogin();
    } else {
      if (verificationResult) {
        await handleVerifyOTP();
      } else {
        await handleSendOTP();
      }
    }
  };

  return (
    <div className="min-h-screen gradient-bg-primary flex items-center justify-center px-4 py-12">
      <div className="absolute top-1/4 left-1/3 w-80 h-80 rounded-full bg-cyan-500/5 blur-3xl" />
      <div className="absolute bottom-1/4 right-1/3 w-64 h-64 rounded-full bg-blue-600/5 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md z-10"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center glow-cyan">
              <Fish size={24} className="text-white" />
            </div>
            <div className="text-left">
              <p className="text-2xl font-black text-white">Fish<span className="text-cyan-400">Flow</span> AI</p>
              <p className="text-xs text-slate-400">Smart Harbor Platform</p>
            </div>
          </div>
          <h1 className="text-xl font-semibold text-white">Welcome Back</h1>
          <p className="text-slate-400 text-sm mt-1">Sign in to your harbor account</p>
        </div>

        {/* Demo Quick Login */}
        <div className="glass rounded-2xl border border-cyan-500/15 p-5 mb-5">
          <p className="text-xs text-slate-400 uppercase tracking-widest mb-3">⚡ Quick Demo Login</p>
          <div className="grid grid-cols-2 gap-2">
            {DEMO_ACCOUNTS.map(acc => (
              <button
                key={acc.role}
                onClick={() => loginAs(acc.role, acc.name)}
                disabled={loading}
                className={`bg-gradient-to-r ${acc.color} p-0.5 rounded-xl hover:opacity-90 transition-all active:scale-95 disabled:opacity-50`}
              >
                <div className="bg-navy-900 rounded-[11px] px-3 py-2.5 text-left hover:bg-transparent transition-colors">
                  <p className="text-white text-xs font-semibold capitalize">{acc.role}</p>
                  <p className="text-white/60 text-[10px]">{acc.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <div className="glass-strong rounded-2xl border border-cyan-500/15 p-6">
          {/* Tabs */}
          <div className="flex rounded-xl overflow-hidden border border-cyan-500/15 mb-5">
            {(['email', 'phone'] as const).map(t => (
              <button key={t} onClick={() => setTab(t)} className={`flex-1 py-2.5 text-sm font-medium transition-all ${tab === t ? 'bg-cyan-500/20 text-cyan-300' : 'text-slate-400 hover:text-white'}`}>
                {t === 'email' ? '✉️ Email' : '📱 Phone OTP'}
              </button>
            ))}
          </div>

          <form onSubmit={handleFormSubmit} className="space-y-4">
            {tab === 'email' ? (
              <>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="Email address"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-500 text-sm outline-none focus:border-cyan-500/50 transition-all" />
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input value={password} onChange={e => setPassword(e.target.value)} type={showPass ? 'text' : 'password'} placeholder="Password"
                    className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-10 py-3 text-white placeholder-slate-500 text-sm outline-none focus:border-cyan-500/50 transition-all" />
                  <button type="button" onClick={() => setShowPass(s => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300">
                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </>
            ) : (
              <>
                {!verificationResult ? (
                  <div className="relative">
                    <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input value={phone} onChange={e => setPhone(e.target.value)} type="tel" placeholder="+91 9876543210"
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-500 text-sm outline-none focus:border-cyan-500/50 transition-all" />
                  </div>
                ) : (
                  <div className="relative">
                    <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input value={otpCode} onChange={e => setOtpCode(e.target.value)} type="text" placeholder="Enter 6-digit OTP"
                      className="w-full bg-white/5 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder-slate-500 text-sm outline-none focus:border-cyan-500/50 transition-all tracking-widest" />
                  </div>
                )}
              </>
            )}

            <button type="submit" disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-semibold hover:opacity-90 glow-cyan-sm transition-all disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
              ) : (
                <>{tab === 'phone' ? (verificationResult ? 'Verify OTP' : 'Send OTP') : (isRegistering ? 'Create Account' : 'Sign In')} <ChevronRight size={16} /></>
              )}
            </button>
          </form>

          <div className="flex items-center gap-3 my-5">
            <div className="h-px flex-1 bg-white/10" />
            <span className="text-xs text-slate-500">OR</span>
            <div className="h-px flex-1 bg-white/10" />
          </div>

          <button type="button" onClick={handleGoogleLogin} disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-3 rounded-xl glass border border-white/10 text-white font-medium hover:bg-white/5 transition-all disabled:opacity-50"
          >
            <svg viewBox="0 0 24 24" width="18" height="18" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <p className="text-center text-xs text-slate-500 mt-5">
            {isRegistering ? 'Already have an account? ' : 'New to FishFlow? '}
            <button type="button" onClick={() => setIsRegistering(!isRegistering)} className="text-cyan-400 hover:underline">
              {isRegistering ? 'Sign In' : 'Create account'}
            </button>
          </p>
        </div>
      </motion.div>
      <div id="recaptcha-container"></div>
    </div>
  );
};
