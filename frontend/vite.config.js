import { readFileSync } from 'fs';
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import tailwindcss from '@tailwindcss/vite'

const pkg = JSON.parse(readFileSync('./package.json', 'utf8'));

export default defineConfig({
    define: {
        __APP_VERSION__: JSON.stringify(pkg.version || '1.0.0'),
    },

    plugins: [
        react(),
        tailwindcss(),
        VitePWA({
            registerType: 'autoUpdate',
            strategies: 'injectManifest',
            srcDir: 'src',
            filename: 'sw.ts',
            injectRegister: false,
            // Service worker only ever controls /admin/** — the public marketing
            // site is never eligible for installation or SW caching. See
            // src/components/pwa/InstallScopeGate.jsx, which is the only place
            // that calls registerSW(), and only once the user is inside /admin.
            scope: '/admin/',
            includeAssets: [
                'favicon.ico',
                'favicon-16x16.png',
                'favicon-32x32.png',
                'apple-touch-icon.png',
                'safari-pinned-tab.svg',
                'mstile-144x144.png',
                'browserconfig.xml'
            ],
            // Deliberately NOT using the plugin's `manifest` option: vite-plugin-pwa
            // unconditionally injects `<link rel="manifest">` into the built
            // index.html whenever this option is set, which would put it on every
            // route (including the public site) with no way to scope it out.
            // Instead the manifest is a plain static file at public/manifest.webmanifest,
            // and InstallScopeGate.jsx injects the <link> at runtime, only inside /admin.
            manifest: false,
            injectManifest: {
                globPatterns: [],
            },
            devOptions: {
                enabled: true,
                type: 'module',
                navigateFallback: 'index.html'
            }
        })
    ],
    optimizeDeps: {
        exclude: ['axios'],
        include: ['react', 'react-dom', 'lucide-react']
    },
    build: {
        target: 'es2015',
        rollupOptions: {
            output: {
                manualChunks: undefined
            }
        }
    },
    server: {
        host: true,
        port: 5173
    }
})
