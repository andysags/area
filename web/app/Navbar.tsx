"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { Logo } from "./logo";
import useAuthClient from "./hooks/useAuthClient";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { isAuthenticated, logout, user } = useAuthClient();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <nav className="fixed top-0 left-0 w-full z-[100] bg-[#0f1724]/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-center justify-between h-16">
          {/* Left: Logo */}
          <Link href="/dashboard#hero" className="flex items-center gap-3 group text-zinc-50">
            <Logo className="w-9 h-9" />
            <span className="font-semibold text-lg transition-colors group-hover:text-blue-400">Nexus</span>
          </Link>

          {/* Center: Links (hidden on small screens) */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/dashboard" className="text-sm text-zinc-300 hover:text-white">Dashboard</Link>
            <Link href="/areas" className="text-sm text-zinc-300 hover:text-white">Areas</Link>
            <Link href="/logs" className="text-sm text-zinc-300 hover:text-white">Logs</Link>
            <Link href="/services" className="text-sm text-zinc-300 hover:text-white">Services</Link>
            <Link href="/explore" className="text-sm text-zinc-300 hover:text-white">Explore</Link>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-sm font-bold text-white hover:ring-2 hover:ring-white/20 transition-all"
                >
                  {user?.first_name && user?.last_name
                    ? (user.first_name[0] + user.last_name[0]).toUpperCase()
                    : (user?.first_name?.[0] || user?.email?.[0] || "?").toUpperCase()}
                </button>

                {dropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-[#1a1a1a] border border-white/10 rounded-lg shadow-xl py-2 z-50">
                    <div className="px-4 py-3 border-b border-white/5">
                      <p className="text-xs text-zinc-400 mb-2">{user?.email}</p>
                      <div className="flex items-center justify-between p-2 -mx-2 rounded-md hover:bg-white/5 transition-colors cursor-pointer group">
                        <div className="flex items-center gap-3">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-200 text-blue-700 font-semibold text-sm">
                            {user?.first_name && user?.last_name
                              ? (user.first_name[0] + user.last_name[0]).toUpperCase()
                              : (user?.first_name?.[0] || user?.email?.[0] || "?").toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">
                              {user?.first_name ? `${user.first_name} ${user.last_name || ''}` : 'Utilisateur'}
                            </p>
                            <p className="text-xs text-blue-400">Individual</p>
                          </div>
                        </div>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-500"><polyline points="20 6 9 17 4 12"></polyline></svg>
                      </div>
                    </div>

                    <div className="py-1">
                      <Link
                        href="/settings"
                        onClick={() => setDropdownOpen(false)}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-zinc-300 hover:bg-white/5 hover:text-white transition-colors text-left"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.1a2 2 0 0 1-1-1.72v-.51a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                        Paramètres
                      </Link>
                      <button
                        onClick={() => {
                          logout('/login');
                          setDropdownOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-2 text-sm text-zinc-300 hover:bg-white/5 hover:text-white transition-colors text-left"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                        Déconnexion
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <>
                <Link href="/login" className="text-sm text-zinc-300 hover:text-white">Login</Link>
                <Link href="/get-started" className="hidden sm:inline-flex items-center px-4 py-2 rounded-full bg-gradient-to-br from-blue-600 to-violet-600 text-white hover:from-blue-700 hover:to-violet-700 shadow-md">
                  Commencer
                </Link>
              </>
            )}

            {/* Mobile menu button */}
            <button
              aria-label="Toggle menu"
              className="md:hidden p-2 rounded-lg focus:outline-none"
              onClick={() => setOpen((s) => !s)}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                {open ? (
                  <path d="M6 18L18 6M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                ) : (
                  <path d="M3 6h18M3 12h18M3 18h18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>
      {/* Mobile menu */}
      {open && (
        <div className="md:hidden bg-background/80 backdrop-blur-sm">
          <div className="max-w-7xl mx-auto px-6 py-3 space-y-2">
            <Link href="/dashboard" className="block px-3 py-2 rounded-md text-base font-medium text-muted-foreground">Dashboard</Link>
            <Link href="/areas" className="block px-3 py-2 rounded-md text-base font-medium text-muted-foreground">My AREAs</Link>
            <Link href="/services" className="block px-3 py-2 rounded-md text-base font-medium text-muted-foreground">Services</Link>
            <Link href="/explore" className="block px-3 py-2 rounded-md text-base font-medium text-muted-foreground">Explore</Link>
            <div className="pt-2 border-t border-border">
              {isAuthenticated ? (
                <>
                  {/* Log out button removed */}
                </>
              ) : (
                <>
                  <Link href="/login" className="block px-3 py-2 rounded-md text-base font-medium text-muted-foreground">Login</Link>
                  <Link href="/get-started" className="block mt-2 px-3 py-2 rounded-full bg-gradient-to-br from-blue-600 to-violet-600 text-white text-center">Commencer</Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
