import axios from 'axios';
import { auth } from '../firebase/config';

const rawBase = import.meta.env.VITE_API_BASE_URL ?? import.meta.env.VITE_API_URL ?? 'http://localhost:8005';
// If rawBase is '/api' or '/api/', normalize to empty string so requests remain /api/... without doubling
const API_BASE = (rawBase === '/api' || rawBase === '/api/') ? '' : rawBase;

if (import.meta.env.PROD) {
  console.log('🌐 [System] Neural Path Optimized: Connected to Global Backend');
} else {
  console.log(`🔌 [Dev] Neural Node: ${API_BASE}`);
}

const apiClient = axios.create({ baseURL: API_BASE });

// ── Request interceptor: attach Firebase ID token ──
apiClient.interceptors.request.use(async (config) => {
  if (auth.currentUser) {
    const token = await auth.currentUser.getIdToken();
    config.headers.Authorization = `Bearer ${token}`;
  }
  // Bypass Localtunnel reminder page for API calls
  config.headers['Bypass-Tunnel-Reminder'] = 'true';
  return config;
}, (err) => Promise.reject(err));

// ── Response interceptor: unified error handling ──
apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    const msg = err.response?.data?.detail || err.message || 'Network error';
    console.error('[API Error]', err.response?.status, msg);
    return Promise.reject(err);
  }
);

// ── Helper to extract friendly error messages ──
export function getErrorMessage(err) {
  if (!err.response) return 'Connection lost. Please check your internet.';
  const d = err.response.data;
  if (typeof d === 'string') return d;
  if (d?.detail) return typeof d.detail === 'string' ? d.detail : JSON.stringify(d.detail);
  return 'Something went wrong. Please try again.';
}

// ── API functions ──
export const api = {
  // Patient endpoints
  uploadReport: (formData, onUploadProgress) =>
    apiClient.post('/api/patient/upload-report', formData, {
      // Do NOT set Content-Type — axios/browser sets boundary automatically for FormData
      onUploadProgress,
    }),

  getMyReports: (patientId) =>
    apiClient.get(`/api/patient/my-reports/${patientId}`),

  getHealthScore: (patientId) =>
    apiClient.get(`/api/patient/health-score/${patientId}`),

  grantAccess: (patientId, doctorId) =>
    apiClient.post(`/api/patient/grant-access?patientId=${patientId}&doctorId=${doctorId}`),


  getMedications: (patientId) =>
    apiClient.get(`/api/patient/medications/${patientId}`),

  getVitals: (patientId) =>
    apiClient.get(`/api/patient/vitals/${patientId}`),

  updateMedStatus: (patientId, medId, slot, status) =>
    apiClient.post(`/api/patient/update-med-status?patientId=${patientId}&medId=${medId}&slot=${slot}&status=${status}`),

  triggerAdherenceAlert: (patientId, missedMeds) =>
    apiClient.post('/api/patient/trigger-adherence-alert', { patientId, missedMeds }),

  updateProfile: (patientId, updates) =>
    apiClient.post(`/api/patient/update-profile?patientId=${patientId}`, updates),

  getProfile: (patientId) =>
    apiClient.get(`/api/patient/get-profile/${patientId}`),

  getMyGrants: (patientId) =>
    apiClient.get(`/api/patient/my-grants/${patientId}`),

  getPatientDoctorNotes: (patientId) =>
    apiClient.get(`/api/patient/doctor-notes/${patientId}`),

  getDashboardSummary: (patientId) =>
    apiClient.get(`/api/patient/dashboard-summary/${patientId}`),

  getClinicalHistory: (patientId) =>
    apiClient.get(`/api/patient/clinical-history/${patientId}`),

  // Doctor endpoints
  requestAccess: (data) =>
    apiClient.post('/api/doctor/request-access', data),

  verifyOtp: (data) =>
    apiClient.post('/api/doctor/verify-otp', data),

  getPatientSummary: (patientId) =>
    apiClient.get(`/api/doctor/patient-summary/${patientId}`),

  createPrescription: (data) =>
    apiClient.post('/api/doctor/create-prescription', data),

  getMyPatients: (doctorId) =>
    apiClient.get(`/api/doctor/my-patients/${doctorId}`),

  createPatientNote: (data) =>
    apiClient.post('/api/doctor/patient-note', data),

  createPatientNoteByEmail: (data) =>
    apiClient.post('/api/doctor/create-note-email', data),

  getDoctorPatientNotes: (patientId) =>
    apiClient.get(`/api/doctor/patient-notes/${patientId}`),

  getRecentActivity: () =>
    apiClient.get('/api/doctor/recent-activity'),

  register: (role = 'patient', email = null) =>
    apiClient.post('/api/auth/register', { role, email }),
};

export { apiClient };
