export function normalizeVietnamesePhone(value: string): string {
  const compact = value.trim().replace(/[\s().-]/g, '');
  if (compact.startsWith('+84')) return `0${compact.slice(3)}`;
  if (compact.startsWith('84')) return `0${compact.slice(2)}`;
  return compact;
}

export function isVietnamesePhone(value: string): boolean {
  const phone = normalizeVietnamesePhone(value);
  return /^0[35789]\d{8}$/.test(phone) || /^02\d{8,9}$/.test(phone);
}
