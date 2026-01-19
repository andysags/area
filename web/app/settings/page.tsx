"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import useAuthClient from "../hooks/useAuthClient";
import { Logo } from "../logo";

// Development logging helper
const isDev = process.env.NODE_ENV === 'development';
const devLog = (...args: any[]) => {
  if (isDev && typeof window !== 'undefined') {
    // eslint-disable-next-line no-console
    console.log(...args);
  }
};
const devError = (...args: any[]) => {
  if (isDev && typeof window !== 'undefined') {
    // eslint-disable-next-line no-console
    console.error(...args);
  }
};

export default function SettingsPage() {
  const { user, isAuthenticated, loading, refreshUser } = useAuthClient();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("My profile");

  // Form states
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Email change modal states
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailPassword, setEmailPassword] = useState("");
  const [savingEmail, setSavingEmail] = useState(false);

  // Notification preferences
  const [productUpdates, setProductUpdates] = useState(true);
  const [marketingEmails, setMarketingEmails] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);

  // Password change modal
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);

  // Delete account modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deletePassword, setDeletePassword] = useState("");
  const [deletingAccount, setDeletingAccount] = useState(false);

  // 2FA states
  const [show2FAModal, setShow2FAModal] = useState(false);
  const [show2FADisableModal, setShow2FADisableModal] = useState(false);
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(false);
  const [qrCode, setQrCode] = useState("");
  const [twoFactorSecret, setTwoFactorSecret] = useState("");
  const [verificationCode, setVerificationCode] = useState("");
  const [disablePassword, setDisablePassword] = useState("");
  const [loading2FA, setLoading2FA] = useState(false);

  // Sessions states
  const [sessions, setSessions] = useState<any[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [showSessionModal, setShowSessionModal] = useState(false);
  const [selectedSession, setSelectedSession] = useState<any>(null);

  // Avatar states
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatarKey, setAvatarKey] = useState(0); // Force image reload

  // Force reload user data
  const forceReloadUser = async () => {
    const token = localStorage.getItem("access_token");
    if (!token) return null;

    try {
      const res = await fetch("http://localhost:8080/auth/me/", {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (res.ok) {
        const profile = await res.json();
        localStorage.setItem("current_user", JSON.stringify(profile));

        // Update avatar immediately
        setAvatarUrl(profile.avatar);
        setAvatarKey(prev => prev + 1); // Force re-render

        // Trigger auth-changed event to update all components
        window.dispatchEvent(new Event('auth-changed'));
        return profile;
      }
    } catch (err) {
      devError("Error reloading user:", err);
    }
    return null;
  };

  // Initialize form with user data
  useEffect(() => {
    if (user) {
      setFirstName(user.first_name || "");
      setLastName(user.last_name || "");
      setTwoFactorEnabled(user.two_factor_enabled || false);
      setAvatarUrl(user.avatar || null);
      loadNotificationPreferences();
      loadSessions();
    }
  }, [user]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      router.push("/login");
    }
  }, [loading, isAuthenticated, router]);




  // Load notification preferences
  const loadNotificationPreferences = async () => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      const response = await fetch("http://localhost:8080/auth/notifications/preferences/", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setProductUpdates(data.product_updates);
        setMarketingEmails(data.marketing_emails);
      } else if (response.status === 401) {
        // Token expiré
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("current_user");
        router.push("/login");
      }
    } catch (error) {
      // Silently fail
    }
  };

  // Save notification preferences
  const saveNotificationPreferences = async (field: string, value: boolean) => {
    try {
      setLoadingNotifications(true);
      const token = localStorage.getItem("access_token");
      if (!token) return;

      const response = await fetch("http://localhost:8080/auth/notifications/preferences/", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ [field]: value }),
      });

      if (response.ok) {
        setSaveMessage({ type: 'success', text: 'Préférences mises à jour !' });
        setTimeout(() => setSaveMessage(null), 3000);
      }
    } catch (error) {
      devError("Erreur lors de la sauvegarde:", error);
      setSaveMessage({ type: 'error', text: 'Erreur lors de la sauvegarde' });
    } finally {
      setLoadingNotifications(false);
    }
  };

  // Handle save profile
  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      setSaveMessage(null);

      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("Non authentifié");
      }

      const response = await fetch("http://localhost:8080/auth/me/", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        devError("Erreur serveur:", errorData);

        // Gestion des différents types d'erreurs
        if (errorData.first_name) {
          throw new Error(`Prénom: ${Array.isArray(errorData.first_name) ? errorData.first_name[0] : errorData.first_name}`);
        } else if (errorData.last_name) {
          throw new Error(`Nom: ${Array.isArray(errorData.last_name) ? errorData.last_name[0] : errorData.last_name}`);
        } else if (errorData.detail) {
          throw new Error(errorData.detail);
        } else {
          throw new Error("Erreur lors de la sauvegarde");
        }
      }

      // Refresh user data
      if (refreshUser) {
        await refreshUser();
      }

      setSaveMessage({ type: 'success', text: 'Profil mis à jour avec succès !' });

      // Clear message after 3 seconds
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error: any) {
      devError("Erreur lors de la sauvegarde:", error);
      setSaveMessage({ type: 'error', text: error.message || 'Erreur lors de la sauvegarde' });
    } finally {
      setSaving(false);
    }
  };

  // Handle email change
  const handleEmailChange = async () => {
    try {
      setSavingEmail(true);
      setSaveMessage(null);

      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("Non authentifié");
      }

      // For now, just update email directly
      // In production, you'd want to verify the password and send confirmation email
      const response = await fetch("http://localhost:8080/auth/me/", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          email: newEmail,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        devError("Erreur serveur:", errorData);

        // Gestion des différents types d'erreurs
        if (errorData.email) {
          throw new Error(Array.isArray(errorData.email) ? errorData.email[0] : errorData.email);
        } else if (errorData.detail) {
          throw new Error(errorData.detail);
        } else {
          throw new Error("Erreur lors du changement d'email");
        }
      }

      // Refresh user data
      if (refreshUser) {
        await refreshUser();
      }

      setSaveMessage({ type: 'success', text: 'Email mis à jour avec succès !' });
      setShowEmailModal(false);
      setNewEmail("");
      setEmailPassword("");

      // Clear message after 3 seconds
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error: any) {
      devError("Erreur lors du changement d'email:", error);
      setSaveMessage({ type: 'error', text: error.message || 'Erreur lors du changement d\'email' });
    } finally {
      setSavingEmail(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async () => {
    try {
      setSavingPassword(true);
      setSaveMessage(null);

      if (newPassword !== confirmPassword) {
        throw new Error("Les mots de passe ne correspondent pas");
      }

      if (newPassword.length < 8) {
        throw new Error("Le mot de passe doit contenir au moins 8 caractères");
      }

      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("Non authentifié");
      }

      const response = await fetch("http://localhost:8080/auth/password/change/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          old_password: oldPassword,
          new_password: newPassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Erreur lors du changement de mot de passe");
      }

      setSaveMessage({ type: 'success', text: 'Mot de passe modifié avec succès !' });
      setShowPasswordModal(false);
      setOldPassword("");
      setNewPassword("");
      setConfirmPassword("");

      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error: any) {
      devError("Erreur:", error);
      setSaveMessage({ type: 'error', text: error.message || 'Erreur lors du changement de mot de passe' });
    } finally {
      setSavingPassword(false);
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    try {
      setDeletingAccount(true);
      setSaveMessage(null);

      const token = localStorage.getItem("access_token");
      if (!token) {
        throw new Error("Non authentifié");
      }

      const response = await fetch("http://localhost:8080/auth/me/delete/", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          password: deletePassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Erreur lors de la suppression du compte");
      }

      // Clear all auth data and redirect
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
      localStorage.removeItem("current_user");
      router.push("/");
    } catch (error: any) {
      devError("Erreur:", error);
      setSaveMessage({ type: 'error', text: error.message || 'Erreur lors de la suppression' });
    } finally {
      setDeletingAccount(false);
    }
  };

  // Setup 2FA - Envoyer un code par email
  const setup2FA = async () => {
    try {
      setLoading2FA(true);
      setSaveMessage(null);
      const token = localStorage.getItem("access_token");
      if (!token) {
        setSaveMessage({ type: 'error', text: 'Vous devez être connecté' });
        router.push("/login");
        return;
      }

      const response = await fetch("http://localhost:8080/auth/2fa/setup/", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (response.status === 401) {
        setSaveMessage({ type: 'error', text: 'Session expirée, reconnectez-vous' });
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("current_user");
        router.push("/login");
        return;
      }

      if (response.ok) {
        const data = await response.json();
        setSaveMessage({ type: 'success', text: data.detail || 'Code envoyé à votre email' });
        setShow2FAModal(true);
      } else {
        const errorData = await response.json().catch(() => ({}));
        setSaveMessage({ type: 'error', text: errorData.detail || 'Erreur lors de la configuration' });
      }
    } catch (error) {
      devError("Erreur:", error);
      setSaveMessage({ type: 'error', text: 'Erreur de connexion au serveur' });
    } finally {
      setLoading2FA(false);
    }
  };

  // Enable 2FA - Confirmer avec le code reçu par email
  const enable2FA = async () => {
    try {
      setLoading2FA(true);
      setSaveMessage(null);

      const token = localStorage.getItem("access_token");
      if (!token) {
        setSaveMessage({ type: 'error', text: 'Session expirée' });
        return;
      }

      const response = await fetch("http://localhost:8080/auth/2fa/setup/", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          code: verificationCode,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Code invalide");
      }

      setSaveMessage({ type: 'success', text: '2FA activée avec succès ! Vous recevrez un code par email à chaque connexion.' });
      setTwoFactorEnabled(true);
      setShow2FAModal(false);
      setVerificationCode("");
      await refreshUser();

      setTimeout(() => setSaveMessage(null), 5000);
    } catch (error: any) {
      devError("Erreur:", error);
      setSaveMessage({ type: 'error', text: error.message || 'Erreur lors de l\'activation' });
    } finally {
      setLoading2FA(false);
    }
  };

  // Disable 2FA
  const disable2FA = async () => {
    try {
      setLoading2FA(true);
      setSaveMessage(null);

      const token = localStorage.getItem("access_token");
      if (!token) return;

      const response = await fetch("http://localhost:8080/auth/2fa/setup/", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          password: disablePassword,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || "Erreur lors de la désactivation");
      }

      setSaveMessage({ type: 'success', text: '2FA désactivée avec succès !' });
      setTwoFactorEnabled(false);
      setShow2FADisableModal(false);
      setDisablePassword("");

      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error: any) {
      devError("Erreur:", error);
      setSaveMessage({ type: 'error', text: error.message || 'Erreur lors de la désactivation' });
    } finally {
      setLoading2FA(false);
    }
  };

  // Handle avatar upload
  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    devLog("📸 Upload avatar - file:", file.name, file.type, file.size);

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setSaveMessage({ type: 'error', text: 'Fichier trop volumineux (max 5MB)' });
      setTimeout(() => setSaveMessage(null), 3000);
      return;
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      setSaveMessage({ type: 'error', text: 'Le fichier doit être une image' });
      setTimeout(() => setSaveMessage(null), 3000);
      return;
    }

    try {
      setUploadingAvatar(true);
      const token = localStorage.getItem("access_token");
      if (!token) throw new Error("Non authentifié");

      const formData = new FormData();
      formData.append('avatar', file);

      devLog("📤 Envoi de la requête d'upload...");

      const response = await fetch("http://localhost:8080/auth/me/avatar/upload/", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      });

      devLog("📥 Réponse reçue:", response.status, response.statusText);

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error("Trop de requêtes. Attendez quelques secondes.");
        }
        const errorData = await response.json().catch(() => ({}));
        devError("❌ Erreur serveur:", errorData);
        throw new Error(errorData.error || errorData.detail || "Erreur lors de l'upload");
      }

      const result = await response.json();
      devLog("✅ Upload réussi, données utilisateur:", result);

      // Force immediate reload
      await forceReloadUser();

      setSaveMessage({ type: 'success', text: 'Photo mise à jour !' });
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error: any) {
      devError("❌ Erreur upload avatar:", error);
      setSaveMessage({ type: 'error', text: error.message || 'Erreur lors de l\'upload' });
      setTimeout(() => setSaveMessage(null), 3000);
    } finally {
      setUploadingAvatar(false);
      // Reset input
      e.target.value = '';
    }
  };

  // Handle avatar delete
  const handleAvatarDelete = async () => {
    if (!user?.avatar) {
      devLog("⚠️ Pas d'avatar à supprimer");
      return;
    }

    if (!confirm("Voulez-vous vraiment supprimer votre photo de profil ?")) {
      return;
    }

    try {
      setUploadingAvatar(true);
      const token = localStorage.getItem("access_token");
      if (!token) throw new Error("Non authentifié");

      devLog("🗑️ Suppression de l'avatar...");

      const response = await fetch("http://localhost:8080/auth/me/avatar/delete/", {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      devLog("📥 Réponse suppression:", response.status);

      if (!response.ok) {
        if (response.status === 429) {
          throw new Error("Trop de requêtes. Attendez quelques secondes.");
        }
        const errorData = await response.json().catch(() => ({}));
        devError("❌ Erreur serveur:", errorData);
        throw new Error(errorData.detail || errorData.error || "Erreur lors de la suppression");
      }

      const result = await response.json();
      devLog("✅ Avatar supprimé, données utilisateur:", result);

      // Force immediate reload
      await forceReloadUser();

      setSaveMessage({ type: 'success', text: 'Photo supprimée !' });
      setTimeout(() => setSaveMessage(null), 3000);
    } catch (error: any) {
      devError("Erreur suppression avatar:", error);
      setSaveMessage({ type: 'error', text: error.message || 'Erreur lors de la suppression' });
      setTimeout(() => setSaveMessage(null), 3000);
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Load sessions
  const loadSessions = async () => {
    try {
      setLoadingSessions(true);
      const token = localStorage.getItem("access_token");
      if (!token) {
        return;
      }

      const response = await fetch("http://localhost:8080/auth/sessions/", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSessions(data);
      } else if (response.status === 401) {
        // Token expiré, rediriger vers login
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        localStorage.removeItem("current_user");
        router.push("/login");
      }
    } catch (error) {
      // Silently fail - not critical
    } finally {
      setLoadingSessions(false);
    }
  };

  // Delete specific session
  const deleteSession = async (sessionId: number) => {
    try {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      const response = await fetch(`http://localhost:8080/auth/sessions/${sessionId}/`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setSaveMessage({ type: 'success', text: 'Session déconnectée avec succès' });
        loadSessions(); // Recharger la liste
        setShowSessionModal(false);
        setTimeout(() => setSaveMessage(null), 3000);
      } else {
        const errorData = await response.json();
        setSaveMessage({ type: 'error', text: errorData.detail || 'Erreur lors de la déconnexion' });
      }
    } catch (error) {
      devError("Erreur:", error);
      setSaveMessage({ type: 'error', text: 'Erreur de connexion au serveur' });
    }
  };

  // Delete all other sessions
  const deleteAllSessions = async () => {
    if (!confirm("Êtes-vous sûr de vouloir déconnecter tous les autres appareils ?")) {
      return;
    }

    try {
      const token = localStorage.getItem("access_token");
      if (!token) return;

      const response = await fetch("http://localhost:8080/auth/sessions/delete-all/", {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSaveMessage({ type: 'success', text: data.detail });
        loadSessions();
        setTimeout(() => setSaveMessage(null), 3000);
      }
    } catch (error) {
      devError("Erreur:", error);
      setSaveMessage({ type: 'error', text: 'Erreur de connexion au serveur' });
    }
  };

  const getDeviceIcon = (deviceType: string) => {
    switch (deviceType) {
      case 'mobile':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="5" y="2" width="14" height="20" rx="2" ry="2"></rect>
            <line x1="12" y1="18" x2="12.01" y2="18"></line>
          </svg>
        );
      case 'tablet':
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect>
            <line x1="12" y1="18" x2="12.01" y2="18"></line>
          </svg>
        );
      default: // desktop
        return (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="2" y="3" width="20" height="14" rx="2" ry="2"></rect>
            <line x1="8" y1="21" x2="16" y2="21"></line>
            <line x1="12" y1="17" x2="12" y2="21"></line>
          </svg>
        );
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0f1724] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const sidebarItems = [
    { name: "Mon profil", icon: "user", id: "My profile" },
    { name: "Notifications", icon: "bell", id: "Notifications" },
    { name: "Sécurité et données", icon: "shield", id: "Security and data" },
  ];

  return (
    <div className="min-h-screen bg-[#0f1724] text-zinc-50 font-sans">
      {/* Header */}
      <header className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-[#0f1724]/80 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <Link href="/dashboard" className="flex items-center gap-2 group">
            <Logo className="w-8 h-8 text-white group-hover:text-blue-400 transition-colors" />
            <span className="font-semibold text-lg tracking-tight">Paramètres Nexus</span>
          </Link>
        </div>
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-400 hover:text-white"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </header>

      <div className="flex max-w-7xl mx-auto">
        {/* Sidebar */}
        <aside className="w-64 py-8 pr-8 hidden md:block border-r border-white/5 min-h-[calc(100vh-4rem)]">
          <nav className="space-y-1">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer ${activeTab === item.id
                  ? "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                  : "text-zinc-400 hover:bg-white/5 hover:text-zinc-200 border border-transparent"
                  }`}
              >
                <div className="flex items-center gap-3">
                  {item.id === "My profile" && (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                      <circle cx="12" cy="7" r="4"></circle>
                    </svg>
                  )}
                  {item.id === "Notifications" && (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                      <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                    </svg>
                  )}
                  {item.id === "Security and data" && (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
                    </svg>
                  )}
                  <span>{item.name}</span>
                </div>
              </button>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 py-8 px-4 md:px-12">
          {saveMessage && (
            <div className={`mb-6 p-4 rounded-lg border ${saveMessage.type === 'success' ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'}`}>
              {saveMessage.text}
            </div>
          )}

          <div className="max-w-3xl">
            {activeTab === "My profile" && (
              <>
                <h1 className="text-3xl font-bold text-white mb-2">Mon profil</h1>
                <p className="text-zinc-400 mb-8">Gérez vos informations personnelles et la sécurité de votre compte.</p>

                <div className="space-y-8 bg-[#1e293b]/30 p-8 rounded-2xl border border-white/5 backdrop-blur-sm">
                  {/* Avatar section (Read-only for now) */}
                  <div className="flex items-center gap-6 pb-8 border-b border-white/5">

                    {avatarUrl ? (
                      <img
                        key={avatarKey}
                        src={avatarUrl.startsWith('http') ? avatarUrl : `http://localhost:8080${avatarUrl}`}
                        alt="Avatar"
                        className="w-20 h-20 rounded-full object-cover shadow-lg ring-4 ring-[#0f1724]"
                      />
                    ) : (
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center text-white text-2xl font-bold shadow-lg shadow-blue-500/20 ring-4 ring-[#0f1724]">
                        {user?.first_name && user?.last_name
                          ? (user.first_name[0] + user.last_name[0]).toUpperCase()
                          : (user?.first_name?.[0] || user?.email?.[0] || "?").toUpperCase()}
                      </div>
                    )}
                    <div className="flex flex-col gap-2">
                      <h3 className="font-medium text-white">Photo de profil</h3>
                      <div className="flex items-center gap-3">
                        <input
                          type="file"
                          id="avatar-upload"
                          accept="image/*"
                          className="hidden"
                          onChange={handleAvatarUpload}
                          disabled={uploadingAvatar}
                        />
                        <label
                          htmlFor="avatar-upload"
                          className={`text-sm font-medium text-blue-400 hover:text-blue-300 transition-colors cursor-pointer ${uploadingAvatar ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        >
                          {uploadingAvatar ? 'Chargement...' : 'Changer'}
                        </label>
                        <span className="text-zinc-600">|</span>
                        <button
                          onClick={handleAvatarDelete}
                          disabled={uploadingAvatar || !avatarUrl}
                          className="text-sm font-medium text-red-400 hover:text-red-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          Supprimer
                        </button>
                      </div>

                    </div>
                  </div>

                  {/* Email (Read-only) */}
                  <div className="grid gap-2">

                    <label className="block text-sm font-medium text-zinc-400">
                      Adresse e-mail <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-3">
                      <input
                        type="email"
                        value={user?.email || ""}
                        readOnly
                        className="flex-1 block w-full rounded-lg border border-white/10 px-4 py-2.5 bg-[#0f1724] text-zinc-400 sm:text-sm focus:outline-none cursor-not-allowed"
                      />
                      <button
                        onClick={() => setShowEmailModal(true)}
                        className="px-4 py-2.5 border border-white/10 rounded-lg text-sm font-medium text-zinc-300 hover:bg-white/5 hover:text-white transition-colors whitespace-nowrap"
                      >
                        Changer d'e-mail
                      </button>
                    </div>

                  </div >

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="grid gap-2">
                      <label className="block text-sm font-medium text-zinc-400">Prénom <span className="text-red-500">*</span></label>
                      <input
                        type="text"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        className="block w-full rounded-lg border border-white/10 px-4 py-2.5 bg-[#0f1724] text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors sm:text-sm placeholder-zinc-600"

                      />
                    </div>
                    <div className="grid gap-2">
                      <label className="block text-sm font-medium text-zinc-400">Nom</label>
                      <input
                        type="text"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        className="block w-full rounded-lg border border-white/10 px-4 py-2.5 bg-[#0f1724] text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors sm:text-sm placeholder-zinc-600"

                      />
                    </div>
                  </div>




                  <div className="pt-4 flex justify-end gap-4 items-center">
                    {saveMessage && (
                      <div className={`px-4 py-2 rounded-lg text-sm font-medium ${saveMessage.type === 'success'
                        ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                        : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                        {saveMessage.text}
                      </div>
                    )}
                    <button
                      onClick={handleSaveProfile}
                      disabled={saving}
                      className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {saving ? "Enregistrement..." : "Enregistrer les modifications"}

                    </button>
                  </div>
                </div>
              </>
            )
            }


            {activeTab === "Notifications" && (
              <>
                <h1 className="text-3xl font-bold text-white mb-2">Notifications</h1>
                <p className="text-zinc-400 mb-8">Choisissez ce dont vous souhaitez être notifié.</p>

                {saveMessage && (
                  <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium ${saveMessage.type === 'success'
                    ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                    : 'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                    {saveMessage.text}
                  </div>
                )}

                <div className="space-y-6 bg-[#1e293b]/30 p-8 rounded-2xl border border-white/5 backdrop-blur-sm">
                  <div className="space-y-6">
                    <h3 className="text-lg font-medium text-white">Notifications par e-mail</h3>

                    <div className="flex items-center justify-between py-4 border-b border-white/5">
                      <div>
                        <p className="text-white font-medium">Mises à jour du produit</p>
                        <p className="text-sm text-zinc-400">Recevez des messages sur les nouvelles fonctionnalités et améliorations.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={productUpdates}
                          onChange={(e) => {
                            setProductUpdates(e.target.checked);
                            saveNotificationPreferences('product_updates', e.target.checked);
                          }}
                          disabled={loadingNotifications}
                        />
                        <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between py-4 border-b border-white/5">
                      <div>
                        <p className="text-white font-medium">Alertes de sécurité</p>
                        <p className="text-sm text-zinc-400">Soyez notifié des activités suspectes sur votre compte.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-not-allowed">
                        <input type="checkbox" className="sr-only peer" checked disabled />
                        <div className="w-11 h-6 bg-zinc-700/50 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-zinc-400 after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600/50"></div>
                      </label>
                    </div>

                    <div className="flex items-center justify-between py-4">
                      <div>
                        <p className="text-white font-medium">E-mails marketing</p>
                        <p className="text-sm text-zinc-400">Recevez des offres et promotions.</p>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          className="sr-only peer"
                          checked={marketingEmails}
                          onChange={(e) => {
                            setMarketingEmails(e.target.checked);
                            saveNotificationPreferences('marketing_emails', e.target.checked);
                          }}
                          disabled={loadingNotifications}
                        />
                        <div className="w-11 h-6 bg-zinc-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                      </label>
                    </div>
                  </div>
                </div>
              </>
            )}


            {
              activeTab === "Security and data" && (
                <>
                  <h1 className="text-3xl font-bold text-white mb-2">Sécurité et données</h1>
                  <p className="text-zinc-400 mb-8">Gérez vos préférences de sécurité.</p>

                  {saveMessage && (
                    <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium ${saveMessage.type === 'success'
                      ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                      : 'bg-red-500/10 text-red-400 border border-red-500/20'
                      }`}>
                      {saveMessage.text}
                    </div>
                  )}

                  <div className="space-y-8">
                    <div className="bg-[#1e293b]/30 p-8 rounded-2xl border border-white/5 backdrop-blur-sm">

                      <h3 className="text-lg font-medium text-white mb-6">Mot de passe</h3>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-zinc-300 mb-2">Assurez-vous que votre compte est sécurisé avec un mot de passe fort.</p>
                          <p className="text-sm text-zinc-500">Dernière modification il y a 3 mois</p>
                        </div>
                        <button
                          onClick={() => setShowPasswordModal(true)}
                          className="px-4 py-2 border border-white/10 rounded-lg text-sm font-medium text-white hover:bg-white/5 transition-colors"
                        >
                          Changer le mot de passe
                        </button>
                      </div>
                    </div>

                    <div className="bg-[#1e293b]/30 p-8 rounded-2xl border border-white/5 backdrop-blur-sm">
                      <h3 className="text-lg font-medium text-white mb-6">Authentification à deux facteurs</h3>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-zinc-300 mb-2">Ajoutez une couche de sécurité supplémentaire à votre compte.</p>
                          <p className="text-sm text-zinc-500">
                            {twoFactorEnabled
                              ? "Utilise une application d'authentification pour générer des codes."
                              : "Nous utiliserons une application d'authentification pour générer des codes."}
                          </p>
                        </div>
                        {twoFactorEnabled ? (
                          <button
                            onClick={() => setShow2FADisableModal(true)}
                            className="px-4 py-2 border border-red-500/20 bg-red-500/10 rounded-lg text-sm font-medium text-red-400 hover:bg-red-500/20 transition-colors"
                          >
                            Désactiver la 2FA
                          </button>
                        ) : (
                          <button
                            onClick={setup2FA}
                            disabled={loading2FA}
                            className="px-4 py-2 border border-white/10 rounded-lg text-sm font-medium text-white hover:bg-white/5 transition-colors disabled:opacity-50"
                          >
                            {loading2FA ? "Chargement..." : "Activer la 2FA"}
                          </button>
                        )}
                      </div>
                    </div>

                    <div className="bg-[#1e293b]/30 p-8 rounded-2xl border border-white/5 backdrop-blur-sm">
                      <div className="flex items-center justify-between mb-6">
                        <h3 className="text-lg font-medium text-white">Sessions actives</h3>
                        {sessions.length > 1 && (
                          <button
                            onClick={deleteAllSessions}
                            className="text-sm text-red-400 hover:text-red-300 transition-colors"
                          >
                            Déconnecter tout
                          </button>
                        )}
                      </div>
                      <div className="space-y-4">
                        {loadingSessions ? (
                          <div className="text-center py-8 text-zinc-400">Chargement...</div>
                        ) : sessions.length === 0 ? (
                          <div className="text-center py-8 text-zinc-400">Aucune session active</div>
                        ) : (
                          sessions.map((session) => (
                            <div key={session.id} className="flex items-center justify-between p-4 bg-[#0f1724] rounded-lg border border-white/5">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
                                  <div className="text-zinc-400">
                                    {getDeviceIcon(session.device_type)}
                                  </div>
                                </div>
                                <div>
                                  <p className="text-white font-medium">
                                    {session.browser} sur {session.os}
                                  </p>
                                  <p className="text-xs text-zinc-400">
                                    {session.is_current && <span className="text-green-400">Session actuelle • </span>}
                                    {session.location} • {session.ip_address}
                                  </p>
                                  <p className="text-xs text-zinc-500 mt-1">
                                    Dernière activité : {new Date(session.last_activity).toLocaleString('fr-FR')}
                                  </p>
                                </div>
                              </div>
                              <button
                                onClick={() => {
                                  setSelectedSession(session);
                                  setShowSessionModal(true);
                                }}
                                className="text-sm text-zinc-400 hover:text-white transition-colors"
                              >
                                Détails
                              </button>
                            </div>
                          ))
                        )}

                      </div>
                    </div>

                    <div className="bg-red-500/5 p-8 rounded-2xl border border-red-500/20 backdrop-blur-sm">
                      <h3 className="text-lg font-medium text-red-400 mb-2">Supprimer le compte</h3>

                      <p className="text-zinc-400 text-sm mb-6">Supprimez définitivement votre compte et tout votre contenu. Cette action est irréversible.</p>
                      <button
                        onClick={() => setShowDeleteModal(true)}

                        className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg text-sm font-medium transition-colors"
                      >
                        Supprimer le compte
                      </button>
                    </div >
                  </div >
                </>
              )
            }


          </div >
        </main >
      </div >

      {/* Email Change Modal */}
      {
        showEmailModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#1e293b] rounded-2xl border border-white/10 max-w-md w-full p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Changer d'adresse e-mail</h2>
                <button
                  onClick={() => {
                    setShowEmailModal(false);
                    setNewEmail("");
                    setEmailPassword("");
                    setSaveMessage(null);
                  }}
                  className="p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-400 hover:text-white"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>

              {saveMessage && (
                <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium ${saveMessage.type === 'success'
                  ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                  : 'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}>
                  {saveMessage.text}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">
                    Email actuel
                  </label>
                  <input
                    type="email"
                    value={user?.email || ""}
                    readOnly
                    className="w-full px-4 py-2.5 rounded-lg border border-white/10 bg-[#0f1724] text-zinc-500 cursor-not-allowed sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">
                    Nouvel e-mail <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="nouveau@example.com"
                    className="w-full px-4 py-2.5 rounded-lg border border-white/10 bg-[#0f1724] text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors sm:text-sm placeholder-zinc-600"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowEmailModal(false);
                      setNewEmail("");
                      setEmailPassword("");
                      setSaveMessage(null);
                    }}
                    className="flex-1 px-4 py-2.5 border border-white/10 rounded-lg text-sm font-medium text-zinc-300 hover:bg-white/5 hover:text-white transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleEmailChange}
                    disabled={savingEmail || !newEmail}
                    className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {savingEmail ? "Mise à jour..." : "Confirmer"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }

      {/* Password Change Modal */}
      {
        showPasswordModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#1e293b] rounded-2xl border border-white/10 max-w-md w-full p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Changer le mot de passe</h2>
                <button
                  onClick={() => {
                    setShowPasswordModal(false);
                    setOldPassword("");
                    setNewPassword("");
                    setConfirmPassword("");
                    setSaveMessage(null);
                  }}
                  className="p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-400 hover:text-white"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>

              {saveMessage && (
                <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium ${saveMessage.type === 'success'
                  ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                  : 'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}>
                  {saveMessage.text}
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">
                    Mot de passe actuel <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={oldPassword}
                    onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-white/10 bg-[#0f1724] text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">
                    Nouveau mot de passe <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-white/10 bg-[#0f1724] text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors sm:text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">
                    Confirmer le mot de passe <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-white/10 bg-[#0f1724] text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors sm:text-sm"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowPasswordModal(false);
                      setOldPassword("");
                      setNewPassword("");
                      setConfirmPassword("");
                      setSaveMessage(null);
                    }}
                    className="flex-1 px-4 py-2.5 border border-white/10 rounded-lg text-sm font-medium text-zinc-300 hover:bg-white/5 hover:text-white transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handlePasswordChange}
                    disabled={savingPassword || !oldPassword || !newPassword || !confirmPassword}
                    className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {savingPassword ? "Changement..." : "Confirmer"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }

      {/* Delete Account Modal */}
      {
        showDeleteModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#1e293b] rounded-2xl border border-red-500/20 max-w-md w-full p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-red-400">Supprimer le compte</h2>
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setDeletePassword("");
                    setSaveMessage(null);
                  }}
                  className="p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-400 hover:text-white"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>

              {saveMessage && (
                <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium ${saveMessage.type === 'success'
                  ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                  : 'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}>
                  {saveMessage.text}
                </div>
              )}

              <div className="space-y-4">
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                  <p className="text-red-400 text-sm font-medium mb-2">⚠️ Attention !</p>
                  <p className="text-zinc-300 text-sm">
                    Cette action est irréversible. Toutes vos données seront définitivement supprimées, incluant :
                  </p>
                  <ul className="mt-2 text-sm text-zinc-400 list-disc list-inside space-y-1">
                    <li>Votre profil et informations personnelles</li>
                    <li>Toutes vos automations et configurations</li>
                    <li>Votre historique d'activité</li>
                  </ul>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">
                    Confirmez avec votre mot de passe <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={deletePassword}
                    onChange={(e) => setDeletePassword(e.target.value)}
                    placeholder="Entrez votre mot de passe"
                    className="w-full px-4 py-2.5 rounded-lg border border-white/10 bg-[#0f1724] text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors sm:text-sm placeholder-zinc-600"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowDeleteModal(false);
                      setDeletePassword("");
                      setSaveMessage(null);
                    }}
                    className="flex-1 px-4 py-2.5 border border-white/10 rounded-lg text-sm font-medium text-zinc-300 hover:bg-white/5 hover:text-white transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deletingAccount || !deletePassword}
                    className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white font-medium rounded-lg transition-colors shadow-lg shadow-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {deletingAccount ? "Suppression..." : "Supprimer définitivement"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }

      {/* 2FA Setup Modal */}
      {
        show2FAModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#1e293b] rounded-2xl border border-white/10 max-w-md w-full p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Configurer l'authentification 2FA</h2>
                <button
                  onClick={() => {
                    setShow2FAModal(false);
                    setVerificationCode("");
                    setSaveMessage(null);
                  }}
                  className="p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-400 hover:text-white"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>

              {saveMessage && (
                <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium ${saveMessage.type === 'success'
                  ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                  : 'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}>
                  {saveMessage.text}
                </div>
              )}

              <div className="space-y-4">
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                  <p className="text-blue-400 text-sm font-medium mb-3 flex items-center gap-2">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                      <polyline points="22,6 12,13 2,6"></polyline>
                    </svg>
                    Authentification par email
                  </p>
                  <div className="text-zinc-300 text-sm space-y-2">
                    <p>📧 Un code de vérification à 6 chiffres a été envoyé à votre email.</p>
                    <p>💡 <strong>Comment ça marche :</strong></p>
                    <ul className="list-disc list-inside ml-2 space-y-1">
                      <li>À chaque connexion, vous recevrez un code par email</li>
                      <li>Le code expire après 10 minutes</li>
                      <li>Pas besoin d'application tierce !</li>
                    </ul>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">
                    Code de vérification reçu par email <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      placeholder="000000"
                      maxLength={6}
                      className="w-full px-4 py-3 rounded-lg border border-white/10 bg-[#0f1724] text-white text-center text-2xl tracking-widest focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all placeholder-zinc-600"
                      autoFocus
                    />
                    {verificationCode.length === 6 && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12"></polyline>
                        </svg>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500 mt-2">
                    Vérifiez votre boîte de réception (et les spams si nécessaire)
                  </p>
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShow2FAModal(false);
                      setVerificationCode("");
                      setSaveMessage(null);
                    }}
                    className="flex-1 px-4 py-2.5 border border-white/10 rounded-lg text-sm font-medium text-zinc-300 hover:bg-white/5 hover:text-white transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={enable2FA}
                    disabled={loading2FA || verificationCode.length !== 6}
                    className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition-colors shadow-lg shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading2FA ? "Vérification..." : "Activer"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }

      {/* 2FA Disable Modal */}
      {
        show2FADisableModal && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#1e293b] rounded-2xl border border-red-500/20 max-w-md w-full p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-red-400">Désactiver la 2FA</h2>
                <button
                  onClick={() => {
                    setShow2FADisableModal(false);
                    setDisablePassword("");
                    setSaveMessage(null);
                  }}
                  className="p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-400 hover:text-white"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>

              {saveMessage && (
                <div className={`mb-4 px-4 py-3 rounded-lg text-sm font-medium ${saveMessage.type === 'success'
                  ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                  : 'bg-red-500/10 text-red-400 border border-red-500/20'
                  }`}>
                  {saveMessage.text}
                </div>
              )}

              <div className="space-y-4">
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                  <p className="text-red-400 text-sm font-medium mb-2">⚠️ Attention</p>
                  <p className="text-zinc-300 text-sm">
                    La désactivation de la 2FA réduira la sécurité de votre compte. Confirmez avec votre mot de passe.
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">
                    Mot de passe <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={disablePassword}
                    onChange={(e) => setDisablePassword(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-lg border border-white/10 bg-[#0f1724] text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors sm:text-sm placeholder-zinc-600"
                    placeholder="Entrez votre mot de passe"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShow2FADisableModal(false);
                      setDisablePassword("");
                      setSaveMessage(null);
                    }}
                    className="flex-1 px-4 py-2.5 border border-white/10 rounded-lg text-sm font-medium text-zinc-300 hover:bg-white/5 hover:text-white transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={disable2FA}
                    disabled={loading2FA || !disablePassword}
                    className="flex-1 px-4 py-2.5 bg-red-600 hover:bg-red-500 text-white font-medium rounded-lg transition-colors shadow-lg shadow-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading2FA ? "Désactivation..." : "Désactiver"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )
      }

      {/* Session Details Modal */}
      {
        showSessionModal && selectedSession && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[#1e293b] rounded-2xl border border-white/10 max-w-md w-full p-6 shadow-2xl">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Détails de la session</h2>
                <button
                  onClick={() => {
                    setShowSessionModal(false);
                    setSelectedSession(null);
                  }}
                  className="p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-400 hover:text-white"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-[#0f1724] rounded-lg border border-white/5">
                  <div className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center">
                    <div className="text-zinc-400">
                      {getDeviceIcon(selectedSession.device_type)}
                    </div>
                  </div>
                  <div>
                    <p className="text-white font-medium">{selectedSession.browser}</p>
                    <p className="text-xs text-zinc-400">{selectedSession.os}</p>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-zinc-400">Type d'appareil</span>
                    <span className="text-white capitalize">{selectedSession.device_type}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-zinc-400">Adresse IP</span>
                    <span className="text-white font-mono text-xs">{selectedSession.ip_address}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-zinc-400">Localisation</span>
                    <span className="text-white">{selectedSession.location}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-zinc-400">Première connexion</span>
                    <span className="text-white text-xs">{new Date(selectedSession.created_at).toLocaleString('fr-FR')}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-white/5">
                    <span className="text-zinc-400">Dernière activité</span>
                    <span className="text-white text-xs">{new Date(selectedSession.last_activity).toLocaleString('fr-FR')}</span>
                  </div>
                  {selectedSession.is_current && (
                    <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3 mt-4">
                      <p className="text-green-400 text-sm flex items-center gap-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                          <polyline points="22 4 12 14.01 9 11.01"></polyline>
                        </svg>
                        Session actuelle
                      </p>
                    </div>
                  )}
                </div>

                {!selectedSession.is_current && (
                  <div className="pt-4">
                    <button
                      onClick={() => deleteSession(selectedSession.id)}
                      className="w-full px-4 py-2.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg text-sm font-medium transition-colors"
                    >
                      Déconnecter cette session
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )
      }
    </div >
  );
}
