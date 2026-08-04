"use client";

import * as React from "react";
import { useLocalStorage } from "./useLocalStorage";

interface SidebarToggleState {
  sidebarOpen: boolean;
  setSidebarOpen: (value: boolean) => void;
}

const SidebarContext = React.createContext<SidebarToggleState | null>(null);

// AppShell wraps its subtree in this so SidebarNav, Topbar, and the content
// margin all read the SAME open/collapsed state. Without it each consumer
// held its own useLocalStorage instance, so toggling one never updated the
// others — sidebar width and content margin drifted out of sync.
export function SidebarProvider({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useLocalStorage<boolean>("synapse-sidebar-open", true);
  const value = React.useMemo(() => ({ sidebarOpen, setSidebarOpen }), [sidebarOpen]);
  return React.createElement(SidebarContext.Provider, { value }, children);
}

export function useSidebarToggle(): SidebarToggleState {
  const ctx = React.useContext(SidebarContext);
  // Fallback keeps components usable standalone (e.g. Storybook) outside AppShell.
  const standalone = useLocalStorage<boolean>("synapse-sidebar-open", true);
  if (ctx) return ctx;
  return { sidebarOpen: standalone[0], setSidebarOpen: standalone[1] };
}
