"use client";

import React, { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowRight, Check, ChevronRight, Play, Settings,
    ChevronLeft, Save, X, ChevronDown, Edit2, Plus,
    Search, AlertCircle, Trash2
} from 'lucide-react';

// Types
type Service = {
    id: string;
    name: string;
    icon_url: string;
    color: string;
    bgColor: string;
    connected: boolean;
    requires_auth?: boolean;
};

type ActionTrigger = {
    id: string;
    serviceId: string;
    name: string;
    description: string;
    configFields: ConfigField[];
};

type ConfigField = {
    name: string;
    label: string;
    type: 'text' | 'number' | 'select';
    options?: string[];
    placeholder?: string;
    options_url?: string;
};

const SERVICE_COLORS: Record<string, { color: string, bgColor: string }> = {
    timer: { color: 'text-yellow-500', bgColor: 'bg-yellow-500/10' },
    weather: { color: 'text-blue-400', bgColor: 'bg-blue-400/10' },
    github: { color: 'text-white', bgColor: 'bg-gray-800' },
    discord: { color: 'text-white', bgColor: 'bg-indigo-500' },
    gmail: { color: 'text-red-500', bgColor: 'bg-red-500/10' },
    'google-drive': { color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
    teams: { color: 'text-indigo-500', bgColor: 'bg-indigo-500/10' },
    spotify: { color: 'text-green-500', bgColor: 'bg-green-500/10' },
    whatsapp: { color: 'text-green-400', bgColor: 'bg-green-400/10' },
    facebook: { color: 'text-blue-600', bgColor: 'bg-blue-600/10' },
    messenger: { color: 'text-blue-500', bgColor: 'bg-blue-500/10' },
    default: { color: 'text-white', bgColor: 'bg-white/10' },
};

// Mock Data
// Mock Data (Removed)
const SERVICES: Service[] = [];

const TRIGGERS: Record<string, ActionTrigger[]> = {};
const ACTIONS: Record<string, ActionTrigger[]> = {};

const mapParamsToConfigFields = (params: any[]): ConfigField[] => {
    return (params || []).map(p => ({
        name: p.name,
        label: p.label || p.name.charAt(0).toUpperCase() + p.name.slice(1).replace(/_/g, ' '),
        type: p.type === 'integer' ? 'number' : (p.type === 'select' ? 'select' : 'text'),
        placeholder: p.description || '',
        options_url: p.options_url
    }));
};

const AsyncSelect = ({
    url,
    value,
    onChange,
    placeholder
}: {
    url: string,
    value: string,
    onChange: (val: string) => void,
    placeholder?: string
}) => {
    const [options, setOptions] = useState<{ id: string, name: string }[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        const fetchOptions = async () => {
            const token = localStorage.getItem('access_token');
            if (!token) return;

            try {
                // Ensure URL is absolute or relative to API
                const finalUrl = url.startsWith('http') ? url : `http://localhost:8080${url}`;
                const res = await fetch(finalUrl, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (res.ok) {
                    const data = await res.json();
                    setOptions(data);
                } else {
                    setError(true);
                }
            } catch (e) {
                console.error("Failed to fetch options", e);
                setError(true);
            } finally {
                setLoading(false);
            }
        };

        fetchOptions();
    }, [url]);

    if (loading) return <div className="text-xs text-zinc-500">Chargement des options...</div>;
    if (error) return <div className="text-xs text-red-500">Erreur de chargement.</div>;

    return (
        <select
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-4 py-2 rounded-lg bg-zinc-950 border border-white/10 text-white focus:outline-none focus:border-blue-500 transition-colors text-sm"
        >
            <option value="" disabled>{placeholder || "Sélectionner..."}</option>
            {options.map(opt => (
                <option key={opt.id} value={opt.id}>{opt.name}</option>
            ))}
        </select>
    );
};

const renderServiceGrid = (services: Service[], onSelect: (s: Service) => void) => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        {services.map((service) => (
            <button
                key={service.id}
                onClick={() => onSelect(service)}
                className="p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 transition-all flex flex-col items-center gap-3 group"
            >
                <div className="mb-2">
                    {service.icon_url ? (
                        <img src={service.icon_url} alt={service.name} className="w-12 h-12 object-contain" />
                    ) : (
                        <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xl">
                            {service.name.charAt(0).toUpperCase()}
                        </div>
                    )}
                </div>
                <span className="font-medium text-sm">{service.name}</span>
            </button>
        ))}
    </div>
);

