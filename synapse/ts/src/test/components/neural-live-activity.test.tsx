import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, screen } from '@testing-library/react';
import { NeuralClusters2D, activityEdgeIsHot, activityEdgeKey, activityEventAllowed, activityNodes, activityPulseStatus, type ClusterNode } from '../../react/cerebro/NeuralClusters';
import { NeuralClusters } from '../../react/cerebro/NeuralClusters3D';

const nodes: ClusterNode[] = [
  { id: 'root', label: 'Root', cluster: 'agents' },
  { id: 'a', label: 'Agent A', parentId: 'root', cluster: 'agents' },
  { id: 'b', label: 'Agent B', parentId: 'root', cluster: 'agents' },
  { id: 'tool', label: 'Shared tool', cluster: 'read' },
];
const edges = [{ from: 'a', to: 'tool' }, { from: 'b', to: 'tool' }];
afterEach(cleanup);

describe('shared 2D/3D live activity semantics', () => {
  it('does not infer parent activity', () => {
    expect([...activityNodes(['a'], nodes, true)]).toEqual(['a']);
    expect([...activityNodes(['a'], nodes, false)]).toEqual(['a', 'root']);
  });
  it('does not illuminate another caller of an active shared tool, even with transient history', () => {
    const active = new Set(['a', 'b', 'tool']);
    const exact = new Set([activityEdgeKey('a', 'tool')]);
    expect(activityEdgeIsHot('a', 'tool', active, exact, true, false)).toBe(true);
    expect(activityEdgeIsHot('b', 'tool', active, exact, true, true)).toBe(false);
    expect(activityEdgeIsHot('a', 'tool', active, new Set(), true, true)).toBe(false);
    expect(activityEdgeIsHot('b', 'tool', active, exact, false, false)).toBe(true);
  });
  it('plays exactly the supplied direction with terminal color and no generated return', () => {
    expect(activityPulseStatus('start', true)).toEqual({ outbound: 'start', back: undefined });
    expect(activityPulseStatus('ok', true)).toEqual({ outbound: 'ok', back: undefined });
    expect(activityPulseStatus('error', true)).toEqual({ outbound: 'error', back: undefined });
    expect(activityPulseStatus('ok', false)).toEqual({ outbound: 'start', back: 'ok' });
  });
  it('accepts reverse responses but rejects unknown nodes and nonexistent topology hops', () => {
    expect(activityEventAllowed({ id: 'result', path: ['tool', 'a'], status: 'ok' }, nodes, edges)).toBe(true);
    expect(activityEventAllowed({ id: 'bad', path: ['a', 'missing', 'tool'] }, nodes, edges)).toBe(false);
    expect(activityEventAllowed({ id: 'bad', path: ['a', 'b'] }, nodes, edges)).toBe(false);
    expect(activityEventAllowed({ id: 'parent', path: ['root', 'a'] }, nodes, edges)).toBe(false);
  });
});

for (const Renderer of [NeuralClusters2D, NeuralClusters]) {
  it(`${Renderer.name} reports exact current activity and clears on stale input`, () => {
    const { rerender } = render(<Renderer nodes={nodes} edges={edges} liveActivity activeIds={['a']} activeEdges={[edges[0]]} events={[{ id: 'call', path: ['a', 'tool'], status: 'start' }]} />);
    expect(screen.getByRole('img').getAttribute('aria-label')).toContain('1 activos');
    rerender(<Renderer nodes={nodes} edges={edges} liveActivity activeIds={[]} activeEdges={[]} events={[]} />);
    expect(screen.getByRole('img').getAttribute('aria-label')).toContain('0 activos');
  });
}
