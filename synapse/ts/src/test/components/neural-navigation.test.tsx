import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { NeuralClusters } from '../../react/cerebro/NeuralClusters3D';

beforeEach(() => { vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null); });
afterEach(() => { cleanup(); vi.restoreAllMocks(); Object.defineProperty(document, 'fullscreenElement', { configurable: true, value: null }); });
const nodes = [{ id: 'root', label: 'Raíz', cluster: 'agents' as const }];
const changeFullscreen = (element: Element | null) => { Object.defineProperty(document, 'fullscreenElement', { configurable: true, value: element }); document.dispatchEvent(new Event('fullscreenchange')); };

describe('neural navigation fullscreen', () => {
  it('enters and exits the same wrapper, and follows native Escape changes', async () => {
    const request = vi.fn(function (this: HTMLElement) { changeFullscreen(this); return Promise.resolve(); });
    Object.defineProperty(HTMLElement.prototype, 'requestFullscreen', { configurable: true, value: request });
    const exit = vi.fn(() => { changeFullscreen(null); return Promise.resolve(); });
    Object.defineProperty(document, 'exitFullscreen', { configurable: true, value: exit });
    render(<NeuralClusters nodes={nodes} height={300} />);
    fireEvent.click(screen.getByRole('button', { name: 'Pantalla completa' }));
    await waitFor(() => expect(screen.getByRole('button', { name: 'Salir de pantalla completa' })).toBeTruthy());
    expect(document.fullscreenElement).toBe(screen.getByTestId('neural-clusters'));
    expect((document.fullscreenElement as HTMLElement).style.height).toBe('100vh');
    fireEvent.click(screen.getByRole('button', { name: 'Salir de pantalla completa' }));
    await waitFor(() => expect(exit).toHaveBeenCalledTimes(1));
    fireEvent.click(screen.getByRole('button', { name: 'Pantalla completa' }));
    act(() => changeFullscreen(null));
    expect(screen.getByRole('button', { name: 'Pantalla completa' })).toBeTruthy();
    expect(screen.getByTestId('neural-clusters').style.height).toBe('300px');
  });
  it('shows a denied request without claiming fullscreen', async () => {
    Object.defineProperty(HTMLElement.prototype, 'requestFullscreen', { configurable: true, value: vi.fn(() => Promise.reject(new Error('Denied'))) });
    render(<NeuralClusters nodes={nodes} />);
    fireEvent.click(screen.getByRole('button', { name: 'Pantalla completa' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('No se pudo cambiar la pantalla completa');
    expect(screen.getByRole('button', { name: 'Pantalla completa' })).toBeTruthy();
  });
  it('hides navigation and fullscreen in mini', () => {
    render(<NeuralClusters nodes={nodes} mini />);
    expect(screen.queryByRole('button', { name: 'Pantalla completa' })).toBeNull();
    expect(screen.queryByRole('button', { name: 'Restablecer vista' })).toBeNull();
  });
});
