import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';

interface OAuthCallbackScreenProps {
    navigate: (screen: string) => void;
    route: {
        params?: {
            url?: string;
        };
    };
}

export default function OAuthCallbackScreen({ navigate, route }: OAuthCallbackScreenProps) {
    const { setAuthData } = useAuth();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        handleOAuthCallback();
    }, []);

    const handleOAuthCallback = async () => {
        try {
            // Get URL from route params or from deep link
            const url = route.params?.url || '';

            if (!url) {
                setError('URL de callback manquante');
                setTimeout(() => navigate('Login'), 2000);
                return;
            }

            // Manual URL parsing for React Native
            const getQueryParam = (url: string, param: string): string | null => {
                const regex = new RegExp(`[?&]${param}=([^&]*)`);
                const match = url.match(regex);
                return match ? decodeURIComponent(match[1]) : null;
            };

            const code = getQueryParam(url, 'code');
            const state = getQueryParam(url, 'state');
            const error = getQueryParam(url, 'error');
            const token = getQueryParam(url, 'token');
            const user = getQueryParam(url, 'user');
            const success = getQueryParam(url, 'success');

            if (error) {
                setError(`Erreur OAuth: ${error}`);
                setTimeout(() => navigate('Login'), 2000);
                return;
            }

            // If we have a token directly (simplified flow)
            if (token && user) {
                const userData = JSON.parse(user);
                await setAuthData(token, userData);
                navigate('Home');
                return;
            }

            if (success) {
                setTimeout(() => navigate('Services'), 1500);
                return;
            }

            // If we have a code, we need to exchange it
            if (code) {
                // Determine provider from URL
                const provider = url.includes('github') ? 'github'
                    : url.includes('google') ? 'google'
                        : url.includes('spotify') ? 'spotify'
                            : null;

                if (!provider) {
                    setError('Provider OAuth inconnu');
                    setTimeout(() => navigate('Login'), 2000);
                    return;
                }

                // Exchange code for token (backend handles this)
                // For now, redirect to login
                setError('OAuth en cours de configuration');
                setTimeout(() => navigate('Login'), 2000);
                return;
            }

            setError('Paramètres OAuth invalides');
            setTimeout(() => navigate('Login'), 2000);
        } catch (err) {
            console.error('OAuth callback error:', err);
            setError('Erreur lors du traitement OAuth');
            setTimeout(() => navigate('Login'), 2000);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                {error ? (
                    <>
                        <Text style={styles.errorIcon}>⚠️</Text>
                        <Text style={styles.errorTitle}>Erreur</Text>
                        <Text style={styles.errorText}>{error}</Text>
                        <Text style={styles.redirectText}>Redirection...</Text>
                    </>
                ) : (
                    <>
                        <ActivityIndicator size="large" color="#3b82f6" />
                        <Text style={styles.loadingText}>Connexion en cours...</Text>
                        <Text style={styles.subtitle}>Veuillez patienter</Text>
                    </>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f1724',
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    card: {
        backgroundColor: 'rgba(24, 24, 27, 0.4)',
        borderRadius: 16,
        padding: 40,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        alignItems: 'center',
        minWidth: 300,
    },
    loadingText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
        marginTop: 20,
    },
    subtitle: {
        color: '#94a3b8',
        fontSize: 14,
        marginTop: 8,
    },
    errorIcon: {
        fontSize: 48,
        marginBottom: 16,
    },
    errorTitle: {
        color: '#ef4444',
        fontSize: 20,
        fontWeight: '700',
        marginBottom: 12,
    },
    errorText: {
        color: '#f87171',
        fontSize: 14,
        textAlign: 'center',
        marginBottom: 8,
    },
    redirectText: {
        color: '#94a3b8',
        fontSize: 12,
        marginTop: 16,
    },
});
