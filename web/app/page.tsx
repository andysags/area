"use client";

import React from 'react';
import Link from 'next/link';
import { Button } from './components/ui/button';
import Footer from './Footer';
import { ArrowRight, Zap, Globe, Shield, CheckCircle, Star, Users, FileText, Code, ChevronDown, Play } from 'lucide-react';
import { motion, useScroll, useTransform } from 'framer-motion';
import useAuthClient from './hooks/useAuthClient';
import LoggedInHome from './components/LoggedInHome';

const fadeInUp = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" }
};

const staggerContainer = {
    animate: {
        transition: {
            staggerChildren: 0.15
        }
    }
};

export default function Homepage() {
    const { user, loading } = useAuthClient();
    const { scrollYProgress } = useScroll();
    const opacity = useTransform(scrollYProgress, [0, 0.2], [1, 0]);
    const scale = useTransform(scrollYProgress, [0, 0.2], [1, 0.95]);

    if (loading) {
        return <div className="min-h-screen bg-[#0f1724] flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>;
    }

    if (user) {
        return <LoggedInHome user={user} />;
    }
    return (
        <div className="flex flex-col min-h-screen bg-[#0f1724] text-white overflow-hidden selection:bg-blue-500/30">
            
            {/* Background Elements */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/10 blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-violet-600/10 blur-[120px] animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            <main className="flex-1 relative z-10">
                {/* Hero Section */}
                <section className="relative pt-24 pb-20 md:pt-32 md:pb-32 overflow-hidden">
                    <motion.div 
                        style={{ opacity, scale }}
                        className="container mx-auto px-4 text-center relative z-10"
                    >
                        <motion.div
                            initial="initial"
                            animate="animate"
                            variants={staggerContainer}
                            className="flex flex-col items-center gap-8 max-w-4xl mx-auto"
                        >
                            <motion.div variants={fadeInUp}>
                                <span className="inline-flex items-center rounded-full border border-blue-500/30 bg-blue-500/10 px-4 py-1.5 text-sm font-medium text-blue-400 backdrop-blur-sm">
                                    <span className="flex h-2 w-2 rounded-full bg-blue-400 mr-2 animate-pulse shadow-[0_0_10px_rgba(96,165,250,0.5)]"></span>
                                    Nouveau : Workflows alimentés par l'IA
                                </span>
                            </motion.div>

                            <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">
                                Automatisez votre vie numérique <br />
                                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-violet-400 animate-gradient-x">
                                    sans limites.
                                </span>
                            </motion.h1>

                            <motion.p variants={fadeInUp} className="max-w-2xl text-lg md:text-xl text-slate-400 leading-relaxed">
                                Connectez vos applications et appareils préférés pour créer des automatisations puissantes. 
                                Simple, sécurisé et fiable. Libérez votre potentiel dès aujourd'hui.
                            </motion.p>

                            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 mt-4 w-full sm:w-auto">
                                <Link href="/get-started" className="w-full sm:w-auto">
                                    <Button size="lg" className="w-full sm:w-auto px-8 h-14 text-lg bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_30px_rgba(37,99,235,0.5)] transition-all hover:-translate-y-1">
                                        Commencer gratuitement <ArrowRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </Link>
                                <Link href="/login" className="w-full sm:w-auto">
                                    <Button variant="outline" size="lg" className="w-full sm:w-auto px-8 h-14 text-lg border-slate-700 text-slate-300 hover:bg-slate-800/50 hover:text-white rounded-full backdrop-blur-sm transition-all hover:-translate-y-1">
                                        <Play className="mr-2 h-4 w-4 fill-current" /> Démo en direct
                                    </Button>
                                </Link>
                            </motion.div>
                        </motion.div>
                    </motion.div>
                    
                    {/* Hero Background Grid */}
                    <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-soft-light pointer-events-none"></div>
                    <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0f1724] to-transparent pointer-events-none"></div>
                </section>

                {/* Social Proof */}
                <section className="border-y border-white/5 bg-white/[0.02] py-10 overflow-hidden backdrop-blur-sm">
                    <div className="container mx-auto px-4">
                        <p className="text-center text-xs font-semibold tracking-widest text-slate-500 mb-8 uppercase">Ils nous font confiance</p>
                        <div className="flex justify-center gap-12 md:gap-24 opacity-40 grayscale hover:grayscale-0 transition-all duration-500 flex-wrap">
                            {['Google', 'Microsoft', 'Spotify', 'Slack', 'Discord', 'Notion'].map((brand) => (
                                <span key={brand} className="text-xl font-bold flex items-center gap-2 text-white hover:text-blue-400 transition-colors cursor-default">
                                    <Globe className="w-5 h-5" /> {brand}
                                </span>
                            ))}
                        </div>
                    </div>
                </section>

                {/* Features Grid */}
                <section className="container mx-auto px-4 py-24 relative">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center max-w-3xl mx-auto mb-16"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold mb-6 bg-clip-text text-transparent bg-gradient-to-b from-white to-slate-400">Tout ce dont vous avez besoin pour évoluer</h2>
                        <p className="text-slate-400 text-lg">Des fonctionnalités puissantes conçues pour les équipes modernes qui ne veulent pas perdre de temps.</p>
                    </motion.div>

                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[
                            { icon: Zap, title: "Ultra Rapide", desc: "Exécution en temps réel avec une latence proche de zéro.", color: "text-yellow-400", bg: "bg-yellow-400/10" },
                            { icon: Globe, title: "Connectivité Globale", desc: "Connectez des services de n'importe où instantanément.", color: "text-blue-400", bg: "bg-blue-400/10" },
                            { icon: Shield, title: "Sécurisé par Design", desc: "Chiffrement de bout en bout et sécurité de niveau entreprise.", color: "text-green-400", bg: "bg-green-400/10" },
                            { icon: Users, title: "Collaboration d'Équipe", desc: "Partagez des flux et gérez les permissions finement.", color: "text-purple-400", bg: "bg-purple-400/10" },
                            { icon: FileText, title: "Journaux Détaillés", desc: "Suivez chaque étape de votre historique d'automatisation.", color: "text-orange-400", bg: "bg-orange-400/10" },
                            { icon: Code, title: "API Développeur", desc: "Étendez Nexus avec votre propre code personnalisé.", color: "text-pink-400", bg: "bg-pink-400/10" }
                        ].map((feature, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                whileHover={{ y: -5, scale: 1.02 }}
                                className="group p-8 rounded-2xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/10 transition-all duration-300 backdrop-blur-sm"
                            >
                                <div className={`w-14 h-14 rounded-xl ${feature.bg} ${feature.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300 shadow-lg`}>
                                    <feature.icon className="w-7 h-7" />
                                </div>
                                <h3 className="font-bold text-xl mb-3 text-slate-100">{feature.title}</h3>
                                <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Why Choose Nexus (Feature Highlight) */}
                <section className="py-24 bg-gradient-to-b from-transparent to-blue-900/10 relative overflow-hidden">
                    <div className="container mx-auto px-4 relative z-10">
                        <div className="grid md:grid-cols-2 gap-16 items-center">
                            <motion.div
                                initial={{ opacity: 0, x: -50 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                className="space-y-8"
                            >
                                <h2 className="text-3xl md:text-4xl font-bold leading-tight">Pourquoi choisir <span className="text-blue-400">Nexus</span> ?</h2>
                                <p className="text-slate-400 text-lg">Une plateforme conçue pour la flexibilité et la performance.</p>
                                
                                <ul className="space-y-5">
                                    {['Éditeur de flux visuel intuitif', 'Plus de 100 intégrations prêtes à l\'emploi', 'Sécurité et conformité RGPD', 'Support technique 24/7'].map((item, i) => (
                                        <motion.li
                                            key={i}
                                            initial={{ opacity: 0, x: -20 }}
                                            whileInView={{ opacity: 1, x: 0 }}
                                            viewport={{ once: true }}
                                            transition={{ delay: i * 0.1 }}
                                            className="flex items-center gap-4 group"
                                        >
                                            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center group-hover:bg-blue-500 transition-colors">
                                                <CheckCircle className="h-5 w-5 text-blue-400 group-hover:text-white transition-colors" />
                                            </div>
                                            <span className="text-slate-200 font-medium">{item}</span>
                                        </motion.li>
                                    ))}
                                </ul>
                                
                                <Button variant="link" className="text-blue-400 hover:text-blue-300 p-0 h-auto font-semibold group">
                                    En savoir plus sur nos fonctionnalités <ArrowRight className="ml-2 w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                </Button>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, rotate: 2 }}
                                whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                                viewport={{ once: true }}
                                transition={{ type: "spring", duration: 0.8 }}
                                className="relative"
                            >
                                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-violet-600 rounded-2xl blur opacity-30 animate-pulse"></div>
                                <div className="relative rounded-xl border border-white/10 bg-[#0f1724]/90 backdrop-blur-xl shadow-2xl overflow-hidden">
                                    {/* Mockup Header */}
                                    <div className="flex items-center gap-2 px-4 py-3 border-b border-white/10 bg-white/5">
                                        <div className="flex gap-1.5">
                                            <div className="w-3 h-3 rounded-full bg-red-500/80" />
                                            <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                                            <div className="w-3 h-3 rounded-full bg-green-500/80" />
                                        </div>
                                        <div className="ml-4 h-4 w-32 rounded-full bg-white/10" />
                                    </div>
                                    {/* Mockup Content */}
                                    <div className="p-6 space-y-6">
                                        <div className="flex gap-4">
                                            <div className="w-1/3 space-y-3">
                                                <div className="h-8 w-full rounded-lg bg-blue-500/20 animate-pulse" />
                                                <div className="h-4 w-3/4 rounded bg-white/5" />
                                                <div className="h-4 w-1/2 rounded bg-white/5" />
                                                <div className="h-24 w-full rounded-lg bg-white/5 mt-4" />
                                            </div>
                                            <div className="w-2/3 space-y-4">
                                                <div className="h-40 w-full rounded-xl bg-gradient-to-br from-blue-500/10 to-violet-500/10 border border-white/5 p-4 relative overflow-hidden">
                                                    <div className="absolute top-0 right-0 p-4 opacity-20">
                                                        <Zap className="w-24 h-24 text-blue-500" />
                                                    </div>
                                                    <div className="relative z-10 space-y-2">
                                                        <div className="h-6 w-32 rounded bg-blue-500/30" />
                                                        <div className="h-4 w-48 rounded bg-white/10" />
                                                    </div>
                                                </div>
                                                <div className="flex gap-4">
                                                    <div className="h-20 w-1/2 rounded-xl bg-white/5 border border-white/5" />
                                                    <div className="h-20 w-1/2 rounded-xl bg-white/5 border border-white/5" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.div>
                        </div>
                    </div>
                </section>

                {/* How it Works */}
                <section className="container mx-auto px-4 py-24">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-center mb-20"
                    >
                        <h2 className="text-3xl md:text-4xl font-bold mb-6">Comment fonctionne Nexus</h2>
                        <p className="text-slate-400 text-lg">Trois étapes simples pour automatiser vos tâches répétitives.</p>
                    </motion.div>

                    <div className="grid md:grid-cols-3 gap-8 relative">
                        {/* Connecting Line (Desktop) */}
                        <div className="hidden md:block absolute top-16 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-blue-500/0 via-blue-500/30 to-blue-500/0 -z-10" />

                        {[
                            { step: "01", title: "Connecter", desc: "Liez vos applications préférées comme Google Sheets, Slack, et plus." },
                            { step: "02", title: "Construire", desc: "Créez des flux avec notre éditeur visuel glisser-déposer intuitif." },
                            { step: "03", title: "Lancer", desc: "Activez-le et regardez vos tâches s'accomplir automatiquement." }
                        ].map((item, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.2 }}
                                className="relative flex flex-col items-center text-center"
                            >
                                <div className="w-32 h-32 rounded-full bg-[#0f1724] border-4 border-blue-500/20 flex items-center justify-center mb-8 relative z-10 shadow-[0_0_30px_rgba(0,0,0,0.5)]">
                                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-3xl font-bold text-white shadow-inner">
                                        {item.step}
                                    </div>
                                </div>
                                <h3 className="text-2xl font-bold mb-4 text-white">{item.title}</h3>
                                <p className="text-slate-400 leading-relaxed max-w-xs">{item.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Testimonials */}
                <section className="py-24 bg-white/[0.02]">
                    <div className="container mx-auto px-4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            className="text-center mb-16"
                        >
                            <h2 className="text-3xl md:text-4xl font-bold mb-6">Adoré par des milliers d'utilisateurs</h2>
                            <p className="text-slate-400 text-lg">Ne nous croyez pas sur parole, écoutez ce qu'ils disent.</p>
                        </motion.div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {[
                                { name: "Alex Chen", role: "Développeur Senior", text: "Nexus m'a fait gagner des heures de travail chaque semaine. L'éditeur de workflow est intuitif et incroyablement puissant." },
                                { name: "Sarah Jones", role: "Directrice Marketing", text: "Le meilleur outil d'automatisation que j'ai utilisé. Il connecte tous nos outils marketing de manière transparente." },
                                { name: "Mike Ross", role: "Fondateur Startup", text: "Un ROI incroyable pour notre entreprise. Nous avons automatisé tout notre processus d'intégration en quelques minutes." }
                            ].map((t, i) => (
                                <motion.div
                                    key={i}
                                    initial={{ opacity: 0, y: 20 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: i * 0.1 }}
                                    whileHover={{ y: -5 }}
                                    className="p-8 rounded-2xl border border-white/5 bg-[#0f1724] shadow-xl hover:border-blue-500/30 transition-all"
                                >
                                    <div className="flex text-yellow-500 mb-6">
                                        {[...Array(5)].map((_, i) => <Star key={i} className="w-4 h-4 fill-current" />)}
                                    </div>
                                    <p className="mb-8 text-slate-300 leading-relaxed italic">"{t.text}"</p>
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-violet-600 flex items-center justify-center text-white font-bold text-lg shadow-lg">
                                            {t.name[0]}
                                        </div>
                                        <div>
                                            <p className="font-semibold text-white">{t.name}</p>
                                            <p className="text-sm text-slate-500">{t.role}</p>
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </div>
                </section>

                {/* FAQ Section */}
                <section className="container mx-auto px-4 py-24 max-w-3xl">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-6">Questions Fréquentes</h2>
                    </div>
                    <div className="space-y-4">
                        {[
                            { q: "Nexus est-il gratuit ?", a: "Oui, nous offrons une version gratuite généreuse pour les particuliers. Vous pouvez passer à Pro pour plus de puissance et de fonctionnalités." },
                            { q: "Puis-je connecter des API personnalisées ?", a: "Absolument. Notre fonctionnalité 'API Développeur' vous permet de connecter n'importe quel service disposant d'une API REST." },
                            { q: "Mes données sont-elles sécurisées ?", a: "Nous utilisons un chiffrement de niveau bancaire (AES-256) et ne stockons jamais vos identifiants en texte clair. La sécurité est notre priorité absolue." }
                        ].map((item, i) => (
                            <motion.div 
                                key={i}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="border border-white/10 rounded-xl bg-white/[0.02] overflow-hidden hover:bg-white/[0.04] transition-colors"
                            >
                                <details className="group">
                                    <summary className="flex justify-between items-center p-6 cursor-pointer list-none">
                                        <span className="font-medium text-lg text-slate-200">{item.q}</span>
                                        <ChevronDown className="w-5 h-5 text-slate-400 transition-transform duration-300 group-open:rotate-180" />
                                    </summary>
                                    <div className="px-6 pb-6 text-slate-400 leading-relaxed border-t border-white/5 pt-4">
                                        {item.a}
                                    </div>
                                </details>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* CTA Section */}
                <section className="container mx-auto px-4 py-24 text-center">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="max-w-5xl mx-auto space-y-8 p-12 md:p-20 rounded-[2.5rem] bg-gradient-to-b from-blue-900/20 to-[#0f1724] border border-blue-500/20 relative overflow-hidden shadow-2xl"
                    >
                        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-500/10 via-transparent to-transparent -z-10" />
                        <div className="absolute -top-24 -right-24 w-64 h-64 bg-blue-500/20 rounded-full blur-[80px]" />
                        <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-violet-500/20 rounded-full blur-[80px]" />

                        <h2 className="text-4xl md:text-6xl font-bold tracking-tight text-white">Prêt à automatiser ?</h2>
                        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                            Rejoignez plus de 10 000 utilisateurs qui gagnent du temps avec Nexus. <br/>Aucune carte de crédit requise pour commencer.
                        </p>
                        <div className="flex flex-col sm:flex-row justify-center gap-6 pt-8">
                            <Link href="/get-started">
                                <Button size="lg" className="px-10 h-16 text-xl bg-blue-600 hover:bg-blue-500 text-white rounded-full shadow-xl shadow-blue-600/20 hover:shadow-blue-600/40 transition-all hover:-translate-y-1">
                                    Commencer maintenant
                                </Button>
                            </Link>
                            <Link href="/contact">
                                <Button variant="outline" size="lg" className="px-10 h-16 text-xl border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white rounded-full transition-all hover:-translate-y-1">
                                    Contacter les ventes
                                </Button>
                            </Link>
                        </div>
                    </motion.div>
                </section>
            </main>
            <Footer />
        </div>
    );
}
