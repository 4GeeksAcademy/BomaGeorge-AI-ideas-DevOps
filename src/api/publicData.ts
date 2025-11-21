import { getSupabaseAnonClient } from '../lib/supabaseClient';

export async function fetchDeployments() {
  const supabase = getSupabaseAnonClient();
  const { data, error } = await supabase
    .from('deployments')
    .select('id, environment_id, status, version_id, started_at, completed_at')
    .order('started_at', { ascending: false })
    .limit(50);

  if (error) throw error;
  return data;
}

export async function fetchAlerts() {
  const supabase = getSupabaseAnonClient();
  const { data, error } = await supabase
    .from('alerts')
    .select('id, component_id, severity, status, title, occurred_at')
    .order('occurred_at', { ascending: false })
    .limit(50);

  if (error) throw error;
  return data;
}

export async function fetchEnvironmentState() {
  const supabase = getSupabaseAnonClient();
  const { data, error } = await supabase
    .from('environment_state')
    .select('environment_id, current_version_id, last_deployment_id, updated_at');
  if (error) throw error;
  return data;
}
