import { useCallback, useEffect, useState } from 'react';
import { api } from '../lib/api';

export interface AreaItem {
  id: string;
  action: string; // uuid
  reaction: string; // uuid
  config_action: any;
  config_reaction: any;
  enabled: boolean;
  created_at: string;
}

export interface ExecutionLogItem {
  id: string;
  area_id: string;
  executed_at: string;
  status: string;
  message: string;
}

export function useAreas() {
  const [areas, setAreas] = useState<AreaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const data = await api.get('/areas/');
      setAreas(data);
    } catch (e: any) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const createArea = useCallback(async (payload: Omit<AreaItem,'id'|'created_at'>) => {
    const res = await api.post('/areas/', payload);
    await refresh();
    return res;
  }, [refresh]);

  const deleteArea = useCallback(async (id: string) => {
    await api.del(`/areas/${id}/`);
    await refresh();
  }, [refresh]);

  const logs = useCallback(async (areaId?: string): Promise<ExecutionLogItem[]> => {
    const q = areaId ? `?area=${areaId}` : '';
    return api.get(`/areas/logs/${q}`);
  }, []);

  return { areas, loading, error, refresh, createArea, deleteArea, logs };
}
