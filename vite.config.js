import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import vitePluginRequire from "vite-plugin-require";
export default defineConfig({
    plugins: [
        tailwindcss(),
        vitePluginRequire.default()
    ],
})