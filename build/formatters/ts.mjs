/**
 * Custom Style Dictionary formatter for TypeScript — Cerebro Synapse.
 *
 * Converts DTCG tokens → `export const Foo = { ... } as const;`
 *
 * Adapted from wedded's build/formatters/ts.mjs. Key difference: token names
 * are derived from the FULL token path (not token.name, which is only the last
 * segment) because Synapse tokens are hierarchical (e.g. color.black.DEFAULT,
 * brand.color.sidebar.textActive) and last-segment names would collide.
 *
 * Naming: path segments after the group root are camelCase-joined, `DEFAULT`
 * segments are dropped, and keys that are not valid JS identifiers are quoted.
 *   color.black.DEFAULT              → black
 *   color.meta.10                    → meta10
 *   brand.color.sidebar.textActive   → colorSidebarTextActive
 *   radius.2xl                       → '2xl'
 *
 * Type mapping:
 *   color      → string (hex uppercased; rgba/oklch/keywords kept as-is)
 *   dimension  → number (strip "px")
 *   duration   → number (strip "ms")
 *   number     → number
 *   fontFamily → string
 *   shadow     → string (raw box-shadow shorthand) or
 *                { color, offsetX, offsetY, blur, spread, inset? } (DTCG object, or array)
 */

/** Convert a path segment (may contain dashes) to camelCase. */
function segmentToCamel(segment, capitalize) {
  const parts = String(segment).split('-');
  const camel = parts
    .map((p, i) => (i === 0 ? p : p.charAt(0).toUpperCase() + p.slice(1)))
    .join('');
  return capitalize ? camel.charAt(0).toUpperCase() + camel.slice(1) : camel;
}

/**
 * Build a unique token name from the token path.
 * Drops path[0] (the group root) and any 'DEFAULT' segments.
 * Also registered as the `name/synapse-camel` transform in sd.config.mjs so
 * Style Dictionary's collision detection sees these unique path-based names
 * (hierarchical groups like tone.*.color would otherwise collide on 'color').
 */
export function tokenToName(token) {
  const segments = token.path.slice(1).filter((s) => s !== 'DEFAULT');
  return segments
    .map((s, i) => segmentToCamel(s, i > 0))
    .join('');
}

/** TS object key for a token — quoted when not a valid JS identifier (e.g. '2xl', '1'). */
function tokenToTsKey(token) {
  const name = tokenToName(token);
  return /^[A-Za-z_$][A-Za-z0-9_$]*$/.test(name) ? name : `'${name}'`;
}

/**
 * Dispatch any color string (hex, rgba, oklch, keyword) → TS string literal value.
 */
function colorToTsColor(value) {
  const v = String(value).trim();
  if (v.startsWith('#')) return v.toUpperCase();
  // rgba(…) / oklch(…) / currentColor / transparent — keep as-is, valid CSS string
  return v;
}

/**
 * Parse a DTCG dimension string like "4px" → 4
 */
function parseDimension(value) {
  const num = parseFloat(String(value).replace('px', ''));
  if (isNaN(num)) throw new Error(`Cannot parse dimension: ${value}`);
  return num;
}

/**
 * Parse a DTCG duration string like "200ms" → 200
 */
function parseDuration(value) {
  const ms = parseFloat(String(value).replace('ms', ''));
  if (isNaN(ms)) throw new Error(`Cannot parse duration: ${value}`);
  return ms;
}

/**
 * Parse a DTCG shadow value → TS value string.
 * Strings (raw box-shadow shorthands, e.g. tone rings) pass through quoted.
 * Objects/arrays become structured literals; `inset: true` is preserved.
 */
function parseShadowToTs(shadowValue) {
  if (typeof shadowValue === 'string') {
    return `'${shadowValue}'`;
  }
  if (Array.isArray(shadowValue)) {
    return `[${shadowValue.map(parseShadowLayerToTs).join(', ')}]`;
  }
  return parseShadowLayerToTs(shadowValue);
}

function parseShadowLayerToTs(shadowValue) {
  const color = colorToTsColor(shadowValue.color);
  const offsetX = parseFloat(String(shadowValue.offsetX).replace('px', ''));
  const offsetY = parseFloat(String(shadowValue.offsetY).replace('px', ''));
  const blur = parseFloat(String(shadowValue.blur).replace('px', ''));
  const spread = parseFloat(String(shadowValue.spread ?? '0px').replace('px', ''));
  const inset = shadowValue.inset ? ', inset: true' : '';

  return `{ color: '${color}', offsetX: ${offsetX}, offsetY: ${offsetY}, blur: ${blur}, spread: ${spread}${inset} }`;
}

/**
 * Generate a TS value string from a Style Dictionary token.
 */
function tokenToTsValue(token) {
  const type = token.$type ?? token.type;
  const value = token.$value ?? token.value;

  switch (type) {
    case 'color':
      return `'${colorToTsColor(value)}'`;
    case 'dimension':
      return String(parseDimension(value));
    case 'duration':
      return String(parseDuration(value));
    case 'number':
      return String(Number(value));
    case 'fontFamily':
      return `'${String(value).trim()}'`;
    case 'shadow':
      return parseShadowToTs(value);
    default:
      throw new Error(`Unsupported token type for TypeScript: ${type} (token: ${token.name})`);
  }
}

/**
 * Main formatter function.
 *
 * options.className — the exported const name (e.g. 'SynapseColors')
 */
export function tsFormatter({ dictionary, options }) {
  const className = options?.className ?? 'Tokens';
  const tokens = dictionary.allTokens;

  if (tokens.length === 0) {
    return `// GENERATED BY STYLE DICTIONARY — DO NOT EDIT\n// Cerebro Synapse design tokens\n// Source: tokens/ directory\n\n// No tokens in this group.\n`;
  }

  const lines = [
    '// GENERATED BY STYLE DICTIONARY — DO NOT EDIT',
    '// Cerebro Synapse design tokens',
    '// Source: tokens/ directory',
    '',
    `export const ${className} = {`,
  ];

  for (const token of tokens) {
    const key = tokenToTsKey(token);
    let valueStr;
    try {
      valueStr = tokenToTsValue(token);
    } catch (err) {
      lines.push(`  // ERROR: ${err.message}`);
      continue;
    }
    lines.push(`  ${key}: ${valueStr},`);
  }

  lines.push('} as const;');
  lines.push('');

  return lines.join('\n');
}
