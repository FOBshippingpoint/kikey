import { resolve } from "path";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "Kikey",
      fileName: "kikey",
      formats: ["umd"],
    },
  },
  test: {
    environment: "happy-dom",
  },
});
