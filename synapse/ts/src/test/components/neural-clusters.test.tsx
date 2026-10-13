import { describe, it, expect, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { NeuralClusters, agentLevels, withAncestors, lineageOf, layoutClusters, resolveBrand, brandInitials, type ClusterNode, type ClusterEdge } from '../../react/cerebro';
afterEach(() => cleanup());

const nodes: ClusterNode[] = [
  { id: 'me', label: 'Tú', cluster: 'agents' },
  { id: 'cmo', label: 'CMO', cluster: 'agents', parentId: 'me' },
  { id: 'uc', label: 'SEO', cluster: 'agents', parentId: 'cmo' },
  { id: 'a1', label: 'seo-monitor', cluster: 'agents', parentId: 'uc' },
  { id: 't1', label: 'gsc_query', cluster: 'read' },
  { id: 't2', label: 'create_pr', cluster: 'write' },
  { id: 'm1', label: 'github', cluster: 'mcp', brand: 'github' },
  { id: 'c1', label: 'GitHub', cluster: 'connections', brand: 'github' },
  { id: 'c2', label: 'Search Console', cluster: 'connections', brand: 'gsc' },
];
const edges: ClusterEdge[] = [{ from: 'a1', to: 't1' }, { from: 'a1', to: 't2' }, { from: 't2', to: 'm1' }, { from: 'm1', to: 'c1' }, { from: 't1', to: 'c2' }];

describe('neural clusters helpers', () => {
  it('derives hierarchy levels from parents', () => {
    const lv = agentLevels(nodes); expect(lv.get('me')).toBe(0); expect(lv.get('cmo')).toBe(1); expect(lv.get('a1')).toBe(3);
  });
  it('lights the parent chain of active agents', () => {
    expect([...withAncestors(['a1'], nodes)].sort()).toEqual(['a1', 'cmo', 'me', 'uc']);
  });
  it('describes lineage', () => {
    expect(lineageOf('a1', nodes, edges)[0]).toBe('Tú › CMO › SEO › seo-monitor');
    expect(lineageOf('m1', nodes, edges).join('|')).toContain('Conexión: GitHub');
  });
  it('lays out agents on concentric rings around Tú and separates clusters', () => {
    const p = layoutClusters(nodes, 1600, 900);
    const me = p.get('me')!; const d = (id: string) => Math.hypot(p.get(id)!.x - me.x, p.get(id)!.y - me.y);
    expect(d('cmo')).toBeLessThan(d('uc')); expect(d('uc')).toBeLessThan(d('a1'));
    expect(p.get('c1')!.x).toBeGreaterThan(p.get('m1')!.x); expect(p.get('m1')!.x).toBeGreaterThan(p.get('t1')!.x); expect(p.get('t1')!.y).toBeLessThan(p.get('t2')!.y);
  });
  it('resolves bundled logos offline with initials fallback', () => {
    expect(resolveBrand('gsc')?.slug).toBe('googlesearchconsole'); expect(resolveBrand('github-mcp')?.slug).toBe('github');
    expect(resolveBrand('Neon')?.slug).toBe('neon'); expect(resolveBrand('PostHog')?.slug).toBe('posthog'); expect(resolveBrand('dataforseo')?.slug).toBe('dataforseo');
    expect(resolveBrand('acme internal')).toBeNull(); expect(brandInitials('acme internal')).toBe('AI');
  });
});
describe('<NeuralClusters>', () => {
  it('renders canvas with accessible summary and legend that focuses clusters', () => {
    render(<NeuralClusters nodes={nodes} edges={edges} activeIds={['a1']} events={[{ id: 'e1', path: ['a1', 't2', 'm1', 'c1'], status: 'ok' }]} height={400} />);
    expect(screen.getByRole('img').getAttribute('aria-label')).toContain('4 activos');
    const b = screen.getByRole('button', { name: /Servidores MCP/ }); fireEvent.click(b); expect(b.getAttribute('aria-pressed')).toBe('true');
    expect(screen.getByText(/ver todo/)).toBeTruthy();
  });
  it('mini hides legend', () => { render(<NeuralClusters mini nodes={nodes} edges={edges} />); expect(screen.queryByLabelText('Leyenda')).toBeNull(); });
});
