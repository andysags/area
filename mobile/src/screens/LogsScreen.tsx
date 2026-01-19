import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    Platform
} from 'react-native';
import { ArrowLeft, CheckCircle2, AlertCircle, Clock, Filter } from 'lucide-react-native';

const getApiUrl = () => {
    if (Platform.OS === 'android') return 'http://10.0.2.2:8080';
    if (Platform.OS === 'ios') return 'http://localhost:8080';
    return 'http://localhost:8080';
};

interface ExecutionLog {
    id: string;
    area: {
        id: string;
        name: string;
    };
    status: 'success' | 'error';
    message: string;
    created_at: string;
}

interface LogsScreenProps {
    navigate: (screen: string, params?: any) => void;
}

export default function LogsScreen({ navigate }: LogsScreenProps) {
    const [logs, setLogs] = useState<ExecutionLog[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'success' | 'error'>('all');

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const API_BASE = getApiUrl();
            const token = ''; // TODO: Get from auth context

            const response = await fetch(`${API_BASE}/areas/logs/`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setLogs(data);
            }
        } catch (error) {
            console.error('Failed to fetch logs', error);
        } finally {
            setLoading(false);
        }
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);

        if (diffMins < 1) return 'À l\'instant';
        if (diffMins < 60) return `Il y a ${diffMins} min`;
        if (diffHours < 24) return `Il y a ${diffHours}h`;
        if (diffDays < 7) return `Il y a ${diffDays}j`;

        return date.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const filteredLogs = logs.filter(log => {
        if (filter === 'all') return true;
        return log.status === filter;
    });

    const successCount = logs.filter(l => l.status === 'success').length;
    const errorCount = logs.filter(l => l.status === 'error').length;

    if (loading) {
        return (
            <View style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={() => navigate('Dashboard')} style={styles.backButton}>
                        <ArrowLeft color="#fff" size={24} />
                    </TouchableOpacity>
                    <Text style={styles.title}>Logs d'exécution</Text>
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
                <Text style={styles.title}>Logs d'exécution</Text>
            </View>

            {/* Stats */}
            <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                    <Text style={styles.statValue}>{logs.length}</Text>
                    <Text style={styles.statLabel}>Total</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={[styles.statValue, { color: '#22c55e' }]}>{successCount}</Text>
                    <Text style={styles.statLabel}>Succès</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={[styles.statValue, { color: '#ef4444' }]}>{errorCount}</Text>
                    <Text style={styles.statLabel}>Erreurs</Text>
                </View>
            </View>

            {/* Filters */}
            <View style={styles.filtersContainer}>
                <TouchableOpacity
                    style={[styles.filterButton, filter === 'all' && styles.filterButtonActive]}
                    onPress={() => setFilter('all')}
                >
                    <Text style={[styles.filterText, filter === 'all' && styles.filterTextActive]}>
                        Tous
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterButton, filter === 'success' && styles.filterButtonActive]}
                    onPress={() => setFilter('success')}
                >
                    <Text style={[styles.filterText, filter === 'success' && styles.filterTextActive]}>
                        Succès
                    </Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={[styles.filterButton, filter === 'error' && styles.filterButtonActive]}
                    onPress={() => setFilter('error')}
                >
                    <Text style={[styles.filterText, filter === 'error' && styles.filterTextActive]}>
                        Erreurs
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Logs List */}
            <ScrollView contentContainerStyle={styles.scrollContent}>
                {filteredLogs.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Clock size={48} color="#64748b" />
                        <Text style={styles.emptyTitle}>Aucun log</Text>
                        <Text style={styles.emptyText}>
                            {filter === 'all'
                                ? 'Aucune exécution enregistrée'
                                : `Aucune exécution avec le statut "${filter}"`
                            }
                        </Text>
                    </View>
                ) : (
                    filteredLogs.map((log) => (
                        <TouchableOpacity
                            key={log.id}
                            style={styles.logCard}
                            onPress={() => navigate('AreaDetails', { id: log.area.id })}
                            activeOpacity={0.7}
                        >
                            <View style={styles.logHeader}>
                                <View style={styles.logStatus}>
                                    {log.status === 'success' ? (
                                        <CheckCircle2 size={20} color="#22c55e" />
                                    ) : (
                                        <AlertCircle size={20} color="#ef4444" />
                                    )}
                                    <View style={styles.logInfo}>
                                        <Text style={styles.logAreaName}>{log.area.name}</Text>
                                        <Text style={[
                                            styles.logStatusText,
                                            { color: log.status === 'success' ? '#22c55e' : '#ef4444' }
                                        ]}>
                                            {log.status === 'success' ? 'Succès' : 'Erreur'}
                                        </Text>
                                    </View>
                                </View>
                                <Text style={styles.logDate}>{formatDate(log.created_at)}</Text>
                            </View>

                            {log.message && (
                                <View style={styles.logMessageContainer}>
                                    <Text style={styles.logMessage} numberOfLines={2}>
                                        {log.message}
                                    </Text>
                                </View>
                            )}
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
    filtersContainer: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        gap: 8,
        marginBottom: 16,
    },
    filterButton: {
        flex: 1,
        paddingVertical: 8,
        paddingHorizontal: 16,
        borderRadius: 8,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
    },
    filterButtonActive: {
        backgroundColor: '#3b82f6',
        borderColor: '#3b82f6',
    },
    filterText: {
        fontSize: 14,
        fontWeight: '600',
        color: '#94a3b8',
    },
    filterTextActive: {
        color: '#fff',
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
    },
    logCard: {
        backgroundColor: 'rgba(30, 41, 59, 0.5)',
        borderRadius: 12,
        padding: 16,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.05)',
    },
    logHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 8,
    },
    logStatus: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: 12,
        flex: 1,
    },
    logInfo: {
        flex: 1,
    },
    logAreaName: {
        fontSize: 16,
        fontWeight: '600',
        color: '#fff',
        marginBottom: 4,
    },
    logStatusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    logDate: {
        fontSize: 12,
        color: '#64748b',
    },
    logMessageContainer: {
        marginTop: 8,
        paddingTop: 8,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.05)',
    },
    logMessage: {
        fontSize: 12,
        color: '#94a3b8',
        fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    },
});
