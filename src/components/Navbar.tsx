import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Fish, LayoutDashboard, ScanLine, ShoppingCart, BarChart3,
  Map, MessageCircle, Settings, LogOut, Menu, X, Zap
} from 'lucide-react';
import { useAuthStore, useUIStore } from '@/store';
import { LanguageSwitcher } from './ui/LanguageSwitcher';

const navItems = [
  { to: '/dashboard',  icon: LayoutDashboard, label: 'Dashboard',  roles: ['fisherman'] },
  { to: '/scanner',    icon: ScanLine,        label: 'AI Scanner', roles: ['fisherman', 'admin'] },
  { to: '/market',     icon: BarChart3,       label: 'Live Market',roles: ['fisherman', 'vendor', 'buyer', 'admin'] },
  { to: '/vendor',     icon: ShoppingCart,    label: 'Vendor Hub', roles: ['vendor', 'admin'] },
  { to: '/auction',    icon: Zap,             label: 'Auction',    roles: ['buyer', 'fisherman', 'admin'] },
  { to: '/map',        icon: Map,             label: 'Harbor Map', roles: ['fisherman', 'vendor', 'buyer', 'admin'] },
  { to: '/admin',      icon: Settings,        label: 'Admin',      roles: ['admin'] },
];

export const Navbar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { toggleChatbot, sidebarOpen, toggleSidebar } = useUIStore();
  const navigate = useNavigate();

  const userRole = user?.role ?? 'fisherman';
  const filtered = navItems.filter(n => n.roles.includes(userRole));

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 h-16 glass-strong border-b border-cyan-500/15 flex items-center px-4 gap-4">
        {/* Logo */}
        <NavLink to="/" className="flex items-center gap-2 mr-4">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-400 to-blue-600 flex items-center justify-center glow-cyan-sm">
            <Fish size={18} className="text-white" />
          </div>
          <span className="font-bold text-white text-lg hidden sm:block">
            Fish<span className="text-cyan-400">Flow</span>
            <span className="text-xs text-cyan-500 ml-1 font-normal">AI</span>
          </span>
        </NavLink>

        {/* Desktop nav */}
        <div className="hidden lg:flex items-center gap-1 flex-1">
          {filtered.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm transition-all ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                }`
              }
            >
              <item.icon size={15} />
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="flex-1 lg:flex-none" />

        <LanguageSwitcher />

        {user && (
          <button
            onClick={toggleChatbot}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-sm hover:bg-cyan-500/20 transition-all"
          >
            <MessageCircle size={15} />
            <span className="hidden sm:block">Chat</span>
          </button>
        )}

        {user ? (
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-lg glass border border-white/10">
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-cyan-400 to-purple-500 flex items-center justify-center text-xs font-bold text-white">
                {user.displayName?.[0] ?? 'F'}
              </div>
              <span className="text-sm text-slate-300">{user.displayName}</span>
            </div>
            <button onClick={handleLogout} className="p-2 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 transition-all">
              <LogOut size={16} />
            </button>
          </div>
        ) : (
          <NavLink to="/login" className="px-4 py-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 text-white text-sm font-medium hover:opacity-90 transition-all glow-cyan-sm">
            Login
          </NavLink>
        )}

        {/* Mobile menu */}
        <button onClick={toggleSidebar} className="lg:hidden p-2 text-slate-400 hover:text-white">
          {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </nav>

      {/* Mobile sidebar */}
      {sidebarOpen && (
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: 0 }}
          exit={{ x: '-100%' }}
          className="fixed top-16 left-0 bottom-0 w-64 z-40 glass-strong border-r border-cyan-500/15 flex flex-col p-4 gap-1"
        >
          {filtered.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={toggleSidebar}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl text-sm transition-all ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
          {user && (
            <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-rose-400 hover:bg-rose-500/10 transition-all mt-auto">
              <LogOut size={18} /> Logout
            </button>
          )}
        </motion.div>
      )}
    </>
  );
};
