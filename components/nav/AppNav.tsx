"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ComponentType, type MouseEvent } from "react";
import {
  BookOpen,
  Brain,
  Dumbbell,
  HeartPulse,
  Home,
  LayoutGrid,
  LineChart,
  Code2,
  Menu,
  NotebookPen,
  Settings,
  Shield,
  Sparkles,
  TreePine,
  TrendingUp,
  Archive,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  PenLine,
} from "lucide-react";
import { useData } from "@/lib/data-context";
import {
  META_SECTIONS,
  REGISTER_SECTIONS,
  getFocus,
  priorityHrefsForUser,
  registerSectionsFor,
} from "@/lib/focus-areas";
import { purposeLabelFor, tradingEnabledFor } from "@/lib/purpose";
import { ThemePicker } from "@/components/theme/ThemePicker";

type NavIcon = ComponentType<{ size?: number; className?: string }>;

export type NavItem = {
  href: string;
  label: string;
  icon: NavIcon;
  /** Texto corto para el menú Registrar */
  hint?: string;
  spiritual?: boolean;
};

type NavGroup = {
  id: string;
  title: string;
  subtitle?: string;
  items: NavItem[];
};

const NAV_BY_HREF: Record<string, NavItem> = {
  "/": { href: "/", label: "Hoy", icon: Home, hint: "Resumen del día" },
  "/rutina": { href: "/rutina", label: "Rutina", icon: TreePine, hint: "Checklist del día" },
  "/diario": { href: "/diario", label: "Diario", icon: NotebookPen, hint: "3 líneas", spiritual: true },
  "/verdades": { href: "/verdades", label: "Verdades", icon: Sparkles, hint: "Repetir y archivar", spiritual: true },
  "/palabra": { href: "/palabra", label: "Palabra", icon: BookOpen, hint: "Lectura bíblica", spiritual: true },
  "/ejercicio": { href: "/ejercicio", label: "Cuerpo", icon: Dumbbell, hint: "Ejercicio / caminata" },
  "/panico": { href: "/panico", label: "Pánico", icon: HeartPulse, hint: "Protocolo y registro" },
  "/software": { href: "/software", label: "Software", icon: Code2, hint: "Sesión y meta semanal" },
  "/trading": { href: "/trading", label: "Trading", icon: LineChart, hint: "Journal y reglas" },
  "/lecturas": { href: "/lecturas", label: "Lecturas", icon: Brain, hint: "Libros y notas" },
  "/tablero": { href: "/tablero", label: "Tablero", icon: LayoutGrid, hint: "Pilares de la semana" },
  "/santidad": { href: "/santidad", label: "Santidad", icon: Shield, hint: "Líneas y log de luz", spiritual: true },
  "/progreso": { href: "/progreso", label: "Progreso", icon: TrendingUp, hint: "Score y gráfica" },
  "/archivo": { href: "/archivo", label: "Archivo", icon: Archive, hint: "Todo lo guardado" },
  "/ajustes": { href: "/ajustes", label: "Ajustes", icon: Settings, hint: "Tema, nube, perfil" },
};

function itemsFromHrefs(hrefs: string[], labelOverrides?: Record<string, string>): NavItem[] {
  return hrefs
    .map((h) => {
      const item = NAV_BY_HREF[h];
      if (!item) return undefined;
      const label = labelOverrides?.[h];
      return label ? { ...item, label } : item;
    })
    .filter(Boolean) as NavItem[];
}

