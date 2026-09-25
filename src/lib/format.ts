export function formatNumber(value: number): string { return value.toLocaleString('vi-VN'); }

export function formatPrice(price: number): string {
  if (!Number.isFinite(price)) return '—';
  if (price === 0) return '0 đ';
  const parts: string[] = [];
  const billions = Math.floor(price / 1_000_000_000);
  const millions = Math.floor((price % 1_000_000_000) / 1_000_000);
  const thousands = Math.floor((price % 1_000_000) / 1_000);
  const dong = price % 1_000;
  if (billions) parts.push(`${formatNumber(billions)} tỷ`);
  if (millions) parts.push(`${formatNumber(millions)} triệu`);
  if (thousands) parts.push(`${formatNumber(thousands)} nghìn`);
  if (dong) parts.push(`${formatNumber(dong)} đ`);
  return parts.join(' ');
}
