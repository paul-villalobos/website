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
    blogPost: processedPosts.map((post) => ({
      "@type": "BlogPosting",
      headline: post.data.title,
      description: post.data.description,
      url: `${siteUrl}/posts/${post.slug}`,
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
