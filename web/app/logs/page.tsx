"use client";

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Filter, CheckCircle2, XCircle, Clock, ArrowRight, ChevronRight } from 'lucide-react';
import Link from 'next/link';

// Mock Data
const LOGS = [
    { id: 'log-1', area: 'Gmail vers Drive', service: 'Gmail', status: 'success', message: 'Email reçu de boss@company.com', timestamp: '2023-10-27T10:30:00Z' },
    { id: 'log-2', area: 'GitHub vers Slack', service: 'GitHub', status: 'success', message: 'Nouveau commit sur main', timestamp: '2023-10-27T10:15:00Z' },
    { id: 'log-3', area: 'Spotify vers YouTube', service: 'Spotify', status: 'error', message: 'Erreur API: Token expiré', timestamp: '2023-10-27T09:45:00Z' },
    { id: 'log-4', area: 'Météo SMS', service: 'Weather', status: 'success', message: 'Prévisions envoyées', timestamp: '2023-10-27T08:00:00Z' },
    { id: 'log-5', area: 'Gmail vers Drive', service: 'Drive', status: 'success', message: 'Fichier sauvegardé', timestamp: '2023-10-27T10:30:05Z' },
];

const AREAS = ['Tous', 'Gmail vers Drive', 'GitHub vers Slack', 'Spotify vers YouTube', 'Météo SMS'];
const STATUSES = ['Tous', 'success', 'error'];

export default function LogsPage() {
    const [selectedArea, setSelectedArea] = useState('Tous');
    const [selectedStatus, setSelectedStatus] = useState('Tous');
    const [searchTerm, setSearchTerm] = useState('');

    const filteredLogs = LOGS.filter(log => {
        const matchArea = selectedArea === 'Tous' || log.area === selectedArea;
        const matchStatus = selectedStatus === 'Tous' || log.status === selectedStatus;
        const matchSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            log.area.toLowerCase().includes(searchTerm.toLowerCase());
        return matchArea && matchStatus && matchSearch;
    });

    return (
        <div className="min-h-screen bg-[#0f1724] text-white p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold">Logs d'activité</h1>
                    <p className="text-zinc-400 mt-2">Historique des exécutions de vos automatisations.</p>
                </div>

                {/* Filters */}
                <div className="flex flex-col md:flex-row gap-4 bg-zinc-900/50 p-4 rounded-xl border border-white/5">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                        <input 
                            type="text" 
                            placeholder="Rechercher dans les logs..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-zinc-950 border border-white/10 rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                        />
                    </div>
                    
                    <select 
                        value={selectedArea}
                        onChange={(e) => setSelectedArea(e.target.value)}
                        className="bg-zinc-950 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                    >
                        {AREAS.map(area => <option key={area} value={area}>{area}</option>)}
                    </select>

                    <select 
                        value={selectedStatus}
                        onChange={(e) => setSelectedStatus(e.target.value)}
                        className="bg-zinc-950 border border-white/10 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                    >
                        {STATUSES.map(status => <option key={status} value={status}>{status === 'Tous' ? 'Tous les statuts' : status}</option>)}
                    </select>
                </div>

                {/* Logs List */}
                <div className="space-y-2">
                    {filteredLogs.map((log) => (
                        <Link href={`/logs/${log.id}`} key={log.id}>
                            <motion.div 
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="group flex items-center justify-between p-4 bg-zinc-900/30 border border-white/5 rounded-xl hover:bg-zinc-800/50 hover:border-white/10 transition-all cursor-pointer"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`p-2 rounded-lg ${log.status === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                        {log.status === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-white">{log.area}</span>
                                            <span className="text-xs text-zinc-500 px-2 py-0.5 bg-white/5 rounded-full">{log.service}</span>
                                        </div>
                                        <p className="text-sm text-zinc-400 mt-0.5">{log.message}</p>
                                    </div>
                                </div>
                                
                                <div className="flex items-center gap-6">
                                    <div className="text-right text-xs text-zinc-500 flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {new Date(log.timestamp).toLocaleString()}
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-zinc-600 group-hover:text-white transition-colors" />
                                </div>
                            </motion.div>
                        </Link>
                    ))}
                    
                    {filteredLogs.length === 0 && (
                        <div className="text-center py-12 text-zinc-500">
                            Aucun log trouvé pour ces critères.
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
}
