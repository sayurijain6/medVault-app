import React, { useState } from 'react';
import { Search, Eye, User } from 'lucide-react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function PatientSearch({ onSelect }) {
  const { currentUser } = useAuth();
  const [query, setQuery] = useState('');
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    const fetchPatients = async () => {
      if (!currentUser?.uid) return;
      setLoading(true);
      try {
        const res = await api.getMyPatients(currentUser.uid);
        setPatients(res.data.patients || []);
      } catch (err) {
        console.error("Error fetching patients:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchPatients();
  }, [currentUser]);

  const filtered = query ? patients.filter(p => p.name?.toLowerCase().includes(query.toLowerCase()) || p.id?.includes(query)) : patients;

  return (
    <div className="glass-card p-6">
      <h3 className="section-title">Active Patients</h3>
      <div className="relative mb-5">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
        <input type="text" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search by name or ID..." className="input-field pl-10" />
      </div>
      <div className="space-y-2">
        {loading ? (
          <div className="py-12 flex justify-center">
            <div className="w-6 h-6 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            <p className="text-sm">No active patients found.</p>
          </div>
        ) : (
          filtered.map((p) => (
            <div key={p.id} className="flex items-center justify-between p-4 bg-white/[0.02] border border-white/[0.06] rounded-xl hover:bg-white/[0.04] transition-colors group">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-500/10 flex items-center justify-center">
                  <User className="w-5 h-5 text-brand-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{p.name}</p>
                  <p className="text-xs text-slate-500">{p.id} · {p.condition}</p>
                </div>
              </div>
              <button onClick={() => onSelect?.(p.id)} className="btn-ghost text-xs py-1.5 px-3 opacity-0 group-hover:opacity-100 transition-opacity text-brand-400">
                <Eye className="w-3.5 h-3.5" /> View Summary
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
