import { apiClient } from './client';

export interface Service {
    id: string;
    name: string;
    description: string;
    icon_url?: string;
    requires_oauth: boolean;
}

export interface UserSubscription {
    id: string;
    service: Service;
    linked_at: string;
}

export interface AboutResponse {
    client: {
        host: string;
    };
    server: {
        current_time: number;
        services: Array<{
            name: string;
            actions: Array<{
                name: string;
                description: string;
                params?: Array<{
                    name: string;
                    type: string;
                }>;
            }>;
            reactions: Array<{
                name: string;
                description: string;
                params?: Array<{
                    name: string;
                    type: string;
                }>;
            }>;
        }>;
    };
}

export const servicesApi = {
    async getServices() {
        return apiClient.get<Service[]>('/services/');
    },

    async getUserSubscriptions() {
        return apiClient.get<UserSubscription[]>('/services/subscriptions/');
    },

    async getAbout() {
        return apiClient.get<AboutResponse>('/about.json');
    },
};
