export const purposeLabels = { BUY_CAR: 'Mua xe', RECEIVE_CAR: 'Nhận xe', SIGN_CONTRACT: 'Ký hợp đồng' };
export const classificationLabels = { VERY_GOOD: 'Rất phù hợp', GOOD: 'Phù hợp', NORMAL: 'Bình thường', NOT_RECOMMENDED: 'Ít phù hợp', AVOID: 'Nên tránh' };
export const versionLabels: Record<string, string> = { DRAFT: 'Nháp', REVIEW: 'Chờ duyệt', VALIDATED: 'Đã kiểm tra', PUBLISHED: 'Đã xuất bản', ARCHIVED: 'Lưu trữ' };
export type Purpose = keyof typeof purposeLabels;
export type Classification = keyof typeof classificationLabels;
export type Settings = Record<string, unknown> & { id: number; isEnabled: boolean; name: string; maxSearchDays: number; defaultPurpose: Purpose; supportedPurposes: Purpose[]; showLunarDate: boolean; showCanChi: boolean; showGoodHours: boolean; showExplanation: boolean; showScore: boolean; disclaimer: string; ctaLabel: string; seoTitle: string; seoDescription: string };
export type Version = Record<string, unknown> & { id: string; name: string; version: string; purpose: Purpose; status: string; revision: number; validationReport: ValidationReport | null };
export type Rule = Record<string, unknown> & { id: string; code: string; engineHandler: string; category: string; priority: string; effect: string; weight: number; hardExclusion: boolean; isEnabled: boolean; sortOrder: number; parameters: { officers?: number[] } };
export type Content = Record<string, unknown> & { id: string; ruleId: string; title: string; shortDescription: string; detailDescription: string };
export type Source = Record<string, unknown> & { id: string; ruleId: string; title: string; author: string; publisher: string; edition: string; publishedYear: number | null; pageReference: string; url: string; note: string; verificationStatus: string };
export type ReferenceCase = Record<string, unknown> & { id: string; name: string; birthDate: string; gender: string | null; purpose: Purpose; targetDate: string; expected: Record<string, unknown>; sourceNote: string; isActive: boolean };
export type Audit = Record<string, unknown> & { id: string; createdAt: string; adminName: string; action: string; entityType: string; entityId: string; reason: string; version: string | null; beforeData: unknown; afterData: unknown };
export interface Snapshot { set: Version; rules: Rule[]; contents: Content[]; sources: Source[]; cases: ReferenceCase[] }
export type RuleTrace = Record<string, unknown> & { code: string; matched: boolean; status: string; effect: string; priority: string; scoreDelta: number; hardExclusion: boolean };
export interface Evaluation { date: string; classification: Classification; score: number; criticalViolations: number; rulesetVersion: string; calendar: Record<string, unknown>; almanac: Record<string, unknown>; trace: RuleTrace[] }
export interface Simulation { primary: Evaluation; comparison: Evaluation | null }
export interface ValidationReport { passed: boolean; errors: string[]; total: number; pass: number; fail: number; changed: number; cases: { id: string; name: string; status: string; differences: string[] }[] }
export const officerLabels = ['Kiến', 'Trừ', 'Mãn', 'Bình', 'Định', 'Chấp', 'Phá', 'Nguy', 'Thành', 'Thu', 'Khai', 'Bế'];
export const base = '/admin/auspicious-dates';
