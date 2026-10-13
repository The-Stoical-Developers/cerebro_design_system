"use client";

import { Odometer } from '@the-stoical-developers/ds-glass/react';
export interface KpiCardProps { label: string; value: number; decimals?: number; suffix?: string; delta?: number; deltaLabel?: string; spark?: number[]; tone?: 'accent' | 'info' | 'success' | 'warning' | 'danger' }
export function Sparkline({ data, color = 'var(--g-accent)', width = 120, height = 32 }: { data: number[]; color?: string; width?: number; height?: number }) {
  if (data.length < 2) return null;
  const min = Math.min(...data), max = Math.max(...data), span = max - min || 1;
  const pts = data.map((v, i) => `${(i / (data.length - 1)) * width},${height - ((v - min) / span) * (height - 4) - 2}`).join(' ');
  return <svg width={width} height={height} aria-hidden><polyline points={pts} fill="none" stroke={color} strokeWidth={1.8} strokeLinejoin="round" strokeLinecap="round" /></svg>;
}
/** KPI tile with rolling odometer value, delta and sparkline. */
export function KpiCard({ label, value, decimals = 0, suffix, delta, deltaLabel, spark, tone = 'accent' }: KpiCardProps) {
  const up = (delta ?? 0) >= 0;
  return (
    <div className="g-card g-card--pad" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--g-text-3)' }}>{label}</div>
      <div className="g-display" style={{ fontSize: 34, letterSpacing: '-.045em', lineHeight: 1.05 }}>
        <Odometer value={value} decimals={decimals} />{suffix && <span style={{ fontSize: 18, marginLeft: 4, color: 'var(--g-text-2)' }}>{suffix}</span>}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        {delta != null ? <small style={{ color: up ? 'var(--g-success)' : 'var(--g-danger)' }}>{up ? '▲' : '▼'} {Math.abs(delta).toLocaleString('es-ES')}{deltaLabel ? ` ${deltaLabel}` : ''}</small> : <span />}
        {spark && <Sparkline data={spark} color={`var(--g-${tone})`} />}
      </div>
    </div>
  );
}
