import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY');
  return {
  plugins: [react()],
  define: {
    'import.meta.env.VITE_CLERK_PUBLISHABLE_KEY': JSON.stringify(env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY || ''),
  },
  server: {
    port: 3000,
    open: false,
  },
  };
});
