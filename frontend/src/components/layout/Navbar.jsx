import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShieldPlus, Bell, LogOut, Menu } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import NotificationCenter from '../shared/NotificationCenter';

export default function Navbar({ onMenuToggle }) {
  const { currentUser, logout } = useAuth();
  const location = useLocation();

  const isEmergency = location.pathname === '/emergency';
  if (isEmergency) return null;

  return (
    <nav className="fixed top-0 left-0 right-0 z-40 h-16 glass border-b border-white/[0.06]">
      <div className="h-full flex items-center justify-between px-4 lg:px-6">
        <div className="flex items-center gap-3">
          <button onClick={onMenuToggle} className="lg:hidden p-2 hover:bg-white/[0.06] rounded-lg transition-colors">
            <Menu className="w-5 h-5 text-slate-300" />
          </button>
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 bg-slate-900 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/10 border border-white/5 overflow-hidden transition-all group-hover:scale-110 group-hover:border-brand-500/30">
              <img src="/logo-icon.png" alt="MedVault" className="w-full h-full object-cover" />
            </div>
            <span className="text-lg font-display font-bold text-white hidden sm:block">
              Med<span className="text-brand-400">Vault</span>
            </span>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          {currentUser && (
            <>
              <NotificationCenter />
              <div className="w-px h-6 bg-white/[0.08] mx-1 hidden sm:block" />
              <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.03]">
                <div className="w-7 h-7 rounded-full bg-brand-500/20 flex items-center justify-center text-brand-400 text-xs font-bold">
                  {currentUser.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <span className="text-sm text-slate-300 font-medium max-w-[120px] truncate">{currentUser.email}</span>
              </div>
              <button onClick={logout} className="p-2.5 hover:bg-danger-500/10 rounded-xl transition-colors text-slate-400 hover:text-danger-400" aria-label="Logout">
                <LogOut className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
