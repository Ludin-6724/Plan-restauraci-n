"use client";

import { useEffect } from "react";
import { useData } from "@/lib/data-context";
import { getTheme, getDerivedVars } from "@/lib/themes";

/**
 * Aplica el tema elegido como variables CSS en <html>, sin remount de nada más.
 * Vive dentro de DataProvider para poder leer profile.settings.theme.
 */
export function ThemeEffect() {
  const { data } = useData();
  const themeId = data.profile.settings.theme;

  useEffect(() => {
    const theme = getTheme(themeId);
    const root = document.documentElement;
    Object.entries(theme.vars).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
    Object.entries(getDerivedVars(theme)).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });
    // Garantiza contraste del botón primario (blanco sobre teal en light)
    if (theme.mode === "light") {
      root.style.setProperty("--on-primary", "#ffffff");
    }
    root.setAttribute("data-theme", theme.id);
    root.setAttribute("data-theme-mode", theme.mode ?? "dark");

    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme.themeColor);
  }, [themeId]);

  return null;
}
