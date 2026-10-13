import { motion } from 'framer-motion';
export interface ProgressRingProps { value: number; size?: number; stroke?: number; color?: string; label?: string; children?: React.ReactNode }
/** Animated circular progress (0..1). */
export function ProgressRing({ value, size = 44, stroke = 4, color = 'var(--g-accent)', label, children }: ProgressRingProps) {
  const v = Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0)); const r = (size - stroke) / 2; const c = 2 * Math.PI * r;
  return (
    <div role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(v * 100)} aria-label={label} style={{ position: 'relative', width: size, height: size, flex: 'none' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--g-border-strong)" strokeWidth={stroke} />
        <motion.circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round" strokeDasharray={c}
          initial={false} animate={{ strokeDashoffset: c * (1 - v) }} transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }} />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', fontSize: size * 0.26, fontWeight: 600 }}>{children ?? `${Math.round(v * 100)}`}</div>
    </div>
  );
}
