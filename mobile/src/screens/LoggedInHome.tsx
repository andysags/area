import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { ArrowRight, Plus, Zap, Power, Trash2 } from 'lucide-react-native';
import { areasApi, Area } from '../api/areas';

interface LoggedInHomeProps {
    navigate: (screen: string) => void;
    user?: any;
}

export default function LoggedInHome({ navigate, user }: LoggedInHomeProps) {
    const userName = user?.pseudo || user?.email?.split('@')[0] || 'User';
    const [areas, setAreas] = useState<Area[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchAreas();
    }, []);

    async function fetchAreas() {
        setLoading(true);
        const response = await areasApi.getAreas();
        if (response.data) {
            setAreas(response.data);
        }
        setLoading(false);
    }

    async function handleToggle(id: string, currentStatus: boolean) {
        const response = await areasApi.updateArea(id, { enabled: !currentStatus });
        if (response.data) {
            fetchAreas(); // Refresh list
        }
    }

    async function handleDelete(id: string) {
        Alert.alert(
            'Supprimer AREA',
            'Voulez-vous vraiment supprimer cette automatisation ?',
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Supprimer',
                    style: 'destructive',
                    onPress: async () => {
                        const response = await areasApi.deleteArea(id);
                        if (response.status === 204 || response.status === 200) {
                            fetchAreas(); // Refresh list
                        }
                    },
                },
            ]
        );
    }

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.content}
            showsVerticalScrollIndicator={false}
        >
            {/* Welcome Hero */}
            <View style={styles.hero}>
                <Text style={styles.greeting}>Ravi de vous revoir, {userName} ! 👋</Text>
                <Text style={styles.subtitle}>
                    Vos automatisations tournent à plein régime. Que voulez-vous créer aujourd'hui ?
                </Text>

                <TouchableOpacity
                    style={styles.createButton}
                    onPress={() => navigate('CreateArea')}
                >
                    <Plus size={20} color="#fff" style={{ marginRight: 8 }} />
                    <Text style={styles.createButtonText}>Créer une Area</Text>
                </TouchableOpacity>
            </View>

            {/* My AREAs Section */}
            <View style={styles.section}>
                <Text style={styles.sectionTitle}>Mes AREAs</Text>

                {loading ? (
                    <ActivityIndicator size="large" color="#3b82f6" style={{ marginTop: 20 }} />
                ) : areas.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Zap size={48} color="#52525b" />
                        <Text style={styles.emptyText}>Aucune AREA créée</Text>
                        <Text style={styles.emptySubtext}>Commencez par créer votre première automatisation</Text>
                    </View>
                ) : (
                    areas.map((area) => (
                        <View key={area.id} style={styles.areaCard}>
                            <View style={styles.areaHeader}>
                                <View style={[
                                    styles.statusIndicator,
                                    { backgroundColor: area.enabled ? '#22c55e' : '#ef4444' }
                                ]} />
                                <View style={styles.areaInfo}>
                                    <View style={styles.areaFlow}>
                                        <Text style={styles.serviceName}>{area.action.service.name}</Text>
                                        <ArrowRight size={16} color="#52525b" style={{ marginHorizontal: 8 }} />
                                        <Text style={styles.serviceName}>{area.reaction.service.name}</Text>
                                    </View>
                                    <Text style={styles.areaDetails}>
                                        {area.action.name} → {area.reaction.name}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.areaActions}>
                                <TouchableOpacity
                                    style={[styles.actionButton, area.enabled && styles.activeButton]}
                                    onPress={() => handleToggle(area.id, area.enabled)}
                                >
                                    <Power size={18} color={area.enabled ? '#22c55e' : '#94a3b8'} />
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.actionButton}
                                    onPress={() => handleDelete(area.id)}
                                >
                                    <Trash2 size={18} color="#ef4444" />
                                </TouchableOpacity>
                            </View>
                        </View>
                    ))
                )}
            </View>

            {/* Dashboard Link */}
            <TouchableOpacity
                style={styles.dashboardLink}
                onPress={() => navigate('Dashboard')}
            >
                <View>
                    <Text style={styles.dashboardLinkTitle}>Accéder au Tableau de bord</Text>
                    <Text style={styles.dashboardLinkDesc}>Gérez vos Areas et consultez les logs.</Text>
                </View>
                <ArrowRight size={20} color="#fff" />
            </TouchableOpacity>

            <View style={{ height: 40 }} />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f1724',
    },
    content: {
        padding: 24,
        paddingTop: 40,
        paddingBottom: 100,
    },
    hero: {
        marginBottom: 32,
    },
    greeting: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 8,
    },
    subtitle: {
        fontSize: 16,
        color: '#94a3b8',
        marginBottom: 24,
        lineHeight: 24,
    },
    createButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#2563eb',
        paddingVertical: 16,
        borderRadius: 16,
        shadowColor: '#2563eb',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },
    createButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    section: {
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 16,
    },
    emptyState: {
        alignItems: 'center',
        padding: 40,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#94a3b8',
        marginTop: 16,
    },
    emptySubtext: {
        fontSize: 14,
        color: '#52525b',
        marginTop: 8,
    },
    areaCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        marginBottom: 12,
    },
    areaHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    statusIndicator: {
        width: 12,
        height: 12,
        borderRadius: 6,
        marginRight: 12,
    },
    areaInfo: {
        flex: 1,
    },
    areaFlow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    serviceName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        textTransform: 'capitalize',
    },
    areaDetails: {
        fontSize: 12,
        color: '#94a3b8',
    },
    areaActions: {
        flexDirection: 'row',
        gap: 8,
    },
    actionButton: {
        padding: 8,
        borderRadius: 8,
        backgroundColor: 'rgba(255,255,255,0.05)',
    },
    activeButton: {
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
    },
    dashboardLink: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        padding: 20,
        borderRadius: 20,
        borderWidth: 1,
        borderColor: 'rgba(59, 130, 246, 0.2)',
    },
    dashboardLinkTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    dashboardLinkDesc: {
        fontSize: 14,
        color: '#94a3b8',
    },
});
