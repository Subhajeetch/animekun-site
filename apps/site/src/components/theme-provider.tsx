"use client"

import { ThemeProvider } from "next-themes"
import { ReactNode } from "react"

// Silence the false-positive React 19 / Next.js script tag warning in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  const orig = console.error;
  console.error = (...args: unknown[]) => {
    if (typeof args[0] === 'string' && args[0].includes('Encountered a script tag')) {
      return;
    }
    orig.apply(console, args as []);
  };
}

export function TailwindThemeProvider({ children }: { children: ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      {children}
    </ThemeProvider>
  )
}