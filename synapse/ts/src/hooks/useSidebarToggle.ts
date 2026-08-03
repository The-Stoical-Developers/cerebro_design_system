"use client";

import { useLocalStorage } from "./useLocalStorage";

export function useSidebarToggle() {
  const [sidebarOpen, setSidebarOpen] = useLocalStorage<boolean>("synapse-sidebar-open", true);
  return { sidebarOpen, setSidebarOpen };
}
