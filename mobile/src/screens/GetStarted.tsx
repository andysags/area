import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { Zap, ArrowRight } from 'lucide-react-native';

const { width } = Dimensions.get('window');

export default function GetStarted({ navigate }: { navigate: (s: string) => void }) {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Zap size={48} color="#60a5fa" />
        </View>
        
        <Text style={styles.title}>Bienvenue sur Nexus</Text>
        <Text style={styles.description}>
          La plateforme d'automatisation la plus puissante pour connecter vos applications préférées.
        </Text>

        <View style={styles.features}>
            <View style={styles.featureRow}>
                <View style={styles.dot} />
                <Text style={styles.featureText}>Automatisation sans code</Text>
            </View>
            <View style={styles.featureRow}>
                <View style={styles.dot} />
                <Text style={styles.featureText}>Intégrations illimitées</Text>
            </View>
            <View style={styles.featureRow}>
                <View style={styles.dot} />
                <Text style={styles.featureText}>Exécution en temps réel</Text>
            </View>
        </View>

        <TouchableOpacity style={styles.cta} onPress={() => navigate('Register')}>
          <Text style={styles.ctaText}>Créer un compte</Text>
          <ArrowRight size={20} color="#fff" style={{ marginLeft: 8 }} />
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryCta} onPress={() => navigate('Login')}>
          <Text style={styles.secondaryCtaText}>J'ai déjà un compte</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#0f1724',
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.2)',
  },
  title: { 
    fontSize: 32, 
    fontWeight: '800', 
    color: '#fff', 
    marginBottom: 16,
    textAlign: 'center',
  },
  description: { 
    fontSize: 16, 
    color: '#a1a1aa', 
    textAlign: 'center', 
    marginBottom: 40,
    lineHeight: 24,
    paddingHorizontal: 20,
  },
  features: {
      marginBottom: 48,
      alignItems: 'flex-start',
  },
  featureRow: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
  },
  dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: '#60a5fa',
      marginRight: 12,
  },
  featureText: {
      color: '#e4e4e7',
      fontSize: 16,
  },
  cta: { 
    backgroundColor: '#4f46e5', 
    paddingVertical: 16,
    paddingHorizontal: 32, 
    borderRadius: 30, 
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#4f46e5',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  ctaText: { 
    color: '#fff', 
    fontWeight: '600',
    fontSize: 18,
  },
  secondaryCta: {
      padding: 16,
  },
  secondaryCtaText: {
      color: '#a1a1aa',
      fontSize: 16,
      fontWeight: '500',
  },
});
