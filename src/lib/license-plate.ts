/** Format ordinary car plates without discarding unfamiliar plate formats. */
export function formatLicensePlate(value = ''): string {
  const normalized = value.trim().toUpperCase();
  const match = /^(\d{2}[A-Z]{1,3})(\d{0,5})$/.exec(normalized.replace(/[\s.-]/g, ''));
  if (!match) return normalized;

  const [, series, digits] = match;
  if (!digits) return series;
  const split = digits.length === 4 ? 2 : digits.length === 5 ? 3 : 0;
  return `${series}-${split ? `${digits.slice(0, split)}.${digits.slice(split)}` : digits}`;
}
