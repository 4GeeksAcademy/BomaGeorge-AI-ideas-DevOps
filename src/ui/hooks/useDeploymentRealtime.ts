import { useEffect } from 'react';
import { getSupabaseAnonClient } from '../../lib/supabaseClient';

export function useDeploymentRealtime(opts: {
  onInsert?: (row: Record<string, unknown>) => void;
  onUpdate?: (row: Record<string, unknown>) => void;
}) {
  useEffect(() => {
    const supabase = getSupabaseAnonClient();
    const channel = supabase
      .channel('deployments-feed')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'deployments' },
        payload => opts.onInsert?.(payload.new as Record<string, unknown>),
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'deployments' },
        payload => opts.onUpdate?.(payload.new as Record<string, unknown>),
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [opts]);
}
