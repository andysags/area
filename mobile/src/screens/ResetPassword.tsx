import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Platform } from 'react-native';

// Helper to get API URL based on environment
const getApiUrl = () => {
    if (Platform.OS === 'android') return 'http://10.0.2.2:8080';
    if (Platform.OS === 'ios') return 'http://localhost:8080';
    return 'http://localhost:8080'; // Web
};

export default function ResetPassword({ navigate }: { navigate: (s: string) => void }) {
  const [token, setToken] = useState("");
  const [uid, setUid] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError(null);
    setMessage(null);
    
    if (password !== confirm) {
        setError("Les mots de passe ne correspondent pas.");
        return;
    }

    setLoading(true);
    const API_BASE = getApiUrl();

    try {
      const res = await fetch(`${API_BASE}/auth/password_reset/confirm/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid, token, new_password: password }),
      });

      if (!res.ok) {
        setError("Erreur lors de la réinitialisation. Vérifiez le token.");
        setLoading(false);
        return;
      }

      setMessage("Mot de passe réinitialisé avec succès !");
      setTimeout(() => navigate('Login'), 2000);
      setLoading(false);
    } catch (err) {
      console.error('Reset Password error:', err);
      setError("Erreur réseau.");
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Réinitialisation</Text>
        <Text style={styles.subtitle}>Entrez le token reçu par email et votre nouveau mot de passe.</Text>

        {error && <Text style={styles.errorText}>{error}</Text>}
        {message && <Text style={styles.successText}>{message}</Text>}

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>UID (depuis le lien)</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Ex: Mg" 
              placeholderTextColor="#71717a"
              value={uid}
              onChangeText={setUid}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Token (depuis le lien)</Text>
            <TextInput 
              style={styles.input} 
              placeholder="Ex: bq0..." 
              placeholderTextColor="#71717a"
              value={token}
              onChangeText={setToken}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nouveau mot de passe</Text>
            <TextInput 
              style={styles.input} 
              placeholder="••••••••" 
              placeholderTextColor="#71717a"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Confirmer</Text>
            <TextInput 
              style={styles.input} 
              placeholder="••••••••" 
              placeholderTextColor="#71717a"
              secureTextEntry
              value={confirm}
              onChangeText={setConfirm}
            />
          </View>

          <TouchableOpacity 
            style={[styles.cta, loading && styles.ctaDisabled]} 
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.ctaText}>Changer le mot de passe</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigate('Login')}>
            <Text style={styles.link}>Retour à la <Text style={styles.linkHighlight}>Connexion</Text></Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    padding: 20, 
    justifyContent: 'center', 
    backgroundColor: '#0f1724' 
  },
  card: {
    backgroundColor: 'rgba(24, 24, 27, 0.4)',
    borderRadius: 16,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  title: { 
    fontSize: 24, 
    fontWeight: '700', 
    color: '#fff', 
    marginBottom: 8 
  },
  subtitle: { 
    fontSize: 14, 
    color: '#a1a1aa', 
    marginBottom: 24 
  },
  errorText: {
    color: '#ef4444',
    fontSize: 14,
    marginBottom: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    padding: 10,
    borderRadius: 8,
  },
  successText: {
    color: '#10b981',
    fontSize: 14,
    marginBottom: 16,
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    padding: 10,
    borderRadius: 8,
  },
  form: {
    gap: 16,
  },
  inputGroup: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#e4e4e7',
  },
  input: { 
    borderWidth: 1, 
    borderColor: 'rgba(255, 255, 255, 0.1)', 
    borderRadius: 8, 
    padding: 12, 
    color: '#fff',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  cta: { 
    backgroundColor: '#4f46e5', 
    padding: 14, 
    borderRadius: 8, 
    alignItems: 'center', 
    marginTop: 8 
  },
  ctaDisabled: {
    opacity: 0.7,
  },
  ctaText: { 
    color: '#fff', 
    fontWeight: '600',
    fontSize: 16,
  },
  link: { 
    color: '#a1a1aa', 
    textAlign: 'center', 
    marginTop: 16,
    fontSize: 14,
  },
  linkHighlight: {
    color: '#818cf8',
    fontWeight: '600',
  },
});
