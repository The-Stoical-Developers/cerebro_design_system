import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { layoutClusters3D, RING_GAP, NeuralClusters, type ClusterNode } from '../../react/cerebro';

const nodes: ClusterNode[] = [
  { id: 'me', label: 'Tú', cluster: 'agents' },
  { id: 'c1', label: 'CMO', cluster: 'agents', parentId: 'me' },
  { id: 'c2', label: 'CTO', cluster: 'agents', parentId: 'me' },
  { id: 'd1', label: 'Dir', cluster: 'agents', parentId: 'c1' },
  { id: 'e1', label: 'Emp', cluster: 'agents', parentId: 'd1' },
  { id: 'e2', label: 'Emp2', cluster: 'agents', parentId: 'd1' },
  { id: 'x', label: 'Suelto', cluster: 'agents', detached: true },
  { id: 'r', label: 'read', cluster: 'read' },
  { id: 'm', label: 'mcp', cluster: 'mcp' },
  { id: 'k', label: 'GitHub', cluster: 'connections', brand: 'github' },
];

describe('layoutClusters3D', () => {
  it('one ring per hierarchy level with only that level, user at centre', () => {
    const l = layoutClusters3D(nodes);
    expect(l.pos.get('me')).toEqual([0, 0, 0]);
    expect(l.rings.map((r) => [r.level, r.count])).toEqual([[1, 2], [2, 1], [3, 2]]);
    for (const [id, lv] of [['c1', 1], ['c2', 1], ['d1', 2], ['e1', 3], ['e2', 3]] as const) {
      const p = l.pos.get(id)!; expect(Math.hypot(p[0], p[2])).toBeCloseTo(lv * RING_GAP, 5);
    }
  });
  it('detached agents are not on any ring and other clusters sit apart', () => {
    const l = layoutClusters3D(nodes);
    expect(l.pos.get('x')![1]).toBeLessThan(-3);
    expect(l.centres.mcp[0]).toBeGreaterThan(l.centres.read[0]);
    expect(l.centres.connections[0]).toBeGreaterThan(l.centres.mcp[0]);
  });
  it('falls back to 2D without WebGL', () => {
    const { getByTestId } = render(<NeuralClusters nodes={nodes} height={300} />);
    expect(getByTestId('neural-clusters')).toBeTruthy();
  });
});
