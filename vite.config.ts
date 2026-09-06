import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/postcss';
import { fileURLToPath, URL } from 'node:url';
export default defineConfig({
 plugins: [react()],
 resolve: { alias: { '@': fileURLToPath(new URL('.', import.meta.url)) } },
 css: { postcss: { plugins: [tailwindcss()] } },
 build: { rollupOptions: { input: {
 home: fileURLToPath(new URL('index.html', import.meta.url)),
 projects: fileURLToPath(new URL('projects/index.html', import.meta.url)),
 approach: fileURLToPath(new URL('approach/index.html', import.meta.url)),
 about: fileURLToPath(new URL('about/index.html', import.meta.url)),
 } } },
});
