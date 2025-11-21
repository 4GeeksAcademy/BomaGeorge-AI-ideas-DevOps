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
      .from('deployments')
      .select('id, environment_id, status, version_id, started_at, completed_at')
      .order('started_at', { ascending: false })
      .limit(50);
    if (error) throw error;
    return res.status(200).json(data);
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err.message ?? 'List failed' });
  }
}
