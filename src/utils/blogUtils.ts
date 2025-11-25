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
} from './constants';

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
 */
function normalizePostImage(post: any): { image: string | null; imageAlt: string } {
  if (post.data.hero?.src) {
    return {
      image: String(post.data.hero.src),
      imageAlt: post.data.hero.alt || post.data.title,
    };
  }
  
  if (post.data.heroImage) {
    if (typeof post.data.heroImage === "object" && post.data.heroImage.src) {
      return {
        image: String(post.data.heroImage.src),
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
 * Genera metadatos SEO para el blog
 */
export function generateBlogMeta(processedPosts: ProcessedPost[]) {
  return {
    ...generateBaseMeta({
      title: "Blog | Paul Villalobos - Inteligencia Artificial Aplicada a Ventas",
      description:
        "Artículos sobre inteligencia artificial aplicada a ventas B2B, automatización comercial, estrategias de ventas y transformación digital empresarial.",
      keywords:
        "blog inteligencia artificial, IA ventas B2B, automatización comercial, estrategias ventas, Paul Villalobos blog, artículos IA, consultoría ventas",
      canonical: `${SITE_URL}/blog`,
    }),
    author: AUTHOR_NAME,
    robots:
      "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
    ogLocale: "es_ES",
    twitterCard: "summary_large_image",
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
      url: post.data.canonical || `${SITE_URL}/posts/${post.slug}`,
      datePublished: post.data.pubDate,
      dateModified: post.data.updatedDate || post.data.pubDate,
      author: createAuthorSchema(post.data.authors?.[0]),
      publisher: createPublisherSchema(),
      image: post.processedData.image
        ? createImageSchema(post.processedData.image, post.processedData.imageAlt)
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
  const canonicalUrl = post.data.canonical || `${SITE_URL}/posts/${post.slug}`;
  const postKeywords = post.data.tags?.join(", ") || "";
  const baseKeywords = "blog inteligencia artificial, IA ventas B2B, automatización comercial, Paul Villalobos";

  return {
    ...generateBaseMeta({
      title: `${post.data.title} | Paul Villalobos - Blog`,
      description:
        post.data.description ||
        `Artículo sobre ${
          post.data.category || "inteligencia artificial aplicada a ventas"
        } por ${AUTHOR_NAME}.`,
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
  const postUrl = post.data.canonical || `${SITE_URL}/posts/${post.slug}`;

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
    articleSection: post.data.category || "General",
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
    createBreadcrumbItem("Inicio", SITE_URL),
    createBreadcrumbItem("Blog", `${SITE_URL}/blog`),
    ...(post.data.category
      ? [
          createBreadcrumbItem(
            post.data.category,
            `${SITE_URL}/blog?category=${encodeURIComponent(post.data.category)}`
          ),
        ]
      : []),
    createBreadcrumbItem(
      post.data.title,
      post.data.canonical || `${SITE_URL}/posts/${post.slug}`
    ),
  ];
}

/**
 * Genera breadcrumbs para la página del blog
 */
export function generateBlogBreadcrumbs(): BreadcrumbItem[] {
  return [
    createBreadcrumbItem("Inicio", SITE_URL),
    createBreadcrumbItem("Blog", `${SITE_URL}/blog`),
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

/**
 * Genera metadatos SEO para la página de inicio
 */
export function generateHomeMeta() {
  return generateBaseMeta({
    title: SITE_TITLE,
    description: SITE_DESCRIPTION,
    keywords: DEFAULT_KEYWORDS,
    canonical: SITE_URL,
  });
}

/**
 * Genera datos estructurados JSON-LD para la página de inicio
 */
export function generateHomeStructuredData() {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: AUTHOR_NAME,
    jobTitle: "Especialista en Inteligencia Artificial Aplicada a Ventas",
    description:
      "Líder en ventas B2B y tecnología aplicada a resultados. Más de una década transformando la gestión comercial con inteligencia artificial.",
    url: SITE_URL,
    sameAs: [AUTHOR_LINKEDIN, AUTHOR_TWITTER_URL],
    knowsAbout: [
      "Inteligencia Artificial",
      "Ventas B2B",
      "Automatización Comercial",
      "CRM",
      "Estrategias de Ventas",
    ],
    offers: {
      "@type": "Service",
      serviceType: "Consultoría en Inteligencia Artificial Aplicada a Ventas",
      areaServed: "ES",
      availableChannel: {
        "@type": "ServiceChannel",
        serviceUrl: SITE_URL,
      },
    },
  };
}

/**
 * Genera metadatos SEO para la página de contacto
 */
export function generateContactMeta() {
  return generateBaseMeta({
    title:
      "Contacto | Paul Villalobos - Inteligencia Artificial Aplicada a Ventas",
    description:
      "Contáctame para consultoría en inteligencia artificial aplicada a ventas B2B, automatización comercial y estrategias con IA para maximizar resultados comerciales.",
    keywords:
      "contacto Paul Villalobos, consultoría IA ventas, consulta gratuita IA ventas, automatización comercial, Paul Villalobos contacto",
    canonical: `${SITE_URL}/contacto`,
  });
}

/**
 * Genera datos estructurados JSON-LD para la página de contacto
 */
export function generateContactStructuredData() {
  const contactUrl = `${SITE_URL}/contacto`;

  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "ContactPage",
        name: "Contacto | Paul Villalobos",
        url: contactUrl,
        mainEntity: {
          "@type": "Person",
          name: AUTHOR_NAME,
          jobTitle: "Especialista en Inteligencia Artificial Aplicada a Ventas",
          email: AUTHOR_EMAIL,
          url: SITE_URL,
          sameAs: [AUTHOR_LINKEDIN, AUTHOR_TWITTER_URL],
        },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          {
            "@type": "ListItem",
            position: 1,
            name: "Inicio",
            item: SITE_URL,
          },
          {
            "@type": "ListItem",
            position: 2,
            name: "Contacto",
            item: contactUrl,
          },
        ],
      },
    ],
  };
}
