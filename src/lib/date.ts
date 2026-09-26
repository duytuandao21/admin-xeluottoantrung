const ISO_DATE = /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}:\d{2}))?/;
const DISPLAY_DATE = /^(\d{2})\/(\d{2})\/(\d{4})$/;

export function formatDate(value: string): string {
  const match = value.match(ISO_DATE);
  if (!match) return value;
  const [, year, month, day, time] = match;
  // Calendar-only fields (e.g. a deadline) must not shift across time zones.
  if (!time) return `${day}/${month}/${year}`;
  let timestamp = value.trim().replace(' ', 'T').replace(/([+-]\d{2})$/, '$1:00');
  if (!/(?:Z|[+-]\d{2}:?\d{2})$/i.test(timestamp)) timestamp += 'Z';
  const date = new Date(timestamp);
  if (Number.isNaN(date.getTime())) return value;
  const parts = new Intl.DateTimeFormat('en-GB', { timeZone: 'Asia/Ho_Chi_Minh',
    day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })
    .formatToParts(date);
  const part = (type: string) => parts.find(item => item.type === type)?.value;
  return `${part('day')}/${part('month')}/${part('year')} ${part('hour')}:${part('minute')}`;
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
