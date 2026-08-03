/**
 * Custom Style Dictionary formatter for CSS custom properties — Cerebro Synapse.
 *
 * Adapted from wedded's build/formatters/css.mjs. Key difference: NO vendor
 * prefix — variable names match the CSS custom properties Cerebro_frontend
 * already uses today (globals.css), so adopting synapse_theme.css is drop-in:
 *
 *   brand.color.bg              → --color-bg
 *   brand.color.surfaceElevated → --color-surface-elevated
 *   brand.color.sidebar.textActive → --color-sidebar-text-active
 *   brand.color.text.1          → --color-text-1
 *   brand.scrollbar.thumb       → --scrollbar-thumb
 *   color.primary               → --color-primary   (palette; DEFAULT segments dropped)
 *   color.meta.10               → --color-meta-10
 *   radius.md                   → --radius-md
 *   spacing.sidebar.w           → --sidebar-w        (layout vars keep their exact names)
 *   spacing.scale.4             → --spacing-4        (curated Tailwind subset)
 *   fontSize.xs                 → --text-xs
 *   fontFamily.sans             → --font-sans
 *   shadow.card                 → --shadow-card
 *   glass.bg                    → --glass-bg
 *   tone.emerald.ring           → --tone-emerald-ring
 *   motion.spin                 → --duration-spin
 *
 * Also exports buildSynapseTheme(), which composes the single-file
 * synapse_theme.css: light defaults in :root (primitives + light brand,
 * brand wins on collisions), dark brand overrides in .dark, plus the .glass
 * utility class wired to the glass tokens.
 */

/** Convert camelCase or PascalCase segment → kebab-case. */
function toKebab(str) {
  return str
    // insert dash before uppercase letters that follow a lowercase letter or digit
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    // insert dash before uppercase letters that follow another uppercase letter then a lowercase
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1-$2')
    .toLowerCase();
}

/** Kebab-join path segments, dropping 'DEFAULT' segments. */
function segmentsToKebab(segments) {
  return segments
    .filter((s) => s !== 'DEFAULT')
    .map(toKebab)
    .join('-');
}

/**
 * Resolve the CSS var name and value from a token.
 * Returns null if the token should be skipped.
 *
 * @param {object} token - Style Dictionary token
 * @returns {{ varName: string, cssValue: string } | null}
 */
function tokenToCssVar(token) {
  const type = token.$type ?? token.type;
  const value = token.$value ?? token.value;
  const path = token.path; // e.g. ['brand', 'color', 'sidebar', 'textActive']

  if (!path || path.length === 0) return null;

  const category = path[0];
  let varName;

  if (category === 'color') {
    // Palette colors — drop group root and DEFAULT segments.
    varName = `--color-${segmentsToKebab(path.slice(1))}`;
  } else if (category === 'brand') {
    // Brand semantic tokens keep the exact names the frontend uses.
    if (path[1] === 'color') {
      varName = `--color-${segmentsToKebab(path.slice(2))}`;
    } else if (path[1] === 'scrollbar') {
      varName = `--scrollbar-${segmentsToKebab(path.slice(2))}`;
    } else {
      return null;
    }
  } else if (category === 'radius') {
    varName = `--radius-${segmentsToKebab(path.slice(1))}`;
  } else if (category === 'spacing') {
    // Layout vars keep their exact globals.css names (--sidebar-w, --topbar-h);
    // the curated scale subset is namespaced as --spacing-*.
    if (path[1] === 'scale') {
      varName = `--spacing-${segmentsToKebab(path.slice(2))}`;
    } else {
      varName = `--${segmentsToKebab(path.slice(1))}`;
    }
  } else if (category === 'fontSize') {
    varName = `--text-${segmentsToKebab(path.slice(1))}`;
  } else if (category === 'fontFamily') {
    varName = `--font-${segmentsToKebab(path.slice(1))}`;
  } else if (category === 'shadow') {
    varName = `--shadow-${segmentsToKebab(path.slice(1))}`;
  } else if (category === 'glass') {
    varName = `--glass-${segmentsToKebab(path.slice(1))}`;
  } else if (category === 'tone') {
    varName = `--tone-${segmentsToKebab(path.slice(1))}`;
  } else if (category === 'motion') {
    if (type !== 'duration') return null;
    varName = `--duration-${segmentsToKebab(path.slice(1))}`;
  } else {
    // Unknown category — skip
    return null;
  }

  // Convert value to CSS string based on type
  let cssValue;
  switch (type) {
    case 'color': {
      const v = String(value).trim();
      cssValue = v.startsWith('#') ? v.toUpperCase() : v;
      break;
    }
    case 'fontFamily': {
      const fv = String(value).trim();
      cssValue = fv.startsWith('"') || fv.startsWith("'") ? fv : `"${fv}"`;
      break;
    }
    case 'dimension': {
      const raw = String(value).trim();
      if (raw.endsWith('em') || raw.endsWith('%')) {
        cssValue = raw;
      } else {
        const num = parseFloat(raw.replace('px', ''));
        if (isNaN(num)) return null;
        cssValue = `${num}px`;
      }
      break;
    }
    case 'duration': {
      const ms = parseFloat(String(value).replace('ms', ''));
      if (isNaN(ms)) return null;
      cssValue = `${ms}ms`;
      break;
    }
    case 'number': {
      cssValue = String(Number(value));
      break;
    }
    case 'shadow': {
      // Raw box-shadow shorthand strings (tone rings) pass through as-is.
      if (typeof value === 'string') {
        cssValue = value;
        break;
      }
      // DTCG shadow object (or array of objects) → box-shadow shorthand.
      const layer = (v) => {
        const { offsetX = '0px', offsetY = '0px', blur = '0px', spread = '0px', color = 'transparent' } = v;
        return `${v.inset ? 'inset ' : ''}${offsetX} ${offsetY} ${blur} ${spread} ${color}`;
      };
      if (Array.isArray(value)) {
        cssValue = value.map(layer).join(', ');
      } else if (typeof value === 'object' && value !== null) {
        cssValue = layer(value);
      } else {
        return null;
      }
      break;
    }
    default:
      return null;
  }

  return { varName, cssValue };
}

