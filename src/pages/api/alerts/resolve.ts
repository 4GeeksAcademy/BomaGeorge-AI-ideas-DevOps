import type { NextApiRequest, NextApiResponse } from 'next';
import { resolveAlert } from '../../../api/alerts';
import { requireString } from '../../../api/validators';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const alertId = requireString(req.body.alertId, 'alertId');
    const data = await resolveAlert({ alertId });
    return res.status(200).json(data);
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err.message ?? 'Resolve failed' });
  }
}
