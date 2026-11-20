/** Thousands separator without Intl — Hermes cannot be relied on for toLocaleString. */
export function formatScore(value: number): string {
  const n = Math.max(0, Math.round(value));
  const digits = String(n);
  let out = '';
  for (let i = 0; i < digits.length; i++) {
    const fromEnd = digits.length - i;
    out += digits[i];
    if (fromEnd > 1 && fromEnd % 3 === 1) {
      out += ',';
    }
  }
  return out;
}
