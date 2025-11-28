# Guía de Imágenes para Blog

## Estructura de Carpetas

Las imágenes del blog se guardan en:
```
public/images/blog/{slug-del-post}/
```

### Ejemplo
Para el post con slug `ai-agents-comercio-transformacion`:
```
public/images/blog/ai-agents-comercio-transformacion/
  ├── hero.webp           # Imagen principal (hero image)
  ├── diagram-1.webp      # Primera imagen/diagrama en el contenido
  ├── diagram-2.webp      # Segunda imagen/diagrama
  └── screenshot-1.webp   # Primera captura de pantalla
```

## Convención de Nombres

### Imagen Hero (Principal)
- **Nombre**: `hero.webp` o `hero.jpg` o `hero.png`
- **Dimensiones recomendadas**: 1200x630px (ratio 1.91:1 para OG)
- **Uso**: Imagen principal que aparece al inicio del post

### Imágenes de Contenido

Use nombres descriptivos en inglés, en minúsculas, con guiones:

- **Diagramas**: `diagram-{número}.webp`
  - Ejemplo: `diagram-1.webp`, `diagram-2.webp`
  
- **Capturas de pantalla**: `screenshot-{descripción}.webp`
  - Ejemplo: `screenshot-dashboard.webp`, `screenshot-analytics.webp`
  
- **Gráficos**: `chart-{descripción}.webp`
  - Ejemplo: `chart-growth.webp`, `chart-comparison.webp`
  
- **Ilustraciones**: `illustration-{descripción}.webp`
  - Ejemplo: `illustration-workflow.webp`

## Formatos Recomendados

1. **WebP** (preferido) - Mejor compresión y calidad
2. **JPEG/JPG** - Para fotografías
3. **PNG** - Para imágenes con transparencia

## Dimensionesjeridas

- **Imagen Hero**: 1200x630px (OG Image estándar)
- **Imágenes de contenido**: 
  - Ancho máximo: 800px (el layout del blog tiene max-width: 800px)
  - Altura: según necesidad, manteniendo proporciones

## Cómo Usar en MDX

### Imagen Hero (en frontmatter)
```mdx
---
title: "Título del Post"
heroImage:
  src: "/images/blog/slug-del-post/hero.webp"
  alt: "Descripción de la imagen para accesibilidad"
---
```

### Imágenes en el Contenido
Usando markdown estándar:
```markdown
![Descripción del diagrama](/images/blog/slug-del-post/diagram-1.webp)
```

## Checklist para Cada Post

- [ ] Crear carpeta en `public/images/blog/{slug-del-post}/`
- [ ] Agregar imagen hero como `hero.webp`
- [ ] Nombrar imágenes de contenido según convención
- [ ] Agregar texto alt descriptivo para accesibilidad
- [ ] Verificar dimensiones apropiadas (hero: 1200x630px, contenido: max 800px ancho)
- [ ] Usar formato WebP cuando sea posible
