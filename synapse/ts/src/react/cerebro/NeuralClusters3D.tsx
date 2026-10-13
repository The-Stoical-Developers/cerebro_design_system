"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { Canvas, useFrame, useThree, type ThreeEvent } from '@react-three/fiber';
import { Html, Sparkles } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { brandInitials, resolveBrand } from './brandLogos';
import {
  CLUSTER_COLORS, CLUSTER_ORDER, DEFAULT_CLUSTER_LABELS, NeuralClusters2D, agentLevels, lineageOf, withAncestors,
  type ClusterEdge, type ClusterEvent, type ClusterKind, type ClusterNode, type NeuralClustersProps,
} from './NeuralClusters';

/** Spacing between concentric hierarchy rings (world units). */
export const RING_GAP = 7;
type V3 = [number, number, number];
export interface Layout3D { pos: Map<string, V3>; centres: Record<ClusterKind, V3>; radii: Record<ClusterKind, number>; rings: { level: number; radius: number; count: number }[] }

/**
 * Deterministic 3D layout.
 * Agents: the root at the origin; ONE ring per hierarchy level holding ONLY that level's agents (ring l radius = l·RING_GAP),
 * ordered depth-first so subtrees stay contiguous. Detached agents (outside the hierarchy) float in a loose cloud below.
 * Other clusters: Fibonacci spheres to the right, spaced by their radii. Exported for tests.
 */
export function layoutClusters3D(nodes: ClusterNode[]): Layout3D {
  const pos = new Map<string, V3>();
  const lv = agentLevels(nodes);
  const agents = nodes.filter((n) => n.cluster === 'agents' && !n.detached);
  const kids = new Map<string, ClusterNode[]>(); const roots: ClusterNode[] = [];
  agents.forEach((n) => { const p = n.parentId && lv.has(n.parentId) ? n.parentId : null; if (p) kids.set(p, [...(kids.get(p) ?? []), n]); else roots.push(n); });
  const order: ClusterNode[] = []; const walk = (n: ClusterNode) => { order.push(n); (kids.get(n.id) ?? []).forEach(walk); }; roots.forEach(walk);
  const byLevel = new Map<number, ClusterNode[]>();
  order.forEach((n) => { const l = lv.get(n.id) ?? 0; byLevel.set(l, [...(byLevel.get(l) ?? []), n]); });
  const rings: Layout3D['rings'] = [];
  const maxLv = Math.max(0, ...byLevel.keys());
  [...byLevel.keys()].sort((a, b) => a - b).forEach((l) => {
    const list = byLevel.get(l)!;
    if (l === 0 && list.length === 1) { pos.set(list[0].id, [0, 0, 0]); return; }
    const r = (l === 0 ? 1 : l) * RING_GAP; rings.push({ level: l, radius: r, count: list.length });
    list.forEach((n, i) => { const a = (i / list.length) * Math.PI * 2; pos.set(n.id, [Math.cos(a) * r, (l % 2 ? 0.6 : -0.6), Math.sin(a) * r]); });
  });
  const RA = Math.max(RING_GAP, maxLv * RING_GAP);
  const detached = nodes.filter((n) => n.cluster === 'agents' && n.detached);
  detached.forEach((n, i) => { const a = i * 2.39996; const d = 1.6 * Math.sqrt(i + 0.5); pos.set(n.id, [Math.cos(a) * d * 1.8, -RA * 0.55 - 4, Math.sin(a) * d]); });
  const sph = (k: ClusterKind) => nodes.filter((n) => n.cluster === k);
  const radius = (n: number, spread: number) => Math.max(3, spread * Math.sqrt(n));
  const radii = { agents: RA, read: radius(sph('read').length, 2.1), write: radius(sph('write').length, 2.1), mcp: radius(sph('mcp').length, 2.6), connections: radius(sph('connections').length, 2.6) } as Record<ClusterKind, number>;
  const GAP = 9;
  const xTools = RA + GAP + Math.max(radii.read, radii.write);
  const xMcp = xTools + Math.max(radii.read, radii.write) + GAP + radii.mcp;
  const xConn = xMcp + radii.mcp + GAP + radii.connections;
  const centres: Record<ClusterKind, V3> = { agents: [0, 0, 0], read: [xTools, radii.read + 2, -4], write: [xTools, -radii.write - 2, 4], mcp: [xMcp, 0, 0], connections: [xConn, 0, 0] };
  (['read', 'write', 'mcp', 'connections'] as ClusterKind[]).forEach((k) => {
    const list = sph(k); const R = radii[k]; const c = centres[k];
    list.forEach((n, i) => {
      if (list.length === 1) { pos.set(n.id, c); return; }
      const y = 1 - (2 * (i + 0.5)) / list.length; const rr = Math.sqrt(1 - y * y); const th = i * 2.39996323;
      pos.set(n.id, [c[0] + Math.cos(th) * rr * R, c[1] + y * R, c[2] + Math.sin(th) * rr * R]);
    });
  });
  return { pos, centres, radii, rings };
}

