import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 8081,
    host: true,
  },
  resolve: {
    alias: [
      { find: 'react-native/Libraries/Utilities/codegenNativeComponent', replacement: path.resolve(__dirname, './shim.js') },
      { find: /^react-native$/, replacement: path.resolve(__dirname, './react-native-web-proxy.js') },
    ],
    extensions: ['.web.tsx', '.web.ts', '.web.jsx', '.web.js', '.tsx', '.ts', '.jsx', '.js'],
  },
  define: {
    global: 'window',
    __DEV__: JSON.stringify(true),
    process: {
      env: {
        NODE_ENV: JSON.stringify(process.env.NODE_ENV || 'development'),
      }
    }
  },
  build: {
    commonjsOptions: {
      transformMixedEsModules: true,
    },
  },
  optimizeDeps: {
    esbuildOptions: {
      resolveExtensions: [
        '.web.tsx',
        '.web.ts',
        '.web.jsx',
        '.web.js',
        '.tsx',
        '.ts',
        '.jsx',
        '.js',
      ],
    },
  },
});
