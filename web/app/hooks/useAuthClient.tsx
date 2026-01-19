"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type User = any | null;

export default function useAuthClient() {
  const [user, setUser] = useState<User>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  useEffect(() => {
    if (typeof window === "undefined") return;

    let mounted = true;

    async function refreshAuth() {
      if (!mounted) return;
      const token = localStorage.getItem("access_token");
      const current = localStorage.getItem("current_user");

      if (current) {
        try {
          setUser(JSON.parse(current));
        } catch (e) {
          setUser(null);
        }
        setLoading(false);
        return;
      }

      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }

      // Try to refresh profile from backend if token exists
      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
        let res = await fetch(`${API_BASE}/auth/me/`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (res.status === 401) {
          const refresh = localStorage.getItem("refresh_token");
          if (refresh) {
            try {
              const refreshRes = await fetch(`${API_BASE}/auth/refresh/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ refresh })
              });
              if (refreshRes.ok) {
                const data = await refreshRes.json();
                localStorage.setItem("access_token", data.access);
                // Retry me with new token
                res = await fetch(`${API_BASE}/auth/me/`, {
                  headers: { Authorization: `Bearer ${data.access}` },
                });
              }
            } catch (e) {
              // refresh failed
            }
          }
        }

        if (!mounted) return;
        if (res.ok) {
          const profile = await res.json();
          try { localStorage.setItem("current_user", JSON.stringify(profile)); } catch { }
          setUser(profile);
        } else {
          setUser(null);
          // If auth failed (and refresh failed), clear invalid tokens
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("current_user");
        }
      } catch (err) {
        setUser(null);
      } finally {
        setLoading(false);
      }
    }

    // initial check
    refreshAuth();

    // listen to custom events so other parts of the SPA can notify login/logout
    const onAuthChanged = () => {
      setLoading(true);
      refreshAuth();
    };

    window.addEventListener('auth-changed', onAuthChanged);

    return () => {
      mounted = false;
      window.removeEventListener('auth-changed', onAuthChanged);
    };
  }, []);

  const logout = useCallback(async (redirect = "/") => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("access_token");
      try {
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";
        // best-effort logout on backend (if endpoint exists)
        await fetch(`${API_BASE}/auth/logout/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: token ? `Bearer ${token}` : "",
          },
        });
      } catch (e) {
        // ignore errors
      }
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("current_user");
      // notify other components in the SPA that auth state changed
      try { window.dispatchEvent(new Event('auth-changed')); } catch { }
    }
    router.push(redirect);
  }, [router]);

  const refreshUser = useCallback(async () => {
    if (typeof window === "undefined") return;
    
    const token = localStorage.getItem("access_token");
    if (!token) return;

    try {
      const res = await fetch("http://localhost:8080/auth/me/", {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      if (res.ok) {
        const profile = await res.json();
        try { 
          localStorage.setItem("current_user", JSON.stringify(profile)); 
        } catch {}
        setUser(profile);
      }
    } catch (err) {
      console.error("Error refreshing user:", err);
    }
  }, []);

  return {
    user,
    token: typeof window !== "undefined" ? localStorage.getItem("access_token") : null,
    loading,
    isAuthenticated: !!user,
    logout,
    refreshUser,
  } as const;
}
