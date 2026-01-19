"use client";

import { useState } from "react";
import Link from "next/link";
import { getGoogleOAuthUrl } from "../../lib/oauth";
import { useRouter } from 'next/navigation';
import TwoFactorVerify from './TwoFactorVerify';

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false);
  const router = useRouter();
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  if (!process.env.NEXT_PUBLIC_API_URL) console.warn('Using fallback API_BASE http://localhost:8080 — set NEXT_PUBLIC_API_URL in web/.env.local');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    if (!API_BASE) {
      setError('Configuration error: NEXT_PUBLIC_API_URL is not set. Create `web/.env.local` with NEXT_PUBLIC_API_URL=http://localhost:8080 and restart the dev server.');
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/auth/login/`, {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const text = await res.text();
      let data: any = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch (parseErr) {
        data = text;
      }

      if (!res.ok) {
        // Map common auth errors to friendly French messages
        if (res.status === 401) {
          setError("Email ou mot de passe incorrect.");
        } else if (res.status === 429) {
          setError("Trop de tentatives. Réessaie dans quelques minutes.");
        } else if (data?.detail) {
          setError(String(data.detail));
        } else {
          const msg = JSON.stringify(data) || `Login failed (${res.status})`;
          setError(msg);
        }
        setLoading(false);
        return;
      }

      // Check if 2FA is required
      if (data?.requires_2fa) {
        setRequires2FA(true);
        setLoading(false);
        return;
      }

      // Expecting SimpleJWT response: { access: '...', refresh: '...' }
      if (data?.access) localStorage.setItem('access_token', data.access);
      if (data?.refresh) localStorage.setItem('refresh_token', data.refresh);

      // Try to fetch user profile and store it
      try {
        const profileRes = await fetch(`${API_BASE}/auth/me/`, {
          headers: { 'Authorization': `Bearer ${data?.access}` }
        });
        if (profileRes.ok) {
          const profile = await profileRes.json();
          localStorage.setItem('current_user', JSON.stringify(profile));
          // notify other client components that auth state changed
          try { window.dispatchEvent(new Event('auth-changed')); } catch {}
        }
      } catch (pfErr) {
        // non-blocking
        console.warn('Failed to fetch profile after login', pfErr);
      }

      setLoading(false);
      // Redirect to home so the authenticated navbar is shown there
      router.push('/');
    } catch (err) {
      console.error('Login fetch error:', err);
      const msg = err instanceof Error ? err.message : String(err);
      setError(`Network error: ${msg}. Ensure the backend is running and CORS allows requests from this origin.`);
      setLoading(false);
    }
  }

  // Si 2FA requis, afficher le composant de vérification 2FA
  if (requires2FA) {
    return <TwoFactorVerify email={email} onBack={() => {
      setRequires2FA(false);
      setPassword("");
      setError(null);
    }} />;
  }

  return (
    <div className="w-full max-w-sm p-8 bg-zinc-900/40 rounded-xl shadow-lg">
      <h1 className="text-2xl font-semibold mb-2">Bienvenue</h1>
      <p className="text-sm text-zinc-400 mb-6">Saisissez votre e‑mail pour vous connecter à votre compte</p>

      {error && <div className="mb-4 text-sm text-red-400">{error}</div>}

      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label htmlFor="email" className="block text-sm mb-1">E‑mail</label>
          <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nom@exemple.com" className="w-full rounded-md border border-white/10 bg-transparent px-3 py-2" />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label htmlFor="password" className="text-sm">Mot de passe</label>
            <Link href="/forgot-password" className="text-sm text-blue-400 hover:underline">Mot de passe oublié ?</Link>
          </div>
          <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-md border border-white/10 bg-transparent px-3 py-2" />
        </div>

        <button type="submit" disabled={loading} className="w-full rounded-full bg-gradient-to-br from-blue-600 to-violet-600 py-2 text-white disabled:opacity-60">{loading ? 'Connexion…' : 'Se connecter'}</button>
      </form>

      <div className="mt-6 text-center text-sm text-zinc-400">Ou continuer avec</div>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => {
              window.location.href = getGoogleOAuthUrl();
          }}
          className="rounded-md border border-white/10 py-2"
        >Google</button>
        <button
          type="button"
          onClick={() => {
            // TODO: implémenter OAuth GitHub si nécessaire
          }}
          className="rounded-md border border-white/10 py-2"
        >GitHub</button>
      </div>

      <p className="mt-6 text-center text-sm text-zinc-300">
        <Link href="/get-started" className="text-blue-400 hover:underline">Vous n'avez pas de compte ? Inscrivez‑vous</Link>
      </p>
    </div>
  );
}
