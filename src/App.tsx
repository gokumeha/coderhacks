import React, { Component, ErrorInfo, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { Navbar } from './components/Navbar';
import { Chatbot } from './components/chatbot/Chatbot';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { FishermanDashboard } from './pages/FishermanDashboard';
import { ScannerPage } from './pages/ScannerPage';
import { MarketPage } from './pages/MarketPage';
import { VendorPage } from './pages/VendorPage';
import { AuctionPage } from './pages/AuctionPage';
import { MapPage } from './pages/MapPage';
import { AdminPage } from './pages/AdminPage';
import { useAuthStore } from './store';

// ── Protected Route ───────────────────────────────────────────────────────────
const Protected: React.FC<{ children: React.ReactNode; roles?: string[] }> = ({ children, roles }) => {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return <>{children}</>;
};

// ── App Shell (with Navbar) ───────────────────────────────────────────────────
const Shell: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <>
    <Navbar />
    {children}
    <Chatbot />
  </>
);

// ── Error Boundary ────────────────────────────────────────────────────────────
class ErrorBoundary extends Component<{ children: React.ReactNode }, { hasError: boolean, error: Error | null }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('[FishFlow] Fatal React Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen gradient-bg-primary flex flex-col items-center justify-center p-6 text-center">
          <div className="glass-strong rounded-3xl p-8 max-w-md border border-rose-500/30 glow-rose">
            <h1 className="text-2xl font-bold text-white mb-2">Something went wrong.</h1>
            <p className="text-rose-400 text-sm mb-6">{this.state.error?.message || 'A critical error occurred.'}</p>
            <button 
              onClick={() => window.location.reload()} 
              className="px-6 py-2.5 bg-gradient-to-r from-blue-500 to-cyan-500 text-white font-bold rounded-full hover:scale-105 transition-all"
            >
              Reload Application
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// ── App ───────────────────────────────────────────────────────────────────────
export default function App() {
  useEffect(() => {
    console.log('[FishFlow] Application mounted successfully.');
  }, []);

  return (
    <ErrorBoundary>
      <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#0d1530',
            color: '#e2e8f0',
            border: '1px solid rgba(0,229,255,0.2)',
            borderRadius: '12px',
          },
        }}
      />
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Scanner — accessible without auth for demo */}
        <Route path="/scanner" element={
          <Shell>
            <ScannerPage />
          </Shell>
        } />

        {/* Market — accessible to all logged in */}
        <Route path="/market" element={
          <Shell>
            <Protected>
              <MarketPage />
            </Protected>
          </Shell>
        } />

        {/* Fisherman Dashboard */}
        <Route path="/dashboard" element={
          <Shell>
            <Protected roles={['fisherman', 'admin']}>
              <FishermanDashboard />
            </Protected>
          </Shell>
        } />

        {/* Vendor Hub */}
        <Route path="/vendor" element={
          <Shell>
            <Protected roles={['vendor', 'admin']}>
              <VendorPage />
            </Protected>
          </Shell>
        } />

        {/* Premium Auction */}
        <Route path="/auction" element={
          <Shell>
            <Protected roles={['buyer', 'fisherman', 'admin']}>
              <AuctionPage />
            </Protected>
          </Shell>
        } />

        {/* Harbor Map */}
        <Route path="/map" element={
          <Shell>
            <Protected>
              <MapPage />
            </Protected>
          </Shell>
        } />

        {/* Admin */}
        <Route path="/admin" element={
          <Shell>
            <Protected roles={['admin']}>
              <AdminPage />
            </Protected>
          </Shell>
        } />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
    </ErrorBoundary>
  );
}
