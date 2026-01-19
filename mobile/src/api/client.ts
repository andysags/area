import AsyncStorage from '@react-native-async-storage/async-storage';
import { config } from '../config/env';

export interface ApiResponse<T = any> {
    data?: T;
    error?: string;
    status: number;
}

class ApiClient {
    private async getAuthHeaders(): Promise<HeadersInit> {
        const headers: HeadersInit = {
            'Content-Type': 'application/json',
        };

        try {
            const session = await AsyncStorage.getItem('user_session');
            if (session) {
                const userData = JSON.parse(session);
                if (userData.access) {
                    headers['Authorization'] = `Bearer ${userData.access}`;
                }
            }
        } catch (error) {
            console.error('Failed to get auth token:', error);
        }

        return headers;
    }

    async get<T = any>(endpoint: string): Promise<ApiResponse<T>> {
        try {
            // Ensure config is initialized
            await config.init();

            const headers = await this.getAuthHeaders();
            const response = await fetch(`${config.apiUrl}${endpoint}`, {
                method: 'GET',
                headers,
            });

            const data = await response.json().catch(() => null);

            return {
                data,
                status: response.status,
                error: !response.ok ? (data?.detail || data?.error || 'Request failed') : undefined,
            };
        } catch (error) {
            console.error('API GET error:', error);
            return {
                status: 0,
                error: 'Network error',
            };
        }
    }

    async post<T = any>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
        try {
            await config.init();
            const headers = await this.getAuthHeaders();
            const response = await fetch(`${config.apiUrl}${endpoint}`, {
                method: 'POST',
                headers,
                body: body ? JSON.stringify(body) : undefined,
            });

            const data = await response.json().catch(() => null);

            return {
                data,
                status: response.status,
                error: !response.ok ? (data?.detail || data?.error || 'Request failed') : undefined,
            };
        } catch (error) {
            console.error('API POST error:', error);
            return {
                status: 0,
                error: 'Network error',
            };
        }
    }

    async patch<T = any>(endpoint: string, body?: any): Promise<ApiResponse<T>> {
        try {
            await config.init();
            const headers = await this.getAuthHeaders();
            const response = await fetch(`${config.apiUrl}${endpoint}`, {
                method: 'PATCH',
                headers,
                body: body ? JSON.stringify(body) : undefined,
            });

            const data = await response.json().catch(() => null);

            return {
                data,
                status: response.status,
                error: !response.ok ? (data?.detail || data?.error || 'Request failed') : undefined,
            };
        } catch (error) {
            console.error('API PATCH error:', error);
            return {
                status: 0,
                error: 'Network error',
            };
        }
    }

    async delete<T = any>(endpoint: string): Promise<ApiResponse<T>> {
        try {
            await config.init();
            const headers = await this.getAuthHeaders();
            const response = await fetch(`${config.apiUrl}${endpoint}`, {
                method: 'DELETE',
                headers,
            });

            const data = response.status !== 204 ? await response.json().catch(() => null) : null;

            return {
                data,
                status: response.status,
                error: !response.ok ? (data?.detail || data?.error || 'Request failed') : undefined,
            };
        } catch (error) {
            console.error('API DELETE error:', error);
            return {
                status: 0,
                error: 'Network error',
            };
        }
    }
}

export const apiClient = new ApiClient();
