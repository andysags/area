import { AppRegistry } from 'react-native';
import App from './App';
import { name as appName } from './app.json';

// Polyfills for Web
if (typeof window !== 'undefined') {
  window.global = window;
  if (!window.setImmediate) {
    window.setImmediate = (fn) => setTimeout(fn, 0);
  }
}

AppRegistry.registerComponent(appName, () => App);

AppRegistry.runApplication(appName, {
  initialProps: {},
  rootTag: document.getElementById('root'),
});
