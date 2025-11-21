import React from 'react';
import { useAlertRealtime } from '../hooks/useAlertRealtime';

type AlertRow = {
  id: string;
  component_id: string | null;
  severity: string;
  status: string;
  title: string;
  occurred_at: string;
};

function SeverityBadge({ severity }: { severity: string }) {
  const colors: Record<string, string> = {
    critical: 'red',
    high: 'orangered',
    medium: 'orange',
    low: 'gold',
    info: 'gray',
  };
  const color = colors[severity] ?? 'gray';
  return (
    <span style={{ padding: '2px 8px', borderRadius: 6, background: color, color: '#fff' }}>
      {severity}
    </span>
  );
}

export function AlertFeed() {
  const [items, setItems] = React.useState<AlertRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  useAlertRealtime({
    onInsert: row => setItems(prev => [row as AlertRow, ...prev]),
    onUpdate: row =>
      setItems(prev =>
        prev.map(item => (item.id === (row as AlertRow).id ? (row as AlertRow) : item)),
      ),
  });

  React.useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await fetch('/api/alerts/list');
        if (!res.ok) throw new Error('Failed to load alerts');
        const data = (await res.json()) as AlertRow[];
        setItems(data);
      } catch (err: any) {
        setError(err.message ?? 'Failed to load alerts');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function ack(alertId: string) {
    try {
      const res = await fetch('/api/alerts/ack', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId }),
      });
      if (!res.ok) throw new Error('Ack failed');
    } catch (err: any) {
      setError(err.message ?? 'Failed to acknowledge alert');
    }
  }

  async function resolve(alertId: string) {
    try {
      const res = await fetch('/api/alerts/resolve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ alertId }),
      });
      if (!res.ok) throw new Error('Resolve failed');
    } catch (err: any) {
      setError(err.message ?? 'Failed to resolve alert');
    }
  }

  return (
    <section>
      <header>
        <h2>Alerts</h2>
      </header>
      {loading && <p>Loading alerts...</p>}
      {error && <p>{error}</p>}
      <ul>
        {items.map(item => (
          <li key={item.id}>
            <SeverityBadge severity={item.severity} /> {item.title} ({item.status}) at {item.occurred_at}
            {' – '}
            <button onClick={() => ack(item.id)}>Acknowledge</button>
            {' | '}
            <button onClick={() => resolve(item.id)}>Resolve</button>
          </li>
        ))}
      </ul>
    </section>
  );
}
