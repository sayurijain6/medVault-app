import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { LayoutDashboard, FileText, Activity, QrCode, Shield, Pill, Zap, MessageSquare } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Sidebar from '../components/layout/Sidebar';
import Footer from '../components/layout/Footer';
import DashboardStats from '../components/patient/DashboardStats';
import HealthScoreCard from '../components/patient/HealthScoreCard';
import ReportUpload from '../components/patient/ReportUpload';
import ReportsList from '../components/patient/ReportsList';
import MedicationTracker from '../components/patient/MedicationTracker';
import AccessControl from '../components/patient/AccessControl';
import AlertBanner from '../components/shared/AlertBanner';
import HackathonNudgeSystem from '../components/shared/HackathonNudgeSystem';
import { api } from '../services/api';
import IntelligenceBanner from '../components/patient/IntelligenceBanner';
import ClinicalNotes from '../components/shared/ClinicalNotes';
import PatientNotesList from '../components/patient/PatientNotesList';

import { useAuth } from '../context/AuthContext';

const menuItems = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'reports', label: 'Reports', icon: FileText },
  { id: 'medications', label: 'Medications', icon: Pill },
  { id: 'notes', label: 'Notes', icon: MessageSquare },
  { id: 'access', label: 'Access Control', icon: Shield },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" }
  }
};

