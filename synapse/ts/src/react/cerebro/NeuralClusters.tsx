"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { brandInitials, resolveBrand } from './brandLogos';

/**
 * NeuralClusters — Cerebro "red neuronal" as five living clusters that talk to each other:
 *   agents (Tú at the centre, one concentric ring per hierarchy level) · read tools (QUERY) ·
 *   write tools (COMMAND) · MCP servers · connections (with bundled brand logos).
 *
 * Purely presentational: the host passes REAL nodes/edges/events. Nothing is simulated —
 * idle state is calm; pulses only travel when an `events` entry arrives, and only nodes that
 * are active (activeIds + their ancestors) or on a live impulse path get a label.
 */
export type ClusterKind = 'agents' | 'read' | 'write' | 'mcp' | 'connections';
export interface ClusterNode {
  id: string; label: string; cluster: ClusterKind;
  /** Agents cluster only: hierarchy parent (root has none). */
  parentId?: string | null;
  /** Agents cluster only: agent outside the org hierarchy (no parent, not the root). Drawn apart, never on a ring. */
  detached?: boolean;
  /** Agents: org role label (e.g. "Director") and status (e.g. "activo", "archivado") shown in the side panel. */
  role?: string;
  status?: string;
  /** Dimmed (e.g. archived org positions kept only to show the structure). */
  muted?: boolean;
  /** Free-form subtitle shown in the tooltip (role, transport, type…). */
  kind?: string;
  /** Service hint for the logo (connection_type, server name). Falls back to initials. */
  brand?: string | null;
}
export interface ClusterEdge { from: string; to: string }
export interface ClusterEvent {
  /** Stable unique id; an event is played once. */
  id: string;
  /** Node ids the impulse travels through, e.g. [agent, tool, mcp, connection]. */
  path: string[];
  /** start: outbound only · ok/error: outbound then result flows back (green / red). */
  status?: 'start' | 'ok' | 'error';
}
export interface NeuralClustersProps {
  nodes: ClusterNode[]; edges?: ClusterEdge[]; events?: ClusterEvent[];
  /** Nodes that are live right now (e.g. running agents). Their agent ancestors light up too. */
  activeIds?: string[];
  mini?: boolean; height?: number | string; className?: string; style?: CSSProperties;
  onNodeClick?: (n: ClusterNode) => void;
  clusterLabels?: Partial<Record<ClusterKind, string>>;
  showLegend?: boolean;
  /** 3D: URL of an agent's detail page. Selecting a node never navigates; a "ver ficha" button opens this href. */
  agentHref?: (n: ClusterNode) => string | undefined;
  /** 3D: called when the "ver ficha" button is activated (use for client-side routing; default navigation is prevented). */
  onOpenAgent?: (n: ClusterNode) => void;
}

export const CLUSTER_ORDER: ClusterKind[] = ['agents', 'read', 'write', 'mcp', 'connections'];
export const DEFAULT_CLUSTER_LABELS: Record<ClusterKind, string> = {
  agents: 'Agentes', read: 'Herramientas de lectura', write: 'Herramientas de escritura', mcp: 'Servidores MCP', connections: 'Conexiones',
};
type RGB = [number, number, number];
export const CLUSTER_COLORS: Record<ClusterKind, RGB> = {
  agents: [139, 92, 255], read: [34, 199, 199], write: [255, 158, 67], mcp: [79, 123, 255], connections: [236, 72, 153],
};
const OK: RGB = [31, 191, 135]; const ERR: RGB = [255, 77, 109];
/** Cluster centres as fractions of the canvas (x of width, y of height). */
const CENTRES: Record<ClusterKind, [number, number]> = {
  agents: [0.27, 0.5], read: [0.565, 0.28], write: [0.565, 0.75], mcp: [0.735, 0.5], connections: [0.895, 0.5],
};

/** Depth of each agents-cluster node (root = 0). Exported for tests. */
export function agentLevels(nodes: ClusterNode[]): Map<string, number> {
  const byId = new Map(nodes.filter((n) => n.cluster === 'agents' && !n.detached).map((n) => [n.id, n]));
  const lv = new Map<string, number>();
  const depth = (id: string, guard = 0): number => {
    if (lv.has(id)) return lv.get(id)!;
    const n = byId.get(id); const p = n?.parentId && byId.has(n.parentId) ? n.parentId : null;
    const d = p && guard < 64 ? depth(p, guard + 1) + 1 : 0; lv.set(id, d); return d;
  };
  byId.forEach((_, id) => depth(id));
  return lv;
}

