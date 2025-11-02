export interface ProcessedPost {
  slug: string;
  data: any;
  processedData: {
    image: string | null;
    imageAlt: string;
    formattedDate: string;
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

export interface TOCItem {
  id: string;
  text: string;
  level: number;
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
  const categoryCounts: Record<string, number> = {};
  const tagCounts: Record<string, number> = {};

  posts.forEach((post: any) => {
    // Contar categorías
    const category = post.data.category;
    if (category) {
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    }

    // Contar tags
    const tags = post.data.tags || [];
    tags.forEach((tag: string) => {
      tagCounts[tag] = (tagCounts[tag] || 0) + 1;
    });
  });

  return {
    categoryCounts,
    tagCounts,
    allCategories: Object.keys(categoryCounts),
    allTags: Object.keys(tagCounts),
  };
}

/**
 * Procesa los datos de un post para optimizar el template
 */
export function processPostData(post: any): ProcessedPost {
  // Normalizar imagen - manejar diferentes formatos
  let image = null;
  let imageAlt = post.data.title;

  if (post.data.hero?.src) {
    image = post.data.hero.src;
    imageAlt = post.data.hero.alt || post.data.title;
  } else if (post.data.heroImage) {
    // Si heroImage es un objeto, extraer la URL
    if (typeof post.data.heroImage === "object" && post.data.heroImage.src) {
      image = post.data.heroImage.src;
      imageAlt = post.data.heroImage.alt || post.data.title;
    } else if (typeof post.data.heroImage === "string") {
      image = post.data.heroImage;
    }
  }

  // Validar que la imagen sea una string válida
  if (image && typeof image !== "string") {
    console.warn(
      "Imagen inválida para post:",
      post.data.title,
      "Tipo:",
      typeof image,
      "Valor:",
      image
    );
    image = null;
  }

  // Formatear fecha
  const formattedDate = new Date(post.data.pubDate).toLocaleDateString(
    "es-ES",
    {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  );

  // Preparar datos para filtros
  const filterData = {
    category: post.data.category || "",
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
      filterData,
      hasImage: !!image,
      hasCategory: !!post.data.category,
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
 * Genera metadatos SEO para el blog
 */
export function generateBlogMeta(processedPosts: ProcessedPost[]) {
  const siteUrl = "https://paulvillalobos.com";
  const blogUrl = `${siteUrl}/blog`;
  const defaultOgImage = `${siteUrl}/images/og-default.jpg`;

  return {
    title: "Blog | Paul Villalobos - Inteligencia Artificial Aplicada a Ventas",
    description:
      "Artículos sobre inteligencia artificial aplicada a ventas B2B, automatización comercial, estrategias de ventas y transformación digital empresarial.",
    keywords:
      "blog inteligencia artificial, IA ventas B2B, automatización comercial, estrategias ventas, Paul Villalobos blog, artículos IA, consultoría ventas",
    author: "Paul Villalobos",
    robots:
      "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
    canonical: blogUrl,
    ogImage: defaultOgImage,
    ogType: "website",
    ogLocale: "es_ES",
    twitterCard: "summary_large_image",
  };
}

/**
 * Genera datos estructurados JSON-LD para el blog
 */
export function generateBlogStructuredData(processedPosts: ProcessedPost[]) {
  const siteUrl = "https://paulvillalobos.com";
  const blogUrl = `${siteUrl}/blog`;

  // Limitar a los primeros 10 posts más recientes para optimizar el JSON-LD
  // Los posts ya vienen ordenados por fecha (más recientes primero)
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
      name: "Paul Villalobos",
      jobTitle: "Especialista en Inteligencia Artificial Aplicada a Ventas",
      url: siteUrl,
    },
    publisher: {
      "@type": "Person",
      name: "Paul Villalobos",
      url: siteUrl,
    },
    inLanguage: "es-ES",
    blogPost: recentPosts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.data.title,
      description: post.data.description,
      url: post.data.canonical || `${siteUrl}/posts/${post.slug}`,
      datePublished: post.data.pubDate,
      dateModified: post.data.updatedDate || post.data.pubDate,
      author: {
        "@type": "Person",
        name: post.data.authors?.[0] || "Paul Villalobos",
      },
      publisher: {
        "@type": "Person",
        name: "Paul Villalobos",
      },
      image: post.processedData.image
        ? {
            "@type": "ImageObject",
            url: post.processedData.image,
            caption: post.processedData.imageAlt,
          }
        : undefined,
      keywords: post.data.tags?.join(", ") || "",
      articleSection: post.data.category || "General",
    })),
  };
}

