import { Button } from '@/components/ui';
import { baseTypeLabels, categoryLabels, dateValue, money, scopeLabels, type Catalog, type ConditionOption, type Row } from '@/lib/valuation';
const labels: Record<string, string> = {
  label: 'Tên', code: 'Code', category: 'Nhóm', scope: 'Phạm vi', brandName: 'Hãng xe', modelName: 'Dòng xe', variantName: 'Phiên bản', modelYear: 'Năm sản xuất',
  originalMsrp: 'Giá xe mới ban đầu', currentMsrp: 'Giá xe mới hiện tại', marketReference: 'Giá thị trường tham chiếu', basePriceType: 'Loại giá nền', selectedBasePrice: 'Giá nền sử dụng',
  source: 'Nguồn', note: 'Ghi chú', basisNote: 'Giả định tình trạng nền', referenceAgeYears: 'Tuổi xe nền (năm)', referenceOdometerKm: 'ODO xe nền (km)',
  effectiveFrom: 'Hiệu lực từ', effectiveTo: 'Kết thúc (không gồm ngày này)', adjustmentPercent: 'Điều chỉnh (%)', minValue: 'Khoảng từ', maxValue: 'Đến (không gồm)',
  manualInspectionRequired: 'Kiểm định trực tiếp', active: 'Hoạt động', isUnknown: 'Chưa rõ', requiresInspection: 'Yêu cầu kiểm định', description: 'Mô tả', sortOrder: 'Thứ tự',
  updatedAt: 'Cập nhật', updatedBy: 'Nhân viên cập nhật (ID)', action: 'Thao tác', actorProfileId: 'Nhân viên (ID)', oldData: 'Trước thay đổi', newData: 'Sau thay đổi',
};
export default function Details({ row, catalog, options, onClose }: { row: Row; catalog: Catalog; options: ConditionOption[]; onClose: () => void }) {
  const display = (key: string, value: unknown) => {
    if (key.toLowerCase().includes('msrp') || ['marketReference', 'selectedBasePrice'].includes(key)) return money(value);
    if (key === 'category') return categoryLabels[value as keyof typeof categoryLabels];
    if (key === 'scope') return scopeLabels[value as keyof typeof scopeLabels];
    if (key === 'basePriceType') return baseTypeLabels[value as keyof typeof baseTypeLabels];
    if (['effectiveFrom', 'effectiveTo', 'updatedAt'].includes(key)) return dateValue(value) || 'Không giới hạn';
    if (typeof value === 'boolean') return value ? 'Có' : 'Không';
    if (value === null) return key === 'maxValue' ? 'Không giới hạn' : '—';
    if (typeof value === 'object') return <pre className="max-h-72 overflow-auto whitespace-pre-wrap break-words text-sm">{JSON.stringify(value, null, 2)}</pre>;
    return String(value);
  };
  return <section className="tt-valuation__report space-y-4"><div className="flex items-center justify-between gap-3"><h2 className="text-xl font-bold">Chi tiết dữ liệu</h2><Button variant="secondary" size="sm" onClick={onClose}>Đóng</Button></div><dl className="grid gap-4 sm:grid-cols-2">
    {Object.entries(labels).filter(([key]) => key in row).map(([key, label]) => <div key={key} className={['oldData', 'newData', 'note', 'basisNote'].includes(key) ? 'sm:col-span-2' : ''}><dt className="text-sm text-[var(--muted-fg)]">{label}</dt><dd className="mt-1 whitespace-pre-wrap break-words">{display(key, row[key])}</dd></div>)}
    {(['brandId', 'modelId', 'variantId', 'colorId', 'optionId'] as const).filter(key => row[key]).map(key => <div key={key}><dt className="text-sm text-[var(--muted-fg)]">{{ brandId: 'Hãng xe', modelId: 'Dòng xe', variantId: 'Phiên bản', colorId: 'Màu xe', optionId: 'Lựa chọn' }[key]}</dt><dd>{key === 'optionId' ? options.find(option => option.id === row[key])?.label : (key === 'brandId' ? catalog.brands : key === 'modelId' ? catalog.models : key === 'variantId' ? catalog.variants : catalog.colors).find(item => item.id === row[key])?.name ?? '—'}</dd></div>)}
  </dl></section>;
}
