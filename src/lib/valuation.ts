export const valuationBase = '/admin/valuation';
export const categoryLabels = { AGE: 'Khấu hao', ODO: 'ODO', EXTERIOR: 'Ngoại thất', INTERIOR: 'Nội thất', ACCIDENT: 'Tai nạn', FLOOD: 'Ngập nước', ENGINE: 'Máy', TRANSMISSION: 'Hộp số', SERVICE: 'Bảo dưỡng', OWNERS: 'Số chủ', USAGE: 'Mục đích sử dụng', COLOR: 'Màu xe', MARKET: 'Thị trường' };
export type Category = keyof typeof categoryLabels;
export const optionCategories: Category[] = ['EXTERIOR', 'INTERIOR', 'ACCIDENT', 'FLOOD', 'ENGINE', 'TRANSMISSION', 'SERVICE', 'USAGE'];
export const scopeLabels = { GLOBAL: 'Toàn bộ xe', BRAND: 'Hãng xe', MODEL: 'Dòng xe', VARIANT: 'Phiên bản' };
export const baseTypeLabels = { ORIGINAL_MSRP: 'Giá xe mới ban đầu', CURRENT_MSRP: 'Giá xe mới hiện tại', MARKET_REFERENCE: 'Giá thị trường tham chiếu' };
export interface PolicyConfig {
  expectedKmPerYear: number; youngVehicleAgeFloor: number; odoMaxBonusPercent: number; odoMaxPenaltyPercent: number;
  minValueFactor: number; maxValueFactor: number; marketRangeMinusPercent: number; marketRangePlusPercent: number;
  dealerMarginMinPercent: number; dealerMarginMaxPercent: number; roundingVnd: number; minModelYear: number; maxVehicleAge: number; maxOdometerKm: number;
  mediumConfidenceThreshold: number; highConfidenceThreshold: number; showSeverePriceRange: boolean;
  confidenceWeights: Record<'odo' | 'exterior' | 'interior' | 'accident' | 'flood' | 'engine' | 'transmission' | 'service' | 'owners' | 'usage' | 'color', number>;
}
export interface Policy extends Record<string, unknown> {
  id: string; name: string; revision: number; config: PolicyConfig;
  updatedAt: string; validationReport: { passed: boolean; errors: string[]; warnings: string[]; checkedAt: string } | null;
}
export interface Settings { id: number; isEnabled: boolean; activePolicyId: string | null; disclaimer: string; ctaLabel: string; updatedAt: string }
export interface CatalogRow { id: string; name: string; status: string; brandId?: string; modelId?: string }
export interface Catalog { brands: CatalogRow[]; models: CatalogRow[]; variants: CatalogRow[]; colors: CatalogRow[] }
export interface ConditionOption extends Record<string, unknown> { id: string; policyId: string; category: Category; code: string; label: string; description: string; isUnknown: boolean; requiresInspection: boolean; active: boolean; sortOrder: number }
export interface Detail { policy: Policy; options: ConditionOption[] }
export type Row = Record<string, unknown> & { id: string };
export function money(value: unknown) { return typeof value === 'number' ? `${value.toLocaleString('vi-VN')} đ` : '—'; }
export function dateValue(value: unknown) {
  if (typeof value !== 'string' || !value || !Number.isFinite(new Date(value).getTime())) return '';
  const parts = new Intl.DateTimeFormat('en', { timeZone: 'Asia/Ho_Chi_Minh', year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date(value));
  const part = (type: string) => parts.find(item => item.type === type)?.value;
  return `${part('year')}-${part('month')}-${part('day')}`;
}
export function effectiveDate(value: unknown) { return typeof value === 'string' && value ? `${value}T00:00:00+07:00` : null; }
export const leadStatusLabels = { NEW: 'Mới', CONTACTED: 'Đã liên hệ', INSPECTION_SCHEDULED: 'Đã hẹn kiểm định', PURCHASED: 'Đã thu mua', REJECTED: 'Từ chối', CLOSED: 'Đã đóng' };
export interface ValuationRecord extends Row {
  createdAt: string; updatedAt: string; vehicleName: string; modelYear: number; odometerKm: number | null;
  estimatedMarketValue: number | null; marketMin: number | null; marketMax: number | null; buyingMin: number | null; buyingMax: number | null;
  confidenceScore: number; resultStatus: string; policyVersion: string; leadId: string | null; leadStatus: keyof typeof leadStatusLabels | null;
  contactName: string | null; contactPhone: string | null;
}
export interface ValuationRecordDetail extends ValuationRecord {
  contact: { id: string; name: string | null; phone: string; content: string | null; status: string; createdAt: string } | null;
  snapshot: {
    schemaVersion: number; input: Record<string, string | number | null>;
    vehicle: { brandName: string; modelName: string; variantName: string; modelYear: number };
    policy: { name: string; version: string; revision: number; config: PolicyConfig };
    reference: { source: string; note: string; basePriceType: keyof typeof baseTypeLabels; originalMsrp: number | null; currentMsrp: number | null; marketReference: number | null; basisNote: string; effectiveFrom: string; effectiveTo: string | null } | null;
    color: { name: string } | null; conditionOptions: ConditionOption[]; resolvedRules: Row[];
    result: { ageYears: number; ageSource: string; expectedOdometerKm: number; odometerDeviationPercent: number | null; referencePrice: number | null; referenceType: keyof typeof baseTypeLabels | null; estimatedMarketValue: number | null;
      manualInspectionRequired: boolean; confidenceLevel: string; missingFields: string[]; candidateMarketRange: { min: number; max: number } | null; candidateDealerBuyingRange: { min: number; max: number } | null;
      reasons: { code: string; message: string }[]; cap: { before: number; after: number; min: number; max: number; applied: boolean } | null;
      adjustments: { type: Category; label: string; ruleId: string | null; scope: keyof typeof scopeLabels | null; configuredPercentage: number; percentage: number; factor: number; before: number; after: number; manualInspectionRequired: boolean; fallback: boolean }[];
    }; disclaimer: string; ctaLabel: string;
  };
}
