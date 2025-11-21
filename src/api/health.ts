import { getSupabaseServiceRoleClient } from '../lib/supabaseClient';

type ComponentStatus = 'healthy' | 'warning' | 'critical' | 'unknown';

export async function upsertComponentHealth(params: {
  componentId: string;
  status: ComponentStatus;
  summary?: string;
}) {
  const supabase = getSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from('component_health')
    .upsert(
      {
        component_id: params.componentId,
        status: params.status,
        summary: params.summary ?? null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'component_id' },
    )
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function getHealthGrid() {
  const supabase = getSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from('component_health')
    .select('component_id, status, summary, updated_at');
  if (error) throw error;
  return data;
}

// Placeholder adapters: integrate Prometheus/OTel here.
export async function fetchMetricsSnapshot(componentName: string) {
  const prometheusBase = process.env.PROMETHEUS_URL;
  const promToken = process.env.PROMETHEUS_BEARER_TOKEN;

  if (!prometheusBase) {
    return { componentName, uptime: 99.9, latencyP95: 210, errorRate: 0.12 };
  }

  const headers: Record<string, string> = {};
  if (promToken) headers['Authorization'] = `Bearer ${promToken}`;

  const uptimeQuery = encodeURIComponent(`avg_over_time(up{job="${componentName}"}[1h])`);
  const latencyQuery = encodeURIComponent(
    `histogram_quantile(0.95, rate(http_request_duration_seconds_bucket{job="${componentName}"}[5m]))`,
  );
  const errorRateQuery = encodeURIComponent(
    `rate(http_requests_total{job="${componentName}",code=~"5.."}[5m])`,
  );

  const [uptimeResp, latencyResp, errorResp] = await Promise.all([
    fetch(`${prometheusBase}/api/v1/query?query=${uptimeQuery}`, { headers }),
    fetch(`${prometheusBase}/api/v1/query?query=${latencyQuery}`, { headers }),
    fetch(`${prometheusBase}/api/v1/query?query=${errorRateQuery}`, { headers }),
  ]);

  if (!uptimeResp.ok || !latencyResp.ok || !errorResp.ok) {
    return { componentName, uptime: 99.9, latencyP95: 210, errorRate: 0.12 };
  }

  const uptimeData = await uptimeResp.json();
  const latencyData = await latencyResp.json();
  const errorData = await errorResp.json();

  const uptime = extractValue(uptimeData) ?? 99.9;
  const latencyP95 = (extractValue(latencyData) ?? 0.21) * 1000; // seconds -> ms
  const errorRate = (extractValue(errorData) ?? 0.001) * 100; // to percentage

  return { componentName, uptime, latencyP95, errorRate };
}

export async function fetchLogSnippet(componentName: string) {
  const logEndpoint = process.env.LOG_API_URL;
  const apiKey = process.env.LOG_API_KEY;
  if (!logEndpoint) return ['log line example'];

  const url = `${logEndpoint}/logs?component=${encodeURIComponent(componentName)}&limit=5`;
  const resp = await fetch(url, {
    headers: apiKey ? { Authorization: `Bearer ${apiKey}` } : undefined,
  });
  if (!resp.ok) return ['log line example'];
  const data = await resp.json();
  return (data?.logs as string[]) ?? ['log line example'];
}

export function computeHealthStatus(metrics: { uptime: number; latencyP95: number; errorRate: number }): ComponentStatus {
  if (metrics.errorRate > 5 || metrics.latencyP95 > 2000 || metrics.uptime < 95) return 'critical';
  if (metrics.errorRate > 1 || metrics.latencyP95 > 1000 || metrics.uptime < 98) return 'warning';
  return 'healthy';
}

function extractValue(resp: any): number | null {
  const val = resp?.data?.result?.[0]?.value?.[1];
  if (!val) return null;
  const num = Number(val);
  return Number.isFinite(num) ? num : null;
}
