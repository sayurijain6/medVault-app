/**
 * Brand-name to generic medicine mapping for Jan Aushadhi lookup.
 * Keys are normalized (lowercase, trimmed) for robust matching.
 */
const BRAND_TO_GENERIC = {
  // Pain / Fever
  'dolo 650mg': 'Paracetamol 650 mg',
  'dolo 650': 'Paracetamol 650 mg',
  'dolo': 'Paracetamol 500 mg',
  'crocin 500mg': 'Paracetamol 500 mg',
  'crocin 650mg': 'Paracetamol 650 mg',
  'crocin': 'Paracetamol 500 mg',
  'calpol 500mg': 'Paracetamol 500 mg',
  'combiflam': 'Ibuprofen + Paracetamol',
  'saridon': 'Paracetamol + Caffeine',
  'sumo': 'Nimesulide + Paracetamol',
  'meftal spas': 'Mefenamic Acid + Dicyclomine',
  'brufen 400mg': 'Ibuprofen 400 mg',
  'brufen': 'Ibuprofen 400 mg',
  'voveran': 'Diclofenac 50 mg',

  // Gastro / Antacids
  'pan 40mg': 'Pantoprazole 40 mg',
  'pan 40': 'Pantoprazole 40 mg',
  'pan d': 'Pantoprazole + Domperidone',
  'pan': 'Pantoprazole 40 mg',
  'pantocid': 'Pantoprazole 40 mg',
  'rantac': 'Ranitidine 150 mg',
  'zinetac': 'Ranitidine 150 mg',
  'omez': 'Omeprazole 20 mg',
  'omeprazole': 'Omeprazole 20 mg',
  'gelusil': 'Aluminium Hydroxide + Magnesium Hydroxide',
  'digene': 'Antacid combination',

  // Antibiotics
  'azithral 500mg': 'Azithromycin 500 mg',
  'azithral 500': 'Azithromycin 500 mg',
  'azithral': 'Azithromycin 500 mg',
  'augmentin 625mg': 'Amoxicillin + Clavulanic Acid 625 mg',
  'augmentin': 'Amoxicillin + Clavulanic Acid 625 mg',
  'amoxicillin': 'Amoxicillin 500 mg',
  'ciprofloxacin': 'Ciprofloxacin 500 mg',
  'ciplox 500mg': 'Ciprofloxacin 500 mg',
  'ciplox': 'Ciprofloxacin 500 mg',
  'monocef': 'Ceftriaxone 1g',
  'metrogyl': 'Metronidazole 400 mg',

  // Allergy
  'cetcip': 'Cetirizine 10 mg',
  'cetirizine': 'Cetirizine 10 mg',
  'allegra': 'Fexofenadine 120 mg',
  'montair lc': 'Montelukast + Levocetirizine',
  'levocet': 'Levocetirizine 5 mg',
  'avil': 'Pheniramine 25 mg',

  // Diabetes
  'metformin': 'Metformin 500 mg',
  'glycomet': 'Metformin 500 mg',
  'glycomet gp': 'Metformin + Glimepiride',
  'janumet': 'Sitagliptin + Metformin',
  'glimepiride': 'Glimepiride 1 mg',

  // Cardiovascular
  'amlodipine': 'Amlodipine 5 mg',
  'atorvastatin': 'Atorvastatin 10 mg',
  'atorva 10mg': 'Atorvastatin 10 mg',
  'atorva 20mg': 'Atorvastatin 20 mg',
  'ecosprin': 'Aspirin 75 mg',
  'aspirin': 'Aspirin 75 mg',
  'clopidogrel': 'Clopidogrel 75 mg',
  'losartan': 'Losartan 50 mg',
  'telmisartan': 'Telmisartan 40 mg',
  'lisinopril': 'Lisinopril 5 mg',
  'metoprolol': 'Metoprolol 50 mg',
  'atenolol': 'Atenolol 50 mg',
  'ramipril': 'Ramipril 5 mg',

  // Thyroid
  'thyronorm': 'Levothyroxine 50 mcg',
  'eltroxin': 'Levothyroxine 50 mcg',
  'levothyroxine': 'Levothyroxine 50 mcg',

  // Neuro / Pain
  'gabapentin': 'Gabapentin 300 mg',
  'gabapin': 'Gabapentin 300 mg',
  'pregabalin': 'Pregabalin 75 mg',

  // Vitamins / Supplements
  'shelcal 500': 'Calcium + Vitamin D3',
  'calcimax': 'Calcium + Vitamin D3',
  'becosules': 'Vitamin B Complex',
  'limcee': 'Vitamin C 500 mg',
  'neurobion forte': 'Vitamin B1 + B6 + B12',

  // Others
  'simvastatin': 'Simvastatin 20 mg',
  'hydrochlorothiazide': 'Hydrochlorothiazide 25 mg',
  'ibuprofen': 'Ibuprofen 400 mg',
};

/**
 * Find the generic equivalent for a given brand-name medicine.
 * Performs progressive fuzzy matching:
 *   1. Exact match (lowered + trimmed)
 *   2. Match with dosage stripped
 *   3. First-word match
 * Falls back to the original name if no mapping found.
 */
export function getGenericName(brandName) {
  if (!brandName) return brandName;
  
  const normalized = brandName.toLowerCase().trim();

  // 1. Exact match
  if (BRAND_TO_GENERIC[normalized]) {
    return BRAND_TO_GENERIC[normalized];
  }

  // 2. Try matching without trailing dosage (e.g., "Dolo 650mg" → "dolo")
  const withoutDosage = normalized.replace(/\s*\d+\s*(mg|mcg|ml|g|iu)\s*$/i, '').trim();
  if (BRAND_TO_GENERIC[withoutDosage]) {
    return BRAND_TO_GENERIC[withoutDosage];
  }

  // 3. Try first word only (e.g., "Azithral 500mg" → "azithral")
  const firstWord = normalized.split(/\s+/)[0];
  if (firstWord !== withoutDosage && BRAND_TO_GENERIC[firstWord]) {
    return BRAND_TO_GENERIC[firstWord];
  }

  // No mapping found — return original
  return brandName;
}

export default BRAND_TO_GENERIC;
