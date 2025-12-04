// @ts-check
import { defineConfig } from "astro/config";
import { readFileSync, readdirSync } from "node:fs";
import { join, parse } from "node:path";

import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";
import rehypeSlug from "rehype-slug";

import tailwindcss from "@tailwindcss/vite";

import partytown from "@astrojs/partytown";

// Helper para extraer fechas de los posts del blog
const getBlogDates = () => {
  const blogDir = "src/content/blog";
  const dates = new Map();

  try {
    const files = readdirSync(blogDir);
    
    for (const file of files) {
      if (!file.endsWith('.mdx') && !file.endsWith('.md')) continue;
      
      const content = readFileSync(join(blogDir, file), 'utf-8');
      
      // Extract frontmatter
      const match = content.match(/^---\s*([\s\S]*?)\s*---/);
      if (match) {
        const frontmatter = match[1];
        
        // Extract slug if defined, otherwise use filename
        const slugMatch = frontmatter.match(/slug:\s*(.+)/);
        let slug = slugMatch ? slugMatch[1].trim() : parse(file).name;
        if (slug.startsWith('"') || slug.startsWith("'")) {
          slug = slug.replace(/^["']|["']$/g, '');
        }
        
        // Extract dates
        const updatedMatch = frontmatter.match(/updatedDate:\s*(.+)/);
        const pubMatch = frontmatter.match(/pubDate:\s*(.+)/);
        
        let dateStr = updatedMatch ? updatedMatch[1].trim() : (pubMatch ? pubMatch[1].trim() : null);
        
        // Remove quotes if present
        if (dateStr) {
          dateStr = dateStr.replace(/^["']|["']$/g, '');
          const date = new Date(dateStr);
          if (!isNaN(date.getTime())) {
            dates.set(slug, date.toISOString());
          }
        }
      }
    }
  } catch (e) {
    console.warn("Could not read blog posts for sitemap dates:", e);
  }
  
  return dates;
};

const blogDates = getBlogDates();

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
      serialize(item) {
        // Asignar fecha real a posts del blog
        if (item.url.includes('/blog/')) {
           const match = item.url.match(/\/blog\/([^\/]+)\/?$/);
           if (match) {
             const slug = match[1];
             const date = blogDates.get(slug);
             if (date) {
               item.lastmod = date;
             }
           }
        }
        return item;
      }
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
