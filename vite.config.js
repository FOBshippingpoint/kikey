import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/kikey.ts"),
      name: "kikey",
      fileName: "kikey",
    },
  },
  test: {
    environment: "happy-dom",
  },
});
