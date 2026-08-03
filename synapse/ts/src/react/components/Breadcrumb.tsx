"use client";

import * as React from "react";
import { cn } from "../../lib/cn";

export interface BreadcrumbProps {
  pathname: string;
  labels?: Record<string, string>;
  homeHref?: string;
  homeLabel?: string;
  linkComponent?: React.ComponentType<{
    href: string;
    className?: string;
    children: React.ReactNode;
  }>;
  className?: string;
}

function label(segment: string, overrides: Record<string, string>) {
  return overrides[segment] ?? segment.charAt(0).toUpperCase() + segment.slice(1);
}

export function Breadcrumb({
  pathname,
  labels = {},
  homeHref = "/",
  homeLabel = "Home",
  linkComponent: LinkComponent = "a" as unknown as React.ComponentType<any>,
  className,
}: BreadcrumbProps) {
  const segments = pathname.split("/").filter(Boolean);

  const crumbs = segments.map((seg, i) => {
    const href = "/" + segments.slice(0, i + 1).join("/");
    const isLast = i === segments.length - 1;
    return { href, text: label(seg, labels), isLast };
  });

  return (
    <header
      className={cn(
        "flex h-11 shrink-0 items-center border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4 gap-3.5",
        className,
      )}
    >
      <nav className="flex items-center gap-1.5 font-mono text-xs text-text-3">
        <LinkComponent
          href={homeHref}
          className="text-text-3 no-underline transition-colors hover:text-text-1"
        >
          {homeLabel}
        </LinkComponent>

        {crumbs.map(({ href, text, isLast }) => (
          <span key={href} className="flex items-center gap-1.5">
            <span className="text-text-4">›</span>
            {isLast ? (
              <span className="text-primary">{text}</span>
            ) : (
              <LinkComponent
                href={href}
                className="text-text-3 no-underline transition-colors hover:text-text-1"
              >
                {text}
              </LinkComponent>
            )}
          </span>
        ))}
      </nav>
    </header>
  );
}
