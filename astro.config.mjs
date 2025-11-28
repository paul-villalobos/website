// @ts-check
import { defineConfig } from "astro/config";

import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

import tailwindcss from "@tailwindcss/vite";

// https://astro.build/config
export default defineConfig({
  site: "https://paulvillalobos.com",
  redirects: {
    "/ai-agents-comercio-transformacion":
      "/blog/ai-agents-comercio-transformacion",
    "/buyer-persona-de-una-empresa": "/blog/buyer-persona-de-una-empresa",
    "/como-crear-asistente-ia-personalizado":
      "/blog/como-crear-un-asistente-ia-personalizado",
    "/como-tomar-decisiones-basadas-en-datos":
      "/blog/como-tomar-decisiones-basadas-en-datos",
    "/el-rol-del-ceo-en-las-ventas-b2b":
      "/blog/el-rol-del-ceo-en-las-ventas-b2b",
    "/entrena-tu-cerebro-para-trabajar-creativamente-con-la-ia-generativa":
      "/blog/entrena-tu-cerebro-para-trabajar-creativamente-con-la-ia-generativa",
    "/fuentes-de-nuevos-clientes": "/blog/fuentes-de-nuevos-clientes",
    "/tipos-de-vendedores": "/blog/tipos-de-vendedores",
  },
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
