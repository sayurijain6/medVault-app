import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText, Activity, Pill, Zap } from 'lucide-react';
import IntelligenceBanner from '../patient/IntelligenceBanner';
import HealthScoreCard from '../patient/HealthScoreCard';
import ReportsList from '../patient/ReportsList';
import MedicationTracker from '../patient/MedicationTracker';
import DashboardStats from '../patient/DashboardStats';
import ClinicalNotes from '../shared/ClinicalNotes';
import { api } from '../../services/api';

export default function PatientDetailView({ patientId, onBack }) {
  const [healthScore, setHealthScore] = useState(null);
  const [reports, setReports] = useState([]);
  const [summary, setSummary] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingNotes, setLoadingNotes] = useState(false);

  useEffect(() => {
    if (patientId) fetchData();
  }, [patientId]);

  const fetchData = async () => {
    setLoading(true);
    setLoadingNotes(true);
    try {
      const [scoreRes, reportsRes, summaryRes, notesRes] = await Promise.all([
        api.getHealthScore(patientId),
        api.getMyReports(patientId),
        api.getPatientSummary(patientId),
        api.getDoctorPatientNotes(patientId)
      ]);
      setHealthScore(scoreRes.data);
      setReports(reportsRes.data.reports || []);
      setSummary(summaryRes.data);
      setNotes(notesRes.data.notes || []);
    } catch (err) {
      console.error("Error fetching patient detail:", err);
    } finally {
      setLoading(false);
      setLoadingNotes(false);
    }
  };

  const handleSaveNote = async (noteData) => {
    try {
      await api.createPatientNote({ ...noteData, patientId });
      // Refresh notes list from server to ensure LIVE data
      const res = await api.getDoctorPatientNotes(patientId);
      setNotes(res.data.notes || []);
    } catch (err) {
      console.error("Failed to save observation:", err);
      throw err;
    }
  };

  const statCards = [
    { label: 'Total Reports', value: reports.length, icon: FileText, iconBg: 'bg-brand-500/10', iconColor: 'text-brand-400' },
    { label: 'Health Score', value: healthScore?.score ?? '—', icon: Activity, iconBg: 'bg-success-500/10', iconColor: 'text-success-400', sub: healthScore?.category },
    { label: 'Access Status', value: 'Active', icon: Zap, iconBg: 'bg-warning-500/10', iconColor: 'text-warning-400' },
  ];

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-800 border-t-brand-500" />
        <p className="mt-4 text-slate-500">Decrypting clinical records...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4 mb-2">
        <button onClick={onBack} className="p-2 rounded-xl bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:bg-white/10 transition-all">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-display font-bold text-white">Clinical Dashboard</h2>
          <p className="text-sm text-slate-500">Viewing authorized records for Patient ID: {patientId}</p>
        </div>
      </div>

      <DashboardStats stats={statCards} />
      
      <IntelligenceBanner summary={summary} />

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        <HealthScoreCard 
          score={healthScore?.score || 0} 
          factors={healthScore?.factors || []} 
          summary={summary} 
          loading={false} 
        />
        <div className="space-y-6">
          <div className="glass-card p-6">
            <ClinicalNotes 
              notes={notes} 
              onAddNote={handleSaveNote} 
              canAdd={true} 
              loading={loadingNotes} 
            />
          </div>
          <ReportsList reports={reports.slice(0, 5)} loading={false} />
          <MedicationTracker patientId={patientId} />
        </div>
      </div>
    </div>
  );
}
