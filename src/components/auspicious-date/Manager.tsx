'use client';
import { useEffect, useRef, useState } from 'react';
import { Calendar, Settings2, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import { Button, DataTable, Input, PageHeader, Select, StatsCard, StatusBadge } from '@/components/ui';
import { api, json, type PageResult } from '@/lib/api/client';
import { useAuth } from '@/lib/auth-context';
import { useTheme } from '@/lib/theme-context';
import { base, officerLabels, purposeLabels, versionLabels, type Audit, type Settings, type Snapshot, type ValidationReport, type Version } from '@/lib/auspicious-date';
import Editor, { Field, reasonField, type EditorField } from './Editor';
import SettingsForm from './SettingsForm';
import Simulator from './Simulator';

const tabs = [
  ['overview', 'Tổng quan', 'read'], ['settings', 'Cấu hình', 'read'], ['rules', 'Bộ quy tắc', 'rules.read'], ['content', 'Nội dung', 'rules.read'], ['sources', 'Nguồn tham chiếu', 'rules.read'],
  ['versions', 'Phiên bản', 'read'], ['simulate', 'Kiểm thử', 'simulate'], ['cases', 'Ca tham chiếu', 'rules.read'], ['audit', 'Nhật ký', 'audit.read'],
] as const;
interface Editing { title: string; fields: EditorField[]; initial: Record<string, unknown>; path: string; method: 'POST' | 'PUT' | 'PATCH' | 'DELETE'; note?: string; submitLabel?: string }
const priorities = { CRITICAL: 'CRITICAL', HIGH: 'HIGH', MEDIUM: 'MEDIUM', LOW: 'LOW' };
const effects = { POSITIVE: 'Tích cực', NEGATIVE: 'Tiêu cực', NEUTRAL: 'Trung tính' };
const sourceFields: EditorField[] = [
  { key: 'title', label: 'Tên tài liệu', required: true, maxLength: 300 }, { key: 'author', label: 'Tác giả', maxLength: 200 }, { key: 'publisher', label: 'Nhà xuất bản', maxLength: 200 },
  { key: 'edition', label: 'Ấn bản', maxLength: 150 }, { key: 'publishedYear', label: 'Năm xuất bản', type: 'number', min: 1, max: 2099 }, { key: 'pageReference', label: 'Trang tham chiếu', maxLength: 200 },
  { key: 'url', label: 'URL tài liệu (HTTPS)', maxLength: 2000 }, { key: 'verificationStatus', label: 'Trạng thái nguồn', type: 'select', options: { UNVERIFIED: 'Chưa xác minh', VERIFIED: 'Đã xác minh', REJECTED: 'Không chấp nhận' } },
  { key: 'note', label: 'Ghi chú kiểm chứng', type: 'textarea', maxLength: 4000 }, reasonField,
];
const caseFields: EditorField[] = [
  { key: 'name', label: 'Tên ca tham chiếu', required: true, maxLength: 200 }, { key: 'birthDate', label: 'Ngày sinh', type: 'date', required: true }, { key: 'targetDate', label: 'Ngày kiểm tra', type: 'date', required: true },
  { key: 'gender', label: 'Giới tính (tùy chọn)', type: 'select', options: { '': 'Không cung cấp', MALE: 'Nam', FEMALE: 'Nữ', OTHER: 'Khác' } },
  { key: 'purpose', label: 'Mục đích', type: 'select', options: purposeLabels }, { key: 'isActive', label: 'Dùng trong regression', type: 'boolean' },
  { key: 'expected', label: 'Kết quả kỳ vọng độc lập (JSON)', type: 'json', required: true }, { key: 'sourceNote', label: 'Nguồn kết quả kỳ vọng', type: 'textarea', required: true, maxLength: 3000 }, reasonField,
];
const versionFields: EditorField[] = [{ key: 'name', label: 'Tên bộ quy tắc', required: true, maxLength: 150 }, { key: 'version', label: 'Phiên bản (ví dụ 1.1.0)', required: true, maxLength: 40 }, { key: 'purpose', label: 'Mục đích', type: 'select', options: purposeLabels }, reasonField];

export default function AuspiciousManager() {
  const { identity } = useAuth(), { setSidebarOpen } = useTheme();
  const can = (suffix: string) => identity?.permissions.includes(`auspicious_date.${suffix}`) ?? false;
  const [tab, setTab] = useState('overview'), [selected, setSelected] = useState(''), [reload, setReload] = useState(0);
  const [overview, setOverview] = useState<{ settings: Settings; versions: Version[] } | null>(null), [snapshot, setSnapshot] = useState<Snapshot | null>(null);
  const [error, setError] = useState(''), [busy, setBusy] = useState(false), [editing, setEditing] = useState<Editing | null>(null);
  const [report, setReport] = useState<ValidationReport | null>(null), [publish, setPublish] = useState<Version | null>(null);
  const [ruleFilter, setRuleFilter] = useState(''), [sourceFilter, setSourceFilter] = useState(''), [category, setCategory] = useState(''), [priority, setPriority] = useState(''), [effect, setEffect] = useState(''), [enabled, setEnabled] = useState(''), [verified, setVerified] = useState('');
  const [auditPage, setAuditPage] = useState(1), [audit, setAudit] = useState<PageResult<Audit> | null>(null);
  const hasRead = can('read'), hasRules = can('rules.read');
  useEffect(() => { if (window.matchMedia('(max-width:767px)').matches) setSidebarOpen(false); }, [setSidebarOpen]);
  useEffect(() => {
    if (!hasRead) return; let live = true;
    api<{ settings: Settings; versions: Version[] }>(`${base}/overview`).then(data => {
      if (!live) return; setOverview(data); setError('');
      setSelected(old => data.versions.some(item => item.id === old) ? old : data.versions.find(item => item.status === 'DRAFT')?.id ?? data.versions[0]?.id ?? '');
    }).catch(failure => { if (live) setError(failure instanceof Error ? failure.message : 'Không thể tải tiện ích.'); });
    return () => { live = false; };
  }, [hasRead, reload]);
  useEffect(() => {
    if (!hasRules || !selected) return; let live = true;
    api<Snapshot>(`${base}/versions/${selected}`).then(data => { if (live) { setSnapshot(data); setError(''); } }).catch(failure => { if (live) setError(failure instanceof Error ? failure.message : 'Không thể tải phiên bản.'); });
    return () => { live = false; };
  }, [hasRules, selected, reload]);
  useEffect(() => {
    if (tab !== 'audit' || !identity?.permissions.includes('auspicious_date.audit.read')) return; let live = true;
    api<PageResult<Audit>>(`${base}/audit?page=${auditPage}&limit=20`).then(data => { if (live) setAudit(data); }).catch(failure => { if (live) setError(failure instanceof Error ? failure.message : 'Không thể tải nhật ký.'); });
    return () => { live = false; };
  }, [tab, auditPage, reload, identity]);
  const refresh = () => { setSnapshot(null); setAudit(null); setReload(value => value + 1); };
  const execute = async (work: () => Promise<unknown>, message = 'Đã lưu thay đổi.') => {
    if (busy) return false; setBusy(true);
    try { await work(); toast.success(message); refresh(); return true; }
    catch (failure) { toast.error(failure instanceof Error ? failure.message : 'Yêu cầu không thành công.'); return false; }
    finally { setBusy(false); }
  };
  const editable = snapshot && !['PUBLISHED', 'ARCHIVED'].includes(snapshot.set.status);
  const changeVersion = (value: string) => { setSelected(value); setSnapshot(null); setReport(null); setEditing(null); setRuleFilter(''); };
  const editVersion = (original?: Version) => setEditing({ title: original ? `Nhân bản ${original.version}` : 'Tạo phiên bản mới', fields: versionFields, initial: { name: original?.name ?? 'Bộ quy tắc ngày mua xe', version: '', purpose: original?.purpose ?? 'BUY_CAR', reason: '' }, path: original ? `${base}/versions/${original.id}/clone` : `${base}/versions`, method: 'POST' });
  if (!hasRead) return <p role="alert">Bạn không có quyền xem tiện ích này.</p>;
  if (error) return <div role="alert" className="space-y-4"><p>{error}</p><Button onClick={() => { setError(''); refresh(); }}>Thử lại</Button></div>;
  if (!overview) return <p role="status">Đang tải tiện ích xem ngày mua xe…</p>;
  const active = snapshot?.rules.filter(rule => rule.isEnabled) ?? [];
  const selectedVersion = overview.versions.find(item => item.id === selected);
  const sourceStatus = (id: string) => snapshot?.sources.some(source => source.ruleId === id && source.verificationStatus === 'VERIFIED') ?? false;
  const filteredRules = snapshot?.rules.filter(rule => (!category || rule.category === category) && (!priority || rule.priority === priority) && (!effect || rule.effect === effect) && (!enabled || String(rule.isEnabled) === enabled) && (!verified || String(sourceStatus(rule.id)) === verified)) ?? [];
  return <div className="min-w-0 space-y-5">
    <PageHeader title="Xem ngày mua xe" subtitle="Quản lý cấu hình, bộ quy tắc và kiểm thử tiện ích xem ngày mua xe." />
    <nav aria-label="Quản lý tiện ích" className="flex gap-2 overflow-x-auto pb-2">{tabs.filter(([, , permission]) => can(permission)).map(([id, label]) => <Button key={id} size="sm" variant={tab === id ? 'primary' : 'secondary'} aria-current={tab === id ? 'page' : undefined} className="shrink-0" onClick={() => { setTab(id); setEditing(null); }}>{label}</Button>)}</nav>
    {overview.versions.length > 0 && !['settings', 'audit'].includes(tab) && <div className="max-w-lg"><Field label="Bộ quy tắc đang xem"><Select value={selected} onChange={e => changeVersion(e.target.value)}>{overview.versions.map(item => <option key={item.id} value={item.id}>{purposeLabels[item.purpose]} · {item.version} · {versionLabels[item.status]}</option>)}</Select></Field></div>}
    {editing ? <Editor key={`${editing.path}-${reload}`} {...editing} busy={busy} onClose={() => setEditing(null)} onSave={value => {
      if ('gender' in value && value.gender === '') delete value.gender;
      return execute(() => api(editing.path, json(editing.method, value)));
    }} /> : <>
      {tab === 'overview' && <>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <StatsCard title="Trạng thái tiện ích" value={overview.settings.isEnabled ? 'Bật' : 'Tắt'} icon={<Settings2 />} />
          <StatsCard title="Phiên bản production" value={overview.versions.filter(item => item.status === 'PUBLISHED').length} icon={<Calendar />} />
          <StatsCard title="Quy tắc đang bật (bản đang xem)" value={active.length} icon={<ShieldCheck />} />
          <StatsCard title="Quy tắc CRITICAL" value={active.filter(rule => rule.priority === 'CRITICAL').length} icon={<ShieldCheck />} />
          <StatsCard title="Nguồn đã xác minh" value={snapshot?.sources.filter(source => source.verificationStatus === 'VERIFIED').length ?? 0} icon={<ShieldCheck />} />
          <StatsCard title="Ca tham chiếu đang dùng" value={snapshot?.cases.filter(item => item.isActive).length ?? 0} icon={<Calendar />} />
        </div>
        <p className="text-[var(--muted-fg)]">{selectedVersion?.validationReport ? `Lần kiểm tra: ${selectedVersion.validationReport.passed ? 'Đạt' : 'Chưa đạt'} · ${selectedVersion.validationReport.pass}/${selectedVersion.validationReport.total} ca.` : 'Chưa có kết quả kiểm tra cho phiên bản đang xem.'}</p>
        <div className="flex flex-wrap gap-3">{can('simulate') && <Button onClick={() => setTab('simulate')}>Kiểm thử engine</Button>}<Button variant="secondary" onClick={() => setTab('settings')}>Cấu hình</Button>{can('versions.manage') && <Button variant="secondary" onClick={() => editVersion()}>Tạo phiên bản mới</Button>}</div>
      </>}
      {tab === 'settings' && <SettingsForm key={reload} initial={overview.settings} busy={busy} canEdit={can('settings.update')} save={values => execute(() => api(`${base}/settings`, json('PUT', values)))} />}
      {tab === 'simulate' && (overview.versions.length ? <Simulator key={selected} versions={overview.versions} selectedId={selected} /> : <p>Chưa có bộ quy tắc để kiểm thử.</p>)}
      {tab === 'versions' && <>
        {can('versions.manage') && <Button onClick={() => editVersion()}>Tạo phiên bản mới</Button>}
        <DataTable data={overview.versions} searchPlaceholder="Tìm phiên bản…" searchFields={['name', 'version', 'purpose']} columns={[{ key: 'name', label: 'Tên' }, { key: 'purpose', label: 'Mục đích', render: row => purposeLabels[row.purpose] }, { key: 'version', label: 'Phiên bản' }, { key: 'status', label: 'Trạng thái', render: row => versionLabels[row.status] }, { key: 'revision', label: 'Lần sửa' }]} actions={row => <>
          {can('versions.manage') && <Button size="sm" variant="secondary" onClick={() => editVersion(row)}>Nhân bản</Button>}
          {can('versions.manage') && row.status === 'DRAFT' && <Button size="sm" variant="secondary" disabled={busy} onClick={() => void execute(() => api(`${base}/versions/${row.id}/review`, json('POST', { reason: 'Gửi bộ quy tắc chờ duyệt' })))}>Gửi duyệt</Button>}
          {can('versions.manage') && ['REVIEW', 'VALIDATED'].includes(row.status) && <Button size="sm" variant="secondary" disabled={busy} onClick={() => void execute(async () => { const result = await api<{ report: ValidationReport }>(`${base}/versions/${row.id}/validate`, json('POST', { reason: 'Kiểm tra nguồn và ca tham chiếu' })); setReport(result.report); }, 'Đã chạy kiểm tra; xem báo cáo bên dưới.')}>Kiểm tra</Button>}
          {can('publish') && row.status === 'VALIDATED' && <Button size="sm" disabled={busy} onClick={() => setPublish(row)}>Xuất bản</Button>}
          {can('publish') && row.status === 'PUBLISHED' && <Button size="sm" variant="secondary" onClick={() => setEditing({ title: 'Lưu trữ phiên bản', fields: [reasonField], initial: { reason: '' }, path: `${base}/versions/${row.id}/archive`, method: 'POST', note: 'Nếu không còn phiên bản xuất bản, tiện ích sẽ tạm ngừng tra cứu.' })}>Lưu trữ</Button>}
        </>} />
      </>}
      {['rules', 'content', 'sources', 'cases'].includes(tab) && (!snapshot ? <p role="status">{selected ? 'Đang tải phiên bản…' : 'Chưa có phiên bản. Tạo bộ quy tắc mới ở mục Phiên bản.'}</p> : <>
        {!editable && <p className="rounded-xl border border-[var(--border-color)] p-3 text-[var(--muted-fg)]">Đây là phiên bản bất biến. Nhân bản ở mục Phiên bản để chỉnh sửa.</p>}
        {tab === 'rules' && <>
          <div className="grid gap-3 sm:grid-cols-3 xl:grid-cols-6">{[
            ['Danh mục', category, setCategory, { COMPATIBILITY: 'Tuổi', ALMANAC: 'Lịch', PURPOSE: 'Mục đích' }], ['Ưu tiên', priority, setPriority, priorities], ['Hiệu ứng', effect, setEffect, effects], ['Trạng thái', enabled, setEnabled, { true: 'Bật', false: 'Tắt' }], ['Nguồn', verified, setVerified, { true: 'Đã xác minh', false: 'Chưa xác minh' }],
          ].map(([label, value, setter, options]) => <Field key={String(label)} label={String(label)}><Select value={String(value)} onChange={e => (setter as (value: string) => void)(e.target.value)}><option value="">Tất cả</option>{Object.entries(options as Record<string, string>).map(([id, text]) => <option key={id} value={id}>{text}</option>)}</Select></Field>)}</div>
          <DataTable data={filteredRules} searchPlaceholder="Tìm tên hoặc mã quy tắc…" searchFields={['code', 'engineHandler']} columns={[{ key: 'code', label: 'Tên / Code', render: row => <div><strong>{snapshot.contents.find(content => content.ruleId === row.id)?.title ?? row.code}</strong><p className="text-sm text-[var(--muted-fg)]">{row.code}</p></div> }, { key: 'priority', label: 'Ưu tiên' }, { key: 'effect', label: 'Hiệu ứng', render: row => effects[row.effect as keyof typeof effects] }, { key: 'weight', label: 'Trọng số' }, { key: 'hardExclusion', label: 'Loại trừ', render: row => row.hardExclusion ? 'Có' : 'Không' }, { key: 'isEnabled', label: 'Trạng thái', render: row => <StatusBadge status={row.isEnabled ? 'active' : 'inactive'} /> }, { key: 'source', label: 'Nguồn', render: row => sourceStatus(row.id) ? 'Đã xác minh' : 'Chưa xác minh' }]} onView={row => setEditing({ title: `Quy tắc ${row.code}`, fields: editable && can('rules.update') ? [{ key: 'priority', label: 'Ưu tiên', type: 'select', options: priorities }, { key: 'effect', label: 'Hiệu ứng', type: 'select', options: effects }, { key: 'weight', label: 'Trọng số', type: 'number', min: 0, max: 50, required: true }, { key: 'sortOrder', label: 'Thứ tự', type: 'number', min: 0, max: 1000, required: true }, { key: 'hardExclusion', label: 'Loại trừ (chỉ CRITICAL/NEGATIVE)', type: 'boolean' }, { key: 'isEnabled', label: 'Bật quy tắc', type: 'boolean' }, { key: 'parameters', label: 'Tham số JSON (officers: chỉ số Trực 0–11)', type: 'json' }, reasonField] : [], initial: row, path: `${base}/rules/${row.id}`, method: 'PATCH', note: `Handler chỉ đọc: ${row.engineHandler}. Danh mục: ${row.category}. Trực: ${officerLabels.map((name, i) => `${i}: ${name}`).join(', ')}.` })} />
        </>}
        {tab === 'content' && <DataTable data={snapshot.contents} searchPlaceholder="Tìm nội dung…" searchFields={['title', 'shortDescription']} columns={[{ key: 'title', label: 'Tiêu đề' }, { key: 'shortDescription', label: 'Mô tả ngắn', render: row => <p className="max-w-md whitespace-normal">{row.shortDescription}</p> }, { key: 'detailDescription', label: 'Xem trước', render: row => <details className="max-w-md"><summary className="cursor-pointer">Nội dung chi tiết</summary><p className="whitespace-pre-wrap">{row.detailDescription}</p></details> }]} onEdit={editable && can('content.update') ? row => setEditing({ title: 'Nội dung giải thích', fields: [{ key: 'title', label: 'Tiêu đề', required: true, maxLength: 200 }, { key: 'shortDescription', label: 'Mô tả ngắn', type: 'textarea', required: true, maxLength: 1500 }, { key: 'detailDescription', label: 'Mô tả chi tiết', type: 'textarea' }, reasonField], initial: row, path: `${base}/rules/${row.ruleId}/content`, method: 'PUT' }) : undefined} />}
        {tab === 'sources' && <>
          <div className="grid gap-3 sm:grid-cols-2"><Field label="Quy tắc"><Select value={ruleFilter} onChange={e => setRuleFilter(e.target.value)}><option value="">Tất cả</option>{snapshot.rules.map(rule => <option key={rule.id} value={rule.id}>{rule.code}</option>)}</Select></Field><Field label="Trạng thái nguồn"><Select value={sourceFilter} onChange={e => setSourceFilter(e.target.value)}><option value="">Tất cả</option><option value="VERIFIED">Đã xác minh</option><option value="UNVERIFIED">Chưa xác minh</option><option value="REJECTED">Không chấp nhận</option></Select></Field></div>
          {editable && can('sources.manage') && <Button disabled={!ruleFilter} onClick={() => setEditing({ title: 'Thêm nguồn tham chiếu', fields: sourceFields, initial: { verificationStatus: 'UNVERIFIED' }, path: `${base}/rules/${ruleFilter}/sources`, method: 'POST', note: 'Chỉ đánh dấu Đã xác minh khi đã đối chiếu tài liệu với logic handler.' })}>Thêm nguồn cho quy tắc đã chọn</Button>}
          <DataTable data={snapshot.sources.filter(source => (!ruleFilter || source.ruleId === ruleFilter) && (!sourceFilter || source.verificationStatus === sourceFilter))} columns={[{ key: 'title', label: 'Tài liệu' }, { key: 'ruleId', label: 'Quy tắc', render: row => snapshot.rules.find(rule => rule.id === row.ruleId)?.code }, { key: 'author', label: 'Tác giả' }, { key: 'verificationStatus', label: 'Trạng thái' }, { key: 'url', label: 'URL', render: row => row.url.startsWith('https://') ? <a className="text-red-600" href={row.url} target="_blank" rel="noreferrer">Mở tài liệu</a> : '—' }]} onEdit={editable && can('sources.manage') ? row => setEditing({ title: 'Sửa nguồn tham chiếu', fields: sourceFields, initial: row, path: `${base}/sources/${row.id}`, method: 'PUT' }) : undefined} onDelete={editable && can('sources.manage') ? row => setEditing({ title: 'Xóa nguồn tham chiếu', fields: [reasonField], initial: {}, path: `${base}/sources/${row.id}`, method: 'DELETE', note: row.title }) : undefined} />
        </>}
        {tab === 'cases' && <>
          <div className="flex flex-wrap gap-3">{editable && can('versions.manage') && <Button onClick={() => setEditing({ title: 'Thêm ca tham chiếu', fields: caseFields, initial: { purpose: snapshot.set.purpose, gender: '', isActive: true, expected: { classification: 'NORMAL', rules: [] } }, path: `${base}/versions/${snapshot.set.id}/cases`, method: 'POST', note: 'Nhập kỳ vọng từ nguồn độc lập; không lấy kết quả simulator làm chuẩn để tự xác minh.' })}>Thêm ca tham chiếu</Button>}{can('simulate') && <Button variant="secondary" disabled={busy} onClick={() => void execute(async () => { setReport(await api<ValidationReport>(`${base}/versions/${snapshot.set.id}/regression`, json('POST'))); }, 'Đã chạy các ca tham chiếu.')}>Chạy tất cả ca</Button>}</div>
          <DataTable data={snapshot.cases} searchPlaceholder="Tìm ca tham chiếu…" searchFields={['name', 'sourceNote']} columns={[{ key: 'name', label: 'Ca tham chiếu' }, { key: 'targetDate', label: 'Ngày kiểm tra' }, { key: 'expected', label: 'Kỳ vọng', render: row => <details><summary className="cursor-pointer">Xem JSON</summary><pre className="max-w-md max-h-64 overflow-auto text-sm">{JSON.stringify(row.expected, null, 2)}</pre></details> }, { key: 'isActive', label: 'Đang dùng', render: row => row.isActive ? 'Có' : 'Không' }]} actions={row => <>
            {can('simulate') && <Button size="sm" variant="secondary" disabled={busy} onClick={() => void execute(async () => { const value = await api<ValidationReport>(`${base}/versions/${snapshot.set.id}/regression`, json('POST')); setReport({ ...value, cases: value.cases.filter(item => item.id === row.id) }); }, 'Đã kiểm tra ca tham chiếu.')}>Chạy ca</Button>}
            {editable && can('versions.manage') && <Button size="sm" variant="secondary" onClick={() => setEditing({ title: 'Sửa ca tham chiếu', fields: caseFields, initial: row, path: `${base}/cases/${row.id}`, method: 'PUT' })}>Sửa</Button>}
            {editable && can('versions.manage') && <Button size="sm" variant="ghost" onClick={() => setEditing({ title: 'Xóa ca tham chiếu', fields: [reasonField], initial: {}, path: `${base}/cases/${row.id}`, method: 'DELETE', note: row.name })}>Xóa</Button>}
          </>} />
        </>}
      </>)}
      {tab === 'audit' && (audit ? <DataTable data={audit.data} remote={{ page: auditPage, perPage: 20, total: audit.meta.total, search: '', onPage: page => { setAudit(null); setAuditPage(page); }, onSearch: () => {} }} columns={[{ key: 'createdAt', label: 'Thời gian' }, { key: 'adminName', label: 'Admin' }, { key: 'action', label: 'Thao tác' }, { key: 'entityType', label: 'Đối tượng' }, { key: 'version', label: 'Phiên bản' }, { key: 'reason', label: 'Lý do', render: row => <p className="max-w-xs whitespace-normal">{row.reason}</p> }, { key: 'details', label: 'Chi tiết', render: row => <details><summary className="cursor-pointer">Trước / sau</summary><pre className="max-h-80 max-w-lg overflow-auto text-xs">{JSON.stringify({ before: row.beforeData, after: row.afterData }, null, 2)}</pre></details> }]} /> : <p role="status">Đang tải nhật ký…</p>)}
      {report && <section className="space-y-3 rounded-2xl border border-[var(--border-color)] p-4 sm:p-6"><h2 className="text-xl font-bold">Báo cáo kiểm tra: {report.passed ? 'Đạt' : 'Chưa đạt'}</h2><p>Tổng: {report.total} · Đạt: {report.pass} · Sai: {report.fail} · Thay đổi: {report.changed}</p>{report.errors.length > 0 && <ul className="list-disc pl-5 space-y-1 text-red-600">{report.errors.map((text, i) => <li key={`${i}-${text}`}>{text}</li>)}</ul>}<DataTable data={report.cases.map(item => ({ ...item }))} columns={[{ key: 'name', label: 'Ca' }, { key: 'status', label: 'Kết quả' }, { key: 'differences', label: 'Khác biệt', render: row => row.differences.join(', ') }]} /></section>}
    </>}
    {publish && <PublishDialog version={publish} busy={busy} onClose={() => setPublish(null)} onConfirm={async reason => { if (await execute(() => api(`${base}/versions/${publish.id}/publish`, json('POST', { reason, confirmed: true })), 'Đã xuất bản phiên bản mới.')) setPublish(null); }} />}
  </div>;
}

function PublishDialog({ version, busy, onClose, onConfirm }: { version: Version; busy: boolean; onClose: () => void; onConfirm: (reason: string) => Promise<void> }) {
  const ref = useRef<HTMLDialogElement>(null), [reason, setReason] = useState('');
  useEffect(() => { ref.current?.showModal(); }, []);
  return <dialog ref={ref} onCancel={onClose} className="auspicious-confirm w-[calc(100%-32px)] max-w-lg rounded-2xl border border-[var(--border-color)] bg-[var(--card-bg)] text-[var(--foreground)] p-6">
    <form onSubmit={e => { e.preventDefault(); void onConfirm(reason); }} className="space-y-4"><h2 className="text-xl font-bold">Xuất bản {version.version}?</h2><p>Bộ quy tắc {purposeLabels[version.purpose]} sẽ được dùng cho khách truy cập. Bản đang xuất bản sẽ chuyển sang lưu trữ. Backend sẽ kiểm tra lại nguồn và các ca tham chiếu.</p><Field label="Lý do xuất bản"><Input autoFocus required minLength={3} maxLength={1000} value={reason} onChange={e => setReason(e.target.value)} /></Field><div className="flex gap-3"><Button disabled={busy}>Xác nhận xuất bản</Button><Button type="button" variant="secondary" disabled={busy} onClick={onClose}>Hủy</Button></div></form>
  </dialog>;
}
