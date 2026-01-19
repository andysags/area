"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Search,
    ArrowRight,
    Star,
    TrendingUp,
    Clock,
    Zap,
    Github,
    Mail,
    Music,
    MessageSquare,
    Cloud,
    CheckCircle2,
    Instagram,
    Twitter,
    Youtube,
    Slack,
    Database
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import useAuthClient from '../hooks/useAuthClient';

// --- Types ---
type Template = {
    id: string;
    title: string;
    description: string;
    users: string;
    tags: string[];
    color: string;
    icon: React.ElementType;
    category: 'Productivity' | 'Social' | 'DevOps' | 'Entertainment' | 'Other';
    // Configuration
    triggerServiceId: string;
    triggerEventId: string;
    actionServiceId: string;
    actionEventId: string;
};

// --- Mock Data ---
// Real Data based on Implemented Services
const ALL_TEMPLATES: Template[] = [
    {
        id: '1',
        title: 'Nouvel Épisode Anime vers Discord',
        description: 'Recevoir une notification sur Discord quand un nouvel épisode d\'anime sort.',
        users: '20k+',
        tags: ['Entertainment', 'Social'],
        color: 'from-orange-500 to-red-500',
        icon: MessageSquare,
        category: 'Entertainment',
        // Template Config
        triggerServiceId: 'anime',
        triggerEventId: 'new_anime_airing',
        actionServiceId: 'discord',
        actionEventId: 'send_message'
    },
    {
        id: '2',
        title: 'Sauvegarder musique Spotify en Playlist',
        description: 'Ajoute automatiquement vos titres likés dans une playlist spécifique.',
        users: '15k+',
        tags: ['Music', 'Productivity'],
        color: 'from-green-500 to-green-300',
        icon: Music,
        category: 'Entertainment',
        triggerServiceId: 'spotify',
        triggerEventId: 'new_saved_track',
        actionServiceId: 'spotify',
        actionEventId: 'add_to_playlist'
    },
    {
        id: '3',
        title: 'Notifier PR GitHub sur Discord',
        description: 'Envoyer un message Discord pour chaque nouvelle Pull Request.',
        users: '8k+',
        tags: ['DevOps', 'Social'],
        color: 'from-gray-800 to-indigo-500',
        icon: Github,
        category: 'DevOps',
        triggerServiceId: 'github',
        triggerEventId: 'new_pull_request',
        actionServiceId: 'discord',
        actionEventId: 'send_message'
    },
    {
        id: '4',
        title: 'Image IA depuis Musique Spotify',
        description: 'Générer une image unique avec Flux AI basée sur vos titres Spotify favoris.',
        users: '12k+',
        tags: ['Creative', 'AI'],
        color: 'from-purple-500 to-pink-500',
        icon: Cloud,
        category: 'Entertainment',
        triggerServiceId: 'spotify',
        triggerEventId: 'new_saved_track',
        actionServiceId: 'image_gen',
        actionEventId: 'generate_image'
    },
    {
        id: '5',
        title: 'Actualité Jeux Vidéo Hebdo',
        description: 'Recevoir les dernières news jeux vidéo chaque semaine par email.', // Or Log for now if email complex
        users: '5k+',
        tags: ['Gaming', 'News'],
        color: 'from-blue-600 to-cyan-400',
        icon: Zap,
        category: 'Entertainment',
        triggerServiceId: 'timer',
        triggerEventId: 'every_day', // Simulate weekly with daily/cron
        actionServiceId: 'games',
        actionEventId: 'get_game_news'
    },
    {
        id: '6',
        title: 'Veille Anime Quotidienne',
        description: 'Vérifier chaque jour les sorties d\'animes et les loguer.',
        users: '3k+',
        tags: ['Anime', 'Productivity'],
        color: 'from-pink-500 to-orange-400',
        icon: Clock,
        category: 'Entertainment',
        triggerServiceId: 'timer',
        triggerEventId: 'every_day',
        actionServiceId: 'anime', // Anime has get_anime_details reaction
        actionEventId: 'get_anime_details'
    }
];

// --- Animation Variants ---
const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.05
        }
    }
};

const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
};

