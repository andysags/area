"use client";

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Plus, Search, MoreVertical, Power, Edit2, Trash2, ArrowRight, Loader2 } from 'lucide-react';
import Link from 'next/link';
import useAuthClient from '../hooks/useAuthClient';

interface Area {
    id: string; // UUID
    name: string;
    enabled: boolean;
    action: {
        name: string;
        service: {
            name: string;
            icon_url?: string;
        }
    };
    reaction: {
        name: string;
        service: {
            name: string;
            icon_url?: string;
        }
    };
}

export default function AreasPage() {
    const { token } = useAuthClient();
    const [areas, setAreas] = useState<Area[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchAreas = async () => {
        if (!token) return;
        try {
            const response = await fetch('http://localhost:8080/areas/', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            if (response.ok) {
                const data = await response.json();
                setAreas(data);
            }
        } catch (err) {
            console.error("Failed to fetch AREAs", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAreas();
    }, [token]);

    const toggleArea = async (id: string, currentEnabled: boolean) => {
        try {
            const response = await fetch(`http://localhost:8080/areas/${id}/`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ enabled: !currentEnabled })
            });
            if (response.ok) {
                setAreas(areas.map(area =>
                    area.id === id ? { ...area, enabled: !currentEnabled } : area
                ));
            }
        } catch (err) {
            console.error("Failed to toggle AREA", err);
        }
    };

    const deleteArea = async (id: string) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette AREA ?')) {
            try {
                const response = await fetch(`http://localhost:8080/areas/${id}/`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                });
                if (response.ok) {
                    setAreas(areas.filter(a => a.id !== id));
                }
            } catch (err) {
                console.error("Failed to delete AREA", err);
            }
        }
    };

    const filteredAreas = areas.filter(area =>
        area.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#0f1724] text-white p-8">
            <div className="max-w-6xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">
                            Mes AREAs
                        </h1>
                        <p className="text-zinc-400 mt-1">Gérez vos automatisations actives</p>
                    </div>
                    <Link
                        href="/create"
                        className="flex items-center gap-2 bg-white text-black px-4 py-2 rounded-lg font-medium hover:bg-zinc-200 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        Créer une AREA
                    </Link>
                </div>

                {/* Search */}
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500" />
                    <input
                        type="text"
                        placeholder="Rechercher une automation..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-zinc-900/50 border border-white/10 rounded-xl pl-10 pr-4 py-3 text-white placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-white/20 transition-all"
                    />
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAreas.map((area) => (
                        <motion.div
                            key={area.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`group relative bg-zinc-900/50 border ${area.enabled ? 'border-white/10' : 'border-white/5'} rounded-2xl p-6 hover:border-white/20 transition-all duration-300`}
                        >
                            {/* Status Indicator */}
                            <div className={`absolute top-6 right-6 w-2 h-2 rounded-full ${area.enabled ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : 'bg-zinc-700'}`} />

                            {/* Services Icons */}
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-500/30 flex items-center justify-center text-white font-bold text-xs">
                                    {area.action?.service?.name?.substring(0, 2).toUpperCase() || "??"}
                                </div>
                                <ArrowRight className="w-4 h-4 text-zinc-600" />
                                <div className="w-10 h-10 rounded-xl bg-green-500/20 border border-green-500/30 flex items-center justify-center text-white font-bold text-xs">
                                    {area.reaction?.service?.name?.substring(0, 2).toUpperCase() || "??"}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="mb-6">
                                <h3 className="text-lg font-semibold mb-1 group-hover:text-blue-400 transition-colors">
                                    {area.name || "Workflow"}
                                </h3>
                                <p className="text-sm text-zinc-400 line-clamp-2">
                                    {area.action?.service?.name} → {area.action?.name} | {area.reaction?.service?.name} → {area.reaction?.name}
                                </p>
                            </div>

                            {/* Footer Actions */}
                            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                                <span className="text-xs text-zinc-500 font-mono">
                                    ID: {area.id.toString().substring(0, 8)}...
                                </span>

                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => toggleArea(area.id, area.enabled)}
                                        className={`p-2 rounded-lg transition-colors ${area.enabled ? 'text-green-500 hover:bg-green-500/10' : 'text-zinc-500 hover:bg-zinc-800'}`}
                                        title={area.enabled ? "Désactiver" : "Activer"}
                                    >
                                        <Power className="w-4 h-4" />
                                    </button>

                                    <Link
                                        href={`/areas/${area.id}`}
                                        className="p-2 text-zinc-400 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                                        title="Détails"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </Link>

                                    <button
                                        onClick={() => deleteArea(area.id)}
                                        className="p-2 text-zinc-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                        title="Supprimer"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {filteredAreas.length === 0 && (
                    <div className="text-center py-20 text-zinc-500">
                        Aucune AREA trouvée pour cette recherche.
                    </div>
                )}

            </div>
        </div>
    );
}
