import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "./",
  define: { "process.env.NODE_ENV": JSON.stringify("production") },
  build: {
    outDir: "../streamlit_app/component/spreadline_workspace/frontend/build",
    emptyOutDir: true,
    minify: true,
    lib: {
      entry: "src/streamlitEntry.tsx",
      formats: ["es"],
      fileName: () => "index-[hash].js",
    },
  },
});
