import { defineCollection, z } from "astro:content";

const blog = defineCollection({
  type: "content",
  schema: ({ image }) =>
    z.object({
      title: z.string(),
      description: z.string(),
      pubDate: z.coerce.date(),
      updatedDate: z.coerce.date().optional(),
      author: z.string().default("Paul Villalobos"),
      // Categorías del Blog (Los 4 Pilares)
      category: z
        .enum([
          "estrategia-comercial",
          "operaciones-revops",
          "tecnologia-crm",
          "ia-ventas",
        ])
        .optional(),
      tags: z.array(z.string()).default([]),
      relatedPhase: z.number().int().min(1).max(8).optional(),
      featured: z.boolean().default(false),
      slug: z.string().optional(),
      canonical: z.string().url().optional(),
      draft: z.boolean().default(false),
      heroImage: z
        .union([
          // 1. Objeto con src string (URLs públicas o externas)
          z.object({
            src: z.string(),
            alt: z.string(),
          }),
          // 2. String simple (legacy support)
          z.string(),
          z.null(),
        ])
        .optional(),
    }),
});

export const collections = { blog };