const OK = new THREE.Color(0.12, 0.75, 0.53); const ERR = new THREE.Color(1, 0.3, 0.43);
const col = (k: ClusterKind) => new THREE.Color(...CLUSTER_COLORS[k].map((v) => v / 255) as V3);

function logoTexture(n: ClusterNode): THREE.CanvasTexture {
  const S = 128; const c = document.createElement('canvas'); c.width = c.height = S; const g = c.getContext('2d')!;
  const base = CLUSTER_COLORS[n.cluster];
  g.fillStyle = 'rgba(14,16,34,0.92)'; g.beginPath(); g.arc(S / 2, S / 2, S * 0.46, 0, 6.283); g.fill();
  g.lineWidth = 5; g.strokeStyle = `rgb(${base.join(',')})`; g.stroke();
  const b = resolveBrand(n.brand ?? n.label);
  if (b && typeof Path2D !== 'undefined') {
    const v = parseInt(b.hex.slice(1), 16); const lum = 0.2126 * ((v >> 16) & 255) + 0.7152 * ((v >> 8) & 255) + 0.0722 * (v & 255);
    g.save(); g.translate(S * 0.24, S * 0.24); g.scale((S * 0.52) / 24, (S * 0.52) / 24); g.fillStyle = lum < 70 ? '#e8eaf6' : b.hex; g.fill(new Path2D(b.path)); g.restore();
  } else { g.fillStyle = '#e8eaf6'; g.font = `700 ${S * 0.32}px ui-sans-serif, system-ui`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(brandInitials(n.label), S / 2, S / 2 + 2); }
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}

interface Pulse { pts: string[]; seg: number; t: number; color: THREE.Color; back?: THREE.Color; dur: number }
interface SceneProps { nodes: ClusterNode[]; edges: ClusterEdge[]; layout: Layout3D; active: Set<string>; hot: React.MutableRefObject<Map<string, number>>; queue: React.MutableRefObject<ClusterEvent[]>; focus: ClusterKind | null; mini: boolean; onHover: (n: ClusterNode | null, x: number, y: number) => void; onPick: (n: ClusterNode) => void; labels: Set<string> }

const SEG = 8; const MAX_PULSES = 120; const TRAIL = 5;

