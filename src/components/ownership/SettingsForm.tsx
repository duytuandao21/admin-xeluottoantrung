'use client';
import { useState } from 'react';
import { toast } from 'sonner';
import { Banknote, Check, ChevronRight, Fuel, Plus, RotateCcw, Save, Settings2, ShieldCheck, SlidersHorizontal, Trash2, Wrench } from 'lucide-react';
import { Button, Input, Select, StatusBadge } from '@/components/ui';
import { api, json } from '@/lib/api/client';
import { ownershipBase, type Answers, type Settings, type SettingsConfig } from '@/lib/ownership';
import { ConfirmAction, NumberField, Panel, SectionHeading, useDraftGuard, useOwnershipData, vnd } from './shared';
import PolicyForm from './PolicyForm';

const sections = [
  { key: 'survey', title: 'Khảo sát mặc định', description: 'Thói quen sử dụng, ngân sách và khoản vay', icon: Settings2 },
  { key: 'energy', title: 'Nhiên liệu & tiêu hao', description: 'Giá năng lượng và định mức vận hành', icon: Fuel },
  { key: 'maintenance', title: 'Bảo dưỡng & khấu hao', description: 'Bảo dưỡng, sửa chữa và giá trị còn lại', icon: Wrench },
  { key: 'fees', title: 'Phí & bảo hiểm', description: 'Các khoản phí và điều kiện áp dụng', icon: ShieldCheck },
  { key: 'advanced', title: 'Thiết lập nâng cao', description: 'Dữ liệu dự phòng và khu vực giao dịch', icon: SlidersHorizontal },
];
const feeLabels = { initial: 'Phí ban đầu', annual: 'Phí hằng năm', mandatory: 'Bảo hiểm bắt buộc', comprehensive: 'Bảo hiểm vật chất', finance: 'Phí tài chính' };

