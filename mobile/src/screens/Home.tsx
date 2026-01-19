import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Dimensions, Animated, LayoutAnimation, Platform, UIManager } from 'react-native';
import { Zap, Globe, Shield, CheckCircle, Users, FileText, Code, Star, ChevronDown, Play, ArrowRight } from 'lucide-react-native';

const { width } = Dimensions.get('window');

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const FadeInView = ({ delay = 0, children, style }: any) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateAnim = useRef(new Animated.Value(20)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        delay,
        useNativeDriver: true,
      }),
      Animated.timing(translateAnim, {
        toValue: 0,
        duration: 600,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [delay]);

  return (
    <Animated.View style={[style, { opacity: fadeAnim, transform: [{ translateY: translateAnim }] }]}>
      {children}
    </Animated.View>
  );
};

const AccordionItem = ({ question, answer }: { question: string, answer: string }) => {
  const [expanded, setExpanded] = useState(false);

  const toggleExpand = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setExpanded(!expanded);
  };

  return (
    <View style={styles.accordionItem}>
      <TouchableOpacity onPress={toggleExpand} style={styles.accordionHeader}>
        <Text style={styles.accordionQuestion}>{question}</Text>
        <ChevronDown size={20} color="#94a3b8" style={{ transform: [{ rotate: expanded ? '180deg' : '0deg' }] }} />
      </TouchableOpacity>
      {expanded && (
        <View style={styles.accordionContent}>
          <Text style={styles.accordionAnswer}>{answer}</Text>
        </View>
      )}
    </View>
  );
};

