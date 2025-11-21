# Deployment Guide (Vercel + Supabase)

## Prereqs
- Supabase project (DB/Auth/Realtime enabled).
- Prometheus endpoint (optional but recommended) and log API/Elastic endpoint (optional).
- Vercel account.

## Environment Variables
Set these on Vercel (Project Settings -> Environment Variables) and locally in `.env`:
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (server-only)
- `PROMETHEUS_URL` (optional)
- `PROMETHEUS_BEARER_TOKEN` (optional)
- `LOG_API_URL` (optional)
- `LOG_API_KEY` (optional)

## Database
- Run `supabase/schema.sql` against your Supabase database (SQL Editor or `psql`).

## Deploy Web/API
- Push to GitHub and import the repo into Vercel.
- Framework: Next.js.
- Set env vars as above (mark service role key as encrypted/server-only).
- Deploy.

## Background/Worker
- If using queues/webhooks: deploy `src/jobs/deploymentWorker.ts` logic as a Vercel cron hitting your queue, or a small service on Render/Fly/Railway.
- Ensure worker has the same Supabase service env vars.

## Realtime
- Supabase Realtime must be enabled for the `deployments` and `alerts` tables (enabled by default for public schema). In Supabase Dashboard -> Database -> Replication -> Realtime, ensure these tables are turned on.

## CI/CD Webhooks
- Register webhooks from GitHub Actions/GitLab/ArgoCD to post deployment status to your webhook ingestion endpoint/queue that calls `ingestWebhook`.
- Validate signatures in your webhook handler (add if not using a trusted source).

## Smoke Tests Post-Deploy
- Hit `/api/deployments/list` and `/api/alerts/list` to verify DB + env vars.
- Trigger a test deployment via `/api/deployments/trigger` with a sample env/version.
- Confirm Realtime updates on the dashboard and alert feed when inserting test rows into Supabase.
