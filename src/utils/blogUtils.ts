import {
  SITE_URL,
  SITE_TITLE,
  SITE_DESCRIPTION,
  DEFAULT_KEYWORDS,
  DEFAULT_OG_IMAGE,
  AUTHOR_NAME,
  AUTHOR_EMAIL,
  AUTHOR_LINKEDIN,
  AUTHOR_TWITTER_URL,
  BLOG_CATEGORIES,
} from './constants';

export interface ProcessedPost {
  slug: string;
  data: any;
  // Campos procesados aplanados (sin anidamiento innecesario)
  image: string | null;
  imageAlt: string;
  formattedDate: string;
  categoryName: string;
  readingTime: string;
  // Datos para filtros (usado en blog index)
  filterData: {
    category: string;
    tags: string;
    title: string;
    description: string;
  };
}

export interface PostMeta {
  title: string;
  description: string;
  keywords: string;
  canonical: string;
  ogImage: string;
  ogType: string;
  author: string;
  publishDate: string;
  readingTime: string;
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export interface CountsResult {
  categoryCounts: Record<string, number>;
  tagCounts: Record<string, number>;
  allCategories: string[];
  allTags: string[];
}

/**
 * Calcula contadores de categorías y tags para filtros
 */
export function calculateCounts(posts: any[]): CountsResult {
  const result = posts.reduce(
    (acc, post) => {
      if (post.data.category) {
        acc.categoryCounts[post.data.category] = (acc.categoryCounts[post.data.category] || 0) + 1;
      }
      (post.data.tags || []).forEach((tag: string) => {
        acc.tagCounts[tag] = (acc.tagCounts[tag] || 0) + 1;
      });
      return acc;
    },
    {
      categoryCounts: {} as Record<string, number>,
      tagCounts: {} as Record<string, number>,
    }
  );

  return {
    ...result,
    allCategories: Object.keys(result.categoryCounts),
    allTags: Object.keys(result.tagCounts),
  };
}

/**
 * Normaliza la imagen de un post (simplificado)
 * Soporta tanto URLs string como ImageMetadata de Astro
 */
function normalizePostImage(post: any): { image: string | null; imageAlt: string } {
  const imageField = post.data.hero || post.data.heroImage;
  
  if (!imageField) {
    return { image: null, imageAlt: post.data.title };
  }

  // Manejar string directo
  if (typeof imageField === "string") {
    return { image: imageField, imageAlt: post.data.title };
  }

  // Manejar objeto con src
  if (typeof imageField === "object" && imageField.src) {
    const src = typeof imageField.src === 'string' ? imageField.src : imageField.src.src;
    return {
      image: src,
      imageAlt: imageField.alt || post.data.title,
    };
  }

  return { image: null, imageAlt: post.data.title };
}

/**
 * Procesa los datos de un post para optimizar el template
 * Estructura aplanada - sin flags booleanos redundantes
 * Pre-calcula metadatos para evitar cálculos redundantes
 */
export function processPostData(post: any): ProcessedPost {
  const { image, imageAlt } = normalizePostImage(post);

  const formattedDate = new Date(post.data.pubDate).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const categorySlug = post.data.category || "";
  const categoryName = BLOG_CATEGORIES[categorySlug] || categorySlug;

  const filterData = {
    category: categorySlug,
    tags: post.data.tags?.join(",") || "",
    title: post.data.title.toLowerCase(),
    description: post.data.description?.toLowerCase() || "",
  };

  const readingTime = estimateReadingTime(post.data.body || "");

  return {
    ...post,
    image,
    imageAlt,
    formattedDate,
    categoryName,
    readingTime,
    filterData,
  };
}

/**
 * Ordena posts por fecha de publicación (más recientes primero)
 */
export function sortPostsByDate(posts: any[]): any[] {
  return posts.sort((a: any, b: any) => {
    return new Date(b.data.pubDate).getTime() - new Date(a.data.pubDate).getTime();
  });
}

/**
 * Combina múltiples datos estructurados en un @graph
 * Usar @graph es la mejor práctica de Schema.org cuando una página tiene
 * múltiples entidades independientes (ej: BlogPosting + BreadcrumbList)
 */
export function combineStructuredData(...schemas: any[]) {
  return {
    "@context": "https://schema.org",
    "@graph": schemas.filter(Boolean),
  };
}

/**
 * Genera datos estructurados JSON-LD para el blog
 */
export function generateBlogStructuredData(processedPosts: ProcessedPost[]) {
  const blogUrl = `${SITE_URL}/blog`;
  const recentPosts = processedPosts.slice(0, 10);

  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Blog de Paul Villalobos",
    description:
      "Artículos sobre inteligencia artificial aplicada a ventas B2B, automatización comercial, estrategias de ventas y transformación digital empresarial.",
    url: blogUrl,
    author: {
      "@type": "Person",
      name: AUTHOR_NAME,
      jobTitle: "Especialista en Inteligencia Artificial Aplicada a Ventas",
      url: SITE_URL,
    },
    publisher: {
      "@type": "Person",
      name: AUTHOR_NAME,
      url: SITE_URL,
    },
    inLanguage: "es-ES",
    blogPost: recentPosts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.data.title,
      description: post.data.description,
      url: post.data.canonical || `${SITE_URL}/blog/${post.slug}`,
      datePublished: post.data.pubDate,
      dateModified: post.data.updatedDate || post.data.pubDate,
      author: {
        "@type": "Person",
        name: post.data.authors?.[0] || AUTHOR_NAME,
        url: SITE_URL,
      },
      publisher: {
        "@type": "Person",
        name: AUTHOR_NAME,
        url: SITE_URL,
      },
      image: post.image
        ? {
            "@type": "ImageObject",
            url: post.image,
            caption: post.imageAlt,
          }
        : undefined,
      keywords: post.data.tags?.join(", ") || "",
      articleSection: BLOG_CATEGORIES[post.data.category] || post.data.category || "General",
    })),
  };
}

