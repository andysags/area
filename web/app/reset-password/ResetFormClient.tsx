"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function ResetFormClient({ initialUid, initialToken }: { initialUid?: string | undefined, initialToken?: string | undefined }) {
  const router = useRouter();
  const token = initialToken;
  const uid = initialUid;

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!password || !confirm) {
      setError("Remplissez tous les champs.");
      return;
    }
    if (password !== confirm) {
      setError("Les mots de passe ne correspondent pas.");
      return;
    }

    setLoading(true);
    try {
      const payload: any = { new_password: password };
      if (uid) payload.uid = uid;
      if (token) payload.token = token;

      const apiRes = await fetch(`${API_BASE}/auth/password/reset/confirm/`, {
        method: "POST",
        mode: "cors",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (apiRes.ok) {
        setSuccess("Mot de passe réinitialisé. Vous pouvez maintenant vous connecter.");
        setTimeout(() => router.push('/login'), 1200);
        return;
      }

      if (apiRes.status === 404) {
        const serverConfirm = token && uid
          ? `${API_BASE.replace(/\/$/, '')}/accounts/password/reset/key/${uid}-${token}/`
          : `${API_BASE.replace(/\/$/, '')}/accounts/password/reset/`;
        window.open(serverConfirm, '_blank');
        setError("L'API de confirmation n'existe pas. La page de réinitialisation côté serveur a été ouverte.");
        return;
      }

      const text = await apiRes.text();
      try {
        const data = text ? JSON.parse(text) : null;
        setError(data?.detail || JSON.stringify(data) || `Erreur ${apiRes.status}`);
      } catch {
        setError(text || `Erreur ${apiRes.status}`);
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
        <h1 className="text-2xl font-semibold mb-2">Réinitialiser le mot de passe</h1>
        <p className="text-sm text-zinc-400 mb-4">Saisissez votre nouveau mot de passe. Le lien que vous avez reçu doit contenir un token (ou uid + token) en query string ou dans l'URL.</p>

        {error && <div className="mb-4 text-sm text-red-400">{error}</div>}
        {success && <div className="mb-4 text-sm text-green-400">{success}</div>}

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label htmlFor="password" className="block text-sm mb-1">Nouveau mot de passe</label>
            <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-md border border-white/10 bg-transparent px-3 py-2" />
          </div>

          <div>
            <label htmlFor="confirm" className="block text-sm mb-1">Confirmer</label>
            <input id="confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="w-full rounded-md border border-white/10 bg-transparent px-3 py-2" />
          </div>

          <button type="submit" disabled={loading} className="w-full rounded-full bg-gradient-to-br from-blue-600 to-violet-600 py-2 text-white disabled:opacity-60">{loading ? 'Validation…' : 'Valider'}</button>
        </form>

        <p className="mt-6 text-sm text-zinc-400">Retour à la <Link href="/login" className="text-blue-400 hover:underline">connexion</Link></p>
      </div>
    </div>
  );
}
