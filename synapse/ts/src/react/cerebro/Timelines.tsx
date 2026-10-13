"use client";

import { motion } from 'framer-motion';
export type RunStatus = 'queued' | 'running' | 'succeeded' | 'failed' | 'waiting' | 'cancelled';
const COL: Record<RunStatus, string> = { queued: 'var(--g-text-3)', running: 'var(--g-info)', succeeded: 'var(--g-success)', failed: 'var(--g-danger)', waiting: 'var(--g-warning)', cancelled: 'var(--g-text-3)' };
export const runStatusColor = (s: RunStatus) => COL[s] ?? COL.queued;
export interface TimelineRun { id: string; label: string; status: RunStatus; start: string | number | Date; end?: string | number | Date | null; onClick?: () => void }
/** Gantt-style run timeline over a window (default: last 2h). Running bars grow to "now". */
export function RunTimeline({ runs, windowMs = 2 * 3600e3, now = Date.now(), rowHeight = 26 }: { runs: TimelineRun[]; windowMs?: number; now?: number; rowHeight?: number }) {
  const from = now - windowMs;
  return (
    <div style={{ position: 'relative' }}>
      {runs.map((r, i) => {
        const s = Math.max(new Date(r.start).getTime(), from); const e = r.end ? new Date(r.end).getTime() : now;
        const left = ((s - from) / windowMs) * 100; const w = Math.max(((e - s) / windowMs) * 100, 0.8);
        return (
          <div key={r.id} onClick={r.onClick} style={{ display: 'grid', gridTemplateColumns: '160px 1fr', alignItems: 'center', height: rowHeight, gap: 10, cursor: r.onClick ? 'pointer' : undefined }}>
            <small style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{r.label}</small>
            <div style={{ position: 'relative', height: 8, background: 'var(--g-hover)', borderRadius: 99 }}>
              <motion.div title={`${r.label} · ${r.status}`} initial={{ width: 0 }} animate={{ width: `${Math.min(w, 100 - left)}%` }} transition={{ duration: 0.9, delay: i * 0.03, ease: [0.16, 1, 0.3, 1] }}
                style={{ position: 'absolute', left: `${left}%`, top: 0, bottom: 0, borderRadius: 99, background: runStatusColor(r.status), boxShadow: r.status === 'running' ? `0 0 12px ${runStatusColor(r.status)}` : undefined }} />
            </div>
          </div>
        );
      })}
      {!runs.length && <small className="g-muted">Sin ejecuciones en la ventana</small>}
    </div>
  );
}
export interface ScheduledItem { id: string; label: string; at: string | number | Date; tone?: string }
/** 24h scheduler strip: upcoming scheduled jobs as dots on a day axis, with a live "now" needle. */
export function SchedulerTimeline({ items, now = Date.now(), hours = 24 }: { items: ScheduledItem[]; now?: number; hours?: number }) {
  const span = hours * 3600e3; const from = now - span * 0.25;
  const pct = (t: number) => ((t - from) / span) * 100;
  return (
    <div style={{ position: 'relative', height: 64 }}>
      <div style={{ position: 'absolute', left: 0, right: 0, top: 30, height: 2, background: 'var(--g-border-strong)', borderRadius: 2 }} />
      {Array.from({ length: 7 }, (_, k) => { const t = from + (span / 6) * k; return <small key={k} className="g-muted g-mono" style={{ position: 'absolute', top: 40, left: `${(k / 6) * 100}%`, transform: 'translateX(-50%)', fontSize: 10 }}>{new Date(t).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</small>; })}
      <div aria-label="ahora" style={{ position: 'absolute', top: 14, height: 34, width: 2, left: `${pct(now)}%`, background: 'var(--g-accent)', boxShadow: '0 0 10px var(--g-accent)' }} />
      {items.map((it, i) => { const t = new Date(it.at).getTime(); const p = pct(t); if (p < 0 || p > 100) return null;
        return <motion.div key={it.id} title={`${it.label} · ${new Date(t).toLocaleString('es-ES')}`} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: i * 0.04 }}
          style={{ position: 'absolute', top: 25, left: `${p}%`, width: 12, height: 12, marginLeft: -6, borderRadius: '50%', background: it.tone ?? 'var(--g-info)', border: '2px solid var(--g-card-strong)' }} />; })}
    </div>
  );
}
