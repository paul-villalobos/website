---
description: Estrategia completa de SEO para el sitio, incluyendo metadatos, datos estructurados, breadcrumbs, y mejores prácticas implementadas.
alwaysApply: false
---

# name: seo-best-practices

# description: Reglas y mejores prácticas SEO implementadas en el sitio para garantizar optimización completa, indexación adecuada y mejor rendimiento en motores de búsqueda.

# globs: ["src/pages/**/*.astro", "src/layouts/**/*.astro", "src/components/**/*.astro"]

# alwaysApply: true

## 🎯 Objetivo

Garantizar que todas las páginas del sitio implementen las mejores prácticas SEO siguiendo los patrones establecidos, incluyendo metadatos dinámicos, datos estructurados JSON-LD, breadcrumbs, y optimizaciones técnicas.

---

## ✅ REQUISITOS OBLIGATORIOS PARA TODAS LAS PÁGINAS

### 1. Metadatos SEO Dinámicos

**SIEMPRE** pasar props a `MainLayout` en lugar de usar scripts inline:

```astro
// ✅ CORRECTO
import { generateHomeMeta } from '../utils/blogUtils';
const homeMeta = generateHomeMeta();

<MainLayout
  title={homeMeta.title}
  description={homeMeta.description}
  keywords={homeMeta.keywords}
  canonical={homeMeta.canonical}
  ogImage={homeMeta.ogImage}
  ogType={homeMeta.ogType}
  structuredData={homeStructuredData}
>
```

```astro
// ❌ INCORRECTO - NUNCA usar scripts inline para metadatos
<MainLayout>
  <script is:inline>
    document.title = "..."; // ❌ MAL
  </script>
</MainLayout>
```

### 2. Funciones de Generación de Metadatos

**SIEMPRE** crear funciones específicas en `src/utils/blogUtils.ts` para generar metadatos:

```typescript
/**
 * Genera metadatos SEO para [nombre de la página]
 */
export function generate[Nombre]Meta() {
  const siteUrl = "https://paulvillalobos.com";
  const pageUrl = `${siteUrl}/[ruta]`;

  return {
    title: "[Título específico] | Paul Villalobos - [Descripción]",
    description: "[Descripción optimizada para SEO, 150-160 caracteres]",
    keywords: "[keywords relevantes, separadas por comas]",
    canonical: pageUrl,
    ogImage: `${siteUrl}/images/og-default.jpg`, // O imagen específica
    ogType: "website", // O "article" para posts
  };
}
```

### 3. Datos Estructurados JSON-LD

**SIEMPRE** incluir datos estructurados JSON-LD apropiados:

```typescript
/**
 * Genera datos estructurados JSON-LD para [nombre de la página]
 */
export function generate[Nombre]StructuredData() {
  const siteUrl = "https://paulvillalobos.com";
  const pageUrl = `${siteUrl}/[ruta]`;

  return {
    "@context": "https://schema.org",
    "@type": "[TipoSchema]", // Person, Blog, ContactPage, etc.
    // ... propiedades específicas del tipo
  };
}
```

**Para páginas con breadcrumbs**, usar `@graph`:

```typescript
{
  "@context": "https://schema.org",
  "@graph": [
    // Datos estructurados principales
    mainStructuredData,
    // Datos estructurados de breadcrumbs
    breadcrumbStructuredData
  ]
}
```

### 4. Breadcrumbs

**SIEMPRE** incluir breadcrumbs en páginas que no sean la home:

```typescript
// Generar breadcrumbs
const breadcrumbs = [
  { name: "Inicio", url: "https://paulvillalobos.com" },
  { name: "[Página]", url: "https://paulvillalobos.com/[ruta]" },
];

// Generar datos estructurados de breadcrumbs
const breadcrumbStructuredData = generateBreadcrumbStructuredData(breadcrumbs);
```

**Template de breadcrumbs visuales:**

