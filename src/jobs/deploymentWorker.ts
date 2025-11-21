import { ingestWebhook } from '../api/deployments';

// Example worker entrypoint for webhook events delivered via queue.
// Wire this to your queue processor (e.g., Vercel cron hitting a queue API).

export async function handleDeploymentEvent(evt: {
  deploymentId: string;
  status: 'pending' | 'in_progress' | 'succeeded' | 'failed' | 'rolled_back';
  details?: Record<string, unknown>;
  actor?: string;
}) {
  await ingestWebhook(evt);
}
