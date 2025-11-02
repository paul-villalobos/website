// @ts-check
import { defineConfig } from "astro/config";

import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  site: "https://paulvillalobos.com",
  integrations: [
    mdx(),
    sitemap({
      changefreq: "weekly",
      priority: 0.7,
      lastmod: new Date(),
      // Filtrar posts que no sean draft
      filter: (page) => {
        // Excluir páginas de posts que sean draft
        if (page.includes("/posts/")) {
          // El filtrado se hace automáticamente por Astro content collections
          return true;
        }
        return true;
      },
    }),
  ],

  vite: {
    plugins: [tailwindcss()],
  },
});
