import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

interface NeuralCameraProps { target: [number, number, number]; distance: number; selected: boolean; revision: number; mini: boolean }

/** Camera ownership: automatic overview, explicit smooth focus, then OrbitControls. */
export function NeuralCamera({ target, distance, selected, revision, mini }: NeuralCameraProps) {
  const { camera } = useThree();
  const controls = useRef<React.ComponentRef<typeof OrbitControls>>(null);
  const mode = useRef<'auto' | 'focus' | 'manual'>('auto');
  const lookAt = useRef(new THREE.Vector3(...target));
  const desired = useRef(new THREE.Vector3());
  const destination = useRef(new THREE.Vector3());
  // Live node/layout refreshes must not reclaim a camera the user is navigating.
  useEffect(() => { mode.current = selected ? 'focus' : 'auto'; }, [selected, revision]);
  useFrame(({ clock }) => {
    if (!mini && mode.current === 'manual') return;
    destination.current.set(...target);
    lookAt.current.lerp(destination.current, 0.04);
    const focus = mode.current === 'focus';
    const az = focus ? 0.05 : Math.sin(clock.elapsedTime * 0.07) * 0.32 + 0.05;
    const el = focus ? 0.42 : 0.42 + Math.sin(clock.elapsedTime * 0.05) * 0.07;
    const d = THREE.MathUtils.lerp(camera.position.distanceTo(lookAt.current), distance, 0.04);
    desired.current.set(lookAt.current.x + Math.sin(az) * Math.cos(el) * d, lookAt.current.y + Math.sin(el) * d, lookAt.current.z + Math.cos(az) * Math.cos(el) * d);
    camera.position.lerp(desired.current, focus ? 0.08 : 1);
    camera.lookAt(lookAt.current);
    if (controls.current) { controls.current.target.copy(lookAt.current); controls.current.update(); }
    if (!mini && focus && lookAt.current.distanceTo(destination.current) < 0.02 && Math.abs(camera.position.distanceTo(lookAt.current) - distance) < 0.05) mode.current = 'manual';
  });
  return mini ? null : <OrbitControls ref={controls} makeDefault enableDamping dampingFactor={0.15} enablePan enableZoom enableRotate minDistance={4} maxDistance={Math.max(600, distance * 4)} onStart={() => { mode.current = 'manual'; }} />;
}
