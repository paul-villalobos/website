---
description: Establishes a clean, SEO-friendly and AI-readable URL architecture for Astro blog content. This rule helps maintain evergreen URLs, prevent SEO cannibalization, and ensure long-term authority by enforcing consistent naming conventions and metadata.
helpfulFor: This rule is helpful when organizing or creating new blog posts in Astro. It guides you on whether to include publication dates in URLs, how to structure folders by year or topic, and how to maintain a sustainable evergreen content system that search engines and AI crawlers can understand.

alwaysApply: false
---

# name: seo-url-structure

# description: Define las reglas de estructura de URLs y arquitectura SEO para el blog en Astro, priorizando contenido evergreen y una jerarquía clara para SEO e indexación por IA.

# globs: ["src/content/blog/**/*.mdx", "src/content/blog/**/*.md"]

# alwaysApply: true

## 🎯 Objetivo

Garantizar que todas las URLs del blog sean **amigables para SEO** y **comprensibles para IA**, manteniendo la autoridad a largo plazo mediante una estructura **evergreen-first** y una convención clara de metadatos.

---

## 🧱 Convención general

**Por defecto (contenido evergreen):**
/blog/slug-del-articulo/

**Ejemplo:**
/blog/como-crear-un-asistente-ia-personalizado/

👉 Sin fecha en la URL.  
👉 Fecha visible solo en `pubDate` y `updatedDate` dentro del frontmatter.

---

## 🧠 Reglas semánticas

1. **Evitar fechas en el slug o título** de los posts evergreen.

   - ❌ “guia-ia-2023.mdx”
   - ✅ “guia-inteligencia-artificial.mdx”

2. **Gestión de Fechas en Frontmatter**:

   - **Creación**: Al crear un nuevo post, `pubDate` DEBE establecerse a la fecha actual (YYYY-MM-DD).
   - **Actualización**: Al modificar un post existente, `updatedDate` DEBE actualizarse a la fecha actual (YYYY-MM-DD).

   ```md
   pubDate: "YYYY-MM-DD"     # Fecha de publicación original
   updatedDate: "YYYY-MM-DD" # Fecha de última modificación
   ```

3. Usar campos SEO consistentes:

slug: "como-crear-un-asistente-ia-personalizado"
description: "Guía práctica para crear un asistente de IA personalizado sin código."
canonical: "https://paulvillalobos.com/blog/como-crear-un-asistente-ia-personalizado/"

4. Para contenido evergreen, mantener una sola URL y actualizar el updatedDate.

5. Títulos siempre atemporales, ejemplo:

✅ “Cómo Crear un Asistente de IA Personalizado”

❌ “Cómo Crear un Asistente de IA Personalizado en 2023”
