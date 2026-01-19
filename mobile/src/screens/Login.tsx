import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useAuth } from '../context/AuthContext';
import OAuthButtons from '../components/OAuthButtons';

export default function Login({ navigate }: { navigate: (s: string) => void }) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    setError(null);
    setLoading(true);

    try {
      await login(email, password);
      setLoading(false);
      navigate('Home');
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || "Erreur de connexion");
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Bienvenue</Text>
        <Text style={styles.subtitle}>Saisissez votre e‑mail pour vous connecter à votre compte</Text>

        {error && <Text style={styles.errorText}>{error}</Text>}

        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>E-mail</Text>
            <TextInput
              style={styles.input}
              placeholder="nom@exemple.com"
              placeholderTextColor="#71717a"
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Text style={styles.label}>Mot de passe</Text>
              <TouchableOpacity onPress={() => navigate('ForgotPassword')}>
                <Text style={{ color: '#818cf8', fontSize: 12 }}>Mot de passe oublié ?</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.input}
              placeholder="••••••••"
              placeholderTextColor="#71717a"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>

          <TouchableOpacity
            style={[styles.cta, loading && styles.ctaDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.ctaText}>Se connecter</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigate('Register')}>
            <Text style={styles.link}>Pas encore de compte ? <Text style={styles.linkHighlight}>Inscription</Text></Text>
          </TouchableOpacity>

          <OAuthButtons onError={setError} />
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