/** Grupos seccionados para Registrar + menú (todas las funciones, orden por foco). */
export function buildNavGroups(
  primaryFocus: string,
  focusAreas: string[],
  tradingEnabled: boolean = true,
  purposeLabel: string = "Software"
): NavGroup[] {
  const priority = priorityHrefsForUser(primaryFocus, focusAreas, tradingEnabled);
  const prioritySet = new Set(priority);
  const focusLabel = getFocus(primaryFocus)?.label;
  const labelOverrides = { "/software": purposeLabel };
  const sections = registerSectionsFor(tradingEnabled);

  const registerGroups: NavGroup[] = [
    {
      id: "prioridad",
      title: focusLabel ? `Tu prioridad · ${focusLabel}` : "Tu prioridad",
      subtitle: "Empieza por aquí según lo que marcaste al entrar",
      items: itemsFromHrefs(priority, labelOverrides),
    },
    ...sections.map((sec) => ({
      id: sec.id,
      title: sec.title,
      subtitle: sec.subtitle,
      // Evitar duplicar lo ya listado en prioridad (sigue disponible en su sección si no está en priority... actually user wants all functions. Duplicates in priority + section is OK, or filter from sections)
      items: itemsFromHrefs(sec.hrefs.filter((h) => !prioritySet.has(h)), labelOverrides),
    })).filter((g) => g.items.length > 0),
  ];

  // Asegurar que no se pierda ningún href de registrar
  const listed = new Set(registerGroups.flatMap((g) => g.items.map((i) => i.href)));
  const allRegister = sections.flatMap((s) => s.hrefs);
  const missing = allRegister.filter((h) => !listed.has(h) && !prioritySet.has(h));
  if (missing.length) {
    registerGroups.push({
      id: "mas",
      title: "Más",
      items: itemsFromHrefs(missing, labelOverrides),
    });
  }

  const meta: NavGroup[] = META_SECTIONS.map((sec) => ({
    id: sec.id,
    title: sec.title,
    subtitle: sec.subtitle,
    items: itemsFromHrefs(sec.hrefs),
  }));

  return [...registerGroups, ...meta];
}

/** Lista plana de ítems de registro (compat). */
export function allRegisterItems(): NavItem[] {
  return REGISTER_SECTIONS.flatMap((s) => itemsFromHrefs(s.hrefs));
}

const HOME: NavItem = NAV_BY_HREF["/"];

const SIDEBAR_KEY = "bosque-sidebar-open";

function isActive(pathname: string, href: string) {
  return href === "/" ? pathname === "/" : pathname.startsWith(href);
}

