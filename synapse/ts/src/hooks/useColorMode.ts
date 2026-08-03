"use client";

import { useEffect, useState } from "react";

type ColorMode = "light" | "dark";

const STORAGE_KEY = "synapse-color-mode";

export function useColorMode() {
  const [colorMode, setColorMode] = useState<ColorMode>("light");

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as ColorMode | null;
    const initial = stored ?? "light";
    setColorMode(initial);
    if (initial === "dark") {
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleColorMode = () => {
    const next: ColorMode = colorMode === "light" ? "dark" : "light";
    setColorMode(next);
    localStorage.setItem(STORAGE_KEY, next);
    if (next === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  return { colorMode, toggleColorMode };
}
