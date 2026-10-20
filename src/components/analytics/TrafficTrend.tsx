'use client';

import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import type { AnalyticsTrafficRow } from '@/lib/api/analytics';

interface TrafficTrendProps {
  rows: AnalyticsTrafficRow[];
  bucket?: 'minute' | 'hour' | 'day';
}
const number = (value: number) => value.toLocaleString('vi-VN', { maximumFractionDigits: 0 });

function timeLabel(timestamp: number, daily: boolean) {
  const zone = daily ? 'UTC' : 'Asia/Ho_Chi_Minh';
  const day = new Intl.DateTimeFormat('vi-VN', { timeZone: zone, day: '2-digit', month: '2-digit' }).format(timestamp);
  const full = new Intl.DateTimeFormat('vi-VN', { timeZone: zone, day: '2-digit', month: '2-digit', year: 'numeric',
    ...(!daily ? { hour: '2-digit', minute: '2-digit', hourCycle: 'h23' as const } : {}) }).format(timestamp);
  const hour = daily ? null : new Intl.DateTimeFormat('vi-VN', { timeZone: zone, hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }).format(timestamp);
  return { day, hour, full };
}

function scaleFor(max: number) {
  const rough = Math.max(1, max / 4);
  const magnitude = 10 ** Math.floor(Math.log10(rough));
  const fraction = rough / magnitude;
  const step = Math.ceil((fraction <= 1 ? 1 : fraction <= 2 ? 2 : fraction <= 2.5 ? 2.5 : fraction <= 5 ? 5 : 10) * magnitude);
  const ceiling = Math.max(step, Math.ceil(max / step) * step);
  return { ceiling, ticks: Array.from({ length: Math.round(ceiling / step) + 1 }, (_, index) => index * step) };
}