export function AppNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { data } = useData();
  const [open, setOpen] = useState(true);
  const [sheet, setSheet] = useState<"registrar" | "menu" | null>(null);

  const primaryFocus = data.profile.settings.primary_focus || "";
  const focusAreas = data.profile.settings.focus_areas || [];
  const tradingEnabled = tradingEnabledFor(data.profile.settings);
  const purposeLabel = purposeLabelFor(data.profile.settings);
  const navGroups = useMemo(
    () => buildNavGroups(primaryFocus, focusAreas, tradingEnabled, purposeLabel),
    [primaryFocus, focusAreas, tradingEnabled, purposeLabel]
  );
  /** Solo práctica/registro (para Registrar y sidebar de práctica) */
  const registerGroups = useMemo(
    () => navGroups.filter((g) => !["ver", "cuenta"].includes(g.id)),
    [navGroups]
  );
  const registerHrefs = useMemo(
    () => new Set(registerGroups.flatMap((g) => g.items.map((i) => i.href))),
    [registerGroups]
  );

  useEffect(() => {
    try {
      const saved = localStorage.getItem(SIDEBAR_KEY);
      if (saved === "0") setOpen(false);
      if (saved === "1") setOpen(true);
    } catch {
      /* ignore */
    }
  }, []);

  // Prefetch solo de las rutas de uso diario (antes eran 14: bajaba
  // hasta el texto bíblico completo en cada visita, pegando en la carga inicial)
  useEffect(() => {
    const hrefs = ["/", "/rutina", "/diario", "/verdades", "/panico"];
    hrefs.forEach((h) => {
      try {
        router.prefetch(h);
      } catch {
        /* ignore */
      }
    });
  }, [router]);

  // El resto de rutas se precalienta cuando el hilo queda libre: la carga
  // inicial no compite con nada y la navegación posterior es instantánea
  useEffect(() => {
    const rest = [
      "/palabra",
      "/ejercicio",
      "/software",
      ...(tradingEnabled ? ["/trading"] : []),
      "/lecturas",
      "/tablero",
      "/santidad",
      "/archivo",
      "/progreso",
      "/ajustes",
    ];
    const warm = () => {
      rest.forEach((h) => {
        try {
          router.prefetch(h);
        } catch {
          /* ignore */
        }
      });
    };
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    if (w.requestIdleCallback) {
      const id = w.requestIdleCallback(warm, { timeout: 6000 });
      return () => w.cancelIdleCallback?.(id);
    }
    const t = window.setTimeout(warm, 3500);
    return () => window.clearTimeout(t);
  }, [router, tradingEnabled]);

  // Al abrir la hoja de navegación el usuario ya va a elegir sección:
  // precalienta de inmediato por si el idle aún no corre
  useEffect(() => {
    if (sheet !== "registrar") return;
    registerHrefs.forEach((h) => {
      try {
        router.prefetch(h);
      } catch {
        /* ignore */
      }
    });
  }, [sheet, registerHrefs, router]);

  useEffect(() => {
    document.documentElement.classList.toggle("sidebar-open", open);
    document.documentElement.classList.toggle("sidebar-closed", !open);
    try {
      localStorage.setItem(SIDEBAR_KEY, open ? "1" : "0");
    } catch {
      /* ignore */
    }
  }, [open]);

  // Cerrar hoja al cambiar de ruta (después de navegar, no en el onClick del Link)
  useEffect(() => {
    setSheet(null);
  }, [pathname]);

  // Bloquear scroll del body con hoja abierta (no tocar position:fixed — rompe taps)
  useEffect(() => {
    if (!sheet) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [sheet]);

  /**
   * Navegar desde el sheet: NO setState en el mismo click del Link
   * (desmontaba el enlace y a veces cancelaba la navegación en móvil).
   * Cierra la hoja en el siguiente frame; el pathname effect también cierra.
   */
  const goFromSheet = (href: string) => (e: MouseEvent) => {
    e.preventDefault();
    setSheet(null);
    // Liberar el hilo del cierre del sheet antes de navegar
    requestAnimationFrame(() => {
      router.push(href);
    });
  };

  const registrarActive =
    sheet === "registrar" ||
    [...registerHrefs].some((h) => h !== "/panico" && isActive(pathname, h));
  const menuActive = sheet === "menu";

  return (
    <>
      {/* Botón plegar — escritorio */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="sidebar-toggle hidden lg:inline-flex"
        title={open ? "Ocultar menú" : "Mostrar menú"}
        aria-label={open ? "Ocultar menú" : "Mostrar menú"}
        aria-expanded={open}
      >
        {open ? <PanelLeftClose size={20} /> : <PanelLeftOpen size={20} />}
        <span className="sidebar-toggle-label">{open ? "Ocultar menú" : "Menú"}</span>
      </button>

      {/* Sidebar escritorio agrupado */}
      <aside
        className={`desktop-sidebar hidden lg:flex fixed left-0 top-0 bottom-0 w-56 z-50 flex-col border-r border-line bg-canvas/95 backdrop-blur-xl pointer-events-auto transition-transform duration-200 ease-out ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-4 border-b border-line flex items-start justify-between gap-2">
          <div>
            <div className="flex items-center gap-2 text-ink font-semibold">
              <TreePine className="text-primary-bright" size={22} />
              <span>Bosque</span>
            </div>
            <p className="text-xs text-subtle mt-1">Restauración</p>
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="p-1.5 rounded-lg text-muted hover:text-ink hover:bg-surface-soft/80 transition"
            title="Ocultar menú"
            aria-label="Ocultar menú"
          >
            <PanelLeftClose size={18} />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto p-2 space-y-3">
          <DesktopLink item={HOME} pathname={pathname} />
          {registerGroups.map((group) => (
            <div key={group.id}>
              <p className="px-3 pt-2 pb-1 text-[10px] uppercase tracking-wider text-subtle font-semibold">
                {group.title}
              </p>
              {group.subtitle && (
                <p className="px-3 pb-1 text-[10px] text-subtle/80 leading-snug">{group.subtitle}</p>
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <DesktopLink key={`${group.id}-${item.href}`} item={item} pathname={pathname} />
                ))}
              </div>
            </div>
          ))}
          <div>
            <p className="px-3 pt-2 pb-1 text-[10px] uppercase tracking-wider text-subtle font-semibold">
              Configuración
            </p>
            <div className="space-y-0.5">
              <DesktopLink item={NAV_BY_HREF["/progreso"]} pathname={pathname} />
              <DesktopLink item={NAV_BY_HREF["/archivo"]} pathname={pathname} />
              <DesktopLink item={NAV_BY_HREF["/ajustes"]} pathname={pathname} />
            </div>
          </div>
        </nav>
      </aside>

      {/* Barra inferior móvil — siempre por encima del sheet Registrar/Menú */}
      <nav
        className="mobile-bottom-nav lg:hidden fixed bottom-0 inset-x-0 z-[70] border-t border-line bg-canvas/95 backdrop-blur-xl safe-bottom"
        aria-label="Navegación principal"
      >
        <div className="grid grid-cols-5 items-end gap-0 px-1 pt-1 pb-1.5 max-w-lg mx-auto">
          <BottomTab
            href="/"
            label="Hoy"
            icon={Home}
            active={pathname === "/" && !sheet}
          />
          <button
            type="button"
            onClick={() => setSheet((s) => (s === "registrar" ? null : "registrar"))}
            className={`flex flex-col items-center gap-0.5 py-1.5 min-w-0 rounded-xl text-[10px] transition active:scale-95 ${
              registrarActive ? "text-primary-bright" : "text-muted"
            }`}
            aria-expanded={sheet === "registrar"}
          >
            <span
              className={`flex items-center justify-center w-9 h-7 rounded-full transition ${
                registrarActive ? "bg-primary/16" : ""
              }`}
            >
              <PenLine size={20} />
            </span>
            Registrar
          </button>
          <Link
            href="/panico"
            aria-label="Protocolo de pánico"
            className="flex flex-col items-center gap-0.5 -mt-4"
          >
            <span
              className={`flex items-center justify-center w-14 h-14 rounded-full border shadow-lg shadow-danger-deep/40 transition active:scale-95 ${
                isActive(pathname, "/panico")
                  ? "bg-danger border-white/45"
                  : "bg-danger-deep border-danger/70"
              }`}
            >
              <HeartPulse size={24} className="text-white" />
            </span>
            <span
              className={`text-[10px] ${
                isActive(pathname, "/panico") ? "text-danger-text font-medium" : "text-muted"
              }`}
            >
              Pánico
            </span>
          </Link>
          <BottomTab
            href="/archivo"
            label="Archivo"
            icon={Archive}
            active={isActive(pathname, "/archivo") && !sheet}
          />
          <button
            type="button"
            onClick={() => setSheet((s) => (s === "menu" ? null : "menu"))}
            className={`flex flex-col items-center gap-0.5 py-1.5 min-w-0 rounded-xl text-[10px] transition active:scale-95 ${
              menuActive ? "text-primary-bright" : "text-muted"
            }`}
            aria-expanded={sheet === "menu"}
          >
            <span
              className={`flex items-center justify-center w-9 h-7 rounded-full transition ${
                menuActive ? "bg-primary/16" : ""
              }`}
            >
              <Menu size={20} />
            </span>
            Menú
          </button>
        </div>
      </nav>

      {/* Hojas móviles: encima de la barra; pointer-events solo en sheet + backdrop */}
      {sheet && (
        <div className="mobile-sheet-layer lg:hidden fixed inset-x-0 top-0 z-[60] flex flex-col justify-end pointer-events-none">
          <button
            type="button"
            className="absolute inset-0 bg-black/40 pointer-events-auto"
            aria-label="Cerrar"
            onClick={() => setSheet(null)}
          />
          <div
            className="relative mobile-sheet overflow-hidden flex flex-col rounded-t-3xl border border-line shadow-2xl pointer-events-auto"
            role="dialog"
            aria-modal="true"
            aria-label={sheet === "registrar" ? "Registrar" : "Menú"}
          >
            <div className="flex items-center justify-between px-4 pt-3 pb-2 border-b border-line shrink-0">
              <div>
                <p className="text-base font-semibold text-ink">
                  {sheet === "registrar" ? "Registrar" : "Configuración"}
                </p>
                <p className="text-[11px] text-subtle">
                  {sheet === "registrar"
                    ? "Práctica y registro por secciones"
                    : "Perfil, tema y preferencias"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSheet(null)}
                className="p-2 rounded-full bg-surface-soft text-muted hover:text-ink"
                aria-label="Cerrar menú"
              >
                <X size={18} />
              </button>
            </div>
            <div className="overflow-y-auto overscroll-contain px-3 py-3 pb-4 space-y-4 touch-pan-y">
              {sheet === "registrar" ? (
                <RegisterSections groups={registerGroups} pathname={pathname} onGo={goFromSheet} />
              ) : (
                <ConfigMenu onGo={goFromSheet} />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function DesktopLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const active = isActive(pathname, item.href);
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={`relative flex items-center gap-2.5 px-3 py-2 rounded-xl text-sm transition ${
        active
          ? item.spiritual
            ? "bg-spiritual/12 text-ink font-medium"
            : "bg-primary/16 text-ink font-medium"
          : "text-muted hover:bg-surface-soft/70 hover:text-ink"
      }`}
    >
      {active && (
        <span
          className={`absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 rounded-full ${
            item.spiritual ? "bg-spiritual" : "bg-primary-bright"
          }`}
        />
      )}
      <Icon
        size={16}
        className={item.spiritual ? "text-spiritual" : active ? "text-primary-bright" : ""}
      />
      {item.label}
    </Link>
  );
}

function BottomTab({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: NavIcon;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      prefetch
      className={`flex flex-col items-center gap-0.5 py-1.5 min-w-0 rounded-xl text-[10px] transition active:scale-95 ${
        active ? "text-primary-bright" : "text-muted"
      }`}
    >
      <span
        className={`flex items-center justify-center w-9 h-7 rounded-full transition ${
          active ? "bg-primary/16" : ""
        }`}
      >
        <Icon size={20} />
      </span>
      {label}
    </Link>
  );
}

function RegisterSections({
  groups,
  pathname,
  onGo,
}: {
  groups: NavGroup[];
  pathname: string;
  onGo: (href: string) => (e: MouseEvent) => void;
}) {
  return (
    <div className="space-y-4">
      {groups.map((group) => (
        <div key={group.id}>
          <div className="px-0.5 mb-2">
            <p className="text-xs font-semibold text-ink">{group.title}</p>
            {group.subtitle && <p className="text-[11px] text-subtle">{group.subtitle}</p>}
          </div>
          <div className="grid grid-cols-2 gap-2">
            {group.items.map((item) => {
              const Icon = item.icon;
              const active = isActive(pathname, item.href);
              return (
                <a
                  key={`${group.id}-${item.href}`}
                  href={item.href}
                  onClick={onGo(item.href)}
                  className={`nav-tile flex flex-col gap-1 rounded-2xl border p-3 transition active:scale-[0.98] select-none ${
                    active ? "nav-tile--active" : ""
                  } ${item.spiritual ? "nav-tile--spiritual" : ""}`}
                >
                  <span className="nav-icon-box flex items-center justify-center w-9 h-9 rounded-xl">
                    <Icon size={18} />
                  </span>
                  <span className="nav-tile__title text-sm font-semibold leading-tight">{item.label}</span>
                  {item.hint && (
                    <span className="nav-tile__hint text-[11px] leading-snug">{item.hint}</span>
                  )}
                </a>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

/** Menú móvil = solo configuración (no repite Registrar). */
function ConfigMenu({ onGo }: { onGo: (href: string) => (e: MouseEvent) => void }) {
  const { data, updateProfile, user, cloudStatus, forceSync } = useData();
  const [syncMsg, setSyncMsg] = useState("");
  // Nombre: edición local, commit al salir (evita un commit global por tecla)
  const [nameDraft, setNameDraft] = useState(data.profile.name);
  useEffect(() => setNameDraft(data.profile.name), [data.profile.name]);

  return (
    <div className="space-y-4">
      {/* 1. Perfil */}
      <section className="space-y-2">
        <p className="text-xs font-semibold text-ink px-0.5">1 · Perfil</p>
        <div className="rounded-2xl border border-line bg-surface-raised p-3 space-y-2.5">
          <label className="block space-y-1">
            <span className="text-[11px] text-muted">Nombre</span>
            <input
              className="input-field !py-2"
              value={nameDraft}
              onChange={(e) => setNameDraft(e.target.value)}
              onBlur={() => {
                if (nameDraft !== data.profile.name) updateProfile({ name: nameDraft });
              }}
              placeholder="Tu nombre"
            />
          </label>
          <label className="block space-y-1">
            <span className="text-[11px] text-muted">Inicio del plan</span>
            <input
              className="input-field !py-2"
              type="date"
              value={data.profile.plan_start_date}
              onChange={(e) => updateProfile({ plan_start_date: e.target.value })}
            />
          </label>
          {user?.email && (
            <p className="text-[11px] text-subtle truncate">Sesión: {user.email}</p>
          )}
        </div>
      </section>

      {/* 2. Tema de color (justo después del perfil) */}
      <section className="space-y-2">
        <p className="text-xs font-semibold text-ink px-0.5">2 · Tema de color</p>
        <p className="text-[11px] text-subtle px-0.5 -mt-1">
          Elige la paleta que te dé más calma.
        </p>
        <div className="rounded-2xl border border-line bg-surface-raised p-3">
          <ThemePicker />
        </div>
      </section>

      {/* 3. Ver avance (no es registrar) */}
      <section className="space-y-2">
        <p className="text-xs font-semibold text-ink px-0.5">3 · Ver avance</p>
        <div className="nav-menu-group rounded-2xl border border-line overflow-hidden">
          <a
            href="/progreso"
            onClick={onGo("/progreso")}
            className="nav-tile nav-tile--row nav-tile--flat flex items-center gap-3 px-3 py-3 select-none"
          >
            <span className="nav-icon-box flex items-center justify-center w-8 h-8 rounded-lg shrink-0">
              <TrendingUp size={16} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="nav-tile__title block text-sm font-medium">Progreso</span>
              <span className="nav-tile__hint block text-[11px]">Score y gráfica</span>
            </span>
          </a>
          <a
            href="/archivo"
            onClick={onGo("/archivo")}
            className="nav-tile nav-tile--row nav-tile--flat flex items-center gap-3 px-3 py-3 border-t border-line select-none"
          >
            <span className="nav-icon-box flex items-center justify-center w-8 h-8 rounded-lg shrink-0">
              <Archive size={16} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="nav-tile__title block text-sm font-medium">Archivo</span>
              <span className="nav-tile__hint block text-[11px]">Historial guardado</span>
            </span>
          </a>
        </div>
      </section>

      {/* 4. Más ajustes */}
      <section className="space-y-2">
        <p className="text-xs font-semibold text-ink px-0.5">4 · Más ajustes</p>
        <div className="nav-menu-group rounded-2xl border border-line overflow-hidden">
          <a
            href="/ajustes"
            onClick={onGo("/ajustes")}
            className="nav-tile nav-tile--row nav-tile--flat flex items-center gap-3 px-3 py-3 select-none"
          >
            <span className="nav-icon-box flex items-center justify-center w-8 h-8 rounded-lg shrink-0">
              <Settings size={16} />
            </span>
            <span className="min-w-0 flex-1">
              <span className="nav-tile__title block text-sm font-medium">Ajustes completos</span>
              <span className="nav-tile__hint block text-[11px]">
                Enfoque, frase, audio, nube, respaldo
              </span>
            </span>
          </a>
        </div>
        <button
          type="button"
          className="w-full text-sm font-medium rounded-xl border border-line py-2.5 text-ink bg-surface-raised"
          onClick={async () => {
            setSyncMsg("Sincronizando…");
            await forceSync();
            setSyncMsg("Nube actualizada.");
          }}
        >
          Sincronizar ahora · {cloudStatus}
        </button>
        {syncMsg && <p className="text-[11px] text-primary-bright text-center">{syncMsg}</p>}
      </section>

      <p className="text-[11px] text-subtle text-center px-2">
        Para anotar del día usa <strong className="text-ink">Registrar</strong> abajo — no se repite
        aquí.
      </p>
    </div>
  );
}