export default function SettingsForm({ settings, writable, saved, onDirtyChange }: { settings: Settings; writable: boolean; saved: () => void; onDirtyChange?: (dirty: boolean) => void }) {
  const [config, setConfig] = useState<SettingsConfig>(() => structuredClone(settings.config)), [enabled, setEnabled] = useState(settings.enabled);
  const [active, setActive] = useState('survey'), [error, setError] = useState(''), [busy, setBusy] = useState(false), [confirmation, setConfirmation] = useState<'save' | 'reset' | null>(null), [openFee, setOpenFee] = useState<string | null>(null);
  const dirty = enabled !== settings.enabled || JSON.stringify(config) !== JSON.stringify(settings.config);
  useDraftGuard(dirty, onDirtyChange);
  const bodyOptions = useOwnershipData<{ id: string; name: string }[]>(active === 'fees' ? `${ownershipBase}/targets?scope=body` : null);
  const set = <K extends keyof SettingsConfig>(key: K, value: SettingsConfig[K]) => setConfig(c => ({ ...c, [key]: value }));
  const answer = <K extends keyof Answers>(key: K, value: Answers[K]) => set('defaults', { ...config.defaults, [key]: value });
  const loan = (key: 'downPct' | 'termMonths' | 'annualRate', value: number) => setConfig(c => ({ ...c, loanDefaults: { ...c.loanDefaults, [key]: value }, defaults: c.defaults.financed ? { ...c.defaults, [key]: value } : c.defaults }));
  async function save() {
    if (!writable || busy) return;
    setBusy(true); setError('');
    try { await api(`${ownershipBase}/settings`, json('PATCH', { enabled, config, updatedAt: settings.updatedAt })); toast.success('Đã lưu cấu hình hiện hành.'); saved(); }
    catch (e) { setError(e instanceof Error ? e.message : 'Không lưu được cấu hình.'); } finally { setBusy(false); }
  }
  return <form className="tt-ownership-settings" onSubmit={e => { e.preventDefault(); if (writable && dirty) setConfirmation('save'); }} onInvalidCapture={e => {
    e.preventDefault();
    const input = e.target as HTMLInputElement, section = input.closest<HTMLElement>('[data-settings-section]');
    setError(`Kiểm tra lại ô “${input.closest('label')?.querySelector('span')?.textContent || input.getAttribute('aria-label') || 'giá trị'}”: ${input.validationMessage}`);
    if (section?.dataset.settingsSection) setActive(section.dataset.settingsSection);
    for (let parent = input.parentElement; parent; parent = parent.parentElement) if (parent instanceof HTMLDetailsElement) parent.open = true;
    requestAnimationFrame(() => input.focus());
  }}>
    <Panel><div className="tt-ownership-heading"><div><h2>Cấu hình chi phí</h2><p className="tt-ownership-hint">Chọn nhóm cần chỉnh sửa. Lưu một lần để áp dụng tất cả thay đổi.</p></div><StatusBadge status={enabled ? 'active' : 'inactive'} labels={{ active: 'Đang bật', inactive: 'Tạm ngừng' }} /></div>
      <label className="tt-ownership-toggle"><input type="checkbox" checked={enabled} disabled={!writable || busy} onChange={e => setEnabled(e.target.checked)} /><span><strong>Bật bộ tính chi phí sử dụng</strong><small>Cho phép khách hàng dự toán chi phí ngay trên trang chi tiết xe.</small></span></label>
      <p className="tt-ownership-meta">Cập nhật: {new Date(settings.updatedAt).toLocaleString('vi-VN')} · Các giá trị mặc định là minh họa, cần điều chỉnh theo thực tế.</p>
    </Panel>
    <div className="tt-ownership-editor-layout">
      <nav className="tt-ownership-section-nav" aria-label="Nhóm cấu hình chi phí">{sections.map(({ key, title, description, icon: Icon }) => <button type="button" key={key} aria-current={active === key ? 'page' : undefined} onClick={() => setActive(key)}><Icon size={20} aria-hidden="true" /><span><strong>{title}</strong><small>{description}</small></span><ChevronRight size={16} aria-hidden="true" /></button>)}</nav>
      <fieldset disabled={!writable || busy} className="tt-ownership-editor-fields">
        <section hidden={active !== 'survey'} data-settings-section="survey">
          <Panel><SectionHeading icon={Settings2} title="Thói quen sử dụng" description="Các giá trị khách hàng thấy khi bắt đầu khảo sát; họ có thể thay đổi theo nhu cầu." />
            <div className="tt-ownership-grid">
              <NumberField label="Km/tháng mặc định" value={config.defaults.monthlyKm} max={20000} change={n => answer('monthlyKm', n)} />
              <label className="tt-ownership-field"><span>Điều kiện đi mặc định</span><Select aria-label="Điều kiện đi mặc định" value={config.defaults.driving} onChange={e => answer('driving', e.target.value as Answers['driving'])}><option value="mixed">Hỗn hợp</option><option value="city">Thành phố</option><option value="highway">Đường trường</option></Select></label>
              <NumberField label="Sở hữu mặc định (năm)" value={config.defaults.years} min={1} max={20} change={n => answer('years', n)} />
              <label className="tt-ownership-field"><span>Bảo hiểm mặc định</span><Select aria-label="Bảo hiểm mặc định" value={config.defaults.insurance} onChange={e => answer('insurance', e.target.value as Answers['insurance'])}><option value="mandatory">Bắt buộc</option><option value="comprehensive">Bắt buộc + vật chất</option></Select></label>
            </div>
            <ChoicePresets title="Mốc thời gian chọn nhanh" unit="năm" values={config.yearOptions} min={1} max={20} change={n => set('yearOptions', n)} />
          </Panel>
          <Panel><SectionHeading icon={Banknote} title="Ngân sách hằng tháng" description="Tách các khoản chi cá nhân để khách hàng dễ điều chỉnh." />
            {(['parking', 'wash', 'toll'] as const).map((field, i) => <div className="tt-ownership-budget-row" key={field}><NumberField label={['Gửi xe mặc định (VNĐ/tháng)', 'Rửa xe mặc định (VNĐ/tháng)', 'Cầu đường mặc định (VNĐ/tháng)'][i]} value={config.defaults[field]} max={20000000} change={n => answer(field, n)} /><ChoicePresets title={['Lựa chọn gửi xe', 'Lựa chọn rửa xe', 'Lựa chọn cầu đường'][i]} values={config[`${field}Options`]} min={0} max={20000000} unit="đ" change={n => set(`${field}Options`, n)} /></div>)}
          </Panel>
          <Panel><SectionHeading icon={Banknote} title="Trả góp giả định" description="Các giá trị gợi ý khi khách chọn trả góp, không phải báo giá ngân hàng." />
            <label className="tt-ownership-check"><input type="checkbox" checked={config.defaults.financed} onChange={e => set('defaults', { ...config.defaults, financed: e.target.checked, ...(e.target.checked ? config.loanDefaults : { downPct: null, termMonths: null, annualRate: null }) })} />Chọn trả góp mặc định trong khảo sát</label>
            <div className="tt-ownership-grid"><NumberField label="Trả trước mặc định (%)" value={config.loanDefaults.downPct} max={100} step={0.01} change={n => loan('downPct', n)} /><NumberField label="Kỳ hạn vay mặc định (tháng)" value={config.loanDefaults.termMonths} min={1} max={240} change={n => loan('termMonths', n)} /><NumberField label="Lãi suất mặc định (%/năm)" value={config.loanDefaults.annualRate} max={40} step={0.01} change={n => loan('annualRate', n)} /></div>
          </Panel>
        </section>
        <section hidden={active !== 'energy'} data-settings-section="energy">
          <Panel><SectionHeading icon={Fuel} title="Giá nhiên liệu & điện" description="Giá gợi ý cho khảo sát. Khách hàng vẫn có thể nhập mức giá dự kiến riêng." /><div className="tt-ownership-grid">{(['gasoline', 'diesel', 'electric'] as const).map((fuel, i) => <NumberField key={fuel} label={['Giá xăng (VNĐ/lít)', 'Giá dầu (VNĐ/lít)', 'Giá điện (VNĐ/kWh)'][i]} value={config.energyPrices[fuel]} min={1} max={100000} change={n => set('energyPrices', { ...config.energyPrices, [fuel]: n })} />)}</div></Panel>
          <PolicyForm section="energy" policy={config.policy} change={p => set('policy', p)} />
        </section>
        <section hidden={active !== 'maintenance'} data-settings-section="maintenance"><PolicyForm section="maintenance" policy={config.policy} change={p => set('policy', p)} /></section>
        <section hidden={active !== 'fees'} data-settings-section="fees">
          <Panel><SectionHeading icon={ShieldCheck} title="Phí & bảo hiểm" description="Mỗi khoản gồm số tiền cố định và tỷ lệ theo giá xe. Mở khoản cần sửa để xem chi tiết." actions={<Button type="button" variant="secondary" disabled={config.fees.length >= 40} onClick={() => { const key = `fee_${crypto.randomUUID().slice(0, 8)}`; set('fees', [...config.fees, { key, name: 'Phí mới', kind: 'initial', amount: 0, pricePct: 0, fuel: 'any', bodyId: null, region: '', transaction: '' }]); setOpenFee(key); }}><Plus size={18} aria-hidden="true" />Thêm khoản phí</Button>} />
            <div className="tt-ownership-info">Các khoản phù hợp được cộng vào dự toán. Bảo hiểm vật chất chỉ tính khi khách chọn; phí tài chính chỉ tính khi vay.</div>
            {!config.fees.length && <p className="tt-ownership-hint">Chưa có khoản phí. Thêm phí để đưa bảo hiểm và các chi phí giao dịch vào dự toán.</p>}
            {config.fees.map((f, i) => { const edit = (patch: Partial<typeof f>) => set('fees', config.fees.map((old, index) => index === i ? { ...old, ...patch } : old)); return <details className="tt-ownership-rule" key={f.key} open={openFee === f.key} onToggle={e => { const open = e.currentTarget.open; setOpenFee(previous => open ? f.key : previous === f.key ? null : previous); }}><summary><span><strong>{f.name || 'Phí mới'}</strong><small>{feeLabels[f.kind]} · {vnd(f.amount)}{f.pricePct ? ` + ${f.pricePct}% giá xe` : ''}</small></span></summary><div className="tt-ownership-rule-body">
              <div className="tt-ownership-grid"><label className="tt-ownership-field"><span>Tên phí</span><Input required maxLength={120} value={f.name} onChange={e => edit({ name: e.target.value })} /></label><label className="tt-ownership-field"><span>Loại phí</span><Select aria-label="Loại phí" value={f.kind} onChange={e => edit({ kind: e.target.value as typeof f.kind })}>{Object.entries(feeLabels).map(([key, label]) => <option key={key} value={key}>{label}</option>)}</Select></label><NumberField label="Tiền cố định (VNĐ)" value={f.amount} change={n => edit({ amount: n })} /><NumberField label="Tỷ lệ giá mua (%)" value={f.pricePct} max={30} step={0.01} change={n => edit({ pricePct: n })} /></div>
              <h3>Điều kiện áp dụng</h3><div className="tt-ownership-grid"><label className="tt-ownership-field"><span>Nhiên liệu</span><Select aria-label="Nhiên liệu" value={f.fuel} onChange={e => edit({ fuel: e.target.value as typeof f.fuel })}><option value="any">Mọi loại</option><option value="gasoline">Xăng</option><option value="diesel">Dầu</option><option value="electric">Điện</option></Select></label><label className="tt-ownership-field"><span>Nhóm kiểu dáng</span><Select aria-label="Nhóm kiểu dáng" value={f.bodyId || ''} onChange={e => edit({ bodyId: e.target.value || null })}><option value="">Mọi kiểu dáng</option>{f.bodyId && !bodyOptions.data?.some(row => row.id === f.bodyId) && <option value={f.bodyId}>Kiểu dáng đang áp dụng</option>}{bodyOptions.data?.map(row => <option key={row.id} value={row.id}>{row.name}</option>)}</Select></label><label className="tt-ownership-field"><span>Khu vực</span><Select aria-label="Khu vực" value={f.region} onChange={e => edit({ region: e.target.value })}><option value="">Mọi khu vực</option>{config.regions.map(r => <option key={r.key} value={r.key}>{r.label}</option>)}</Select></label><label className="tt-ownership-field"><span>Trường hợp giao dịch</span><Select aria-label="Trường hợp giao dịch" value={f.transaction} onChange={e => edit({ transaction: e.target.value })}><option value="">Mọi trường hợp</option>{config.transactions.map(r => <option key={r.key} value={r.key}>{r.label}</option>)}</Select></label></div>
              <Button type="button" variant="ghost" size="sm" onClick={() => { if (confirm(`Bỏ khoản “${f.name}” khỏi biểu mẫu?`)) set('fees', config.fees.filter((_, index) => index !== i)); }}><Trash2 size={16} aria-hidden="true" />Bỏ khoản phí</Button>
            </div></details>; })}
            {bodyOptions.error && <p role="alert" className="tt-ownership-hint">Không tải được danh mục kiểu dáng. Giá trị đang áp dụng được giữ nguyên.</p>}
          </Panel>
        </section>
        <section hidden={active !== 'advanced'} data-settings-section="advanced">
          <Panel><SectionHeading icon={SlidersHorizontal} title="Dữ liệu dự phòng" description="Chỉ dùng khi thông số xe chưa được cập nhật; kết quả luôn ghi rõ là ước tính." /><div className="tt-ownership-grid"><NumberField label="ODO dự phòng (km)" value={config.fallbackOdo} max={2000000} change={n => set('fallbackOdo', n)} /><label className="tt-ownership-field"><span>Nhiên liệu dự phòng</span><Select aria-label="Nhiên liệu dự phòng" value={config.defaultFuel} onChange={e => set('defaultFuel', e.target.value as SettingsConfig['defaultFuel'])}><option value="gasoline">Xăng</option><option value="diesel">Dầu</option><option value="electric">Điện</option></Select></label></div></Panel>
          {(['regions', 'transactions'] as const).map(field => <Panel key={field}><SectionHeading icon={Settings2} title={field === 'regions' ? 'Khu vực giao dịch' : 'Trường hợp giao dịch'} description="Danh sách khách có thể chọn trong khảo sát." />
            <div className="tt-ownership-choice-list">{config[field].map((r, i) => { const defaultKey = field === 'regions' ? 'region' : 'transaction'; const used = config.defaults[defaultKey] === r.key || config.fees.some(f => f[defaultKey] === r.key); return <div key={r.key}><Input aria-label={`${field === 'regions' ? 'Tên khu vực' : 'Tên trường hợp'} ${i + 1}`} required maxLength={120} value={r.label} onChange={e => set(field, config[field].map((old, index) => index === i ? { ...old, label: e.target.value } : old))} /><Button type="button" variant="ghost" size="sm" disabled={used || config[field].length <= 1} title={used ? 'Đang dùng làm mặc định hoặc trong một khoản phí' : 'Bỏ lựa chọn'} aria-label={`Bỏ ${r.label}`} onClick={() => set(field, config[field].filter((_, index) => index !== i))}><Trash2 size={18} aria-hidden="true" /></Button></div>; })}</div>
            <Button type="button" variant="secondary" size="sm" disabled={config[field].length >= 30} onClick={() => set(field, [...config[field], { key: `option_${crypto.randomUUID().slice(0, 8)}`, label: 'Lựa chọn mới' }])}><Plus size={16} aria-hidden="true" />Thêm lựa chọn</Button>
            <label className="tt-ownership-field mt-5"><span>Lựa chọn mặc định</span><Select aria-label="Lựa chọn mặc định" value={config.defaults[field === 'regions' ? 'region' : 'transaction']} onChange={e => answer(field === 'regions' ? 'region' : 'transaction', e.target.value)}>{config[field].map(r => <option key={r.key} value={r.key}>{r.label}</option>)}</Select></label>
          </Panel>)}
        </section>
      </fieldset>
    </div>
    {error && <p role="alert" className="tt-ownership-error">{error}</p>}
    <div className="tt-ownership-savebar"><span>{!writable ? 'Bạn đang xem cấu hình, không có quyền chỉnh sửa.' : dirty ? 'Có thay đổi chưa lưu' : <><Check size={17} aria-hidden="true" />Cấu hình đã được lưu</>}</span><div><Button type="button" variant="secondary" disabled={!writable || busy} onClick={() => setConfirmation('reset')}><RotateCcw size={17} aria-hidden="true" />Khôi phục mặc định</Button><Button type="submit" disabled={!writable || busy || !dirty}><Save size={17} aria-hidden="true" />{busy ? 'Đang lưu…' : 'Lưu cấu hình'}</Button></div></div>
    {confirmation && <ConfirmAction title={confirmation === 'save' ? 'Áp dụng cấu hình mới?' : 'Khôi phục các mức mặc định?'} description={confirmation === 'save' ? 'Các lượt tính tiếp theo sẽ sử dụng cấu hình này. Kết quả khảo sát đã lưu không bị thay đổi.' : 'Biểu mẫu sẽ trở về các mức minh họa. Chỉ áp dụng khi bạn bấm Lưu cấu hình.'} confirmLabel={confirmation === 'save' ? 'Lưu và áp dụng' : 'Khôi phục biểu mẫu'} close={() => setConfirmation(null)} confirm={() => { if (confirmation === 'save') void save(); else { setConfig(structuredClone(settings.defaults)); setEnabled(true); } }} />}
  </form>;
}

