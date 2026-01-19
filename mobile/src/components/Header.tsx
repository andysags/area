import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, SafeAreaView } from 'react-native';
import { Menu, X } from 'lucide-react-native';
import Logo from './Logo';

type Props = {
  onNavigate: (screen: string) => void;
  isAuthenticated: boolean;
  onLogout?: () => void;
};

export default function Header({ onNavigate, isAuthenticated, onLogout }: Props) {
  const [isOpen, setIsOpen] = useState(false);

  const handleNavigate = (screen: string) => {
    setIsOpen(false);
    onNavigate(screen);
  };

  const handleLogout = () => {
    setIsOpen(false);
    if (onLogout) {
      onLogout();
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.logoContainer} onPress={() => handleNavigate('Home')}>
        <Logo color="#fff" size={32} />
        <Text style={styles.logoText}>Nexus</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => setIsOpen(true)} style={styles.menuButton}>
        <Menu color="#fff" size={24} />
      </TouchableOpacity>

      <Modal visible={isOpen} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <SafeAreaView style={styles.menuContainer}>
            <View style={styles.menuHeader}>
              <TouchableOpacity style={styles.logoContainer} onPress={() => handleNavigate('Home')}>
                <Logo color="#fff" size={32} />
                <Text style={styles.logoText}>Nexus</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setIsOpen(false)} style={styles.menuButton}>
                <X color="#fff" size={24} />
              </TouchableOpacity>
            </View>

            <View style={styles.menuItems}>
              {isAuthenticated && (
                <TouchableOpacity style={styles.menuItem} onPress={() => handleNavigate('Dashboard')}>
                  <Text style={styles.menuItemText}>Tableau de bord</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.menuItem} onPress={() => handleNavigate('Home')}>
                <Text style={styles.menuItemText}>Services</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={() => handleNavigate('Home')}>
                <Text style={styles.menuItemText}>Explorer</Text>
              </TouchableOpacity>

              <View style={styles.divider} />

              {!isAuthenticated ? (
                <>
                  <TouchableOpacity style={styles.menuItem} onPress={() => handleNavigate('Login')}>
                    <Text style={styles.menuItemText}>Connexion</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={styles.ctaButton} onPress={() => handleNavigate('GetStarted')}>
                    <Text style={styles.ctaText}>Commencer</Text>
                  </TouchableOpacity>
                </>
              ) : (
                <>
                  <TouchableOpacity style={styles.menuItem} onPress={() => handleNavigate('Settings')}>
                    <Text style={styles.menuItemText}>Paramètres</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
                    <Text style={styles.menuItemText}>Déconnexion</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 64,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0f1724',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
    zIndex: 50,
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  logoText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '700',
  },
  menuButton: {
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 36, 0.95)',
  },
  menuContainer: {
    flex: 1,
  },
  menuHeader: {
    height: 64,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  menuItems: {
    padding: 24,
    gap: 16,
  },
  menuItem: {
    paddingVertical: 12,
  },
  menuItemText: {
    color: '#e4e4e7',
    fontSize: 18,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.1)',
    marginVertical: 8,
  },
  ctaButton: {
    backgroundColor: '#4f46e5',
    paddingVertical: 14,
    borderRadius: 9999,
    alignItems: 'center',
    marginTop: 8,
  },
  ctaText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
