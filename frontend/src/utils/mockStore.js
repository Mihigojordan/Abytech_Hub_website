// Shared helpers for the frontend-only, localStorage-backed mock services
// (company registrations, tenants, plans, subscriptions). No backend exists
// for these yet — this keeps every mock service's persistence/id/delay
// logic identical so they're easy to swap for real API calls later.

export const delay = (ms = 300) => new Promise((resolve) => setTimeout(resolve, ms));

export const genId = () =>
  (typeof crypto !== 'undefined' && crypto.randomUUID)
    ? crypto.randomUUID()
    : `id_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;

export const readStore = (key) => {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const writeStore = (key, records) => {
  localStorage.setItem(key, JSON.stringify(records));
};

export const ensureSeeded = (key, seed) => {
  const existing = readStore(key);
  if (existing === null) {
    writeStore(key, seed);
    return seed;
  }
  return existing;
};

export const formatMoney = (amount, currency = 'RWF') =>
  `${currency} ${Number(amount || 0).toLocaleString('en-US')}`;

export const daysFromNow = (n) => new Date(Date.now() + 1000 * 60 * 60 * 24 * n).toISOString();
export const daysAgo = (n) => new Date(Date.now() - 1000 * 60 * 60 * 24 * n).toISOString();
