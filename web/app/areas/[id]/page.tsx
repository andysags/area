"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Trash2, Zap, ArrowRight, Play, Pause } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AreaDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params.id;

    const [area, setArea] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        const fetchArea = async () => {
            const token = localStorage.getItem('access_token');
            if (!token) {
                router.push('/login');
                return;
            }

            try {
                const res = await fetch(`http://localhost:8080/areas/${id}/`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (res.ok) {
                    const data = await res.json();
                    setArea(data);
                } else {
                    setError("Impossible de charger le workflow.");
                }
            } catch (e) {
                setError("Erreur de connexion.");
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchArea();
    }, [id, router]);

    const handleDelete = async () => {
        if (!confirm("Voulez-vous vraiment supprimer ce workflow ?")) return;

        const token = localStorage.getItem('access_token');
        try {
            const res = await fetch(`http://localhost:8080/areas/${id}/`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (res.ok) {
                router.push('/dashboard?success=deleted');
            } else {
                alert("Erreur lors de la suppression.");
            }
        } catch (e) {
            alert("Erreur réseau.");
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center text-white">Chargement...</div>;
    if (error) return <div className="min-h-screen flex items-center justify-center text-red-500">{error}</div>;
    if (!area) return null;

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex items-center justify-between">
                    <Link href="/dashboard" className="flex items-center text-zinc-400 hover:text-white transition-colors">
                        <ArrowLeft className="h-5 w-5 mr-2" /> Retour au Dashboard
                    </Link>
                    <button
                        onClick={handleDelete}
                        className="flex items-center px-4 py-2 bg-red-500/10 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors text-sm font-medium"
                    >
                        <Trash2 className="h-4 w-4 mr-2" /> Supprimer
                    </button>
                </div>

                {/* Title */}
                <div>
                    <h1 className="text-3xl font-bold">{area.name || "Untitled Workflow"}</h1>
                    <p className="text-zinc-500 mt-2 text-sm font-mono">ID: {area.id}</p>
                </div>

                {/* Status Card */}
                <div className="bg-zinc-900/50 border border-white/10 rounded-xl p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-full ${area.enabled ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-500/10 text-zinc-500'}`}>
                            {area.enabled ? <Play className="h-6 w-6" /> : <Pause className="h-6 w-6" />}
                        </div>
                        <div>
                            <h3 className="font-semibold">{area.enabled ? "Actif" : "En pause"}</h3>
                            <p className="text-sm text-zinc-400">{area.enabled ? "Ce workflow s'exécute automatiquement." : "Ce workflow est désactivé."}</p>
                        </div>
                    </div>
                </div>

                {/* Configuration Grid */}
                <div className="grid md:grid-cols-2 gap-8">
                    {/* Trigger */}
                    <div className="bg-zinc-900/30 border border-white/10 rounded-xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Zap className="h-24 w-24" />
                        </div>
                        <h3 className="text-sm font-bold text-blue-400 uppercase tracking-wider mb-4">Déclencheur</h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <span className="text-xl font-bold">{area.action?.service?.name}</span>
                            </div>
                            <div className="bg-black/50 rounded-lg p-4 font-mono text-sm text-zinc-300">
                                <p className="text-zinc-500 mb-2">Event: {area.action_name}</p>
                                <pre>{JSON.stringify(area.action_config, null, 2)}</pre>
                            </div>
                        </div>
                    </div>

                    {/* Action */}
                    <div className="bg-zinc-900/30 border border-white/10 rounded-xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                            <Zap className="h-24 w-24" />
                        </div>
                        <h3 className="text-sm font-bold text-purple-400 uppercase tracking-wider mb-4">Action</h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <span className="text-xl font-bold">{area.reaction?.service?.name}</span>
                            </div>
                            <div className="bg-black/50 rounded-lg p-4 font-mono text-sm text-zinc-300">
                                <p className="text-zinc-500 mb-2">Event: {area.reaction_name}</p>
                                <pre>{JSON.stringify(area.reaction_config, null, 2)}</pre>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
