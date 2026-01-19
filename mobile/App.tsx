import React, { useState } from 'react';
import { StatusBar, StyleSheet, View, Linking } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import Header from './src/components/Header';
import Home from './src/screens/Home';
import Dashboard from './src/screens/Dashboard';
import Login from './src/screens/Login';
import Register from './src/screens/Register';
import GetStarted from './src/screens/GetStarted';
import ForgotPassword from './src/screens/ForgotPassword';
import ResetPassword from './src/screens/ResetPassword';
import CreateArea from './src/screens/CreateArea';
import LoggedInHome from './src/screens/LoggedInHome';
import Settings from './src/screens/Settings';
import AreasScreen from './src/screens/AreasScreen';
import AreaDetailsScreen from './src/screens/AreaDetailsScreen';
import LogsScreen from './src/screens/LogsScreen';
import Services from './src/screens/Services';
import OAuthCallbackScreen from './src/screens/OAuthCallbackScreen';

function AppContent() {
  const { isAuthenticated, user, logout } = useAuth();
  const [screen, setScreen] = useState<string>('Home');
  const [screenParams, setScreenParams] = useState<any>(null);

  useEffect(() => {
    const handleDeepLink = (event: { url: string }) => {
      const url = event.url;
      if (url && (url.startsWith('area://') || url.includes('/oauth/callback'))) {
        console.log("Deep link received:", url);
        navigateTo('OAuthCallback', { url });
      }
    };

    // Get initial URL
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    // Listen for incoming links
    const subscription = Linking.addEventListener('url', handleDeepLink);

    return () => {
      subscription.remove();
    };
  }, []);

  function navigateTo(s: string, params?: any) {
    setScreen(s);
    setScreenParams(params || null);
  }

  function handleLogout() {
    logout();
    setScreen('Home');
  }

  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#0f1724" />
      <View style={styles.container}>
        <Header onNavigate={navigateTo} isAuthenticated={isAuthenticated} onLogout={handleLogout} />
        {screen === 'Home' && (isAuthenticated ? <LoggedInHome navigate={navigateTo} user={user} /> : <Home navigate={navigateTo} />)}
        {screen === 'Dashboard' && <Dashboard navigate={navigateTo} />}
        {screen === 'Login' && <Login navigate={navigateTo} />}
        {screen === 'Register' && <Register navigate={navigateTo} />}
        {screen === 'GetStarted' && <GetStarted navigate={navigateTo} />}
        {screen === 'ForgotPassword' && <ForgotPassword navigate={navigateTo} />}
        {screen === 'ResetPassword' && <ResetPassword navigate={navigateTo} />}
        {screen === 'CreateArea' && <CreateArea navigate={navigateTo} />}
        {screen === 'Settings' && <Settings navigate={navigateTo} />}
        {screen === 'Areas' && <AreasScreen navigate={navigateTo} />}
        {screen === 'AreaDetails' && <AreaDetailsScreen navigate={navigateTo} route={{ params: screenParams }} />}
        {screen === 'Logs' && <LogsScreen navigate={navigateTo} />}
        {screen === 'Services' && <Services navigate={navigateTo} />}
        {screen === 'OAuthCallback' && <OAuthCallbackScreen navigate={navigateTo} route={{ params: screenParams }} />}
      </View>
    </SafeAreaProvider>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
