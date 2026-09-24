const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}:\d{2}))?/;
const DISPLAY_DATE = /^(\d{2})\/(\d{2})\/(\d{4})$/;

export function formatDate(value: string): string {
  const match = value.match(ISO_DATE);
  if (!match) return value;
  const [, year, month, day, time] = match;
  return `${day}/${month}/${year}${time ? ` ${time}` : ''}`;
}

export function parseDateInput(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return '';
  const match = trimmed.match(DISPLAY_DATE);
  if (!match) throw new Error('Ngày phải có định dạng dd/mm/yyyy.');

  const [, day, month, year] = match;
  const date = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  if (date.getUTCFullYear() !== Number(year) || date.getUTCMonth() + 1 !== Number(month) || date.getUTCDate() !== Number(day)) {
    throw new Error('Ngày không hợp lệ.');
  }
  return `${year}-${month}-${day}`;
}
