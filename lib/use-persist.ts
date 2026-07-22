"use client";

import { useCallback, useState } from "react";
import { useData } from "./data-context";

type PersistOptions = {
  /** Se ejecuta DESPUÉS de guardar en nube — ideal para limpiar formularios */
  clear?: () => void;
};

/** Guarda en estado + fuerza sync a la nube, limpia formulario y muestra mensaje. */
export function usePersist() {
  const { forceSync, cloudStatus } = useData();
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState(false);

  const persist = useCallback(
    async (
      action: () => void,
      success = "Guardado. Quedó archivado.",
      options?: PersistOptions
    ) => {
      setBusy(true);
      setMsg("");
      try {
        action();
        // Esperar a que commit actualice dataRef
        await new Promise((r) => setTimeout(r, 80));
        await forceSync();
        // Limpiar DESPUÉS del sync (evita que un re-render restaure el texto)
        options?.clear?.();
        setMsg(success);
        window.setTimeout(() => setMsg(""), 4000);
      } catch {
        setMsg("No se pudo guardar. Intenta de nuevo.");
      } finally {
        setBusy(false);
      }
    },
    [forceSync]
  );

  return { persist, msg, busy, cloudStatus, setMsg };
}