/** Ids of `ids` plus all their agent ancestors. Exported for tests. */
export function withAncestors(ids: Iterable<string>, nodes: ClusterNode[]): Set<string> {
  const par = new Map(nodes.map((n) => [n.id, n.parentId ?? null]));
  const out = new Set<string>();
  for (const id of ids) { let c: string | null = id; let g = 0; while (c && !out.has(c) && g++ < 64) { out.add(c); c = par.get(c) ?? null; } }
  return out;
}

/** Human lineage for tooltips: agent chain to the root, or who uses a tool/MCP/connection. Exported for tests. */
export function lineageOf(id: string, nodes: ClusterNode[], edges: ClusterEdge[]): string[] {
  const byId = new Map(nodes.map((n) => [n.id, n])); const n = byId.get(id); if (!n) return [];
  if (n.cluster === 'agents') {
    const chain: string[] = []; let c: ClusterNode | undefined = n; let g = 0;
    while (c && g++ < 64) { chain.unshift(c.label); c = c.parentId ? byId.get(c.parentId) : undefined; }
    const tools = edges.filter((e) => e.from === id).map((e) => byId.get(e.to)).filter((t): t is ClusterNode => !!t && t.cluster !== 'agents');
    return [chain.join(' › '), ...(tools.length ? [`Usa: ${tools.slice(0, 6).map((t) => t.label).join(', ')}${tools.length > 6 ? ` +${tools.length - 6}` : ''}`] : [])];
  }
  const ins = edges.filter((e) => e.to === id).map((e) => byId.get(e.from)).filter((x): x is ClusterNode => !!x);
  const outs = edges.filter((e) => e.from === id).map((e) => byId.get(e.to)).filter((x): x is ClusterNode => !!x);
  const fmt = (xs: ClusterNode[], k: ClusterKind[]) => xs.filter((x) => k.includes(x.cluster)).map((x) => x.label);
  const lines: string[] = [];
  const users = fmt(ins, ['agents']); if (users.length) lines.push(`Agentes: ${users.slice(0, 5).join(', ')}${users.length > 5 ? ` +${users.length - 5}` : ''}`);
  const tools = fmt(ins, ['read', 'write']); if (tools.length) lines.push(`Herramientas: ${tools.slice(0, 5).join(', ')}${tools.length > 5 ? ` +${tools.length - 5}` : ''}`);
  const mcps = fmt([...ins, ...outs], ['mcp']); if (mcps.length) lines.push(`MCP: ${mcps.join(', ')}`);
  const conns = fmt(outs, ['connections']); if (conns.length) lines.push(`Conexión: ${conns.join(', ')}`);
  return lines;
}

interface Pos { x: number; y: number; r: number }
/**
 * Deterministic layout in pixel space. Agents: concentric rings by level, leaves spread in DFS
 * order so subtrees stay contiguous, parents at the circular mean of their children.
 * Other clusters: sunflower (golden-angle) packing around their centre. Exported for tests.
 */
