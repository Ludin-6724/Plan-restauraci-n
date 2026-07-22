# Bosque de Restauración

Aplicación web personal para tu **temporada de restauración**: fe (Palabra y oración), verdades del subconsciente, protocolo de pánico, rutina diaria, santidad, ejercicio, software, trading y tablero de 90 días.

**Tema:** bosque verde en movimiento + sonidos ambientales sintéticos.

> **No es consejo médico.** No sustituye psiquiatra, psicólogo ni medicación. No bajes pastillas sin tu médico.

---

## Cómo usarlo ya (modo local)

Sin Supabase funciona con **localStorage** en tu navegador.

```bash
cd bosque-restauracion
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

1. Completa el onboarding (nombre + fecha de inicio del plan).
2. Activa el **sonido del bosque** (botón arriba a la derecha; el navegador requiere un clic).
3. Usa **Estoy en pánico** cuando lo necesites.
4. Exporta JSON con frecuencia desde **Ajustes**.

---

## Módulos

| Ruta | Qué cubre |
|------|-----------|
| `/` | Dashboard, fase 90 días, frase de temporada, acciones del día |
| `/rutina` | Checklist mañana / propósito / tarde / noche |
| `/verdades` | 19 verdades + personalizadas, sesiones mañana/mediodía/noche |
| `/palabra` | Plan semanal de Escritura + frase guardada |
| `/panico` | Protocolo 10 min, respiración 4-4-4-4, historial |
| `/diario` | 3 líneas + nota semanal |
| `/santidad` | Líneas no negociables + log de luz |
| `/ejercicio` | Circuito A + progreso semanal |
| `/software` | Sesiones + entregable semanal |
| `/trading` | Reglas de riesgo + journal |
| `/lecturas` | Murphy + Inteligencia emocional |
| `/tablero` | Matriz semanal + hitos por fase |
| `/ajustes` | Perfil, audio, export/import, Supabase |

---

## Supabase (conectado)

Proyecto: **Plan Restauración** (`wkkafsdnhdytenyrquur`)

- Migraciones aplicadas (`profiles`, `truths`, `panic_episodes`, `app_snapshots`, … + RLS)
- `.env.local` con publishable + secret (secret solo servidor)
- En **Ajustes**: crear cuenta / iniciar sesión / subir o bajar backup JSON a `app_snapshots`

### Auth en el dashboard de Supabase

1. Authentication → Providers → **Email** activado  
2. (Recomendado en desarrollo) desactiva “Confirm email” si quieres entrar al momento  
3. Authentication → URL configuration:
   - **Site URL:** `https://plan-restauraci-n.vercel.app`
   - **Redirect URLs:** `https://plan-restauraci-n.vercel.app/**` y `http://localhost:3000/**`

---

## Vercel (desplegado)

- Proyecto: `plan-restauraci-n`
- Producción: **https://plan-restauraci-n.vercel.app**
- Env vars Production + Development: `NEXT_PUBLIC_SUPABASE_*`, `SUPABASE_SECRET_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- Plugin marketplace Supabase instalado (`plan-restauracion-db`).  
  **Importante:** el plugin creó un recurso marketplace aparte; la app usa el proyecto **Plan Restauración** vía las env vars que configuramos. Puedes borrar el recurso marketplace extra en Vercel Integrations si no lo usas.

```bash
cd bosque-restauracion
npm run dev          # local con .env.local
vercel --prod        # redeploy
```

---

## Stack

- Next.js 16 (App Router) + TypeScript + Tailwind 4
- Datos: localStorage (v1) + schema Postgres/Supabase preparado
- Deploy: Vercel
- Audio: Web Audio API (bosque sintético, sin archivos externos)

---

## Frase de temporada

> Esta no es mi caída final. Es mi temporada de restauración con Dios.  
> Mi mente se renueva. Mi cuerpo se calma.  
> Mi trabajo da fruto. Mi identidad está en Cristo, no en un cargo ni en el qué dirán.
