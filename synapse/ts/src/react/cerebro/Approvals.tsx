"use client";

import { AnimatePresence, motion } from 'framer-motion';
import { GlassButton } from '@the-stoical-developers/ds-glass/react';
export interface ApprovalItem { id: string; title: string; detail?: string; requestedBy?: string; at?: string | number | Date }
export interface ApprovalsListProps { items: ApprovalItem[]; onApprove?: (id: string) => void; onReject?: (id: string) => void; onOpen?: (id: string) => void; busyId?: string | null; emptyText?: string }
/** Pending human-in-the-loop approvals with approve/reject actions. */
export function ApprovalsList({ items, onApprove, onReject, onOpen, busyId, emptyText = 'No hay aprobaciones pendientes' }: ApprovalsListProps) {
  return (
    <div className="appr" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <AnimatePresence initial={false}>
        {items.map((a) => (
          <motion.div key={a.id} layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 30 }} transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            style={{ display: 'flex', gap: 10, alignItems: 'center', padding: '10px 12px', borderRadius: 12, background: 'var(--g-hover)', border: '1px solid var(--g-border)' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--g-warning)', boxShadow: '0 0 0 4px color-mix(in srgb,var(--g-warning) 18%,transparent)', flex: 'none' }} />
            <div style={{ flex: 1, minWidth: 0, cursor: onOpen ? 'pointer' : undefined }} onClick={() => onOpen?.(a.id)}>
              <div style={{ fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.title}</div>
              {(a.detail || a.requestedBy) && <small className="g-muted">{[a.requestedBy, a.detail].filter(Boolean).join(' · ')}</small>}
            </div>
            {onReject && <GlassButton variant="ghost" disabled={busyId === a.id} onClick={() => onReject(a.id)}>Rechazar</GlassButton>}
            {onApprove && <GlassButton variant="primary" disabled={busyId === a.id} onClick={() => onApprove(a.id)}>Aprobar</GlassButton>}
          </motion.div>
        ))}
      </AnimatePresence>
      {!items.length && <small className="g-muted">{emptyText}</small>}
    </div>
  );
}
