"use client";

import { useData } from "@/lib/data-context";
import { THEMES } from "@/lib/themes";

/** Selector completo de tema: swatches de color + nombre + por qué puede ayudar. */
export function ThemePicker() {
  const { data, updateSettings } = useData();
  const active = data.profile.settings.theme ?? "bosque";

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {THEMES.map((t) => {
        const isActive = t.id === active;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => updateSettings({ theme: t.id })}
            aria-pressed={isActive}
            className={`choice-card${isActive ? " choice-card--active" : ""}`}
          >
            <div className="flex items-center gap-2">
              <span className="flex -space-x-1.5 shrink-0">
                {t.swatch.map((c, i) => (
                  <span
                    key={i}
                    className="w-4 h-4 rounded-full border border-black/15 shadow-sm"
                    style={{ backgroundColor: c }}
                  />
                ))}
              </span>
              <span className="choice-card__title">{t.label}</span>
            </div>
            <p className="choice-card__desc">{t.description}</p>
          </button>
        );
      })}
    </div>
  );
}

/** Selector compacto (solo swatches) para pantallas donde el espacio importa, como Pánico. */
export function ThemePickerCompact() {
  const { data, updateSettings } = useData();
  const active = data.profile.settings.theme ?? "bosque";

  return (
    <div className="flex flex-wrap gap-2">
      {THEMES.map((t) => {
        const isActive = t.id === active;
        return (
          <button
            key={t.id}
            type="button"
            onClick={() => updateSettings({ theme: t.id })}
            aria-pressed={isActive}
            title={t.label}
            className={`choice-chip choice-chip--row${isActive ? " choice-chip--active" : ""}`}
          >
            <span className="flex -space-x-1">
              {t.swatch.map((c, i) => (
                <span
                  key={i}
                  className="w-2.5 h-2.5 rounded-full border border-black/15"
                  style={{ backgroundColor: c }}
                />
              ))}
            </span>
            {t.label}
          </button>
        );
      })}
    </div>
  );
}
