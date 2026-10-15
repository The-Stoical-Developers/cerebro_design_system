import { afterEach, describe, expect, it, vi } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import * as THREE from 'three';
import { NeuralCamera } from '../../react/cerebro/NeuralCamera';

const state = vi.hoisted(() => ({ frame: (_: { clock: { elapsedTime: number } }) => {}, start: () => {}, camera: null as THREE.PerspectiveCamera | null }));
vi.mock('@react-three/fiber', () => ({ useThree: () => ({ camera: state.camera }), useFrame: (callback: typeof state.frame) => { state.frame = callback; } }));
vi.mock('@react-three/drei', () => ({ OrbitControls: ({ onStart }: { onStart: () => void }) => { state.start = onStart ?? (() => {}); return null; } }));
afterEach(cleanup);
const tick = () => state.frame({ clock: { elapsedTime: 10 } });

describe('neural camera ownership', () => {
  it('stops camera writes on interaction, keeps manual view across live layout updates, and resumes on explicit focus/reset', () => {
    state.camera = new THREE.PerspectiveCamera(); state.camera.position.set(0, 30, 90);
    const { rerender } = render(<NeuralCamera target={[0, 0, 0]} distance={80} selected={false} revision={0} mini={false} />);
    tick(); const automatic = state.camera.position.clone();
    state.start(); tick(); expect(state.camera.position.equals(automatic)).toBe(true);
    rerender(<NeuralCamera target={[5, 0, 0]} distance={90} selected={false} revision={0} mini={false} />);
    tick(); expect(state.camera.position.equals(automatic)).toBe(true);
    rerender(<NeuralCamera target={[5, 0, 0]} distance={25} selected revision={1} mini={false} />);
    tick(); expect(state.camera.position.equals(automatic)).toBe(false);
    state.start(); const focused = state.camera.position.clone();
    rerender(<NeuralCamera target={[0, 0, 0]} distance={80} selected={false} revision={2} mini={false} />);
    tick(); expect(state.camera.position.equals(focused)).toBe(false);
  });
});
