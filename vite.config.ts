import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react-swc";
import { readFileSync } from "node:fs";
import path from "node:path";
import { defineConfig } from "vite";

const pkg = JSON.parse(readFileSync("./package.json", "utf-8")) as {
  version: string;
};

// https://vite.dev/config/
export default defineConfig({
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
  },
  base: "/",
  plugins: [
    devtools(),
    tanstackRouter({
      target: "react",
      autoCodeSplitting: true,
    }),
    tailwindcss(),
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    proxy: {
      "/events": {
        target: "https://mercure.pog.creativebits.tech",
        changeOrigin: true,
        secure: true,
        rewrite: (requestPath) =>
          requestPath.replace(/^\/events/, "/.well-known/mercure"),
      },
    },
  },
});
