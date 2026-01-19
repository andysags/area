import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle, Plus, ExternalLink } from 'lucide-react';
import { Button } from '@/app/components/ui/button';

interface ServiceCardProps {
    name: string;
    description?: string;
    icon?: string;
    isConnected: boolean;
    isIntegrated?: boolean;
    onConnect: () => void;
    onDisconnect?: () => void;
}

export default function ServiceCard({ name, description, icon, isConnected, isIntegrated, onConnect, onDisconnect }: ServiceCardProps) {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            className={`relative overflow-hidden rounded-2xl border ${isConnected ? 'border-green-500/30 bg-green-500/5' : 'border-white/10 bg-white/5'} p-6 transition-colors`}
        >
            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                    {icon ? (
                        <img src={icon} alt={name} className="w-12 h-12 rounded-xl object-contain bg-white/10 p-2" />
                    ) : (
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-xl font-bold text-white">
                            {name[0].toUpperCase()}
                        </div>
                    )}
                    <div>
                        <h3 className="font-bold text-lg text-white capitalize">{name}</h3>
                        {isConnected && (
                            <span className="inline-flex items-center text-xs font-medium text-green-400">
                                <CheckCircle className="w-3 h-3 mr-1" /> Connecté
                            </span>
                        )}
                    </div>
                </div>
            </div>

            <p className="text-slate-400 text-sm mb-6 min-h-[40px]">
                {description || `Intégrez ${name} à vos flux d'automatisation.`}
            </p>

            <div className="flex gap-2">
                {isIntegrated ? (
                    <Button
                        disabled
                        size="sm"
                        className="w-full bg-slate-700/50 text-slate-400 border border-slate-600/30 cursor-not-allowed"
                    >
                        <CheckCircle className="w-4 h-4 mr-2" /> Toujours Actif
                    </Button>
                ) : isConnected ? (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={onDisconnect}
                        className="w-full border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300"
                    >
                        Déconnecter
                    </Button>
                ) : (
                    <Button
                        size="sm"
                        onClick={onConnect}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white"
                    >
                        <Plus className="w-4 h-4 mr-2" /> Connecter
                    </Button>
                )}
            </div>
        </motion.div>
    );
}
