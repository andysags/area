import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Switch,
    Alert,
    Platform
} from 'react-native';
import { ArrowLeft, Trash2, Zap, Clock, CheckCircle2, XCircle } from 'lucide-react-native';
import { areasApi, Area } from '../api/areas';

const getApiUrl = () => {
    if (Platform.OS === 'android') return 'http://10.0.2.2:8080';
    if (Platform.OS === 'ios') return 'http://localhost:8080';
    return 'http://localhost:8080';
};

interface AreasScreenProps {
    navigate: (screen: string, params?: any) => void;
}

export default function AreasScreen({ navigate }: AreasScreenProps) {
    const [areas, setAreas] = useState<Area[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchAreas();
    }, []);

    const fetchAreas = async () => {
        try {
            const response = await areasApi.getAreas();
            if (response.data) {
                setAreas(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch areas', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleToggle = async (area: Area) => {
        try {
            const API_BASE = getApiUrl();
            const token = ''; // TODO: Get from auth context

            const response = await fetch(`${API_BASE}/areas/${area.id}/`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    enabled: !area.enabled
                })
            });

            if (response.ok) {
                // Update local state
                setAreas(areas.map(a =>
                    a.id === area.id ? { ...a, enabled: !a.enabled } : a
                ));
            }
        } catch (error) {
            console.error('Failed to toggle area', error);
            Alert.alert('Erreur', 'Impossible de modifier le statut');
        }
    };

    const handleDelete = async (area: Area) => {
        Alert.alert(
            'Supprimer',
            `Êtes-vous sûr de vouloir supprimer "${area.name}" ?`,
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Supprimer',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const response = await areasApi.deleteArea(area.id);
                            if (response.data !== undefined) {
                                setAreas(areas.filter(a => a.id !== area.id));
                            } else {
                                Alert.alert('Erreur', response.error || 'Impossible de supprimer');
                            }
                        } catch (error) {
                            console.error('Failed to delete area', error);
                            Alert.alert('Erreur', 'Impossible de supprimer');
                        }
                    }
                }
            ]
        );
    };

    const handleRefresh = () => {
        setRefreshing(true);
        fetchAreas();
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigate('Dashboard')} style={styles.backButton}>
                        <ArrowLeft color="#fff" size={24} />
                    </TouchableOpacity>
                    <Text style={styles.title}>Mes Areas</Text>
                </View>
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#3b82f6" />
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigate('Dashboard')} style={styles.backButton}>
                    <ArrowLeft color="#fff" size={24} />
                </TouchableOpacity>
                <Text style={styles.title}>Mes Areas</Text>
            </View>

            {/* Stats */}
            <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                    <Text style={styles.statValue}>{areas.length}</Text>
                    <Text style={styles.statLabel}>Total</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statValue}>{areas.filter(a => a.enabled).length}</Text>
                    <Text style={styles.statLabel}>Actifs</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statValue}>{areas.filter(a => !a.enabled).length}</Text>
                    <Text style={styles.statLabel}>Inactifs</Text>
                </View>
            </View>

            {/* Areas List */}
            <ScrollView
                contentContainerStyle={styles.scrollContent}
            >
                {areas.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Zap size={48} color="#64748b" />
                        <Text style={styles.emptyTitle}>Aucune Area</Text>
                        <Text style={styles.emptyText}>
                            Créez votre première automatisation pour commencer
                        </Text>
                        <TouchableOpacity
                            style={styles.createButton}
                            onPress={() => navigate('CreateArea')}
                        >
                            <Text style={styles.createButtonText}>Créer une Area</Text>
                        </TouchableOpacity>
                    </View>
                ) : (
                    areas.map((area) => (
                        <TouchableOpacity
                            key={area.id}
                            style={styles.areaCard}
                            onPress={() => navigate('AreaDetails', { id: area.id })}
                            activeOpacity={0.7}
                        >
                            <View style={styles.areaHeader}>
                                <View style={styles.areaInfo}>
                                    <Text style={styles.areaName}>{area.name}</Text>
                                    <View style={styles.areaDetails}>
                                        <View style={styles.serviceTag}>
                                            <Text style={styles.serviceTagText}>
                                                {area.action?.service?.name || 'Unknown'}
                                            </Text>
                                        </View>
                                        <Text style={styles.arrow}>→</Text>
                                        <View style={styles.serviceTag}>
                                            <Text style={styles.serviceTagText}>
                                                {area.reaction?.service?.name || 'Unknown'}
                                            </Text>
                                        </View>
                                    </View>
                                </View>

                                <View style={styles.areaActions}>
                                    <Switch
                                        value={area.enabled}
                                        onValueChange={() => handleToggle(area)}
                                        trackColor={{ false: '#374151', true: '#3b82f6' }}
                                        thumbColor={area.enabled ? '#fff' : '#9ca3af'}
                                    />
                                </View>
                            </View>

                            <View style={styles.areaFooter}>
                                <View style={styles.statusBadge}>
                                    {area.enabled ? (
                                        <>
                                            <CheckCircle2 size={12} color="#22c55e" />
                                            <Text style={[styles.statusText, { color: '#22c55e' }]}>
                                                Actif
                                            </Text>
                                        </>
                                    ) : (
                                        <>
                                            <XCircle size={12} color="#64748b" />
                                            <Text style={[styles.statusText, { color: '#64748b' }]}>
                                                Inactif
                                            </Text>
                                        </>
                                    )}
                                </View>

                                <TouchableOpacity
                                    onPress={() => handleDelete(area)}
                                    style={styles.deleteButton}
                                >
                                    <Trash2 size={16} color="#ef4444" />
                                </TouchableOpacity>
                            </View>
                        </TouchableOpacity>
                    ))
                )}
            </ScrollView>
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
        paddingTop: 60,
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.1)',
    },
    backButton: {
        marginRight: 16,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    statsContainer: {
        flexDirection: 'row',
        padding: 20,
        gap: 12,
    },
    statCard: {
        flex: 1,
        backgroundColor: 'rgba(30, 41, 59, 0.5)',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    statValue: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 12,
        color: '#94a3b8',
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 100,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
        marginTop: 16,
        marginBottom: 8,
    },
    emptyText: {
        fontSize: 14,
        color: '#94a3b8',
        textAlign: 'center',
        marginBottom: 24,
    },
    createButton: {
        backgroundColor: '#3b82f6',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 8,
    },
    createButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    areaCard: {
        backgroundColor: 'rgba(30, 41, 59, 0.5)',
        borderRadius: 16,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    areaHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    areaInfo: {
        flex: 1,
        marginRight: 12,
    },
    areaName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 8,
    },
    areaDetails: {
        flexDirection: 'row',
        alignItems: 'center',
        flexWrap: 'wrap',
    },
    serviceTag: {
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
        borderWidth: 1,
        borderColor: 'rgba(59, 130, 246, 0.2)',
    },
    serviceTagText: {
        fontSize: 12,
        color: '#60a5fa',
        fontWeight: '500',
        textTransform: 'capitalize',
    },
    arrow: {
        color: '#64748b',
        marginHorizontal: 8,
        fontSize: 14,
    },
    areaActions: {
        alignItems: 'flex-end',
    },
    areaFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingTop: 12,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
    },
    statusText: {
        fontSize: 12,
        fontWeight: '500',
    },
    deleteButton: {
        padding: 8,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderRadius: 8,
    },
});
