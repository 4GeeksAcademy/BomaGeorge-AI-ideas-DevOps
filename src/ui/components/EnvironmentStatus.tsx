import React from 'react';
import { fetchEnvironmentState } from '../../api/publicData';
import { rollbackDeployment } from '../../api/deployments';

type EnvState = {
  environment_id: string;
  current_version_id: string | null;
  last_deployment_id: string | null;
  updated_at: string;
};

function VersionBadge({ label }: { label: string }) {
  return (
    <span style={{ padding: '2px 8px', borderRadius: 6, background: '#444', color: '#fff' }}>
      {label}
    </span>
  );
}

export function EnvironmentStatus() {
  const [items, setItems] = React.useState<EnvState[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [busyEnv, setBusyEnv] = React.useState<string | null>(null);

  React.useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const data = await fetchEnvironmentState();
        setItems(data as EnvState[]);
      } catch (err: any) {
        setError(err.message ?? 'Failed to load environment status');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleRollback(envId: string) {
    const confirmed = window.confirm('Rollback to last successful version for this environment?');
    if (!confirmed) return;
    try {
      setBusyEnv(envId);
      await rollbackDeployment({ environmentId: envId });
    } catch (err: any) {
      setError(err.message ?? 'Rollback failed');
    } finally {
      setBusyEnv(null);
    }
  }

  return (
    <section>
      <header>
        <h2>Environment Status</h2>
      </header>
      {loading && <p>Loading environments...</p>}
      {error && <p>{error}</p>}
      <table>
        <thead>
          <tr>
            <th>Environment</th>
            <th>Current Version</th>
            <th>Last Deployment</th>
            <th>Updated</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map(item => (
            <tr key={item.environment_id}>
              <td>{item.environment_id}</td>
              <td>{item.current_version_id ? <VersionBadge label={item.current_version_id} /> : 'n/a'}</td>
              <td>{item.last_deployment_id ? <VersionBadge label={item.last_deployment_id} /> : 'n/a'}</td>
              <td>{item.updated_at}</td>
              <td>
                <button onClick={() => handleRollback(item.environment_id)} disabled={busyEnv === item.environment_id}>
                  {busyEnv === item.environment_id ? 'Rolling back...' : 'Rollback'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
