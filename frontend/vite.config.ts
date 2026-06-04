import react, { reactCompilerPreset } from "@vitejs/plugin-react";
import { defineConfig } from "vite";

import babel from "@rolldown/plugin-babel";
import path from "path";

export default defineConfig({
  plugins: [react(), babel({ presets: [reactCompilerPreset()] })],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      // "@components": path.resolve(__dirname, "./src/components"),
    },
  },

  base: "/op-career-hub/",

  server: {
    port: 3000,
  },
});
