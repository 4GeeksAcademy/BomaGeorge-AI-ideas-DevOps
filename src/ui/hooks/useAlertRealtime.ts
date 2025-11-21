import { useEffect } from 'react';
import { getSupabaseAnonClient } from '../../lib/supabaseClient';

export function useAlertRealtime(opts: {
  onInsert?: (row: Record<string, unknown>) => void;
  onUpdate?: (row: Record<string, unknown>) => void;
}) {
  useEffect(() => {
    const supabase = getSupabaseAnonClient();
    const channel = supabase
      .channel('alerts-feed')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'alerts' },
        payload => opts.onInsert?.(payload.new as Record<string, unknown>),
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'alerts' },
        payload => opts.onUpdate?.(payload.new as Record<string, unknown>),
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [opts]);
}
