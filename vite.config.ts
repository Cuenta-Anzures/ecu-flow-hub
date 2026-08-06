// @lovable.dev/vite-tanstack-config already includes the required
// TanStack, React, Tailwind, tsconfig paths and Nitro plugins.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    server: {
      entry: "server",
    },
  },

  vite: {
    // Keep Lovable's defaults.
  },

  nitro: {
    preset: "node-server",
  },
});
