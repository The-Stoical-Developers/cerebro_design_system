import { BRAND_LOGOS, type BrandLogo } from './brandLogos.generated';
export type { BrandLogo };

/** Hand-drawn simple marks for brands absent from simple-icons (24x24 viewBox). */
const EXTRA: Record<string, BrandLogo> = {
  neon: { title: 'Neon', hex: '#00E599', path: 'M3 5.5A2.5 2.5 0 0 1 5.5 3h13A2.5 2.5 0 0 1 21 5.5v9.8c0 2.3-2.9 3.3-4.3 1.5L11 9.6v8.9A2.5 2.5 0 0 1 8.5 21h-3A2.5 2.5 0 0 1 3 18.5Zm3 0v13h2V7.9c0-1.4 1.8-2 2.7-.9L18 16V6Z' },
  dataforseo: { title: 'DataForSEO', hex: '#1A73E8', path: 'M4 4h7a8 8 0 0 1 0 16H4Zm3 3v10h4a5 5 0 0 0 0-10Zm11.5 9.5L22 20l-1.5 1.5-3.5-3.5Z' },
};

const ALIASES: Record<string, string> = {
  gsc: 'googlesearchconsole', search_console: 'googlesearchconsole', google_search_console: 'googlesearchconsole',
  ga: 'googleanalytics', ga4: 'googleanalytics', google_analytics: 'googleanalytics', drive: 'googledrive', google_drive: 'googledrive',
  calendar: 'googlecalendar', google_calendar: 'googlecalendar', gcp: 'googlecloud', google_cloud: 'googlecloud', postgres: 'postgresql', pg: 'postgresql',
  neondb: 'neon', neon_postgres: 'neon', dfs: 'dataforseo', data_for_seo: 'dataforseo', twitter: 'x', gh: 'github',
};

const ALL: Record<string, BrandLogo> = { ...BRAND_LOGOS, ...EXTRA };

/** Resolve a free-form service hint (connection_type, server name…) to a bundled logo. Offline, no network. */
export function resolveBrand(hint?: string | null): (BrandLogo & { slug: string }) | null {
  if (!hint) return null;
  const k = hint.toLowerCase().trim();
  const norm = k.replace(/[\s.-]+/g, '_');
  const flat = norm.replace(/_/g, '');
  const direct = ALIASES[norm] ?? (ALL[flat] ? flat : ALL[norm] ? norm : undefined);
  if (direct && ALL[direct]) return { slug: direct, ...ALL[direct] };
  // substring match: longest key contained in the hint wins ("github-mcp" → github)
  const keys = [...Object.keys(ALL), ...Object.keys(ALIASES)].sort((a, b) => b.length - a.length);
  for (const key of keys) {
    if (key.length >= 3 && flat.includes(key.replace(/_/g, ''))) {
      const slug = ALIASES[key] ?? key;
      if (ALL[slug]) return { slug, ...ALL[slug] };
    }
  }
  return null;
}

/** Two-letter initials fallback for services without a bundled logo. */
export function brandInitials(name: string): string {
  const parts = name.replace(/[^\p{L}\p{N}\s_-]/gu, '').split(/[\s_-]+/).filter(Boolean);
  if (!parts.length) return '?';
  return (parts.length > 1 ? parts[0][0] + parts[1][0] : parts[0].slice(0, 2)).toUpperCase();
}
