---
description: Estándares obligatorios de optimización de imágenes y rendimiento para posts del blog (MDX)
globs: src/content/blog/*.mdx
---

# Optimización de Blog Posts

Cada vez que crees, traduzcas o edites un post del blog en formato `.mdx`, **DEBES** seguir estas reglas estrictas de rendimiento:

## 1. Imágenes en el Contenido (MDX)

❌ **NUNCA** uses la sintaxis estándar de Markdown para imágenes locales: `![Alt](../assets/img.png)`.

✅ **SIEMPRE** usa el componente `<Image />` de Astro optimizado:

### Paso A: Importaciones

Importa el componente y la referencia a la imagen en el bloque de script (frontmatter) del MDX:

```astro
---
// ... otros metadatos
import { Image } from 'astro:assets';
import nombreImagen from '../../assets/blog/slug-del-post/nombre-archivo.png';
---
```

### Paso B: Implementación

Renderiza la imagen usando atributos `widths` y `sizes` para generar `srcset` responsivo. El contenedor del blog tiene un ancho máximo de ~800px.

```astro
<Image
  src={nombreImagen}
  alt="Descripción detallada para SEO y accesibilidad"
  widths={[320, 640, 800]}
  sizes="(max-width: 800px) 100vw, 800px"
  class="w-full h-auto rounded-xl shadow-lg my-8"
/>
```

## 2. Accesibilidad y Estilo

- **Clases CSS**: Usa siempre `w-full h-auto rounded-xl shadow-lg my-8` para mantener la consistencia visual.
- **Texto Alternativo**: El atributo `alt` es obligatorio y debe ser descriptivo.
