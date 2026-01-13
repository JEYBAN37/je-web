import path from "path" // Importa esto
import react from "@vitejs/plugin-react-swc"
import { defineConfig } from "vite"
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"), // Configura el alias aquí
    },
  },
})