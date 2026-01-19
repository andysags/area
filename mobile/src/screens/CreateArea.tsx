import React, { useState, useEffect } from 'react';
import { 
    View, 
    Text, 
    StyleSheet, 
    TouchableOpacity, 
    ScrollView, 
    TextInput, 
    Dimensions,
    LayoutAnimation,
    Platform,
    UIManager,
    Image,
    ActivityIndicator
} from 'react-native';
import { 
    ArrowRight, 
    Check, 
    ChevronRight, 
    Zap, 
    Play, 
    Settings, 
    ChevronLeft, 
    Save, 
    X,
    ChevronDown,
    Plus,
    Code,
    Globe,
    MessageCircle,
    Music
} from 'lucide-react-native';

if (Platform.OS === 'android') {
    if (UIManager.setLayoutAnimationEnabledExperimental) {
        UIManager.setLayoutAnimationEnabledExperimental(true);
    }
}

const { width } = Dimensions.get('window');

// Helper to get API URL based on environment
const getApiUrl = () => {
    if (Platform.OS === 'android') return 'http://10.0.2.2:8080';
    if (Platform.OS === 'ios') return 'http://localhost:8080';
    return 'http://localhost:8080'; // Web
};

// Types
type Service = {
    id: string;
    name: string;
    display_name: string;
    icon_url: string;
    color: string;
    bgColor: string;
    connected: boolean;
};

type ConfigField = {
    name: string;
    label: string;
    type: 'text' | 'number' | 'select';
    options?: string[];
    placeholder?: string;
};

type ActionTrigger = {
    id: string;
    serviceId: string;
    name: string;
    description: string;
    configFields: ConfigField[];
};

const getServiceConfig = (name: string) => {
    switch (name.toLowerCase()) {
        case 'timer': return { color: '#eab308', bgColor: 'rgba(234, 179, 8, 0.1)' };
        case 'weather': return { color: '#60a5fa', bgColor: 'rgba(96, 165, 250, 0.1)' };
        case 'github': return { color: '#ffffff', bgColor: '#1f2937' };
        case 'discord': return { color: '#ffffff', bgColor: '#6366f1' };
        case 'gmail': return { color: '#ef4444', bgColor: 'rgba(239, 68, 68, 0.1)' };
        case 'google-drive': return { color: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.1)' };
        case 'teams': return { color: '#6366f1', bgColor: 'rgba(99, 102, 241, 0.1)' };
        case 'spotify': return { color: '#22c55e', bgColor: 'rgba(34, 197, 94, 0.1)' };
        case 'whatsapp': return { color: '#4ade80', bgColor: 'rgba(74, 222, 128, 0.1)' };
        case 'facebook': return { color: '#2563eb', bgColor: 'rgba(37, 99, 235, 0.1)' };
        case 'messenger': return { color: '#3b82f6', bgColor: 'rgba(59, 130, 246, 0.1)' };
        default: return { color: '#ffffff', bgColor: 'rgba(255, 255, 255, 0.1)' };
    }
};

// Mock Data for Config Fields (since API might not return them yet)
const MOCK_CONFIGS: Record<string, ConfigField[]> = {
    'every_minute': [],
    'every_hour': [],
    'daily': [],
    'temperature_above': [{ name: 'threshold', label: 'Seuil (°C)', type: 'number', placeholder: '25' }],
    'temperature_below': [{ name: 'threshold', label: 'Seuil (°C)', type: 'number', placeholder: '0' }],
    'condition_is': [{ name: 'condition', label: 'Condition', type: 'text', placeholder: 'rain' }],
    'new_commit': [{ name: 'repo', label: 'Repository', type: 'text', placeholder: 'owner/repo' }, { name: 'branch', label: 'Branche', type: 'text', placeholder: 'main' }],
    'new_pr': [{ name: 'repo', label: 'Repository', type: 'text', placeholder: 'owner/repo' }],
    'new_issue': [{ name: 'repo', label: 'Repository', type: 'text', placeholder: 'owner/repo' }],
    'new_message': [{ name: 'channel_id', label: 'ID du Channel', type: 'text', placeholder: '123456789' }],
    'user_joined': [],
    'new_email': [],
    'email_from': [{ name: 'from', label: 'Expéditeur', type: 'text', placeholder: 'example@gmail.com' }],
    'youtube_new_video': [{ name: 'channel_id', label: 'ID de la chaîne', type: 'text', placeholder: 'UC...' }],
    'youtube_new_like': [],
    'gmail_new_email': [],
    'gmail_send_email': [{ name: 'to', label: 'À', type: 'text', placeholder: 'email@example.com' }, { name: 'subject', label: 'Sujet', type: 'text', placeholder: 'Sujet' }, { name: 'body', label: 'Message', type: 'text', placeholder: 'Contenu' }],
    'delay': [{ name: 'duration', label: 'Durée (min)', type: 'number', placeholder: '5' }],
    'send_alert': [],
    'create_issue': [{ name: 'repo', label: 'Repository', type: 'text', placeholder: 'owner/repo' }, { name: 'title', label: 'Titre', type: 'text', placeholder: 'Bug' }],
    'comment_pr': [{ name: 'repo', label: 'Repository', type: 'text', placeholder: 'owner/repo' }, { name: 'pr_number', label: 'PR #', type: 'number', placeholder: '1' }],
    'send_message': [{ name: 'channel_id', label: 'ID du Channel', type: 'text', placeholder: '123456789' }, { name: 'content', label: 'Message', type: 'text', placeholder: 'Hello' }],
    'create_channel': [{ name: 'name', label: 'Nom', type: 'text', placeholder: 'general' }],
    'send_email': [{ name: 'to', label: 'À', type: 'text', placeholder: 'email@example.com' }],
    'mark_read': [],
};

