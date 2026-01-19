import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking, Platform } from 'react-native';

const getApiUrl = () => {
    if (Platform.OS === 'android') return 'http://10.0.2.2:8080';
    if (Platform.OS === 'ios') return 'http://localhost:8080';
    return 'http://localhost:8080';
};

interface OAuthButtonsProps {
    onError?: (error: string) => void;
}

export default function OAuthButtons({ onError }: OAuthButtonsProps) {
    const API_BASE = getApiUrl();

    const handleOAuth = async (provider: 'github' | 'google' | 'spotify') => {
        try {
            // OAuth URL with mobile redirect
            const redirectUri = `area://oauth/${provider}/callback`;
            const oauthUrl = `${API_BASE}/auth/${provider}/?redirect_uri=${encodeURIComponent(redirectUri)}&mobile=true`;

            console.log(`Opening OAuth URL for ${provider}:`, oauthUrl);

            const supported = await Linking.canOpenURL(oauthUrl);
            if (supported) {
                await Linking.openURL(oauthUrl);
            } else {
                onError?.(`Impossible d'ouvrir l'URL OAuth pour ${provider}`);
            }
        } catch (error) {
            console.error(`OAuth ${provider} error:`, error);
            onError?.(`Erreur lors de l'ouverture de ${provider}`);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.divider}>
                <View style={styles.line} />
                <Text style={styles.dividerText}>Ou continuer avec</Text>
                <View style={styles.line} />
            </View>

            <View style={styles.buttonsContainer}>
                <TouchableOpacity
                    style={styles.oauthButton}
                    onPress={() => handleOAuth('github')}
                >
                    <Text style={styles.buttonText}>GitHub</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.oauthButton}
                    onPress={() => handleOAuth('google')}
                >
                    <Text style={styles.buttonText}>Google</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.oauthButton}
                    onPress={() => handleOAuth('spotify')}
                >
                    <Text style={styles.buttonText}>Spotify</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        marginTop: 24,
    },
    divider: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 20,
    },
    line: {
        flex: 1,
        height: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
    },
    dividerText: {
        color: '#94a3b8',
        fontSize: 12,
        paddingHorizontal: 12,
    },
    buttonsContainer: {
        flexDirection: 'row',
        gap: 12,
    },
    oauthButton: {
        flex: 1,
        backgroundColor: 'rgba(255, 255, 255, 0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 8,
        paddingVertical: 12,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
    },
});
