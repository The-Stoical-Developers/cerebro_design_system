"use client";

import { AnimatePresence, LayoutGroup, motion } from 'framer-motion';
import type { Quadrant } from './bus';
export interface MatrixTask { id: string; title: string; urgent: boolean; important: boolean; meta?: string; fresh?: boolean; onClick?: () => void }
export const QUADRANTS: { key: Quadrant; title: string; hint: string; tone: string }[] = [
  { key: 'hacer', title: 'Hacer', hint: 'Urgente · Importante', tone: 'var(--g-danger)' },
  { key: 'planificar', title: 'Planificar', hint: 'No urgente · Importante', tone: 'var(--g-info)' },
  { key: 'delegar', title: 'Delegar', hint: 'Urgente · No importante', tone: 'var(--g-warning)' },
  { key: 'eliminar', title: 'Eliminar', hint: 'No urgente · No importante', tone: 'var(--g-text-3)' },
];
export function quadrantOf(t: Pick<MatrixTask, 'urgent' | 'important'>): Quadrant {
  return t.important ? (t.urgent ? 'hacer' : 'planificar') : t.urgent ? 'delegar' : 'eliminar';
}
/** Eisenhower matrix with animated task cards (tasks glide between quadrants on reclassification). */
export function EisenhowerMatrix({ tasks, maxPerQuadrant = 6, emptyText = 'Sin tareas' }: { tasks: MatrixTask[]; maxPerQuadrant?: number; emptyText?: string }) {
  return (
    <LayoutGroup id="eisenhower">
      <div className="matrix" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        {QUADRANTS.map((q) => {
          const items = tasks.filter((t) => quadrantOf(t) === q.key);
          return (
            <section key={q.key} className={`q-${q.key}`} aria-label={q.title} style={{ background: 'var(--g-hover)', border: '1px solid var(--g-border)', borderRadius: 14, padding: 12, minHeight: 140 }}>
              <header className="ql" style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
                <i style={{ width: 8, height: 8, borderRadius: '50%', background: q.tone, display: 'inline-block' }} />
                <b>{q.title}</b><small className="g-muted">{q.hint}</small>
                <span className="g-mono g-muted" style={{ marginLeft: 'auto', fontSize: 11 }}>{items.length}</span>
              </header>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <AnimatePresence initial={false}>
                  {items.slice(0, maxPerQuadrant).map((t) => (
                    <motion.div key={t.id} layoutId={`task-${t.id}`} className={'task' + (t.fresh ? ' g-fresh' : '')} onClick={t.onClick}
                      initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.96 }} transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                      style={{ background: 'var(--g-card-strong)', border: '1px solid var(--g-border-strong)', borderRadius: 12, padding: '8px 10px', cursor: t.onClick ? 'pointer' : undefined, fontSize: 12.5 }}>
                      <div style={{ fontWeight: 500 }}>{t.title}</div>{t.meta && <small className="g-muted">{t.meta}</small>}
                    </motion.div>
                  ))}
                </AnimatePresence>
                {items.length > maxPerQuadrant && <small className="g-muted">+{items.length - maxPerQuadrant} más</small>}
                {!items.length && <small className="g-muted">{emptyText}</small>}
              </div>
            </section>
          );
        })}
      </div>
    </LayoutGroup>
  );
}