```astro
<nav class="mb-6 flex justify-center" aria-label="Breadcrumb">
  <ol class="flex items-center space-x-2 text-sm text-slate-600">
    {breadcrumbs.map((item, index) => (
      <li class="flex items-center">
        {index > 0 && (
          <svg class="w-4 h-4 mx-2" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd"></path>
          </svg>
        )}
        {index === breadcrumbs.length - 1 ? (
          <span class="text-slate-900 font-medium">{item.name}</span>
        ) : (
          <a href={item.url} class="hover:text-blue-600 transition-colors duration-200">
            {item.name}
          </a>
        )}
      </li>
    ))}
  </ol>
</nav>
```

---

## 🖼️ OPTIMIZACIÓN DE IMÁGENES

### Dimensiones Explícitas

**SIEMPRE** incluir `width` y `height` en todas las imágenes:

```astro
<!-- ✅ CORRECTO -->
<img
  src={imageUrl}
  alt={imageAlt}
  width="640"
  height="360"
  loading="lazy"
/>

<!-- ❌ INCORRECTO -->
<img src={imageUrl} alt={imageAlt} />
```

**Proporciones estándar:**

- Hero/Blog cards: `width="640" height="360"` (16:9)
- Open Graph: `width="1200" height="630"` (1.91:1)
- Profile/avatar: `width="400" height="400"` (1:1)

---

## 📝 CANONICAL URLs

### Priorizar Canonical del Frontmatter

**SIEMPRE** priorizar canonical del frontmatter si existe:

```typescript
// ✅ CORRECTO
const canonicalUrl = post.data.canonical || `${siteUrl}/blog/${post.slug}`;

// ❌ INCORRECTO - Ignorar canonical del frontmatter
const canonicalUrl = `${siteUrl}/blog/${post.slug}`;
```

### URLs Consistentes

**SIEMPRE** usar el mismo patrón de URL en:

- Canonical meta tag
- Open Graph URL
- Twitter URL
- Datos estructurados JSON-LD

---

## 🚫 LO QUE NUNCA DEBES HACER

### ❌ Scripts Inline para Metadatos

```astro
<!-- ❌ NUNCA -->
<script is:inline>
  document.title = "...";
  document.querySelector('meta[name="description"]').setAttribute('content', '...');
</script>
```

### ❌ Microdata (itemscope, itemprop, itemtype)

```astro
<!-- ❌ NUNCA usar microdata -->
<article itemscope itemtype="https://schema.org/BlogPosting">
  <h2 itemprop="headline">...</h2>
</article>

<!-- ✅ SIEMPRE usar solo JSON-LD -->
<script type="application/ld+json" set:html={JSON.stringify(structuredData)}></script>
```

### ❌ Datos Estructurados Duplicados

No mezclar JSON-LD con microdata en el mismo elemento.

### ❌ Metadatos Hardcodeados

```astro
<!-- ❌ NUNCA -->
<MainLayout title="Mi Página" description="Descripción hardcodeada">

<!-- ✅ SIEMPRE -->
const pageMeta = generatePageMeta();
<MainLayout title={pageMeta.title} description={pageMeta.description}>
```

---

## 📋 PATRONES POR TIPO DE PÁGINA

### Página Principal (Home)

```astro
---
import { generateHomeMeta, generateHomeStructuredData } from '../utils/blogUtils';

const homeMeta = generateHomeMeta();
const homeStructuredData = generateHomeStructuredData();
---

<MainLayout
  title={homeMeta.title}
  description={homeMeta.description}
  keywords={homeMeta.keywords}
  canonical={homeMeta.canonical}
  ogImage={homeMeta.ogImage}
  ogType={homeMeta.ogType}
  structuredData={homeStructuredData}
>
```

### Páginas de Contenido (Blog, Contacto, etc.)

```astro
---
import { generateBlogMeta, generateBlogStructuredData, generateBlogBreadcrumbs, generateBreadcrumbStructuredData } from '../utils/blogUtils';

const pageMeta = generateBlogMeta(data);
const pageStructuredData = generateBlogStructuredData(data);
const breadcrumbs = generateBlogBreadcrumbs();
const breadcrumbStructuredData = generateBreadcrumbStructuredData(breadcrumbs);

const combinedStructuredData = {
  "@context": "https://schema.org",
  "@graph": [
    pageStructuredData,
    breadcrumbStructuredData
  ]
};
---

<MainLayout
  title={pageMeta.title}
  description={pageMeta.description}
  keywords={pageMeta.keywords}
  canonical={pageMeta.canonical}
  ogImage={pageMeta.ogImage}
  ogType={pageMeta.ogType}
  structuredData={combinedStructuredData}
>
  <!-- Breadcrumbs visuales -->
  <!-- Contenido -->
</MainLayout>
```

