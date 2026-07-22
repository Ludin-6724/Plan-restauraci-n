"use client";

import { useState } from "react";
import { signInWithEmail, signInWithGoogle } from "@/lib/supabase/auth";
import {
  TreePine,
  HeartPulse,
  Wind,
  NotebookPen,
  TrendingUp,
  Volume2,
  Lock,
  ShieldCheck,
  Sunrise,
  LifeBuoy,
} from "lucide-react";

const FEATURES = [
  {
    icon: HeartPulse,
    title: "Protocolo de pánico",
    body: "Pasos guiados y respiración 4-4-4-4 para atravesar la crisis con seguridad, sin quedarte solo con el miedo.",
  },
  {
    icon: Sunrise,
    title: "Rutina que entrena la calma",
    body: "Verdades que repites con constancia, ancla del día y hábitos simples que reprograman los pensamientos que disparan el pánico.",
  },
  {
    icon: NotebookPen,
    title: "Registro sin juicio",
    body: "Anota cada episodio: qué lo disparó, qué te ayudó y cómo bajó la intensidad. Conocer tu patrón es parte de la salida.",
  },
  {
    icon: TrendingUp,
    title: "Progreso visible",
    body: "Rachas, tablero semanal e hitos por fases. Ver la mejora en datos reales alimenta la esperanza en los días difíciles.",
  },
  {
    icon: Volume2,
    title: "Un ambiente que abraza",
    body: "Bosque real de fondo, sonidos de naturaleza y paletas de color que eliges según lo que a ti te da paz.",
  },
  {
    icon: Lock,
    title: "Privado y tuyo",
    body: "Sin feeds, sin comparaciones, sin ruido. Tus datos viven en tu cuenta y se sincronizan entre tus dispositivos.",
  },
];

const STEPS = [
  {
    n: "1",
    title: "Crea tu espacio",
    body: "Entra con Google o tu correo y define tu prioridad. La app se ordena alrededor de lo que necesitas.",
  },
  {
    n: "2",
    title: "Practica a diario",
    body: "Unos minutos por la mañana y por la noche: verdades, respiración, diario. La calma se entrena con repetición.",
  },
  {
    n: "3",
    title: "Cuando llegue el pánico",
    body: "Abre el protocolo. Te acompaña paso a paso hasta que la ola baje, y registra lo aprendido para la próxima vez.",
  },
];

