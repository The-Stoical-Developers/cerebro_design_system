"use client";

import * as React from "react";
import { SidebarProvider, useSidebarToggle } from "../../hooks/useSidebarToggle";
import { cn } from "../../lib/cn";

export interface AppShellProps {
  sidebar: React.ReactNode;
  topbar: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

function AppShellLayout({ sidebar, topbar, children, className }: AppShellProps) {
  const { sidebarOpen } = useSidebarToggle();

  return (
    <div
      className={cn(
        "flex h-screen overflow-hidden bg-whiten dark:bg-boxdark-2",
        className,
      )}
    >
      {sidebar}

      <div
        className={cn(
          "relative flex flex-1 flex-col overflow-y-auto overflow-x-hidden transition-all duration-200",
          sidebarOpen ? "ml-64" : "ml-16",
        )}
      >
        {topbar}
        <main className="flex-1 px-4 py-6 md:px-6 2xl:px-11">{children}</main>
      </div>
    </div>
  );
}

export function AppShell(props: AppShellProps) {
  return (
    <SidebarProvider>
      <AppShellLayout {...props} />
    </SidebarProvider>
  );
}
