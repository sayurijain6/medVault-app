import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Sidebar({ items, activeTab, setActiveTab, role, isOpen, onClose }) {
  const roleColor = role === 'doctor' ? 'text-success-400' : 'text-brand-400';

  const content = (
    <div className="flex flex-col h-full">
      <div className="px-5 py-6 border-b border-white/[0.06]">
        <p className={`text-[10px] font-bold ${roleColor} uppercase tracking-[0.25em]`}>{role === 'doctor' ? '● Doctor Portal' : '● Patient Portal'}</p>
      </div>
      <nav className="flex-1 overflow-y-auto py-4 px-3">
        <ul className="space-y-1">
          {items.map((item) => {
            const active = activeTab === item.id;
            return (
              <li key={item.id}>
                <button
                  onClick={() => { setActiveTab(item.id); onClose?.(); }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl font-medium text-sm transition-all duration-200 ${
                    active
                      ? 'bg-brand-500/10 text-brand-400 shadow-sm shadow-brand-500/5 border border-brand-500/20'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                  }`}
                >
                  <item.icon className="w-[18px] h-[18px]" />
                  {item.label}
                  {item.badge && (
                    <span className="ml-auto text-[10px] bg-danger-500 text-white px-1.5 py-0.5 rounded-full font-bold">{item.badge}</span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>
    </div>
  );

  return (
    <>
      {/* Desktop */}
      <aside className="hidden lg:flex fixed left-0 top-16 bottom-0 w-60 glass border-r border-white/[0.06] flex-col z-30">
        {content}
      </aside>
      {/* Mobile Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={onClose} />
            <motion.aside initial={{ x: -280 }} animate={{ x: 0 }} exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25 }}
              className="fixed left-0 top-0 bottom-0 w-60 bg-slate-900 border-r border-white/[0.06] z-50 lg:hidden">
              {content}
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
