import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwind from "@tailwindcss/vite";
export default defineConfig({
  plugins: [react(), tailwind()],
  // Native files are raw workshop previews, not web modules. Avoid loading Expo's tsconfig.
  esbuild: { exclude: [/\.js$/, /\/native\//] },
  server: { port: 5188, strictPort: true },
});