/**
 * Genera metadatos SEO específicos para un post individual
 */
export function generatePostMeta(post: ProcessedPost): PostMeta {
  const siteUrl = "https://paulvillalobos.com";
  // Priorizar canonical del frontmatter si existe, sino usar URL generada
  const canonicalUrl = post.data.canonical || `${siteUrl}/posts/${post.slug}`;

  // Título específico del post
  const title = `${post.data.title} | Paul Villalobos - Blog`;

  // Descripción específica del post
  const description =
    post.data.description ||
    `Artículo sobre ${
      post.data.category || "inteligencia artificial aplicada a ventas"
    } por Paul Villalobos.`;

  // Keywords específicas del post
  const postKeywords = post.data.tags?.join(", ") || "";
  const baseKeywords =
    "blog inteligencia artificial, IA ventas B2B, automatización comercial, Paul Villalobos";
  const keywords = postKeywords
    ? `${postKeywords}, ${baseKeywords}`
    : baseKeywords;

  // Imagen específica del post o fallback
  const ogImage =
    post.processedData.image || `${siteUrl}/images/blog-default.jpg`;

  // Tiempo de lectura estimado
  const readingTime = estimateReadingTime(post.data.body || "");

  return {
    title,
    description,
    keywords,
    canonical: canonicalUrl,
    ogImage,
    ogType: "article",
    author: post.data.authors?.[0] || "Paul Villalobos",
    publishDate: post.processedData.formattedDate,
    readingTime,
  };
}

/**
 * Genera datos estructurados JSON-LD específicos para un post individual
 */
export function generatePostStructuredData(post: ProcessedPost): any {
  const siteUrl = "https://paulvillalobos.com";
  // Priorizar canonical del frontmatter si existe, sino usar URL generada
  const postUrl = post.data.canonical || `${siteUrl}/posts/${post.slug}`;

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
      name: post.data.authors?.[0] || "Paul Villalobos",
      jobTitle: "Especialista en Inteligencia Artificial Aplicada a Ventas",
      url: siteUrl,
    },
    publisher: {
      "@type": "Person",
      name: "Paul Villalobos",
      url: siteUrl,
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": postUrl,
    },
    image: post.processedData.image
      ? {
          "@type": "ImageObject",
          url: post.processedData.image,
          caption: post.processedData.imageAlt,
          width: 1200,
          height: 630,
        }
      : undefined,
    keywords: post.data.tags?.join(", ") || "",
    articleSection: post.data.category || "General",
    wordCount: post.data.body?.split(" ").length || 0,
    inLanguage: "es-ES",
  };
}

/**
 * Genera breadcrumbs para navegación SEO de un post individual
 */
export function generateBreadcrumbs(post: ProcessedPost): BreadcrumbItem[] {
  const siteUrl = "https://paulvillalobos.com";

  return [
    {
      name: "Inicio",
      url: siteUrl,
    },
    {
      name: "Blog",
      url: `${siteUrl}/blog`,
    },
    ...(post.data.category
      ? [
          {
            name: post.data.category,
            url: `${siteUrl}/blog?category=${encodeURIComponent(
              post.data.category
            )}`,
          },
        ]
      : []),
    {
      name: post.data.title,
      url: post.data.canonical || `${siteUrl}/posts/${post.slug}`,
    },
  ];
}

/**
 * Genera breadcrumbs para la página del blog
 */
export function generateBlogBreadcrumbs(): BreadcrumbItem[] {
  const siteUrl = "https://paulvillalobos.com";

  return [
    {
      name: "Inicio",
      url: siteUrl,
    },
    {
      name: "Blog",
      url: `${siteUrl}/blog`,
    },
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
 * Extrae tabla de contenidos del contenido del post
 */
export function extractTableOfContents(content: string): TOCItem[] {
  if (!content) return [];

  const toc: TOCItem[] = [];
  const headingRegex = /^(#{1,6})\s+(.+)$/gm;
  let match;

  while ((match = headingRegex.exec(content)) !== null) {
    const level = match[1].length;
    const text = match[2].trim();
    const id = text
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .trim();

    toc.push({
      id,
      text,
      level,
    });
  }

  return toc;
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