export default function Home({ navigate }: { navigate: (s: string) => void }) {
  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      
      {/* Background Blobs */}
      <View style={styles.blobContainer}>
        <View style={[styles.blob, styles.blobBlue]} />
        <View style={[styles.blob, styles.blobPurple]} />
      </View>

      {/* Hero Section */}
      <View style={styles.heroSection}>
        <FadeInView delay={0}>
          <View style={styles.badge}>
            <View style={styles.badgeDot} />
            <Text style={styles.badgeText}>Nouveau : Workflows IA</Text>
          </View>
        </FadeInView>

        <FadeInView delay={100}>
          <Text style={styles.heroTitle}>
            Automatisez votre vie numérique{'\n'}
            <Text style={styles.heroTitleGradient}>sans limites.</Text>
          </Text>
        </FadeInView>

        <FadeInView delay={200}>
          <Text style={styles.heroDescription}>
            Connectez vos applications et appareils préférés pour créer des automatisations puissantes. 
            Simple, sécurisé et fiable.
          </Text>
        </FadeInView>

        <FadeInView delay={300} style={styles.heroButtons}>
          <TouchableOpacity style={styles.primaryButton} onPress={() => navigate('GetStarted')}>
            <Text style={styles.primaryButtonText}>Commencer</Text>
            <ArrowRight size={20} color="#fff" style={{ marginLeft: 8 }} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.secondaryButton} onPress={() => navigate('Login')}>
            <Play size={16} color="#cbd5e1" style={{ marginRight: 8 }} fill="currentColor" />
            <Text style={styles.secondaryButtonText}>Démo</Text>
          </TouchableOpacity>
        </FadeInView>
      </View>

      {/* Social Proof */}
      <View style={styles.socialProofSection}>
        <Text style={styles.socialProofTitle}>ILS NOUS FONT CONFIANCE</Text>
        <View style={styles.brandsContainer}>
          {['Google Drive', 'Microsoft Teams', 'Spotify', 'Discord'].map((brand, i) => (
            <Text key={i} style={styles.brandText}>{brand}</Text>
          ))}
        </View>
      </View>

      {/* Features Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Tout pour évoluer</Text>
        <Text style={styles.sectionSubtitle}>Fonctionnalités puissantes pour équipes modernes.</Text>

        <View style={styles.grid}>
          {[
            { icon: Zap, title: "Ultra Rapide", desc: "Exécution temps réel.", color: "#facc15", bg: "rgba(250, 204, 21, 0.1)" },
            { icon: Globe, title: "Global", desc: "Connectivité mondiale.", color: "#60a5fa", bg: "rgba(96, 165, 250, 0.1)" },
            { icon: Shield, title: "Sécurisé", desc: "Chiffrement de bout en bout.", color: "#4ade80", bg: "rgba(74, 222, 128, 0.1)" },
            { icon: Users, title: "Collaboration", desc: "Partagez vos flux.", color: "#c084fc", bg: "rgba(192, 132, 252, 0.1)" },
            { icon: FileText, title: "Logs", desc: "Historique détaillé.", color: "#fb923c", bg: "rgba(251, 146, 60, 0.1)" },
            { icon: Code, title: "API", desc: "Extensible par code.", color: "#f472b6", bg: "rgba(244, 114, 182, 0.1)" }
          ].map((item, i) => (
            <View key={i} style={styles.featureCard}>
              <View style={[styles.featureIconBox, { backgroundColor: item.bg }]}>
                <item.icon size={24} color={item.color} />
              </View>
              <Text style={styles.featureCardTitle}>{item.title}</Text>
              <Text style={styles.featureCardDesc}>{item.desc}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Why Choose Nexus */}
      <View style={[styles.section, styles.whySection]}>
        <Text style={styles.sectionTitle}>Pourquoi Nexus ?</Text>
        <View style={styles.whyList}>
          {['Éditeur visuel intuitif', '100+ Intégrations', 'Sécurité RGPD', 'Support 24/7'].map((item, i) => (
            <View key={i} style={styles.whyItem}>
              <CheckCircle size={20} color="#60a5fa" />
              <Text style={styles.whyItemText}>{item}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* How it Works */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Comment ça marche</Text>
        <View style={styles.stepsContainer}>
          {[
            { step: "01", title: "Connecter", desc: "Liez vos apps favorites." },
            { step: "02", title: "Construire", desc: "Créez des flux visuels." },
            { step: "03", title: "Lancer", desc: "Automatisez tout." }
          ].map((item, i) => (
            <View key={i} style={styles.stepCard}>
              <View style={styles.stepCircle}>
                <Text style={styles.stepNumber}>{item.step}</Text>
              </View>
              <Text style={styles.stepTitle}>{item.title}</Text>
              <Text style={styles.stepDesc}>{item.desc}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Testimonials */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Témoignages</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.testimonialsScroll}>
          {[
            { name: "Alex", role: "Dev", text: "Nexus m'a fait gagner des heures." },
            { name: "Sarah", role: "Marketing", text: "Le meilleur outil d'automatisation." },
            { name: "Mike", role: "CEO", text: "Un ROI incroyable." }
          ].map((t, i) => (
            <View key={i} style={styles.testimonialCard}>
              <View style={styles.starsRow}>
                {[...Array(5)].map((_, k) => <Star key={k} size={12} color="#eab308" fill="#eab308" />)}
              </View>
              <Text style={styles.testimonialText}>"{t.text}"</Text>
              <View style={styles.testimonialAuthor}>
                <View style={styles.avatarPlaceholder}>
                  <Text style={styles.avatarText}>{t.name[0]}</Text>
                </View>
                <View>
                  <Text style={styles.authorName}>{t.name}</Text>
                  <Text style={styles.authorRole}>{t.role}</Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      </View>

      {/* FAQ */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>FAQ</Text>
        <View style={styles.faqContainer}>
          <AccordionItem question="Nexus est-il gratuit ?" answer="Oui, version gratuite disponible." />
          <AccordionItem question="API personnalisées ?" answer="Oui, via notre API Développeur." />
          <AccordionItem question="Sécurisé ?" answer="Chiffrement bancaire AES-256." />
        </View>
      </View>

      {/* CTA */}
      <View style={styles.ctaSection}>
        <Text style={styles.ctaTitle}>Prêt à automatiser ?</Text>
        <Text style={styles.ctaDesc}>Rejoignez 10 000+ utilisateurs.</Text>
        <TouchableOpacity style={styles.ctaButton} onPress={() => navigate('GetStarted')}>
          <Text style={styles.ctaButtonText}>Commencer maintenant</Text>
        </TouchableOpacity>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1724',
  },
  contentContainer: {
    paddingBottom: 40,
  },
  blobContainer: {
    ...StyleSheet.absoluteFillObject,
    overflow: 'hidden',
  },
  blob: {
    position: 'absolute',
    width: width * 0.8,
    height: width * 0.8,
    borderRadius: width * 0.4,
    opacity: 0.15,
  },
  blobBlue: {
    backgroundColor: '#2563eb',
    top: -width * 0.2,
    left: -width * 0.2,
  },
  blobPurple: {
    backgroundColor: '#7c3aed',
    bottom: -width * 0.2,
    right: -width * 0.2,
  },
  heroSection: {
    padding: 24,
    paddingTop: 60,
    alignItems: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    marginBottom: 24,
  },
  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#60a5fa',
    marginRight: 8,
  },
  badgeText: {
    color: '#60a5fa',
    fontSize: 12,
    fontWeight: '600',
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: '800',
    color: '#fff',
    textAlign: 'center',
    lineHeight: 44,
    marginBottom: 16,
  },
  heroTitleGradient: {
    color: '#818cf8',
  },
  heroDescription: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  heroButtons: {
    flexDirection: 'column',
    gap: 16,
    width: '100%',
  },
  primaryButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#2563eb',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 5,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  secondaryButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 999,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  secondaryButtonText: {
    color: '#cbd5e1',
    fontSize: 18,
    fontWeight: '600',
  },
  socialProofSection: {
    paddingVertical: 32,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
    backgroundColor: 'rgba(255, 255, 255, 0.02)',
    alignItems: 'center',
  },
  socialProofTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 1.5,
    marginBottom: 16,
  },
  brandsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 24,
  },
  brandText: {
    color: '#94a3b8',
    fontSize: 16,
    fontWeight: '700',
    opacity: 0.5,
  },
  section: {
    padding: 24,
    paddingTop: 48,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
    textAlign: 'center',
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 32,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: 16,
  },
  featureCard: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  featureIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  featureCardTitle: {
    color: '#f1f5f9',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  featureCardDesc: {
    color: '#94a3b8',
    fontSize: 12,
    lineHeight: 18,
  },
  whySection: {
    backgroundColor: 'rgba(30, 58, 138, 0.1)',
    marginVertical: 24,
    borderRadius: 24,
    marginHorizontal: 12,
  },
  whyList: {
    gap: 16,
    marginTop: 16,
  },
  whyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    padding: 12,
    borderRadius: 12,
  },
  whyItemText: {
    color: '#e2e8f0',
    fontSize: 16,
    fontWeight: '500',
  },
  stepsContainer: {
    gap: 24,
  },
  stepCard: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#1e293b',
    borderWidth: 2,
    borderColor: 'rgba(59, 130, 246, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    shadowColor: '#3b82f6',
    shadowOpacity: 0.2,
    shadowRadius: 10,
  },
  stepNumber: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  stepTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 4,
  },
  stepDesc: {
    color: '#94a3b8',
    textAlign: 'center',
  },
  testimonialsScroll: {
    marginHorizontal: -24,
    paddingHorizontal: 24,
  },
  testimonialCard: {
    width: 280,
    backgroundColor: '#1e293b',
    padding: 20,
    borderRadius: 16,
    marginRight: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  starsRow: {
    flexDirection: 'row',
    gap: 2,
    marginBottom: 12,
  },
  testimonialText: {
    color: '#e2e8f0',
    fontSize: 14,
    fontStyle: 'italic',
    marginBottom: 16,
    lineHeight: 20,
  },
  testimonialAuthor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#3b82f6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontWeight: '700',
  },
  authorName: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  authorRole: {
    color: '#94a3b8',
    fontSize: 12,
  },
  faqContainer: {
    gap: 12,
  },
  accordionItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  accordionQuestion: {
    color: '#e2e8f0',
    fontSize: 16,
    fontWeight: '500',
    flex: 1,
  },
  accordionContent: {
    padding: 16,
    paddingTop: 0,
  },
  accordionAnswer: {
    color: '#94a3b8',
    lineHeight: 20,
  },
  ctaSection: {
    margin: 24,
    padding: 32,
    backgroundColor: 'rgba(37, 99, 235, 0.1)',
    borderRadius: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(37, 99, 235, 0.3)',
  },
  ctaTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 8,
  },
  ctaDesc: {
    color: '#94a3b8',
    marginBottom: 24,
  },
  ctaButton: {
    backgroundColor: '#2563eb',
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 999,
  },
  ctaButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