interface CreateAreaProps {
    navigate: (screen: string) => void;
}

export default function CreateArea({ navigate }: CreateAreaProps) {
    console.log("Rendering CreateArea");
    const [activeSection, setActiveSection] = useState<string | null>('trigger');
    
    const [services, setServices] = useState<Service[]>([]);
    const [triggers, setTriggers] = useState<Record<string, ActionTrigger[]>>({});
    const [actionsList, setActionsList] = useState<Record<string, ActionTrigger[]>>({});
    const [loading, setLoading] = useState(true);

    const [triggerService, setTriggerService] = useState<Service | null>(null);
    const [triggerEvent, setTriggerEvent] = useState<ActionTrigger | null>(null);
    const [triggerConfig, setTriggerConfig] = useState<Record<string, string>>({});
    
    const [actions, setActions] = useState<{
        id: string;
        service: Service | null;
        event: ActionTrigger | null;
        config: Record<string, string>;
    }[]>([{ id: 'action-0', service: null, event: null, config: {} }]);

    const [areaName, setAreaName] = useState("");

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            const API_BASE = getApiUrl();
            const res = await fetch(`${API_BASE}/services/`);
            if (res.ok) {
                const data = await res.json();
                const mappedServices: Service[] = [];
                
                // First pass: Create services list
                for (const s of data) {
                    const serviceId = s.name;
                    const config = getServiceConfig(serviceId);
                    
                    mappedServices.push({
                        id: serviceId,
                        name: s.name,
                        display_name: s.display_name,
                        icon_url: s.icon_url,
                        color: config.color,
                        bgColor: config.bgColor,
                        connected: true
                    });
                }
                
                // Update UI immediately with services
                setServices(mappedServices);
                setLoading(false);

                // Second pass: Fetch details in background
                const mappedTriggers: Record<string, ActionTrigger[]> = {};
                const mappedActions: Record<string, ActionTrigger[]> = {};

                await Promise.all(data.map(async (s: any) => {
                    const serviceId = s.name;
                    try {
                        const detailRes = await fetch(`${API_BASE}/services/${s.id}/`);
                        if (detailRes.ok) {
                            const detailData = await detailRes.json();
                            
                            mappedTriggers[serviceId] = (detailData.actions || []).map((a: any) => ({
                                id: a.name,
                                serviceId: serviceId,
                                name: a.name,
                                description: a.description,
                                configFields: MOCK_CONFIGS[a.name] || []
                            }));

                            mappedActions[serviceId] = (detailData.reactions || []).map((r: any) => ({
                                id: r.name,
                                serviceId: serviceId,
                                name: r.name,
                                description: r.description,
                                configFields: MOCK_CONFIGS[r.name] || []
                            }));
                        }
                    } catch (e) {
                        console.error(`Failed to fetch details for ${s.name}`, e);
                    }
                }));

                setTriggers(mappedTriggers);
                setActionsList(mappedActions);
            } else {
                setLoading(false);
            }
        } catch (e) {
            console.error("Failed to fetch services", e);
            setLoading(false);
        }
    };

    // Removed fetchTriggers and fetchReactions as they are now fetched upfront

    const handleSelectService = (service: Service, type: 'trigger' | 'action') => {
        // Logic moved to StepCard
    };

    const toggleSection = (section: string) => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setActiveSection(activeSection === section ? null : section);
    };

    const addAction = () => {
        const newId = `action-${actions.length}`;
        setActions([...actions, { id: newId, service: null, event: null, config: {} }]);
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        setActiveSection(newId);
    };

    const updateAction = (id: string, field: 'service' | 'event' | 'config', value: any) => {
        setActions(actions.map(a => {
            if (a.id === id) {
                if (field === 'service') {
                    return { ...a, service: value, event: null, config: {} };
                }
                if (field === 'event') {
                    return { ...a, event: value, config: {} };
                }
                return { ...a, [field]: value };
            }
            return a;
        }));
    };

    const handleSave = () => {
        console.log("Saving AREA:", {
            name: areaName,
            trigger: { 
                service: triggerService?.id, 
                event: triggerEvent?.id,
                config: triggerConfig
            },
            actions: actions.map(a => ({ 
                service: a.service?.id, 
                event: a.event?.id,
                config: a.config
            }))
        });
        navigate('Dashboard');
    };

    const renderServiceGrid = (onSelect: (s: Service) => void) => (
        <View style={styles.grid}>
            {services.map((service) => (
                <TouchableOpacity
                    key={service.id}
                    onPress={() => onSelect(service)}
                    style={styles.serviceCard}
                >
                    <View style={{ marginBottom: 12 }}>
                        {service.icon_url ? (
                            <Image 
                                source={{ uri: service.icon_url }} 
                                style={{ width: 40, height: 40, resizeMode: 'contain' }} 
                            />
                        ) : (
                            <View style={[styles.iconPlaceholder, { backgroundColor: service.bgColor }]} />
                        )}
                    </View>
                    <Text style={styles.serviceName}>{service.display_name || service.name}</Text>
                </TouchableOpacity>
            ))}
        </View>
    );    const renderEventList = (service: Service, list: Record<string, ActionTrigger[]>, onSelect: (t: ActionTrigger) => void) => {
        const items = list[service.id] || [];
        if (items.length === 0) {
            return (
                <View style={styles.listContainer}>
                    <Text style={{ color: '#94a3b8', textAlign: 'center', padding: 20 }}>Aucun élément disponible.</Text>
                </View>
            );
        }
        return (
            <View style={styles.listContainer}>
                {items.map((item) => (
                    <TouchableOpacity
                        key={item.id}
                        onPress={() => onSelect(item)}
                        style={styles.eventCard}
                    >
                        <View style={styles.eventInfo}>
                            <Text style={styles.eventName}>{item.name}</Text>
                            <Text style={styles.eventDescription}>{item.description}</Text>
                        </View>
                        <ChevronRight size={16} color="#64748b" />
                    </TouchableOpacity>
                ))}
            </View>
        );
    };

    const renderConfigForm = (
        fields: ConfigField[], 
        values: Record<string, string>, 
        onChange: (key: string, val: string) => void
    ) => (
        <View style={{ marginTop: 16 }}>
            {fields.length === 0 ? (
                <Text style={{ color: '#94a3b8', fontStyle: 'italic' }}>Aucune configuration nécessaire.</Text>
            ) : (
                fields.map((field) => (
                    <View key={field.name} style={{ marginBottom: 16 }}>
                        <Text style={{ color: '#94a3b8', fontSize: 12, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 8 }}>
                            {field.label}
                        </Text>
                        <TextInput
                            value={values[field.name] || ''}
                            onChangeText={(text) => onChange(field.name, text)}
                            placeholder={field.placeholder}
                            placeholderTextColor="#64748b"
                            style={{
                                backgroundColor: '#0f172a',
                                borderWidth: 1,
                                borderColor: 'rgba(255,255,255,0.1)',
                                borderRadius: 8,
                                padding: 12,
                                color: '#fff'
                            }}
                            keyboardType={field.type === 'number' ? 'numeric' : 'default'}
                        />
                    </View>
                ))
            )}
        </View>
    );

    const SubStep = ({ 
        title, 
        isOpen, 
        isCompleted, 
        onClick, 
        children 
    }: { 
        title: string, 
        isOpen: boolean, 
        isCompleted: boolean, 
        onClick: () => void, 
        children: React.ReactNode 
    }) => (
        <View style={{ borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.05)' }}>
            <TouchableOpacity 
                onPress={() => {
                    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
                    onClick();
                }}
                style={{ 
                    flexDirection: 'row', 
                    alignItems: 'center', 
                    justifyContent: 'space-between', 
                    padding: 16,
                    backgroundColor: isOpen ? 'rgba(255,255,255,0.05)' : 'transparent'
                }}
            >
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={{
                        width: 24, height: 24, borderRadius: 12, borderWidth: 1,
                        alignItems: 'center', justifyContent: 'center', marginRight: 12,
                        backgroundColor: isCompleted ? 'rgba(34, 197, 94, 0.2)' : (isOpen ? 'rgba(59, 130, 246, 0.2)' : '#27272a'),
                        borderColor: isCompleted ? '#22c55e' : (isOpen ? '#3b82f6' : '#3f3f46')
                    }}>
                        {isCompleted ? <Check size={12} color="#22c55e" /> : (isOpen ? <ChevronDown size={12} color="#3b82f6" /> : <ChevronRight size={12} color="#71717a" />)}
                    </View>
                    <Text style={{ fontWeight: '500', color: isCompleted || isOpen ? '#fff' : '#a1a1aa' }}>
                        {title}
                    </Text>
                </View>
                {isCompleted && !isOpen && <Check size={16} color="#22c55e" />}
            </TouchableOpacity>
            {isOpen && (
                <View style={{ padding: 16, paddingLeft: 52, backgroundColor: 'rgba(0,0,0,0.2)', borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.05)' }}>
                    {children}
                </View>
            )}
        </View>
    );

    const StepCard = ({ 
        id,
        type, 
        number, 
        title, 
        service, 
        event, 
        config,
        setService, 
        setEvent, 
        setConfig,
        eventList 
    }: { 
        id: string,
        type: 'trigger' | 'action',
        number: number,
        title: string,
        service: Service | null,
        event: ActionTrigger | null,
        config: Record<string, string>,
        setService: (s: Service | null) => void,
        setEvent: (e: ActionTrigger | null) => void,
        setConfig: (c: Record<string, string>) => void,
        eventList: Record<string, ActionTrigger[]>
    }) => {
        const isActive = activeSection === id;
        const isCompleted = service && event && Object.keys(config).length >= 0; // Simplified
        const [openSubStep, setOpenSubStep] = useState<string>('app');

        return (
            <View style={[styles.stepCardContainer, isActive && styles.stepCardActive]}>
                <TouchableOpacity 
                    onPress={() => toggleSection(id)}
                    style={[styles.stepCardHeader, isActive && styles.stepCardHeaderActive]}
                    activeOpacity={0.8}
                >
                    <View style={styles.stepHeaderLeft}>
                        <View style={[
                            styles.stepNumber,
                            isCompleted ? styles.stepNumberCompleted : styles.stepNumberDefault
                        ]}>
                            {isCompleted ? <Check size={14} color="#fff" /> : <Text style={styles.stepNumberText}>{number}</Text>}
                        </View>
                        
                        <View>
                            <Text style={styles.stepLabel}>{type === 'trigger' ? '1. Déclencheur' : `${number}. Action`}</Text>
                            <View style={styles.stepSummary}>
                                {service ? (
                                    <View style={styles.stepSummaryContent}>
                                        {service.icon_url && (
                                            <Image 
                                                source={{ uri: service.icon_url }} 
                                                style={{ width: 14, height: 14, marginRight: 6, resizeMode: 'contain' }} 
                                            />
                                        )}
                                        <Text style={styles.stepSummaryText}>{service.display_name || service.name}</Text>
                                        {event && (
                                            <>
                                                <Text style={{ color: '#64748b', marginHorizontal: 4 }}>•</Text>
                                                <Text style={{ color: '#cbd5e1', fontSize: 13 }}>{event.name}</Text>
                                            </>
                                        )}
                                    </View>
                                ) : (
                                    <Text style={styles.stepTitlePlaceholder}>{title}</Text>
                                )}
                            </View>
                        </View>
                    </View>
                    <ChevronDown size={20} color="#64748b" style={{ transform: [{ rotate: isActive ? '180deg' : '0deg' }] }} />
                </TouchableOpacity>

                {isActive && (
                    <View style={{ borderTopWidth: 1, borderTopColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(15, 23, 36, 0.5)' }}>
                        {/* 1. App & Event */}
                        <SubStep 
                            title="App & Event" 
                            isOpen={openSubStep === 'app'} 
                            isCompleted={!!service && !!event}
                            onClick={() => setOpenSubStep(openSubStep === 'app' ? '' : 'app')}
                        >
                            <View>
                                <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 8 }}>Application</Text>
                                {!service ? (
                                    renderServiceGrid((s) => setService(s))
                                ) : (
                                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.05)', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
                                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                                            {service.icon_url && <Image source={{ uri: service.icon_url }} style={{ width: 20, height: 20, marginRight: 12, resizeMode: 'contain' }} />}
                                            <Text style={{ color: '#fff', fontWeight: '500' }}>{service.display_name || service.name}</Text>
                                        </View>
                                        <TouchableOpacity onPress={() => { setService(null); setEvent(null); }}>
                                            <Text style={{ color: '#60a5fa', fontSize: 12 }}>Changer</Text>
                                        </TouchableOpacity>
                                    </View>
                                )}

                                {service && (
                                    <View style={{ marginTop: 16 }}>
                                        <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#94a3b8', textTransform: 'uppercase', marginBottom: 8 }}>Événement</Text>
                                        {!event ? (
                                            renderEventList(service, eventList, (e) => { setEvent(e); setOpenSubStep('account'); })
                                        ) : (
                                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: 'rgba(255,255,255,0.05)', padding: 12, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' }}>
                                                <View>
                                                    <Text style={{ color: '#fff', fontWeight: '500' }}>{event.name}</Text>
                                                    <Text style={{ color: '#94a3b8', fontSize: 12 }}>{event.description}</Text>
                                                </View>
                                                <TouchableOpacity onPress={() => setEvent(null)}>
                                                    <Text style={{ color: '#60a5fa', fontSize: 12 }}>Changer</Text>
                                                </TouchableOpacity>
                                            </View>
                                        )}
                                    </View>
                                )}

                                {service && event && (
                                    <TouchableOpacity 
                                        onPress={() => setOpenSubStep('account')}
                                        style={{ marginTop: 16, backgroundColor: '#2563eb', padding: 12, borderRadius: 8, alignItems: 'center' }}
                                    >
                                        <Text style={{ color: '#fff', fontWeight: 'bold' }}>Continuer</Text>
                                    </TouchableOpacity>
                                )}
                            </View>
                        </SubStep>

                        {/* 2. Account */}
                        <SubStep 
                            title="Account" 
                            isOpen={openSubStep === 'account'} 
                            isCompleted={!!service}
                            onClick={() => setOpenSubStep(openSubStep === 'account' ? '' : 'account')}
                        >
                            <View>
                                <Text style={{ color: '#94a3b8', marginBottom: 12 }}>Connectez votre compte {service?.name || 'Service'}.</Text>
                                {service ? (
                                    <View style={{ flexDirection: 'row', alignItems: 'center', padding: 12, backgroundColor: 'rgba(34, 197, 94, 0.1)', borderWidth: 1, borderColor: 'rgba(34, 197, 94, 0.2)', borderRadius: 8 }}>
                                        <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: '#22c55e', alignItems: 'center', justifyContent: 'center', marginRight: 12 }}>
                                            <Text style={{ color: '#fff', fontWeight: 'bold' }}>{service.name[0].toUpperCase()}</Text>
                                        </View>
                                        <View style={{ flex: 1 }}>
                                            <Text style={{ color: '#fff', fontWeight: '500' }}>Mon Compte {service.name}</Text>
                                            <Text style={{ color: '#4ade80', fontSize: 12 }}>Connecté</Text>
                                        </View>
                                    </View>
                                ) : (
                                    <Text style={{ color: '#64748b', fontStyle: 'italic' }}>Veuillez d'abord choisir une application.</Text>
                                )}
                                <TouchableOpacity 
                                    onPress={() => setOpenSubStep('config')}
                                    style={{ marginTop: 16, backgroundColor: '#2563eb', padding: 12, borderRadius: 8, alignItems: 'center' }}
                                >
                                    <Text style={{ color: '#fff', fontWeight: 'bold' }}>Continuer</Text>
                                </TouchableOpacity>
                            </View>
                        </SubStep>

                        {/* 3. Config */}
                        <SubStep 
                            title={type === 'trigger' ? 'Trigger' : 'Action'} 
                            isOpen={openSubStep === 'config'} 
                            isCompleted={event ? (event.configFields.length === 0 || Object.keys(config).length > 0) : false}
                            onClick={() => setOpenSubStep(openSubStep === 'config' ? '' : 'config')}
                        >
                            <View>
                                {event ? (
                                    <>
                                        {renderConfigForm(
                                            event.configFields,
                                            config,
                                            (k, v) => setConfig({ ...config, [k]: v })
                                        )}
                                        <TouchableOpacity 
                                            onPress={() => setOpenSubStep('test')}
                                            style={{ marginTop: 16, backgroundColor: '#2563eb', padding: 12, borderRadius: 8, alignItems: 'center' }}
                                        >
                                            <Text style={{ color: '#fff', fontWeight: 'bold' }}>Continuer</Text>
                                        </TouchableOpacity>
                                    </>
                                ) : (
                                    <Text style={{ color: '#64748b', fontStyle: 'italic' }}>Veuillez choisir un événement.</Text>
                                )}
                            </View>
                        </SubStep>

                        {/* 4. Test */}
                        <SubStep 
                            title="Test" 
                            isOpen={openSubStep === 'test'} 
                            isCompleted={false}
                            onClick={() => setOpenSubStep(openSubStep === 'test' ? '' : 'test')}
                        >
                            <View>
                                <View style={{ padding: 16, backgroundColor: '#020617', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 8 }}>
                                    <Text style={{ color: '#94a3b8', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 12 }}>// Simulation des données</Text>
                                    <Text style={{ color: '#94a3b8', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 12 }}>{`{`}</Text>
                                    <Text style={{ color: '#94a3b8', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 12, paddingLeft: 16 }}>"id": "evt_123456",</Text>
                                    <Text style={{ color: '#94a3b8', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 12, paddingLeft: 16 }}>"source": "{service?.name || 'unknown'}"</Text>
                                    <Text style={{ color: '#94a3b8', fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace', fontSize: 12 }}>{`}`}</Text>
                                </View>
                                <TouchableOpacity 
                                    onPress={() => {
                                        if (type === 'trigger') setActiveSection('action-0');
                                        else setActiveSection(null);
                                    }}
                                    style={{ marginTop: 16, backgroundColor: '#fff', padding: 12, borderRadius: 8, alignItems: 'center', flexDirection: 'row', justifyContent: 'center' }}
                                >
                                    <Play size={16} color="#000" style={{ marginRight: 8 }} />
                                    <Text style={{ color: '#000', fontWeight: 'bold' }}>Tester et Continuer</Text>
                                </TouchableOpacity>
                            </View>
                        </SubStep>
                    </View>
                )}
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <TouchableOpacity onPress={() => navigate('Dashboard')} style={styles.closeButton}>
                        <X size={20} color="#94a3b8" />
                    </TouchableOpacity>
                    <TextInput
                        value={areaName}
                        onChangeText={setAreaName}
                        placeholder="Nom de votre Area..."
                        placeholderTextColor="#64748b"
                        style={styles.headerInput}
                    />
                </View>
                <TouchableOpacity 
                    onPress={handleSave}
                    disabled={!triggerEvent || actions.some(a => !a.event) || !areaName}
                    style={[styles.publishButton, (!triggerEvent || actions.some(a => !a.event) || !areaName) && styles.publishButtonDisabled]}
                >
                    <Save size={16} color="#fff" style={{ marginRight: 6 }} />
                    <Text style={styles.publishButtonText}>Publier</Text>
                </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.content}>
                <StepCard 
                    id="trigger"
                    type="trigger"
                    number={1}
                    title="Quand cela arrive..."
                    service={triggerService}
                    event={triggerEvent}
                    config={triggerConfig}
                    setService={setTriggerService}
                    setEvent={setTriggerEvent}
                    setConfig={setTriggerConfig}
                    eventList={triggers}
                />

                <View style={styles.connector} />

                {actions.map((action, index) => (
                    <React.Fragment key={action.id}>
                        <StepCard 
                            id={action.id}
                            type="action"
                            number={index + 2}
                            title="Faire cela..."
                            service={action.service}
                            event={action.event}
                            config={action.config}
                            setService={(s) => updateAction(action.id, 'service', s)}
                            setEvent={(e) => updateAction(action.id, 'event', e)}
                            setConfig={(c) => updateAction(action.id, 'config', c)}
                            eventList={actionsList}
                        />
                        {index < actions.length - 1 && <View style={styles.connector} />}
                    </React.Fragment>
                ))}

                <View style={styles.addButtonContainer}>
                    <TouchableOpacity onPress={addAction} style={styles.addButton}>
                        <Plus size={16} color="#94a3b8" />
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View>
    );
}const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#0f1724',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        paddingTop: 60,
        paddingBottom: 20,
        backgroundColor: 'rgba(15, 23, 36, 0.9)',
        borderBottomWidth: 1,
        borderBottomColor: 'rgba(255,255,255,0.05)',
        zIndex: 10,
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    closeButton: {
        padding: 8,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 20,
        marginRight: 12,
    },
    headerInput: {
        flex: 1,
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginRight: 12,
    },
    publishButton: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#2563eb',
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
    },
    publishButtonDisabled: {
        opacity: 0.5,
    },
    publishButtonText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    content: {
        padding: 20,
        paddingBottom: 100,
    },
    stepCardContainer: {
        backgroundColor: '#1e293b',
        borderRadius: 16,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        overflow: 'hidden',
        marginBottom: 4,
    },
    stepCardActive: {
        borderColor: '#3b82f6',
        marginBottom: 16,
        marginTop: 16,
        shadowColor: "#3b82f6",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 8,
        elevation: 4,
    },
    stepCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: 16,
    },
    stepCardHeaderActive: {
        backgroundColor: 'rgba(59, 130, 246, 0.05)',
    },
    stepHeaderLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    stepNumber: {
        width: 32,
        height: 32,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    stepNumberDefault: {
        backgroundColor: '#334155',
    },
    stepNumberCompleted: {
        backgroundColor: '#22c55e',
    },
    stepNumberText: {
        color: '#cbd5e1',
        fontWeight: 'bold',
        fontSize: 14,
    },
    stepLabel: {
        fontSize: 10,
        fontWeight: 'bold',
        color: '#94a3b8',
        textTransform: 'uppercase',
        letterSpacing: 0.5,
        marginBottom: 2,
    },
    stepSummary: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    stepSummaryContent: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    stepSummaryText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
        marginLeft: 6,
    },
    stepSummaryDot: {
        color: '#64748b',
        marginHorizontal: 6,
    },
    stepSummaryEvent: {
        color: '#cbd5e1',
        fontSize: 14,
    },
    stepTitlePlaceholder: {
        color: '#cbd5e1',
        fontWeight: '600',
        fontSize: 14,
    },
    stepContent: {
        padding: 20,
        borderTopWidth: 1,
        borderTopColor: 'rgba(255,255,255,0.1)',
        backgroundColor: 'rgba(15, 23, 36, 0.3)',
    },
    sectionTitle: {
        color: '#cbd5e1',
        fontSize: 14,
        fontWeight: '500',
        marginBottom: 12,
    },
    grid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    serviceCard: {
        width: '48%',
        marginBottom: 12,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    serviceName: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    selectedServiceCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(255,255,255,0.05)',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        marginBottom: 20,
    },
    selectedServiceLeft: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    miniIcon: {
        width: 32,
        height: 32,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 12,
    },
    selectedServiceName: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
    changeButton: {
        color: '#94a3b8',
        fontSize: 12,
        textDecorationLine: 'underline',
    },
    eventSection: {
        marginTop: 8,
    },
    listContainer: {
        gap: 8,
    },
    eventCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(255,255,255,0.05)',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    eventInfo: {
        flex: 1,
    },
    eventName: {
        color: '#fff',
        fontWeight: '500',
        fontSize: 14,
        marginBottom: 2,
    },
    eventDescription: {
        color: '#94a3b8',
        fontSize: 12,
    },
    selectedEventCard: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: 'rgba(255,255,255,0.05)',
        padding: 12,
        borderRadius: 12,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    selectedEventName: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
        marginBottom: 2,
    },
    selectedEventDesc: {
        color: '#94a3b8',
        fontSize: 12,
    },
    connector: {
        height: 24,
        width: 2,
        backgroundColor: 'rgba(255,255,255,0.1)',
        alignSelf: 'center',
    },
    addButtonContainer: {
        alignItems: 'center',
        marginTop: 12,
    },
    addButton: {
        width: 32,
        height: 32,
        borderRadius: 16,
        backgroundColor: 'rgba(255,255,255,0.05)',
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
    }
});
