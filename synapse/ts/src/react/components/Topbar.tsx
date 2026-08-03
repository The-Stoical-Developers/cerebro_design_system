"use client";

import * as React from "react";
import { useColorMode } from "../../hooks/useColorMode";
import { useSidebarToggle } from "../../hooks/useSidebarToggle";
import { cn } from "../../lib/cn";
import { IconHamburger, IconMoon, IconSearch, IconSun } from "../icons";

export interface TopbarProps {
  onMenuToggle?: () => void;
  onSearch?: () => void;
  indicator?: React.ReactNode;
  actions?: React.ReactNode;
  showColorModeToggle?: boolean;
  className?: string;
}

export function Topbar({
  onMenuToggle,
  onSearch,
  indicator,
  actions,
  showColorModeToggle = true,
  className,
}: TopbarProps) {
  const { sidebarOpen, setSidebarOpen } = useSidebarToggle();
  const { colorMode, toggleColorMode } = useColorMode();

  const handleMenuToggle = onMenuToggle ?? (() => setSidebarOpen(!sidebarOpen));

  return (
    <header
      className={cn(
        "sticky top-0 z-999 flex w-full bg-white drop-shadow-1 dark:bg-boxdark dark:drop-shadow-none",
        className,
      )}
    >
      <div className="flex flex-grow items-center justify-between px-4 py-4 shadow-2 md:px-6 2xl:px-11">
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={handleMenuToggle}
            aria-label="Toggle sidebar"
            className="flex h-8 w-8 items-center justify-center rounded-md text-body transition-colors hover:bg-gray-100 dark:text-bodydark dark:hover:bg-boxdark-2"
          >
            <IconHamburger />
          </button>
        </div>

        <div className="flex flex-1" />

        <div className="flex items-center gap-3">
          {onSearch && (
            <button
              type="button"
              onClick={onSearch}
              aria-label="Search"
              className="flex items-center gap-1.5 rounded-md border border-stroke px-2 py-1.5 text-body transition-colors hover:bg-gray-100 dark:border-strokedark dark:text-bodydark dark:hover:bg-boxdark-2"
            >
              <IconSearch />
              <span className="hidden text-xs text-body dark:text-bodydark lg:inline">
                Search…
              </span>
              <kbd className="hidden rounded bg-gray-100 px-1 py-0.5 font-mono text-xs dark:bg-boxdark-2 dark:text-bodydark lg:inline">
                ⌘K
              </kbd>
            </button>
          )}

          {showColorModeToggle && (
            <button
              type="button"
              onClick={toggleColorMode}
              aria-label="Toggle dark mode"
              className="flex h-8 w-8 items-center justify-center rounded-md text-body transition-colors hover:bg-gray-100 dark:text-bodydark dark:hover:bg-boxdark-2"
            >
              {colorMode === "dark" ? <IconSun /> : <IconMoon />}
            </button>
          )}

          {indicator}

          {actions}
        </div>
      </div>
    </header>
  );
}
