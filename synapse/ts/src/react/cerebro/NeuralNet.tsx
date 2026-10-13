import { useEffect, useRef } from 'react';
import { cerebroBus, type CerebroBus } from './bus';
/** Ring index: 0 core · 1 business case · 2 use case · 3 agent · 4 tool. */
export type NeuralRing = 0 | 1 | 2 | 3 | 4;
export interface NeuralNode { id: string; name: string; ring: NeuralRing; parentId?: string | null; type?: string }
export interface NeuralLink { from: string; to: string }
export interface NeuralNetProps {
  nodes: NeuralNode[]; links?: NeuralLink[]; runningIds?: string[]; bus?: CerebroBus; mini?: boolean;
  onNodeClick?: (n: NeuralNode) => void; ringLabels?: string[]; className?: string; height?: number | string;
}
export const DEFAULT_RING_LABELS = ['Cerebro', 'Casos de negocio', 'Casos de uso', 'Agentes', 'Herramientas'];
const RING_R = [0, 0.24, 0.46, 0.7, 0.92];
type RGB = [number, number, number];
const C: Record<string, RGB> = { out: [79, 123, 255], back: [31, 191, 135], fail: [255, 77, 109], task: [34, 199, 199], core: [139, 92, 255], idle: [120, 110, 220] };
interface N extends NeuralNode { x: number; y: number; r: number; ang: number; act: number; col: RGB; ph: number; par?: N; kids: N[] }
interface E { a: N; b: N; tool?: boolean }
/** Layout: agents evenly spaced on ring 3; parents at mean angle of children; tools evenly on ring 4. Exported for tests. */
export function layoutNeural(nodes: NeuralNode[]): Map<string, number> {
  const ang = new Map<string, number>(); const kids = new Map<string, NeuralNode[]>();
  nodes.forEach((n) => { if (n.parentId) kids.set(n.parentId, [...(kids.get(n.parentId) ?? []), n]); });
  const agents = nodes.filter((n) => n.ring === 3); agents.forEach((n, i) => ang.set(n.id, (i / Math.max(agents.length, 1)) * Math.PI * 2 - Math.PI / 2));
  const tools = nodes.filter((n) => n.ring === 4); tools.forEach((n, i) => ang.set(n.id, (i / Math.max(tools.length, 1)) * Math.PI * 2 - Math.PI / 2 + 0.13));
  for (const ring of [2, 1] as const) nodes.filter((n) => n.ring === ring).forEach((n, i, arr) => {
    const ks = (kids.get(n.id) ?? []).filter((k) => ang.has(k.id));
    if (!ks.length) { ang.set(n.id, (i / Math.max(arr.length, 1)) * Math.PI * 2 - Math.PI / 2); return; }
    let sx = 0, sy = 0; ks.forEach((k) => { sx += Math.cos(ang.get(k.id)!); sy += Math.sin(ang.get(k.id)!); }); ang.set(n.id, Math.atan2(sy, sx));
  });
  nodes.filter((n) => n.ring === 0).forEach((n) => ang.set(n.id, 0));
  return ang;
}
/** Hierarchical neural network on concentric rings with action-potential cascades driven by real events. */
export function NeuralNet({ nodes, links = [], runningIds = [], bus = cerebroBus, mini = false, onNodeClick, ringLabels = DEFAULT_RING_LABELS, className, height = '100%' }: NeuralNetProps) {
  const ref = useRef<HTMLCanvasElement>(null); const run = useRef(runningIds); run.current = runningIds;
  const click = useRef(onNodeClick); click.current = onNodeClick;
  useEffect(() => {
    const cv = ref.current; const x = cv?.getContext('2d'); if (!cv || !x) return;
    const dpr = Math.min(window.devicePixelRatio || 1, mini ? 1.5 : 2); let W = 0, H = 0, raf = 0, vis = true;
    const ang = layoutNeural(nodes); const byId = new Map<string, N>();
    const ns: N[] = nodes.map((n) => { const m: N = { ...n, x: 0, y: 0, r: 0, ang: ang.get(n.id) ?? 0, act: 0, col: C.idle, ph: Math.random() * 6.28, kids: [] }; byId.set(n.id, m); return m; });
    const edges: E[] = [];
    ns.forEach((n) => { const p = n.parentId ? byId.get(n.parentId) : undefined; if (p) { n.par = p; p.kids.push(n); edges.push({ a: p, b: n }); } });
    links.forEach((l) => { const a = byId.get(l.from), b = byId.get(l.to); if (a && b) edges.push({ a, b, tool: true }); });
    let cx = 0, cy = 0, RR = 0, sx = 1;
    const place = () => { cx = W / 2; cy = H / 2; RR = Math.min((W * 0.5) / 1.55, H * 0.5) * 0.9; sx = Math.min(1.55, (W / H) * 0.9);
      ns.forEach((n) => { const r = RING_R[n.ring] * RR; n.x = cx + Math.cos(n.ang) * r * sx; n.y = cy + Math.sin(n.ang) * r; n.r = [11, 6.5, 5, 3.8, 3.2][n.ring] * dpr * (mini ? 0.65 : 1); }); };
    const rs = () => { W = cv.width = Math.max(1, cv.clientWidth * dpr); H = cv.height = Math.max(1, cv.clientHeight * dpr); place(); };
    const curve = (e: E) => { const a = e.a, b = e.b; const ma = Math.atan2((a.y + b.y) / 2 - cy, ((a.x + b.x) / 2 - cx) / sx);
      const rm = (Math.hypot((a.x - cx) / sx, a.y - cy) + Math.hypot((b.x - cx) / sx, b.y - cy)) / 2; return [a.x, a.y, cx + Math.cos(ma) * rm * sx, cy + Math.sin(ma) * rm, b.x, b.y]; };
    const Q = (P: number[], u: number) => { const q = 1 - u; return [q * q * P[0] + 2 * q * u * P[2] + u * u * P[4], q * q * P[1] + 2 * q * u * P[3] + u * u * P[5]]; };
    type Spike = { e: E; t: number; rev?: boolean; col: RGB; on?: () => void }; const spikes: Spike[] = [];
    const fire = (n: N, col: RGB) => { n.act = 1; n.col = col; };
    const edgeOf = (a: N, b: N) => edges.find((e) => (e.a === a && e.b === b) || (e.a === b && e.b === a));
    /** Cascade core → … → target (outbound), then optional backflow. */
    const cascade = (target: N, col: RGB, back?: RGB) => {
      const chain: N[] = []; let c: N | undefined = target; while (c) { chain.unshift(c); c = c.par; }
      const core = ns.find((n) => n.ring === 0); if (core && chain[0] !== core) chain.unshift(core);
      fire(chain[0], col);
      chain.slice(1).forEach((n, i) => { const e = edgeOf(chain[i], n); const done = () => { fire(n, col); if (i === chain.length - 2 && back) setTimeout(() => chain.slice().reverse().forEach((m, k) => setTimeout(() => fire(m, back), k * 180)), 500); };
        if (e) spikes.push({ e, t: -i * 0.55, rev: e.a !== chain[i], col, on: done }); else setTimeout(done, i * 400); });
      (target.kids.length ? target.kids : []).forEach((k, j) => { const e = edgeOf(target, k); if (e) spikes.push({ e, t: -(chain.length + j * 0.2) * 0.55, col, on: () => fire(k, col) }); });
    };
    const findAgent = (key?: string) => (key ? byId.get(key) ?? ns.find((n) => n.name === key) : undefined);
    const off = bus.on((ev) => { const a = findAgent(ev.agent);
      if (ev.type === 'start' && a) cascade(a, C.out); else if (ev.type === 'ok' && a) cascade(a, C.out, C.back); else if (ev.type === 'fail' && a) { fire(a, C.fail); a.par && fire(a.par, C.fail); }
      else if (ev.type === 'task') { const core = ns.find((n) => n.ring === 0); core && fire(core, C.task); } else if (ev.type === 'appr' && a) fire(a, [255, 159, 67]); });
    rs(); const ro = new ResizeObserver(rs); ro.observe(cv); const io = new IntersectionObserver(([en]) => { vis = en.isIntersecting; }); io.observe(cv);
    let hover: N | null = null;
    const lineage = (n: N) => { const s = new Set<N>([n]); let p = n.par; while (p) { s.add(p); p = p.par; } const dn = (k: N) => k.kids.forEach((c) => { s.add(c); dn(c); }); dn(n); return s; };
    const mv = (e: PointerEvent) => { const b = cv.getBoundingClientRect(); const mx = (e.clientX - b.left) * dpr, my = (e.clientY - b.top) * dpr; let best: N | null = null, bd = 18 * dpr;
      ns.forEach((n) => { const d = Math.hypot(n.x - mx, n.y - my); if (d < bd) { bd = d; best = n; } }); hover = best; cv.style.cursor = best ? 'pointer' : 'default'; };
    const lv = () => { hover = null; }; const ck = () => { if (hover) { if (hover.ring === 1 || hover.ring === 2) cascade(hover, C.out, C.back); click.current?.(hover); } };
    if (!mini) { cv.addEventListener('pointermove', mv); cv.addEventListener('pointerleave', lv); cv.addEventListener('click', ck); }
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
    let last = performance.now();
    const loop = (now: number) => {
      raf = requestAnimationFrame(loop); if (!vis) return; const dt = Math.min((now - last) / 1000, 0.05); last = now; const t = reduced ? 0 : now / 1000;
      const sel = hover ? lineage(hover) : null; const dimOf = (n: N) => (sel && !sel.has(n) ? 0.18 : 1);
      x.clearRect(0, 0, W, H);
      if (!mini) { x.strokeStyle = 'rgba(120,110,220,.12)'; x.setLineDash([2 * dpr, 6 * dpr]); x.lineWidth = dpr; RING_R.slice(1).forEach((r) => { x.beginPath(); x.ellipse(cx, cy, r * RR * sx, r * RR, 0, 0, Math.PI * 2); x.stroke(); }); x.setLineDash([]); }
      const runSet = new Set(run.current); ns.forEach((n) => { if (runSet.has(n.id) && n.act < 0.45) { n.act = 0.45; n.col = C.out; } });
      edges.forEach((e) => { const P = curve(e); const on = !!sel && sel.has(e.a) && sel.has(e.b); const a = Math.max(e.a.act, e.b.act) * 0.6;
        const al = (e.tool ? 0.07 : 0.14) * (sel && !on ? 0.35 : 1) + (on ? 0.25 : 0) + a * 0.35; const col = a > 0.05 ? (e.a.act > e.b.act ? e.a.col : e.b.col) : C.idle;
        x.strokeStyle = `rgba(${col.join(',')},${al})`; x.lineWidth = (on ? 1.8 : 1.1) * dpr * (e.tool ? 0.7 : 1); x.beginPath(); x.moveTo(P[0], P[1]); x.quadraticCurveTo(P[2], P[3], P[4], P[5]); x.stroke(); });
      x.lineCap = 'round';
      for (let i = spikes.length - 1; i >= 0; i--) { const s = spikes[i]; s.t += dt * (mini ? 1.6 : 1.25); if (s.t < 0) continue; if (s.t >= 1) { spikes.splice(i, 1); s.on?.(); continue; }
        const P = curve(s.e); const u = s.rev ? 1 - s.t : s.t; const [r, g, b] = s.col;
        for (let k = 0; k < 7; k++) { const uu = Math.max(0, Math.min(1, s.rev ? u + k * 0.022 : u - k * 0.022)); const [px, py] = Q(P, uu); x.fillStyle = `rgba(${r},${g},${b},${0.95 - k * 0.13})`; x.beginPath(); x.arc(px, py, (3.4 - k * 0.4) * dpr * (mini ? 0.7 : 1), 0, 7); x.fill(); }
        const [px, py] = Q(P, u); const gr = x.createRadialGradient(px, py, 0, px, py, 16 * dpr); gr.addColorStop(0, `rgba(${r},${g},${b},.55)`); gr.addColorStop(1, `rgba(${r},${g},${b},0)`); x.fillStyle = gr; x.fillRect(px - 16 * dpr, py - 16 * dpr, 32 * dpr, 32 * dpr); }
      ns.forEach((n) => { n.act = Math.max(0, n.act - dt * (n.ring === 0 ? 0.5 : 0.42)); const dim = dimOf(n); const e = n.act; const col = e > 0.04 ? n.col : n.ring === 0 ? C.core : C.idle; const [r, g, b] = col;
        const rr = n.r * (1 + e * 0.45 + Math.sin(t * (n.ring === 0 ? 2.2 : 1.6) + n.ph) * 0.07);
        if (e > 0.04 || n.ring === 0) { const gl = n.ring === 0 ? Math.max(e, 0.45) : e; const gr = x.createRadialGradient(n.x, n.y, 0, n.x, n.y, rr * 6); gr.addColorStop(0, `rgba(${r},${g},${b},${0.55 * gl * dim})`); gr.addColorStop(1, `rgba(${r},${g},${b},0)`); x.fillStyle = gr; x.beginPath(); x.arc(n.x, n.y, rr * 6, 0, 7); x.fill(); }
        x.fillStyle = `rgba(${r},${g},${b},${(0.5 + e * 0.5) * dim + (n === hover ? 0.4 : 0)})`; x.beginPath(); x.arc(n.x, n.y, rr, 0, 7); x.fill();
        x.fillStyle = `rgba(255,255,255,${(0.45 + e * 0.5) * dim})`; x.beginPath(); x.arc(n.x - rr * 0.28, n.y - rr * 0.28, rr * 0.3, 0, 7); x.fill(); });
      if (mini) return;
      x.textAlign = 'center'; x.textBaseline = 'middle';
      ringLabels.slice(1).forEach((l, i) => { x.font = `600 ${9.5 * dpr}px Inter, sans-serif`; x.fillStyle = 'rgba(110,110,160,.55)'; x.fillText(l.toUpperCase(), cx, cy - RING_R[i + 1] * RR - 8 * dpr); });
      ns.forEach((n) => { if (n.ring === 0 || n.ring === 3) return; const lit = n.act > 0.15 || (sel && sel.has(n)); if (n.ring === 4 && !lit) return; const d = dimOf(n);
        x.font = `${n.ring === 1 ? 600 : 500} ${(n.ring === 1 ? 11.5 : 10) * dpr}px Inter, sans-serif`; x.fillStyle = lit ? `rgba(${n.col.join(',')},${0.95 * d})` : `rgba(80,84,120,${0.6 * d})`;
        const o = n.r + 9 * dpr, k = n.ring === 1 ? 1.6 : 1.3; x.fillText(n.name.length > 28 ? n.name.slice(0, 27) + '…' : n.name, n.x + Math.cos(n.ang) * o * k, n.y + Math.sin(n.ang) * o * k); });
      const core = ns.find((n) => n.ring === 0); if (core) { x.font = `600 ${10 * dpr}px Inter, sans-serif`; x.fillStyle = 'rgba(110,100,200,.85)'; x.fillText(core.name.toUpperCase(), cx, cy + core.r + 14 * dpr); }
      if (hover) { const h0 = hover as N; const lines = [h0.name, h0.type ?? ringLabels[h0.ring]]; x.font = `600 ${12 * dpr}px Inter, sans-serif`;
        const w = Math.max(...lines.map((l) => x.measureText(l).width)) + 24 * dpr, h = (lines.length * 16 + 14) * dpr; let tx = h0.x + 14 * dpr, ty = h0.y - h - 10 * dpr; if (tx + w > W) tx = h0.x - w - 14 * dpr; if (ty < 0) ty = h0.y + 14 * dpr;
        x.fillStyle = 'rgba(255,255,255,.94)'; x.shadowColor = 'rgba(40,30,120,.25)'; x.shadowBlur = 20 * dpr; x.beginPath(); x.roundRect ? x.roundRect(tx, ty, w, h, 10 * dpr) : x.rect(tx, ty, w, h); x.fill(); x.shadowBlur = 0; x.textAlign = 'left';
        lines.forEach((l, i) => { x.font = `${i ? 400 : 600} ${(i ? 10.5 : 12) * dpr}px Inter, sans-serif`; x.fillStyle = i ? 'rgba(80,84,120,.9)' : '#14152e'; x.fillText(l, tx + 12 * dpr, ty + (15 + i * 16) * dpr); }); }
    };
    raf = requestAnimationFrame(loop);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); off(); cv.removeEventListener('pointermove', mv); cv.removeEventListener('pointerleave', lv); cv.removeEventListener('click', ck); };
  }, [nodes, links, bus, mini, ringLabels]);
  return <canvas ref={ref} className={'cerebro-nnet' + (className ? ' ' + className : '')} style={{ width: '100%', height, display: 'block' }} aria-label="Red neuronal de Cerebro" role="img" />;
}
