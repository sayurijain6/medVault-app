import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Users, Key, FilePlus, Activity, ClipboardList, BarChart3, MessageSquare } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import Footer from '../components/layout/Footer';
import PatientSearch from '../components/doctor/PatientSearch';
import AccessRequest from '../components/doctor/AccessRequest';
import PrescriptionForm from '../components/doctor/PrescriptionForm';
import PatientNotesForm from '../components/doctor/PatientNotesForm';
import DashboardStats from '../components/patient/DashboardStats';
import AlertBanner from '../components/shared/AlertBanner';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { GaugeChart } from '../components/shared/Chart';

const menuItems = [
  { id: 'overview', label: 'Overview', icon: BarChart3 },
  { id: 'patients', label: 'My Patients', icon: Users },
  { id: 'access', label: 'Request Access', icon: Key },
  { id: 'prescriptions', label: 'Prescriptions', icon: FilePlus },
  { id: 'notes', label: 'Notes', icon: MessageSquare },
];

import PatientDetailView from '../components/doctor/PatientDetailView';

export default function DoctorDashboard() {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [viewMode, setViewMode] = useState('list'); // 'list' or 'detail'
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [summary, setSummary] = useState(null);
  const [healthScore, setHealthScore] = useState(null);
  const [loadingSummary, setLoadingSummary] = useState(false);

  const showToast = (msg, type = 'success') => setToast({ message: msg, type });

  const handlePatientSelect = async (patientId) => {
    setSelectedPatient(patientId);
    setViewMode('list'); // Default to list view first to show summary
    setLoadingSummary(true);
    setHealthScore(null);
    try {
      const [summaryRes, scoreRes] = await Promise.all([
        api.getPatientSummary(patientId),
        api.getHealthScore(patientId)
      ]);
      setSummary(summaryRes.data);
      setHealthScore(scoreRes.data);
    } catch { showToast('Failed to load patient summary', 'error'); }
    finally { setLoadingSummary(false); }
  };



  const statCards = [
    { label: 'Active Patients', value: 3, icon: Users, iconBg: 'bg-brand-500/10', iconColor: 'text-brand-400' },
    { label: 'Prescriptions Issued', value: 12, icon: FilePlus, iconBg: 'bg-success-500/10', iconColor: 'text-success-400' },
    { label: 'Pending Requests', value: 1, icon: Key, iconBg: 'bg-warning-500/10', iconColor: 'text-warning-400' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar items={menuItems} activeTab={activeTab} setActiveTab={setActiveTab} role="doctor" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 pt-16 lg:pl-60 flex flex-col">
        <div className="p-4 md:p-6 lg:p-8 w-full max-w-[1600px] mx-auto space-y-6 flex-1">
          <motion.div key={activeTab} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {viewMode === 'list' ? (
                  <>
                    <DashboardStats stats={statCards} />
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                      <PatientSearch onSelect={handlePatientSelect} />
                      {loadingSummary ? (
                        <div className="glass-card p-6 flex items-center justify-center min-h-[300px]">
                          <div className="flex flex-col items-center gap-3 text-slate-500">
                            <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
                            <p className="text-sm font-medium">Analyzing patient data...</p>
                          </div>
                        </div>
                      ) : summary ? (
                        <div className="glass-card p-6 relative overflow-hidden flex flex-col min-h-[400px]">
                          <div className="absolute -right-12 -top-12 w-48 h-48 bg-brand-500/10 rounded-full blur-3xl animate-pulse" />
                          <div className="flex items-center justify-between mb-6 relative z-10">
                            <h3 className="section-title">Clinical Snapshot</h3>
                            {healthScore && (
                              <div className="text-[10px] font-black text-brand-400 uppercase tracking-widest bg-brand-500/10 px-2 py-1 rounded-lg border border-brand-500/20">
                                Patient Matrix Live
                              </div>
                            )}
                          </div>
                          
                          <div className="flex flex-col md:flex-row gap-8 mb-6 relative z-10">
                            {healthScore && (
                              <div className="flex flex-col items-center justify-center p-4 bg-white/[0.03] rounded-2xl border border-white/[0.06] shrink-0">
                                <GaugeChart value={healthScore.score} size={140} />
                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-2">{healthScore.category}</span>
                              </div>
                            )}
                            <div className="flex-1">
                              <h4 className="text-xl font-display font-black text-white mb-3">ID: {summary.patientId}</h4>
                              <p className="text-sm text-slate-300 leading-relaxed font-medium line-clamp-6">{summary.summary}</p>
                            </div>
                          </div>

                          <div className="flex gap-2 flex-wrap mb-6 relative z-10">
                            {summary.trends?.map((t, i) => (
                              <span key={i} className="px-2 py-1 rounded-lg bg-white/5 border border-white/10 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                                {t}
                              </span>
                            ))}
                          </div>
                          
                          <button onClick={() => setViewMode('detail')} className="btn-primary mt-auto w-full font-black text-xs uppercase tracking-widest py-4">
                            Access Full Clinical OS
                          </button>
                        </div>
                      ) : (
                        <div className="glass-card p-6 flex items-center justify-center text-center min-h-[300px]">
                          <div className="text-slate-500">
                            <Activity className="w-12 h-12 mx-auto mb-3 opacity-30" />
                            <p className="font-medium">Select a patient to view their clinical summary</p>
                          </div>
                        </div>
                      )}
                    </div>
                    

                  </>
                ) : (
                  <PatientDetailView 
                    patientId={selectedPatient} 
                    onBack={() => setViewMode('list')} 
                  />
                )}
              </div>
            )}

            {activeTab === 'patients' && (
              <div className="space-y-6">
                <PatientSearch onSelect={handlePatientSelect} />
              </div>
            )}

            {activeTab === 'access' && <AccessRequest onToast={showToast} />}
            {activeTab === 'prescriptions' && <PrescriptionForm patientId={selectedPatient || 'patient_123'} onToast={showToast} />}
            {activeTab === 'notes' && <PatientNotesForm onToast={showToast} />}
          </motion.div>
        </div>
        <Footer />
      </main>

      {toast && <AlertBanner message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