export default function TrafficTrend({ rows, bucket }: TrafficTrendProps) {
  const [activeName, setActiveName] = useState<string | null>(null);
  const root = useRef<HTMLDivElement>(null);
  const tooltipId = useId();
  useEffect(() => {
    const dismiss = (event: PointerEvent) => {
      if (event.target instanceof Node && !root.current?.contains(event.target)) setActiveName(null);
    };
    document.addEventListener('pointerdown', dismiss);
    return () => document.removeEventListener('pointerdown', dismiss);
  }, []);

  const daily = bucket === 'day';
  const step = daily ? 86400_000 : bucket === 'minute' ? 60_000 : 3600_000;
  const first = Date.parse(rows[0].name);
  const columns = Math.max(1, Math.round((Date.parse(rows[rows.length - 1].name) - first) / step) + 1);
  const max = Math.max(0, ...rows.flatMap(row => [row.count, row.visits ?? 0]));
  const { ceiling, ticks } = scaleFor(max);
  const xTicks = [...new Set([0, 0.25, 0.5, 0.75, 1].map(fraction => Math.round((columns - 1) * fraction)))];
  const columnFor = (name: string) => Math.round((Date.parse(name) - first) / step);
  const positionFor = (column: number) => (column + 0.5) / columns * 100;
  const active = rows.find(row => row.name === activeName);

  function navigate(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    if (event.key === 'Escape') { setActiveName(null); return; }
    const next = event.key === 'ArrowRight' ? Math.min(rows.length - 1, index + 1)
      : event.key === 'ArrowLeft' ? Math.max(0, index - 1) : event.key === 'Home' ? 0 : event.key === 'End' ? rows.length - 1 : null;
    if (next === null) return;
    event.preventDefault();
    event.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[data-traffic-point]')[next]?.focus();
  }

  return <div ref={root} className="h-full min-h-0 flex flex-col">
    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-[var(--muted-fg)] mb-3">
      <span><span className="inline-block w-2 h-2 rounded-sm bg-blue-500 mr-1" />Lượt xem trang</span>
      <span><span className="inline-block w-2 h-2 rounded-sm bg-emerald-500 mr-1" />Lượt truy cập</span>
    </div>
    <div className="text-[11px] text-[var(--muted-fg)] mb-2">Số lượt</div>
    <div className="flex-1 min-h-0 grid" style={{ gridTemplateColumns: `${Math.max(40, number(ceiling).length * 6 + 8)}px minmax(0, 1fr)`, gridTemplateRows: 'minmax(0, 1fr) 42px 16px' }}>
      <div className="relative text-[11px] text-[var(--muted-fg)]" role="group" aria-label="Trục số lượt">
        {ticks.map(value => <span key={value} className="absolute right-2 -translate-y-1/2 tabular-nums" style={{ top: `${(1 - value / ceiling) * 100}%` }}>{number(value)}</span>)}
      </div>
      <div data-traffic-plot className="relative min-w-0 border-l border-b border-[var(--border-color)]"
        onPointerLeave={event => { if (event.pointerType !== 'touch') setActiveName(null); }}>
        <div className="absolute inset-0 pointer-events-none" aria-hidden="true">
          {ticks.filter(value => value > 0).map(value => <div key={value} className="absolute left-0 right-0 border-t border-dashed border-[var(--border-color)]" style={{ top: `${(1 - value / ceiling) * 100}%` }} />)}
        </div>
        <div className="absolute inset-0 grid items-end" style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, gridTemplateRows: 'minmax(0, 1fr)', columnGap: '0.15%' }} role="group" aria-label="Xu hướng lượt xem trang và lượt truy cập">
          {rows.map((row, index) => {
            const label = `${timeLabel(Date.parse(row.name), daily).full}: ${number(row.count)} lượt xem, ${row.visits === null ? 'chưa có dữ liệu lượt truy cập' : `${number(row.visits)} lượt truy cập`}`;
            return <button key={row.name} data-traffic-point type="button" aria-label={label} aria-describedby={active?.name === row.name ? tooltipId : undefined}
              tabIndex={active ? active.name === row.name ? 0 : -1 : index === 0 ? 0 : -1}
              className={`min-w-0 w-full h-full flex items-end justify-self-center rounded-t focus-visible:outline-2 focus-visible:outline-blue-700 ${active?.name === row.name ? 'bg-blue-500/10' : 'hover:bg-blue-500/5'}`}
              style={{ gridColumn: columnFor(row.name) + 1, gridRow: 1, columnGap: '3%', maxWidth: 56 }}
              onPointerEnter={event => { if (event.pointerType !== 'touch') setActiveName(row.name); }}
              onPointerLeave={event => { if (event.pointerType !== 'touch') setActiveName(null); }}
              onFocus={() => setActiveName(row.name)} onBlur={() => setActiveName(null)} onClick={() => setActiveName(row.name)} onKeyDown={event => navigate(event, index)}>
              <span className="flex-1 rounded-t bg-blue-500" style={{ height: `${row.count / ceiling * 100}%` }} />
              {row.visits !== null && <span className="flex-1 rounded-t bg-emerald-500" style={{ height: `${row.visits / ceiling * 100}%` }} />}
            </button>;
          })}
        </div>
        {active && <div id={tooltipId} role="tooltip" className="absolute top-2 z-10 pointer-events-none rounded-lg border border-[var(--border-color)] bg-[var(--card-bg)] p-3 shadow-lg text-xs"
          style={{ width: 'min(220px, 100%)', left: `clamp(0px, calc(${positionFor(columnFor(active.name))}% - 110px), max(0px, calc(100% - 220px)))` }}>
          <p className="font-semibold mb-2">{timeLabel(Date.parse(active.name), daily).full}</p>
          <dl className="space-y-1">
            <div className="flex justify-between gap-2"><dt><span className="inline-block w-2 h-2 rounded-sm bg-blue-500 mr-1" />Lượt xem trang</dt><dd className="font-semibold tabular-nums">{number(active.count)}</dd></div>
            <div className="flex justify-between gap-2"><dt><span className="inline-block w-2 h-2 rounded-sm bg-emerald-500 mr-1" />Lượt truy cập</dt><dd className="font-semibold tabular-nums">{active.visits === null ? 'Chưa có dữ liệu' : number(active.visits)}</dd></div>
          </dl>
        </div>}
      </div>
      <div aria-hidden="true" />
      <div className="relative text-[11px] text-[var(--muted-fg)]" role="group" aria-label="Trục thời gian">
        {xTicks.map((column, index) => {
          const label = timeLabel(first + column * step, daily);
          const mobileHidden = xTicks.length > 3 && index !== 0 && index !== Math.floor(xTicks.length / 2) && index !== xTicks.length - 1;
          return <div key={column} className={mobileHidden ? 'hidden sm:block' : ''}>
            <span aria-hidden="true" className="absolute top-0 h-1.5 border-l border-[var(--border-color)]" style={{ left: `${positionFor(column)}%` }} />
            <span className="absolute top-2 w-[52px] text-center leading-4 tabular-nums" style={{ left: `clamp(0px, calc(${positionFor(column)}% - 26px), calc(100% - 52px))` }}>
              {label.hour && <span className="block">{label.hour}</span>}<span className="block">{label.day}</span>
            </span>
          </div>;
        })}
      </div>
      <div className="col-span-2 text-center text-[11px] text-[var(--muted-fg)]">Thời gian · Giờ Việt Nam</div>
    </div>
  </div>;
}