export function layoutClusters(nodes: ClusterNode[], W: number, H: number, nodeR = 5): Map<string, Pos> {
  const pos = new Map<string, Pos>();
  const lv = agentLevels(nodes); const maxLv = Math.max(1, ...lv.values());
  const agents = nodes.filter((n) => n.cluster === 'agents' && !n.detached);
  const detached = nodes.filter((n) => n.cluster === 'agents' && n.detached);
  const kids = new Map<string, ClusterNode[]>(); const roots: ClusterNode[] = [];
  agents.forEach((n) => { const p = n.parentId && lv.has(n.parentId) ? n.parentId : null; if (p) kids.set(p, [...(kids.get(p) ?? []), n]); else roots.push(n); });
  const [ax, ay] = CENTRES.agents; const cx = ax * W, cy = ay * H; const RA = Math.min(W * 0.215, H * 0.44);
  const leaves: ClusterNode[] = []; const walk = (n: ClusterNode) => { const k = kids.get(n.id) ?? []; if (!k.length) leaves.push(n); k.forEach(walk); };
  // Single root sits at the centre; a forest gets a virtual centre.
  roots.forEach(walk);
  const ang = new Map<string, number>();
  leaves.forEach((n, i) => ang.set(n.id, (i / Math.max(leaves.length, 1)) * Math.PI * 2 - Math.PI / 2));
  const meanAng = (n: ClusterNode): number => {
    if (ang.has(n.id)) return ang.get(n.id)!;
    const k = kids.get(n.id) ?? []; let sx = 0, sy = 0; k.forEach((c) => { const a = meanAng(c); sx += Math.cos(a); sy += Math.sin(a); });
    const a = Math.atan2(sy, sx); ang.set(n.id, a); return a;
  };
  agents.forEach(meanAng);
  agents.forEach((n) => {
    const l = lv.get(n.id) ?? 0; const single = roots.length === 1;
    const ringFrac = single ? l / maxLv : (l + 1) / (maxLv + 1);
    const r = ringFrac * RA; const a = ang.get(n.id) ?? 0;
    pos.set(n.id, { x: cx + Math.cos(a) * r, y: cy + Math.sin(a) * r, r: l === 0 && single ? nodeR * 2.2 : nodeR * Math.max(0.7, 1.45 - l * 0.22) });
  });
  detached.forEach((n, i) => { const cols = Math.max(1, Math.ceil(Math.sqrt(detached.length * 3))); pos.set(n.id, { x: cx - RA + (i % cols) * ((RA * 2) / cols), y: Math.min(H - nodeR * 2, cy + RA + nodeR * 4 + Math.floor(i / cols) * nodeR * 3), r: nodeR * 0.7 }); });
  for (const k of CLUSTER_ORDER) {
    if (k === 'agents') continue;
    const list = nodes.filter((n) => n.cluster === k); if (!list.length) continue;
    const [fx, fy] = CENTRES[k]; const ccx = fx * W, ccy = fy * H;
    const maxR = k === 'connections' ? Math.min(W * 0.075, H * 0.27) : k === 'mcp' ? Math.min(W * 0.065, H * 0.2) : Math.min(W * 0.12, H * 0.2);
    const step = Math.max(maxR / Math.sqrt(list.length + 0.5), nodeR * (k === 'connections' || k === 'mcp' ? 5 : 4.5));
    const r = k === 'connections' || k === 'mcp' ? nodeR * 1.9 : nodeR;
    list.forEach((n, i) => {
      const a = i * 2.39996323; const d = list.length === 1 ? 0 : step * Math.sqrt(i + 0.5);
      // Connections cluster is a tall ellipse (right column).
      const sxk = k === 'connections' ? 0.75 : 1, syk = k === 'connections' ? 1.6 : 1;
      pos.set(n.id, { x: ccx + Math.cos(a) * d * sxk, y: ccy + Math.sin(a) * d * syk, r });
    });
  }
  return pos;
}

const rgba = (c: RGB, a: number) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;
const mix = (a: RGB, b: RGB, t: number): RGB => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];

interface N extends ClusterNode { bx: number; by: number; x: number; y: number; r: number; ph: number; act: number; lab: number; hotUntil: number; col: RGB; logo: Path2D | null; logoHex: string; initials: string }
interface E { a: N; b: N; inter: boolean; ph: number; hotUntil: number }
interface Pulse { pts: N[]; seg: number; t: number; col: RGB; back?: RGB; dur: number }

