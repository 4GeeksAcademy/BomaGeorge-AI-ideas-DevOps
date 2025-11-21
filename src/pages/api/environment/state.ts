import type { NextApiRequest, NextApiResponse } from 'next';
import { getSupabaseServiceRoleClient } from '../../../lib/supabaseClient';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const supabase = getSupabaseServiceRoleClient();
    const { data, error } = await supabase
      .from('environment_state')
      .select('environment_id, current_version_id, last_deployment_id, updated_at');
    if (error) throw error;
    return res.status(200).json(data);
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err.message ?? 'List failed' });
  }
}
