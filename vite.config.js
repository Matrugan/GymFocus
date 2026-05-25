import { rm } from "node:fs/promises";
import { resolve } from "node:path";

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

function omitDownloadApkFromAndroidBuild(mode) {
  return {
    name: "omit-download-apk-from-android-build",
    closeBundle() {
      if (mode !== "android") return undefined;

      return rm(resolve("dist/downloads/gymfocus-android-debug.apk"), {
        force: true,
      });
    },
  };
}

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss(), omitDownloadApkFromAndroidBuild(mode)],
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return undefined;

          if (id.includes("recharts")) return "charts";
          if (id.includes("framer-motion")) return "motion";
          if (id.includes("@supabase")) return "supabase";
          if (id.includes("lucide-react") || id.includes("react-hot-toast")) {
            return "ui";
          }

          return "vendor";
        },
      },
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./src/tests/setup.js",
  },
}));
