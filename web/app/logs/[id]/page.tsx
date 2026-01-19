"use client";

import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, CheckCircle2, XCircle, Clock, Server, Code } from 'lucide-react';

export default function LogDetailPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    
    // Mock Data based on ID (In real app, fetch from API)
    const log = {
        id: params.id,
        area: 'Gmail vers Drive',
        status: 'success',
        timestamp: '2023-10-27T10:30:00Z',
        message: 'Email reçu de boss@company.com',
        triggerPayload: {
            source: 'gmail',
            event: 'new_email',
            data: {
                from: 'boss@company.com',
                subject: 'Rapport Mensuel',
                date: '2023-10-27T10:29:55Z'
            }
        },
        actionPayload: {
            target: 'google_drive',
            action: 'upload_file',
            status: 'completed',
            data: {
                filename: 'Rapport_Mensuel.pdf',
                folder_id: '12345abcde',
                url: 'https://drive.google.com/file/d/...'
            }
        }
    };

    return (
        <div className="min-h-screen bg-[#0f1724] text-white p-8">
            <div className="max-w-4xl mx-auto space-y-8">
                
                {/* Header */}
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold">Détail du Log</h1>
                        <p className="text-zinc-400 text-sm font-mono">{log.id}</p>
                    </div>
                </div>

                {/* Status Card */}
                <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-6 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className={`p-3 rounded-full ${log.status === 'success' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                            {log.status === 'success' ? <CheckCircle2 className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold">{log.message}</h2>
                            <p className="text-zinc-400 text-sm">{log.area}</p>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="flex items-center gap-2 text-zinc-400 text-sm">
                            <Clock className="w-4 h-4" />
                            {new Date(log.timestamp).toLocaleString()}
                        </div>
                        <div className="mt-1 text-xs text-zinc-500 font-mono">
                            Durée: 1.2s
                        </div>
                    </div>
                </div>

                {/* Payloads Grid */}
                <div className="grid md:grid-cols-2 gap-6">
                    
                    {/* Trigger Payload */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-zinc-300 font-medium">
                            <Server className="w-4 h-4 text-blue-400" />
                            Payload Déclencheur
                        </div>
                        <div className="bg-[#0d1117] border border-white/10 rounded-xl p-4 overflow-hidden">
                            <pre className="text-xs font-mono text-blue-300 overflow-x-auto">
                                {JSON.stringify(log.triggerPayload, null, 2)}
                            </pre>
                        </div>
                    </div>

                    {/* Action Payload */}
                    <div className="space-y-3">
                        <div className="flex items-center gap-2 text-zinc-300 font-medium">
                            <Code className="w-4 h-4 text-purple-400" />
                            Payload Action
                        </div>
                        <div className="bg-[#0d1117] border border-white/10 rounded-xl p-4 overflow-hidden">
                            <pre className="text-xs font-mono text-purple-300 overflow-x-auto">
                                {JSON.stringify(log.actionPayload, null, 2)}
                            </pre>
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}
