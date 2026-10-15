import { useEffect, useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { NeuralClusters, NeuralClusters2D, type ClusterEvent, type ClusterNode, type ClusterEdge } from '../react/cerebro';

const conns = [['github', 'GitHub'], ['google', 'Google'], ['posthog', 'PostHog'], ['neon', 'Neon'], ['dataforseo', 'DataForSEO'], ['sentry', 'Sentry'], ['slack', 'Slack']];
const nodes: ClusterNode[] = [
  { id: 'me', label: 'Tú', cluster: 'agents' },
  ...['CMO', 'CFO', 'CTO'].map((l) => ({ id: l, label: l, cluster: 'agents' as const, parentId: 'me', kind: 'C-level' })),
  ...['SEO', 'Facturas', 'Plataforma'].map((l, i) => ({ id: 'uc' + i, label: l, cluster: 'agents' as const, parentId: ['CMO', 'CFO', 'CTO'][i], kind: 'Caso de uso' })),
  ...Array.from({ length: 9 }, (_, i) => ({ id: 'a' + i, label: 'agente-' + i, cluster: 'agents' as const, parentId: 'uc' + (i % 3), kind: i % 2 ? 'executor' : 'monitor' })),
  ...Array.from({ length: 8 }, (_, i) => ({ id: 'r' + i, label: 'query_' + i, cluster: 'read' as const })),
  ...Array.from({ length: 6 }, (_, i) => ({ id: 'w' + i, label: 'command_' + i, cluster: 'write' as const })),
  ...['github', 'sentry', 'neon'].map((m) => ({ id: 'm-' + m, label: m + '-mcp', cluster: 'mcp' as const, brand: m })),
  ...conns.map(([b, l]) => ({ id: 'c-' + b, label: l, cluster: 'connections' as const, brand: b })),
];
const edges: ClusterEdge[] = [
  ...Array.from({ length: 9 }, (_, i) => [{ from: 'a' + i, to: 'r' + (i % 8) }, { from: 'a' + i, to: 'w' + (i % 6) }]).flat(),
  ...Array.from({ length: 8 }, (_, i) => ({ from: 'r' + i, to: 'c-' + conns[i % 7][0] })),
  { from: 'w0', to: 'm-github' }, { from: 'w1', to: 'm-sentry' }, { from: 'w2', to: 'm-neon' },
  { from: 'm-github', to: 'c-github' }, { from: 'm-sentry', to: 'c-sentry' }, { from: 'm-neon', to: 'c-neon' },
];
const meta: Meta<typeof NeuralClusters> = { title: 'Cerebro/NeuralClusters', component: NeuralClusters, parameters: { backgrounds: { default: 'dark' } } };
export default meta;
type S = StoryObj<typeof NeuralClusters>;
export const Idle: S = { render: () => <div style={{ height: 640, background: '#0b0c1a' }}><NeuralClusters nodes={nodes} edges={edges} /></div> };
/** Story-only event feed so the motion is visible; in the app events come from real runs. */
export const LiveRun: S = {
  render: () => {
    const [ev, setEv] = useState<ClusterEvent[]>([]);
    useEffect(() => { let n = 0; const id = setInterval(() => { n++; setEv((e) => [...e.slice(-20), { id: 'e' + n, path: ['a0', 'w0', 'm-github', 'c-github'], status: n % 4 ? 'ok' : 'error' }]); }, 1500); return () => clearInterval(id); }, []);
    return <div style={{ height: 640, background: '#0b0c1a' }}><NeuralClusters nodes={nodes} edges={edges} activeIds={['a0']} events={ev} /></div>;
  },
};
export const Mini: S = { render: () => <div style={{ height: 180, width: 360, background: '#0b0c1a' }}><NeuralClusters mini nodes={nodes} edges={edges} activeIds={['a3']} /></div> };

const forest: ClusterNode[] = [
  ...nodes,
  { id: 'atlas', label: 'Atlas', cluster: 'agents' },
  { id: 'atlas-observer', label: 'Observer', cluster: 'agents', parentId: 'atlas' },
  { id: 'atlas-check', label: 'Check', cluster: 'agents', parentId: 'atlas-observer' },
  { id: 'orion', label: 'Orion', cluster: 'agents' },
  { id: 'orion-reviewer', label: 'Reviewer', cluster: 'agents', parentId: 'orion' },
];
const forestEdges: ClusterEdge[] = [...edges, { from: 'atlas-check', to: 'r0' }, { from: 'orion-reviewer', to: 'w0' }];
export const MultipleRoots: S = { render: () => <div style={{ height: 640 }}><NeuralClusters nodes={forest} edges={forestEdges} activeIds={['atlas-check']} /></div> };
export const MultipleRootsMini: S = { render: () => <div style={{ height: 180, width: 360 }}><NeuralClusters mini nodes={forest} edges={forestEdges} /></div> };
export const MultipleRootsFallback: S = { render: () => <div style={{ height: 640, background: '#0b0c1a' }}><NeuralClusters2D nodes={forest} edges={forestEdges} activeIds={['atlas-check']} /></div> };
