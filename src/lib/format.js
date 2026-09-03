export function formatMoney(amount, currency = 'USD') {
  try {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(Number(amount || 0));
  } catch {
    return `${currency} ${amount}`;
  }
}

export function formatDate(iso, opts) {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-US', opts || { day: '2-digit', month: 'short', year: 'numeric' });
}

export function daysBetween(a, b = new Date()) {
  const ms = new Date(b) - new Date(a);
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}