function Scene({ nodes, edges, layout, active, hot, queue, focus, mini, onHover, onPick, labels }: SceneProps) {
  const { camera, gl } = useThree();
  const sphereNodes = useMemo(() => nodes.filter((n) => n.cluster !== 'mcp' && n.cluster !== 'connections'), [nodes]);
  const logoNodes = useMemo(() => nodes.filter((n) => n.cluster === 'mcp' || n.cluster === 'connections'), [nodes]);
  const idx = useMemo(() => new Map(nodes.map((n, i) => [n.id, i])), [nodes]);
  const lv = useMemo(() => agentLevels(nodes), [nodes]);
  const cur = useMemo(() => new Float32Array(nodes.length * 3), [nodes]);
  const phase = useMemo(() => nodes.map((_, i) => (i * 2.399) % 6.283), [nodes]);
  const act = useMemo(() => new Float32Array(nodes.length), [nodes]);
  const inst = useRef<THREE.InstancedMesh>(null); const pulseMesh = useRef<THREE.InstancedMesh>(null);
  const sprites = useRef<(THREE.Sprite | null)[]>([]);
  const textures = useMemo(() => logoNodes.map(logoTexture), [logoNodes]);
  useEffect(() => () => textures.forEach((t) => t.dispose()), [textures]);
  const edgeList = useMemo(() => {
    const seen = new Set<string>(); const out: { a: number; b: number; inter: boolean }[] = [];
    const add = (x?: number, y?: number) => { if (x === undefined || y === undefined || x === y) return; const k = x < y ? `${x}|${y}` : `${y}|${x}`; if (seen.has(k)) return; seen.add(k); out.push({ a: x, b: y, inter: nodes[x].cluster !== nodes[y].cluster }); };
    nodes.forEach((n, i) => { if (n.parentId && !n.detached) add(idx.get(n.parentId), i); });
    edges.forEach((e) => add(idx.get(e.from), idx.get(e.to)));
    return out;
  }, [nodes, edges, idx]);
  const edgeKey = useMemo(() => new Map(edgeList.map((e, i) => [e.a < e.b ? `${e.a}|${e.b}` : `${e.b}|${e.a}`, i])), [edgeList]);
  const lineGeo = useMemo(() => {
    const g = new THREE.BufferGeometry(); const n = edgeList.length * SEG * 2;
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(n * 3), 3)); g.setAttribute('color', new THREE.BufferAttribute(new Float32Array(n * 3), 3)); return g;
  }, [edgeList]);
  useEffect(() => () => lineGeo.dispose(), [lineGeo]);
  const ringGeo = useMemo(() => layout.rings.map((r) => { const pts = Array.from({ length: 129 }, (_, i) => { const a = (i / 128) * Math.PI * 2; return new THREE.Vector3(Math.cos(a) * r.radius, r.level % 2 ? 0.6 : -0.6, Math.sin(a) * r.radius); }); return new THREE.BufferGeometry().setFromPoints(pts); }), [layout]);
  const pulses = useRef<Pulse[]>([]);
  const camT = useRef({ target: new THREE.Vector3(), dist: 60 });
  const span = useMemo(() => { const c = layout.centres; return { mid: new THREE.Vector3((c.connections[0] + layout.radii.connections - layout.radii.agents) / 2, 0, 0), dist: (c.connections[0] + layout.radii.connections + layout.radii.agents) * (mini ? 1.0 : 0.8) }; }, [layout, mini]);
  useEffect(() => {
    if (!focus) { camT.current.target.copy(span.mid); camT.current.dist = span.dist; return; }
    camT.current.target.set(...layout.centres[focus]); camT.current.dist = Math.max(18, layout.radii[focus] * 3.2);
  }, [focus, span, layout]);
  const tmp = useMemo(() => ({ m: new THREE.Matrix4(), c: new THREE.Color(), v: new THREE.Vector3(), q: new THREE.Quaternion(), s: new THREE.Vector3() }), []);
  const lookAt = useRef(new THREE.Vector3().copy(span.mid));
  const curve = (a: number, b: number, u: number, out: THREE.Vector3, inter: boolean) => {
    const ax = cur[a * 3], ay = cur[a * 3 + 1], az = cur[a * 3 + 2], bx = cur[b * 3], by = cur[b * 3 + 1], bz = cur[b * 3 + 2];
    const mx = (ax + bx) / 2, my = (ay + by) / 2 + (inter ? Math.hypot(bx - ax, bz - az) * 0.18 : 0), mz = (az + bz) / 2; const q = 1 - u;
    out.set(q * q * ax + 2 * q * u * mx + u * u * bx, q * q * ay + 2 * q * u * my + u * u * by, q * q * az + 2 * q * u * mz + u * u * bz); return out;
  };
  useFrame((state, delta) => {
    const t = state.clock.elapsedTime; const dt = Math.min(delta, 0.05); const now = performance.now();
    // camera: slow organic orbit + smooth focus
    lookAt.current.lerp(camT.current.target, 0.04);
    const az = Math.sin(t * 0.07) * 0.32 + 0.05; const el = 0.42 + Math.sin(t * 0.05) * 0.07; const d = THREE.MathUtils.lerp(camera.position.distanceTo(lookAt.current), camT.current.dist, 0.04);
    camera.position.set(lookAt.current.x + Math.sin(az) * Math.cos(el) * d, lookAt.current.y + Math.sin(el) * d, lookAt.current.z + Math.cos(az) * Math.cos(el) * d); camera.lookAt(lookAt.current);
    // organic drift
    nodes.forEach((n, i) => { const p = layout.pos.get(n.id) ?? [0, 0, 0]; const ph = phase[i]; const w = n.cluster === 'agents' && !n.parentId && !n.detached ? 0 : 0.35;
      cur[i * 3] = p[0] + Math.sin(t * 0.35 + ph) * w; cur[i * 3 + 1] = p[1] + Math.cos(t * 0.29 + ph * 1.3) * w; cur[i * 3 + 2] = p[2] + Math.sin(t * 0.31 + ph * 0.7) * w;
      act[i] = Math.max(0, act[i] - dt * 0.9); });
    // spheres (instanced): breathing + activity glow
    const im = inst.current;
    if (im) sphereNodes.forEach((n, k) => { const i = idx.get(n.id)!; const on = active.has(n.id) || (hot.current.get(n.id) ?? 0) > now;
      const root = n.cluster === 'agents' && !n.parentId && !n.detached; const l = lv.get(n.id) ?? 3;
      const base = root ? 1.5 : n.cluster === 'agents' ? Math.max(0.32, 0.75 - l * 0.1) : 0.42;
      const s = base * (1 + Math.sin(t * 1.6 + phase[i]) * 0.07 + act[i] * 0.6 + (on ? 0.25 : 0));
      tmp.v.set(cur[i * 3], cur[i * 3 + 1], cur[i * 3 + 2]); tmp.s.setScalar(s); tmp.m.compose(tmp.v, tmp.q, tmp.s); im.setMatrixAt(k, tmp.m);
      tmp.c.copy(col(n.cluster)).multiplyScalar(on ? 2.6 + act[i] * 2 : n.muted ? 0.28 : 0.6 + act[i] * 2.5); if (root) tmp.c.multiplyScalar(1.6); im.setColorAt(k, tmp.c); });
    if (im) { im.instanceMatrix.needsUpdate = true; if (im.instanceColor) im.instanceColor.needsUpdate = true; }
    // logo sprites
    logoNodes.forEach((n, k) => { const sp = sprites.current[k]; if (!sp) return; const i = idx.get(n.id)!; const on = active.has(n.id) || (hot.current.get(n.id) ?? 0) > now;
      sp.position.set(cur[i * 3], cur[i * 3 + 1], cur[i * 3 + 2]); const s = 2.1 * (1 + Math.sin(t * 1.3 + phase[i]) * 0.05 + act[i] * 0.4); sp.scale.set(s, s, 1);
      (sp.material as THREE.SpriteMaterial).color.setScalar(on ? 1.6 + act[i] : 0.75 + act[i]); });
    // synapses (curved for inter-cluster)
    const P = lineGeo.getAttribute('position') as THREE.BufferAttribute; const C = lineGeo.getAttribute('color') as THREE.BufferAttribute;
    const pa = P.array as Float32Array, ca = C.array as Float32Array; let o = 0;
    edgeList.forEach((e) => {
      const hotE = (active.has(nodes[e.a].id) && active.has(nodes[e.b].id)) || ((hot.current.get(nodes[e.a].id) ?? 0) > now && (hot.current.get(nodes[e.b].id) ?? 0) > now);
      tmp.c.copy(col(nodes[e.inter ? e.b : e.a].cluster)).lerp(col(nodes[e.a].cluster), 0.5).multiplyScalar(hotE ? 1.8 : e.inter ? 0.1 : 0.22);
      const segs = e.inter ? SEG : 1;
      for (let s = 0; s < SEG; s++) {
        if (s < segs) { curve(e.a, e.b, s / segs, tmp.v, e.inter); pa[o] = tmp.v.x; pa[o + 1] = tmp.v.y; pa[o + 2] = tmp.v.z; curve(e.a, e.b, (s + 1) / segs, tmp.v, e.inter); pa[o + 3] = tmp.v.x; pa[o + 4] = tmp.v.y; pa[o + 5] = tmp.v.z; }
        else { pa.fill(0, o, o + 6); }
        ca[o] = ca[o + 3] = tmp.c.r; ca[o + 1] = ca[o + 4] = tmp.c.g; ca[o + 2] = ca[o + 5] = tmp.c.b; o += 6;
      }
    });
    P.needsUpdate = true; C.needsUpdate = true;
    // real-event impulses
    while (queue.current.length) {
      const ev = queue.current.shift()!; const pts = ev.path.filter((id) => idx.has(id)); if (!pts.length) continue;
      pts.forEach((id) => hot.current.set(id, now + 5000));
      if (pts.length === 1) { act[idx.get(pts[0])!] = 1; continue; }
      const allAgents = pts.every((id) => nodes[idx.get(id)!].cluster === 'agents');
      pulses.current.push({ pts, seg: 0, t: 0, color: ev.status === 'error' ? ERR.clone() : allAgents ? col('agents').multiplyScalar(2.2) : new THREE.Color(1.6, 1.8, 2.4), back: ev.status === 'ok' ? OK : ev.status === 'error' ? ERR : undefined, dur: 0.6 });
      if (pulses.current.length > MAX_PULSES) pulses.current.splice(0, pulses.current.length - MAX_PULSES);
    }
    const pm = pulseMesh.current; let pk = 0;
    for (let j = pulses.current.length - 1; j >= 0; j--) {
      const p = pulses.current[j]; p.t += dt / p.dur;
      if (p.t >= 1) { act[idx.get(p.pts[p.seg + 1])!] = 1; p.seg++; p.t = 0;
        if (p.seg >= p.pts.length - 1) { if (p.back) pulses.current[j] = { pts: [...p.pts].reverse(), seg: 0, t: 0, color: p.back.clone().multiplyScalar(2.4), dur: p.dur * 0.8 }; else pulses.current.splice(j, 1); continue; } }
      const a = idx.get(p.pts[p.seg])!, b = idx.get(p.pts[p.seg + 1])!; const e = edgeKey.get(a < b ? `${a}|${b}` : `${b}|${a}`); const inter = e !== undefined ? edgeList[e].inter : nodes[a].cluster !== nodes[b].cluster;
      if (pm) for (let k = 0; k < TRAIL && pk < MAX_PULSES * TRAIL; k++) { curve(a, b, Math.max(0, p.t - k * 0.04), tmp.v, inter); tmp.s.setScalar(0.42 - k * 0.06); tmp.m.compose(tmp.v, tmp.q, tmp.s); pm.setMatrixAt(pk, tmp.m); tmp.c.copy(p.color).multiplyScalar(1 - k / TRAIL); pm.setColorAt(pk, tmp.c); pk++; }
    }
    if (pm) { pm.count = pk; pm.instanceMatrix.needsUpdate = true; if (pm.instanceColor) pm.instanceColor.needsUpdate = true; }
  });
  void gl;
  const pick = (e: ThreeEvent<PointerEvent | MouseEvent>, n: ClusterNode | undefined, click: boolean) => { if (!n) return; e.stopPropagation(); if (click) onPick(n); else onHover(n, e.nativeEvent.offsetX, e.nativeEvent.offsetY); };
  return (
    <>
      {!mini && <Sparkles count={80} scale={[span.dist * 1.6, 30, 40]} position={span.mid.toArray()} size={1.6} speed={0.2} opacity={0.35} color="#9aa4ff" />}
      {ringGeo.map((g, i) => (
        // @ts-expect-error r3f line element (not SVG line)
        <line key={i} geometry={g}><lineBasicMaterial color={col('agents').multiplyScalar(0.35)} transparent opacity={0.35} toneMapped={false} /></line>
      ))}
      <lineSegments geometry={lineGeo} frustumCulled={false}><lineBasicMaterial vertexColors transparent opacity={0.9} toneMapped={false} depthWrite={false} blending={THREE.AdditiveBlending} /></lineSegments>
      <instancedMesh ref={inst} args={[undefined, undefined, Math.max(1, sphereNodes.length)]} frustumCulled={false}
        onPointerMove={(e) => pick(e, sphereNodes[e.instanceId ?? -1], false)} onPointerOut={() => onHover(null, 0, 0)} onClick={(e) => pick(e, sphereNodes[e.instanceId ?? -1], true)}>
        <sphereGeometry args={[1, 18, 14]} />
        <meshBasicMaterial toneMapped={false} />
      </instancedMesh>
      {logoNodes.map((n, k) => (
        <sprite key={n.id} ref={(r) => { sprites.current[k] = r; }} onPointerMove={(e) => pick(e, n, false)} onPointerOut={() => onHover(null, 0, 0)} onClick={(e) => pick(e, n, true)}>
          <spriteMaterial map={textures[k]} toneMapped={false} transparent depthWrite={false} />
        </sprite>
      ))}
      <instancedMesh ref={pulseMesh} args={[undefined, undefined, MAX_PULSES * TRAIL]} frustumCulled={false}>
        <sphereGeometry args={[1, 10, 8]} />
        <meshBasicMaterial toneMapped={false} transparent depthWrite={false} blending={THREE.AdditiveBlending} />
      </instancedMesh>
      {!mini && [...labels].map((id) => { const p = layout.pos.get(id); const n = nodes[idx.get(id) ?? -1]; if (!p || !n) return null;
        return <LabelAt key={id} id={id} idx={idx} cur={cur} text={n.label} root={n.cluster === 'agents' && !n.parentId && !n.detached} />; })}
    </>
  );
}

