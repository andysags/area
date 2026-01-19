import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useAuth } from '../context/AuthContext';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const specialChars = /[!"#$%&'()*+,\-./:;<=>?@[\\\]^_`{|}~]/;

export default function Register({ navigate }: { navigate: (s: string) => void }) {
  const { register } = useAuth();
  const [email, setEmail] = useState("");
  const [pseudo, setPseudo] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function validate() {
    const errs: string[] = [];
    if (!emailRegex.test(email)) errs.push('Email invalide.');
    if (password.length < 8) errs.push('Mot de passe: min 8 caractères.');
    if (!/[a-z]/.test(password)) errs.push('Mot de passe: min 1 minuscule.');
    if (!/[A-Z]/.test(password)) errs.push('Mot de passe: min 1 majuscule.');
    if (!/[0-9]/.test(password)) errs.push('Mot de passe: min 1 chiffre.');
    if (!specialChars.test(password)) errs.push('Mot de passe: min 1 caractère spécial.');
    if (password !== confirm) errs.push('Les mots de passe ne correspondent pas.');
    return errs;
  }

  async function handleRegister() {
    setError(null);
    const validationErrors = validate();
    if (validationErrors.length > 0) {
      setError(validationErrors.join('\n'));
      return;
    }

    setLoading(true);

    try {
      await register({
        email,
        password,
        name: `${firstName} ${lastName}`.trim() || pseudo,
      });
      setLoading(false);
      navigate('Home');
    } catch (err: any) {
      console.error('Register error:', err);
      setError(err.message || "Erreur lors de l'inscription");
      setLoading(false);
    }
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.card}>
        <Text style={styles.title}>Créer un compte</Text>
        <Text style={styles.subtitle}>Rejoignez Nexus pour commencer à automatiser</Text>

        {error && <Text style={styles.errorText}>{error}</Text>}

        <View style={styles.form}>
          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Prénom</Text>
              <TextInput
                style={styles.input}
                placeholder="John"
                placeholderTextColor="#71717a"
                value={firstName}
                onChangeText={setFirstName}
              />
            </View>
            <View style={[styles.inputGroup, { flex: 1 }]}>
              <Text style={styles.label}>Nom</Text>
              <TextInput
                style={styles.input}
                placeholder="Doe"
                placeholderTextColor="#71717a"
                value={lastName}
                onChangeText={setLastName}
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Pseudo</Text>
            <TextInput
              style={styles.input}
              placeholder="johndoe"
              placeholderTextColor="#71717a"
              value={pseudo}
              onChangeText={setPseudo}
            />
          </View>

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
            <Text style={styles.label}>Mot de passe</Text>
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
            <Text style={styles.label}>Confirmer le mot de passe</Text>
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
            onPress={handleRegister}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.ctaText}>S'inscrire</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity onPress={() => navigate('Login')}>
            <Text style={styles.link}>Déjà un compte ? <Text style={styles.linkHighlight}>Connexion</Text></Text>
          </TouchableOpacity>
        </View>
      </View>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1724'
  },
  contentContainer: {
    padding: 20,
    justifyContent: 'center',
    minHeight: '100%',
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
  row: {
    flexDirection: 'row',
    gap: 12,
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
