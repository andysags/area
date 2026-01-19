import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'api_base_url';

// Default API URL based on platform
function getDefaultApiUrl(): string {
    if (__DEV__) {
        // Development mode
        if (Platform.OS === 'android') {
            return 'http://10.0.2.2:8080'; // Android emulator
        } else if (Platform.OS === 'ios') {
            return 'http://localhost:8080'; // iOS simulator
        }
        return 'http://localhost:8080'; // Web
    }

    // Production mode - use environment variable or default
    return process.env.REACT_APP_API_URL || 'https://api.area.example.com';
}

class Config {
    private apiBaseUrl: string = getDefaultApiUrl();
    private initialized: boolean = false;

    async init(): Promise<void> {
        if (this.initialized) return;

        try {
            const savedUrl = await AsyncStorage.getItem(STORAGE_KEY);
            if (savedUrl) {
                this.apiBaseUrl = savedUrl;
            }
        } catch (error) {
            console.error('Failed to load API URL from storage:', error);
        }

        this.initialized = true;
    }

    get apiUrl(): string {
        return this.apiBaseUrl;
    }

    async setApiUrl(url: string): Promise<void> {
        // Validate URL format
        try {
            new URL(url);
            this.apiBaseUrl = url;
            await AsyncStorage.setItem(STORAGE_KEY, url);
        } catch (error) {
            throw new Error('Invalid URL format');
        }
    }

    async resetToDefault(): Promise<void> {
        this.apiBaseUrl = getDefaultApiUrl();
        await AsyncStorage.removeItem(STORAGE_KEY);
    }

    getDefaultUrl(): string {
        return getDefaultApiUrl();
    }
}

export const config = new Config();

// Initialize config on module load
config.init();
