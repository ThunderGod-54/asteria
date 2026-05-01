import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Ensure the base path is correct for Vercel deployment
  base: "/",
  build: {
    // Explicitly set the output directory to match Vercel's default
    outDir: "dist",
    // Ensure assets are generated with consistent naming
    assetsDir: "assets",
    // This helps debug if files are missing in the build
    sourcemap: true,
  },
  server: {
    // Helps with local development routing
    historyApiFallback: true,
  },
});
