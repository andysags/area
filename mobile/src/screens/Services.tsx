import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, Platform, TouchableOpacity, Image } from 'react-native';
import { ArrowLeft, Check, Globe } from 'lucide-react-native';

const getApiUrl = () => {
    if (Platform.OS === 'android') return 'http://10.0.2.2:8080';
    if (Platform.OS === 'ios') return 'http://localhost:8080';
    return 'http://localhost:8080';
};

interface Service {
    id: string;
    name: string;
    display_name: string;
    icon_url?: string;
    actions_count: number;
    reactions_count: number;
    category?: string;
    description?: string;
}

export default function Services({ navigate }: { navigate: (s: string) => void }) {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            const API_BASE = getApiUrl();
            const res = await fetch(`${API_BASE}/services/`);
            if (res.ok) {
                const data = await res.json();
                setServices(data);
            }
        } catch (error) {
            console.error('Failed to fetch services', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigate('Home')} style={styles.backButton}>
                    <ArrowLeft color="#fff" size={24} />
                </TouchableOpacity>
                <Text style={styles.title}>Services Disponibles</Text>
            </View>

            {loading ? (
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#3b82f6" />
                </View>
            ) : (
                <ScrollView contentContainerStyle={styles.scrollContent}>
                    <Text style={styles.subtitle}>
                        Découvrez les {services.length} services connectés à Nexus.
                    </Text>

                    <View style={styles.grid}>
                        {services.map((service) => (
                            <View key={service.id} style={styles.card}>
                                <View style={styles.iconContainer}>
                                    {service.icon_url ? (
                                        <Image source={{ uri: service.icon_url }} style={styles.icon} />
                                    ) : (
                                        <Globe color="#94a3b8" size={32} />
                                    )}
                                </View>
                                <Text style={styles.cardTitle}>{service.display_name}</Text>
                                <View style={styles.statsContainer}>
                                    <Text style={styles.stat}>{service.actions_count} Actions</Text>
                                    <Text style={styles.statDot}>•</Text>
                                    <Text style={styles.stat}>{service.reactions_count} Réactions</Text>
                                </View>
                            </View>
                        ))}
                    </View>
                    
                    {services.length === 0 && (
                        <Text style={styles.emptyText}>Aucun service disponible pour le moment.</Text>
                    )}
                </ScrollView>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f1724',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    backButton: {
        marginRight: 16,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    scrollContent: {
        padding: 20,
    },
    subtitle: {
        color: '#94a3b8',
        marginBottom: 24,
        fontSize: 16,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 16,
        justifyContent: 'space-between',
    },
    card: {
        width: '47%',
        backgroundColor: 'rgba(30, 41, 59, 0.5)',
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
        marginBottom: 16,
    },
    iconContainer: {
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: 'rgba(255,255,255,0.05)',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    icon: {
        width: 32,
        height: 32,
        resizeMode: 'contain',
    },
    cardTitle: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 16,
        marginBottom: 8,
        textAlign: 'center',
    },
    statsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    stat: {
        color: '#64748b',
        fontSize: 12,
    },
    statDot: {
        color: '#64748b',
        fontSize: 12,
    },
    emptyText: {
        color: '#64748b',
        textAlign: 'center',
        marginTop: 40,
    },
});
