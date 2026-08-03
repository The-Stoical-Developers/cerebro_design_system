"use client";

import * as React from "react";
import { useSidebarToggle } from "../../hooks/useSidebarToggle";
import { cn } from "../../lib/cn";
import { IconBrain, IconChevronLeft, IconChevronRight } from "../icons";

export interface SynNavItem {
  href: string;
  label: string;
  icon?: React.ReactNode;
  external?: boolean;
  matchPrefix?: string;
  badge?: React.ReactNode;
}

export interface SynNavGroup {
  label: string;
  items: SynNavItem[];
}

export interface SidebarNavProps {
  groups: SynNavGroup[];
  currentPath: string;
  linkComponent?: React.ComponentType<{
    href: string;
    className?: string;
    title?: string;
    "aria-label"?: string;
    children: React.ReactNode;
  }>;
  header?: React.ReactNode;
  brandName?: string;
  footer?: React.ReactNode;
  className?: string;
}

function isActive(pathname: string, item: SynNavItem): boolean {
  if (item.href === "/") return pathname === "/";
  return pathname.startsWith(item.matchPrefix ?? item.href);
}

export function SidebarNav({
  groups,
  currentPath,
  linkComponent: LinkComponent = "a" as unknown as React.ComponentType<any>,
  header,
  brandName = "Synapse",
  footer,
  className,
}: SidebarNavProps) {
  const { sidebarOpen, setSidebarOpen } = useSidebarToggle();

  const defaultHeader = (
    <div
      className={cn(
        "flex h-16 shrink-0 items-center justify-between border-b border-stroke px-3 dark:border-strokedark",
        !sidebarOpen && "justify-center",
      )}
    >
      <LinkComponent
        href="/"
        className={cn(
          "flex items-center gap-2 overflow-hidden",
          !sidebarOpen && "w-full justify-center",
        )}
        title={brandName}
      >
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
          <IconBrain />
        </span>
        {sidebarOpen && (
          <span className="truncate text-[15px] font-semibold tracking-tight text-black dark:text-white">
            {brandName}
          </span>
        )}
      </LinkComponent>

      {sidebarOpen && (
        <button
          type="button"
          onClick={() => setSidebarOpen(false)}
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-body transition-colors hover:bg-gray-100 dark:text-bodydark dark:hover:bg-boxdark-2"
          title="Collapse sidebar"
        >
          <IconChevronLeft />
        </button>
      )}

      {!sidebarOpen && (
        <button
          type="button"
          onClick={() => setSidebarOpen(true)}
          className="absolute -right-3 top-16 flex h-6 w-6 items-center justify-center rounded-full border border-stroke bg-white text-body shadow-sm transition-colors hover:bg-gray-100 dark:border-strokedark dark:bg-boxdark dark:text-bodydark dark:hover:bg-boxdark-2"
          title="Expand sidebar"
        >
          <IconChevronRight />
        </button>
      )}
    </div>
  );

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 z-50 flex h-screen flex-col border-r border-stroke bg-white transition-all duration-200 dark:border-strokedark dark:bg-boxdark",
        sidebarOpen ? "w-64" : "w-16",
        className,
      )}
    >
      {header ?? defaultHeader}

      <nav className="h-[calc(100vh-64px)] overflow-y-auto px-3 py-4">
        {groups.map((group) => (
          <div key={group.label} className="mb-6">
            {sidebarOpen && (
              <h3 className="mb-2 px-2 text-xs font-semibold uppercase tracking-wider text-body dark:text-bodydark">
                {group.label}
              </h3>
            )}
            <ul className="space-y-1">
              {group.items.map((item) => {
                const active = !item.external && isActive(currentPath, item);
                const baseClass = cn(
                  "flex items-center rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  sidebarOpen ? "gap-3" : "justify-center",
                  active
                    ? "bg-primary text-white"
                    : "text-body hover:bg-gray-100 dark:text-bodydark dark:hover:bg-boxdark-2",
                );

                const content = (
                  <>
                    {item.icon && (
                      <span className="shrink-0" aria-hidden="true">
                        {item.icon}
                      </span>
                    )}
                    {sidebarOpen && (
                      <span className="truncate">{item.label}</span>
                    )}
                    {sidebarOpen && item.external && (
                      <span className="ml-auto text-xs opacity-60">↗</span>
                    )}
                    {sidebarOpen && item.badge}
                  </>
                );

                if (item.external) {
                  return (
                    <li key={item.label}>
                      <a
                        href={item.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={baseClass}
                        title={!sidebarOpen ? item.label : undefined}
                        aria-label={!sidebarOpen ? item.label : undefined}
                      >
                        {content}
                      </a>
                    </li>
                  );
                }

                return (
                  <li key={item.label}>
                    <LinkComponent
                      href={item.href}
                      className={baseClass}
                      title={!sidebarOpen ? item.label : undefined}
                      aria-label={!sidebarOpen ? item.label : undefined}
                    >
                      {content}
                    </LinkComponent>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      {footer}
    </aside>
  );
}
