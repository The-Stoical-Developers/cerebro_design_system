import { describe, it, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { vi } from 'vitest';
import { layoutClusters3D, RING_GAP, NeuralClusters, agentNeighborhood, AgentPanel, type ClusterNode } from '../../react/cerebro';

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

describe('agent selection', () => {
  it('neighbourhood = self + parent + children', () => {
    const h = agentNeighborhood('d1', nodes);
    expect(h.parent?.id).toBe('c1'); expect(h.children.map((c) => c.id)).toEqual(['e1', 'e2']);
    expect([...h.ids].sort()).toEqual(['c1', 'd1', 'e1', 'e2']);
    expect(agentNeighborhood('r', nodes).ids.size).toBe(0);
  });
  it('side panel shows role/status and navigates parent/children', () => {
    const onSelect = vi.fn(); const onClose = vi.fn();
    const n2 = nodes.map((n) => (n.id === 'd1' ? { ...n, role: 'Director', status: 'archivado' } : n));
    const { getByText, getByLabelText } = render(<AgentPanel info={agentNeighborhood('d1', n2)} onSelect={onSelect} onClose={onClose} />);
    expect(getByText('Director')).toBeTruthy(); expect(getByText('archivado')).toBeTruthy();
    fireEvent.click(getByText(/CMO/)); expect(onSelect).toHaveBeenCalledWith('c1');
    fireEvent.click(getByText(/Emp2/)); expect(onSelect).toHaveBeenCalledWith('e2');
    fireEvent.click(getByLabelText(/Cerrar/)); expect(onClose).toHaveBeenCalled();
  });
});

describe('ver ficha', () => {
  it('panel shows a "ver ficha" link that only opens on explicit click; parent/children stay in-graph', () => {
    const onSelect = vi.fn(); const onOpen = vi.fn();
    const { getByTestId, getByText } = render(<AgentPanel info={agentNeighborhood('d1', nodes)} onSelect={onSelect} onClose={() => {}} href="/agents/d1" onOpen={onOpen} />);
    const a = getByTestId('ver-ficha');
    expect(a.getAttribute('href')).toBe('/agents/d1'); expect(a.getAttribute('aria-label')).toBe('Ver ficha de Dir');
    fireEvent.click(getByText(/CMO/)); expect(onSelect).toHaveBeenCalledWith('c1'); expect(onOpen).not.toHaveBeenCalled();
    fireEvent.click(a); expect(onOpen).toHaveBeenCalledWith(expect.objectContaining({ id: 'd1' }));
  });
  it('no button without href/callback', () => {
    const { queryByTestId } = render(<AgentPanel info={agentNeighborhood('d1', nodes)} onSelect={() => {}} onClose={() => {}} />);
    expect(queryByTestId('ver-ficha')).toBeNull();
  });
});
