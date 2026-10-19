'use client';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { ArrowLeft, ChevronRight, Fuel, Gauge, Plus, Save, Trash2, Wrench } from 'lucide-react';
import { Button, DataTable, Input, Select } from '@/components/ui';
import { api, json, query, type PageResult } from '@/lib/api/client';
import { useDebouncedValue } from '@/lib/api/use-admin-list';
import { ownershipBase, type Policy, type Profile, type Scope } from '@/lib/ownership';
import PolicyForm from './PolicyForm';
import { ConfirmAction, EmptyState, LoadState, Panel, SectionHeading, useDraftGuard, useOwnershipData } from './shared';

type EditableProfile = Omit<Profile, 'updatedAt'> & { updatedAt?: string };
const labels: Record<Scope, string> = { car: 'Xe cụ thể', version: 'Phiên bản', model: 'Dòng xe', body: 'Nhóm kiểu dáng', fuel: 'Nhiên liệu' };
function TargetPicker({ scope, value, change }: { scope: Scope; value: string; change: (v: string) => void }) {
  const [search, setSearch] = useState(''), [term, setTerm] = useState('');
  useEffect(() => { const timer = setTimeout(() => setTerm(search), 300); return () => clearTimeout(timer); }, [search]);
  const targets = useOwnershipData<{ id: string; name: string }[]>(scope === 'fuel' ? null : `${ownershipBase}/targets${query({ scope, search: term })}`);
  return scope === 'fuel' ? <label className="tt-ownership-field"><span>Nhiên liệu</span><Select aria-label="Nhiên liệu" value={value} required onChange={e => change(e.target.value)}><option value="">Chọn nhiên liệu</option><option value="gasoline">Xăng</option><option value="diesel">Dầu</option><option value="electric">Điện</option></Select></label> : <div className="tt-ownership-target-picker">
    <label className="tt-ownership-field"><span>Tìm {labels[scope].toLowerCase()}</span><Input value={search} maxLength={100} onChange={e => setSearch(e.target.value)} placeholder="Nhập tên để tìm…" /></label><LoadState {...targets} />
    <label className="tt-ownership-field"><span>Đối tượng áp dụng</span><Select aria-label="Đối tượng áp dụng" required value={value} onChange={e => change(e.target.value)}><option value="">Chọn {labels[scope].toLowerCase()}</option>{value && !targets.data?.some(t => t.id === value) && <option value={value}>Giữ đối tượng đang áp dụng</option>}{targets.data?.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</Select></label>
    <small className="tt-ownership-hint">Tìm theo tên nếu chưa thấy đối tượng cần chọn.</small>
  </div>;
}
export default function Profiles({ policy, writable, revision, onDirtyChange }: { policy: Policy; writable: boolean; revision: number; onDirtyChange?: (dirty: boolean) => void }) {
  const [page, setPage] = useState(1), [search, setSearch] = useState(''), [refresh, setRefresh] = useState(0), [editing, setEditing] = useState<EditableProfile | null>(null), [baseline, setBaseline] = useState(''), [section, setSection] = useState('energy'), [error, setError] = useState(''), [busy, setBusy] = useState(false), [confirmation, setConfirmation] = useState<EditableProfile | 'save' | null>(null);
  const term = useDebouncedValue(search);
  const rows = useOwnershipData<PageResult<EditableProfile>>(`${ownershipBase}/profiles${query({ page, limit: 20, search: term })}`, refresh + revision);
  const dirty = !!editing && JSON.stringify(editing) !== baseline;
  useDraftGuard(dirty, onDirtyChange);
  const edit = (row: EditableProfile) => { const draft = structuredClone(row); setEditing(draft); setBaseline(JSON.stringify(draft)); setSection('energy'); setError(''); };
  const close = () => { if (!dirty || confirm('Bỏ các thay đổi chưa lưu của định mức này?')) { setEditing(null); setError(''); } };
  async function save() {
    if (!editing || !writable || busy) return;
    setBusy(true); setError('');
    try { const { id, ...payload } = editing; await api(`${ownershipBase}/profiles/${id}`, json('PUT', payload)); toast.success('Đã lưu định mức.'); setEditing(null); setRefresh(n => n + 1); }
    catch (e) { setError(e instanceof Error ? e.message : 'Không lưu được định mức.'); } finally { setBusy(false); }
  }
  async function remove(row: EditableProfile) {
    if (!writable || busy) return;
    setBusy(true); setError('');
    try { await api(`${ownershipBase}/profiles/${row.id}`, json('DELETE')); toast.success('Đã xóa định mức.'); setRefresh(n => n + 1); }
    catch (e) { setError(e instanceof Error ? e.message : 'Không xóa được định mức.'); } finally { setBusy(false); }
  }
  return <>
    {!editing ? <>
      <Panel><SectionHeading icon={Gauge} title="Định mức theo xe" description="Thiết lập riêng khi một xe hoặc nhóm xe khác với mức mặc định." actions={writable && <Button type="button" onClick={() => edit({ id: crypto.randomUUID(), name: '', scope: 'car', target: '', policy: structuredClone(policy) })}><Plus size={18} aria-hidden="true" />Thêm định mức</Button>} />
        <div className="tt-ownership-priority" aria-label="Thứ tự ưu tiên định mức">{[...Object.values(labels), 'Mặc định'].map((label, i) => <span key={label}><b>{i + 1}</b>{label}{i < 5 && <ChevronRight size={14} aria-hidden="true" />}</span>)}</div>
        <p className="tt-ownership-hint">Xe dùng định mức phù hợp có ưu tiên cao nhất. Mỗi định mức bao gồm đầy đủ các quy tắc chi phí.</p>
      </Panel>
      <LoadState {...rows} />{rows.data && <DataTable data={rows.data.data.map(row => ({ ...row }))} remote={{ page, total: rows.data.meta.total, perPage: 20, search, onPage: setPage, onSearch: value => { setSearch(value); setPage(1); } }} searchPlaceholder="Tìm tên định mức…" columns={[
        { key: 'name', label: 'Định mức', render: row => <div><strong>{row.name}</strong><p className="tt-ownership-cell-note">Xăng {row.policy.consumption.gasoline} · Dầu {row.policy.consumption.diesel} · Điện {row.policy.consumption.electric} /100 km</p></div> },
        { key: 'scope', label: 'Phạm vi', render: row => <span className="tt-ownership-scope-badge">{labels[row.scope]}</span> },
        { key: 'maintenance', label: 'Bảo dưỡng', render: row => row.policy.maintenanceMode === 'scheduled' ? `${row.policy.maintenance.length} hạng mục định kỳ` : 'Ngân sách theo km / năm' },
        { key: 'updatedAt', label: 'Cập nhật', render: row => row.updatedAt ? new Date(row.updatedAt).toLocaleString('vi-VN') : '—' },
      ]} emptyMessage="Chưa có định mức phù hợp. Các xe vẫn dùng định mức mặc định." actions={row => <><Button type="button" size="sm" variant="secondary" onClick={() => edit(row)}>{writable ? 'Sửa' : 'Xem'}</Button>{writable && <Button type="button" size="sm" variant="ghost" disabled={busy} onClick={() => setConfirmation(row)} aria-label={`Xóa định mức ${row.name}`}><Trash2 size={16} aria-hidden="true" /></Button>}</>} />}
    </> : <form onSubmit={e => { e.preventDefault(); if (writable) { if (editing.scope !== 'car') setConfirmation('save'); else void save(); } }} onInvalidCapture={e => { e.preventDefault(); const input = e.target as HTMLInputElement; const group = input.closest<HTMLElement>('[data-policy-section]'); if (group?.dataset.policySection) setSection(group.dataset.policySection); for (let parent = input.parentElement; parent; parent = parent.parentElement) if (parent instanceof HTMLDetailsElement) parent.open = true; requestAnimationFrame(() => input.focus()); }}>
      <div className="tt-ownership-editor-heading"><Button type="button" variant="secondary" size="sm" disabled={busy} onClick={close}><ArrowLeft size={18} aria-hidden="true" />Quay lại danh sách</Button><div><h2>{editing.updatedAt ? 'Chỉnh sửa định mức' : 'Thêm định mức'}</h2><p className="tt-ownership-hint">Xác định phạm vi áp dụng, sau đó điều chỉnh chi phí phù hợp.</p></div></div>
      <fieldset disabled={!writable || busy}>
        <Panel><SectionHeading icon={Gauge} title="Thông tin áp dụng" /><div className="tt-ownership-grid"><label className="tt-ownership-field"><span>Tên định mức</span><Input required maxLength={120} value={editing.name} placeholder="Ví dụ: Xe đô thị cỡ nhỏ" onChange={e => setEditing({ ...editing, name: e.target.value })} /></label><label className="tt-ownership-field"><span>Cấp áp dụng</span><Select aria-label="Cấp áp dụng" value={editing.scope} onChange={e => setEditing({ ...editing, scope: e.target.value as Scope, target: '' })}>{Object.entries(labels).map(([key, name]) => <option key={key} value={key}>{name}</option>)}</Select></label></div><TargetPicker key={editing.scope} scope={editing.scope} value={editing.target} change={target => setEditing({ ...editing, target })} /></Panel>
        </fieldset><nav className="tt-ownership-policy-tabs" aria-label="Nhóm định mức"><Button type="button" variant={section === 'energy' ? 'primary' : 'secondary'} onClick={() => setSection('energy')}><Fuel size={18} aria-hidden="true" />Tiêu hao & di chuyển</Button><Button type="button" variant={section === 'maintenance' ? 'primary' : 'secondary'} onClick={() => setSection('maintenance')}><Wrench size={18} aria-hidden="true" />Bảo dưỡng & khấu hao</Button></nav><fieldset disabled={!writable || busy}>
        <section hidden={section !== 'energy'} data-policy-section="energy"><PolicyForm section="energy" policy={editing.policy} change={policy => setEditing({ ...editing, policy })} /></section>
        <section hidden={section !== 'maintenance'} data-policy-section="maintenance"><PolicyForm section="maintenance" policy={editing.policy} change={policy => setEditing({ ...editing, policy })} /></section>
      </fieldset>
      <div className="tt-ownership-savebar"><span>{!writable ? 'Chỉ xem định mức' : dirty ? 'Có thay đổi chưa lưu' : 'Chỉnh định mức theo phạm vi đã chọn'}</span><div><Button type="button" variant="secondary" disabled={busy} onClick={close}>Hủy</Button>{writable && <Button type="submit" disabled={busy}><Save size={17} aria-hidden="true" />{busy ? 'Đang lưu…' : 'Lưu định mức'}</Button>}</div></div>
    </form>}
    {error && <p role="alert" className="tt-ownership-error">{error}</p>}
    {!rows.loading && !rows.data && !rows.error && !editing && <EmptyState title="Chưa có dữ liệu định mức" />}
    {confirmation && <ConfirmAction title={confirmation === 'save' ? 'Áp dụng định mức cho nhóm xe?' : 'Xóa định mức này?'} description={confirmation === 'save' ? 'Tất cả xe thuộc phạm vi đã chọn sẽ sử dụng định mức này ở các lượt tính tiếp theo.' : `Định mức “${confirmation.name}” sẽ được xóa. Xe chuyển sang định mức phù hợp có ưu tiên kế tiếp.`} confirmLabel={confirmation === 'save' ? 'Lưu định mức' : 'Xóa định mức'} close={() => setConfirmation(null)} confirm={() => { if (confirmation === 'save') void save(); else void remove(confirmation); }} />}
  </>;
}
