# Checklist de puesta en marcha (10–15 min)

## Tú me pasas (o pones en Vercel)

- [ ] `OPENAI_API_KEY` (o de otro proveedor compatible)
- [ ] Confirmación de que el SQL `005_ai_insights.sql` está ejecutado
- [ ] Tu `user_id` (Supabase → Authentication → Users → copiar UUID)

## En Vercel (Environment Variables → Production)

- [ ] `OPENAI_API_KEY`
- [ ] `OPENAI_MODEL=gpt-4o-mini` (opcional)
- [ ] `N8N_CRON_SECRET` = un string largo aleatorio (ej. `openssl rand -hex 24`)
- [ ] `AI_DEFAULT_USER_ID` = tu UUID
- [ ] Redeploy

## En la app

- [ ] Login
- [ ] Ajustes → **Forzar sync** (para que exista `app_snapshots`)
- [ ] Panel → **Coach del bosque** → Generar verdades / los 3

## En n8n Pro

- [ ] Import `bosque-coach-cron.json`
- [ ] URL del HTTP Request = tu dominio + `/api/ai/cron`
- [ ] Header `Authorization: Bearer <mismo N8N_CRON_SECRET>`
- [ ] Test workflow una vez
- [ ] Activar schedule

## Opcional después

- [ ] Nodo email/Telegram en la rama Éxito de n8n
- [ ] Segundo workflow diario solo `truths_panel` a las 7:00
