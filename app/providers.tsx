"use client";

import { DataProvider } from "@/lib/data-context";
import { ForestBackground } from "@/components/forest/ForestBackground";
import { ThemeEffect } from "@/components/theme/ThemeEffect";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <DataProvider>
      <ThemeEffect />
      <div className="app-shell">
        <ForestBackground />
        <div className="app-ui">{children}</div>
      </div>
    </DataProvider>
  );
}
