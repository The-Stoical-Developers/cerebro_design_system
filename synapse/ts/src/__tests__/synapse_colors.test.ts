import { describe, expect, it } from 'vitest';
import { SynapseColors } from '../generated/tokens/synapse_colors';

describe('SynapseColors', () => {
  it('primary is TailAdmin indigo', () => {
    expect(SynapseColors.primary).toBe('#3C50E0');
  });

  it('secondary is TailAdmin cyan', () => {
    expect(SynapseColors.secondary).toBe('#80CAEE');
  });

  it('danger is the TailAdmin danger red', () => {
    expect(SynapseColors.danger).toBe('#D34053');
  });

  it('success is the TailAdmin success green', () => {
    expect(SynapseColors.success).toBe('#219653');
  });

  it('warning is the TailAdmin warning amber', () => {
    expect(SynapseColors.warning).toBe('#FFA70B');
  });

  it('all flat color values are valid hex strings except keywords', () => {
    for (const [k, v] of Object.entries(SynapseColors)) {
      if (k === 'current' || k === 'transparent') {
        expect(typeof v).toBe('string');
        continue;
      }
      expect(v, `SynapseColors.${k}`).toMatch(/^#[0-9A-Fa-f]{6}$/);
    }
  });
});
