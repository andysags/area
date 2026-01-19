"use client";

import React from 'react';
import Link from 'next/link';
import { Zap, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function GetStartedPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0f1724] text-white relative overflow-hidden p-4">
      
      {/* Background Elements */}
      <div className="absolute inset-0 z-0 pointer-events-none">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-600/10 blur-[120px] animate-pulse" />
          <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-violet-600/10 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative z-10 max-w-md w-full bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 md:p-12 shadow-2xl"
      >
        <div className="flex flex-col items-center text-center">
          
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
            className="w-24 h-24 rounded-full bg-blue-500/10 flex items-center justify-center mb-8 border border-blue-500/20"
          >
            <Zap size={48} className="text-blue-400" />
          </motion.div>

          <h1 className="text-3xl md:text-4xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
            Bienvenue sur Nexus
          </h1>
          
          <p className="text-slate-400 mb-8 leading-relaxed">
            La plateforme d'automatisation la plus puissante pour connecter vos applications préférées.
          </p>

          <div className="w-full space-y-4 mb-10 pl-4">
            {[
              "Automatisation sans code",
              "Intégrations illimitées",
              "Exécution en temps réel"
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + (i * 0.1) }}
                className="flex items-center gap-3 text-slate-300"
              >
                <div className="w-2 h-2 rounded-full bg-blue-400" />
                <span>{feature}</span>
              </motion.div>
            ))}
          </div>

          <div className="w-full space-y-4">
            <Link href="/register" className="block w-full">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 px-6 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition-colors shadow-lg shadow-blue-600/20"
              >
                Créer un compte
                <ArrowRight size={20} />
              </motion.button>
            </Link>

            <Link href="/login" className="block w-full">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 px-6 bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white rounded-xl font-semibold transition-colors border border-white/5"
              >
                J'ai déjà un compte
              </motion.button>
            </Link>
          </div>

        </div>
      </motion.div>
    </div>
  );
}