const renderEventList = (service: Service, list: Record<string, ActionTrigger[]>, onSelect: (t: ActionTrigger) => void) => {
    const items = list[service.id] || [];
    return (
        <div className="space-y-2 mt-4">
            {items.map((item) => (
                <button
                    key={item.id}
                    onClick={() => onSelect(item)}
                    className="w-full p-3 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-left transition-all flex items-center justify-between group"
                >
                    <div>
                        <h3 className="font-medium text-white text-sm">{item.name}</h3>
                        <p className="text-xs text-slate-400">{item.description}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-white" />
                </button>
            ))}
        </div>
    );
};

const renderConfigForm = (
    fields: ConfigField[],
    values: Record<string, string>,
    onChange: (key: string, val: string) => void
) => (
    <div className="space-y-4 mt-4">
        {fields.length === 0 ? (
            <p className="text-zinc-400 text-sm italic">Aucune configuration nécessaire.</p>
        ) : (
            fields.map((field) => (
                <div key={field.name} className="space-y-2">
                    <label className="block text-xs font-medium text-zinc-400 uppercase">
                        {field.label}
                    </label>
                    {field.type === 'select' && field.options_url ? (
                        <AsyncSelect
                            url={field.options_url}
                            value={values[field.name] || ''}
                            onChange={(val) => onChange(field.name, val)}
                            placeholder={field.placeholder}
                        />
                    ) : (
                        <input
                            type={field.type}
                            value={values[field.name] || ''}
                            onChange={(e) => onChange(field.name, e.target.value)}
                            placeholder={field.placeholder}
                            className="w-full px-4 py-2 rounded-lg bg-zinc-950 border border-white/10 text-white focus:outline-none focus:border-blue-500 transition-colors text-sm"
                        />
                    )}
                </div>
            ))
        )}
    </div>
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
    <div className="border-b border-white/5 last:border-0">
        <button
            onClick={onClick}
            className={`w-full flex items-center justify-between p-4 text-left transition-colors ${isOpen ? 'bg-white/5' : 'hover:bg-white/5'}`}
        >
            <div className="flex items-center gap-3">
                <div className={`
                    w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border
                    ${isCompleted
                        ? 'bg-green-500/20 border-green-500 text-green-500'
                        : isOpen
                            ? 'bg-blue-500/20 border-blue-500 text-blue-500'
                            : 'bg-zinc-800 border-zinc-700 text-zinc-500'
                    }
                `}>
                    {isCompleted ? <Check className="w-3 h-3" /> : (isOpen ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />)}
                </div>
                <span className={`font-medium ${isCompleted || isOpen ? 'text-white' : 'text-zinc-400'}`}>
                    {title}
                </span>
            </div>
            {isCompleted && !isOpen && <Check className="w-4 h-4 text-green-500" />}
        </button>
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                >
                    <div className="p-4 pl-12 border-t border-white/5 bg-black/20">
                        {children}
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </div>
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
    services,
    eventList,
    activeSection,
    setActiveSection
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
    services: Service[],
    eventList: Record<string, ActionTrigger[]>,
    activeSection: string | null,
    setActiveSection: (id: string | null) => void
}) => {
    const isActive = activeSection === id;
    const isCompleted = service && event && (event.configFields.length === 0 || Object.keys(config).length > 0);

    // Inner Accordion State
    const [openSubStep, setOpenSubStep] = useState<string>('app'); // 'app', 'account', 'config', 'test'

    return (
        <div className={`relative transition-all duration-300 ${isActive ? 'my-4' : 'my-2'}`}>
            <div
                className={`
                    w-full bg-[#1e293b] border rounded-2xl overflow-hidden transition-all
                    ${isActive ? 'border-blue-500 ring-1 ring-blue-500/50 shadow-xl shadow-blue-900/20' : 'border-white/10 hover:border-white/20'}
                `}
            >
                {/* Main Card Header */}
                <div
                    onClick={() => setActiveSection(isActive ? null : id)}
                    className="p-4 flex items-center justify-between cursor-pointer bg-[#1e293b] z-10 relative"
                >
                    <div className="flex items-center gap-4">
                        <div className={`
                            w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm
                            ${isCompleted ? 'bg-green-500 text-white' : 'bg-slate-700 text-slate-300'}
                        `}>
                            {isCompleted ? <Check className="w-5 h-5" /> : number}
                        </div>

                        <div className="flex flex-col">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                                {type === 'trigger' ? '1. Déclencheur' : `${number}. Action`}
                            </span>
                            <div className="flex items-center gap-2">
                                {service ? (
                                    <div className="flex items-center gap-2">
                                        <img src={service.icon_url} alt={service.name} className="w-4 h-4 object-contain" />
                                        <span className="font-semibold">{service.name}</span>
                                        {event && (
                                            <>
                                                <span className="text-slate-500">•</span>
                                                <span className="text-slate-300">{event.name}</span>
                                            </>
                                        )}
                                    </div>
                                ) : (
                                    <span className="font-semibold text-slate-300">{title}</span>
                                )}
                            </div>
                        </div>
                    </div>
                    <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform ${isActive ? 'rotate-180' : ''}`} />
                </div>

                {/* Expanded Content - The Zapier "Inner Accordion" */}
                <AnimatePresence>
                    {isActive && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="border-t border-white/10 bg-[#0f1724]/50"
                        >
                            {/* 1. Application */}
                            <SubStep
                                title="Application"
                                isOpen={openSubStep === 'app'}
                                isCompleted={!!service}
                                onClick={() => setOpenSubStep(openSubStep === 'app' ? '' : 'app')}
                            >
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-zinc-400 uppercase">Application</label>
                                        {!service ? (
                                            renderServiceGrid(services, (s) => { setService(s); setOpenSubStep('account'); })
                                        ) : (
                                            <div className="flex items-center justify-between bg-white/5 p-3 rounded-lg border border-white/10">
                                                <div className="flex items-center gap-3">
                                                    <img src={service.icon_url} alt={service.name} className="w-5 h-5 object-contain" />
                                                    <span className="font-medium">{service.name}</span>
                                                </div>
                                                <button onClick={() => { setService(null); setEvent(null); }} className="text-xs text-blue-400 hover:underline">Changer</button>
                                            </div>
                                        )}
                                    </div>

                                    {service && (
                                        <button
                                            onClick={() => setOpenSubStep('account')}
                                            className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium text-sm"
                                        >
                                            Continuer
                                        </button>
                                    )}
                                </div>
                            </SubStep>

                            {/* 2. Account */}
                            <SubStep
                                title="Account"
                                isOpen={openSubStep === 'account'}
                                isCompleted={!!service} // Mocked: assume connected if service selected
                                onClick={() => setOpenSubStep(openSubStep === 'account' ? '' : 'account')}
                            >
                                <div className="space-y-4">
                                    <p className="text-sm text-zinc-400">
                                        {service?.connected
                                            ? `Vote compte ${service.name} est connecté.`
                                            : `Veuillez connecter votre compte ${service?.name || 'Service'}.`
                                        }
                                    </p>

                                    {service ? (
                                        service.connected ? (
                                            <div className="flex items-center gap-3 p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                                                <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white font-bold">
                                                    {service.name[0]}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-white">Mon Compte {service.name}</p>
                                                    <p className="text-xs text-green-400">Connecté</p>
                                                </div>
                                                <button className="ml-auto text-xs text-zinc-400 hover:text-white">Déconnecter</button>
                                            </div>
                                        ) : (
                                            <button
                                                onClick={async () => {
                                                    // Public/No-Auth services
                                                    if (service.requires_auth === false) {
                                                        // Auto-connect and advance
                                                        setServices(services.map(s =>
                                                            s.id === service.id ? { ...s, connected: true } : s
                                                        ));
                                                        setOpenSubStep('config');
                                                        return;
                                                    }

                                                    // OAuth services
                                                    if (service.name === 'github') {
                                                        window.location.href = '/auth/github/';
                                                    } else if (service.name === 'google' || service.name === 'gmail' || service.name === 'google-drive') {
                                                        // Use generic Google OAuth
                                                        const clientId = '602064877944-dluafa255opf8sns4i7imqov0h40rcr2.apps.googleusercontent.com';
                                                        const redirectUri = 'http://localhost:8081/oauth/google/callback';
                                                        const base = 'https://accounts.google.com/o/oauth2/v2/auth';
                                                        const params = new URLSearchParams({
                                                            client_id: clientId,
                                                            redirect_uri: redirectUri,
                                                            response_type: 'code',
                                                            scope: 'openid email profile https://mail.google.com/ https://www.googleapis.com/auth/drive',
                                                            access_type: 'offline',
                                                            prompt: 'consent',
                                                        });
                                                        window.location.href = `${base}?${params.toString()}`;
                                                    } else {
                                                        alert("OAuth non configuré pour ce service");
                                                    }
                                                }}
                                                className={`w-full py-3 ${service.requires_auth === false ? 'bg-green-600 hover:bg-green-500 text-white' : 'bg-white hover:bg-zinc-200 text-black'} rounded-lg font-bold text-sm transition-colors flex items-center justify-center gap-2`}
                                            >
                                                {service.requires_auth === false ? 'Toujours Actif' : `Se connecter avec ${service.name}`}
                                            </button>
                                        )
                                    ) : (
                                        <div className="p-3 bg-white/5 border border-white/10 rounded-lg text-sm text-zinc-500 italic">
                                            Veuillez d'abord choisir une application.
                                        </div>
                                    )}

                                    {service?.connected && (
                                        <button
                                            onClick={() => setOpenSubStep('config')}
                                            className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium text-sm"
                                        >
                                            Continuer
                                        </button>
                                    )}
                                </div>
                            </SubStep>

                            {/* 3. Trigger/Action Config */}
                            <SubStep
                                title={type === 'trigger' ? 'Trigger' : 'Action'}
                                isOpen={openSubStep === 'config'}
                                isCompleted={event ? (event.configFields.length === 0 || Object.keys(config).length > 0) : false}
                                onClick={() => setOpenSubStep(openSubStep === 'config' ? '' : 'config')}
                            >
                                <div className="space-y-4">
                                    {/* Event Selection if not selected */}
                                    {!event ? (
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-zinc-400 uppercase">Événement</label>
                                            {service ? (
                                                renderEventList(service, eventList, (e) => { setEvent(e); })
                                            ) : (
                                                <p className="text-sm text-zinc-500 italic">Veuillez d'abord choisir un service.</p>
                                            )}
                                        </div>
                                    ) : (
                                        // Selected Event Display
                                        <div className="space-y-4">
                                            <div className="flex items-center justify-between bg-white/5 p-3 rounded-lg border border-white/10">
                                                <div>
                                                    <span className="font-medium block text-white">{event.name}</span>
                                                    <span className="text-xs text-zinc-400">{event.description}</span>
                                                </div>
                                                <button onClick={() => setEvent(null)} className="text-xs text-blue-400 hover:underline">Changer</button>
                                            </div>

                                            {/* Config Form */}
                                            {renderConfigForm(
                                                event.configFields,
                                                config,
                                                (k, v) => setConfig({ ...config, [k]: v })
                                            )}

                                            <button
                                                onClick={() => setOpenSubStep('test')}
                                                className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium text-sm mt-4"
                                            >
                                                Continuer
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </SubStep>

                            {/* 4. Test */}
                            <SubStep
                                title="Test"
                                isOpen={openSubStep === 'test'}
                                isCompleted={false} // Always allow re-test
                                onClick={() => setOpenSubStep(openSubStep === 'test' ? '' : 'test')}
                            >
                                <div className="space-y-4">
                                    <div className="p-4 bg-zinc-950 border border-white/10 rounded-lg font-mono text-xs text-zinc-400">
                                        <p>// Simulation des données</p>
                                        <p>{`{`}</p>
                                        <p className="pl-4">"id": "evt_123456",</p>
                                        <p className="pl-4">"timestamp": "{new Date().toISOString()}",</p>
                                        <p className="pl-4">"source": "{service?.name || 'unknown'}"</p>
                                        <p>{`}`}</p>
                                    </div>
                                    <button
                                        onClick={() => {
                                            // Close this card and open next
                                            if (type === 'trigger') setActiveSection('action-0');
                                            else setActiveSection(null);
                                        }}
                                        className="w-full py-2 bg-white text-black hover:bg-zinc-200 rounded-lg font-bold text-sm flex items-center justify-center gap-2"
                                    >
                                        <Play className="w-4 h-4" /> Tester et Continuer
                                    </button>
                                </div>
                            </SubStep>

                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};


export default function CreateAreaPage() {
    const router = useRouter();
    const [activeSection, setActiveSection] = useState<string | null>('trigger');

    // Dynamic Data State
    const [services, setServices] = useState<Service[]>([]);
    const [triggersList, setTriggersList] = useState<Record<string, ActionTrigger[]>>({});
    const [actionsList, setActionsList] = useState<Record<string, ActionTrigger[]>>({});

    useEffect(() => {
        const fetchServices = async () => {
            try {
                const token = localStorage.getItem('access_token');
                const headers: HeadersInit = {};
                if (token) {
                    headers['Authorization'] = `Bearer ${token}`;
                } else {
                    console.warn("No access token found, fetching public service list");
                }

                let res = await fetch('http://localhost:8080/services/', { headers });

                // If token is invalid (401), retry without token
                if (res.status === 401 && token) {
                    console.warn("Token expired or invalid, retrying as anonymous");
                    localStorage.removeItem('access_token');
                    res = await fetch('http://localhost:8080/services/');
                }

                if (!res.ok) {
                    console.error("Failed to fetch services:", res.status, res.statusText);
                    return;
                }

                const data = await res.json();

                const newServices: Service[] = [];
                const newTriggers: Record<string, ActionTrigger[]> = {};
                const newActions: Record<string, ActionTrigger[]> = {};

                for (const s of data) {
                    // Use slug as ID (e.g., 'anime') to match template/URL params
                    const serviceWithSlugId = { ...s, id: s.name };
                    newServices.push(serviceWithSlugId);

                    try {
                        const detailRes = await fetch(`http://localhost:8080/services/${s.id}/`, { headers });
                        if (detailRes.ok) {
                            const details = await detailRes.json();
                            newTriggers[s.name] = (details.actions || []).map((a: any) => ({
                                id: a.name,
                                serviceId: s.name,
                                name: a.display_name || a.name,
                                description: a.description,
                                configFields: mapParamsToConfigFields(a.params)
                            }));
                            newActions[s.name] = (details.reactions || []).map((r: any) => ({
                                id: r.name,
                                serviceId: s.name,
                                name: r.display_name || r.name,
                                description: r.description,
                                configFields: mapParamsToConfigFields(r.params)
                            }));
                        }
                    } catch (e) {
                        console.error(`Failed to fetch details for ${s.name}`, e);
                    }
                }

                setServices(newServices);
                setTriggersList(newTriggers);
                setActionsList(newActions);

            } catch (error) {
                console.error("Failed to fetch services", error);
            }
        };

        fetchServices();
    }, []);

    // Handle Template (Query Params)
    const searchParams = useSearchParams();
    useEffect(() => {
        if (services.length === 0) return; // Wait for services to load

        const tS = searchParams.get('tS'); // Trigger Service ID
        const tE = searchParams.get('tE'); // Trigger Event ID
        const aS = searchParams.get('aS'); // Action Service ID
        const aE = searchParams.get('aE'); // Action Event ID

        if (tS && tE && aS && aE) {
            // find trigger service
            const triggerSvc = services.find(s => s.id === tS);
            if (triggerSvc) {
                setTriggerService(triggerSvc);

                // If service is public, verify connected immediately (for wizard UI)
                // if (triggerSvc.requires_auth === false) ... handled by UI logic usually

                // Find trigger event
                const tEventList = triggersList[tS] || [];
                const triggerEvt = tEventList.find(e => e.id === tE);
                if (triggerEvt) {
                    setTriggerEvent(triggerEvt);
                }
            }

            // find action service
            const actionSvc = services.find(s => s.id === aS);
            const aEventList = actionsList[aS] || [];
            const actionEvt = aEventList.find(e => e.id === aE);

            if (actionSvc && actionEvt) {
                setActions([{
                    id: 'action-0',
                    service: actionSvc,
                    event: actionEvt,
                    config: {}
                }]);

                // If everything is found, we could potentially set active section
                // e.g., if trigger auth needed, stay on trigger. otherwise go to action.
                setActiveSection('trigger');
            }
        }
    }, [services, triggersList, actionsList, searchParams]);

    const [triggerService, setTriggerService] = useState<Service | null>(null);
    const [triggerEvent, setTriggerEvent] = useState<ActionTrigger | null>(null);
    const [triggerConfig, setTriggerConfig] = useState<Record<string, string>>({});

    const [actions, setActions] = useState<{
        id: string,
        service: Service | null,
        event: ActionTrigger | null,
        config: Record<string, string>
    }[]>([
        { id: 'action-0', service: null, event: null, config: {} }
    ]);

    const [areaName, setAreaName] = useState("");

    const handleSave = async () => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            router.push('/login');
            return;
        }

        let successCount = 0;
        let errorCount = 0;

        // Create one AREA per action (1-to-N mapping via multiple 1-to-1)
        for (const action of actions) {
            if (!action.service || !action.event) continue;

            const payload = {
                name: areaName || "Untitled Workflow",
                action_service_id: triggerService?.id,
                action_name: triggerEvent?.id,
                action_config: triggerConfig,
                reaction_service_id: action.service.id,
                reaction_name: action.event.id,
                reaction_config: action.config
            };

            try {
                const res = await fetch('http://localhost:8080/areas/', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(payload)
                });

                if (res.ok) successCount++;
                else {
                    console.error("Failed to create area", await res.text());
                    errorCount++;
                }
            } catch (e) {
                console.error("Error creating area", e);
                errorCount++;
            }
        }

        if (successCount > 0) {
            router.push(`/dashboard?success=created&count=${successCount}`);
        } else {
            alert("Erreur lors de la création de l'AREA.");
        }
    };

    return (
        <div className="min-h-screen bg-[var(--background)] text-white p-6 pb-32 md:p-12">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <button onClick={() => router.back()} className="flex items-center text-zinc-400 hover:text-white mb-4 transition-colors">
                            <ChevronLeft className="w-4 h-4 mr-1" /> Retour
                        </button>
                        <h1 className="text-3xl font-bold">Créer une nouvelle AREA</h1>
                        <p className="text-zinc-400 mt-1">Configurez vos automatisations en quelques étapes simples.</p>
                    </div>
                </div>

                {/* AREA Name Input */}
                <div className="bg-[#1e293b] border border-white/10 rounded-2xl p-6">
                    <label className="block text-xs font-bold text-zinc-400 uppercase mb-2">Nom de l'AREA (Optionnel)</label>
                    <input
                        type="text"
                        placeholder="Ex: Ma Super Automatisation"
                        value={areaName}
                        onChange={(e) => setAreaName(e.target.value)}
                        className="w-full bg-black/20 border border-white/10 rounded-lg px-4 py-3 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    />
                </div>

                {/* Steps Container */}
                <div className="space-y-6 relative">
                    {/* Connecting Line */}
                    <div className="absolute left-8 top-8 bottom-8 w-0.5 bg-gradient-to-b from-blue-500/20 via-purple-500/20 to-transparent -z-10" />

                    {/* Step 1: Trigger */}
                    <StepCard
                        id="trigger"
                        type="trigger"
                        number={1}
                        title="Choisissez un Déclencheur"
                        service={triggerService}
                        event={triggerEvent}
                        config={triggerConfig}
                        setService={setTriggerService}
                        setEvent={setTriggerEvent}
                        setConfig={setTriggerConfig}
                        services={services}
                        eventList={triggersList}
                        activeSection={activeSection}
                        setActiveSection={setActiveSection}
                    />

                    {/* Step 2: Actions */}
                    {actions.map((action, index) => (
                        <StepCard
                            key={action.id}
                            id={action.id}
                            type="action"
                            number={index + 2}
                            title="Choisissez une Action"
                            service={action.service}
                            event={action.event}
                            config={action.config}
                            setService={(s) => {
                                const newActions = [...actions];
                                newActions[index].service = s;
                                // Reset event/config if service changes
                                if (s?.id !== action.service?.id) {
                                    newActions[index].event = null;
                                    newActions[index].config = {};
                                }
                                setActions(newActions);
                            }}
                            setEvent={(e) => {
                                const newActions = [...actions];
                                newActions[index].event = e;
                                setActions(newActions);
                            }}
                            setConfig={(c) => {
                                const newActions = [...actions];
                                newActions[index].config = c;
                                setActions(newActions);
                            }}
                            services={services}
                            eventList={actionsList}
                            activeSection={activeSection}
                            setActiveSection={setActiveSection}
                        />
                    ))}

                    {/* Add Action Button (Optional - sticking to 1-to-1 for now but structure supports N) */}
                    {/* 
                    <button 
                        onClick={() => setActions([...actions, { id: `action-${actions.length}`, service: null, event: null, config: {} }])}
                        className="ml-16 flex items-center gap-2 text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors"
                    >
                        <Plus className="w-4 h-4" /> Ajouter une autre action
                    </button>
                    */}
                </div>
            </div>

            {/* Sticky Footer */}
            <div className="fixed bottom-0 left-0 right-0 p-6 bg-[#0f1724]/80 backdrop-blur-xl border-t border-white/10 z-50">
                <div className="max-w-4xl mx-auto flex items-center justify-between">
                    <div className="text-sm font-medium text-zinc-400">
                        {triggerService && triggerEvent ? (
                            <span className="text-green-400 flex items-center gap-2">
                                <Check className="w-4 h-4" /> Prêt à être publié
                            </span>
                        ) : (
                            <span>Complétez les étapes pour continuer</span>
                        )}
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={!triggerService || !triggerEvent || !actions[0].service || !actions[0].event}
                        className={`
                            px-8 py-3 rounded-xl font-bold text-sm shadow-lg transition-all flex items-center gap-2
                            ${triggerService && triggerEvent && actions[0].service && actions[0].event
                                ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-blue-500/25'
                                : 'bg-zinc-800 text-zinc-500 cursor-not-allowed'
                            }
                        `}
                    >
                        <Save className="w-4 h-4" />
                        Publier l'AREA
                    </button>
                </div>
            </div>
        </div>
    );
}
