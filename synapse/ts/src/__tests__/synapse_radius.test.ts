import { describe, expect, it } from 'vitest';
import { SynapseRadius } from '../generated/tokens/synapse_radius';

describe('SynapseRadius', () => {
  it('exposes a full radius', () => {
    expect(SynapseRadius.full).toBe(9999);
  });

  it('radiuses increase from xs to 2xl', () => {
    const values = [
      SynapseRadius.xs,
      SynapseRadius.sm,
      SynapseRadius.md,
      SynapseRadius.lg,
      SynapseRadius.xl,
      SynapseRadius['2xl'],
    ];
    for (let i = 0; i < values.length - 1; i++) {
      expect(parseInt(values[i], 10)).toBeLessThan(parseInt(values[i + 1], 10));
    }
  });
});