export default function ExplorerPage() {
    const router = useRouter();
    const { isAuthenticated } = useAuthClient();
    const [activeTab, setActiveTab] = useState<'featured' | 'popular' | 'newest'>('featured');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedTag, setSelectedTag] = useState<string | null>(null);

    // Filter Logic
    const filteredTemplates = useMemo(() => {
        let data = [...ALL_TEMPLATES];

        // 1. Filter by Tab (Mock logic for demo purposes)
        if (activeTab === 'popular') {
            data = data.sort((a, b) => parseInt(b.users) - parseInt(a.users));
        } else if (activeTab === 'newest') {
            // Just reverse for "newest" mock
            data = [...data].reverse();
        } else {
            // Featured: specific subset or default order
            data = data.filter((_, i) => i % 2 === 0 || i < 5);
        }

        // 2. Filter by Search
        if (searchQuery) {
            const q = searchQuery.toLowerCase();
            data = ALL_TEMPLATES.filter(t =>
                t.title.toLowerCase().includes(q) ||
                t.description.toLowerCase().includes(q) ||
                t.tags.some(tag => tag.toLowerCase().includes(q))
            );
        }

        // 3. Filter by Tag
        if (selectedTag) {
            data = data.filter(t => t.tags.includes(selectedTag));
        }

        return data;
    }, [activeTab, searchQuery, selectedTag]);

    const handleUseTemplate = (templateId: string) => {
        if (!isAuthenticated) {
            router.push('/login');
            return;
        }
        // Redirect to create page with template params
        const template = ALL_TEMPLATES.find(t => t.id === templateId);
        if (!template) return;

        const params = new URLSearchParams({
            tS: template.triggerServiceId,
            tE: template.triggerEventId,
            aS: template.actionServiceId,
            aE: template.actionEventId
        });

        router.push(`/create?${params.toString()}`);
    };

    return (
        <div className="min-h-screen bg-[var(--background)] text-white p-6 md:p-12">
            <div className="max-w-7xl mx-auto space-y-12">

                {/* Header */}
                <div className="text-center space-y-6 pt-8">
                    <motion.h1
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500"
                    >
                        Explorer les Automatisations
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-zinc-400 max-w-2xl mx-auto text-lg"
                    >
                        Découvrez des modèles populaires créés par la communauté pour booster votre productivité.
                    </motion.p>
                </div>

                {/* Controls: Search & Tabs */}
                <div className="flex flex-col md:flex-row gap-6 justify-between items-center sticky top-20 z-10 bg-black/50 backdrop-blur-xl p-4 rounded-2xl border border-white/10 shadow-2xl">

                    {/* Tabs */}
                    <div className="flex bg-white/5 p-1 rounded-xl border border-white/5">
                        {[
                            { id: 'featured', label: 'À la une', icon: Star },
                            { id: 'popular', label: 'Populaires', icon: TrendingUp },
                            { id: 'newest', label: 'Nouveautés', icon: Clock },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => {
                                    setActiveTab(tab.id as any);
                                    setSelectedTag(null);
                                    setSearchQuery('');
                                }}
                                className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.id
                                        ? 'bg-blue-600 text-white shadow-lg'
                                        : 'text-zinc-400 hover:text-white hover:bg-white/5'
                                    }`}
                            >
                                <tab.icon className="w-4 h-4 mr-2" />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <div className="relative w-full md:w-96 group">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-zinc-500 group-focus-within:text-blue-400 transition-colors h-5 w-5" />
                        <input
                            type="text"
                            placeholder="Rechercher un modèle..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-black/40 border border-white/10 rounded-xl py-2.5 pl-10 pr-4 text-white placeholder-zinc-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all"
                        />
                    </div>
                </div>

                {/* Active Filters Display */}
                {selectedTag && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="flex items-center gap-2"
                    >
                        <span className="text-zinc-400 text-sm">Filtre actif:</span>
                        <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded-full text-sm flex items-center gap-2 border border-blue-500/30">
                            #{selectedTag}
                            <button onClick={() => setSelectedTag(null)} className="hover:text-white">×</button>
                        </span>
                    </motion.div>
                )}

                {/* Grid */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeTab + searchQuery + selectedTag}
                        variants={container}
                        initial="hidden"
                        animate="show"
                        exit={{ opacity: 0, y: 20 }}
                        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                    >
                        {filteredTemplates.length > 0 ? (
                            filteredTemplates.map((template) => (
                                <motion.div
                                    key={template.id}
                                    variants={item}
                                    whileHover={{ y: -8, scale: 1.01 }}
                                    className="group relative bg-zinc-900/50 backdrop-blur-sm border border-white/5 rounded-2xl overflow-hidden hover:border-white/20 hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-300 flex flex-col"
                                >
                                    {/* Gradient Header */}
                                    <div className={`h-2 bg-gradient-to-r ${template.color}`} />

                                    <div className="p-6 flex flex-col flex-grow space-y-4">
                                        {/* Header: Icon & Users */}
                                        <div className="flex justify-between items-start">
                                            <div className={`p-3 rounded-xl bg-gradient-to-br ${template.color} bg-opacity-10`}>
                                                <template.icon className="w-6 h-6 text-white" />
                                            </div>
                                            <div className="flex items-center text-xs font-medium text-zinc-500 bg-white/5 px-2 py-1 rounded-full">
                                                <CheckCircle2 className="w-3 h-3 mr-1 text-green-500" />
                                                {template.users} util.
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="space-y-2 flex-grow">
                                            <h3 className="font-bold text-xl text-zinc-100 group-hover:text-blue-400 transition-colors">
                                                {template.title}
                                            </h3>
                                            <p className="text-sm text-zinc-400 leading-relaxed">
                                                {template.description}
                                            </p>
                                        </div>

                                        {/* Tags */}
                                        <div className="flex flex-wrap gap-2 pt-2">
                                            {template.tags.map(tag => (
                                                <button
                                                    key={tag}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setSelectedTag(tag);
                                                    }}
                                                    className="text-xs font-medium px-2.5 py-1 rounded-md bg-white/5 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors border border-white/5"
                                                >
                                                    #{tag}
                                                </button>
                                            ))}
                                        </div>

                                        {/* Action Button */}
                                        <div className="pt-4 mt-auto">
                                            <button
                                                onClick={() => handleUseTemplate(template.id)}
                                                className="w-full flex items-center justify-center gap-2 bg-white/5 hover:bg-blue-600 text-white py-2.5 rounded-xl font-medium transition-all duration-300 group-hover:shadow-lg group-hover:shadow-blue-600/20 border border-white/10 group-hover:border-transparent"
                                            >
                                                Utiliser ce modèle
                                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-20">
                                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-white/5 mb-4">
                                    <Search className="w-8 h-8 text-zinc-600" />
                                </div>
                                <h3 className="text-xl font-medium text-white mb-2">Aucun résultat trouvé</h3>
                                <p className="text-zinc-500">Essayez de modifier vos termes de recherche ou vos filtres.</p>
                                <button
                                    onClick={() => { setSearchQuery(''); setSelectedTag(null); }}
                                    className="mt-4 text-blue-400 hover:text-blue-300 text-sm font-medium"
                                >
                                    Effacer les filtres
                                </button>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}