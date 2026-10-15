import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render, screen, waitFor } from '@testing-library/react';
import { NeuralClusters2D, layoutClusters, lineageOf, withAncestors, type ClusterNode, type ClusterEdge } from '../../react/cerebro/NeuralClusters';
import { agentNeighborhood, layoutClusters3D, NeuralClusters } from '../../react/cerebro/NeuralClusters3D';

// Exercise the DOM labels without requiring a GPU in jsdom.
vi.mock('@react-three/fiber', () => ({ Canvas: () => null, useFrame: vi.fn(), useThree: vi.fn() }));
afterEach(() => { cleanup(); vi.restoreAllMocks(); });
const roots = ['violet-17', 'copper-42', 'jade-93'];
const nodes: ClusterNode[] = roots.flatMap((id, i) => [
  { id, label: ['Atlas', 'Mercury', 'Orion'][i], cluster: 'agents' },
  { id: `${id}/child`, label: `Child ${i}`, cluster: 'agents', parentId: id },
  { id: `${id}/leaf`, label: `Leaf ${i}`, cluster: 'agents', parentId: `${id}/child` },
]);
nodes.push({ id: 'loose', label: 'Detached', cluster: 'agents', detached: true },
  ...(['read', 'write', 'mcp', 'connections'] as const).map((cluster) => ({ id: cluster, label: cluster, cluster })));
const edges: ClusterEdge[] = roots.map((id) => ({ from: `${id}/leaf`, to: 'read' }));
edges.push({ from: 'read', to: 'mcp' }, { from: 'mcp', to: 'connections' });

describe('automatic agent root clusters', () => {
  it('centres every arbitrary root in a separate 3D region with its own level rings', () => {
    const layout = layoutClusters3D(nodes);
    expect(layout.agentGroups).toHaveLength(3);
    for (const group of layout.agentGroups) {
      expect(layout.pos.get(group.rootId)).toEqual(group.centre);
      expect(group.nodeIds).toEqual([group.rootId, `${group.rootId}/child`, `${group.rootId}/leaf`]);
      const rings = layout.rings.filter((r) => r.rootId === group.rootId);
      expect(rings.map((r) => [r.level, r.count])).toEqual([[1, 1], [2, 1]]);
      rings.forEach((ring) => {
        expect(ring.centre).toEqual(group.centre);
        const p = layout.pos.get(`${group.rootId}/${ring.level === 1 ? 'child' : 'leaf'}`)!;
        expect(Math.hypot(p[0] - group.centre[0], p[2] - group.centre[2])).toBeCloseTo(ring.radius);
      });
      for (const other of layout.agentGroups.filter((g) => g !== group)) {
        expect(Math.hypot(...group.centre.map((v, i) => v - other.centre[i]))).toBeGreaterThan(group.radius + other.radius);
      }
      expect(group.centre[0] + group.radius).toBeLessThan(layout.centres.read[0] - layout.radii.read);
    }
    expect(layout.pos.has('loose')).toBe(true);
    expect(layout.pos.get('connections')).toEqual(layout.centres.connections);
  });
  it.each([[1600, 900], [360, 180]])('keeps 2D branches in disjoint root regions at %sx%s', (w, h) => {
    const layout = layoutClusters(nodes, w, h, w < 500 ? 2.6 : 5);
    expect(layout.agentGroups).toHaveLength(3);
    for (const group of layout.agentGroups) {
      const root = layout.get(group.rootId)!;
      expect([root.x, root.y]).toEqual(group.centre);
      const child = layout.get(`${group.rootId}/child`)!; const leaf = layout.get(`${group.rootId}/leaf`)!;
      expect(Math.hypot(child.x - root.x, child.y - root.y)).toBeLessThan(Math.hypot(leaf.x - root.x, leaf.y - root.y));
      for (const id of group.nodeIds) {
        const p = layout.get(id)!;
        expect(Math.hypot(p.x - root.x, p.y - root.y) + p.r).toBeLessThanOrEqual(group.radius + 0.00001);
      }
      for (const other of layout.agentGroups.filter((g) => g !== group)) {
        expect(Math.hypot(group.centre[0] - other.centre[0], group.centre[1] - other.centre[1])).toBeGreaterThan(group.radius + other.radius);
      }
    }
    expect(layout.get('connections')!.x).toBeGreaterThan(layout.get('mcp')!.x);
  });
  it('keeps live ancestors, selection and tool lineage within the actual branch', () => {
    expect([...withAncestors(['copper-42/leaf'], nodes)]).toEqual(['copper-42/leaf', 'copper-42/child', 'copper-42']);
    expect([...agentNeighborhood('copper-42/child', nodes).ids]).toEqual(['copper-42/child', 'copper-42', 'copper-42/leaf']);
    expect(lineageOf('copper-42/leaf', nodes, edges)).toEqual(['Mercury › Child 1 › Leaf 1', 'Usa: read']);
    expect(lineageOf('read', nodes, edges)).toContain('MCP: mcp');
  });
  it('is deterministic when the root input order changes', () => {
    expect(layoutClusters3D([...nodes].reverse()).agentGroups.map((g) => [g.rootId, g.centre])).toEqual(layoutClusters3D(nodes).agentGroups.map((g) => [g.rootId, g.centre]));
  });
  it.each([false, true])('draws root labels and separate rings in the 2D fallback (mini=%s)', (mini) => {
    const text = vi.fn(); const arc = vi.fn(); let frame: FrameRequestCallback | undefined;
    const context = new Proxy({ fillText: text, arc, createRadialGradient: () => ({ addColorStop: vi.fn() }) }, { get: (target, key) => key in target ? target[key as keyof typeof target] : vi.fn() });
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context as unknown as CanvasRenderingContext2D);
    vi.spyOn(HTMLCanvasElement.prototype, 'clientWidth', 'get').mockReturnValue(mini ? 360 : 1600);
    vi.spyOn(HTMLCanvasElement.prototype, 'clientHeight', 'get').mockReturnValue(mini ? 180 : 900);
    vi.spyOn(window, 'requestAnimationFrame').mockImplementation((callback) => { frame = callback; return 1; });
    render(<NeuralClusters2D mini={mini} nodes={nodes} edges={edges} />);
    frame!(performance.now());
    for (const label of ['Atlas', 'Mercury', 'Orion']) expect(text.mock.calls.some(([value]) => value === label)).toBe(true);
    const layout = layoutClusters(nodes, mini ? 360 : 1600, mini ? 180 : 900);
    for (const group of layout.agentGroups) expect(arc.mock.calls.some(([x, y]) => x === group.centre[0] && y === group.centre[1])).toBe(true);
  });
  it('keeps dense tool groups outside every 2D root region', () => {
    const crowded = [...nodes, ...Array.from({ length: 100 }, (_, i): ClusterNode => ({ id: `query-${i}`, label: `Query ${i}`, cluster: 'read' }))];
    const layout = layoutClusters(crowded, 360, 180, 2.6);
    for (const group of layout.agentGroups) for (const node of crowded.filter((n) => n.cluster !== 'agents')) {
      const p = layout.get(node.id)!;
      expect(Math.hypot(p.x - group.centre[0], p.y - group.centre[1])).toBeGreaterThan(group.radius + p.r);
    }
  });
  it('shows every root label in the WebGL mini view', async () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({} as CanvasRenderingContext2D);
    render(<NeuralClusters mini nodes={nodes} edges={edges} />);
    await waitFor(() => { for (const label of ['Atlas', 'Mercury', 'Orion']) expect(screen.getByText(label)).toBeTruthy(); });
  });
});
