/** Tiny typed event bus: real backend events (SSE/polling diffs) drive Cerebro motion. */
export type CerebroEventType = 'start' | 'task' | 'appr' | 'fail' | 'ok';
export interface CerebroEvent { type: CerebroEventType; agent?: string; quadrant?: Quadrant; id?: string; label?: string; at?: number }
export type Quadrant = 'hacer' | 'planificar' | 'delegar' | 'eliminar';
type Fn = (e: CerebroEvent) => void;
export interface CerebroBus { on(fn: Fn): () => void; emit(e: CerebroEvent): void }
export function createCerebroBus(): CerebroBus {
  const subs = new Set<Fn>();
  return { on(fn) { subs.add(fn); return () => { subs.delete(fn); }; }, emit(e) { const ev = { at: Date.now(), ...e }; subs.forEach((f) => { try { f(ev); } catch { /* isolate */ } }); } };
}
/** Default singleton used by Mascot/NeuralNet when no bus prop is given. */
export const cerebroBus = createCerebroBus();
export type Mood = 'idle' | 'run' | 'task' | 'appr' | 'fail' | 'ok';
export const MOOD_COLORS: Record<Mood, string> = { idle: '#8b5cff', run: '#4f7bff', task: '#22c7c7', appr: '#ff9f43', fail: '#ff4d6d', ok: '#1fbf87' };
export function moodForEvent(t: CerebroEventType): Mood { return t === 'start' ? 'run' : t; }
