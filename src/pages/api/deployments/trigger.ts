import type { NextApiRequest, NextApiResponse } from 'next';
import { triggerDeployment } from '../../../api/deployments';
import { requireString } from '../../../api/validators';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res.status(405).end('Method Not Allowed');
  }

  try {
    const environmentId = requireString(req.body.environmentId, 'environmentId');
    const versionId = requireString(req.body.versionId, 'versionId');
    const { notes, userId } = req.body;
    const data = await triggerDeployment({
      environmentId,
      versionId,
      triggeredBy: userId,
      notes,
    });
    return res.status(200).json(data);
  } catch (err: any) {
    console.error(err);
    return res.status(500).json({ error: err.message ?? 'Trigger failed' });
  }
}