/**
 * Genera metadatos SEO específicos para un post individual
 * Usa datos pre-calculados del ProcessedPost
 */
export function generatePostMeta(post: ProcessedPost): PostMeta {
  const canonicalUrl = post.data.canonical || `${SITE_URL}/blog/${post.slug}`;
  const postKeywords = post.data.tags?.join(", ") || "";
  const baseKeywords = "blog inteligencia artificial, IA ventas B2B, automatización comercial, Paul Villalobos";

  return {
    title: `${post.data.title} | Paul Villalobos - Blog`,
    description: post.data.description || `Artículo sobre ${post.categoryName} por ${AUTHOR_NAME}.`,
    keywords: postKeywords ? `${postKeywords}, ${baseKeywords}` : baseKeywords,
    canonical: canonicalUrl,
    ogImage: post.image || `${SITE_URL}/images/blog-default.jpg`,
    ogType: "article",
    author: post.data.authors?.[0] || AUTHOR_NAME,
    publishDate: post.formattedDate,
    readingTime: post.readingTime,
  };
}

/**
 * Genera datos estructurados JSON-LD específicos para un post individual
 */
export function generatePostStructuredData(post: ProcessedPost): any {
  const postUrl = post.data.canonical || `${SITE_URL}/blog/${post.slug}`;
  const categoryName = BLOG_CATEGORIES[post.data.category] || post.data.category || "General";

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.data.title,
    description: post.data.description,
    url: postUrl,
    datePublished: post.data.pubDate,
    dateModified: post.data.updatedDate || post.data.pubDate,
    author: {
      "@type": "Person",
      name: post.data.authors?.[0] || AUTHOR_NAME,
      jobTitle: "Especialista en Inteligencia Artificial Aplicada a Ventas",
      url: SITE_URL,
    },
    publisher: {
      "@type": "Person",
      name: AUTHOR_NAME,
      url: SITE_URL,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": postUrl,
    },
    image: post.image
      ? {
          "@type": "ImageObject",
          url: post.image,
          caption: post.imageAlt,
          width: 1200,
          height: 630,
        }
      : undefined,
    keywords: post.data.tags?.join(", ") || "",
    articleSection: categoryName,
    wordCount: post.data.body?.split(" ").length || 0,
    inLanguage: "es-ES",
  };
}

/**
 * Genera breadcrumbs para navegación SEO de un post individual
 */
export function generateBreadcrumbs(post: ProcessedPost): BreadcrumbItem[] {
  return [
    { name: "Inicio", url: "/" },
    { name: "Blog", url: "/blog" },
    { name: post.data.title, url: `/blog/${post.slug}` },
  ];
}

/**
 * Genera breadcrumbs para la página del blog
 */
export function generateBlogBreadcrumbs(): BreadcrumbItem[] {
  return [
    { name: "Inicio", url: "/" },
    { name: "Blog", url: "/blog" },
  ];
}

/**
 * Estima el tiempo de lectura de un post
 */
export function estimateReadingTime(content: string): string {
  if (!content) return "1 min de lectura";

  const wordsPerMinute = 200;
  const wordCount = content.split(" ").length;
  const minutes = Math.ceil(wordCount / wordsPerMinute);

  return `${minutes} min de lectura`;
}

/**
 * Genera datos estructurados para breadcrumbs
 */
export function generateBreadcrumbStructuredData(breadcrumbs: BreadcrumbItem[]): any {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}
