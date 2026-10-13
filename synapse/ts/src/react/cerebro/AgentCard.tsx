"use client";

import { AnimatePresence, motion } from 'framer-motion';
import { GlassBadge, type GlassTone } from '@the-stoical-developers/ds-glass/react';
import { ProgressRing } from './ProgressRing';
export type AgentState = 'idle' | 'running' | 'waiting' | 'failed' | 'succeeded' | 'disabled';
const TONE: Record<AgentState, GlassTone> = { idle: 'neutral', running: 'info', waiting: 'warning', failed: 'danger', succeeded: 'success', disabled: 'neutral' };
const LABEL: Record<AgentState, string> = { idle: 'En espera', running: 'Ejecutando', waiting: 'Aprobación', failed: 'Fallo', succeeded: 'Completado', disabled: 'Desactivado' };
export interface LogLine { id: string; text: string; level?: 'info' | 'warn' | 'error'; at?: string }
export function LogStream({ lines, max = 4 }: { lines: LogLine[]; max?: number }) {
  const shown = lines.slice(-max);
  return (
    <div className="g-mono" style={{ fontSize: 11, lineHeight: 1.5, color: 'var(--g-text-2)', minHeight: max * 16, overflow: 'hidden' }} aria-live="polite">
      <AnimatePresence initial={false}>
        {shown.map((l) => (
          <motion.div key={l.id} layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.35 }}
            style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', color: l.level === 'error' ? 'var(--g-danger)' : l.level === 'warn' ? 'var(--g-warning)' : undefined }}>
            <span className="g-muted">› </span>{l.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
export interface AgentCardProps {
  id: string; name: string; role?: string; state: AgentState; progress?: number; runs?: number; successRate?: number;
  lines?: LogLine[]; href?: string; onClick?: () => void; footer?: React.ReactNode;
}
/** Agent tile: status badge, progress ring, live log stream. `data-agent` lets the mascot/beams target it. */
export function AgentCard({ id, name, role, state, progress, runs, successRate, lines = [], onClick, footer }: AgentCardProps) {
  return (
    <motion.div layout data-agent={id} className="g-card g-card--pad" onClick={onClick} style={{ cursor: onClick ? 'pointer' : undefined, display: 'flex', flexDirection: 'column', gap: 10 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <ProgressRing value={progress ?? (state === 'succeeded' ? 1 : 0)} color={`var(--g-${TONE[state] === 'neutral' ? 'accent' : TONE[state]})`} label={`Progreso ${name}`}>
          {state === 'running' ? <span className="g-spin" style={{ width: 10, height: 10, borderRadius: '50%', border: '2px solid var(--g-info)', borderTopColor: 'transparent', display: 'inline-block' }} /> : undefined}
        </ProgressRing>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{name}</div>
          {role && <div className="g-muted" style={{ fontSize: 12, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{role}</div>}
        </div>
        <GlassBadge tone={TONE[state]}>{LABEL[state]}</GlassBadge>
      </div>
      {lines.length > 0 && <LogStream lines={lines} />}
      {(runs != null || successRate != null) && (
        <div style={{ display: 'flex', gap: 16, fontSize: 12 }} className="g-muted">
          {runs != null && <span><b style={{ color: 'var(--g-text)' }}>{runs}</b> ejecuciones</span>}
          {successRate != null && <span><b style={{ color: 'var(--g-text)' }}>{Math.round(successRate * 100)}%</b> éxito</span>}
        </div>
      )}
      {footer}
    </motion.div>
  );
}