export function LoginScreen({ errorHint }: { errorHint?: string | null }) {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState(errorHint || "");
  const [busy, setBusy] = useState(false);

  const loginGoogle = async () => {
    setBusy(true);
    setMsg("");
    try {
      const { data, error } = await signInWithGoogle();
      if (error) setMsg(error.message);
      else if (data?.url) window.location.href = data.url;
    } catch (e) {
      setMsg(e instanceof Error ? e.message : "Error con Google");
    }
    setBusy(false);
  };

  const loginEmail = async () => {
    setBusy(true);
    setMsg("");
    const { error } = await signInWithEmail(email);
    if (error) setMsg(error.message);
    else setMsg("Revisa tu correo: te enviamos un enlace para entrar.");
    setBusy(false);
  };

  return (
    <div className="landing">
      <div className="landing-scrim" aria-hidden />
      <div className="landing-vignette" aria-hidden />

      {/* ——— Héroe + acceso ——— */}
      <div className="landing-shell">
        <div className="landing-narrative">
          <p className="landing-kicker">
            <HeartPulse size={14} strokeWidth={2} />
            <span>Acompañamiento para ataques de pánico y ansiedad</span>
          </p>

          <h1 className="landing-title">
            Recupera la calma,
            <br />
            un día a la vez.
          </h1>

          <p className="landing-lead">
            Bosque de Restauración es un refugio digital para quienes viven con ataques de pánico:
            un <em>protocolo claro</em> para los momentos de crisis y una <em>rutina diaria</em> que
            entrena tu mente para la calma.
          </p>

          <div className="landing-aid" role="note">
            <ShieldCheck size={18} strokeWidth={2} aria-hidden />
            <p>
              <strong>Una ayuda, no un sustituto.</strong> Esta app no reemplaza la terapia ni la
              atención médica: es un apoyo entre sesiones, pensado para usarse junto a tu
              profesional de salud.
            </p>
          </div>

          <ul className="landing-chips" aria-label="Lo esencial">
            <li>
              <Wind size={13} aria-hidden /> Respiración guiada
            </li>
            <li>
              <TreePine size={13} aria-hidden /> Ambiente de bosque real
            </li>
            <li>
              <TrendingUp size={13} aria-hidden /> Progreso medible
            </li>
          </ul>
        </div>

        {/* Columna acceso */}
        <aside className="landing-access" id="entrar">
          <div className="landing-access-inner">
            <div className="landing-access-brand">
              <TreePine size={22} strokeWidth={1.75} />
              <span>Entra a tu bosque</span>
            </div>
            <p className="landing-access-sub">
              Crea tu espacio o inicia sesión. Sincroniza entre teléfono y computadora.
            </p>

            <button
              type="button"
              className="landing-cta"
              disabled={busy}
              onClick={() => void loginGoogle()}
            >
              {busy ? "Conectando…" : "Continuar con Google"}
            </button>

            <div className="landing-or">
              <span>o con correo</span>
            </div>

            <div className="landing-email">
              <label className="landing-label" htmlFor="landing-email">
                Correo
              </label>
              <input
                id="landing-email"
                className="landing-input"
                type="email"
                autoComplete="email"
                placeholder="tu@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <button
                type="button"
                className="landing-cta landing-cta--ghost"
                disabled={busy || !email.trim()}
                onClick={() => void loginEmail()}
              >
                Enviar enlace mágico
              </button>
            </div>

            {msg && <p className="landing-msg">{msg}</p>}

            <p className="landing-legal">
              No sustituye atención médica ni psicológica. No cambies medicación sin tu profesional.
              En crisis grave, busca ayuda inmediata.
            </p>
          </div>
        </aside>
      </div>

      {/* ——— Qué encuentras dentro ——— */}
      <div className="landing-sections">
        <section className="landing-section">
          <h2 className="landing-section-title">Qué encuentras dentro</h2>
          <p className="landing-section-sub">
            Herramientas concretas para el momento de crisis y para el trabajo lento de cada día.
          </p>
          <div className="landing-grid">
            {FEATURES.map(({ icon: Icon, title, body }) => (
              <article key={title} className="landing-card">
                <span className="landing-card-icon" aria-hidden>
                  <Icon size={19} strokeWidth={1.9} />
                </span>
                <h3>{title}</h3>
                <p>{body}</p>
              </article>
            ))}
          </div>
        </section>

        <section className="landing-section">
          <h2 className="landing-section-title">Cómo funciona</h2>
          <div className="landing-steps">
            {STEPS.map((s) => (
              <div key={s.n} className="landing-step">
                <span className="landing-step-n" aria-hidden>
                  {s.n}
                </span>
                <h3>{s.title}</h3>
                <p>{s.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ——— Aviso honesto ——— */}
        <section className="landing-honest" aria-label="Aviso importante">
          <LifeBuoy size={22} strokeWidth={1.8} aria-hidden />
          <div>
            <h2>Hablemos con honestidad</h2>
            <p>
              Los ataques de pánico se tratan; muchas personas mejoran con acompañamiento adecuado.
              Esta app es una herramienta de apoyo diario — <strong>no diagnostica, no medica y no
              sustituye a un terapeuta</strong>. Si estás en una crisis grave o tienes pensamientos
              de hacerte daño, contacta de inmediato a tu línea local de emergencias o a un
              profesional de salud.
            </p>
          </div>
        </section>
      </div>

      <footer className="landing-foot">
        Bosque de Restauración · Un día a la vez
      </footer>
    </div>
  );
}