/** Label that follows its drifting node; fades in on mount (CSS) — mounted only while the node is live. */
function LabelAt({ id, idx, cur, text, root }: { id: string; idx: Map<string, number>; cur: Float32Array; text: string; root: boolean }) {
  const g = useRef<THREE.Group>(null);
  useFrame(() => { const i = idx.get(id); if (g.current && i !== undefined) g.current.position.set(cur[i * 3], cur[i * 3 + 1] + (root ? 2.4 : 1.2), cur[i * 3 + 2]); });
  return (
    <group ref={g}>
      <Html center zIndexRange={[5, 0]} style={{ pointerEvents: 'none' }}>
        <span className="nc3d-label" style={{ font: `${root ? 700 : 500} ${root ? 13 : 11}px ui-sans-serif, system-ui`, color: '#f0f2ff', whiteSpace: 'nowrap', textShadow: '0 0 6px rgba(120,130,255,.9), 0 1px 2px #000', animation: 'nc3d-in .6s ease-out both' }}>{text.length > 28 ? text.slice(0, 27) + '…' : text}</span>
      </Html>
    </group>
  );
}

export function hasWebGL(): boolean {
  try { const c = document.createElement('canvas'); return !!(c.getContext('webgl2') || c.getContext('webgl')); } catch { return false; }
}