### Posts del Blog

Usar `BlogLayout` que ya maneja todo automáticamente:

```astro
<BlogLayout
  post={processedPost}
  showTOC={true}
  includeBreadcrumbs={true}
>
  <Content />
</BlogLayout>
```

---

## 🔧 OPTIMIZACIONES TÉCNICAS

### 1. Datos Estructurados del Blog

**SIEMPRE** limitar a los primeros 10 posts más recientes:

```typescript
// ✅ CORRECTO
const recentPosts = processedPosts.slice(0, 10);
blogPost: recentPosts.map((post) => ({ ... }))

// ❌ INCORRECTO - Incluir todos los posts
blogPost: processedPosts.map((post) => ({ ... }))
```

### 2. Sitemap y Robots.txt

- El sitemap se genera automáticamente con `@astrojs/sitemap`
- `robots.txt` está en `public/robots.txt`
- **NO modificar manualmente** - se generan en build time

### 3. Open Graph Images

**SIEMPRE** incluir dimensiones:

```astro
<meta property="og:image" content={ogImage} />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content={title} />
```

---

## ✅ CHECKLIST PARA NUEVAS PÁGINAS

Al crear una nueva página, asegúrate de:

- [ ] Crear función `generate[Nombre]Meta()` en `blogUtils.ts`
- [ ] Crear función `generate[Nombre]StructuredData()` en `blogUtils.ts`
- [ ] Pasar todas las props a `MainLayout`
- [ ] Incluir breadcrumbs si no es la home
- [ ] Generar datos estructurados de breadcrumbs
- [ ] Combinar datos estructurados con `@graph` si hay breadcrumbs
- [ ] Agregar breadcrumbs visuales en el template
- [ ] Incluir dimensiones en todas las imágenes
- [ ] Verificar canonical URLs sean consistentes
- [ ] No usar scripts inline para metadatos
- [ ] No usar microdata, solo JSON-LD

---

## 📚 TIPOS DE SCHEMA ORGANIZADOS POR CONTEXTO

- **Person**: Página principal, autor
- **Blog**: Listado de posts del blog
- **BlogPosting**: Posts individuales
- **ContactPage**: Página de contacto
- **BreadcrumbList**: Navegación (siempre con breadcrumbs)
- **Service**: Servicios ofrecidos (en Person)

---

## 🎨 CONSISTENCIA VISUAL

**SIEMPRE** mantener consistencia en:

- Estilo de breadcrumbs (centrado, mismo diseño)
- Metadatos visuales de posts (fecha, autor, categoría)
- CTAs y enlaces (mismo estilo de hover)
- Espaciado y padding (mismo sistema)

---

## 🔍 VALIDACIÓN

Antes de finalizar, verificar:

1. Todas las páginas tienen metadatos dinámicos
2. No hay scripts inline para metadatos
3. No hay microdata mezclado con JSON-LD
4. Todas las imágenes tienen width y height
5. Breadcrumbs están en todas las páginas (excepto home)
6. Datos estructurados están validados (usar Schema.org validator)

---

## 📝 EJEMPLOS COMPLETOS

Ver implementaciones de referencia en:

- `src/pages/index.astro` - Página principal
- `src/pages/blog/index.astro` - Listado de blog (con soporte de drafts)
- `src/pages/contacto.astro` - Página de contacto
- `src/pages/blog/[slug].astro` - Posts individuales (con soporte de drafts)
- `src/utils/blogUtils.ts` - Funciones de generación SEO

---

## 🚀 PRIORIDADES

1. **CRÍTICO**: Metadatos dinámicos, datos estructurados, canonical URLs
2. **IMPORTANTE**: Breadcrumbs, dimensiones de imágenes
3. **MEJORAS**: Optimizaciones de datos estructurados, validaciones adicionales
