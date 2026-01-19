'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function GoogleCallbackContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const code = searchParams.get('code');
        if (!code) {
            setError('No code provided by Google.');
            return;
        }

        const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
        const redirectUri = process.env.NEXT_PUBLIC_GOOGLE_REDIRECT_URI || 'http://localhost:8081/oauth/google/callback';

        // We need to exchange the code for JWT
        fetch(`${API_BASE}/auth/google/login/`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ code, redirect_uri: redirectUri })
        })
            .then(async (res) => {
                if (!res.ok) {
                    const txt = await res.text();
                    throw new Error(txt);
                }
                return res.json();
            })
            .then(data => {
                // Store tokens
                localStorage.setItem('access_token', data.access);
                if (data.refresh) localStorage.setItem('refresh_token', data.refresh);

                // Fetch user profile to ensure "current_user" is set (like in LoginForm)
                fetch(`${API_BASE}/auth/me/`, {
                    headers: { 'Authorization': `Bearer ${data.access}` }
                }).then(res => res.json()).then(profile => {
                    localStorage.setItem('current_user', JSON.stringify(profile));
                    try { window.dispatchEvent(new Event('auth-changed')); } catch { }
                    router.push('/');
                }).catch(() => {
                    // Even if profile fetch fails, we have token, so redirect home
                    router.push('/');
                });
            })
            .catch(err => {
                console.error("Google login error:", err);
                setError("Google Login failed. See console for details.");
            });

    }, [searchParams, router]);

    if (error) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="p-4 bg-red-900/50 border border-red-500 rounded text-center">
                    <h1 className="text-xl font-bold text-red-100 mb-2">Login Error</h1>
                    <p className="text-red-200">{error}</p>
                    <button onClick={() => router.push('/login')} className="mt-4 px-4 py-2 bg-zinc-800 rounded hover:bg-zinc-700 transition">Back to Login</button>
                </div>
            </div>
        )
    }

    return (
        <div className="flex min-h-screen items-center justify-center">
            <div className="animate-pulse flex flex-col items-center">
                <div className="h-8 w-8 rounded-full border-2 border-t-transparent border-blue-500 animate-spin mb-2"></div>
                <p className="text-zinc-400">Authenticating with Google...</p>
            </div>
        </div>
    );
}

export default function GoogleCallbackPage() {
    return (
        <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-zinc-400">Loading...</div>}>
            <GoogleCallbackContent />
        </Suspense>
    );
}
