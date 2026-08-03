/**
 * Style Dictionary v4 configuration for Synapse design tokens — Cerebro.
 *
 * Adapted from wedded's build/sd.config.mjs with all Flutter/Dart output removed.
 *
 * Generates:
 *   - synapse/ts/src/generated/tokens/*.ts   (TypeScript)
 *   - synapse/ts/src/generated/css/synapse_theme.css
 *       Single theme file: :root (light defaults: primitives + light brand),
 *       .dark overrides, and the .glass utility class. CSS var names match the
 *       custom properties Cerebro_frontend already uses (see formatters/css.mjs).
 *
 * Light and dark brand semantic tokens are built as separate passes to
 * avoid key collisions (both light.json and dark.json define the same
 * "brand.*" keys). Each pass produces a dedicated output file.
 *
 * Source of truth: tokens/ (DTCG W3C format)
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import StyleDictionary from 'style-dictionary';
import { tsFormatter, tokenToName } from './formatters/ts.mjs';
import { cssFormatter, buildSynapseTheme } from './formatters/css.mjs';

// ── Register custom formatters ──────────────────────────────────────────────
StyleDictionary.registerFormat({ name: 'custom/ts',  format: tsFormatter });
StyleDictionary.registerFormat({ name: 'custom/css', format: cssFormatter });

// Path-based names so collision detection works with hierarchical tokens
// (tone.emerald.color vs tone.cyan.color, brand.color.text.1, …).
StyleDictionary.registerTransform({
  name: 'name/synapse-camel',
  type: 'name',
  transform: (token) => tokenToName(token),
});
const NAME_TRANSFORMS = ['name/synapse-camel'];

// ── File filter helpers ─────────────────────────────────────────────────────
const byPath0 = (key) => (token) => token.path[0] === key;

// ── Multi-brand support ─────────────────────────────────────────────────────
// Pass --brand=<name> to build a specific brand's semantic tokens.
// Defaults to 'synapse'.
const brand = process.argv.find(a => a.startsWith('--brand='))?.split('=')[1] ?? 'synapse';
const primitiveSources = [
  '../tokens/primitives/**/*.json',
  '../tokens/components/**/*.json',
];

const TS_BUILD_PATH = `../${brand}/ts/src/generated/tokens/`;
const CSS_BUILD_PATH = `../${brand}/ts/src/generated/css/`;

// ── Primitive + component TS files (shared across light/dark) ───────────────
const tsPrimitiveFiles = [
  {
    destination: `${brand}_colors.ts`,
    format: 'custom/ts',
    filter: byPath0('color'),
    options: { className: 'SynapseColors' },
  },
  {
    destination: `${brand}_spacing.ts`,
    format: 'custom/ts',
    filter: byPath0('spacing'),
    options: { className: 'SynapseSpacing' },
  },
  {
    destination: `${brand}_radius.ts`,
    format: 'custom/ts',
    filter: byPath0('radius'),
    options: { className: 'SynapseRadius' },
  },
  {
    destination: `${brand}_shadows.ts`,
    format: 'custom/ts',
    filter: byPath0('shadow'),
    options: { className: 'SynapseShadows' },
  },
  {
    destination: `${brand}_typography.ts`,
    format: 'custom/ts',
    filter: (token) => ['fontFamily', 'fontSize'].includes(token.path[0]),
    options: { className: 'SynapseTypography' },
  },
  {
    destination: `${brand}_glass.ts`,
    format: 'custom/ts',
    filter: byPath0('glass'),
    options: { className: 'SynapseGlass' },
  },
  {
    destination: `${brand}_motion.ts`,
    format: 'custom/ts',
    filter: byPath0('motion'),
    options: { className: 'SynapseMotion' },
  },
  {
    destination: `${brand}_tones.ts`,
    format: 'custom/ts',
    filter: byPath0('tone'),
    options: { className: 'SynapseTones' },
  },
];

// ── Brand semantic TS files (light / dark variants) ─────────────────────────
const tsBrandLightFiles = [
  {
    destination: `${brand}_brand_light.ts`,
    format: 'custom/ts',
    filter: byPath0('brand'),
    options: { className: 'SynapseBrandLight' },
  },
];
const tsBrandDarkFiles = [
  {
    destination: `${brand}_brand_dark.ts`,
    format: 'custom/ts',
    filter: byPath0('brand'),
    options: { className: 'SynapseBrandDark' },
  },
];

// ── Build — pass 1: primitives + components (no brand layer) ────────────────
const sdPrimitives = new StyleDictionary({
  source: primitiveSources,
  log: { verbosity: 'default', warnings: 'warn' },
  platforms: {
    typescript: {
      buildPath: TS_BUILD_PATH,
      transforms: NAME_TRANSFORMS,
      files: tsPrimitiveFiles,
    },
  },
});

// ── Build — pass 2: light brand semantic tokens ──────────────────────────────
const sdLight = new StyleDictionary({
  source: [
    ...primitiveSources,
    `../tokens/brand/${brand}/light.json`,
  ],
  log: { verbosity: 'default', warnings: 'warn' },
  platforms: {
    typescript: {
      buildPath: TS_BUILD_PATH,
      transforms: NAME_TRANSFORMS,
      files: tsBrandLightFiles,
    },
  },
});

// ── Build — pass 3: dark brand semantic tokens ───────────────────────────────
const sdDark = new StyleDictionary({
  source: [
    ...primitiveSources,
    `../tokens/brand/${brand}/dark.json`,
  ],
  log: { verbosity: 'default', warnings: 'warn' },
  platforms: {
    typescript: {
      buildPath: TS_BUILD_PATH,
      transforms: NAME_TRANSFORMS,
      files: tsBrandDarkFiles,
    },
  },
});

await sdPrimitives.buildAllPlatforms();
await sdLight.buildAllPlatforms();
await sdDark.buildAllPlatforms();

// ── Theme CSS (single file: :root + .dark + .glass) ─────────────────────────
// this.allTokens holds raw (untransformed, no `path`) tokens — the themed
// tokens with path/name come from getPlatformTokens().
const [primitiveDict, lightDict, darkDict] = await Promise.all([
  sdPrimitives.getPlatformTokens('typescript'),
  sdLight.getPlatformTokens('typescript'),
  sdDark.getPlatformTokens('typescript'),
]);

const themeCss = buildSynapseTheme(
  primitiveDict.allTokens,
  lightDict.allTokens.filter(byPath0('brand')),
  darkDict.allTokens.filter(byPath0('brand')),
);

const here = dirname(fileURLToPath(import.meta.url));
const themePath = join(here, CSS_BUILD_PATH, `${brand}_theme.css`);
mkdirSync(dirname(themePath), { recursive: true });
writeFileSync(themePath, themeCss);

console.log(`\n✓ Style Dictionary build complete (brand: ${brand}, light + dark).`);
