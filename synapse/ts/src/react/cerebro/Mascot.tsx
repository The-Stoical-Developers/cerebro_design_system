import { useEffect, useRef } from 'react';
import { cerebroBus, MOOD_COLORS, moodForEvent, type CerebroBus, type Mood } from './bus';
export interface MascotProps {
  /** Small variant: no bloom, gaze follows cursor. */ mini?: boolean;
  bus?: CerebroBus; onMood?: (m: Mood) => void; className?: string; size?: number | string;
  /** Disable bloom post-processing even in hero mode. */ bloom?: boolean;
}
/**
 * Cerebro mascot — glass nucleus with orbiting electrons (three.js, optional peer dep).
 * Mood/energy react to bus events (start → run, task, appr, fail flicker, ok). Lazy-loads three on mount.
 */
export function Mascot({ mini = false, bus = cerebroBus, onMood, className, size, bloom = true }: MascotProps) {
  const ref = useRef<HTMLDivElement>(null); const moodCb = useRef(onMood); moodCb.current = onMood;
  useEffect(() => {
    const el = ref.current; if (!el) return; let disposed = false; let cleanup = () => {};
    (async () => {
      let THREE: typeof import('three');
      try { THREE = await import('three'); } catch { el.dataset.fallback = 'true'; return; }
      if (disposed) return;
      const W = () => Math.max(1, el.clientWidth), H = () => Math.max(1, el.clientHeight);
      let r: import('three').WebGLRenderer;
      try { r = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' }); } catch { el.dataset.fallback = 'true'; return; }
      r.setPixelRatio(Math.min(window.devicePixelRatio || 1, mini ? 2 : 1.5)); r.setSize(W(), H()); r.setClearColor(0x06041a, mini ? 0 : 1);
      r.toneMapping = THREE.ACESFilmicToneMapping; r.toneMappingExposure = 1.1; el.appendChild(r.domElement);
      const sc = new THREE.Scene(); const cam = new THREE.PerspectiveCamera(35, W() / H(), 0.1, 100); cam.position.set(0, 0, mini ? 7.5 : 9);
      sc.add(new THREE.AmbientLight(0xffffff, 0.6)); const dl = new THREE.DirectionalLight(0xffffff, 2.2); dl.position.set(3, 4, 5); sc.add(dl);
      const pl = new THREE.PointLight(0x8b5cff, 30, 20); sc.add(pl);
      const glowTex = (() => { const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d')!; const g = x.createRadialGradient(32, 32, 0, 32, 32, 32); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.25, 'rgba(255,255,255,.6)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, 64, 64); return new THREE.CanvasTexture(c); })();
      const body = new THREE.Group(); sc.add(body);
      const rim = { uCol: { value: new THREE.Color(0x8b5cff) }, uP: { value: 3 }, uI: { value: 1.2 } };
      const shell = new THREE.Mesh(new THREE.IcosahedronGeometry(1, mini ? 4 : 6), new THREE.ShaderMaterial({ uniforms: rim, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
        vertexShader: 'varying vec3 vN;varying vec3 vV;void main(){vec4 mv=modelViewMatrix*vec4(position,1.);vN=normalize(normalMatrix*normal);vV=normalize(-mv.xyz);gl_Position=projectionMatrix*mv;}',
        fragmentShader: 'uniform vec3 uCol;uniform float uP;uniform float uI;varying vec3 vN;varying vec3 vV;void main(){float f=pow(1.-abs(dot(vN,vV)),uP);vec3 c=mix(uCol,vec3(.8,.9,1.),f*f*f*.5)*f*uI+uCol*.12;gl_FragColor=vec4(c,f*.9+.05);}' }));
      const basePos = (shell.geometry.attributes.position.array as Float32Array).slice(); body.add(shell);
      const coreMat = new THREE.MeshStandardMaterial({ color: 0x8b5cff, emissive: 0x8b5cff, emissiveIntensity: 3, roughness: 0.3 }); const core = new THREE.Mesh(new THREE.IcosahedronGeometry(0.42, 4), coreMat); body.add(core);
      const iris = new THREE.Mesh(new THREE.SphereGeometry(0.09, 24, 24), new THREE.MeshBasicMaterial({ color: 0xe8f4ff })); body.add(iris);
      const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: 0x8b5cff, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false })); halo.scale.setScalar(4); body.add(halo);
      const ORB = [0x4f7bff, 0x22c7c7, 0xff6fb5];
      const orbits = [0, 1, 2].map((i) => { const g = new THREE.Group(); g.rotation.set(i * 1.05 + 0.3, i * 0.7, i * 0.4); sc.add(g);
        const ring = new THREE.Mesh(new THREE.TorusGeometry(1.75 + i * 0.18, 0.008, 8, 160), new THREE.MeshBasicMaterial({ color: ORB[i], transparent: true, opacity: 0.35, blending: THREE.AdditiveBlending })); g.add(ring);
        const es = [0, 1].map((k) => { const e = new THREE.Mesh(new THREE.SphereGeometry(0.075, 16, 16), new THREE.MeshBasicMaterial({ color: ORB[i] }));
          const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex, color: ORB[i], blending: THREE.AdditiveBlending, transparent: true, depthWrite: false, opacity: 0.8 })); s.scale.setScalar(0.45); e.add(s); g.add(e); return { e, s, ph: k * Math.PI + i }; });
        return { g, ring, es, base: g.rotation.clone(), R: 1.75 + i * 0.18 }; });
      let comp: { render(): void; setSize(w: number, h: number): void } | null = null;
      if (!mini && bloom) { try {
        const [{ EffectComposer }, { RenderPass }, { UnrealBloomPass }, { OutputPass }] = await Promise.all([
          import('three/examples/jsm/postprocessing/EffectComposer.js'), import('three/examples/jsm/postprocessing/RenderPass.js'),
          import('three/examples/jsm/postprocessing/UnrealBloomPass.js'), import('three/examples/jsm/postprocessing/OutputPass.js')]);
        const c = new EffectComposer(r); c.addPass(new RenderPass(sc, cam)); c.addPass(new UnrealBloomPass(new THREE.Vector2(W(), H()), 0.75, 0.45, 0.4)); c.addPass(new OutputPass()); comp = c;
      } catch { comp = null; } }
      const st = { energy: 0, mood: 'idle' as Mood, moodT: 0, flick: 0, hit: 0, gaze: new THREE.Vector2(), gazeT: new THREE.Vector2(), col: new THREE.Color(0x8b5cff) };
      const setMood = (m: Mood, d = 1800) => { st.mood = m; st.moodT = performance.now() + d; moodCb.current?.(m); };
      const mouse = { x: 0, y: 0 }; const mm = (e: PointerEvent) => { mouse.x = e.clientX; mouse.y = e.clientY; }; window.addEventListener('pointermove', mm);
      const off = bus.on((e) => { const m = moodForEvent(e.type);
        if (e.type === 'start') st.energy = Math.min(st.energy + 0.5, 1.5); if (e.type === 'task') st.hit = 1; if (e.type === 'fail') st.flick = 1;
        setMood(m, e.type === 'appr' ? 2400 : e.type === 'fail' ? 1200 : e.type === 'ok' ? 900 : 1800); });
      const ro = new ResizeObserver(() => { r.setSize(W(), H()); cam.aspect = W() / H(); cam.updateProjectionMatrix(); comp?.setSize(W(), H()); }); ro.observe(el);
      let vis = true; const io = new IntersectionObserver(([en]) => { vis = en.isIntersecting; }); io.observe(el);
      const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
      const clock = new THREE.Clock(); const tmpC = new THREE.Color(); const pos = shell.geometry.attributes.position; const v = new THREE.Vector3(); let raf = 0;
      const loop = () => { raf = requestAnimationFrame(loop); if (!vis) return; const dt = Math.min(clock.getDelta(), 0.05), t = reduced ? 0 : clock.elapsedTime; const now = performance.now();
        if (now > st.moodT && st.mood !== 'idle') { st.mood = 'idle'; moodCb.current?.('idle'); }
        st.energy = Math.max(0, st.energy - dt * 0.18); st.hit = Math.max(0, st.hit - dt * 1.6); st.flick = Math.max(0, st.flick - dt * 1.4);
        const a = el.getBoundingClientRect(); const dx = mouse.x - (a.left + a.width / 2), dy = mouse.y - (a.top + a.height / 2); const l = Math.max(Math.hypot(dx, dy), 120);
        if (mini || Math.random() < 0.01) st.gazeT.set(dx / l, -dy / l); else st.gazeT.multiplyScalar(0.995); st.gaze.lerp(st.gazeT, 0.08);
        const beat = t * (1.8 + st.energy * 0.8) * Math.PI; const b = Math.sin(beat); const breath = 1 + Math.sin(t * 1.6) * 0.04;
        const sq = 1 + b * 0.06 * (1 + st.energy) + st.hit * 0.18; body.scale.set(breath / Math.sqrt(sq), breath * sq, breath / Math.sqrt(sq));
        body.position.y = Math.abs(Math.sin(beat / 2)) * 0.18 * (0.6 + st.energy * 0.6) - 0.06; body.position.x = Math.sin(t * 0.9) * 0.12;
        body.rotation.z = Math.sin(beat / 2) * 0.12; body.rotation.y = st.gaze.x * 0.5 + Math.sin(t * 0.5) * 0.15; body.rotation.x = -st.gaze.y * 0.4;
        iris.position.set(st.gaze.x * 0.62, st.gaze.y * 0.62, 0.82).normalize().multiplyScalar(0.78); iris.scale.setScalar(1 + st.hit * 0.6 + (st.mood === 'appr' ? 0.3 : 0));
        for (let i = 0; i < pos.count; i++) { v.fromArray(basePos, i * 3); const n = Math.sin(v.x * 3 + t * 2.1) * Math.sin(v.y * 3.3 + t * 1.7) * Math.sin(v.z * 2.7 + t * 1.3); v.multiplyScalar(1 + n * (0.035 + st.energy * 0.03) + st.hit * 0.04 * Math.sin(v.y * 8 - t * 20)); pos.setXYZ(i, v.x, v.y, v.z); }
        pos.needsUpdate = true; shell.geometry.computeVertexNormals();
        tmpC.set(MOOD_COLORS[st.mood]); st.col.lerp(tmpC, 0.06); const fl = st.flick > 0 && Math.random() < 0.5 ? 0.2 : 1;
        coreMat.color.copy(st.col); coreMat.emissive.copy(st.col); coreMat.emissiveIntensity = (1.3 + Math.sin(t * 3) * 0.25 + st.hit * 2 + st.energy * 0.6) * fl;
        halo.material.color.copy(st.col); rim.uCol.value.copy(st.col); rim.uI.value = (1.1 + st.hit * 1.2 + st.energy * 0.4) * fl; halo.material.opacity = (0.32 + st.hit * 0.3) * fl; halo.scale.setScalar(2.4 + Math.sin(t * 1.6) * 0.2 + st.hit * 0.6); pl.color.copy(st.col);
        core.rotation.x += dt * 0.6; core.rotation.y += dt * 0.9;
        orbits.forEach((o, i) => { o.g.position.copy(body.position); o.g.rotation.x = o.base.x + Math.sin(t * 0.4 + i) * 0.35 + Math.sin(beat / 4) * 0.1; o.g.rotation.y = o.base.y + t * (0.15 + i * 0.05);
          const R = o.R * (1 + Math.sin(beat / 2 + i) * 0.05 + st.hit * 0.15); o.ring.scale.setScalar(R / o.R); (o.ring.material as import('three').MeshBasicMaterial).opacity = 0.25 + st.energy * 0.25;
          o.es.forEach((E) => { E.s.scale.setScalar(0.45 + st.energy * 0.3); E.ph += dt * (0.9 + i * 0.25) * (1 + st.energy * 2.2); E.e.position.set(Math.cos(E.ph) * R, Math.sin(E.ph) * R, 0); }); });
        if (comp) comp.render(); else r.render(sc, cam); };
      loop();
      cleanup = () => { cancelAnimationFrame(raf); off(); ro.disconnect(); io.disconnect(); window.removeEventListener('pointermove', mm); r.dispose(); r.domElement.remove(); };
      if (disposed) cleanup();
    })();
    return () => { disposed = true; cleanup(); };
  }, [mini, bus, bloom]);
  return <div ref={ref} className={'cerebro-mascot' + (mini ? ' mini' : '') + (className ? ' ' + className : '')} style={{ width: size ?? '100%', height: size ?? '100%', position: 'relative', borderRadius: mini ? '50%' : 24, overflow: 'hidden' }} aria-label="Mascota de Cerebro" role="img" />;
}
