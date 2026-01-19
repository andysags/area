import { useState, useEffect, useCallback } from 'react';
import useAuthClient from './useAuthClient';

export interface Action {
    name: string;
    description: string;
    params?: { name: string; type: string }[];
}

export interface Reaction {
    name: string;
    description: string;
    params?: { name: string; type: string }[];
}

export interface Service {
    name: string;
    actions: Action[];
    reactions: Reaction[];
}

export interface UserService {
    id: string;
    service: {
        id: string;
        name: string;
        display_name: string;
        icon_url: string;
    };
    linked_at: string;
}

export default function useServices() {
    const { user, token } = useAuthClient();
    const [services, setServices] = useState<Service[]>([]);
    const [userServices, setUserServices] = useState<UserService[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

    const fetchServices = useCallback(async () => {
        try {
            const response = await fetch(`${API_BASE}/about.json?t=${Date.now()}`);
            const data = await response.json();
            if (data.server && data.server.services) {
                setServices(data.server.services);
            }
        } catch (err) {
            console.error("Failed to fetch services", err);
            setError("Impossible de charger les services.");
        }
    }, [API_BASE]);

    const fetchUserSubscriptions = useCallback(async () => {
        if (!token) return;
        try {
            const response = await fetch(`${API_BASE}/services/subscriptions/`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setUserServices(data);
            }
        } catch (err) {
            console.error("Failed to fetch subscriptions", err);
        }
    }, [token, API_BASE]);

    useEffect(() => {
        // setLoading(true); // Already true initially
        Promise.all([fetchServices(), fetchUserSubscriptions()]).finally(() => {
            setLoading(false);
        });
    }, [fetchServices, fetchUserSubscriptions]);

    return { services, userServices, loading, error, refresh: fetchUserSubscriptions };
}
