// @ts-check
import { defineConfig } from "astro/config";

import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import rehypeSlug from "rehype-slug";

import tailwindcss from "@tailwindcss/vite";

import partytown from "@astrojs/partytown";

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
    mdx({
      rehypePlugins: [rehypeSlug],
    }),
    sitemap({
      changefreq: "weekly",
      priority: 0.7,
      lastmod: new Date(),
    }),
    partytown({
      config: {
        forward: ["dataLayer.push"],
      },
    }),
  ],

  vite: {
    plugins: [tailwindcss()],
  },
  build: {
    inlineStylesheets: "auto",
  },
});
