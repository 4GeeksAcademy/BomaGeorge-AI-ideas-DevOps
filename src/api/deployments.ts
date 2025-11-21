import { getSupabaseServiceRoleClient } from '../lib/supabaseClient';

type DeploymentStatus = 'pending' | 'in_progress' | 'succeeded' | 'failed' | 'rolled_back';

export async function triggerDeployment(params: {
  environmentId: string;
  versionId: string;
  triggeredBy?: string;
  notes?: string;
}) {
  const supabase = getSupabaseServiceRoleClient();
  const { error, data } = await supabase
    .from('deployments')
    .insert({
      environment_id: params.environmentId,
      version_id: params.versionId,
      status: 'pending',
      triggered_by: params.triggeredBy ?? null,
      notes: params.notes ?? null,
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateDeploymentStatus(params: {
  deploymentId: string;
  status: DeploymentStatus;
  details?: Record<string, unknown>;
  actor?: string;
}) {
  const supabase = getSupabaseServiceRoleClient();
  const now = new Date().toISOString();

  const { error, data } = await supabase
    .from('deployments')
    .update({
      status: params.status,
      completed_at: ['succeeded', 'failed'].includes(params.status) ? now : null,
    })
    .eq('id', params.deploymentId)
    .select()
    .single();

  if (error) throw error;

  await supabase.from('deployment_audit').insert({
    deployment_id: params.deploymentId,
    action: statusToAction(params.status),
    actor: params.actor ?? null,
    details: params.details ?? null,
  });

  if (params.status === 'succeeded') {
    await supabase.from('environment_state').upsert(
      {
        environment_id: data.environment_id,
        current_version_id: data.version_id,
        last_deployment_id: data.id,
        updated_at: now,
      },
      { onConflict: 'environment_id' },
    );
  }

  return data;
}

export async function rollbackDeployment(params: {
  environmentId: string;
  actor?: string;
}) {
  const supabase = getSupabaseServiceRoleClient();

  const { data: lastSuccess, error: lastErr } = await supabase
    .from('deployments')
    .select('id, version_id')
    .eq('environment_id', params.environmentId)
    .eq('status', 'succeeded')
    .order('completed_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (lastErr) throw lastErr;
  if (!lastSuccess) throw new Error('No successful deployment to roll back to');

  const { error, data } = await supabase
    .from('deployments')
    .insert({
      environment_id: params.environmentId,
      version_id: lastSuccess.version_id,
      status: 'rolled_back',
      triggered_by: params.actor ?? null,
      notes: 'Automatic rollback to last successful version',
    })
    .select()
    .single();

  if (error) throw error;

  await supabase.from('deployment_audit').insert({
    deployment_id: data.id,
    action: 'rollback',
    actor: params.actor ?? null,
    details: { rolled_back_to: lastSuccess.version_id },
  });

  await supabase.from('environment_state').upsert(
    {
      environment_id: params.environmentId,
      current_version_id: lastSuccess.version_id,
      last_deployment_id: data.id,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'environment_id' },
  );

  return data;
}

export async function ingestWebhook(payload: {
  deploymentId: string;
  status: DeploymentStatus;
  details?: Record<string, unknown>;
  actor?: string;
}) {
  return updateDeploymentStatus({
    deploymentId: payload.deploymentId,
    status: payload.status,
    details: payload.details,
    actor: payload.actor,
  });
}

function statusToAction(status: DeploymentStatus) {
  if (status === 'rolled_back') return 'rollback';
  if (status === 'failed') return 'mark_failed';
  if (status === 'succeeded') return 'mark_succeeded';
  return 'deploy';
}
