import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { VitePWA } from "vite-plugin-pwa";

declare const process: {
  env: Record<string, string | undefined>;
};

function getGithubPagesBase() {
  const repoEnv = process.env.GITHUB_REPOSITORY; // "<owner>/<repo>"
  const isGithubActions = process.env.GITHUB_ACTIONS === "true";
  if (!isGithubActions || !repoEnv) return "/";

  const [owner, repo] = repoEnv.split("/");
  if (!owner || !repo) return "/";

  // User/Org site: "<owner>.github.io" is hosted at the root.
  if (repo.toLowerCase() === `${owner.toLowerCase()}.github.io`) return "/";

  // Project site: hosted under "/<repo>/"
  return `/${repo}/`;
}

export default defineConfig(() => {
  const base = getGithubPagesBase();

  return {
    base,
    plugins: [
      react(),
      VitePWA({
        registerType: "autoUpdate",
        includeAssets: ["favicon.svg", "apple-touch-icon.png"],
        manifest: {
          name: "Grindstone",
          short_name: "Grindstone",
          description: "A local-first workout companion for Daily Reps style training.",
          theme_color: "#111827",
          background_color: "#0b1020",
          display: "standalone",
          start_url: base,
          scope: base,
          icons: [
            {
              src: `${base}pwa-192x192.png`,
              sizes: "192x192",
              type: "image/png"
            },
            {
              src: `${base}pwa-512x512.png`,
              sizes: "512x512",
              type: "image/png"
            },
            {
              src: `${base}maskable-icon-512x512.png`,
              sizes: "512x512",
              type: "image/png",
              purpose: "maskable"
            }
          ]
        }
      })
    ]
  };
});
