"use client";

import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Github, Mail, Calendar, MessageSquare, Cloud, Music, Video, Smartphone, Search, Filter, Check, Layout, FileText, Globe, Settings, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

// Define Service Interface matching Backend + UI needs
interface Service {
    id: string;
    name: string;
    display_name: string;
    icon_url?: string;
    actions_count: number;
    reactions_count: number;
    // UI specific fields
    icon: React.ElementType | string;
    description: string;
    color: string;
    bg: string;
    category: string;
    connected: boolean;
}

interface BackendService {
    id: string;
    name: string;
    display_name: string;
    icon_url: string;
    actions_count: number;
    reactions_count: number;
    is_connected: boolean;
}

interface BackendSubscription {
    service: string; // UUID
    service_name: string;
    expires_at: string | null;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

// Helper to map backend service names to UI config
const getServiceConfig = (name: string) => {
    const normalized = name.toLowerCase();
    switch (normalized) {
        case 'github':
            return { icon: '/github.png', color: 'text-white', bg: 'bg-white/10', category: 'Productivité', desc: 'Automatisez les issues, PRs et déploiements.' };
        case 'gmail':
            return { icon: '/communication.png', color: 'text-red-500', bg: 'bg-red-500/10', category: 'Communication', desc: 'Gérez vos emails et communications.' };
        case 'google':
            return { icon: '/icons/google.svg', color: 'text-blue-500', bg: 'bg-white/10', category: 'Productivité', desc: 'Intégration Google services.' };
        case 'google-drive':
            return { icon: '/google-drive.png', color: 'text-blue-500', bg: 'bg-blue-500/10', category: 'Stockage', desc: 'Stockez et partagez vos fichiers.' };
        case 'teams':
        case 'microsoft teams':
        case 'microsoft-teams':
            return { icon: '/teams.png', color: 'text-indigo-500', bg: 'bg-indigo-500/10', category: 'Communication', desc: 'Collaboration et visioconférence.' };
        case 'outlook':
        case 'microsoft':
            return { icon: Calendar, color: 'text-blue-500', bg: 'bg-blue-500/10', category: 'Productivité', desc: 'Gérez votre flux de travail Microsoft 365.' };
        case 'facebook':
            return { icon: '/facebook.png', color: 'text-blue-600', bg: 'bg-blue-600/10', category: 'Social', desc: 'Gérez vos pages et interactions Facebook.' };
        case 'whatsapp':
            return { icon: '/whatsapp.png', color: 'text-green-500', bg: 'bg-green-500/10', category: 'Communication', desc: 'Envoyez des messages et gérez vos contacts.' };
        case 'messenger':
            return { icon: '/messenger.png', color: 'text-blue-500', bg: 'bg-blue-500/10', category: 'Communication', desc: 'Messagerie instantanée et notifications.' };
        case 'discord':
            return { icon: '/discord.png', color: 'text-indigo-400', bg: 'bg-indigo-500/10', category: 'Social', desc: 'Envoyez des messages et gérez vos serveurs.' };
        case 'dropbox':
            return { icon: Cloud, color: 'text-blue-400', bg: 'bg-blue-400/10', category: 'Stockage', desc: 'Synchronisez vos fichiers et gérez le stockage.' };
        case 'spotify':
            return { icon: '/spotify.png', color: 'text-green-500', bg: 'bg-green-500/10', category: 'Divertissement', desc: 'Contrôlez la lecture et gérez vos playlists.' };
        case 'youtube':
            return { icon: Video, color: 'text-red-600', bg: 'bg-red-600/10', category: 'Divertissement', desc: 'Uploads, commentaires et analyses.' };
        case 'slack':
            return { icon: '/communication.png', color: 'text-purple-500', bg: 'bg-purple-500/10', category: 'Communication', desc: 'Communication et collaboration d\'équipe.' };
        case 'notion':
            return { icon: FileText, color: 'text-gray-200', bg: 'bg-gray-500/10', category: 'Productivité', desc: 'Notes, documents et gestion de projet.' };
        case 'trello':
            return { icon: Layout, color: 'text-blue-600', bg: 'bg-blue-600/10', category: 'Productivité', desc: 'Tableaux Kanban pour le suivi de projet.' };
        case 'system':
            return { icon: Settings, color: 'text-gray-400', bg: 'bg-gray-500/10', category: 'Utilitaire', desc: 'Outils système et debugging.' };
        case 'timer':
            return { icon: Calendar, color: 'text-yellow-500', bg: 'bg-yellow-500/10', category: 'Utilitaire', desc: 'Planification temporelle.' };
        default:
            return { icon: Globe, color: 'text-gray-400', bg: 'bg-gray-500/10', category: 'Autre', desc: 'Connectez votre service favori.' };
    }
};

const categories = ['Tous', 'Productivité', 'Social', 'Stockage', 'Divertissement', 'Communication', 'Autre', 'Utilitaire'];

export default function ServicesPage() {
    const [services, setServices] = useState<Service[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('Tous');
    const router = useRouter();

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('access_token');
                const headers: HeadersInit = {};
                if (token) headers['Authorization'] = `Bearer ${token}`;

                // 1. Fetch all services (with Auth to get is_connected)
                const servicesRes = await fetch(`${API_BASE}/services/`, { headers });

                if (!servicesRes.ok) throw new Error('Failed to fetch services');
                const servicesData: BackendService[] = await servicesRes.json();

                // 2. Map Services
                const mappedServices: Service[] = servicesData.map(s => {
                    const config = getServiceConfig(s.name);
                    return {
                        ...s,
                        ...config,
                        icon: s.icon_url || config.icon,
                        display_name: (config as any).displayName || s.display_name,
                        description: config.desc, // Use mapped description or fallback
                        connected: s.is_connected // Use backend source of truth
                    };
                });

                setServices(mappedServices);
            } catch (error) {
                console.error('Error loading services:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleConnect = async (service: Service) => {
        const token = localStorage.getItem('access_token');
        if (!token) {
            router.push('/login');
            return;
        }

        // Auto-connected services cannot be disconnected
        if (['system', 'timer'].includes(service.name)) return;

        if (service.connected) {
            if (!confirm(`Voulez-vous vraiment déconnecter ${service.display_name} ?`)) return;

            try {
                const res = await fetch(`${API_BASE}/services/${service.id}/unsubscribe/`, {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (res.ok) {
                    setServices(prev => prev.map(s => s.id === service.id ? { ...s, connected: false } : s));
                } else {
                    alert("Erreur lors de la déconnexion.");
                }
            } catch (e) {
                console.error("Disconnect error", e);
            }
        } else {
            // Google / Gmail / Drive / YouTube
            if (['google', 'gmail', 'google-drive', 'youtube'].includes(service.name)) {
                window.location.href = `${API_BASE}/google/connect/?next=/services`;
            }
            // GitHub / Spotify
            else if (['github', 'spotify', 'discord'].includes(service.name)) {
                try {
                    const res = await fetch(`${API_BASE}/${service.name}/connect/?next=/services`, {
                        headers: { 'Authorization': `Bearer ${token}` }
                    });
                    const data = await res.json();
                    if (data.url) window.location.href = data.url;
                } catch (e) {
                    console.error("Failed to initiate connection", e);
                }
            } else {
                alert("La connexion à ce service n'est pas encore configurée.");
            }
        }
    };

    const filteredServices = services.filter(service => {
        const matchesSearch = service.display_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            service.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'Tous' || service.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    return (
        <div className="min-h-screen bg-black text-white p-8 pt-24">
            <div className="max-w-7xl mx-auto space-y-12">

                {/* Header Section */}
                <div className="text-center space-y-6">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-600"
                    >
                        Connectez Votre Monde
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-gray-400 max-w-2xl mx-auto text-lg"
                    >
                        Choisissez parmi des centaines de services pour construire votre flux d'automatisation parfait.
                    </motion.p>
                </div>

                {/* Search and Filter Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="flex flex-col md:flex-row gap-4 justify-between items-center bg-white/5 p-4 rounded-2xl backdrop-blur-lg border border-white/10"
                >
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                        <input
                            type="text"
                            placeholder="Rechercher des services..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-black/50 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        />
                    </div>

                    <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 w-full md:w-auto no-scrollbar">
                        {categories.map(category => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap ${selectedCategory === category
                                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25'
                                    : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                                    }`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </motion.div>

                {/* Services Grid */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    </div>
                ) : (
                    <motion.div
                        layout
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
                    >
                        <AnimatePresence>
                            {filteredServices.map((service) => (
                                <motion.div
                                    layout
                                    key={service.id}
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    whileHover={{ scale: 1.02, y: -5 }}
                                    className="group relative bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-6 flex flex-col items-center text-center space-y-4 hover:bg-white/10 transition-all duration-300"
                                >
                                    <div className={`p-4 rounded-2xl ${service.bg} ${service.color} group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                                        {typeof service.icon === 'string' ? (
                                            <Image src={service.icon} alt={service.name} width={32} height={32} className="h-8 w-8 object-contain" />
                                        ) : (
                                            <service.icon className="h-8 w-8" />
                                        )}
                                    </div>

                                    <div className="space-y-1">
                                        <h3 className="font-bold text-xl text-white">{service.display_name}</h3>
                                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{service.category}</p>
                                    </div>

                                    <p className="text-sm text-gray-400 line-clamp-2">{service.description}</p>

                                    <div className="flex gap-4 text-xs text-gray-500 w-full justify-center pt-2 border-t border-white/5">
                                        <span>{service.actions_count} Actions</span>
                                        <span>•</span>
                                        <span>{service.reactions_count} Réactions</span>
                                    </div>

                                    <Button
                                        onClick={() => handleConnect(service)}
                                        disabled={['system', 'timer'].includes(service.name)}
                                        variant={service.connected ? "secondary" : "outline"}
                                        className={`w-full mt-auto transition-all duration-300 group/btn ${service.connected
                                            ? 'bg-green-500/20 text-green-400 border-green-500/50 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/50'
                                            : 'border-white/10 hover:bg-white/5 hover:text-white'
                                            }`}
                                    >
                                        {service.connected ? (
                                            ['system', 'timer'].includes(service.name) ? (
                                                <span className="flex items-center"><Check className="mr-2 h-4 w-4" /> Toujours Actif</span>
                                            ) : (
                                                <>
                                                    <span className="group-hover/btn:hidden flex items-center"><Check className="mr-2 h-4 w-4" /> Connecté</span>
                                                    <span className="hidden group-hover/btn:flex items-center"><LogOut className="mr-2 h-4 w-4" /> Déconnecter</span>
                                                </>
                                            )
                                        ) : (
                                            'Connecter'
                                        )}
                                    </Button>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </motion.div>
                )}

                {!loading && filteredServices.length === 0 && (
                    <div className="text-center py-20 text-gray-500">
                        <p>Aucun service trouvé correspondant à vos critères.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
