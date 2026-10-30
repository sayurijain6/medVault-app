const rawBase = import.meta.env.VITE_API_BASE_URL ?? import.meta.env.VITE_API_URL ?? 'http://localhost:8000';
export const API_BASE = (rawBase === '/api' || rawBase === '/api/') ? '' : rawBase;

export const PATIENT_ID = 'patient_123';
export const DOCTOR_ID = 'doc_456';

export const REPORT_TYPES = [
  { value: 'blood_test', label: 'Blood Test' },
  { value: 'urine_test', label: 'Urine Test' },
  { value: 'xray', label: 'X-Ray / Radiology' },
  { value: 'mri', label: 'MRI Scan' },
  { value: 'ct_scan', label: 'CT Scan' },
  { value: 'pet_scan', label: 'PET Scan' },
  { value: 'ultrasound', label: 'Ultrasound / Sonography' },
  { value: 'ecg', label: 'ECG / EKG (Cardiac)' },
  { value: 'echo', label: 'Echocardiogram' },
  { value: 'eeg', label: 'EEG (Brain Activity)' },
  { value: 'biopsy', label: 'Biopsy Report' },
  { value: 'endoscopy', label: 'Endoscopy / Colonoscopy' },
  { value: 'mammogram', label: 'Mammogram' },
  { value: 'pft', label: 'Pulmonary Function Test' },
  { value: 'genetic', label: 'Genetic Testing' },
  { value: 'allergy', label: 'Allergy Test' },
  { value: 'prescription', label: 'Doctor Prescription' },
  { value: 'discharge_summary', label: 'Discharge Summary' },
  { value: 'vaccination', label: 'Vaccination Record' },
  { value: 'covid_test', label: 'COVID-19 Test' },
  { value: 'other', label: 'Other Document' },
];



export const MOCK_MEDICATIONS = [
  { id: 1, drug: 'Metformin', dosage: '500mg', frequency: '2x daily', taken: true, time: '08:00 AM' },
  { id: 2, drug: 'Amlodipine', dosage: '5mg', frequency: '1x daily', taken: true, time: '08:00 AM' },
  { id: 3, drug: 'Atorvastatin', dosage: '20mg', frequency: '1x daily', taken: false, time: '09:00 PM' },
  { id: 4, drug: 'Aspirin', dosage: '75mg', frequency: '1x daily', taken: false, time: '09:00 PM' },
];

export const MOCK_HEALTH_TREND = [
  { month: 'Nov', score: 72 },
  { month: 'Dec', score: 75 },
  { month: 'Jan', score: 78 },
  { month: 'Feb', score: 74 },
  { month: 'Mar', score: 80 },
  { month: 'Apr', score: 85 },
];

export const MOCK_ADHERENCE = [
  { day: 'Mon', pct: 100 }, { day: 'Tue', pct: 75 },
  { day: 'Wed', pct: 100 }, { day: 'Thu', pct: 50 },
  { day: 'Fri', pct: 100 }, { day: 'Sat', pct: 100 },
  { day: 'Sun', pct: 75 },
];

export const MOCK_ACCESS_GRANTS = [
  { id: 'g1', doctorName: 'Dr. Sarah Smith', permission: 'Full Read', expiry: '2026-05-13', status: 'active' },
  { id: 'g2', doctorName: 'Dr. Raj Patel', permission: 'Lab Reports Only', expiry: '2026-04-20', status: 'active' },
];

export const MOCK_TIMELINE = [
  { id: 1, date: '2026-04-10', type: 'report', title: 'Blood Test Report', summary: 'HbA1c: 7.2%, Hemoglobin: 14g/dL', icon: 'FileText' },
  { id: 2, date: '2026-04-05', type: 'prescription', title: 'Metformin Prescribed', summary: '500mg, 2x daily for 30 days', icon: 'Pill' },
  { id: 3, date: '2026-03-28', type: 'visit', title: 'Routine Checkup', summary: 'BP: 130/85, Weight: 78kg', icon: 'Stethoscope' },
  { id: 4, date: '2026-03-15', type: 'report', title: 'Lipid Panel', summary: 'Total Cholesterol: 210, LDL: 130', icon: 'FileText' },
  { id: 5, date: '2026-03-01', type: 'alert', title: 'Missed Medication Alert', summary: 'Atorvastatin missed 3 consecutive days', icon: 'AlertTriangle' },
];

export const DRUG_OPTIONS = [
  'Metformin', 'Amlodipine', 'Atorvastatin', 'Aspirin', 'Lisinopril',
  'Metoprolol', 'Omeprazole', 'Losartan', 'Gabapentin', 'Hydrochlorothiazide',
  'Levothyroxine', 'Simvastatin', 'Ibuprofen', 'Amoxicillin', 'Ciprofloxacin',
];

export const FREQUENCY_OPTIONS = [
  '1x daily', '2x daily', '3x daily', 'Every 8 hours', 'Every 12 hours',
  'Once weekly', 'As needed',
];

export const DURATION_OPTIONS = [
  '7 days', '14 days', '30 days', '60 days', '90 days', '6 months', '1 year', 'Ongoing',
];
