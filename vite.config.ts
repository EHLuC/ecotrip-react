import path from "path";
import { fileURLToPath } from "url";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

// Eu preciso simular o __dirname porque no ambiente de módulos ES (ESM) ele não existe nativamente.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// https://vite.dev/config/
export default defineConfig({
  // Eu carrego os plugins essenciais: React, Tailwind v4 e o SingleFile (opcional, mas bom para deploy simples).
  plugins: [react(), tailwindcss(), viteSingleFile()],
  resolve: {
    // Eu crio um alias '@' para apontar para a pasta src, facilitando os imports (ex: @/utils/cn).
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
});