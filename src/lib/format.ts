const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

/** 4500 → "₹4,500" */
export const formatINR = (n: number) => inr.format(n);

/** Values still waiting on the client are stored as "TODO…" or null. */
export const isSet = (v: unknown): boolean =>
  v != null && v !== '' && !String(v).startsWith('TODO');

/** "44 in high × 25 in wide", or the documented fallback when any size is unknown. */
export const sizeLine = (heightIn: number | null, widthIn: number | null) =>
  heightIn && widthIn ? `${heightIn} in high × ${widthIn} in wide` : 'Size on request';

/** "21:30" → "9:30 pm" */
export const formatTime = (hhmm: string) => {
  const [h, m] = hhmm.split(':').map(Number);
  return `${h % 12 || 12}:${String(m).padStart(2, '0')} ${h < 12 ? 'am' : 'pm'}`;
};

/** Open days from site.json: a list like ["Monday", …], or "TODO" until the client confirms. */
export const daysLabel = (days: unknown) =>
  Array.isArray(days) ? (days.length === 7 ? 'Every day' : days.join(', ')) : isSet(days) ? String(days) : '';
