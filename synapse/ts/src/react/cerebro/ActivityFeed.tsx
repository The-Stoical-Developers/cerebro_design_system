import { AnimatePresence, motion } from 'framer-motion';
export interface ActivityItem { id: string; title: string; detail?: string; at: string | number | Date; tone?: 'info' | 'success' | 'warning' | 'danger' | 'accent'; onClick?: () => void }
export function relTime(at: ActivityItem['at'], now = Date.now()): string {
  const t = new Date(at).getTime(); if (!Number.isFinite(t)) return '';
  const s = Math.round((now - t) / 1000); if (s < 60) return 'ahora'; const m = Math.round(s / 60); if (m < 60) return `hace ${m} min`;
  const h = Math.round(m / 60); if (h < 24) return `hace ${h} h`; return `hace ${Math.round(h / 24)} d`;
}
/** Live activity feed — new items slide in at the top. */
export function ActivityFeed({ items, max = 12, emptyText = 'Sin actividad reciente' }: { items: ActivityItem[]; max?: number; emptyText?: string }) {
  return (
    <ol style={{ listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 2 }} aria-live="polite">
      <AnimatePresence initial={false}>
        {items.slice(0, max).map((it) => (
          <motion.li key={it.id} layout initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            onClick={it.onClick} style={{ display: 'flex', gap: 10, padding: '8px 6px', borderRadius: 10, cursor: it.onClick ? 'pointer' : undefined }}>
            <span style={{ width: 8, height: 8, marginTop: 6, borderRadius: '50%', flex: 'none', background: `var(--g-${it.tone ?? 'accent'})` }} />
            <div style={{ minWidth: 0, flex: 1 }}>
              <div style={{ fontSize: 13, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{it.title}</div>
              {it.detail && <small className="g-muted" style={{ display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{it.detail}</small>}
            </div>
            <small className="g-muted g-mono" style={{ flex: 'none', fontSize: 11 }}>{relTime(it.at)}</small>
          </motion.li>
        ))}
      </AnimatePresence>
      {!items.length && <li className="g-muted" style={{ padding: 8 }}>{emptyText}</li>}
    </ol>
  );
}
