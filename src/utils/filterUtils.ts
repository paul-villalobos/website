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

