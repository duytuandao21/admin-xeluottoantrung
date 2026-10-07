'use client';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Car, ClipboardCheck, HandCoins } from 'lucide-react';
import { toast } from 'sonner';
import { Button, DataTable, Input, PageHeader, Select, StatsCard, StatusBadge, type Column } from '@/components/ui';
import Editor, { Field, reasonField, type EditorField } from '@/components/auspicious-date/Editor';
import { api, json, query, type PageResult } from '@/lib/api/client';
import { useAuth } from '@/lib/auth-context';
import { useTheme } from '@/lib/theme-context';
import { baseTypeLabels, categoryLabels, money, optionCategories, scopeLabels, valuationBase as base, type Catalog, type Category, type Policy, type Row, type Settings } from '@/lib/valuation';
import ConfigForm from './ConfigForm';
import ReferenceForm from './ReferenceForm';
import RuleForm from './RuleForm';
import Details from './Details';
import History from './History';
import Availability from './Availability';
import './valuation.css';
const tabs = [
  ['overview', 'Tổng quan'], ['references', 'Giá xe tham chiếu'], ['AGE', 'Khấu hao'], ['ODO', 'ODO'], ['condition', 'Tình trạng xe'],
  ['accident', 'Tai nạn & ngập nước'], ['mechanical', 'Máy & hộp số'], ['history', 'Lịch sử xe'], ['COLOR', 'Màu xe'], ['MARKET', 'Hệ số thị trường'],
  ['dealer', 'Cấu hình giá thu mua'], ['options', 'Danh mục tình trạng'], ['settings', 'Cấu hình chung'], ['records', 'Lịch sử định giá'], ['audit', 'Nhật ký'],
] as const;
const groupCategories: Record<string, Category[]> = { condition: ['EXTERIOR', 'INTERIOR'], accident: ['ACCIDENT', 'FLOOD'], mechanical: ['ENGINE', 'TRANSMISSION'], history: ['SERVICE', 'OWNERS', 'USAGE'], options: optionCategories };
type Editing = { kind: 'reference' | 'rule'; row?: Row } | { kind: 'config'; mode?: string } | { kind: 'generic'; title: string; fields: EditorField[]; initial: Record<string, unknown>; path: string; method: 'POST' | 'PATCH' };
type Action = { row: Row; kind: 'reference' | 'rule' | 'option' };
type CurrentOverview = { settings: Settings; configuration: Policy; options: import('@/lib/valuation').ConditionOption[]; referenceCount: number; ruleCount: number };
export default function ValuationManager() {
  const { identity } = useAuth(), { setSidebarOpen } = useTheme();
  const can = (permission: string) => identity?.permissions.includes(`valuation.${permission}`) ?? false, hasRead = can('read');
  const [overview, setOverview] = useState<CurrentOverview | null>(null), [catalog, setCatalog] = useState<Catalog | null>(null);
  const selected = overview?.configuration.id ?? '';
  const [tab, setTab] = useState('overview'), [reload, setReload] = useState(0);
  const [error, setError] = useState(''), [busy, setBusy] = useState(false), busyRef = useRef(false);
  const [editing, setEditing] = useState<Editing | null>(null), [action, setAction] = useState<Action | null>(null);
  const [viewing, setViewing] = useState<Row | null>(null);
  const [data, setData] = useState<PageResult<Row> | null>(null), [tableError, setTableError] = useState(''), [tableLoading, setTableLoading] = useState(false);
  const [page, setPage] = useState(1), [search, setSearch] = useState(''), [debouncedSearch, setDebouncedSearch] = useState('');
  const [category, setCategory] = useState<Category>('EXTERIOR'), [scope, setScope] = useState(''), [active, setActive] = useState(''), [brandFilter, setBrandFilter] = useState(''), [modelFilter, setModelFilter] = useState(''), [yearFilter, setYearFilter] = useState('');
  useEffect(() => { if (window.matchMedia('(max-width:767px)').matches) setSidebarOpen(false); }, [setSidebarOpen]);
  useEffect(() => { const timer = setTimeout(() => setDebouncedSearch(search), 250); return () => clearTimeout(timer); }, [search]);
  useEffect(() => {
    if (!hasRead) return; let live = true;
    Promise.all([api<CurrentOverview>(`${base}/current`), api<Catalog>(`${base}/catalog`)]).then(([info, list]) => {
      if (!live) return; setOverview(info); setCatalog(list); setError('');
    }).catch(failure => { if (live) setError(failure instanceof Error ? failure.message : 'Không tải được cấu hình định giá.'); });
    return () => { live = false; };
  }, [hasRead, reload]);
  const isRuleTab = tab in categoryLabels || ['condition', 'accident', 'mechanical', 'history'].includes(tab);
  const currentCategory = (tab in categoryLabels ? tab : category) as Category;
  const resource = tab === 'references' ? 'reference-prices' : tab === 'options' ? 'options' : tab === 'audit' ? 'audit' : isRuleTab ? 'rules' : '';
  useEffect(() => {
    if (!hasRead || !resource || (resource !== 'audit' && !selected) || (resource === 'audit' && !identity?.permissions.includes('valuation.audit.read'))) return;
    let live = true; queueMicrotask(() => { if (live) { setTableLoading(true); setTableError(''); } });
    api<PageResult<Row>>(`${base}/${resource === 'audit' ? '' : 'current/'}${resource}${query({ category: resource === 'rules' || resource === 'options' ? currentCategory : undefined, scope: resource === 'rules' ? scope : undefined, active: resource === 'audit' ? undefined : active, brandId: resource === 'reference-prices' ? brandFilter : undefined, modelId: resource === 'reference-prices' ? modelFilter : undefined, modelYear: resource === 'reference-prices' ? yearFilter : undefined, page, limit: 10, search: debouncedSearch })}`).then(value => { if (live) setData(value); }).catch(failure => { if (live) { setData(null); setTableError(failure instanceof Error ? failure.message : 'Không tải được danh sách.'); } }).finally(() => { if (live) setTableLoading(false); });
    return () => { live = false; };
  }, [resource, currentCategory, scope, active, brandFilter, modelFilter, yearFilter, page, debouncedSearch, selected, hasRead, identity, reload]);
  const close = () => { if (!busyRef.current) { setEditing(null); setAction(null); } };
  const switchTab = (next: string) => { setTab(next); setEditing(null); setAction(null); setViewing(null); setPage(1); setSearch(''); setDebouncedSearch(''); setData(null); setScope(''); setActive(''); setBrandFilter(''); setModelFilter(''); setYearFilter(''); if (groupCategories[next]) setCategory(groupCategories[next][0]); };
  const execute = async (work: () => Promise<unknown>, message: string) => {
    if (busyRef.current) return false; busyRef.current = true; setBusy(true);
    try { await work(); toast.success(message); setEditing(null); setAction(null); setReload(value => value + 1); return true; }
    catch (failure) { toast.error(failure instanceof Error ? failure.message : 'Không lưu được thay đổi.'); return false; }
    finally { busyRef.current = false; setBusy(false); }
  };
  const policy = overview?.configuration ?? null, editable = !!policy;
  const saveRow = (kind: 'reference' | 'rule', row: Row | undefined, values: Record<string, unknown>) => execute(() => api(`${base}/current/${kind === 'reference' ? 'reference-prices' : 'rules'}${row ? `/${row.id}` : ''}`, json(row ? 'PATCH' : 'POST', { ...values, expectedRevision: policy!.revision })), 'Đã lưu và áp dụng thay đổi.');
  const editOption = (row?: Row) => setEditing({ kind: 'generic', title: row ? 'Sửa lựa chọn tình trạng' : 'Thêm lựa chọn tình trạng', fields: [
    { key: 'category', label: 'Nhóm (không đổi sau khi tạo)', type: 'select', options: Object.fromEntries(optionCategories.map(key => [key, categoryLabels[key]])), required: true },
    { key: 'code', label: 'Code ổn định (chữ HOA, số, dấu _)', required: true, maxLength: 60 }, { key: 'label', label: 'Tên hiển thị', required: true, maxLength: 180 },
    { key: 'description', label: 'Mô tả', type: 'textarea', maxLength: 2000 }, { key: 'isUnknown', label: 'Lựa chọn chưa rõ', type: 'boolean' }, { key: 'requiresInspection', label: 'Bắt buộc kiểm tra trực tiếp', type: 'boolean' }, { key: 'active', label: 'Hoạt động', type: 'boolean' }, { key: 'sortOrder', label: 'Thứ tự', type: 'number', required: true, min: 0, max: 100000 }, reasonField,
  ], initial: row ?? { category, code: '', label: '', description: '', isUnknown: false, requiresInspection: false, active: false, sortOrder: 0, reason: '' }, path: `${base}/current/options${row ? `/${row.id}` : ''}`, method: row ? 'PATCH' : 'POST' });
  if (!hasRead) return <p role="alert">Bạn không có quyền xem phần định giá xe cũ.</p>;
  if (error) return <div role="alert" className="space-y-4"><p>{error}</p><Button onClick={() => { setError(''); setReload(value => value + 1); }}>Thử lại</Button></div>;
  if (!overview || !catalog) return <p role="status">Đang tải phần quản trị định giá xe cũ…</p>;
  const rowKind = tab === 'references' ? 'reference' : tab === 'options' ? 'option' : 'rule';
  const manageable = editable && resource !== 'audit' && !tableLoading && can(rowKind === 'reference' ? 'reference_prices.manage' : 'rules.manage');
  const targetName = (row: Row) => row.scope === 'GLOBAL' ? 'Toàn bộ xe' : row.scope === 'BRAND' ? catalog.brands.find(item => item.id === row.brandId)?.name : row.scope === 'MODEL' ? catalog.models.find(item => item.id === row.modelId)?.name : catalog.variants.find(item => item.id === row.variantId)?.name;
  const columns: Column<Row>[] = tab === 'references' ? [
    { key: 'vehicle', label: 'Xe', render: row => <div className="min-w-48 whitespace-normal"><strong>{String(row.brandName)} {String(row.modelName)}</strong><p className="text-sm text-[var(--muted-fg)]">{String(row.variantName)} · {String(row.modelYear)}</p></div> },
    { key: 'selectedBasePrice', label: 'Giá nền', render: row => <div><strong>{money(row.selectedBasePrice)}</strong><p className="text-sm text-[var(--muted-fg)]">{baseTypeLabels[row.basePriceType as keyof typeof baseTypeLabels]}</p></div> },
    { key: 'source', label: 'Nguồn', render: row => <span className="inline-block max-w-60 truncate" title={String(row.source)}>{String(row.source)}</span> }, { key: 'updatedAt', label: 'Cập nhật' },
    { key: 'active', label: 'Trạng thái', render: row => <StatusBadge status={row.active ? 'active' : 'inactive'} /> },
  ] : tab === 'options' ? [ { key: 'label', label: 'Tên lựa chọn' }, { key: 'code', label: 'Code' }, { key: 'isUnknown', label: 'Chưa rõ', render: row => row.isUnknown ? 'Có' : 'Không' }, { key: 'requiresInspection', label: 'Kiểm định', render: row => row.requiresInspection ? 'Bắt buộc' : 'Không' }, { key: 'active', label: 'Trạng thái', render: row => <StatusBadge status={row.active ? 'active' : 'inactive'} /> } ] : tab === 'audit' ? [
    { key: 'createdAt', label: 'Thời gian' }, { key: 'action', label: 'Thao tác' }, { key: 'reason', label: 'Lý do', render: row => <span className="inline-block max-w-80 whitespace-normal">{String((row.newData as { reason?: string } | null)?.reason ?? '')}</span> }, { key: 'actorProfileId', label: 'Nhân viên (ID)' },
  ] : [ { key: 'label', label: 'Quy tắc', render: row => <div className="max-w-64 whitespace-normal"><strong>{String(row.label)}</strong><p className="text-sm text-[var(--muted-fg)]">{row.optionId ? overview?.options.find(option => option.id === row.optionId)?.label : row.colorId ? catalog.colors.find(color => color.id === row.colorId)?.name : ['AGE', 'ODO', 'OWNERS'].includes(String(row.category)) ? `${row.minValue} → ${row.maxValue ?? '∞'} (không gồm cận trên)` : 'Hệ số thị trường'}</p></div> },
    { key: 'scope', label: 'Phạm vi', render: row => <div>{scopeLabels[row.scope as keyof typeof scopeLabels]}<p className="max-w-48 whitespace-normal text-sm text-[var(--muted-fg)]">{targetName(row)}</p></div> },
    { key: 'adjustmentPercent', label: 'Điều chỉnh', render: row => `${Number(row.adjustmentPercent) > 0 ? '+' : ''}${Number(row.adjustmentPercent).toLocaleString('vi-VN')}%` }, { key: 'manualInspectionRequired', label: 'Kiểm định', render: row => row.manualInspectionRequired ? 'Bắt buộc' : 'Không' }, { key: 'active', label: 'Trạng thái', render: row => <StatusBadge status={row.active ? 'active' : 'inactive'} /> },
  ];
  return <div className="tt-valuation space-y-4">
    <PageHeader title="Định giá xe cũ" subtitle="Quản lý giá tham chiếu và bộ quy tắc định giá chung." />
    <nav aria-label="Quản lý định giá" className="tt-valuation__tabs">{tabs.filter(([key]) => (key !== 'audit' || can('audit.read')) && (key !== 'records' || can('history.read'))).map(([key, label]) => <Button key={key} variant={tab === key ? 'primary' : 'secondary'} size="sm" disabled={busy} aria-current={tab === key ? 'page' : undefined} onClick={() => switchTab(key)}>{label}</Button>)}</nav>
    {tab === 'records' ? can('history.read') ? <History catalog={catalog} canUpdate={can('history.update')} /> : <p role="alert">Bạn không có quyền xem lịch sử định giá.</p> : !policy ? <p role="status">Đang tải cấu hình…</p> : editing?.kind === 'reference' ? <ReferenceForm key={editing.row?.id ?? 'new-reference'} initial={editing.row} catalog={catalog} policy={policy} busy={busy} onClose={close} onSave={values => saveRow('reference', editing.row, values)} />
      : editing?.kind === 'rule' ? <RuleForm key={editing.row?.id ?? 'new-rule'} initial={editing.row} defaultCategory={currentCategory} catalog={catalog} options={overview.options} busy={busy} onClose={close} onSave={values => saveRow('rule', editing.row, values)} />
      : editing?.kind === 'config' ? <ConfigForm key={`${policy.id}-${policy.revision}-${editing.mode}`} policy={policy} mode={editing.mode} busy={busy} onClose={close} onSave={values => execute(() => api(`${base}/current/config`, json('PATCH', { ...values, expectedRevision: policy.revision })), 'Đã lưu và áp dụng cấu hình.')} />
      : editing?.kind === 'generic' ? <Editor key={editing.path} title={editing.title} fields={editing.fields} initial={editing.initial} busy={busy} submitLabel="Lưu và áp dụng" note="Thêm lựa chọn mới ở trạng thái tắt, cấu hình quy tắc cho lựa chọn rồi bật hoạt động." onClose={close} onSave={values => execute(() => api(editing.path, json(editing.method, { ...values, expectedRevision: policy.revision })), 'Đã lưu và áp dụng thay đổi.')} />
      : action ? <section className="tt-valuation__report"><h2 className="text-xl font-bold">Xác nhận xóa dữ liệu</h2><p className="my-3 text-[var(--muted-fg)]">Xóa “{String(action.row.label ?? action.row.variantName ?? 'giá tham chiếu')}” khỏi cấu hình chung. Hệ thống kiểm tra bộ quy tắc trước khi áp dụng.</p><form className="space-y-4" onSubmit={event => {
        event.preventDefault(); const form = new FormData(event.currentTarget);
        const path = `${base}/current/${action.kind === 'reference' ? 'reference-prices' : action.kind === 'option' ? 'options' : 'rules'}/${action.row.id}`;
        void execute(() => api(path, json('DELETE', { reason: String(form.get('reason')), expectedRevision: policy.revision })), 'Đã xóa và áp dụng thay đổi.');
      }}><Field label="Lý do"><Input name="reason" required minLength={3} maxLength={1000} disabled={busy} /></Field><div className="flex gap-3"><Button type="submit" disabled={busy}>{busy ? 'Đang xử lý…' : 'Xác nhận'}</Button><Button type="button" variant="secondary" disabled={busy} onClick={close}>Hủy</Button></div></form></section>
      : <>
        {tab === 'overview' && <><div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"><StatsCard title="Giá xe tham chiếu" value={overview.referenceCount} icon={<Car />} /><StatsCard title="Quy tắc định giá" value={overview.ruleCount} icon={<ClipboardCheck />} /><StatsCard title="Biên thu mua dự kiến" value={`${policy.config.dealerMarginMinPercent}–${policy.config.dealerMarginMaxPercent}%`} icon={<HandCoins />} /></div><div className="tt-valuation__report space-y-3"><h2 className="text-xl font-semibold">Bộ quy tắc định giá chung</h2><p>Chỉnh giá tham chiếu, quy tắc theo phạm vi và các tỷ lệ tại những mục bên dưới. Lưu để áp dụng trực tiếp cho lần định giá tiếp theo.</p><div className="flex flex-wrap gap-3"><Button onClick={() => switchTab('references')}>Giá xe tham chiếu</Button>{can('settings.update') && <Button variant="secondary" onClick={() => setEditing({ kind: 'config' })}>Cấu hình định giá</Button>}</div><p><Link className="text-red-600 underline" href="/san-pham/phien-ban">Quản lý danh mục phiên bản xe</Link></p></div></>}
        {tab === 'overview' && policy.validationReport && !policy.validationReport.passed && <div className="tt-valuation__report" role="status"><h3 className="text-lg font-bold">Cần bổ sung trước khi bật tra cứu</h3><ul>{policy.validationReport.errors.map((item, index) => <li key={index} className="text-red-600">{item}</li>)}</ul></div>}
        {tab === 'dealer' && <div className="tt-valuation__report space-y-4"><h2 className="text-xl font-bold">Cấu hình giá thu mua</h2><p>Biên tối thiểu {policy.config.dealerMarginMinPercent}%, tối đa {policy.config.dealerMarginMaxPercent}%.</p><p className="text-[var(--muted-fg)]">Cận thấp = giá ước lượng × (1 − biên tối đa). Cận cao = giá ước lượng × (1 − biên tối thiểu).</p>{can('settings.update') && <Button onClick={() => setEditing({ kind: 'config', mode: 'DEALER' })}>Chỉnh biên thu mua</Button>}</div>}
        {tab === 'settings' && <><div className="tt-valuation__report space-y-3"><h2 className="text-xl font-bold">Cấu hình chung</h2><p>Quản lý bật/tắt tra cứu và nội dung thông báo cho khách hàng.</p>{can('settings.update') ? <Availability key={overview.settings.updatedAt} settings={overview.settings} busy={busy} onSave={values => { void execute(() => api(`${base}/current/settings`, json('PUT', values)), 'Đã áp dụng cấu hình chung.'); }} /> : <><p>{overview.settings.disclaimer}</p><p>CTA: {overview.settings.ctaLabel}</p></>}</div>{can('settings.update') && <Button variant="secondary" onClick={() => setEditing({ kind: 'config' })}>Giới hạn, khoảng giá & trọng số dữ liệu</Button>}</>}
        {viewing && <Details row={viewing} catalog={catalog} options={overview.options} onClose={() => setViewing(null)} />}
        {resource && <>
          <div className="flex flex-wrap items-end gap-3">{groupCategories[tab] && <div className="min-w-48"><Field label="Nhóm"><Select value={category} onChange={e => { setCategory(e.target.value as Category); setPage(1); setData(null); }}>{groupCategories[tab].map(key => <option key={key} value={key}>{categoryLabels[key]}</option>)}</Select></Field></div>}
            {isRuleTab && <div className="min-w-44"><Field label="Phạm vi"><Select value={scope} onChange={e => { setScope(e.target.value); setPage(1); }}><option value="">Tất cả phạm vi</option>{Object.entries(scopeLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</Select></Field></div>}
            {tab !== 'audit' && <div className="min-w-40"><Field label="Trạng thái"><Select value={active} onChange={e => { setActive(e.target.value); setPage(1); }}><option value="">Tất cả</option><option value="true">Hoạt động</option><option value="false">Tạm ngừng</option></Select></Field></div>}
            {tab === 'references' && <><div className="min-w-44"><Field label="Hãng xe"><Select value={brandFilter} onChange={e => { setBrandFilter(e.target.value); setModelFilter(''); setPage(1); }}><option value="">Tất cả hãng</option>{catalog.brands.map(row => <option key={row.id} value={row.id}>{row.name}</option>)}</Select></Field></div><div className="min-w-44"><Field label="Dòng xe"><Select value={modelFilter} onChange={e => { setModelFilter(e.target.value); setPage(1); }}><option value="">Tất cả dòng xe</option>{catalog.models.filter(row => !brandFilter || row.brandId === brandFilter).map(row => <option key={row.id} value={row.id}>{row.name}</option>)}</Select></Field></div><div className="w-32"><Field label="Năm xe"><Input type="number" min={1886} max={2100} step={1} placeholder="Tất cả" value={yearFilter} onChange={e => { setYearFilter(e.target.value); setPage(1); }} /></Field></div></>}
            {tab === 'ODO' && editable && can('settings.update') && <Button variant="secondary" onClick={() => setEditing({ kind: 'config', mode: 'ODO' })}>Cấu hình km/năm & giới hạn</Button>}
            {manageable && <Button className="ml-auto shrink-0" disabled={busy} onClick={() => rowKind === 'option' ? editOption() : setEditing({ kind: rowKind })}>Thêm {rowKind === 'reference' ? 'giá tham chiếu' : rowKind === 'option' ? 'lựa chọn' : 'quy tắc'}</Button>}
          </div>
          {tableError ? <div role="alert" className="space-y-3"><p>{tableError}</p><Button variant="secondary" onClick={() => setReload(value => value + 1)}>Thử lại</Button></div> : <div aria-busy={tableLoading}>{tableLoading && <p role="status" className="mb-2 text-sm text-[var(--muted-fg)]">Đang tải danh sách…</p>}<DataTable<Row> data={data?.data ?? []} columns={columns} emptyMessage={tableLoading ? 'Đang tải…' : 'Chưa có dữ liệu phù hợp.'} remote={{ page, total: data?.meta.total ?? 0, perPage: 10, search, onPage: setPage, onSearch: value => { setSearch(value); setPage(1); } }} onView={row => setViewing(row)} onEdit={manageable ? row => rowKind === 'option' ? editOption(row) : setEditing({ kind: rowKind, row }) : undefined} onDelete={manageable ? row => setAction({ kind: rowKind, row }) : undefined} /></div>}
        </>}
      </>}
  </div>;
}
