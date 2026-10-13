import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, cleanup, fireEvent } from '@testing-library/react';
import { AgentCard, ApprovalsList, ActivityFeed, EisenhowerMatrix, KpiCard, ProgressRing, RunTimeline, SchedulerTimeline, createCerebroBus, layoutNeural, quadrantOf, relTime, moodForEvent } from '../../react/cerebro';
afterEach(() => cleanup());
describe('cerebro bus', () => {
  it('delivers events and unsubscribes', () => {
    const b = createCerebroBus(); const fn = vi.fn(); const off = b.on(fn);
    b.emit({ type: 'start', agent: 'a1' }); off(); b.emit({ type: 'ok' });
    expect(fn).toHaveBeenCalledTimes(1); expect(fn.mock.calls[0][0].agent).toBe('a1');
  });
  it('maps events to moods', () => { expect(moodForEvent('start')).toBe('run'); expect(moodForEvent('fail')).toBe('fail'); });
});
describe('eisenhower', () => {
  it('classifies quadrants', () => {
    expect(quadrantOf({ urgent: true, important: true })).toBe('hacer');
    expect(quadrantOf({ urgent: false, important: true })).toBe('planificar');
    expect(quadrantOf({ urgent: true, important: false })).toBe('delegar');
    expect(quadrantOf({ urgent: false, important: false })).toBe('eliminar');
  });
  it('renders tasks in quadrants', () => {
    render(<EisenhowerMatrix tasks={[{ id: '1', title: 'Pagar IVA', urgent: true, important: true }]} />);
    expect(screen.getByRole('region', { name: 'Hacer' }).textContent).toContain('Pagar IVA');
  });
});
describe('components', () => {
  it('progress ring clamps', () => { render(<ProgressRing value={1.7} label="p" />); expect(screen.getByRole('progressbar').getAttribute('aria-valuenow')).toBe('100'); });
  it('agent card exposes data-agent', () => {
    const { container } = render(<AgentCard id="ag1" name="Monitor SEO" state="running" lines={[{ id: 'l', text: 'fetching' }]} runs={3} />);
    expect(container.querySelector('[data-agent="ag1"]')).toBeTruthy(); expect(screen.getByText('Ejecutando')).toBeTruthy(); expect(screen.getByText('fetching')).toBeTruthy();
  });
  it('approvals call back', () => {
    const ok = vi.fn(), ko = vi.fn(); render(<ApprovalsList items={[{ id: 'x', title: 'Publicar post' }]} onApprove={ok} onReject={ko} />);
    fireEvent.click(screen.getByText('Aprobar')); fireEvent.click(screen.getByText('Rechazar')); expect(ok).toHaveBeenCalledWith('x'); expect(ko).toHaveBeenCalledWith('x');
  });
  it('approvals empty state', () => { render(<ApprovalsList items={[]} />); expect(screen.getByText('No hay aprobaciones pendientes')).toBeTruthy(); });
  it('activity feed + relTime', () => {
    const now = Date.now(); expect(relTime(now - 5 * 60e3, now)).toBe('hace 5 min'); expect(relTime('bad')).toBe('');
    render(<ActivityFeed items={[{ id: '1', title: 'Run ok', at: now }]} />); expect(screen.getByText('Run ok')).toBeTruthy();
  });
  it('kpi renders label', () => { render(<KpiCard label="Agentes" value={12} delta={2} spark={[1, 3, 2]} />); expect(screen.getByText('Agentes')).toBeTruthy(); });
  it('timelines render', () => {
    const now = Date.now();
    render(<><RunTimeline now={now} runs={[{ id: 'r', label: 'run-1', status: 'running', start: now - 60e3 }]} /><SchedulerTimeline now={now} items={[{ id: 's', label: 'daily', at: now + 3600e3 }]} /></>);
    expect(screen.getByText('run-1')).toBeTruthy(); expect(screen.getByLabelText('ahora')).toBeTruthy();
  });
});
describe('neural layout', () => {
  it('places parents at mean angle of children', () => {
    const a = layoutNeural([
      { id: 'c', name: 'Cerebro', ring: 0 }, { id: 'b', name: 'BC', ring: 1, parentId: 'c' }, { id: 'u', name: 'UC', ring: 2, parentId: 'b' },
      { id: 'a1', name: 'A1', ring: 3, parentId: 'u' }, { id: 'a2', name: 'A2', ring: 3, parentId: 'u' },
    ]);
    expect(a.get('a1')).toBeCloseTo(-Math.PI / 2); expect(a.get('u')).toBeDefined(); expect(a.get('b')).toBeCloseTo(a.get('u')!);
  });
});
