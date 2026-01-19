import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const getApiUrl = () => {
    if (Platform.OS === 'android') return 'http://10.0.2.2:8080';
    if (Platform.OS === 'ios') return 'http://localhost:8080';
    return 'http://localhost:8080';
};

export interface Area {
    id: string;
    name: string;
    enabled: boolean;
    action?: {
        name?: string;
        service?: {
            name?: string;
        };
    };
    reaction?: {
        name?: string;
        service?: {
            name?: string;
        };
    };
    created_at?: string;
}

export interface CreateAreaData {
    name: string;
    action: string;
    action_parameters: Record<string, any>;
    reaction: string;
    reaction_parameters: Record<string, any>;
}

export interface ApiResponse<T> {
    data?: T;
    error?: string;
}

export const areasApi = {
    async getAreas(): Promise<ApiResponse<Area[]>> {
        try {
            const API_BASE = getApiUrl();
            const token = await AsyncStorage.getItem('access_token');

            const response = await fetch(`${API_BASE}/areas/`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                return { data };
            }
            return { error: 'Failed to fetch areas' };
        } catch (error) {
            return { error: String(error) };
        }
    },

    async getArea(id: string): Promise<ApiResponse<Area>> {
        try {
            const API_BASE = getApiUrl();
            const token = await AsyncStorage.getItem('access_token');

            const response = await fetch(`${API_BASE}/areas/${id}/`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                return { data };
            }
            return { error: 'Failed to fetch area' };
        } catch (error) {
            return { error: String(error) };
        }
    },

    async createArea(data: CreateAreaData): Promise<ApiResponse<Area>> {
        try {
            const API_BASE = getApiUrl();
            const token = await AsyncStorage.getItem('access_token');

            const response = await fetch(`${API_BASE}/areas/`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                const responseData = await response.json();
                return { data: responseData };
            }
            return { error: 'Failed to create area' };
        } catch (error) {
            return { error: String(error) };
        }
    },

    async updateArea(id: string, data: Partial<Area>): Promise<ApiResponse<Area>> {
        try {
            const API_BASE = getApiUrl();
            const token = await AsyncStorage.getItem('access_token');

            const response = await fetch(`${API_BASE}/areas/${id}/`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (response.ok) {
                const responseData = await response.json();
                return { data: responseData };
            }
            return { error: 'Failed to update area' };
        } catch (error) {
            return { error: String(error) };
        }
    },

    async deleteArea(id: string): Promise<ApiResponse<void>> {
        try {
            const API_BASE = getApiUrl();
            const token = await AsyncStorage.getItem('access_token');

            const response = await fetch(`${API_BASE}/areas/${id}/`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                return { data: undefined };
            }
            return { error: 'Failed to delete area' };
        } catch (error) {
            return { error: String(error) };
        }
    }
};
