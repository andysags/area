import React from 'react';
import Link from 'next/link';
import { Logo } from './logo';

function IconSvg({ children, className = '', viewBox = '0 0 24 24' }: any) {
    return (
        <svg viewBox={viewBox} className={className} fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            {children}
        </svg>
    );
}

const Github = ({ className = '' }: any) => (
    <IconSvg className={className}>
        <path d="M12 2C7 2 3.5 5.5 3.5 10.2c0 3.3 2.2 6.1 5.2 7.1.4.1.6-.2.6-.4v-1.4c-2.1.5-2.6-1-2.6-1-.4-1.1-1-1.4-1-1.4-.8-.6.1-.6.1-.6.9.1 1.4.9 1.4.9.7 1.2 1.9.9 2.4.7.1-.6.3-1 .6-1.2-1.7-.2-3.5-.9-3.5-4 0-.9.3-1.6.9-2.2-.1-.2-.4-1.1.1-2.3 0 0 .7-.2 2.3.8.7-.2 1.5-.3 2.3-.3s1.6.1 2.3.3c1.6-1 2.3-.8 2.3-.8.5 1.2.2 2.1.1 2.3.6.6.9 1.3.9 2.2 0 3.1-1.8 3.8-3.5 4 .3.3.6.8.6 1.6v2.4c0 .2.2.5.6.4 3-1 5.2-3.8 5.2-7.1C20.5 5.5 17 2 12 2z" />
    </IconSvg>
);
const Twitter = ({ className = '' }: any) => (
    <IconSvg className={className}>
        <path d="M23 4.5c-.8.4-1.6.6-2.5.8.9-.5 1.6-1.3 1.9-2.3-.9.5-1.8.9-2.8 1.1C18.7 3.6 17.6 3 16.3 3c-2 0-3.5 1.8-3 3.6C9.7 6.3 6.6 4.5 4 2.1c-.7 1.2-.3 2.9 1 3.7-.7 0-1.4-.2-2-.6v.1c0 1.6 1.1 3 2.6 3.3-.6.2-1.2.2-1.8.1.5 1.6 2 2.8 3.8 2.8C8 14.6 6 15.2 4 15c1.8 1.1 3.9 1.8 6.1 1.8 7.3 0 11.3-6 11.3-11.3v-.5c.8-.6 1.4-1.3 1.9-2.1-.7.3-1.4.5-2.2.6z" />
    </IconSvg>
);
const Linkedin = ({ className = '' }: any) => (
    <IconSvg className={className}>
        <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4V8h4v1a4 4 0 0 1 4-1zM2 9h4v12H2zM4 3a2 2 0 1 1 0 4 2 2 0 0 1 0-4z" />
    </IconSvg>
);
const Mail = ({ className = '' }: any) => (
    <IconSvg className={className}>
        <path d="M3 7v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7L12 13 3 7z" />
        <path d="M21 7l-9 6L3 7" />
    </IconSvg>
);

export default function Footer() {
    return (
        <footer className="border-t border-white/5 bg-background/50 backdrop-blur-lg pt-16 pb-8">
            <div className="container mx-auto px-4">
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
                    <div className="col-span-2 lg:col-span-2">
                        <Link href="/" className="flex items-center space-x-2 mb-4">
                            <Logo className="w-8 h-8 text-primary" />
                            <span className="font-bold text-xl tracking-tight">Nexus</span>
                        </Link>
                        <p className="text-muted-foreground max-w-xs mb-6">
                            Automatise ta vie numérique grâce à la puissance de la connexion.
                            Des flux sécurisés, rapides et fiables pour tous.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Github">
                                <Github className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Twitter">
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-muted-foreground hover:text-primary transition-colors" aria-label="LinkedIn">
                                <Linkedin className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-muted-foreground hover:text-primary transition-colors" aria-label="Mail">
                                <Mail className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-4">Produit</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/features" className="hover:text-foreground transition-colors">Fonctionnalités</Link></li>
                            <li><Link href="/pricing" className="hover:text-foreground transition-colors">Tarifs</Link></li>
                            <li><Link href="/explore" className="hover:text-foreground transition-colors">Modèles</Link></li>
                            <li><Link href="/services" className="hover:text-foreground transition-colors">Intégrations</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-4">Ressources</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/docs" className="hover:text-foreground transition-colors">Documentation</Link></li>
                            <li><Link href="/api" className="hover:text-foreground transition-colors">Référence API</Link></li>
                            <li><Link href="/blog" className="hover:text-foreground transition-colors">Blog</Link></li>
                            <li><Link href="/community" className="hover:text-foreground transition-colors">Communauté</Link></li>
                        </ul>
                    </div>

                    <div>
                        <h4 className="font-semibold mb-4">Entreprise</h4>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li><Link href="/about" className="hover:text-foreground transition-colors">À propos</Link></li>
                            <li><Link href="/careers" className="hover:text-foreground transition-colors">Carrières</Link></li>
                            <li><Link href="/legal" className="hover:text-foreground transition-colors">Mentions légales</Link></li>
                            <li><Link href="/contact" className="hover:text-foreground transition-colors">Contact</Link></li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-sm text-muted-foreground">
                        © {new Date().getFullYear()} Nexus Inc. Tous droits réservés.
                    </p>
                    <div className="flex gap-6 text-sm text-muted-foreground">
                        <Link href="/privacy" className="hover:text-foreground transition-colors">Politique de confidentialité</Link>
                        <Link href="/terms" className="hover:text-foreground transition-colors">Conditions d'utilisation</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
