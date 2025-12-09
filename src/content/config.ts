import { defineCollection, z } from "astro:content";

// Grupos de Tags según estrategia
const GroupATags = [
  "ToFu - Demanda",
  "MoFu - Gestión de Leads",
  "BoFu - Cierre y Negociación",
  "Postventa y LTV",
  "Inteligencia Comercial",
] as const;

const GroupBTags = [
  "WhatsApp & Chatbots",
  "KPIs & Métricas",
  "Excel & Data",
  "Stack Tecnológico",
] as const;

const GroupCTags = [
  "Playbook Táctico",
  "Estrategia & Opinión",
  "Caso de Estudio",
] as const;

// Unión de todos los tags permitidos para el enum
const AllTags = [...GroupATags, ...GroupBTags, ...GroupCTags] as const;

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
          "estrategia-ventas-b2b-direccion",
          "embudos-pipeline-revops",
          "crm-tecnologia-ventas",
          "inteligencia-artificial-automatizacion",
        ])
        .optional(),
      tags: z
        .array(z.enum(AllTags))
        .default([])
        .refine(
          (tags) => {
            const countA = tags.filter((t) =>
              GroupATags.includes(t as any)
            ).length;
            const countB = tags.filter((t) =>
              GroupBTags.includes(t as any)
            ).length;
            const countC = tags.filter((t) =>
              GroupCTags.includes(t as any)
            ).length;

            // Regla: Exactamente 1 del Grupo A, Máximo 1 del Grupo B, Exactamente 1 del Grupo C
            return countA === 1 && countB <= 1 && countC === 1;
          },
          {
            message:
              "Los tags deben cumplir la estructura: 1 del Grupo A (Fase), opcionalmente 1 del Grupo B (Herramienta), y 1 del Grupo C (Formato).",
          }
        ),
      featured: z.boolean().default(false),
      slug: z.string().optional(),
      canonical: z.string().url().optional(),
      draft: z.boolean().default(false),
      heroImage: z
        .object({
          src: image(),
          alt: z.string(),
        })
        .optional(),
    }),
});

export const collections = { blog };
