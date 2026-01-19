"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Edit2, Activity, Calendar, PlayCircle } from 'lucide-react';
import Link from 'next/link';

export default function AreaDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();

    // Mock Data
    const area = {
        id: params.id,
        name: 'Gmail vers Drive',
        description: 'Sauvegarde automatique des pièces jointes',
        active: true,
        createdAt: '2023-09-15T08:00:00Z',
        lastRun: '2023-10-27T10:30:00Z',
        runCount: 142,
        trigger: {
            service: 'Gmail',
            event: 'Nouvel Email Reçu',
            config: { filter: 'has:attachment' }
        },
        action: {
            service: 'Google Drive',
            event: 'Uploader un fichier',
            config: { folder: '/Backup/Emails' }
        }
    };

    return (
        <div className="min-h-screen bg-[#0f1724] text-white p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                
                {/* Header */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <button onClick={() => router.back()} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                            <ArrowLeft className="w-5 h-5" />
                        </button>
                        <div>
                            <h1 className="text-2xl font-bold">{area.name}</h1>
                            <div className="flex items-center gap-2 mt-1">
                                <span className={`w-2 h-2 rounded-full ${area.active ? 'bg-green-500' : 'bg-zinc-500'}`} />
                                <span className="text-zinc-400 text-sm">{area.active ? 'Actif' : 'Inactif'}</span>
                            </div>
                        </div>
                    </div>
                    <Link 
                        href={`/area/${area.id}/edit`}
                        className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors"
                    >
                        <Edit2 className="w-4 h-4" />
                        Modifier
                    </Link>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-zinc-900/50 border border-white/5 p-4 rounded-xl">
                        <div className="flex items-center gap-2 text-zinc-400 mb-2">
                            <Activity className="w-4 h-4" />
                            <span className="text-sm">Exécutions</span>
                        </div>
                        <div className="text-2xl font-bold">{area.runCount}</div>
                    </div>
                    <div className="bg-zinc-900/50 border border-white/5 p-4 rounded-xl">
                        <div className="flex items-center gap-2 text-zinc-400 mb-2">
                            <PlayCircle className="w-4 h-4" />
                            <span className="text-sm">Dernière exécution</span>
                        </div>
                        <div className="text-lg font-medium">{new Date(area.lastRun).toLocaleDateString()}</div>
                        <div className="text-xs text-zinc-500">{new Date(area.lastRun).toLocaleTimeString()}</div>
                    </div>
                    <div className="bg-zinc-900/50 border border-white/5 p-4 rounded-xl">
                        <div className="flex items-center gap-2 text-zinc-400 mb-2">
                            <Calendar className="w-4 h-4" />
                            <span className="text-sm">Créé le</span>
                        </div>
                        <div className="text-lg font-medium">{new Date(area.createdAt).toLocaleDateString()}</div>
                    </div>
                </div>

                {/* Workflow Visualization */}
                <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-8">
                    <h2 className="text-lg font-semibold mb-8">Workflow</h2>
                    
                    <div className="relative">
                        {/* Connecting Line */}
                        <div className="absolute left-8 top-12 bottom-12 w-0.5 bg-gradient-to-b from-blue-500 to-purple-500 opacity-30" />

                        {/* Trigger Node */}
                        <div className="relative flex gap-6 mb-12">
                            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0 z-10 bg-[#0f1724]">
                                <span className="text-blue-500 font-bold">IF</span>
                            </div>
                            <div className="flex-1 bg-[#0d1117] border border-white/10 rounded-xl p-4">
                                <div className="text-xs text-blue-400 font-bold uppercase mb-1">Déclencheur</div>
                                <h3 className="text-lg font-semibold">{area.trigger.service}</h3>
                                <p className="text-zinc-400">{area.trigger.event}</p>
                                <div className="mt-3 pt-3 border-t border-white/5">
                                    <code className="text-xs text-zinc-500 font-mono">
                                        {JSON.stringify(area.trigger.config)}
                                    </code>
                                </div>
                            </div>
                        </div>

                        {/* Action Node */}
                        <div className="relative flex gap-6">
                            <div className="w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0 z-10 bg-[#0f1724]">
                                <span className="text-purple-500 font-bold">THEN</span>
                            </div>
                            <div className="flex-1 bg-[#0d1117] border border-white/10 rounded-xl p-4">
                                <div className="text-xs text-purple-400 font-bold uppercase mb-1">Action</div>
                                <h3 className="text-lg font-semibold">{area.action.service}</h3>
                                <p className="text-zinc-400">{area.action.event}</p>
                                <div className="mt-3 pt-3 border-t border-white/5">
                                    <code className="text-xs text-zinc-500 font-mono">
                                        {JSON.stringify(area.action.config)}
                                    </code>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