function ChoicePresets({ title, values, min, max, unit, change }: { title: string; values: number[]; min: number; max: number; unit: string; change: (values: number[]) => void }) {
  return <div className="tt-ownership-presets"><span>{title}</span><div>{values.map((value, i) => <label key={i}><Input ref={element => { element?.setCustomValidity(values.some((n, index) => index !== i && n === value) ? 'Mốc này đã tồn tại. Chọn giá trị khác.' : ''); }} aria-label={`${title} ${i + 1}`} type="number" inputMode="numeric" required min={min} max={max} step={1} value={Number.isFinite(value) ? value : ''} onChange={e => change(values.map((old, index) => index === i ? e.target.value === '' ? NaN : Number(e.target.value) : old))} /><small>{unit}</small><Button type="button" size="sm" variant="ghost" aria-label={`Bỏ ${title.toLowerCase()} ${i + 1}`} disabled={values.length <= 1} onClick={() => change(values.filter((_, index) => index !== i))}><Trash2 size={15} aria-hidden="true" /></Button></label>)}<Button type="button" size="sm" variant="secondary" disabled={values.length >= 8} onClick={() => { let next = Math.max(min - 1, ...values.filter(Number.isFinite)) + (unit === 'năm' ? 1 : 100000); if (next > max) { next = min; while (values.includes(next)) next++; } change([...values, next]); }}><Plus size={16} aria-hidden="true" />Thêm mốc</Button></div></div>;
}
