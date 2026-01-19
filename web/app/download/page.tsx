'use client';

import { useState } from 'react';
import { Download, Smartphone, CheckCircle } from 'lucide-react';

export default function DownloadAPKPage() {
    const [downloading, setDownloading] = useState(false);

    const handleDownload = async () => {
        setDownloading(true);
        try {
            const response = await fetch('/api/download/apk');
            if (response.ok) {
                const blob = await response.blob();
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = 'area-mobile.apk';
                document.body.appendChild(a);
                a.click();
                window.URL.revokeObjectURL(url);
                document.body.removeChild(a);
            } else {
                alert('Erreur lors du téléchargement de l\'APK');
            }
        } catch (error) {
            console.error('Download error:', error);
            alert('Erreur lors du téléchargement');
        } finally {
            setDownloading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
            <div className="container mx-auto px-4 py-16">
                <div className="max-w-2xl mx-auto text-center">
                    {/* Header */}
                    <div className="mb-8">
                        <Smartphone className="w-20 h-20 mx-auto mb-4 text-blue-500" />
                        <h1 className="text-4xl font-bold mb-4">
                            Télécharger AREA Mobile
                        </h1>
                        <p className="text-gray-400 text-lg">
                            Application Android pour gérer vos automatisations
                        </p>
                    </div>

                    {/* Features */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
                        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                            <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-3" />
                            <h3 className="font-semibold mb-2">Workflows</h3>
                            <p className="text-sm text-gray-400">
                                Créez et gérez vos automatisations
                            </p>
                        </div>
                        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                            <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-3" />
                            <h3 className="font-semibold mb-2">Services</h3>
                            <p className="text-sm text-gray-400">
                                14 services intégrés
                            </p>
                        </div>
                        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
                            <CheckCircle className="w-8 h-8 text-green-500 mx-auto mb-3" />
                            <h3 className="font-semibold mb-2">Temps réel</h3>
                            <p className="text-sm text-gray-400">
                                Logs et statistiques en direct
                            </p>
                        </div>
                    </div>

                    {/* Download Button */}
                    <button
                        onClick={handleDownload}
                        disabled={downloading}
                        className="inline-flex items-center gap-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-semibold px-8 py-4 rounded-lg transition-colors text-lg"
                    >
                        <Download className="w-6 h-6" />
                        {downloading ? 'Téléchargement...' : 'Télécharger l\'APK'}
                    </button>

                    {/* Info */}
                    <div className="mt-12 bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-6">
                        <h3 className="font-semibold mb-2 text-yellow-500">⚠️ Installation</h3>
                        <p className="text-sm text-gray-300">
                            Vous devez activer "Sources inconnues" dans les paramètres de votre appareil Android pour installer cette application.
                        </p>
                    </div>

                    {/* Version Info */}
                    <div className="mt-8 text-sm text-gray-500">
                        <p>Version: 1.0.0 (Debug)</p>
                        <p>Taille: ~137 MB</p>
                        <p>Dernière mise à jour: 12 janvier 2026</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