/**
 * NeuralClusters — 3D living network (react-three-fiber + bloom). Same props as the 2D version, which is used
 * automatically when WebGL is unavailable. Real-only impulses; labels only on live nodes; logos on MCP/connections.
 */
export function NeuralClusters(props: NeuralClustersProps) {
  const { nodes, edges = [], events = [], activeIds = [], mini = false, height = '100%', className, style, onNodeClick, clusterLabels, showLegend = !mini } = props;
  const [gl, setGl] = useState<boolean | null>(null);
  useEffect(() => { setGl(hasWebGL()); }, []);
  const wrap = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  useEffect(() => { const el = wrap.current; if (!el || typeof IntersectionObserver === 'undefined') return; const io = new IntersectionObserver(([e]) => setVisible(e.isIntersecting)); io.observe(el); return () => io.disconnect(); }, []);
  const layout = useMemo(() => layoutClusters3D(nodes), [nodes]);
  const active = useMemo(() => withAncestors(activeIds, nodes), [activeIds, nodes]);
  const hot = useRef(new Map<string, number>()); const queue = useRef<ClusterEvent[]>([]); const seen = useRef(new Set<string>());
  const [hotTick, setHotTick] = useState(0);
  useEffect(() => {
    let fresh = false; const now = performance.now();
    events.forEach((e) => { if (seen.current.has(e.id)) return; seen.current.add(e.id); queue.current.push(e); e.path.forEach((id) => hot.current.set(id, now + 5000)); fresh = true; });
    if (fresh) { setHotTick((x) => x + 1); const t = setTimeout(() => setHotTick((x) => x + 1), 5100); return () => clearTimeout(t); }
  }, [events]);
  const labels = useMemo(() => { const now = performance.now(); const s = new Set<string>(active); hot.current.forEach((until, id) => { if (until > now) s.add(id); });
    nodes.forEach((n) => { if (n.cluster === 'agents' && !n.parentId && !n.detached) s.add(n.id); }); return s; // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [active, nodes, hotTick]);
  const [focus, setFocus] = useState<ClusterKind | null>(null);
  const [tip, setTip] = useState<{ n: ClusterNode; x: number; y: number } | null>(null);
  useEffect(() => { const k = (e: KeyboardEvent) => { if (e.key === 'Escape') setFocus(null); }; window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k); }, []);
  const L = { ...DEFAULT_CLUSTER_LABELS, ...clusterLabels };
  if (gl === false) return <NeuralClusters2D {...props} />;
  const lineage = tip ? lineageOf(tip.n.id, nodes, edges) : [];
  const rgba = (k: ClusterKind, a: number) => `rgba(${CLUSTER_COLORS[k].join(',')},${a})`;
  return (
    <div ref={wrap} className={className} data-testid="neural-clusters" style={{ position: 'relative', width: '100%', height, borderRadius: 14, overflow: 'hidden', background: 'radial-gradient(120% 90% at 30% 40%, #171a3a 0%, #0b0c1d 60%, #07070f 100%)', ...style }}
      role="img" aria-label={`Red neuronal 3D: ${nodes.length} nodos en ${CLUSTER_ORDER.length} clústeres, ${active.size} activos`}>
      <style>{'@keyframes nc3d-in{from{opacity:0;filter:none;transform:translateY(4px)}to{opacity:1;transform:none}}'}</style>
      {gl && (
        <Canvas dpr={mini ? [1, 1.25] : [1, 1.75]} frameloop={visible ? 'always' : 'never'} gl={{ antialias: !mini, powerPreference: 'high-performance', alpha: true }}
          camera={{ fov: 42, near: 0.5, far: 600, position: [0, 30, 90] }} onPointerMissed={() => { if (!mini) setFocus(null); else onNodeClick?.(nodes[0]); }}>
          <fog attach="fog" args={['#0b0c1d', 70, 220]} />
          <Scene nodes={nodes} edges={edges} layout={layout} active={active} hot={hot} queue={queue} focus={focus} mini={mini} labels={labels}
            onHover={(n, x, y) => { if (mini) return; setTip(n ? { n, x, y } : null); if (wrap.current) wrap.current.style.cursor = n ? 'pointer' : 'default'; }}
            onPick={(n) => { if (mini) { onNodeClick?.(n); return; } setFocus(n.cluster); onNodeClick?.(n); }} />
          {!mini && (
            <EffectComposer multisampling={0}>
              <Bloom intensity={1.15} luminanceThreshold={0.55} luminanceSmoothing={0.25} mipmapBlur radius={0.7} />
            </EffectComposer>
          )}
        </Canvas>
      )}
      {tip && (
        <div role="tooltip" style={{ position: 'absolute', left: Math.min(tip.x + 14, (wrap.current?.clientWidth ?? 9999) - 270), top: tip.y + 14, maxWidth: 260, pointerEvents: 'none', background: 'rgba(16,18,34,.92)', border: `1px solid ${rgba(tip.n.cluster, 0.6)}`, borderRadius: 10, padding: '8px 10px', color: '#eef', fontSize: 12, lineHeight: 1.4, zIndex: 3, boxShadow: `0 0 18px ${rgba(tip.n.cluster, 0.35)}` }}>
          <div style={{ fontWeight: 700 }}>{tip.n.label}</div>
          <div style={{ opacity: 0.75, fontSize: 11 }}>{L[tip.n.cluster]}{tip.n.kind ? ` · ${tip.n.kind}` : ''}{active.has(tip.n.id) ? ' · activo' : ''}</div>
          {lineage.map((l) => <div key={l} style={{ marginTop: 3 }}>{l}</div>)}
        </div>
      )}
      {showLegend && (
        <div aria-label="Leyenda" style={{ position: 'absolute', left: 12, bottom: 10, display: 'flex', flexWrap: 'wrap', gap: '4px 14px', fontSize: 11, color: '#c9cdf0', zIndex: 2 }}>
          {CLUSTER_ORDER.map((k) => (
            <button key={k} type="button" onClick={() => setFocus((f) => (f === k ? null : k))} aria-pressed={focus === k}
              style={{ all: 'unset', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6, color: focus === k ? '#fff' : '#c9cdf0', textShadow: focus === k ? `0 0 8px ${rgba(k, 0.9)}` : 'none' }}>
              <span style={{ width: 9, height: 9, borderRadius: 9, background: rgba(k, 1), boxShadow: `0 0 10px ${rgba(k, 0.9)}` }} />{L[k]}
            </button>
          ))}
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 9, height: 9, borderRadius: 9, background: '#1fbf87', boxShadow: '0 0 8px #1fbf87' }} />resultado ok</span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span style={{ width: 9, height: 9, borderRadius: 9, background: '#ff4d6d', boxShadow: '0 0 8px #ff4d6d' }} />error</span>
          {focus && <button type="button" onClick={() => setFocus(null)} style={{ all: 'unset', cursor: 'pointer', textDecoration: 'underline' }}>ver todo (Esc)</button>}
        </div>
      )}
      {!mini && layout.rings.length > 0 && (
        <div style={{ position: 'absolute', right: 12, top: 10, fontSize: 11, color: '#aab0e0', textAlign: 'right', lineHeight: 1.5, zIndex: 2 }}>
          {layout.rings.map((r) => <div key={r.level}>Nivel {r.level}: {r.count}</div>)}
        </div>
      )}
    </div>
  );
}
