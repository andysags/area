import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import { config } from '../config/env';

interface SettingsProps {
    navigate: (screen: string) => void;
}

export default function Settings({ navigate }: SettingsProps) {
    const [apiUrl, setApiUrl] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadCurrentUrl();
    }, []);

    async function loadCurrentUrl() {
        setLoading(true);
        await config.init();
        setApiUrl(config.apiUrl);
        setLoading(false);
    }

    async function handleSave() {
        if (!apiUrl.trim()) {
            Alert.alert('Erreur', 'L\'URL ne peut pas être vide');
            return;
        }

        setSaving(true);
        try {
            await config.setApiUrl(apiUrl.trim());
            Alert.alert(
                'Succès',
                'URL du serveur mise à jour. Redémarrez l\'application pour appliquer les changements.',
                [{ text: 'OK', onPress: () => navigate('Home') }]
            );
        } catch (error) {
            Alert.alert('Erreur', 'Format d\'URL invalide. Utilisez http:// ou https://');
        } finally {
            setSaving(false);
        }
    }

    async function handleReset() {
        Alert.alert(
            'Réinitialiser',
            'Voulez-vous réinitialiser l\'URL par défaut ?',
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Réinitialiser',
                    onPress: async () => {
                        await config.resetToDefault();
                        setApiUrl(config.getDefaultUrl());
                        Alert.alert('Succès', 'URL réinitialisée par défaut');
                    },
                },
            ]
        );
    }

    async function handleTest() {
        setSaving(true);
        try {
            const response = await fetch(`${apiUrl.trim()}/about.json`);
            if (response.ok) {
                const data = await response.json();
                Alert.alert(
                    'Connexion réussie',
                    `Serveur accessible !\nServices: ${data.server.services?.length || 0}`
                );
            } else {
                Alert.alert('Erreur', `Serveur inaccessible (${response.status})`);
            }
        } catch (error) {
            Alert.alert('Erreur', 'Impossible de se connecter au serveur. Vérifiez l\'URL.');
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color="#3b82f6" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Paramètres</Text>
                <Text style={styles.subtitle}>Configuration du serveur AREA</Text>

                <View style={styles.section}>
                    <Text style={styles.label}>URL du serveur</Text>
                    <TextInput
                        style={styles.input}
                        value={apiUrl}
                        onChangeText={setApiUrl}
                        placeholder="http://localhost:8080"
                        placeholderTextColor="#71717a"
                        autoCapitalize="none"
                        autoCorrect={false}
                        keyboardType="url"
                    />
                    <Text style={styles.hint}>
                        Exemple: http://192.168.1.100:8080 ou https://api.area.com
                    </Text>
                </View>

                <View style={styles.section}>
                    <Text style={styles.infoLabel}>URL par défaut</Text>
                    <Text style={styles.infoValue}>{config.getDefaultUrl()}</Text>
                </View>

                <TouchableOpacity
                    style={[styles.button, styles.primaryButton]}
                    onPress={handleSave}
                    disabled={saving}
                >
                    {saving ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Enregistrer</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, styles.secondaryButton]}
                    onPress={handleTest}
                    disabled={saving}
                >
                    <Text style={[styles.buttonText, styles.secondaryButtonText]}>
                        Tester la connexion
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.button, styles.dangerButton]}
                    onPress={handleReset}
                    disabled={saving}
                >
                    <Text style={[styles.buttonText, styles.dangerButtonText]}>
                        Réinitialiser par défaut
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.backButton}
                    onPress={() => navigate('Home')}
                >
                    <Text style={styles.backButtonText}>← Retour</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f1724',
    },
    content: {
        flex: 1,
        padding: 24,
        paddingTop: 60,
    },
    title: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#94a3b8',
        marginBottom: 32,
    },
    section: {
        marginBottom: 24,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        color: '#e4e4e7',
        marginBottom: 8,
    },
    input: {
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderRadius: 12,
        padding: 16,
        color: '#fff',
        backgroundColor: 'rgba(0, 0, 0, 0.2)',
        fontSize: 16,
    },
    hint: {
        fontSize: 12,
        color: '#71717a',
        marginTop: 8,
    },
    infoLabel: {
        fontSize: 12,
        color: '#94a3b8',
        marginBottom: 4,
    },
    infoValue: {
        fontSize: 14,
        color: '#e4e4e7',
        fontFamily: 'monospace',
    },
    button: {
        paddingVertical: 16,
        borderRadius: 12,
        alignItems: 'center',
        marginBottom: 12,
    },
    primaryButton: {
        backgroundColor: '#2563eb',
    },
    secondaryButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#3b82f6',
    },
    dangerButton: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: '#ef4444',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
    },
    secondaryButtonText: {
        color: '#3b82f6',
    },
    dangerButtonText: {
        color: '#ef4444',
    },
    backButton: {
        marginTop: 24,
        alignItems: 'center',
    },
    backButtonText: {
        color: '#94a3b8',
        fontSize: 16,
    },
});
