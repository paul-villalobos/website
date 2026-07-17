# 🚀 Guía de Desarrollo de Blog en Astro: Escalable, Ultra Rápido y Optimizado para SEO

Esta guía describe el diagnóstico del proyecto, las mejoras implementadas y las mejores prácticas recomendadas para el desarrollo continuo del blog de **Paul Villalobos (AI Sales Engine)**.

---

## 📊 Diagnóstico y Estado Actual

El proyecto cuenta con bases sólidas utilizando **Astro v7** y **Tailwind CSS v4** (a través de Vite). Hemos implementado y optimizado las siguientes áreas clave:

1. **Loader de Astro 7**: Migración completa al nuevo Content Layer API (`glob` loader) en `src/content.config.ts`.
2. **SEO Estructurado**: Generación automática de datos estructurados JSON-LD en un `@graph` único (combina `BlogPosting` y `BreadcrumbList`), lo que es la recomendación oficial de Google para evitar errores en Search Console.
3. **Carga y Optimización de Imágenes**: Procesamiento nativo con `astro:assets` y el motor `sharp` en producción, entregando formatos modernos como WebP/AVIF y previniendo Layout Shifts (CLS).

---

## 🛠️ Mejoras y Buenas Prácticas Implementadas

### 1. Escalabilidad y Control Editorial (Drafts)
- **Problemática**: No existía una manera segura de crear borradores en el repositorio sin que se construyeran en la web en producción.
- **Solución**: 
  - Se agregó el campo `draft: z.boolean().optional().default(false)` en `src/content.config.ts`.
  - Se modificaron las consultas `getCollection` en `src/pages/blog/index.astro` y `src/pages/blog/[slug].astro` para que excluyan los posts con `draft: true` únicamente en entornos de producción (`import.meta.env.PROD`).
  - *Ventaja*: Los borradores son visibles localmente en desarrollo (`pnpm run dev`), pero no se compilarán ni generarán URLs en la web final, previniendo contenido incompleto o penalizaciones SEO.

### 2. Rendimiento Ultra Rápido (Prefetching Nativo)
- **Problemática**: Aunque las páginas son estáticas y rápidas, la transición al hacer clic a veces requería peticiones al vuelo para el HTML.
- **Solución**:
  - Se activó el prefetching nativo de Astro en `astro.config.mjs`:
    ```javascript
    prefetch: {
      prefetchAll: true,
      defaultStrategy: "hover",
    }
    ```
  - *Ventaja*: Cuando un usuario posiciona el cursor sobre cualquier tarjeta de post (`BlogCard`), Astro precarga el HTML del artículo en segundo plano. Al hacer clic, la transición es instantánea, logrando una velocidad percibida similar a una Single Page App instantánea.

### 3. Automatización de Flujo Editorial (Content Validator CLI)
- **Problemática**: La redacción manual de posts puede introducir errores humanos (rutas de imagen incorrectas, tags mal configurados, keywords prohibidas del cluster "Gratis" o "Bajo Valor").
- **Solución**:
  - Se creó el script de validación `src/scripts/validate-blog.mjs`.
  - Se integró en `package.json` para que corra antes de cada build (`node src/scripts/validate-blog.mjs && astro build`).
  - *Validaciones obligatorias (rompen la compilación si fallan)*:
    - Campos requeridos de metadatos.
    - Regla de tags de la metodología (exactamente 1 del Grupo A, máximo 1 del Grupo B, exactamente 1 del Grupo C).
    - Existencia física del archivo de imagen `heroImage.src` en la carpeta `assets/`.
  - *Advertencias informativas (alertas en amarillo)*:
    - Palabras clave prohibidas del cluster de bajo valor (`gratis`, `free`, `qué es`, `definición`, etc.) en el título, descripción o primeras 300 palabras.
    - Desajustes entre el slug y el nombre de archivo físico.

### 4. Plantilla de Redacción B2B (Engineer's Breakdown)
- **Problemática**: Mantener el tono editorial técnico de "ingeniería de ventas" en cada post.
- **Solución**:
  - Se creó `.estrategia/plantilla_post.mdx` con los valores de configuración correctos y la estructura narrativa recomendada:
    1. **Dolor de Negocio (The Trench Issue)**.
    2. **Deconstrucción de Ingeniería (Explicación técnica + Diagrama Mermaid)**.
    3. **Impacto Financiero (Tabla de ROI / Métricas)**.
    4. **Llamado a la Acción (CTA de alta conversión B2B)**.

---

## 📈 Recomendaciones Continuas de SEO y Rendimiento

### 🖼️ Preparación de Imágenes para el Blog
1. **Ruta y Estructura**: Guarda siempre las imágenes en una subcarpeta dedicada al post:
   `src/assets/blog/[slug]/hero.webp`
   `src/assets/blog/[slug]/diagrama1.webp`
2. **Dimensiones de la Hero Image**: Utiliza una relación de aspecto de **16:9** (medida recomendada: **1200 x 630 px**), ya que es el tamaño ideal y estándar para las tarjetas de Open Graph al compartir en LinkedIn o WhatsApp.
3. **Optimización previa**: Aunque Astro comprime imágenes en build, es buena práctica pasar tus imágenes por herramientas como **TinyPNG** o guardarlas directamente en formato **WebP** desde tu editor de diseño para minimizar el uso de disco y acelerar el tiempo de compilación local.

### 🌐 Optimización de Cargas y Scripts de Terceros
- **Partytown**: Actualmente tienes cargado `@astrojs/sitemap` y `@astrojs/partytown`. Asegúrate de que las herramientas externas de analítica o chat (ej: scripts de seguimiento, píxel de Meta o Widgets de WhatsApp) se inyecten usando `<script type="text/partytown">`. Esto mueve la ejecución del script fuera del hilo de renderizado principal (main thread), garantizando que el Interaction to Next Paint (INP) y el Time to Interactive (TTI) de la página del blog se mantengan en rangos excepcionales.
- **Prefetch Directo**: Para botones clave de llamada a la acción (como links a agendar llamadas), puedes forzar el prefetching en el viewport añadiendo el atributo `data-astro-prefetch="viewport"` al enlace `<a>` para acelerar aún más la conversión.

### 📑 Redacción de Títulos y Metadescripciones Premium
- **Títulos**: Mantener entre 50 y 60 caracteres. Incluye la keyword principal al inicio (ej: *"Pipeline de Ventas: Cómo limpiar..."* en lugar de *"Aprende la manera en que puedes limpiar tu pipeline de ventas"*).
- **Descripciones**: Entre 130 y 155 caracteres. Terminar siempre con un verbo de acción (ej: *"Descubre el sistema...", "Aplica el playbook..."*).
- **Evitar la lista negra**: Revisa regularmente el reporte del script `pnpm run validate-content` para asegurar que ningún contenido se desvíe hacia la atracción de tráfico académico de baja conversión.
