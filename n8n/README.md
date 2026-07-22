# Coach IA · n8n (plan Pro) + app híbrida

> **Estado (julio 2026):** la UI y las rutas `/api/ai/*` están **desactivadas** en la app  
> (sin coste de API). Este material queda como guía para reactivar más adelante.

La **lógica del agente** (prompts, contexto, OpenAI, guardado) se puede volver a montar en Next o solo en n8n.  
**n8n** puede **disparar** el cron y, si quieres, notificar.

```
[Cron domingo 20:00]
        │
        ▼
  n8n HTTP Request
  POST https://TU-APP.vercel.app/api/ai/cron
  Authorization: Bearer <N8N_CRON_SECRET>
  body: { "kind": "all" }
        │
        ▼
  Next.js lee app_snapshots → OpenAI → ai_insights
        │
        ▼
  Panel de la app muestra el resultado
  (también puedes pulsar "Generar" a mano)
```

## 1. Supabase (una vez)

En el SQL Editor de Supabase, ejecuta:

`supabase/migrations/005_ai_insights.sql`

## 2. Variables en Vercel / `.env.local`

| Variable | Uso |
|---|---|
| `OPENAI_API_KEY` | API del modelo (obligatoria) |
| `OPENAI_MODEL` | Opcional, default `gpt-4o-mini` |
| `N8N_CRON_SECRET` | Secreto largo que pondrás en n8n |
| `AI_DEFAULT_USER_ID` | Tu UUID en Supabase → Authentication → Users |
| `SUPABASE_SERVICE_ROLE_KEY` | Ya la tienes (server) |

## 3. Importar workflow en n8n

1. n8n → **Workflows** → **Import from File**  
2. Archivo: `n8n/bosque-coach-cron.json`  
3. Abre el nodo **HTTP Request** y cambia:
   - URL: `https://plan-restauraci-n.vercel.app/api/ai/cron` (o tu dominio)
   - Header `Authorization`: `Bearer TU_N8N_CRON_SECRET`
4. Activa el workflow (Schedule: domingo 20:00 Europe/Madrid; ajústalo).

### Probar a mano

En el workflow: **Test workflow** o curl:

```bash
curl -X POST "https://plan-restauraci-n.vercel.app/api/ai/cron" \
  -H "Authorization: Bearer TU_SECRETO" \
  -H "Content-Type: application/json" \
  -d '{"kind":"all"}'
```

Healthcheck:

```bash
curl "https://plan-restauraci-n.vercel.app/api/ai/cron" \
  -H "Authorization: Bearer TU_SECRETO"
```

## 4. Body opcional

```json
{ "kind": "all" }
```

```json
{ "kind": "trading_review", "user_id": "uuid-opcional" }
```

`kind`: `weekly_review` | `trading_review` | `truths_panel` | `full_coach` | `all`

## 5. Coste

- n8n Pro: 1 ejecución/semana ≈ irrelevante en el cupo.  
- OpenAI mini: céntimos al mes con 4–12 generaciones.

## 6. Seguridad

- Nunca pongas `OPENAI_API_KEY` ni service role en el cliente.  
- El endpoint `/api/ai/cron` **solo** acepta el Bearer secreto.  
- `/api/ai/generate` exige sesión de usuario (botones del Panel).

## 7. Si falla

| Error | Qué hacer |
|---|---|
| No hay snapshot | En la app: Ajustes → Forzar sync |
| OPENAI_API_KEY | Añadir en Vercel y redeploy |
| 401 en cron | Mismo secreto en Vercel y n8n |
| user_id missing | Pon `AI_DEFAULT_USER_ID` o envíalo en el body |
