import { useEffect, useState } from 'react';
import { BackgroundOrbs, useSpotlight } from '@the-stoical-developers/ds-glass/react';
import { ActivityFeed, AgentCard, ApprovalsList, EisenhowerMatrix, KpiCard, Mascot, NeuralNet, RunTimeline, SchedulerTimeline, cerebroBus, type NeuralNode } from '../react/cerebro';
import '@the-stoical-developers/ds-glass/glass-pro.css';
export default { title: 'Cerebro / Glass Pro' };
const nodes: NeuralNode[] = [{ id: 'c', name: 'Cerebro', ring: 0 }, { id: 'b1', name: 'Marketing', ring: 1, parentId: 'c' }, { id: 'b2', name: 'Finanzas', ring: 1, parentId: 'c' },
  { id: 'u1', name: 'SEO', ring: 2, parentId: 'b1' }, { id: 'u2', name: 'Facturas', ring: 2, parentId: 'b2' },
  ...['seo-monitor', 'seo-writer', 'inv-reader', 'inv-poster'].map((n, i) => ({ id: n, name: n, ring: 3 as const, parentId: i < 2 ? 'u1' : 'u2' })), { id: 't1', name: 'GSC', ring: 4 }, { id: 't2', name: 'Holded', ring: 4 }];
export const Overview = () => { useSpotlight(); const [n, setN] = useState(0);
  useEffect(() => { const t = setInterval(() => { setN((x) => x + 1); cerebroBus.emit({ type: (['start', 'task', 'ok', 'appr'] as const)[Math.floor(Math.random() * 4)], agent: 'seo-writer' }); }, 2500); return () => clearInterval(t); }, []);
  const now = Date.now();
  return (<div className="g-page" style={{ padding: 24 }}><BackgroundOrbs />
    <div style={{ position: 'relative', zIndex: 2, display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 14 }}>
      <KpiCard label="Agentes activos" value={12 + (n % 3)} delta={2} spark={[3, 5, 4, 6, 8, 7, 9]} /><KpiCard label="Ejecuciones hoy" value={340 + n} /><KpiCard label="Éxito" value={97.4} decimals={1} suffix="%" tone="success" /><KpiCard label="Coste" value={41.2} decimals={2} suffix="€" tone="warning" />
      <div className="g-card" style={{ gridColumn: 'span 2', height: 360 }}><Mascot /></div>
      <div className="g-card" style={{ gridColumn: 'span 2', height: 360 }}><NeuralNet nodes={nodes} links={[{ from: 'seo-monitor', to: 't1' }, { from: 'inv-poster', to: 't2' }]} runningIds={['seo-writer']} /></div>
      <div className="g-card g-card--pad" style={{ gridColumn: 'span 2' }}><EisenhowerMatrix tasks={[{ id: '1', title: 'Responder auditoría', urgent: true, important: true }, { id: '2', title: 'Plan Q4', urgent: false, important: true }]} /></div>
      <AgentCard id="seo-writer" name="seo-writer" role="COMMAND · ejecutor" state="running" progress={0.6} lines={[{ id: '1', text: 'GSC: 1.204 queries' }, { id: '2', text: 'drafting post…' }]} />
      <div className="g-card g-card--pad"><ApprovalsList items={[{ id: 'a', title: 'Publicar post SEO', requestedBy: 'seo-writer' }]} onApprove={() => {}} onReject={() => {}} /></div>
      <div className="g-card g-card--pad" style={{ gridColumn: 'span 2' }}><RunTimeline now={now} runs={[{ id: 'r1', label: 'seo-writer', status: 'running', start: now - 20 * 60e3 }, { id: 'r2', label: 'inv-reader', status: 'succeeded', start: now - 90 * 60e3, end: now - 70 * 60e3 }]} /></div>
      <div className="g-card g-card--pad" style={{ gridColumn: 'span 2' }}><SchedulerTimeline now={now} items={[{ id: 's', label: 'daily', at: now + 3 * 3600e3 }]} /><ActivityFeed items={[{ id: 'x', title: 'inv-reader completó', at: now - 60e3, tone: 'success' }]} /></div>
    </div></div>);
};