/** 2D canvas fallback of the five-cluster network (used when WebGL is unavailable). */
export function NeuralClusters2D({ nodes, edges = [], events = [], activeIds = [], mini = false, height = '100%', className, style, onNodeClick, clusterLabels, showLegend = !mini }: NeuralClustersProps) {
  const cvRef = useRef<HTMLCanvasElement>(null); const wrapRef = useRef<HTMLDivElement>(null);
  const [tip, setTip] = useState<{ x: number; y: number; n: ClusterNode } | null>(null);
  const [focus, setFocus] = useState<ClusterKind | null>(null);
  const labels = { ...DEFAULT_CLUSTER_LABELS, ...clusterLabels };
  const active = useMemo(() => withAncestors(activeIds, nodes), [activeIds, nodes]);
  const engine = useRef<{ play: (e: ClusterEvent) => void; setActive: (s: Set<string>) => void; setFocus: (k: ClusterKind | null) => void } | null>(null);
  const seen = useRef(new Set<string>());
  const clickRef = useRef(onNodeClick); clickRef.current = onNodeClick;
  const focusRef = useRef(focus); focusRef.current = focus;
  const activeRef = useRef(active); activeRef.current = active;

  useEffect(() => {
    const cv = cvRef.current; const ctx = cv?.getContext('2d'); if (!cv || !ctx) return;
    const reduce = typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const dpr = Math.min(window.devicePixelRatio || 1, mini ? 1.5 : 2);
    let W = 1, H = 1, raf = 0, visible = true; let view = { k: 1, x: 0, y: 0 }; let target = { k: 1, x: 0, y: 0 };
    const byId = new Map<string, N>();
    const ns: N[] = nodes.map((n, i) => {
      const b = n.cluster === 'connections' || n.cluster === 'mcp' ? resolveBrand(n.brand ?? n.label) : null;
      let logo: Path2D | null = null; try { logo = b && typeof Path2D !== 'undefined' ? new Path2D(b.path) : null; } catch { logo = null; }
      const m: N = { ...n, bx: 0, by: 0, x: 0, y: 0, r: 4, ph: (i * 1.618) % 6.283, act: 0, lab: 0, hotUntil: 0, col: CLUSTER_COLORS[n.cluster], logo, logoHex: b?.hex ?? '#ffffff', initials: brandInitials(n.label) };
      byId.set(n.id, m); return m;
    });
    const es: E[] = [];
    const ekey = new Map<string, E>();
    const addE = (a?: N, b?: N) => { if (!a || !b || a === b) return; const k = a.id < b.id ? a.id + '|' + b.id : b.id + '|' + a.id; if (ekey.has(k)) return; const e = { a, b, inter: a.cluster !== b.cluster, ph: es.length * 0.7, hotUntil: 0 }; ekey.set(k, e); es.push(e); };
    ns.forEach((n) => { if (n.parentId) addE(byId.get(n.parentId), n); });
    edges.forEach((e) => addE(byId.get(e.from), byId.get(e.to)));
    const edgeBetween = (a: N, b: N) => ekey.get(a.id < b.id ? a.id + '|' + b.id : b.id + '|' + a.id);
    let act = activeRef.current;
    const pulses: Pulse[] = [];
    // Pre-rendered glow sprites (much cheaper than shadowBlur per frame).
    const sprites = new Map<string, HTMLCanvasElement>();
    const sprite = (c: RGB) => {
      const k = c.map((v) => Math.round(v)).join(','); let s = sprites.get(k); if (s) return s;
      s = document.createElement('canvas'); s.width = s.height = 64; const g = s.getContext('2d');
      if (g) { const gr = g.createRadialGradient(32, 32, 0, 32, 32, 32); gr.addColorStop(0, `rgba(${k},1)`); gr.addColorStop(0.25, `rgba(${k},.55)`); gr.addColorStop(1, `rgba(${k},0)`); g.fillStyle = gr; g.fillRect(0, 0, 64, 64); }
      sprites.set(k, s); return s;
    };
    const nodeR = (mini ? 2.6 : 4.6) * dpr;
    const lvMap = agentLevels(nodes);
    let halos: { k: ClusterKind; cx: number; cy: number; rr: number; n: number }[] = []; let rings: { x: number; y: number; r: number }[] = [];
    const place = () => {
      const p = layoutClusters(nodes, W, H, nodeR);
      ns.forEach((n) => { const q = p.get(n.id); if (q) { n.bx = q.x; n.by = q.y; n.r = q.r; n.x = q.x; n.y = q.y; } });
      halos = []; rings = [];
      for (const k of CLUSTER_ORDER) {
        const list = ns.filter((n) => n.cluster === k); if (!list.length) continue;
        let sx = 0, sy = 0; list.forEach((n) => { sx += n.bx; sy += n.by; }); const cx = sx / list.length, cy = sy / list.length;
        let rr = 0; list.forEach((n) => { rr = Math.max(rr, Math.hypot(n.bx - cx, n.by - cy)); }); halos.push({ k, cx, cy, rr: rr + 22 * dpr, n: list.length });
        if (k === 'agents') { const root = list.find((n) => (lvMap.get(n.id) ?? 0) === 0); if (root) new Set(lvMap.values()).forEach((l) => { const ex = l ? list.find((n) => lvMap.get(n.id) === l) : undefined; if (ex) rings.push({ x: root.bx, y: root.by, r: Math.hypot(ex.bx - root.bx, ex.by - root.by) }); }); }
      }
    };
    const resize = () => { W = cv.width = Math.max(1, Math.round(cv.clientWidth * dpr)); H = cv.height = Math.max(1, Math.round(cv.clientHeight * dpr)); place(); setFocusK(focusRef.current); view = { ...target }; };
    const setFocusK = (k: ClusterKind | null) => {
      if (!k) { target = { k: 1, x: 0, y: 0 }; return; }
      const list = ns.filter((n) => n.cluster === k); if (!list.length) { target = { k: 1, x: 0, y: 0 }; return; }
      let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity; list.forEach((n) => { x0 = Math.min(x0, n.bx); y0 = Math.min(y0, n.by); x1 = Math.max(x1, n.bx); y1 = Math.max(y1, n.by); });
      const pad = 60 * dpr; const kk = Math.min(3, Math.max(1, Math.min(W / (x1 - x0 + pad * 2), H / (y1 - y0 + pad * 2))));
      target = { k: kk, x: W / 2 - ((x0 + x1) / 2) * kk, y: H / 2 - ((y0 + y1) / 2) * kk };
    };
    const play = (ev: ClusterEvent) => {
      const pts = ev.path.map((id) => byId.get(id)).filter((n): n is N => !!n); if (!pts.length) return;
      const now = performance.now();
      const col = pts[0].cluster === 'agents' && pts.every((p) => p.cluster === 'agents') ? CLUSTER_COLORS.agents : [180, 200, 255] as RGB;
      pts.forEach((p) => { p.hotUntil = Math.max(p.hotUntil, now + 5000); });
      for (let i = 1; i < pts.length; i++) { const e = edgeBetween(pts[i - 1], pts[i]); if (e) e.hotUntil = now + 5000; }
      if (pts.length === 1) { pts[0].act = 1; return; }
      pulses.push({ pts, seg: 0, t: 0, col: ev.status === 'error' ? ERR : col, back: ev.status === 'ok' ? OK : ev.status === 'error' ? ERR : undefined, dur: mini ? 520 : 650 });
      if (pulses.length > 160) pulses.splice(0, pulses.length - 160);
    };
    engine.current = { play, setActive: (s) => { act = s; }, setFocus: setFocusK };
    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null; ro?.observe(cv); resize();
    const io = typeof IntersectionObserver !== 'undefined' ? new IntersectionObserver(([en]) => { visible = en.isIntersecting; }) : null; io?.observe(cv);
    const ctrl = (a: N, b: N, e: E, t: number): [number, number] => {
      const mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2; const dx = b.x - a.x, dy = b.y - a.y; const L = Math.hypot(dx, dy) || 1;
      const bend = (e.inter ? 0.16 : 0.1) * L * Math.sin(e.ph) + (reduce ? 0 : Math.sin(t * 0.0006 + e.ph) * 3 * dpr);
      return [mx - (dy / L) * bend, my + (dx / L) * bend];
    };
    const qpt = (a: N, b: N, c: [number, number], u: number): [number, number] => { const q = 1 - u; return [q * q * a.x + 2 * q * u * c[0] + u * u * b.x, q * q * a.y + 2 * q * u * c[1] + u * u * b.y]; };
    let last = performance.now();
    const frame = (t: number) => {
      raf = requestAnimationFrame(frame);
      if (!visible || document.hidden) { last = t; return; }
      const dt = Math.min(64, t - last); last = t;
      view.k += (target.k - view.k) * 0.12; view.x += (target.x - view.x) * 0.12; view.y += (target.y - view.y) * 0.12;
      ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, W, H);
      ctx.setTransform(view.k, 0, 0, view.k, view.x, view.y);
      // organic drift
      ns.forEach((n) => {
        const w = reduce ? 0 : 1.6 * dpr; n.x = n.bx + Math.sin(t * 0.0005 + n.ph) * w; n.y = n.by + Math.cos(t * 0.00043 + n.ph * 1.3) * w;
        const live = act.has(n.id) || n.hotUntil > t; n.lab += ((live ? 1 : 0) - n.lab) * Math.min(1, dt / 260); n.act *= Math.pow(0.5, dt / 700);
      });
      // cluster halos + titles (precomputed in place())
      const fsz = (mini ? 8 : 11) * dpr;
      for (const h of halos) {
        const c = CLUSTER_COLORS[h.k]; const R = h.rr * (reduce ? 1 : 1 + Math.sin(t * 0.0007 + h.k.length) * 0.015) * 2.2;
        ctx.globalAlpha = focusRef.current === h.k ? 0.2 : 0.11; ctx.drawImage(sprite(c), h.cx - R / 2, h.cy - R / 2, R, R); ctx.globalAlpha = 1;
        if (!mini) { ctx.font = `600 ${fsz}px ui-sans-serif, system-ui`; ctx.textAlign = 'center'; ctx.fillStyle = rgba(c, 0.8); ctx.fillText(labels[h.k].toUpperCase() + ` · ${h.n}`, h.cx, h.cy - h.rr - 4 * dpr); }
      }
      if (!mini) { ctx.strokeStyle = rgba(CLUSTER_COLORS.agents, 0.1); ctx.lineWidth = dpr; ctx.setLineDash([2 * dpr, 6 * dpr]); rings.forEach((r) => { ctx.beginPath(); ctx.arc(r.x, r.y, r.r, 0, 6.283); ctx.stroke(); }); ctx.setLineDash([]); }
      // edges
      es.forEach((e) => {
        const hot = e.hotUntil > t || (act.has(e.a.id) && act.has(e.b.id));
        const c = ctrl(e.a, e.b, e, t); const col = e.inter ? mix(e.a.col, e.b.col, 0.5) : e.a.col;
        ctx.strokeStyle = rgba(col, hot ? 0.55 : e.inter ? 0.05 : 0.14); ctx.lineWidth = (hot ? 1.6 : 0.8) * dpr;
        ctx.beginPath(); ctx.moveTo(e.a.x, e.a.y); ctx.quadraticCurveTo(c[0], c[1], e.b.x, e.b.y); ctx.stroke();
      });
      // pulses (real events only)
      ctx.globalCompositeOperation = 'lighter';
      for (let i = pulses.length - 1; i >= 0; i--) {
        const p = pulses[i]; p.t += dt / p.dur;
        if (p.t >= 1) {
          p.pts[p.seg + 1].act = 1; p.pts[p.seg + 1].col = p.col === ERR ? ERR : p.pts[p.seg + 1].col; p.seg++; p.t = 0;
          if (p.seg >= p.pts.length - 1) { if (p.back) { pulses[i] = { pts: [...p.pts].reverse(), seg: 0, t: 0, col: p.back, dur: p.dur * 0.8 }; } else pulses.splice(i, 1); continue; }
        }
        const a = p.pts[p.seg], b = p.pts[p.seg + 1]; const e = edgeBetween(a, b);
        const c: [number, number] = e ? (e.a === a ? ctrl(a, b, e, t) : ctrl(b, a, e, t)) : [(a.x + b.x) / 2, (a.y + b.y) / 2];
        for (let k = 0; k < 6; k++) { // comet trail
          const u = Math.max(0, p.t - k * 0.035); const [x, y] = qpt(a, b, c, u); const s = (16 - k * 2.2) * dpr * (mini ? 0.6 : 1);
          ctx.globalAlpha = 1 - k / 6; ctx.drawImage(sprite(p.col), x - s / 2, y - s / 2, s, s);
        }
        ctx.globalAlpha = 1;
      }
      // nodes
      ns.forEach((n) => {
        const on = act.has(n.id); const glow = Math.max(n.act, on ? 0.55 + (reduce ? 0 : 0.15 * Math.sin(t * 0.004 + n.ph)) : 0, n.hotUntil > t ? 0.35 : 0);
        if (glow > 0.02) { const s = n.r * (5 + glow * 5); ctx.globalAlpha = glow; ctx.drawImage(sprite(n.act > 0.3 ? n.col : CLUSTER_COLORS[n.cluster]), n.x - s / 2, n.y - s / 2, s, s); ctx.globalAlpha = 1; }
      });
      ctx.globalCompositeOperation = 'source-over';
      ns.forEach((n) => {
        const base = CLUSTER_COLORS[n.cluster]; const on = act.has(n.id) || n.hotUntil > t;
        if (n.cluster === 'connections' || n.cluster === 'mcp') {
          ctx.fillStyle = on ? 'rgba(20,22,40,.95)' : 'rgba(20,22,40,.75)'; ctx.strokeStyle = rgba(base, on ? 0.9 : 0.35); ctx.lineWidth = dpr * (on ? 1.6 : 1);
          ctx.beginPath(); ctx.arc(n.x, n.y, n.r, 0, 6.283); ctx.fill(); ctx.stroke();
          if (n.logo) { const s = (n.r * 1.25) / 12; ctx.save(); ctx.translate(n.x - 12 * s, n.y - 12 * s); ctx.scale(s, s); ctx.globalAlpha = on ? 1 : 0.55; ctx.fillStyle = luminous(n.logoHex); ctx.fill(n.logo); ctx.restore(); ctx.globalAlpha = 1; }
          else { ctx.fillStyle = rgba(base, on ? 1 : 0.6); ctx.font = `700 ${Math.round(n.r * 0.85)}px ui-sans-serif, system-ui`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillText(n.initials, n.x, n.y + 0.5); ctx.textBaseline = 'alphabetic'; }
        } else {
          const lv = n.cluster === 'agents' && !n.parentId; const r = n.r * (1 + n.act * 0.35);
          ctx.fillStyle = rgba(base, on ? 1 : 0.55); ctx.beginPath(); ctx.arc(n.x, n.y, r, 0, 6.283); ctx.fill();
          ctx.fillStyle = rgba(mix(base, [255, 255, 255], 0.7), on ? 0.9 : 0.5); ctx.beginPath(); ctx.arc(n.x - r * 0.3, n.y - r * 0.3, r * 0.4, 0, 6.283); ctx.fill();
          if (lv) { ctx.strokeStyle = rgba(base, 0.5); ctx.lineWidth = dpr; ctx.beginPath(); ctx.arc(n.x, n.y, r + 4 * dpr + (reduce ? 0 : Math.sin(t * 0.002) * dpr), 0, 6.283); ctx.stroke(); }
        }
        // labels only for live nodes (fade in/out); root "Tú" always named
        const la = n.cluster === 'agents' && !n.parentId ? 1 : n.lab;
        if (la > 0.03 && !(mini && !(n.cluster === 'agents' && !n.parentId))) {
          ctx.globalAlpha = la; ctx.font = `${n.parentId ? 500 : 700} ${(mini ? 8 : 10.5) * dpr}px ui-sans-serif, system-ui`; ctx.textAlign = 'center';
          const txt = n.label.length > 26 ? n.label.slice(0, 25) + '…' : n.label; const y = n.y + n.r + 12 * dpr;
          ctx.lineWidth = 3 * dpr; ctx.strokeStyle = 'rgba(10,10,24,.8)'; ctx.strokeText(txt, n.x, y); ctx.fillStyle = 'rgba(240,242,255,.95)'; ctx.fillText(txt, n.x, y); ctx.globalAlpha = 1;
        }
      });
    };
    raf = requestAnimationFrame(frame);
    const toWorld = (ev: MouseEvent) => { const b = cv.getBoundingClientRect(); const px = (ev.clientX - b.left) * dpr, py = (ev.clientY - b.top) * dpr; return [(px - view.x) / view.k, (py - view.y) / view.k, ev.clientX - b.left, ev.clientY - b.top] as const; };
    const hit = (x: number, y: number) => { let best: N | null = null, bd = Infinity; ns.forEach((n) => { const d = Math.hypot(n.x - x, n.y - y); if (d < Math.max(n.r + 6 * dpr, 9 * dpr) && d < bd) { bd = d; best = n; } }); return best as N | null; };
    const onMove = (ev: MouseEvent) => { if (mini) return; const [x, y, cx, cy] = toWorld(ev); const n = hit(x, y); cv.style.cursor = n ? 'pointer' : 'default'; setTip(n ? { x: cx, y: cy, n } : null); };
    const onClick = (ev: MouseEvent) => {
      if (mini) { clickRef.current?.(ns[0]); return; }
      const [x, y] = toWorld(ev); const n = hit(x, y);
      if (!n) { setFocus(null); return; }
      setFocus((f) => (f === n.cluster ? f : n.cluster)); clickRef.current?.(n);
    };
    const onLeave = () => setTip(null);
    cv.addEventListener('mousemove', onMove); cv.addEventListener('click', onClick); cv.addEventListener('mouseleave', onLeave);
    return () => { cancelAnimationFrame(raf); ro?.disconnect(); io?.disconnect(); cv.removeEventListener('mousemove', onMove); cv.removeEventListener('click', onClick); cv.removeEventListener('mouseleave', onLeave); engine.current = null; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, edges, mini]);

  useEffect(() => { engine.current?.setActive(active); }, [active]);
  useEffect(() => { engine.current?.setFocus(focus); }, [focus]);
  useEffect(() => {
    events.forEach((e) => { if (seen.current.has(e.id)) return; seen.current.add(e.id); engine.current?.play(e); });
    if (seen.current.size > 5000) seen.current = new Set(events.map((e) => e.id));
  }, [events]);
  useEffect(() => { const k = (e: KeyboardEvent) => { if (e.key === 'Escape') setFocus(null); }; window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k); }, []);

  const lineage = tip ? lineageOf(tip.n.id, nodes, edges) : [];
  return (
    <div ref={wrapRef} className={className} data-testid="neural-clusters" style={{ position: 'relative', width: '100%', height, ...style }}>
      <canvas ref={cvRef} role="img" aria-label={`Red neuronal: ${nodes.length} nodos en ${CLUSTER_ORDER.length} clústeres, ${active.size} activos`} style={{ width: '100%', height: '100%', display: 'block' }} />
      {tip && (
        <div role="tooltip" style={{ position: 'absolute', left: Math.min(tip.x + 14, (wrapRef.current?.clientWidth ?? 9999) - 260), top: tip.y + 14, maxWidth: 260, pointerEvents: 'none', background: 'rgba(16,18,34,.92)', border: `1px solid ${rgba(CLUSTER_COLORS[tip.n.cluster], 0.5)}`, borderRadius: 10, padding: '8px 10px', color: '#eef', fontSize: 12, lineHeight: 1.4, backdropFilter: 'blur(8px)', zIndex: 2 }}>
          <div style={{ fontWeight: 700 }}>{tip.n.label}</div>
          <div style={{ opacity: 0.7, fontSize: 11 }}>{labels[tip.n.cluster]}{tip.n.kind ? ` · ${tip.n.kind}` : ''}{active.has(tip.n.id) ? ' · activo' : ''}</div>
          {lineage.map((l) => <div key={l} style={{ marginTop: 3, opacity: 0.9 }}>{l}</div>)}
        </div>
      )}
      {showLegend && (
        <div aria-label="Leyenda" style={{ position: 'absolute', left: 10, bottom: 8, display: 'flex', flexWrap: 'wrap', gap: '4px 12px', fontSize: 11, color: 'var(--g-muted, #aab)', pointerEvents: 'auto' }}>
          {CLUSTER_ORDER.map((k) => (
            <button key={k} type="button" onClick={() => setFocus((f) => (f === k ? null : k))} aria-pressed={focus === k}
              style={{ all: 'unset', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5, opacity: !focus || focus === k ? 1 : 0.5 }}>
              <span style={{ width: 8, height: 8, borderRadius: 9, background: rgba(CLUSTER_COLORS[k], 1), boxShadow: `0 0 8px ${rgba(CLUSTER_COLORS[k], 0.8)}` }} />{labels[k]}
            </button>
          ))}
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><span style={{ width: 8, height: 8, borderRadius: 9, background: rgba(OK, 1) }} />resultado ok</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}><span style={{ width: 8, height: 8, borderRadius: 9, background: rgba(ERR, 1) }} />error</span>
          {focus && <button type="button" onClick={() => setFocus(null)} style={{ all: 'unset', cursor: 'pointer', textDecoration: 'underline' }}>ver todo (Esc)</button>}
        </div>
      )}
    </div>
  );
}

/** Dark-on-dark brand colours (GitHub #181717, X #000) become unreadable: lift them to near-white. */
function luminous(hex: string): string {
  const v = parseInt(hex.slice(1), 16); const r = (v >> 16) & 255, g = (v >> 8) & 255, b = v & 255;
  return 0.2126 * r + 0.7152 * g + 0.0722 * b < 70 ? '#e8eaf6' : hex;
}
