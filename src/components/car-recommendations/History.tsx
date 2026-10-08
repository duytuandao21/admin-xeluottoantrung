'use client';
import { useState } from 'react';
import { Button, DataTable, Input, Select } from '@/components/ui';
import { query, type PageResult } from '@/lib/api/client';
import { defaultDateRange, eventLabels, labelsFor, needsBase, shortMoney, type SessionRow, type Settings } from '@/lib/car-recommendations';
import { formatDate } from '@/lib/date';
import { Field, LoadState, Panel, useNeedsData } from './shared';
import Details from './Details';
const initialFilters = () => ({ ...defaultDateRange(), minBudget: '', maxBudget: '', purpose: '', priority: '', passengers: '', resultCount: '', interaction: '' });
export default function History({ settings, revision }: { settings: Settings; revision: number }) {
  const [draft, setDraft] = useState(initialFilters), [filters, setFilters] = useState(initialFilters), [page, setPage] = useState(1), [search, setSearch] = useState(''), [selected, setSelected] = useState<string | null>(null), [retry, setRetry] = useState(0);
  const resource = useNeedsData<PageResult<SessionRow>>(`${needsBase}/sessions${query({ ...filters, page, limit: 10, search: search.length >= 8 ? search : undefined })}`, revision + retry);
  const labels = labelsFor(settings), change = (key: keyof typeof draft, value: string) => setDraft(old => ({ ...old, [key]: value }));
  if (selected) return <Details id={selected} close={() => setSelected(null)} />;
  return <div className="space-y-5">
    <Panel><form onSubmit={e => { e.preventDefault(); setFilters(draft); setPage(1); }}><div className="tt-needs-filters">
      <Field label="Từ ngày"><Input type="date" value={draft.from} required onChange={e => change('from', e.target.value)} /></Field><Field label="Đến ngày"><Input type="date" value={draft.to} required onChange={e => change('to', e.target.value)} /></Field>
      <Field label="Ngân sách từ (đ)"><Input type="number" min={0} max={50000000000} value={draft.minBudget} onChange={e => change('minBudget', e.target.value)} /></Field><Field label="Ngân sách đến (đ)"><Input type="number" min={0} max={50000000000} value={draft.maxBudget} onChange={e => change('maxBudget', e.target.value)} /></Field>
      {(['purpose', 'priority', 'passengers'] as const).map(key => <Field key={key} label={key === 'purpose' ? 'Mục đích' : key === 'priority' ? 'Ưu tiên' : 'Số người'}><Select value={draft[key]} onChange={e => change(key, e.target.value)}><option value="">Tất cả</option>{Object.entries(labels[key === 'purpose' ? 'purposes' : key === 'priority' ? 'priorities' : key] || {}).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</Select></Field>)}
      <Field label="Số xe được đề xuất"><Input type="number" min={0} max={5000} placeholder="Tất cả" value={draft.resultCount} onChange={e => change('resultCount', e.target.value)} /></Field>
      <Field label="Tương tác"><Select value={draft.interaction} onChange={e => change('interaction', e.target.value)}><option value="">Tất cả</option>{['result_viewed', 'car_clicked', 'contact_clicked', 'none'].map(key => <option key={key} value={key}>{eventLabels[key] || 'Chưa có tương tác'}</option>)}</Select></Field>
      <Button type="submit">Lọc khảo sát</Button><Button type="button" variant="secondary" onClick={() => { const fresh = initialFilters(); setDraft(fresh); setFilters(fresh); setSearch(''); setPage(1); }}>Đặt lại bộ lọc</Button>
    </div></form><p className="mt-3 text-xs text-[var(--muted-fg)]">Khoảng ngân sách khảo sát giao nhau với khoảng lọc. Ngày theo Việt Nam, tối đa 366 ngày.</p></Panel>
    <LoadState {...resource} retry={() => setRetry(n => n + 1)} />
    {search.length > 0 && search.length < 8 && <p className="text-sm text-[var(--muted-fg)]">Nhập tối thiểu 8 ký tự đầu của mã phiên để tìm.</p>}
    {!resource.error && <DataTable<SessionRow> data={resource.data?.data || []} searchPlaceholder="Tìm mã phiên khảo sát (ít nhất 8 ký tự)…" emptyMessage={resource.loading ? 'Đang tải…' : 'Chưa có khảo sát phù hợp.'} remote={{ page, total: resource.data?.meta.total || 0, perPage: 10, search, onPage: setPage, onSearch: value => { setSearch(value.trim()); setPage(1); } }} onView={row => setSelected(row.id)} columns={[
      { key: 'createdAt', label: 'Thời gian / mã phiên', render: row => <div className="whitespace-nowrap"><p>{formatDate(row.createdAt)}</p><span className="text-xs text-[var(--muted-fg)]" title={row.id}>{row.id.slice(0, 8)}</span></div> },
      { key: 'budget', label: 'Ngân sách', render: row => <span className="whitespace-nowrap">{shortMoney(row.criteria.budgetMin)} – {shortMoney(row.criteria.budgetMax)}</span> },
      { key: 'purposes', label: 'Mục đích', render: row => row.criteria.purposes.map(key => row.labels.purposes?.[key] || key).join(', ') },
      { key: 'seats', label: 'Số người / ghế', render: row => <span>{row.criteria.preferredSeats} người{row.criteria.minimumSeats ? ' · Bắt buộc đủ ghế' : ''}</span> },
      { key: 'priorities', label: 'Ưu tiên theo thứ tự', render: row => row.criteria.priorities.map((key, i) => `${i + 1}. ${row.labels.priorities?.[key] || key}`).join('; ') },
      { key: 'resultCount', label: 'Kết quả', render: row => `${row.resultCount} xe · ${row.topScore ?? '—'}/100` },
      { key: 'eventCount', label: 'Tương tác', render: row => <div>{row.eventCount} thao tác<p className="text-xs text-[var(--muted-fg)]">{row.interactions.map(key => eventLabels[key]).join(', ') || 'Chưa có'}</p></div> },
    ]} />}
  </div>;
}
