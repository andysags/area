import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Dimensions } from 'react-native';
import { Activity, Zap, Plus, CheckCircle2 } from 'lucide-react-native';
import { servicesApi, Service } from '../api/services';
import { areasApi } from '../api/areas';

const { width } = Dimensions.get('window');

interface DashboardProps {
    navigate: (screen: string) => void;
}

export default function Dashboard({ navigate }: DashboardProps) {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        totalAreas: 0,
        activeAreas: 0,
    });

    useEffect(() => {
        fetchData();
    }, []);

    async function fetchData() {
        setLoading(true);

        // Fetch services
        const servicesResponse = await servicesApi.getServices();
        if (servicesResponse.data) {
            setServices(servicesResponse.data);
        }

        // Fetch areas for stats
        const areasResponse = await areasApi.getAreas();
        if (areasResponse.data) {
            const areas = areasResponse.data;
            setStats({
                totalAreas: areas.length,
                activeAreas: areas.filter(a => a.enabled).length,
            });
        }

        setLoading(false);
    }

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.contentContainer}
            showsVerticalScrollIndicator={false}
        >
            {/* Header */}
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Tableau de bord</Text>
                    <Text style={styles.headerSubtitle}>Gérez vos automatisations</Text>
                </View>
                <TouchableOpacity style={styles.createButton} onPress={() => navigate('CreateArea')}>
                    <Plus size={16} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.createButtonText}>Créer</Text>
                </TouchableOpacity>
            </View>

            {/* Stats Grid */}
            <View style={styles.statsGrid}>
                <View style={styles.statCard}>
                    <View style={styles.statHeader}>
                        <Text style={styles.statLabel}>Total</Text>
                        <View style={[styles.iconContainer, { backgroundColor: 'rgba(59, 130, 246, 0.1)' }]}>
                            <Activity size={16} color="#3b82f6" />
                        </View>
                    </View>
                    <Text style={styles.statValue}>{stats.totalAreas}</Text>
                    <Text style={styles.statPeriod}>AREAs</Text>
                </View>

                <View style={styles.statCard}>
                    <View style={styles.statHeader}>
                        <Text style={styles.statLabel}>Actifs</Text>
                        <View style={[styles.iconContainer, { backgroundColor: 'rgba(234, 179, 8, 0.1)' }]}>
                            <Zap size={16} color="#eab308" />
                        </View>
                    </View>
                    <Text style={styles.statValue}>{stats.activeAreas}</Text>
                    <Text style={styles.statPeriod}>en cours</Text>
                </View>

                <View style={styles.statCard}>
                    <View style={styles.statHeader}>
                        <Text style={styles.statLabel}>Services</Text>
                        <View style={[styles.iconContainer, { backgroundColor: 'rgba(16, 185, 129, 0.1)' }]}>
                            <CheckCircle2 size={16} color="#10b981" />
                        </View>
                    </View>
                    <Text style={styles.statValue}>{services.length}</Text>
                    <Text style={styles.statPeriod}>disponibles</Text>
                </View>
            </View>

            {/* Services */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Services Disponibles</Text>

                {loading ? (
                    <ActivityIndicator size="large" color="#3b82f6" style={{ marginTop: 20 }} />
                ) : (
                    <View style={styles.servicesGrid}>
                        {services.map((service) => (
                            <TouchableOpacity
                                key={service.id}
                                style={styles.serviceCard}
                                onPress={() => navigate('CreateArea')}
                            >
                                <View style={styles.serviceIcon}>
                                    <Zap size={24} color="#3b82f6" />
                                </View>
                                <Text style={styles.serviceName}>{service.name}</Text>
                                <Text style={styles.serviceDesc} numberOfLines={2}>
                                    {service.description}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                )}
            </View>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f1724',
    },
    contentContainer: {
        padding: 20,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 24,
    },
    headerTitle: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#a1a1aa',
    },
    createButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2563eb',
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 8,
    },
    createButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    statsGrid: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 32,
    },
    statCard: {
        backgroundColor: 'rgba(24, 24, 27, 0.5)',
        borderRadius: 12,
        padding: 12,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        width: (width - 40 - 20) / 3,
    },
    statHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    statLabel: {
        fontSize: 12,
        color: '#a1a1aa',
        fontWeight: '500',
    },
    iconContainer: {
        padding: 4,
        borderRadius: 6,
    },
    statValue: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    statPeriod: {
        fontSize: 10,
        color: '#71717a',
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 16,
    },
    servicesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
    },
    serviceCard: {
        backgroundColor: 'rgba(24, 24, 27, 0.4)',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255, 255, 255, 0.05)',
        width: (width - 40 - 12) / 2,
    },
    serviceIcon: {
        width: 48,
        height: 48,
        borderRadius: 12,
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    serviceName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#e4e4e7',
        marginBottom: 4,
        textTransform: 'capitalize',
    },
    serviceDesc: {
        fontSize: 12,
        color: '#a1a1aa',
        lineHeight: 16,
    },
});
