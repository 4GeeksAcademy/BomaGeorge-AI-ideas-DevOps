import { getSupabaseServiceRoleClient } from '../lib/supabaseClient';

type AlertStatus = 'open' | 'acknowledged' | 'resolved';
type AlertSeverity = 'critical' | 'high' | 'medium' | 'low' | 'info';

export async function ingestAlert(evt: {
  componentId?: string;
  severity: AlertSeverity;
  status?: AlertStatus;
  title: string;
  description?: string;
  source?: string;
  occurredAt?: string;
}) {
  const supabase = getSupabaseServiceRoleClient();
  const { data, error } = await supabase
    .from('alerts')
    .insert({
      component_id: evt.componentId ?? null,
      severity: evt.severity,
      status: evt.status ?? 'open',
      title: evt.title,
      description: evt.description ?? null,
      source: evt.source ?? null,
      occurred_at: evt.occurredAt ?? new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function acknowledgeAlert(params: { alertId: string; actor?: string }) {
  const supabase = getSupabaseServiceRoleClient();
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('alerts')
    .update({
      status: 'acknowledged',
      acknowledged_at: now,
      acknowledged_by: params.actor ?? null,
    })
    .eq('id', params.alertId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function resolveAlert(params: { alertId: string }) {
  const supabase = getSupabaseServiceRoleClient();

  const { data, error } = await supabase
    .from('alerts')
    .update({
      status: 'resolved',
      resolved_at: new Date().toISOString(),
    })
    .eq('id', params.alertId)
    .select()
    .single();

  if (error) throw error;
  return data;
}
