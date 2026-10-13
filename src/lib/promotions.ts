export type Promotion = {
  id: string; title: string; kind: 'promotion' | 'event'; imageUrl: string; content?: string;
  startsAt: string; endsAt: string; isPublished: boolean; popupEnabled: boolean;
  status: 'ongoing' | 'upcoming' | 'ended'; updatedAt: string;
};
export type PromotionList = { data: Promotion[]; meta: { page: number; total: number; totalPages: number; limit: number }; popup: Pick<Promotion, 'id' | 'title' | 'imageUrl' | 'startsAt' | 'endsAt' | 'status'> | null };
export const promotionLabels = { ongoing: 'Đang diễn ra', upcoming: 'Sắp diễn ra', ended: 'Kết thúc' };
export const promotionDate = (value: string) => {
  const [year, month, day] = value.split('-');
  return `${day}/${month}/${year}`;
};
export const toPromotionInput = promotionDate;
export const formatPromotionInput = (value: string) => value.replace(/\D/g, '').slice(0, 8).replace(/^(\d{2})(\d)/, '$1/$2').replace(/^(\d{2}\/\d{2})(\d)/, '$1/$2');
export function fromPromotionInput(value: string) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(value);
  const iso = match ? `${match[3]}-${match[2]}-${match[1]}` : '';
  const parsed = new Date(`${iso}T00:00:00Z`);
  if(!match || match[3] === '0000' || !Number.isFinite(+parsed) || parsed.toISOString().slice(0, 10) !== iso)
    throw new Error('Ngày không hợp lệ. Vui lòng nhập theo định dạng dd/mm/yyyy.');
  return iso;
}
export const promotionToday = () => new Date(Date.now() + 7 * 3600000).toISOString().slice(0, 10);
export const promotionNextDay = (value: string) => +new Date(`${value}T00:00:00+07:00`) + 86400000;
