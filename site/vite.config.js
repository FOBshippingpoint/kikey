import { defineConfig } from "vite";

export default defineConfig({
  build: {
    outDir: "./dist", // ./site/dist
  },
  base: "/kikey/", // https://vitejs.dev/guide/static-deploy.html#github-pages
});
