"use client";

import { useEffect, useState } from "react";

/**
 * Returns true after the component has mounted on the client.
 * Use to guard time/locale-dependent renders that would cause React
 * hydration mismatches (error #418/#419) when SSR output differs from
 * the browser's locale or the instant of render.
 */
export function useMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return mounted;
}
