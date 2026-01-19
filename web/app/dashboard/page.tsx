"use client";

import React, { useEffect, useState } from 'react';
import useAuthClient from '../hooks/useAuthClient';
import Link from 'next/link';
import { Button } from '../components/ui/button';
import { motion, useSpring, useTransform } from 'framer-motion';
import { Plus, Activity, Zap, MoreHorizontal, Play, ArrowRight, CheckCircle2, TrendingUp, Clock, AlertCircle } from 'lucide-react';
import Footer from '../Footer';

function AnimatedNumber({ value }: { value: number }) {
    const spring = useSpring(0, { mass: 0.8, stiffness: 75, damping: 15 });
    const display = useTransform(spring, (current) => Math.round(current));

    useEffect(() => {
        spring.set(value);
    }, [spring, value]);

    return <motion.span>{display}</motion.span>;
}

const recommended = [
    { id: 1, title: 'Sync Calendrier vers Notion', users: '12k' },
    { id: 2, title: 'Réponse auto aux emails', users: '8k' },
    { id: 3, title: 'Tweeter les nouveaux articles', users: '5k' },
];

const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            type: "spring" as const,
            stiffness: 100,
            damping: 15
        }
    }
};

export default function DashboardPage() {
    const { user } = useAuthClient();
    const [stats, setStats] = useState({
        total_executions: 0,
        active_workflows: 0,
        inactive_workflows: 0,
        success_rate: 0
    });
    const [workflows, setWorkflows] = useState<any[]>([]);
    const [recentlogs, setRecentLogs] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
            const token = localStorage.getItem('access_token');
            const headers = { 'Authorization': `Bearer ${token}` };

            try {
                // Fetch Stats
                const statsRes = await fetch(`${API_BASE}/stats/`, { headers });
                if (statsRes.ok) {
                    const statsData = await statsRes.json();
                    setStats(statsData);
                }

                // Fetch Workflows
                const areasRes = await fetch(`${API_BASE}/areas/`, { headers });
                if (areasRes.ok) {
                    const areasData = await areasRes.json();
                    setWorkflows(areasData);
                }

                // Fetch Logs (Recent Activity)
                const logsRes = await fetch(`${API_BASE}/areas/logs/`, { headers });
                if (logsRes.ok) {
                    const logsData = await logsRes.json();
                    setRecentLogs(logsData.slice(0, 5)); // Limit to 5
                }

            } catch (error) {
                console.error("Dashboard fetch error:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // Helper to format time ago
    const timeAgo = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
        let interval = seconds / 31536000;
        if (interval > 1) return Math.floor(interval) + " an(s)";
        interval = seconds / 2592000;
        if (interval > 1) return Math.floor(interval) + " mois";
        interval = seconds / 86400;
        if (interval > 1) return Math.floor(interval) + " j";
        interval = seconds / 3600;
        if (interval > 1) return Math.floor(interval) + " h";
        interval = seconds / 60;
        if (interval > 1) return Math.floor(interval) + " min";
        return Math.floor(seconds) + " s";
    };

    return (
        <div className="flex flex-col min-h-[calc(100vh-4rem)]">
            <motion.div
                className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-zinc-100 flex-1 w-full"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Header */}
                <motion.div variants={itemVariants} className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div>
                        <h2 className="text-3xl font-bold tracking-tight text-white bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-400">
                            Tableau de bord
                        </h2>
                        <p className="text-zinc-400 mt-1">Bon retour, {user?.first_name || 'Utilisateur'} ! Voici ce qui se passe avec vos automatisations.</p>
                    </div>
                    <Link href="/create">
                        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-lg shadow-blue-900/20 border-0">
                                <Plus className="mr-2 h-4 w-4" /> Créer un workflow
                            </Button>
                        </motion.div>
                    </Link>
                </motion.div>

                {/* Stats Grid */}
                <div className="grid gap-4 md:grid-cols-3">
                    <motion.div
                        variants={itemVariants}
                        whileHover={{ y: -5, transition: { duration: 0.2 } }}
                        className="rounded-xl bg-zinc-900/50 border border-white/5 p-6 backdrop-blur-sm hover:bg-zinc-900/80 hover:border-blue-500/30 transition-colors group"
                    >
                        <div className="flex items-center justify-between pb-2">
                            <h3 className="text-sm font-medium text-zinc-400 group-hover:text-zinc-200 transition-colors">Exécutions totales</h3>
                            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500 group-hover:bg-blue-500/20 transition-colors">
                                <Activity className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="text-3xl font-bold text-white mt-2">
                            <AnimatedNumber value={stats.total_executions} />
                        </div>
                    </motion.div>

                    <motion.div
                        variants={itemVariants}
                        whileHover={{ y: -5, transition: { duration: 0.2 } }}
                        className="rounded-xl bg-zinc-900/50 border border-white/5 p-6 backdrop-blur-sm hover:bg-zinc-900/80 hover:border-yellow-500/30 transition-colors group"
                    >
                        <div className="flex items-center justify-between pb-2">
                            <h3 className="text-sm font-medium text-zinc-400 group-hover:text-zinc-200 transition-colors">Workflows actifs</h3>
                            <div className="p-2 rounded-lg bg-yellow-500/10 text-yellow-500 group-hover:bg-yellow-500/20 transition-colors">
                                <Zap className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="text-3xl font-bold text-white mt-2">
                            <AnimatedNumber value={stats.active_workflows} />
                        </div>
                        <p className="text-xs text-zinc-500 mt-2 flex items-center">
                            <span className={`w-2 h-2 rounded-full mr-2 ${stats.inactive_workflows > 0 ? 'bg-zinc-500' : 'bg-emerald-500'}`} />
                            {stats.inactive_workflows} en pause
                        </p>
                    </motion.div>

                    <motion.div
                        variants={itemVariants}
                        whileHover={{ y: -5, transition: { duration: 0.2 } }}
                        className="rounded-xl bg-zinc-900/50 border border-white/5 p-6 backdrop-blur-sm hover:bg-zinc-900/80 hover:border-green-500/30 transition-colors group"
                    >
                        <div className="flex items-center justify-between pb-2">
                            <h3 className="text-sm font-medium text-zinc-400 group-hover:text-zinc-200 transition-colors">Taux de succès</h3>
                            <div className="p-2 rounded-lg bg-green-500/10 text-green-500 group-hover:bg-green-500/20 transition-colors">
                                <CheckCircle2 className="h-4 w-4" />
                            </div>
                        </div>
                        <div className="text-3xl font-bold text-white mt-2">
                            <AnimatedNumber value={stats.success_rate} />%
                        </div>
                        <p className="text-xs text-zinc-500 mt-2 flex items-center">
                            <Clock className="h-3 w-3 mr-1" />
                            Dernières 24 heures
                        </p>
                    </motion.div>
                </div>

                <div className="grid gap-8 md:grid-cols-3">
                    {/* Main Content: Workflows */}
                    <div className="md:col-span-2 space-y-8">
                        <motion.div variants={itemVariants} className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-semibold text-white">Vos Workflows</h3>
                                <Link href="/areas">
                                    <Button variant="ghost" size="sm" className="text-zinc-400 hover:text-white hover:bg-white/5 transition-colors">Voir tout</Button>
                                </Link>
                            </div>

                            <div className="space-y-4">
                                {workflows.length === 0 && !loading && (
                                    <div className="p-8 text-center bg-zinc-900/30 rounded-xl border border-white/5">
                                        <p className="text-zinc-400 mb-4">Vous n'avez pas encore d'automatisations.</p>
                                        <Link href="/create">
                                            <Button size="sm" variant="outline">Créer mon premier workflow</Button>
                                        </Link>
                                    </div>
                                )}

                                {workflows.map((workflow, i) => (
                                    <motion.div
                                        key={workflow.id}
                                        variants={itemVariants}
                                        whileHover={{ scale: 1.01, backgroundColor: "rgba(39, 39, 42, 0.8)" }}
                                        className="group flex items-center justify-between p-4 rounded-xl border border-white/5 bg-zinc-900/40 hover:border-blue-500/20 transition-all cursor-pointer"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`p-3 rounded-xl transition-colors ${workflow.enabled ? 'bg-blue-500/10 text-blue-500 group-hover:bg-blue-500/20' : 'bg-zinc-800/50 text-zinc-400'}`}>
                                                <Zap className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h4 className="font-medium text-zinc-200 group-hover:text-white transition-colors">{workflow.name || `Workflow ${i + 1}`}</h4>
                                                <p className="text-xs text-zinc-500 flex items-center gap-2 mt-1">
                                                    <span className="bg-zinc-800/50 px-2 py-0.5 rounded text-[10px]">{workflow.action?.service?.name || '?'}</span>
                                                    <ArrowRight className="h-3 w-3 text-zinc-600" />
                                                    <span className="bg-zinc-800/50 px-2 py-0.5 rounded text-[10px]">{workflow.reaction?.service?.name || '?'}</span>
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className={`w-2.5 h-2.5 rounded-full ring-4 ring-transparent transition-all ${workflow.enabled ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.4)]' : 'bg-zinc-600'}`} />
                                            <Link href={`/areas/${workflow.id}`}>
                                                <Button variant="ghost" size="icon" className="text-zinc-400 opacity-0 group-hover:opacity-100 transition-all hover:bg-white/10 hover:text-white -mr-2">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </Link>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>

                        <motion.div variants={itemVariants} className="pt-4">
                            <h3 className="text-xl font-semibold mb-4 text-white">Recommandé pour vous</h3>
                            <div className="grid sm:grid-cols-3 gap-4">
                                {recommended.map((item, i) => (
                                    <motion.div
                                        key={item.id}
                                        variants={itemVariants}
                                        whileHover={{ y: -4 }}
                                        className="p-5 rounded-xl border border-white/5 bg-zinc-900/30 hover:bg-zinc-900/60 hover:border-blue-500/20 transition-all cursor-pointer group"
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="p-2 rounded-lg bg-zinc-800/50 text-zinc-400 group-hover:text-white group-hover:bg-blue-500/20 transition-colors">
                                                <Play className="h-4 w-4" />
                                            </div>
                                            <span className="text-[10px] font-medium bg-zinc-800/50 px-2 py-1 rounded-full text-zinc-400">{item.users} utilisateurs</span>
                                        </div>
                                        <h4 className="font-medium text-sm text-zinc-200 group-hover:text-white mb-3">{item.title}</h4>
                                        <div className="flex items-center text-xs text-blue-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0">
                                            Essayer ce modèle <ArrowRight className="h-3 w-3 ml-1" />
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        </motion.div>
                    </div>

                    {/* Sidebar: Recent Activity */}
                    <motion.div variants={itemVariants} className="space-y-6">
                        <h3 className="text-xl font-semibold text-white">Activité Récente</h3>
                        <div className="rounded-xl border border-white/5 bg-zinc-900/30 p-6 space-y-8 relative overflow-hidden min-h-[300px]">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-blue-500/20" />

                            {recentlogs.length === 0 && !loading && (
                                <p className="text-zinc-500 text-sm italic text-center mt-10">Aucune activité récente.</p>
                            )}

                            {recentlogs.map((log, i) => (
                                <motion.div
                                    key={log.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.5 + (i * 0.1) }}
                                    className="relative pl-8"
                                >
                                    {/* Timeline Line */}
                                    {i !== recentlogs.length - 1 && (
                                        <div className="absolute left-[11px] top-3 bottom-[-32px] w-[2px] bg-zinc-800/50" />
                                    )}

                                    <div className={`absolute left-0 top-1.5 w-6 h-6 rounded-full border-4 border-[#121212] flex items-center justify-center z-10 ${log.status === 'success' ? 'bg-emerald-500' : 'bg-red-500'}`}>
                                        {log.status === 'success' ? (
                                            <CheckCircle2 className="h-3 w-3 text-black" />
                                        ) : (
                                            <AlertCircle className="h-3 w-3 text-black" />
                                        )}
                                    </div>

                                    <div className="space-y-1 group cursor-default">
                                        <div className="flex items-center justify-between">
                                            <p className="text-sm font-medium text-zinc-200 group-hover:text-blue-400 transition-colors truncate max-w-[120px]">
                                                {log.area_name || 'Workflow'}
                                            </p>
                                            <span className="text-[10px] text-zinc-500">{timeAgo(log.executed_at)}</span>
                                        </div>
                                        <p className="text-xs text-zinc-400 group-hover:text-zinc-300 transition-colors line-clamp-2">
                                            {log.message ? log.message : (log.status === 'success' ? 'Exécution réussie' : (log.error_message || 'Erreur inconnue'))}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        <motion.div
                            whileHover={{ scale: 1.02 }}
                            className="rounded-xl bg-gradient-to-br from-blue-600/20 via-purple-600/10 to-blue-600/5 p-6 text-center space-y-4 border border-blue-500/20 relative overflow-hidden group"
                        >
                            <div className="absolute inset-0 bg-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                            <div className="relative z-10">
                                <h4 className="font-bold text-white text-lg">Passer à la version Pro</h4>
                                <p className="text-xs text-zinc-400 max-w-[200px] mx-auto leading-relaxed">
                                    Débloquez des étapes illimitées, une exécution plus rapide et un support premium.
                                </p>
                                <Button size="sm" className="w-full bg-white text-black hover:bg-zinc-200 border-0 font-semibold mt-2">
                                    Mettre à niveau
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                </div>
            </motion.div>
            <Footer />
        </div>
    );
}