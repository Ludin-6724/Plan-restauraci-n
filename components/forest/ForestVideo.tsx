"use client";

import { useEffect, useRef, useState } from "react";

const SRC_DESKTOP = "/forest/bosque.mp4";
const SRC_MOBILE = "/forest/bosque-sm.mp4";

function pickSrc(): string {
  if (typeof window === "undefined") return SRC_MOBILE;
  // Safari ignora a menudo media= en <source>; elegimos por JS
  return window.matchMedia("(min-width: 768px)").matches ? SRC_DESKTOP : SRC_MOBILE;
}

/**
 * Video real de bosque.
 * iOS/Safari: muted + playsInline + autoPlay + src único (sin media en source).
 * No captura clics.
 */
export function ForestVideo({
  play,
  onReady,
  onFailed,
}: {
  play: boolean;
  onReady?: () => void;
  onFailed?: () => void;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [failed, setFailed] = useState(false);
  const [src, setSrc] = useState(SRC_MOBILE);
  const readySent = useRef(false);

  useEffect(() => {
    setSrc(pickSrc());
    const mq = window.matchMedia("(min-width: 768px)");
    const onChange = () => {
      const next = pickSrc();
      setSrc((prev) => (prev === next ? prev : next));
    };
    mq.addEventListener?.("change", onChange);
    return () => mq.removeEventListener?.("change", onChange);
  }, []);

  const tryPlay = () => {
    const el = ref.current;
    if (!el || failed || !play) return;
    // Requisitos iOS para autoplay
    el.muted = true;
    el.defaultMuted = true;
    el.playsInline = true;
    el.setAttribute("playsinline", "true");
    el.setAttribute("webkit-playsinline", "true");
    const p = el.play();
    if (p && typeof p.catch === "function") {
      p.catch(() => {
        /* se reintenta en canplay / primer toque */
      });
    }
  };

  useEffect(() => {
    const el = ref.current;
    if (!el || failed) return;

    if (play) {
      tryPlay();
    } else {
      el.pause();
    }
  }, [play, failed, src]);

  // Reintento tras gesto del usuario (si el navegador bloqueó autoplay)
  useEffect(() => {
    if (!play || failed) return;
    const resume = () => tryPlay();
    document.addEventListener("touchstart", resume, { once: true, passive: true });
    document.addEventListener("click", resume, { once: true });
    return () => {
      document.removeEventListener("touchstart", resume);
      document.removeEventListener("click", resume);
    };
  }, [play, failed, src]);

  if (failed) return null;

  return (
    <video
      ref={ref}
      key={src}
      className="forest-video"
      src={src}
      muted
      loop
      playsInline
      autoPlay
      preload="auto"
      aria-hidden="true"
      onLoadedData={() => {
        tryPlay();
        if (!readySent.current) {
          readySent.current = true;
          onReady?.();
        }
      }}
      onCanPlay={() => tryPlay()}
      onError={() => {
        // Si falla el desktop, intentar móvil una vez
        if (src === SRC_DESKTOP) {
          setSrc(SRC_MOBILE);
          readySent.current = false;
          return;
        }
        setFailed(true);
        onFailed?.();
      }}
    />
  );
}
