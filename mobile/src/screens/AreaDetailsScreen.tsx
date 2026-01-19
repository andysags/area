import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    Platform
} from 'react-native';
import { ArrowLeft, Trash2, Play, Pause, Clock, CheckCircle2, XCircle, AlertCircle } from 'lucide-react-native';
import { areasApi, Area } from '../api/areas';

const getApiUrl = () => {
    if (Platform.OS === 'android') return 'http://10.0.2.2:8080';
    if (Platform.OS === 'ios') return 'http://localhost:8080';
    return 'http://localhost:8080';
};

interface AreaDetailsScreenProps {
    navigate: (screen: string, params?: any) => void;
    route: {
        params: {
            id: string;
        };
    };
}

interface ExecutionLog {
    id: string;
    status: 'success' | 'error';
    message: string;
    created_at: string;
}

export default function AreaDetailsScreen({ navigate, route }: AreaDetailsScreenProps) {
    const { id } = route.params;
    const [area, setArea] = useState<Area | null>(null);
    const [logs, setLogs] = useState<ExecutionLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [logsLoading, setLogsLoading] = useState(true);

    useEffect(() => {
        fetchAreaDetails();
        fetchLogs();
    }, [id]);

    const fetchAreaDetails = async () => {
        try {
            const response = await areasApi.getArea(id);
            if (response.data) {
                setArea(response.data);
            }
        } catch (error) {
            console.error('Failed to fetch area details', error);
            Alert.alert('Erreur', 'Impossible de charger les détails');
        } finally {
            setLoading(false);
        }
    };

    const fetchLogs = async () => {
        try {
            const API_BASE = getApiUrl();
            const token = ''; // TODO: Get from auth context

            const response = await fetch(`${API_BASE}/areas/${id}/logs/`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setLogs(data.slice(0, 10)); // Last 10 logs
            }
        } catch (error) {
            console.error('Failed to fetch logs', error);
        } finally {
            setLogsLoading(false);
        }
    };

    const handleDelete = async () => {
        Alert.alert(
            'Supprimer',
            `Êtes-vous sûr de vouloir supprimer "${area?.name}" ?`,
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Supprimer',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const response = await areasApi.deleteArea(id);
                            if (response.data !== undefined) {
                                navigate('Areas');
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

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigate('Areas')} style={styles.backButton}>
                        <ArrowLeft color="#fff" size={24} />
                    </TouchableOpacity>
                    <Text style={styles.title}>Détails</Text>
                </View>
                <View style={styles.center}>
                    <ActivityIndicator size="large" color="#3b82f6" />
                </View>
            </View>
        );
    }

    if (!area) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigate('Areas')} style={styles.backButton}>
                        <ArrowLeft color="#fff" size={24} />
                    </TouchableOpacity>
                    <Text style={styles.title}>Détails</Text>
                </View>
                <View style={styles.center}>
                    <Text style={styles.errorText}>Area introuvable</Text>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity onPress={() => navigate('Areas')} style={styles.backButton}>
                    <ArrowLeft color="#fff" size={24} />
                </TouchableOpacity>
                <Text style={styles.title}>Détails</Text>
                <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
                    <Trash2 size={20} color="#ef4444" />
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent}>
                {/* Area Info */}
                <View style={styles.section}>
                    <Text style={styles.areaName}>{area.name}</Text>
                    <View style={styles.statusBadge}>
                        {area.enabled ? (
                            <>
                                <CheckCircle2 size={16} color="#22c55e" />
                                <Text style={[styles.statusText, { color: '#22c55e' }]}>Actif</Text>
                            </>
                        ) : (
                            <>
                                <XCircle size={16} color="#64748b" />
                                <Text style={[styles.statusText, { color: '#64748b' }]}>Inactif</Text>
                            </>
                        )}
                    </View>
                </View>

                {/* Configuration */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Configuration</Text>

                    <View style={styles.configCard}>
                        <View style={styles.configHeader}>
                            <Play size={16} color="#3b82f6" />
                            <Text style={styles.configLabel}>Déclencheur</Text>
                        </View>
                        <View style={styles.configContent}>
                            <Text style={styles.configService}>
                                {area.action?.service?.name || 'Unknown'}
                            </Text>
                            <Text style={styles.configAction}>
                                {area.action?.name || 'Unknown action'}
                            </Text>
                        </View>
                    </View>

                    <View style={styles.arrow}>
                        <Text style={styles.arrowText}>↓</Text>
                    </View>

                    <View style={styles.configCard}>
                        <View style={styles.configHeader}>
                            <Pause size={16} color="#22c55e" />
                            <Text style={styles.configLabel}>Réaction</Text>
                        </View>
                        <View style={styles.configContent}>
                            <Text style={styles.configService}>
                                {area.reaction?.service?.name || 'Unknown'}
                            </Text>
                            <Text style={styles.configAction}>
                                {area.reaction?.name || 'Unknown reaction'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Execution Logs */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Dernières exécutions</Text>

                    {logsLoading ? (
                        <ActivityIndicator size="small" color="#3b82f6" style={{ marginTop: 20 }} />
                    ) : logs.length === 0 ? (
                        <View style={styles.emptyLogs}>
                            <Clock size={32} color="#64748b" />
                            <Text style={styles.emptyLogsText}>Aucune exécution pour le moment</Text>
                        </View>
                    ) : (
                        logs.map((log) => (
                            <View key={log.id} style={styles.logCard}>
                                <View style={styles.logHeader}>
                                    {log.status === 'success' ? (
                                        <CheckCircle2 size={16} color="#22c55e" />
                                    ) : (
                                        <AlertCircle size={16} color="#ef4444" />
                                    )}
                                    <Text style={[
                                        styles.logStatus,
                                        { color: log.status === 'success' ? '#22c55e' : '#ef4444' }
                                    ]}>
                                        {log.status === 'success' ? 'Succès' : 'Erreur'}
                                    </Text>
                                    <Text style={styles.logDate}>{formatDate(log.created_at)}</Text>
                                </View>
                                {log.message && (
                                    <Text style={styles.logMessage}>{log.message}</Text>
                                )}
                            </View>
                        ))
                    )}
                </View>
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
        justifyContent: 'space-between',
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
        flex: 1,
    },
    deleteButton: {
        padding: 8,
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        borderRadius: 8,
    },
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorText: {
        color: '#ef4444',
        fontSize: 16,
    },
    scrollContent: {
        padding: 20,
        paddingBottom: 100,
    },
    section: {
        marginBottom: 32,
    },
    areaName: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 12,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        alignSelf: 'flex-start',
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 8,
    },
    statusText: {
        fontSize: 14,
        fontWeight: '600',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 16,
    },
    configCard: {
        backgroundColor: 'rgba(30, 41, 59, 0.5)',
        borderRadius: 12,
        padding: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    configHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    configLabel: {
        fontSize: 12,
        fontWeight: '600',
        color: '#94a3b8',
        textTransform: 'uppercase',
    },
    configContent: {
        gap: 4,
    },
    configService: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        textTransform: 'capitalize',
    },
    configAction: {
        fontSize: 14,
        color: '#94a3b8',
    },
    arrow: {
        alignItems: 'center',
        paddingVertical: 8,
    },
    arrowText: {
        fontSize: 24,
        color: '#64748b',
    },
    emptyLogs: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyLogsText: {
        fontSize: 14,
        color: '#94a3b8',
        marginTop: 12,
    },
    logCard: {
        backgroundColor: 'rgba(30, 41, 59, 0.5)',
        borderRadius: 12,
        padding: 12,
        marginBottom: 8,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    logHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
    },
    logStatus: {
        fontSize: 14,
        fontWeight: '600',
    },
    logDate: {
        fontSize: 12,
        color: '#64748b',
        marginLeft: 'auto',
    },
    logMessage: {
        fontSize: 12,
        color: '#94a3b8',
        marginTop: 8,
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
});
