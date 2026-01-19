import { useEffect, useState, useCallback } from 'react';
import { api } from '../lib/api';

export interface ServiceListItem {
  id: string;
  name: string;
  display_name: string;
  icon_url?: string;
  actions_count: number;
  reactions_count: number;
}

export interface ServiceDetail {
  id: string;
  name: string;
  display_name: string;
  icon_url?: string;
  actions: { id: string; name: string; description: string; service: string }[];
  reactions: { id: string; name: string; description: string; service: string }[];
}

export function useServices() {
  const [services, setServices] = useState<ServiceListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const data = await api.get('/services/');
      setServices(data);
    } catch (e: any) {
      setError(e.message || String(e));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { refresh(); }, [refresh]);

  const getService = useCallback(async (id: string): Promise<ServiceDetail> => {
    return api.get(`/services/${id}/`);
  }, []);

  const listActions = useCallback((id: string) => api.get(`/services/${id}/actions/`), []);
  const listReactions = useCallback((id: string) => api.get(`/services/${id}/reactions/`), []);

  const subscribe = useCallback((id: string, payload: { access_token: string; refresh_token?: string; expires_at?: string; }) => {
    return api.post(`/services/${id}/subscribe`, payload);
  }, []);

  const unsubscribe = useCallback((id: string) => api.del(`/services/${id}/unsubscribe`), []);
  const mySubscriptions = useCallback(() => api.get(`/services/subscriptions/`), []);

  return { services, loading, error, refresh, getService, listActions, listReactions, subscribe, unsubscribe, mySubscriptions };
}
