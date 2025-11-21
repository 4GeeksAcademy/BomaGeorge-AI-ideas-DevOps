import React, { useEffect, useState } from 'react';
import { useDeploymentRealtime } from '../hooks/useDeploymentRealtime';
import { rollbackDeployment, triggerDeployment } from '../../api/deployments';

type DeploymentRow = {
  id: string;
  environment_id: string;
  status: string;
  version_id: string;
  started_at: string;
  completed_at: string | null;
};

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    succeeded: 'green',
    pending: 'gray',
    in_progress: 'blue',
    failed: 'red',
    rolled_back: 'orange',
  };
  const color = colors[status] ?? 'gray';
  return (
    <span style={{ padding: '2px 8px', borderRadius: 6, background: color, color: '#fff' }}>
      {status}
    </span>
  );
}

export function DeploymentDashboard() {
  const [items, setItems] = useState<DeploymentRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({ environmentId: '', versionId: '', notes: '' });

  useDeploymentRealtime({
    onInsert: row => setItems(prev => [row as DeploymentRow, ...prev]),
    onUpdate: row =>
      setItems(prev =>
        prev.map(item => (item.id === (row as DeploymentRow).id ? (row as DeploymentRow) : item)),
      ),
  });

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await fetch('/api/deployments/list');
        if (!res.ok) throw new Error('Failed to load deployments');
        const data = (await res.json()) as DeploymentRow[];
        setItems(data);
      } catch (err: any) {
        setError(err.message ?? 'Failed to load deployments');
      } finally {
        setLoading(false);
      }
    }
    load();
      }, []);

  async function handleTrigger() {
    if (!form.environmentId || !form.versionId) {
      setError('Environment and version are required');
      return;
    }
    try {
      setBusy(true);
      await triggerDeployment({
        environmentId: form.environmentId,
        versionId: form.versionId,
        notes: form.notes,
      });
      setForm({ environmentId: '', versionId: '', notes: '' });
      setError(null);
    } catch (err: any) {
      setError(err.message ?? 'Failed to trigger deployment');
    } finally {
      setBusy(false);
    }
  }

  async function handleRollback(envId: string) {
    const confirmed = window.confirm('Rollback to last successful version?');
    if (!confirmed) return;
    try {
      setBusy(true);
      await rollbackDeployment({ environmentId: envId });
    } catch (err: any) {
      setError(err.message ?? 'Rollback failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section>
      <header>
        <h2>Deployment History</h2>
      </header>
      <div>
        <h3>Trigger Deployment</h3>
        <input
          placeholder="Environment ID"
          value={form.environmentId}
          onChange={e => setForm(f => ({ ...f, environmentId: e.target.value }))}
        />
        <input
          placeholder="Version ID"
          value={form.versionId}
          onChange={e => setForm(f => ({ ...f, versionId: e.target.value }))}
        />
        <input placeholder="Notes" value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} />
        <button onClick={handleTrigger} disabled={busy}>
          {busy ? 'Working...' : 'Deploy'}
        </button>
      </div>
      {loading && <p>Loading deployments...</p>}
      {error && <p>{error}</p>}
      <table>
        <thead>
          <tr>
            <th>Environment</th>
            <th>Status</th>
            <th>Version</th>
            <th>Started</th>
            <th>Completed</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={item.id}>
              <td>{item.environment_id}</td>
              <td>
                <StatusBadge status={item.status} />
              </td>
              <td>{item.version_id}</td>
              <td>{item.started_at}</td>
              <td>{item.completed_at ?? '—'}</td>
              <td>
                <button onClick={() => handleRollback(item.environment_id)} disabled={busy}>
                  Rollback
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
