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
  processedData: {
    image: string | null;
    imageAlt: string;
    formattedDate: string;
    categoryName: string;
    filterData: {
      category: string;
      tags: string;
      title: string;
      description: string;
    };
    hasImage: boolean;
    hasCategory: boolean;
    hasTags: boolean;
    visibleTags: string[];
    remainingTagsCount: number;
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
      // Contar categorías
      if (post.data.category) {
        acc.categoryCounts[post.data.category] = (acc.categoryCounts[post.data.category] || 0) + 1;
      }

      // Contar tags
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
 * Normaliza la imagen de un post
 * Soporta tanto URLs string como ImageMetadata de Astro
 */
function normalizePostImage(post: any): { image: string | null; imageAlt: string } {
  if (post.data.hero?.src) {
    const src = typeof post.data.hero.src === 'string' 
      ? post.data.hero.src 
      : post.data.hero.src.src; // ImageMetadata tiene .src.src
    return {
      image: src,
      imageAlt: post.data.hero.alt || post.data.title,
    };
  }
  
  if (post.data.heroImage) {
    if (typeof post.data.heroImage === "object" && post.data.heroImage.src) {
      // Manejar ImageMetadata (objeto con propiedad src que puede ser otro objeto)
      const src = typeof post.data.heroImage.src === 'string'
        ? post.data.heroImage.src
        : post.data.heroImage.src.src;
      return {
        image: src,
        imageAlt: post.data.heroImage.alt || post.data.title,
      };
    }
    
    if (typeof post.data.heroImage === "string") {
      return {
        image: post.data.heroImage,
        imageAlt: post.data.title,
      };
    }
  }

  return {
    image: null,
    imageAlt: post.data.title,
  };
}

/**
 * Procesa los datos de un post para optimizar el template
 */
export function processPostData(post: any): ProcessedPost {
  const { image, imageAlt } = normalizePostImage(post);

  // Formatear fecha
  const formattedDate = new Date(post.data.pubDate).toLocaleDateString(
    "es-ES",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  const categorySlug = post.data.category || "";
  const categoryName = BLOG_CATEGORIES[categorySlug] || categorySlug;

  // Preparar datos para filtros
  const filterData = {
    category: categorySlug,
    tags: post.data.tags?.join(",") || "",
    title: post.data.title.toLowerCase(),
    description: post.data.description?.toLowerCase() || "",
  };

  return {
    ...post,
    processedData: {
      image,
      imageAlt,
      formattedDate,
      categoryName,
      filterData,
      hasImage: !!image,
      hasCategory: !!categorySlug,
      hasTags: !!(post.data.tags && post.data.tags.length > 0),
      visibleTags: post.data.tags?.slice(0, 3) || [],
      remainingTagsCount: Math.max(0, (post.data.tags?.length || 0) - 3),
    },
  };
}

/**
 * Ordena posts por fecha de publicación (más recientes primero)
 */
export function sortPostsByDate(posts: any[]): any[] {
  return posts.sort((a: any, b: any) => {
    const dateA = new Date(a.data.pubDate);
    const dateB = new Date(b.data.pubDate);
    return dateB.getTime() - dateA.getTime();
  });
}

/**
 * Función base para generar metadatos comunes
 */
function generateBaseMeta(overrides: Partial<{
  title: string;
  description: string;
  keywords: string;
  canonical: string;
  ogImage: string;
  ogType: string;
}>) {
  return {
    title: overrides.title || SITE_TITLE,
    description: overrides.description || SITE_DESCRIPTION,
    keywords: overrides.keywords || DEFAULT_KEYWORDS,
    canonical: overrides.canonical || SITE_URL,
    ogImage: overrides.ogImage || DEFAULT_OG_IMAGE,
    ogType: overrides.ogType || "website",
  };
}

/**
 * Crea schema de autor para datos estructurados
 */
function createAuthorSchema(authorName?: string, includeJobTitle = false) {
  return {
    "@type": "Person",
    name: authorName || AUTHOR_NAME,
    ...(includeJobTitle && { jobTitle: "Especialista en Inteligencia Artificial Aplicada a Ventas" }),
    url: SITE_URL,
  };
}

/**
 * Crea schema de publisher para datos estructurados
 */
function createPublisherSchema() {
  return {
    "@type": "Person",
    name: AUTHOR_NAME,
    url: SITE_URL,
  };
}

/**
 * Crea schema de imagen para datos estructurados
 */
function createImageSchema(imageUrl: string, imageAlt: string, includeDimensions = false) {
  return {
    "@type": "ImageObject",
    url: imageUrl,
    caption: imageAlt,
    ...(includeDimensions && { width: 1200, height: 630 }),
  };
}

/**
 * Combina múltiples datos estructurados en un @graph
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
    author: createAuthorSchema(AUTHOR_NAME, true),
    publisher: createPublisherSchema(),
    inLanguage: "es-ES",
    blogPost: recentPosts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.data.title,
      description: post.data.description,
      url: post.data.canonical || `${SITE_URL}/blog/${post.slug}`,
      datePublished: post.data.pubDate,
      dateModified: post.data.updatedDate || post.data.pubDate,
      author: createAuthorSchema(post.data.authors?.[0]),
      publisher: createPublisherSchema(),
      image: post.processedData.image
        ? createImageSchema(post.processedData.image, post.processedData.imageAlt)
        : undefined,
      keywords: post.data.tags?.join(", ") || "",
      articleSection: BLOG_CATEGORIES[post.data.category] || post.data.category || "General",
    })),
  };
}

/**
 * Genera metadatos SEO específicos para un post individual
 */
export function generatePostMeta(post: ProcessedPost): PostMeta {
  const canonicalUrl = post.data.canonical || `${SITE_URL}/blog/${post.slug}`;
  const postKeywords = post.data.tags?.join(", ") || "";
  const baseKeywords = "blog inteligencia artificial, IA ventas B2B, automatización comercial, Paul Villalobos";
  const categoryName = BLOG_CATEGORIES[post.data.category] || post.data.category || "inteligencia artificial aplicada a ventas";

  return {
    ...generateBaseMeta({
      title: `${post.data.title} | Paul Villalobos - Blog`,
      description:
        post.data.description ||
        `Artículo sobre ${categoryName} por ${AUTHOR_NAME}.`,
      keywords: postKeywords ? `${postKeywords}, ${baseKeywords}` : baseKeywords,
      canonical: canonicalUrl,
      ogImage: post.processedData.image || `${SITE_URL}/images/blog-default.jpg`,
      ogType: "article",
    }),
    author: post.data.authors?.[0] || AUTHOR_NAME,
    publishDate: post.processedData.formattedDate,
    readingTime: estimateReadingTime(post.data.body || ""),
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
    author: createAuthorSchema(post.data.authors?.[0], true),
    publisher: createPublisherSchema(),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": postUrl,
    },
    image: post.processedData.image
      ? createImageSchema(post.processedData.image, post.processedData.imageAlt, true)
      : undefined,
    keywords: post.data.tags?.join(", ") || "",
    articleSection: categoryName,
    wordCount: post.data.body?.split(" ").length || 0,
    inLanguage: "es-ES",
  };
}

/**
 * Crea un item de breadcrumb
 */
function createBreadcrumbItem(name: string, url: string): BreadcrumbItem {
  return { name, url };
}

/**
 * Genera breadcrumbs para navegación SEO de un post individual
 */
export function generateBreadcrumbs(post: ProcessedPost): BreadcrumbItem[] {
  return [
    createBreadcrumbItem("Inicio", "/"),
    createBreadcrumbItem("Blog", "/blog"),
    createBreadcrumbItem(
      post.data.title,
      `/blog/${post.slug}`
    ),
  ];
}

/**
 * Genera breadcrumbs para la página del blog
 */
export function generateBlogBreadcrumbs(): BreadcrumbItem[] {
  return [
    createBreadcrumbItem("Inicio", "/"),
    createBreadcrumbItem("Blog", "/blog"),
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
export function generateBreadcrumbStructuredData(
  breadcrumbs: BreadcrumbItem[]
): any {
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
