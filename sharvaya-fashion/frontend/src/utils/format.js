const inr = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 0,
});

export function formatPrice(value) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) return '₹ —';
  return inr.format(n);
}
