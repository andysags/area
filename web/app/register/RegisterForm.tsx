"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const specialChars = /[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]/;

export default function RegisterForm() {
  const router = useRouter();
  const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
  if (!process.env.NEXT_PUBLIC_API_URL) console.warn('Using fallback API_BASE http://localhost:8080 — set NEXT_PUBLIC_API_URL in web/.env.local');

  const [email, setEmail] = useState("");
  const [pseudo, setPseudo] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [accept, setAccept] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string> | null>(null);

  function validate() {
    const errs: string[] = [];
    if (!emailRegex.test(email)) errs.push('Email: adresse unique (format email).');
    if (password.length < 8) errs.push('Mot de passe: au moins 8 caractères.');
    if (!/[a-z]/.test(password)) errs.push('Mot de passe: contient au moins 1 minuscule.');
    if (!/[A-Z]/.test(password)) errs.push('Mot de passe: contient au moins 1 majuscule.');
    if (!/[0-9]/.test(password)) errs.push('Mot de passe: contient au moins 1 chiffre.');
    if (!specialChars.test(password)) errs.push('Mot de passe: contient au moins 1 caractère spécial.');
    if (password !== confirm) errs.push('Confirmation du mot de passe: doit correspondre.');
    if (!accept) errs.push('Acceptation des CGU/Confidentialité requise.');
    return errs;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErrors(null);
    setFieldErrors(null);
    const v = validate();
    if (v.length) {
      setErrors(v.join('\n'));
      return;
    }
    setLoading(true);
    if (!API_BASE) {
      setErrors('Configuration error: NEXT_PUBLIC_API_URL is not set. Create `web/.env.local` with NEXT_PUBLIC_API_URL=http://localhost:8080 and restart the dev server.');
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${API_BASE}/auth/register/`, {
        method: 'POST',
        mode: 'cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, first_name: firstName, last_name: lastName, pseudo }),
      });
      const text = await res.text();
      let data: any = null;
      try {
        data = text ? JSON.parse(text) : null;
      } catch (parseErr) {
        data = text;
      }
      if (!res.ok) {
        // If backend returns DRF-style field errors like {"email": ["..."]}, map them
        if (data && typeof data === 'object') {
          const fldErrs: Record<string, string> = {};
          for (const [k, v] of Object.entries(data)) {
            if (Array.isArray(v)) fldErrs[k] = v.join(' ');
            else fldErrs[k] = String(v);
          }
          setFieldErrors(fldErrs);
          setErrors(`Server responded with ${res.status}: ${JSON.stringify(data)}`);
        } else {
          const msg = typeof data === 'string' ? data : JSON.stringify(data);
          setErrors(`Server responded with ${res.status}: ${msg}`);
        }
        setLoading(false);
        return;
      }
      setLoading(false);
      // Try to auto-login the user immediately so they land authenticated on the homepage
      try {
        const loginRes = await fetch(`${API_BASE}/auth/login/`, {
          method: 'POST',
          mode: 'cors',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password }),
        });
        const loginText = await loginRes.text();
        let loginData: any = null;
        try { loginData = loginText ? JSON.parse(loginText) : null; } catch (e) { loginData = null; }

        if (loginRes.ok && loginData?.access) {
          localStorage.setItem('access_token', loginData.access);
          if (loginData?.refresh) localStorage.setItem('refresh_token', loginData.refresh);

          // fetch profile and store it
          try {
            const profileRes = await fetch(`${API_BASE}/auth/me/`, {
              headers: { 'Authorization': `Bearer ${loginData.access}` }
            });
            if (profileRes.ok) {
              const profile = await profileRes.json();
              localStorage.setItem('current_user', JSON.stringify(profile));
              // notify SPA components that auth state changed
              try { window.dispatchEvent(new Event('auth-changed')); } catch {}
            }
          } catch (pfErr) {
            console.warn('Failed to fetch profile after register+login', pfErr);
          }

          // Redirect to home (authenticated)
          router.push('/');
          return;
        }
      } catch (autoErr) {
        console.warn('Auto-login after register failed:', autoErr);
      }

      // If auto-login failed or not available, redirect to home (user can login)
      router.push('/');
    } catch (err) {
      // Network or CORS error
      // err may be a TypeError with message like 'Failed to fetch' or 'Load failed'
      console.error('Register fetch error:', err);
      const msg = err instanceof Error ? err.message : String(err);
      setErrors(`Network error: ${msg}. Ensure the backend is running and CORS allows requests from this origin (check server logs). Expected API base: ${API_BASE || 'http://localhost:8080'}`);
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-md p-8 bg-zinc-900/40 rounded-xl shadow-lg">
      <h2 className="text-2xl font-semibold mb-4">Inscription</h2>

      {errors && <pre className="mb-4 text-sm text-red-400 whitespace-pre-wrap">{errors}</pre>}

      <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full rounded-md border border-white/10 bg-transparent px-3 py-2" />
            {fieldErrors?.email && <div className="mt-1 text-sm text-red-400">{fieldErrors.email}</div>}
          </div>

          <div>
            <label className="block text-sm mb-1">Pseudo</label>
            <input type="text" value={pseudo} onChange={(e) => setPseudo(e.target.value)} className="w-full rounded-md border border-white/10 bg-transparent px-3 py-2" />
            {fieldErrors?.pseudo && <div className="mt-1 text-sm text-red-400">{fieldErrors.pseudo}</div>}
          </div>

        <div>
          <label className="block text-sm mb-1">Mot de passe</label>
          <input aria-describedby="password-hint" type="password" value={password} onChange={(e) => setPassword(e.target.value)} className={`w-full rounded-md border px-3 py-2 bg-transparent ${password.length > 0 && password.length < 8 ? 'border-red-400' : 'border-white/10'}`} />
          <div id="password-hint" className="mt-2 text-sm">
            <div className="mb-2">
              {password.length === 0 ? (
                <span className="text-zinc-400">Règles du mot de passe :</span>
              ) : (
                <span className="text-zinc-300">Règles du mot de passe :</span>
              )}
            </div>
            <ul className="space-y-1">
              {/* length */}
              <li className={password.length >= 8 ? 'text-green-400' : 'text-red-400'}>
                {password.length >= 8 ? '✓' : '✗'} Au moins 8 caractères ({password.length}/8)
              </li>
              {/* lowercase */}
              <li className={/[a-z]/.test(password) ? 'text-green-400' : 'text-red-400'}>
                {/[a-z]/.test(password) ? '✓' : '✗'} Contient une lettre minuscule
              </li>
              {/* uppercase */}
              <li className={/[A-Z]/.test(password) ? 'text-green-400' : 'text-red-400'}>
                {/[A-Z]/.test(password) ? '✓' : '✗'} Contient une lettre majuscule
              </li>
              {/* digit */}
              <li className={/[0-9]/.test(password) ? 'text-green-400' : 'text-red-400'}>
                {/[0-9]/.test(password) ? '✓' : '✗'} Contient un chiffre
              </li>
              {/* special */}
              <li className={specialChars.test(password) ? 'text-green-400' : 'text-red-400'}>
                {specialChars.test(password) ? '✓' : '✗'} Contient un caractère spécial
              </li>
            </ul>
          </div>
        </div>

        <div>
          <label className="block text-sm mb-1">Confirmation du mot de passe</label>
          <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="w-full rounded-md border border-white/10 bg-transparent px-3 py-2" />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm mb-1">Prénom (optionnel)</label>
            <input type="text" value={firstName} onChange={(e) => setFirstName(e.target.value)} className="w-full rounded-md border border-white/10 bg-transparent px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm mb-1">Nom (optionnel)</label>
            <input type="text" value={lastName} onChange={(e) => setLastName(e.target.value)} className="w-full rounded-md border border-white/10 bg-transparent px-3 py-2" />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <input id="accept" type="checkbox" checked={accept} onChange={(e) => setAccept(e.target.checked)} />
          <label htmlFor="accept" className="text-sm text-zinc-300">J'accepte les CGU et la politique de confidentialité</label>
        </div>

        <button type="submit" disabled={loading} className="w-full rounded-full bg-gradient-to-br from-blue-600 to-violet-600 py-2 text-white disabled:opacity-60">{loading ? 'Inscription…' : "S'inscrire"}</button>
      </form>

      <div className="mt-6 text-center text-sm text-zinc-400">
        Déjà un compte ?{" "}
        <Link href="/login" className="text-blue-400 hover:text-blue-300 font-medium">
          Se connecter
        </Link>
      </div>

      <p className="mt-4 text-sm text-zinc-400">Le champ <strong>Pseudo</strong> sera enregistré comme nom affiché (affiché dans le profil).</p>
      <p className="mt-2 text-sm text-zinc-400">Avatar: pris en charge mais disponible via édition de profil.</p>
    </div>
  );
}
