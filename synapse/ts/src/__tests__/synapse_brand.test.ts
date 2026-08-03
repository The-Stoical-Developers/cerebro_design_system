import { describe, expect, it } from 'vitest';
import { SynapseBrandLight } from '../generated/tokens/synapse_brand_light';
import { SynapseBrandDark } from '../generated/tokens/synapse_brand_dark';

describe('SynapseBrandLight', () => {
  it('has light surfaces', () => {
    expect(SynapseBrandLight.colorBg).toBe('#F1F5F9');
    expect(SynapseBrandLight.colorSurface).toBe('#FFFFFF');
  });

  it('primary tokens match primitive primary', () => {
    expect(SynapseBrandLight.colorPrimary).toBe('#3C50E0');
  });

  it('defines primarySurface and primaryBorder extras', () => {
    expect(SynapseBrandLight.colorPrimarySurface).toBe('#EEF1FD');
    expect(SynapseBrandLight.colorPrimaryBorder).toBe('#C7D0F5');
  });
});

describe('SynapseBrandDark', () => {
  it('has dark surfaces', () => {
    expect(SynapseBrandDark.colorBg).toBe('#1A222C');
    expect(SynapseBrandDark.colorSurface).toBe('#24303F');
  });

  it('overrides primary hover', () => {
    expect(SynapseBrandDark.colorPrimaryHover).toBe('#4A5EEA');
  });

  it('defines dark primarySurface and primaryBorder extras', () => {
    expect(SynapseBrandDark.colorPrimarySurface).toBe('#2A3350');
    expect(SynapseBrandDark.colorPrimaryBorder).toBe('#3D4A80');
  });
});

describe('Brand keys parity', () => {
  it('light and dark brand objects expose the same keys', () => {
    expect(Object.keys(SynapseBrandLight).sort()).toEqual(
      Object.keys(SynapseBrandDark).sort()
    );
  });
});
