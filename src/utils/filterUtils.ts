/**
 * Función debounce para optimizar rendimiento de filtros
 */
export function debounce(func: Function, wait: number) {
  let timeout: NodeJS.Timeout;
  return function executedFunction(...args: any[]) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Filtra posts según categoría y tag seleccionados
 */
export function filterPosts(
  allPosts: HTMLElement[],
  selectedCategory: string,
  selectedTag: string
): HTMLElement[] {
  return allPosts.filter((post) => {
    const category = post.dataset.category || "";
    const tags = post.dataset.tags || "";

    const matchesCategory = !selectedCategory || category === selectedCategory;
    const matchesTag = !selectedTag || tags.includes(selectedTag);

    return matchesCategory && matchesTag;
  });
}

/**
 * Actualiza los contadores en los dropdowns de filtros
 */
export function updateFilterCounts(
  visiblePosts: HTMLElement[],
  categoryFilter: HTMLSelectElement,
  tagsFilter: HTMLSelectElement
): void {
  // Contar categorías en posts visibles
  const visibleCategoryCounts: Record<string, number> = {};
  const visibleTagCounts: Record<string, number> = {};

  visiblePosts.forEach((post) => {
    const category = post.dataset.category || "";
    const tags = post.dataset.tags || "";

    if (category) {
      visibleCategoryCounts[category] =
        (visibleCategoryCounts[category] || 0) + 1;
    }

    if (tags) {
      tags.split(",").forEach((tag) => {
        tag = tag.trim();
        if (tag) {
          visibleTagCounts[tag] = (visibleTagCounts[tag] || 0) + 1;
        }
      });
    }
  });

  // Actualizar opciones de categoría
  updateDropdownOptions(
    categoryFilter,
    visibleCategoryCounts,
    visiblePosts.length,
    "Todas las categorías"
  );

  // Actualizar opciones de tags
  updateDropdownOptions(
    tagsFilter,
    visibleTagCounts,
    visiblePosts.length,
    "Todos los tags"
  );
}

/**
 * Actualiza las opciones de un dropdown específico
 */
function updateDropdownOptions(
  dropdown: HTMLSelectElement,
  counts: Record<string, number>,
  totalCount: number,
  defaultLabel: string
): void {
  const options = dropdown.querySelectorAll("option");
  options.forEach((option) => {
    const value = option.value;
    if (value === "") {
      option.textContent = `${defaultLabel} (${totalCount})`;
    } else {
      const count = counts[value] || 0;
      option.textContent = `${value} (${count})`;
    }
  });
}

/**
 * Configura el lazy loading de imágenes usando Intersection Observer
 */
export function setupLazyLoading(): void {
  const lazyImages = document.querySelectorAll(
    ".lazy-image"
  ) as NodeListOf<HTMLImageElement>;

  const imageObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const img = entry.target as HTMLImageElement;
          img.classList.add("loading");

          // Cargar imagen
          const imageLoadPromise = new Promise((resolve) => {
            const tempImg = new Image();
            tempImg.onload = () => {
              img.src = img.dataset.src || "";
              img.alt = img.dataset.alt || "";
              img.classList.remove("loading");
              img.classList.add("loaded");
              resolve(true);
            };
            tempImg.onerror = () => {
              img.classList.remove("loading");
              resolve(false);
            };
            tempImg.src = img.dataset.src || "";
          });

          observer.unobserve(img);
        }
      });
    },
    {
      rootMargin: "50px 0px",
      threshold: 0.1,
    }
  );

  lazyImages.forEach((img) => imageObserver.observe(img));
}

/**
 * Actualiza metadatos SEO dinámicamente
 */
export function updateSEOMeta(meta: any): void {
  // Actualizar título
  document.title = meta.title;

  // Actualizar meta description
  const metaDescription = document.querySelector('meta[name="description"]');
  if (metaDescription) {
    metaDescription.setAttribute("content", meta.description);
  }

  // Actualizar canonical URL
  const canonicalLink = document.querySelector('link[rel="canonical"]');
  if (canonicalLink) {
    canonicalLink.setAttribute("href", meta.canonical);
  }

  // Actualizar Open Graph
  const ogTitle = document.querySelector('meta[property="og:title"]');
  const ogDescription = document.querySelector(
    'meta[property="og:description"]'
  );
  const ogUrl = document.querySelector('meta[property="og:url"]');

  if (ogTitle) ogTitle.setAttribute("content", meta.title);
  if (ogDescription) ogDescription.setAttribute("content", meta.description);
  if (ogUrl) ogUrl.setAttribute("content", meta.canonical);

  // Actualizar Twitter
  const twitterTitle = document.querySelector('meta[name="twitter:title"]');
  const twitterDescription = document.querySelector(
    'meta[name="twitter:description"]'
  );
  const twitterUrl = document.querySelector('meta[name="twitter:url"]');

  if (twitterTitle) twitterTitle.setAttribute("content", meta.title);
  if (twitterDescription)
    twitterDescription.setAttribute("content", meta.description);
  if (twitterUrl) twitterUrl.setAttribute("content", meta.canonical);
}

/**
 * Agrega datos estructurados JSON-LD al head
 */
export function addStructuredData(structuredData: any): void {
  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.textContent = JSON.stringify(structuredData);
  document.head.appendChild(script);
}
