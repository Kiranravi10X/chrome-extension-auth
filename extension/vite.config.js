import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { viteStaticCopy } from 'vite-plugin-static-copy';

export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        { src: 'manifest.json', dest: '.' }, // Copy manifest.json
        { src: 'src/background.js', dest: '.' }, // Copy background.js
        { src: 'src/content.js', dest: '.' } // ✅ Copy content.js
      ]
    })
  ],
  build: {
    outDir: 'dist',
    emptyOutDir: true
  }
});
