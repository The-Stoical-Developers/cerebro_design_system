import { useEffect, useState, type RefObject } from 'react';

/** Native fullscreen state is owned by the browser, including Escape and external exits. */
export function useNeuralFullscreen(ref: RefObject<HTMLDivElement | null>) {
  const [fullscreen, setFullscreen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    const change = () => { setFullscreen(document.fullscreenElement === ref.current); };
    document.addEventListener('fullscreenchange', change);
    return () => document.removeEventListener('fullscreenchange', change);
  }, [ref]);
  const toggle = async () => {
    setError(null);
    try {
      if (document.fullscreenElement === ref.current) await document.exitFullscreen();
      else {
        if (!ref.current?.requestFullscreen) throw new Error('Fullscreen unavailable');
        await ref.current.requestFullscreen();
      }
    } catch { setError('No se pudo cambiar la pantalla completa. Vuelve a intentarlo.'); }
  };
  return { fullscreen, error, toggle };
}

export function NeuralNavigation({ onReset, fullscreen, error, toggle }: ReturnType<typeof useNeuralFullscreen> & { onReset: () => void }) {
  const button = { border: '1px solid rgba(167,139,250,.5)', borderRadius: 8, background: 'rgba(16,18,40,.92)', color: '#eef', padding: '6px 9px', cursor: 'pointer', fontSize: 12 };
  return <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 3, maxWidth: 'calc(100% - 24px)' }}>
    <div role="toolbar" aria-label="Navegación de la red" style={{ display: 'flex', gap: 6 }}>
      <button type="button" style={button} onClick={onReset} aria-label="Restablecer vista" title="Restablecer vista">↺</button>
      <button type="button" style={button} onClick={toggle} aria-label={fullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'} title={fullscreen ? 'Salir de pantalla completa (Esc)' : 'Pantalla completa'} aria-pressed={fullscreen}>{fullscreen ? '⤡' : '⤢'}</button>
    </div>
    {error && <p role="alert" style={{ color: '#ffd0da', background: '#181323', padding: 8, fontSize: 12 }}>{error}</p>}
  </div>;
}