export default function PatientDashboard() {
  const { currentUser } = useAuth();
  const patientId = currentUser?.uid;

  const [activeTab, setActiveTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const [healthScore, setHealthScore] = useState(null);
  const [reports, setReports] = useState([]);
  const [medications, setMedications] = useState([]);
  const [vitals, setVitals] = useState([]);
  const [summary, setSummary] = useState(null);
  const [doctorNotes, setDoctorNotes] = useState([]);
  const [loadingScore, setLoadingScore] = useState(true);
  const [loadingReports, setLoadingReports] = useState(true);
  const [loadingSummary, setLoadingSummary] = useState(true);
  const [loadingVitals, setLoadingVitals] = useState(true);
  const [loadingNotes, setLoadingNotes] = useState(true);
  const [profile, setProfile] = useState(null);


  const [dashboardSummary, setDashboardSummary] = useState(null);
  const [clinicalHistory, setClinicalHistory] = useState([]);
  const [loadingDashboard, setLoadingDashboard] = useState(true);

  useEffect(() => {
    if (!patientId) return;

    const syncProfile = async () => {
      try { await api.register('patient', currentUser?.email); } 
      catch (e) { console.warn("Profile sync failed:", e); }
    };
    
    syncProfile();
    refreshData();

    // Auto Refresh (Real-Time Feel)
    const intervalId = setInterval(refreshData, 10000);
    return () => clearInterval(intervalId);
  }, [patientId]);

  const refreshData = async () => {
    try {
      // Parallel fetch for speed
      const [summaryAPIRes, historyAPIRes, scoreRes, reportsRes, medsRes, summaryRes, vitalsRes, profileRes, notesRes] = await Promise.all([
        api.getDashboardSummary(patientId),
        api.getClinicalHistory(patientId),
        api.getHealthScore(patientId), // Still needed for factors & detail popups
        api.getMyReports(patientId),
        api.getMedications(patientId),
        api.getPatientSummary(patientId),
        api.getVitals(patientId),
        api.getProfile(patientId),
        api.getPatientDoctorNotes(patientId) // Still used by full notes tab
      ]);

      setDashboardSummary(summaryAPIRes.data);
      setClinicalHistory(historyAPIRes.data);
      
      setHealthScore(scoreRes.data);
      setReports(reportsRes.data.reports || []);
      setMedications(medsRes.data.medications || []);
      setSummary(summaryRes.data);
      setVitals(vitalsRes.data || []);
      setProfile(profileRes.data);
      setDoctorNotes(notesRes.data.notes || []);

    } catch (err) {
      console.error("Dashboard data fetch error:", err);
      // Only show toast if it's not a silent background refresh failure
      if (loadingDashboard) {
          showToast("Unable to fetch data", "error");
      }
    } finally {
      setLoadingDashboard(false);
      setLoadingScore(false);
      setLoadingReports(false);
      setLoadingSummary(false);
      setLoadingVitals(false);
      setLoadingNotes(false);
    }
  };

  const showToast = (msg, type = 'success') => setToast({ message: msg, type });

  const statCards = [
    { label: 'Total Reports', value: dashboardSummary?.total_reports ?? 0, icon: FileText, iconBg: 'bg-brand-500/10', iconColor: 'text-brand-400' },
    { label: 'Health Score', value: healthScore === null && loadingScore ? 'Calculating...' : (dashboardSummary?.health_score ?? '—'), icon: Activity, iconBg: 'bg-success-500/10', iconColor: 'text-success-400', sub: healthScore?.category },
    { label: 'Active Meds', value: dashboardSummary?.active_meds ?? 0, icon: Pill, iconBg: 'bg-purple-500/10', iconColor: 'text-purple-400' },
    { label: 'Access Grants', value: dashboardSummary?.access_grants ?? 0, icon: Shield, iconBg: 'bg-warning-500/10', iconColor: 'text-warning-400' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
      <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />
      <Sidebar items={menuItems} activeTab={activeTab} setActiveTab={setActiveTab} role="patient" isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 pt-16 lg:pl-64 flex flex-col">
        <div className="p-6 md:p-8 lg:p-10 w-full max-w-[1600px] mx-auto flex-1">
          <motion.div 
            key={activeTab} 
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="space-y-6"
          >
            {activeTab === 'overview' && (
              <div className="flex flex-col gap-6">

                {/* ROW 1: STATS */}
                <motion.div variants={itemVariants} className="w-full">
                  <DashboardStats stats={statCards} />
                </motion.div>

                {/* MAIN GRID: Left (Intelligence + Notes) | Right (Score + Archives) */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">

                  {/* LEFT COLUMN (7/12) — Intelligence → Notes */}
                  <div className="lg:col-span-7 space-y-6">
                    <motion.div variants={itemVariants}>
                      <IntelligenceBanner summary={summary} />
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <div className="backdrop-blur-xl bg-white/[0.03] border border-white/[0.08] rounded-2xl p-6 shadow-2xl shadow-brand-500/5">
                        <ClinicalNotes 
                          notes={clinicalHistory} 
                          loading={loadingDashboard} 
                          canAdd={false} 
                        />
                      </div>
                    </motion.div>
                  </div>

                  {/* RIGHT COLUMN (5/12) — Score → Archives */}
                  <div className="lg:col-span-5 space-y-6">
                    <motion.div variants={itemVariants}>
                      <HealthScoreCard 
                        score={healthScore?.score || 0} 
                        factors={healthScore?.factors || []} 
                        summary={summary} 
                        loading={loadingSummary} 
                      />
                    </motion.div>

                    <motion.div variants={itemVariants}>
                      <ReportsList reports={reports.slice(0, 5)} loading={loadingReports} />
                    </motion.div>
                  </div>

                </div>

              </div>
            )}

            {activeTab === 'reports' && (
              <div className="space-y-8">
                <motion.div variants={itemVariants}>
                  <ReportUpload onSuccess={(msg) => { showToast(msg); refreshData(); }} onError={(msg) => showToast(msg, 'error')} />
                </motion.div>
                <motion.div variants={itemVariants}>
                  <ReportsList reports={reports} loading={loadingReports} />
                </motion.div>
              </div>
            )}

            {activeTab === 'medications' && (
              <motion.div variants={itemVariants}>
                <MedicationTracker />
              </motion.div>
            )}
            
            {activeTab === 'access' && (
              <motion.div variants={itemVariants}>
                <AccessControl onToast={(msg) => showToast(msg)} />
              </motion.div>
            )}

            {activeTab === 'notes' && (
              <motion.div variants={itemVariants}>
                <PatientNotesList />
              </motion.div>
            )}

          </motion.div>
        </div>
        <Footer />
      </main>


      {toast && <AlertBanner message={toast.message} type={toast.type} onClose={() => setToast(null)} />}
      <HackathonNudgeSystem healthScore={healthScore} />
      
    </div>

  );
}
