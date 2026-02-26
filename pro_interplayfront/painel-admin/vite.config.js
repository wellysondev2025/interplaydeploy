// vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite"; // se você realmente usa este plugin
import * as path from "path"; // <-- CORREÇÃO: importa path

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  base: "/", // 👈 mantém
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"), // agora funciona
    },
  },
});