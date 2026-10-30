import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';

export default function Sidebar({ title, role, menuItems, activeTab, setActiveTab }) {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed left-0 top-0 w-60 h-full bg-panels border-r border-border flex flex-col z-20 shadow-xl">
      <div className="p-6 border-b border-border/50">
        <h1 className="text-xl font-display font-bold text-text-primary tracking-wide">{title}</h1>
        <p className="text-xs text-text-accent uppercase tracking-widest mt-1 font-semibold">{role}</p>
      </div>
      
      <div className="flex-1 overflow-y-auto py-6">
        <ul className="space-y-2 px-3">
          {menuItems.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => {
                  if (setActiveTab) setActiveTab(item.id);
                  if (item.action) item.action();
                }}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === item.id 
                    ? 'bg-subtle text-primary border-l-4 border-primary shadow-sm' 
                    : 'text-text-secondary hover:bg-subtle/50 hover:text-text-primary'
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div className="p-4 border-t border-border/50">
        <button 
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-text-secondary hover:text-danger hover:bg-danger/10 transition-colors"
        >
          <LogOut className="w-5 h-5" />
          Logout
        </button>
      </div>
    </div>
  );
}
