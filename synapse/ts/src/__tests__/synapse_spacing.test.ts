import { describe, expect, it } from 'vitest';
import { SynapseSpacing } from '../generated/tokens/synapse_spacing';

describe('SynapseSpacing', () => {
  it('includes layout constants from globals.css', () => {
    expect(SynapseSpacing.sidebarW).toBe(290);
    expect(SynapseSpacing.topbarH).toBe(70);
  });

  it('sidebar collapsed width is smaller than open width', () => {
    expect(SynapseSpacing.sidebarWCollapsed).toBeLessThan(SynapseSpacing.sidebarW);
  });
});
