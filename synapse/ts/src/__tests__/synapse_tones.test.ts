import { describe, expect, it } from 'vitest';
import { SynapseTones } from '../generated/tokens/synapse_tones';

describe('SynapseTones', () => {
  it('cyan color matches the tone helper source', () => {
    expect(SynapseTones.cyanColor).toBe('#0891B2');
  });

  it('emerald background uses oklch', () => {
    expect(SynapseTones.emeraldBg).toMatch(/^oklch\(/);
  });

  it('every tone has color, bg and ring entries', () => {
    const names = ['emerald', 'cyan', 'amber', 'red', 'violet', 'sky', 'rose', 'indigo', 'orange'];
    for (const name of names) {
      expect((SynapseTones as Record<string, string>)[`${name}Color`]).toMatch(/^#/);
      expect((SynapseTones as Record<string, string>)[`${name}Bg`]).toMatch(/^oklch\(/);
      expect((SynapseTones as Record<string, string>)[`${name}Ring`]).toMatch(/inset/);
    }
  });
});
