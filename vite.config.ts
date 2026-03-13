import tailwindcss from "@tailwindcss/vite";
import { devtools } from "@tanstack/devtools-vite";
import { tanstackRouter } from "@tanstack/router-plugin/vite";
import react from "@vitejs/plugin-react-swc";
import https from "node:https";
import path from "node:path";
import { defineConfig, loadEnv } from "vite";

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");

  // Force IPv4 to avoid IPv6 "Network is unreachable" timeouts
  const httpsAgent = new https.Agent({ family: 4, rejectUnauthorized: false });

  return {
    base: "/cbai/promo/",
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
        "/api": {
          target: env.PROXY_N8N_TARGET,
          changeOrigin: true,
          agent: httpsAgent,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, "/webhook"),
        },
        "/events": {
          target: env.PROXY_MERCURE_TARGET,
          changeOrigin: true,
          agent: httpsAgent,
          secure: false,
          rewrite: (path) => path.replace(/^\/events/, "/.well-known/mercure"),
        },
      },
    },
  };
});
