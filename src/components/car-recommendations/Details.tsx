'use client';
import { useState } from 'react';
import { Button, StatusBadge } from '@/components/ui';
import { eventLabels, groupLabels, money, needsBase, type SessionDetail } from '@/lib/car-recommendations';
import { formatDate } from '@/lib/date';
import { LoadState, Panel, useNeedsData } from './shared';
export default function Details({ id, close }: { id: string; close: () => void }) {
  const [retry, setRetry] = useState(0), resource = useNeedsData<SessionDetail>(`${needsBase}/sessions/${id}`, retry), data = resource.data;
  const answerText = (key: string, value: unknown) => {
    const q = data?.snapshot.questions.find(q => q.key === key), label = (v: unknown) => q?.options.find(o => o.key === v)?.label || String(v);
    if (key === 'budget') { const b = value as { min: number; max: number }; return `${money(b.min)} – ${money(b.max)}`; }
    if (key === 'technical') { const technical = value as Record<string, unknown> || {}; return Object.entries(technical).filter(([k, v]) => k !== 'required' && v).map(([k, v]) => `${({ brand: 'Hãng', bodyStyle: 'Kiểu dáng', transmission: 'Hộp số', fuel: 'Nhiên liệu' } as Record<string, string>)[k] || k}: ${data?.snapshot.technicalOptions?.[k]?.find(o => o.key === v)?.label || String(v)}${(technical.required as string[] || []).includes(k) ? ' (bắt buộc)' : ''}`).join('; ') || 'Không quan trọng'; }
    return Array.isArray(value) ? value.map(label).join(' → ') : value ? label(value) : 'Bỏ qua';
  };
  return <div className="space-y-5"><Button variant="secondary" onClick={close}>← Quay lại lịch sử</Button><LoadState {...resource} retry={() => setRetry(n => n + 1)} />{data && <>
    <Panel><h2 className="text-xl font-bold">Chi tiết khảo sát</h2><p className="mt-2 break-all text-sm">Mã: {data.id}</p><p className="text-sm text-[var(--muted-fg)]">{formatDate(data.createdAt)} · {Math.round(data.completionMs / 1000)} giây</p><p className="mt-4 text-sm text-[var(--muted-fg)]">Câu hỏi, câu trả lời, giá và điểm dưới đây giữ nguyên tại thời điểm khảo sát.</p>
      {data.snapshot.questions.map(q => <div className="tt-needs-answer" key={q.key}><strong className="text-sm">{q.title}</strong><span>{answerText(q.key, q.key.startsWith('custom_') ? (data.answers.extras as Record<string, unknown> || {})[q.key] : data.answers[q.key])}</span></div>)}
      <p className="mt-3 text-sm">Số ghế bắt buộc: {data.criteria.minimumSeats || 'Không'} · Ngân sách tối đa bắt buộc: {money(data.criteria.budgetMax)}</p>
    </Panel>
    <Panel><h2 className="text-lg font-semibold">Trọng số lúc khảo sát</h2><div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">{Object.entries(data.snapshot.config.weights).map(([key, n]) => <p key={key} className="text-sm">{groupLabels[key as keyof typeof groupLabels]}: <strong>{n}%</strong></p>)}</div><p className="mt-3 text-xs text-[var(--muted-fg)]">Technical không được chọn thì loại nhóm đó khỏi mẫu số; dữ liệu chưa rõ đóng góp 0. Phong cách chỉ tham khảo.</p></Panel>
    <h2 className="text-xl font-semibold">Xe đã được đề xuất</h2>{!data.snapshot.results.length && <Panel>Khảo sát này chưa có xe đáp ứng điều kiện.</Panel>}
    {data.snapshot.results.map(item => { const current = data.currentCars.find(car => car.id === item.car.id); return <Panel key={item.car.id}><div className="flex flex-wrap justify-between gap-3"><div><h3 className="font-semibold">{item.car.name}</h3><p className="mt-1">Giá lúc khảo sát: <strong>{money(item.car.price)}</strong></p></div><strong className="text-red-600">{item.score}/100 · dữ liệu {item.coverage}%</strong></div>
      <ul className="my-3 list-disc space-y-1 pl-5 text-sm">{item.reasons.map(reason => <li key={reason}>{reason}</li>)}</ul>{item.caveats.map(text => <p key={text} className="text-sm text-[var(--muted-fg)]">{text}</p>)}
      <details className="mt-3"><summary className="cursor-pointer text-sm text-red-600">Điểm từng nhóm</summary><div className="mt-2 grid gap-2 sm:grid-cols-2">{item.components.map(component => <p key={component.key} className="text-sm">{groupLabels[component.key]}: {component.score.toFixed(1)}/100 · dữ liệu {Math.round(component.coverage * 100)}% · trọng số {component.weight}%</p>)}</div></details>
      <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-[var(--border-color)] pt-4 text-sm"><span>Kho hiện tại:</span>{current && !current.deletedAt ? <><StatusBadge status={current.status} /><span>{current.isAvailable ? 'Đang bán công khai' : 'Không thuộc kho đề xuất hiện tại'}</span><span>Giá hiện tại: {money(current.price)}</span></> : <span>Xe đã xóa</span>}</div>
    </Panel>; })}
    <Panel><h2 className="text-lg font-semibold">Tương tác trên kết quả</h2>{data.events.length ? <ol className="mt-4 space-y-3">{data.events.map((event, i) => <li key={i} className="text-sm"><time>{formatDate(event.createdAt)}</time> · <strong>{eventLabels[event.type] || event.type}</strong>{event.carId && ` · ${data.snapshot.results.find(row => row.car.id === event.carId)?.car.name || event.carId}`}</li>)}</ol> : <p className="mt-3 text-[var(--muted-fg)]">Chưa có tương tác.</p>}</Panel>
  </>}</div>;
}
