"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setLoading(true);

    if (!email) {
      setError("Veuillez saisir votre adresse e‑mail.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/auth/password/reset/`, {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setSuccess("Si un compte existe avec cet e‑mail, un lien de réinitialisation a été envoyé.");
      } else {
        const text = await res.text();
        try {
          const data = text ? JSON.parse(text) : null;
          setError(data?.detail || JSON.stringify(data) || `Erreur ${res.status}`);
        } catch {
          setError(text || `Erreur ${res.status}`);
        }
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setError(`Erreur réseau : ${msg}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center bg-[#0f1724] text-zinc-100 px-4">
      <div className="w-full max-w-sm p-8 bg-zinc-900/40 rounded-xl shadow-lg">
        <h1 className="text-2xl font-semibold mb-2">Mot de passe oublié</h1>
        <p className="text-sm text-zinc-400 mb-4">Indiquez l'adresse e‑mail associée à votre compte. Nous vous enverrons un lien pour réinitialiser votre mot de passe.</p>

        {error && <div className="mb-4 text-sm text-red-400">{error}</div>}
        {success && <div className="mb-4 text-sm text-green-400">{success}</div>}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="email" className="block text-sm mb-1">E‑mail</label>
            <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nom@exemple.com" className="w-full rounded-md border border-white/10 bg-transparent px-3 py-2" />
          </div>

          <button type="submit" disabled={loading} className="w-full rounded-full bg-gradient-to-br from-blue-600 to-violet-600 py-2 text-white disabled:opacity-60">{loading ? 'Envoi…' : 'Send reset email'}</button>
        </form>

        <p className="mt-6 text-sm text-zinc-400">Retour à la <Link href="/login" className="text-blue-400 hover:underline">connexion</Link></p>
      </div>
    </div>
  );
}
