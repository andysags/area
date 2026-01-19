"use client";

import React from 'react';
import { User, Lock, Plus, X } from 'lucide-react';
import Link from 'next/link';

export default function EditGravatarPage() {
  return (
    <div className="min-h-screen bg-[#f0f2f5] flex flex-col items-center justify-center p-4 font-sans text-[#101517]">
      
      {/* Language Selector (Mock) */}
      <div className="absolute top-8 flex items-center gap-2 bg-white px-4 py-2 rounded-full shadow-sm text-sm text-blue-600 cursor-pointer hover:bg-gray-50 transition-colors">
        <span className="text-gray-400">🌐</span>
        <span>Également disponible en Français</span>
        <button className="ml-2 text-gray-400 hover:text-gray-600">
            <X className="w-4 h-4" />
        </button>
      </div>

      <div className="w-full max-w-[460px] bg-white rounded-xl shadow-sm p-8 md:p-12 flex flex-col items-center text-center">
        {/* Logo */}
        <div className="mb-6">
           {/* Gravatar Logo Mock - Blue G style */}
           <div className="w-12 h-12 rounded-full flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-10 h-10 text-blue-600 fill-current">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" /> 
                    {/* Using a generic icon path for now, resembling a power button or G */}
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm0 21.6c-5.302 0-9.6-4.298-9.6-9.6s4.298-9.6 9.6-9.6 9.6 4.298 9.6 9.6-4.298 9.6-9.6 9.6z" fill="none"/>
                    <path d="M12 4.8c-3.97 0-7.2 3.23-7.2 7.2s3.23 7.2 7.2 7.2 7.2-3.23 7.2-7.2-3.23-7.2-7.2-7.2zm0 12c-2.65 0-4.8-2.15-4.8-4.8s2.15-4.8 4.8-4.8 4.8 2.15 4.8 4.8-2.15 4.8-4.8 4.8z" />
                </svg>
           </div>
        </div>

        <h1 className="text-3xl font-bold mb-8 tracking-tight text-black">Modifiez votre Gravatar</h1>

        <div className="w-full space-y-4">
            <input 
                type="email" 
                placeholder="Entrez votre adresse e-mail"
                className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none transition-all text-gray-800 placeholder:text-gray-400"
            />
            
            <button className="w-full py-3 bg-[#a8b9e3] hover:bg-[#94a8d6] text-white font-bold rounded-lg transition-colors">
                Continuer
            </button>
        </div>

        <div className="mt-12 space-y-8 w-full text-left">
            <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full border border-blue-600 flex items-center justify-center flex-shrink-0 text-blue-600 mt-1">
                    <User className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="font-bold text-sm text-black">Un profil, partout</h3>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">Votre avatar et votre bio se synchronisent sur le web.</p>
                </div>
            </div>

            <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full border border-blue-600 flex items-center justify-center flex-shrink-0 text-blue-600 mt-1">
                    <Lock className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="font-bold text-sm text-black">Public, ouvert et responsable</h3>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">Contrôle total sur vos données et votre vie privée.</p>
                </div>
            </div>

            <div className="flex gap-4 items-start">
                <div className="w-10 h-10 rounded-full border border-blue-600 flex items-center justify-center flex-shrink-0 text-blue-600 mt-1">
                    <Plus className="w-5 h-5" />
                </div>
                <div>
                    <h3 className="font-bold text-sm text-black">Plus de 200 millions d'utilisateurs</h3>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">Utilisé par WordPress, Slack et bien d'autres.</p>
                </div>
            </div>
        </div>

        <div className="mt-12">
            <Link href="/login" className="text-blue-600 hover:underline text-sm font-medium">
                Se connecter autrement
            </Link>
        </div>

      </div>
    </div>
  );
}
