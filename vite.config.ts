import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

// three.js is only reached through the lazy StatueField import, so it lands in its own chunk
// and the sheet's own script stays small.
export default defineConfig({
  plugins: [react()],
  build: { chunkSizeWarningLimit: 700 },
});