/** Map a token list to deduped CSS vars (later tokens win on name collisions). */
function tokensToVarMap(tokens) {
  const map = new Map();
  for (const token of tokens) {
    const result = tokenToCssVar(token);
    if (result) map.set(result.varName, result.cssValue);
  }
  return map;
}

function varMapToBlock(selector, map) {
  const lines = [`${selector} {`];
  for (const [varName, cssValue] of map) {
    lines.push(`  ${varName}: ${cssValue};`);
  }
  lines.push('}');
  return lines.join('\n');
}

/**
 * Compose the single-file Synapse theme CSS.
 *
 * @param {object[]} primitiveTokens - allTokens from the primitives pass
 * @param {object[]} lightBrandTokens - allTokens from the light brand pass (filtered to brand.*)
 * @param {object[]} darkBrandTokens  - allTokens from the dark brand pass (filtered to brand.*)
 * @returns {string} synapse_theme.css contents
 */
export function buildSynapseTheme(primitiveTokens, lightBrandTokens, darkBrandTokens) {
  // :root = primitives first, light brand layered on top (brand wins collisions
  // such as --color-primary, which exists in both palette and brand).
  const rootMap = tokensToVarMap(primitiveTokens);
  for (const [k, v] of tokensToVarMap(lightBrandTokens)) rootMap.set(k, v);

  const darkMap = tokensToVarMap(darkBrandTokens);

  const header = [
    '/* GENERATED BY STYLE DICTIONARY — DO NOT EDIT */',
    '/* Cerebro Synapse — theme entry point */',
    '/* Import this file to get all Synapse design tokens as CSS custom properties. */',
    '/* :root holds light-mode defaults; .dark carries the dark-mode overrides. */',
    '',
  ];

  const glassClass = [
    '/* Glass surface utility — defined here because Cerebro_frontend uses .glass but never defined it */',
    '.glass {',
    '  background: var(--glass-bg);',
    '  border: 1px solid var(--glass-border);',
    '  box-shadow: var(--glass-shadow);',
    '  backdrop-filter: blur(var(--glass-blur));',
    '  -webkit-backdrop-filter: blur(var(--glass-blur));',
    '}',
  ];

  return [
    ...header,
    varMapToBlock(':root', rootMap),
    '',
    varMapToBlock('.dark', darkMap),
    '',
    ...glassClass,
    '',
  ].join('\n');
}

/**
 * Main CSS formatter function (single-selector block per file).
 *
 * options.selector — ':root' | '.dark' | any CSS selector (default: ':root')
 */
export function cssFormatter({ dictionary, options }) {
  const selector = options?.selector ?? ':root';
  const tokens = dictionary.allTokens;

  const header = [
    '/* GENERATED BY STYLE DICTIONARY — DO NOT EDIT */',
    '/* Cerebro Synapse design tokens */',
    '/* Source: tokens/ directory */',
    '',
  ];

  if (tokens.length === 0) {
    return [...header, `/* No tokens in this group. */`, ''].join('\n');
  }

  const map = tokensToVarMap(tokens);
  if (map.size === 0) {
    return [...header, `/* No CSS-exportable tokens in this group. */`, ''].join('\n');
  }

  return [...header, varMapToBlock(selector, map), ''].join('\n');
}
