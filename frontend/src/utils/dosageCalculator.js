/**
 * Dosage calculator: estimates total quantity of tablets/units needed
 * based on frequency string and duration in days.
 */

const FREQUENCY_MULTIPLIERS = {
  '1x daily': 1,
  '1x': 1,
  'once daily': 1,
  'od': 1,
  '2x daily': 2,
  '2x': 2,
  'twice daily': 2,
  'bid': 2,
  '3x daily': 3,
  '3x': 3,
  'thrice daily': 3,
  'tid': 3,
  'every 8 hours': 3,
  'every 12 hours': 2,
  'every 6 hours': 4,
  'qid': 4,
  '4x daily': 4,
};

/**
 * Calculate the estimated quantity of tablets/units needed.
 * @param {string} frequency - e.g. "2x daily", "Every 8 hours", "Once weekly", "As needed"
 * @param {number} durationDays - number of days prescribed
 * @returns {{ quantity: number|null, note: string }}
 */
export function calculateQuantity(frequency, durationDays) {
  if (!frequency || !durationDays) {
    return { quantity: null, note: 'Dosage information incomplete' };
  }

  const freq = frequency.toLowerCase().trim();
  const days = parseInt(durationDays) || 0;

  if (days <= 0) {
    return { quantity: null, note: 'Duration not specified' };
  }

  // Check "as needed" variants
  if (freq.includes('as needed') || freq.includes('prn') || freq.includes('sos')) {
    return { quantity: null, note: 'Use as required — quantity not fixed' };
  }

  // Check "once weekly" variants
  if (freq.includes('once weekly') || freq.includes('once a week') || freq.includes('weekly')) {
    const qty = Math.ceil(days / 7);
    return { quantity: qty, note: `${qty} tablets (weekly for ${days} days)` };
  }

  // Check "twice weekly"
  if (freq.includes('twice weekly') || freq.includes('2x weekly')) {
    const qty = Math.ceil((days / 7) * 2);
    return { quantity: qty, note: `${qty} tablets (twice weekly for ${days} days)` };
  }

  // Standard daily frequency lookup
  const multiplier = FREQUENCY_MULTIPLIERS[freq];
  if (multiplier) {
    const qty = multiplier * days;
    return { quantity: qty, note: `${qty} tablets (${frequency} × ${days} days)` };
  }

  // Try to extract a number from the frequency string (e.g., "3 times a day")
  const numMatch = freq.match(/(\d+)\s*(times?\s*a?\s*day|x\s*daily|\/\s*day)/i);
  if (numMatch) {
    const perDay = parseInt(numMatch[1]);
    const qty = perDay * days;
    return { quantity: qty, note: `${qty} tablets (${perDay}/day × ${days} days)` };
  }

  // Fallback — assume once daily
  return { quantity: days, note: `~${days} tablets (estimated 1/day × ${days} days)` };
}
