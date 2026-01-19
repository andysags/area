"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, Variants } from 'framer-motion';
import { ArrowRight, Plus, Zap, Activity, Star, TrendingUp } from 'lucide-react';
import { Button } from './ui/button';

const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1
        }
    }
};

const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
        y: 0,
        opacity: 1,
        transition: {
            type: "spring",
            stiffness: 100,
            damping: 15
        }
    }
};

export default function LoggedInHome({ user }: { user: any }) {
    const [stats, setStats] = useState({
        total_executions: 0,
        active_workflows: 0,
        success_rate: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
                const token = localStorage.getItem('access_token');
                if (!token) return;

                const response = await fetch(`${API_BASE}/stats/`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    const data = await response.json();
                    setStats(data);
                }
            } catch (error) {
                console.error("Failed to fetch stats", error);
            } finally {
                setLoading(false);
            }
        };

        if (user) {
            fetchStats();
        }
    }, [user]);
    return (
        <div className="min-h-screen bg-[#0f1724] text-white pt-24 pb-12">
            <motion.div
                className="container mx-auto px-4 max-w-6xl"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                {/* Welcome Hero */}
                <motion.div variants={itemVariants} className="mb-12 text-center md:text-left flex flex-col md:flex-row items-center justify-between gap-8">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold mb-4">
                            Ravi de vous revoir, <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-violet-400">{user?.email?.split('@')[0] || 'User'}</span> 👋
                        </h1>
                        <p className="text-xl text-slate-400 max-w-2xl">
                            Vos automatisations tournent à plein régime. Que voulez-vous créer aujourd'hui ?
                        </p>
                    </div>
                    <Link href="/create">
                        <Button className="h-14 px-8 text-lg bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-lg shadow-blue-900/20 transition-all hover:scale-105">
                            <Plus className="mr-2 h-5 w-5" /> Créer une Area
                        </Button>
                    </Link>
                </motion.div>

                {/* Quick Stats / Overview */}
                <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 rounded-xl bg-green-500/20 text-green-400">
                                <Activity className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-400">Total Exécutions</p>
                                <p className="text-2xl font-bold">{loading ? "..." : stats.total_executions}</p>
                            </div>
                        </div>
                        <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-green-500 h-full w-[70%]" />
                        </div>
                    </div>

                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 rounded-xl bg-blue-500/20 text-blue-400">
                                <Zap className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-400">Areas Actives</p>
                                <p className="text-2xl font-bold">{loading ? "..." : stats.active_workflows}</p>
                            </div>
                        </div>
                        <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-blue-500 h-full w-[40%]" />
                        </div>
                    </div>

                    <div className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm hover:bg-white/10 transition-colors">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 rounded-xl bg-violet-500/20 text-violet-400">
                                <TrendingUp className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm text-slate-400">Taux de succès</p>
                                <p className="text-2xl font-bold">{loading ? "..." : `${stats.success_rate}%`}</p>
                            </div>
                        </div>
                        <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                            <div className="bg-violet-500 h-full" style={{ width: `${stats.success_rate}%` }} />
                        </div>
                    </div>
                </motion.div>

                {/* Quick Actions / Suggestions */}
                <motion.div variants={itemVariants}>
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-2xl font-bold">Suggestions pour vous</h2>
                        <Link href="/explore" className="text-blue-400 hover:text-blue-300 flex items-center gap-1 text-sm font-medium">
                            Tout explorer <ArrowRight className="w-4 h-4" />
                        </Link>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { title: 'Sauvegarder les pièces jointes Gmail', desc: 'Enregistrez automatiquement vos fichiers sur Drive', color: 'from-red-500 to-blue-500' },
                            { title: 'Sync GitHub Issues vers Notion', desc: 'Gardez votre gestion de projet à jour', color: 'from-slate-700 to-slate-900' },
                            { title: 'Alerte Météo par SMS', desc: 'Recevez un message s\'il va pleuvoir demain', color: 'from-yellow-500 to-orange-500' },
                        ].map((item, i) => (
                            <Link key={i} href="/create" className="group">
                                <div className="h-full p-6 rounded-2xl bg-white/5 border border-white/10 hover:border-blue-500/50 hover:bg-white/10 transition-all relative overflow-hidden">
                                    <div className={`absolute top-0 right-0 w-32 h-32 bg-gradient-to-br ${item.color} opacity-10 blur-2xl rounded-full -mr-10 -mt-10 group-hover:opacity-20 transition-opacity`} />
                                    <h3 className="text-lg font-bold mb-2 group-hover:text-blue-400 transition-colors">{item.title}</h3>
                                    <p className="text-slate-400 text-sm mb-4">{item.desc}</p>
                                    <div className="flex items-center text-xs font-medium text-slate-500 group-hover:text-slate-300">
                                        <Star className="w-3 h-3 mr-1" /> Populaire
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </motion.div>

                {/* Recent Activity Link */}
                <motion.div variants={itemVariants} className="mt-12 p-8 rounded-3xl bg-gradient-to-r from-blue-900/20 to-violet-900/20 border border-white/10 flex flex-col md:flex-row items-center justify-between gap-6">
                    <div>
                        <h3 className="text-xl font-bold mb-2">Accéder à votre Tableau de bord complet</h3>
                        <p className="text-slate-400">Gérez vos Areas, consultez les logs détaillés et configurez vos services.</p>
                    </div>
                    <Link href="/dashboard">
                        <Button variant="outline" className="border-white/20 hover:bg-white/10 text-white h-12 px-6 rounded-xl">
                            Aller au Dashboard
                        </Button>
                    </Link>
                </motion.div>
            </motion.div>
        </div>
    );
}