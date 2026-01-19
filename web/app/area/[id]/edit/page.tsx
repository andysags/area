"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save, Trash2, AlertTriangle } from 'lucide-react';

export default function EditAreaPage({ params }: { params: { id: string } }) {
    const router = useRouter();
    
    // Mock Data (In real app, fetch by ID)
    const [formData, setFormData] = useState({
        name: 'Gmail vers Drive',
        description: 'Sauvegarde automatique des pièces jointes',
        active: true,
        config: {
            trigger: { service: 'gmail', event: 'new_email' },
            action: { service: 'drive', action: 'upload_file' }
        }
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // API Call to update
        console.log('Updating Area:', params.id, formData);
        router.push('/areas');
    };

    return (
        <div className="min-h-screen bg-[#0f1724] text-white p-8">
            <div className="max-w-2xl mx-auto space-y-8">
                
                {/* Header */}
                <div className="flex items-center gap-4">
                    <button onClick={() => router.back()} className="p-2 hover:bg-white/10 rounded-full transition-colors">
                        <ArrowLeft className="w-5 h-5" />
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold">Modifier l'AREA</h1>
                        <p className="text-zinc-400 text-sm">ID: {params.id}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* General Info Card */}
                    <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-6 space-y-4">
                        <h2 className="text-lg font-semibold mb-4">Informations Générales</h2>
                        
                        <div className="space-y-2">
                            <label className="text-sm text-zinc-400">Nom de l'automation</label>
                            <input 
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({...formData, name: e.target.value})}
                                className="w-full bg-[#0d1117] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm text-zinc-400">Description</label>
                            <textarea 
                                value={formData.description}
                                onChange={(e) => setFormData({...formData, description: e.target.value})}
                                rows={3}
                                className="w-full bg-[#0d1117] border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-blue-500 transition-colors resize-none"
                            />
                        </div>

                        <div className="flex items-center justify-between pt-2">
                            <span className="text-sm text-zinc-400">État de l'automation</span>
                            <button 
                                type="button"
                                onClick={() => setFormData({...formData, active: !formData.active})}
                                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.active ? 'bg-green-500' : 'bg-zinc-700'}`}
                            >
                                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.active ? 'translate-x-6' : 'translate-x-1'}`} />
                            </button>
                        </div>
                    </div>

                    {/* Configuration Read-Only (For now) */}
                    <div className="bg-zinc-900/50 border border-white/5 rounded-xl p-6">
                        <div className="flex items-center gap-2 mb-4 text-yellow-500">
                            <AlertTriangle className="w-5 h-5" />
                            <h2 className="text-lg font-semibold text-white">Configuration</h2>
                        </div>
                        <p className="text-sm text-zinc-400 mb-4">
                            La modification des déclencheurs et actions nécessite de recréer l'AREA pour le moment.
                        </p>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="p-4 bg-[#0d1117] rounded-lg border border-white/5">
                                <span className="text-xs text-zinc-500 uppercase font-bold">Déclencheur</span>
                                <div className="mt-1 font-medium">{formData.config.trigger.service}</div>
                                <div className="text-sm text-zinc-400">{formData.config.trigger.event}</div>
                            </div>
                            <div className="p-4 bg-[#0d1117] rounded-lg border border-white/5">
                                <span className="text-xs text-zinc-500 uppercase font-bold">Action</span>
                                <div className="mt-1 font-medium">{formData.config.action.service}</div>
                                <div className="text-sm text-zinc-400">{formData.config.action.action}</div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-4 pt-4">
                        <button 
                            type="submit"
                            className="flex-1 bg-white text-black font-medium py-3 rounded-xl hover:bg-zinc-200 transition-colors flex items-center justify-center gap-2"
                        >
                            <Save className="w-4 h-4" />
                            Enregistrer les modifications
                        </button>
                        
                        <button 
                            type="button"
                            className="px-6 py-3 bg-red-500/10 text-red-500 font-medium rounded-xl hover:bg-red-500/20 transition-colors flex items-center gap-2"
                        >
                            <Trash2 className="w-4 h-4" />
                            Supprimer
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
}
