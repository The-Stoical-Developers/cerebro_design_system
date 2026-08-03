"use client";

/**
 * Hydration-safe date/time components.
 *
 * React #418/#419 hydration mismatches happen when SSR formats a timestamp
 * with the server's timezone (UTC in Node) but the browser formats the same
 * timestamp with the user's local timezone — producing different text.
 *
 * Strategy:
 *   - On the server: render a stable placeholder (empty string or ISO).
 *   - suppressHydrationWarning prevents the mismatch from crashing React.
 *   - useEffect fires after hydration and updates the DOM with the correct
 *     locale-formatted value. The user sees the formatted date after mount.
 *
 * This is the canonical Next.js / React docs approach for locale-dependent
 * content that differs between server and client.
 */

import React, { useEffect, useState } from "react";

interface LocalTimeProps {
  iso: string | null | undefined;
  /** BCP47 locale, e.g. "es-ES". Defaults to browser's locale. */
  locale?: string;
  /** Intl.DateTimeFormatOptions */
  options?: Intl.DateTimeFormatOptions;
  /** CSS className */
  className?: string;
  style?: React.CSSProperties;
  /** Fallback when iso is falsy */
  fallback?: string;
}

/**
 * Renders a locale-formatted date/time string.
 * SSR renders empty (suppressed); after mount shows the formatted local time.
 */
export function LocalTime({
  iso,
  locale,
  options = { dateStyle: "short", timeStyle: "short" },
  className,
  style,
  fallback = "—",
}: LocalTimeProps) {
  const [formatted, setFormatted] = useState<string>("");

  useEffect(() => {
    if (iso) {
      setFormatted(new Date(iso).toLocaleString(locale, options));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [iso, locale]);

  if (!iso) return <span className={className} style={style}>{fallback}</span>;

  return (
    <span className={className} style={style} suppressHydrationWarning>
      {formatted || iso}
    </span>
  );
}

interface LocalDateProps extends Omit<LocalTimeProps, "options"> {
  options?: Intl.DateTimeFormatOptions;
}

/**
 * Date-only variant (no time).
 */
export function LocalDate({
  iso,
  locale,
  options = { month: "short", day: "numeric", year: "numeric" },
  className,
  style,
  fallback = "—",
}: LocalDateProps) {
  const [formatted, setFormatted] = useState<string>("");

  useEffect(() => {
    if (iso) {
      setFormatted(new Date(iso).toLocaleDateString(locale, options));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [iso, locale]);

  if (!iso) return <span className={className} style={style}>{fallback}</span>;

  return (
    <span className={className} style={style} suppressHydrationWarning>
      {formatted || iso}
    </span>
  );
}

interface RelativeTimeProps {
  iso: string | null | undefined;
  className?: string;
  style?: React.CSSProperties;
  fallback?: string;
}

function calcRelative(iso: string): string {
  const ms = Date.now() - new Date(iso).getTime();
  if (ms < 60_000) return "just now";
  if (ms < 3_600_000) return `${Math.floor(ms / 60_000)}m ago`;
  if (ms < 86_400_000) return `${Math.floor(ms / 3_600_000)}h ago`;
  return `${Math.floor(ms / 86_400_000)}d ago`;
}

/**
 * Relative time (e.g. "5m ago"). Uses useEffect to avoid hydration mismatch
 * from Date.now() differing between SSR and client.
 */
export function RelativeTime({
  iso,
  className,
  style,
  fallback = "—",
}: RelativeTimeProps) {
  const [text, setText] = useState<string>("");

  useEffect(() => {
    if (iso) {
      setText(calcRelative(iso));
    }
  }, [iso]);

  if (!iso) return <span className={className} style={style}>{fallback}</span>;

  return (
    <span className={className} style={style} suppressHydrationWarning>
      {text || iso}
    </span>
  );
}
