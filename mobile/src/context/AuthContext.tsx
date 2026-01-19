import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

const getApiUrl = () => {
    if (Platform.OS === 'android') return 'http://10.0.2.2:8080';
    if (Platform.OS === 'ios') return 'http://localhost:8080';
    return 'http://localhost:8080';
};

interface User {
    id: string;
    email: string;
    name?: string;
}

interface RegisterData {
    email: string;
    password: string;
    name?: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    refreshToken: () => Promise<void>;
    setAuthData: (token: string, user: User) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    // Load session on mount
    useEffect(() => {
        loadSession();
    }, []);

    // Auto-refresh token every 50 minutes (tokens expire in 60 min)
    useEffect(() => {
        if (token) {
            const interval = setInterval(() => {
                refreshToken().catch(err => {
                    console.error('Auto-refresh failed:', err);
                    logout();
                });
            }, 50 * 60 * 1000); // 50 minutes

            return () => clearInterval(interval);
        }
    }, [token]);

    const loadSession = async () => {
        try {
            const storedToken = await AsyncStorage.getItem('access_token');
            const storedUser = await AsyncStorage.getItem('user_data');

            if (storedToken && storedUser) {
                setToken(storedToken);
                setUser(JSON.parse(storedUser));
            }
        } catch (error) {
            console.error('Failed to load session:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const setAuthData = async (newToken: string, newUser: User) => {
        try {
            await AsyncStorage.setItem('access_token', newToken);
            await AsyncStorage.setItem('user_data', JSON.stringify(newUser));
            setToken(newToken);
            setUser(newUser);
        } catch (error) {
            console.error('Failed to save auth data:', error);
            throw error;
        }
    };

    const login = async (email: string, password: string) => {
        try {
            const API_BASE = getApiUrl();
            const response = await fetch(`${API_BASE}/auth/login/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Login failed');
            }

            const data = await response.json();
            await setAuthData(data.access, data.user);
        } catch (error) {
            console.error('Login error:', error);
            throw error;
        }
    };

    const register = async (data: RegisterData) => {
        try {
            const API_BASE = getApiUrl();
            const response = await fetch(`${API_BASE}/auth/register/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.detail || 'Registration failed');
            }

            const responseData = await response.json();
            await setAuthData(responseData.access, responseData.user);
        } catch (error) {
            console.error('Register error:', error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await AsyncStorage.removeItem('access_token');
            await AsyncStorage.removeItem('user_data');
            await AsyncStorage.removeItem('user_session'); // Legacy key
            setToken(null);
            setUser(null);
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

    const refreshToken = async () => {
        try {
            const refreshToken = await AsyncStorage.getItem('refresh_token');
            if (!refreshToken) {
                throw new Error('No refresh token');
            }

            const API_BASE = getApiUrl();
            const response = await fetch(`${API_BASE}/auth/refresh/`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ refresh: refreshToken }),
            });

            if (!response.ok) {
                throw new Error('Refresh failed');
            }

            const data = await response.json();
            await AsyncStorage.setItem('access_token', data.access);
            setToken(data.access);
        } catch (error) {
            console.error('Refresh token error:', error);
            throw error;
        }
    };

    const value: AuthContextType = {
        user,
        token,
        isAuthenticated: !!token && !!user,
        isLoading,
        login,
        logout,
        register,
        refreshToken,
        setAuthData,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
