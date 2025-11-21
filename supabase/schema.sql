-- Supabase schema for Deployment & Rollback Manager and Infrastructure Health Dashboard
-- Uses UUID primary keys and status constraints.

create extension if not exists "uuid-ossp";

-- Environments (dev, staging, prod, etc.)
create table if not exists public.environments (
    id uuid primary key default uuid_generate_v4(),
    name text not null unique,
    created_at timestamptz not null default now()
);

-- Versions (build identifiers, git SHAs, or artifact tags)
create table if not exists public.versions (
    id uuid primary key default uuid_generate_v4(),
    version text not null unique,
    artifact_url text,
    created_at timestamptz not null default now()
);

-- Deployments
create table if not exists public.deployments (
    id uuid primary key default uuid_generate_v4(),
    environment_id uuid not null references public.environments(id),
    version_id uuid not null references public.versions(id),
    status text not null check (status in ('pending', 'in_progress', 'succeeded', 'failed', 'rolled_back')),
    triggered_by uuid references auth.users(id),
    started_at timestamptz not null default now(),
    completed_at timestamptz,
    notes text
);
create index if not exists deployments_env_started_idx on public.deployments(environment_id, started_at desc);
create index if not exists deployments_status_idx on public.deployments(status);

-- Audit log for deployment actions (deploy, rollback, acknowledge, etc.)
create table if not exists public.deployment_audit (
    id uuid primary key default uuid_generate_v4(),
    deployment_id uuid not null references public.deployments(id) on delete cascade,
    action text not null check (action in ('deploy', 'rollback', 'mark_failed', 'mark_succeeded')),
    actor uuid references auth.users(id),
    details jsonb,
    created_at timestamptz not null default now()
);
create index if not exists deployment_audit_deployment_idx on public.deployment_audit(deployment_id);

-- Track current environment state for quick lookup
create table if not exists public.environment_state (
    environment_id uuid primary key references public.environments(id) on delete cascade,
    current_version_id uuid references public.versions(id),
    last_deployment_id uuid references public.deployments(id),
    updated_at timestamptz not null default now()
);

-- Components for infra health (services, pipelines, clusters, etc.)
create table if not exists public.components (
    id uuid primary key default uuid_generate_v4(),
    name text not null unique,
    kind text not null default 'service',
    description text,
    owner text,
    created_at timestamptz not null default now()
);

-- SLI/SLO targets per component
create table if not exists public.sli_targets (
    id uuid primary key default uuid_generate_v4(),
    component_id uuid not null references public.components(id) on delete cascade,
    metric text not null, -- e.g., uptime, latency_p95, error_rate
    target numeric not null, -- target value, interpretation depends on metric
    window_minutes integer not null default 1440,
    created_at timestamptz not null default now(),
    unique (component_id, metric)
);

-- Alerts feed
create table if not exists public.alerts (
    id uuid primary key default uuid_generate_v4(),
    component_id uuid references public.components(id) on delete set null,
    severity text not null check (severity in ('critical', 'high', 'medium', 'low', 'info')),
    status text not null check (status in ('open', 'acknowledged', 'resolved')),
    title text not null,
    description text,
    source text, -- e.g., prom, elastic, manual
    occurred_at timestamptz not null default now(),
    acknowledged_by uuid references auth.users(id),
    acknowledged_at timestamptz,
    resolved_at timestamptz
);
create index if not exists alerts_component_idx on public.alerts(component_id);
create index if not exists alerts_status_idx on public.alerts(status);
create index if not exists alerts_severity_idx on public.alerts(severity);

-- Health snapshots (optional per component)
create table if not exists public.component_health (
    id uuid primary key default uuid_generate_v4(),
    component_id uuid not null references public.components(id) on delete cascade,
    status text not null check (status in ('healthy', 'warning', 'critical', 'unknown')),
    summary text,
    updated_at timestamptz not null default now()
);
create index if not exists component_health_component_idx on public.component_health(component_id);

-- Simple view to get latest deployment per environment
create or replace view public.latest_deployments as
select distinct on (d.environment_id)
    d.environment_id,
    d.id as deployment_id,
    d.version_id,
    d.status,
    d.started_at,
    d.completed_at
from public.deployments d
order by d.environment_id, d.started_at desc;
