"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface TwoFactorVerifyProps {
  email: string;
  onBack: () => void;
}

export default function TwoFactorVerify({ email, onBack }: TwoFactorVerifyProps) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8080/auth/2fa/verify/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          code,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.detail || "Code invalide");
      }

      const data = await response.json();
      
      // Sauvegarder les tokens
      localStorage.setItem("access_token", data.access);
      localStorage.setItem("refresh_token", data.refresh);

      // Récupérer le profil utilisateur
      const profileResponse = await fetch("http://localhost:8080/auth/me/", {
        headers: {
          Authorization: `Bearer ${data.access}`,
        },
      });

      if (profileResponse.ok) {
        const profile = await profileResponse.json();
        localStorage.setItem("current_user", JSON.stringify(profile));
      }

      // Déclencher l'événement de changement d'auth
      window.dispatchEvent(new Event("auth-changed"));

      // Rediriger
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Une erreur est survenue");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0f1724] via-[#1a2332] to-[#0f1724] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-[#1e293b]/80 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-violet-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Vérification 2FA</h1>
            <p className="text-zinc-400">
              Entrez le code envoyé à votre email
            </p>
          </div>

          <form onSubmit={handleVerify} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3">
              <p className="text-blue-400 text-xs flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                  <polyline points="22,6 12,13 2,6"></polyline>
                </svg>
                Un code a été envoyé à <strong>{email}</strong>
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Code à 6 chiffres
              </label>
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                maxLength={6}
                className="w-full px-4 py-3 rounded-lg border border-white/10 bg-[#0f1724] text-white text-center text-2xl tracking-widest focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder-zinc-600"
                required
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="w-full py-3 bg-gradient-to-r from-blue-600 to-violet-600 hover:from-blue-500 hover:to-violet-500 text-white font-semibold rounded-lg transition-all shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Vérification...
                </span>
              ) : (
                "Vérifier"
              )}
            </button>

            <button
              type="button"
              onClick={onBack}
              className="w-full py-3 border border-white/10 hover:bg-white/5 text-zinc-300 font-medium rounded-lg transition-colors"
            >
              Retour
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-zinc-500">
              Vous n'avez pas reçu le code ?<br />
              <a href="/forgot-password" className="text-blue-400 hover:text-blue-300 transition-colors">
                Réinitialiser votre compte
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
