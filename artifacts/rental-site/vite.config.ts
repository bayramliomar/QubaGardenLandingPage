import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import type { Plugin } from "vite";

const rawPort = process.env.PORT ?? "5173";

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const basePath = process.env.BASE_PATH ?? "/";

function availabilityProxyPlugin(): Plugin {
  const allowedHosts = new Set(["www.airbnb.com", "airbnb.com", "ical.booking.com"]);

  return {
    name: "availability-proxy",
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url ? new URL(req.url, "http://localhost") : null;
        if (!url || !url.pathname.endsWith("/api/availability")) {
          next();
          return;
        }

        const feedUrl = url.searchParams.get("url");
        if (!feedUrl) {
          res.statusCode = 400;
          res.setHeader("Content-Type", "text/plain; charset=utf-8");
          res.end("Missing url parameter");
          return;
        }

        try {
          const upstream = new URL(feedUrl);
          if (upstream.protocol !== "https:" || !allowedHosts.has(upstream.hostname)) {
            throw new Error("Unsupported feed host");
          }

          const response = await fetch(upstream.toString(), {
            headers: {
              Accept: "text/calendar,text/plain;q=0.9,*/*;q=0.8",
            },
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }

          const text = await response.text();
          res.statusCode = 200;
          res.setHeader("Content-Type", "text/calendar; charset=utf-8");
          res.setHeader("Cache-Control", "no-store");
          res.end(text);
        } catch (error) {
          res.statusCode = 502;
          res.setHeader("Content-Type", "text/plain; charset=utf-8");
          res.end(error instanceof Error ? error.message : "Failed to proxy calendar feed");
        }
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url ? new URL(req.url, "http://localhost") : null;
        if (!url || !url.pathname.endsWith("/api/availability")) {
          next();
          return;
        }

        const feedUrl = url.searchParams.get("url");
        if (!feedUrl) {
          res.statusCode = 400;
          res.setHeader("Content-Type", "text/plain; charset=utf-8");
          res.end("Missing url parameter");
          return;
        }

        try {
          const upstream = new URL(feedUrl);
          if (upstream.protocol !== "https:" || !allowedHosts.has(upstream.hostname)) {
            throw new Error("Unsupported feed host");
          }

          const response = await fetch(upstream.toString(), {
            headers: {
              Accept: "text/calendar,text/plain;q=0.9,*/*;q=0.8",
            },
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
          }

          const text = await response.text();
          res.statusCode = 200;
          res.setHeader("Content-Type", "text/calendar; charset=utf-8");
          res.setHeader("Cache-Control", "no-store");
          res.end(text);
        } catch (error) {
          res.statusCode = 502;
          res.setHeader("Content-Type", "text/plain; charset=utf-8");
          res.end(error instanceof Error ? error.message : "Failed to proxy calendar feed");
        }
      });
    },
  };
}

export default defineConfig({
  base: basePath,
  plugins: [
    react(),
    tailwindcss(),
    availabilityProxyPlugin(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
  },
  server: {
    port,
    strictPort: true,
    host: "0.0.0.0",
    allowedHosts: true,
    fs: {
      strict: true,
    },
  },
  preview: {
    port,
    host: "0.0.0.0",
    allowedHosts: true,
  },
});
