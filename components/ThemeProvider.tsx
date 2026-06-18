'use client';

import { createContext, useContext, useEffect, useMemo } from 'react';

type Theme = {
  brand: string;
};

const ThemeContext = createContext<Theme | null>(null);

function normalizeHexColor(input: string | null | undefined): string | null {
  if (!input) return null;
  const v = input.trim();
  if (!v) return null;
  if (/^#[0-9a-fA-F]{6}$/.test(v)) return v;
  if (/^#[0-9a-fA-F]{3}$/.test(v)) {
    const r = v[1], g = v[2], b = v[3];
    return `#${r}${r}${g}${g}${b}${b}`;
  }
  return null;
}

export function ThemeProvider({ brandColor, children }: { brandColor?: string | null; children: React.ReactNode }) {
  const brand = useMemo(() => normalizeHexColor(brandColor) ?? '#16803C', [brandColor]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--brand', brand);
  }, [brand]);

  return <ThemeContext.Provider value={{ brand }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    return { brand: '#16803C' };
  }
  return ctx;
}

