/**
 * Script del cliente para la página de blog
 * Maneja filtros e interacciones
 */

// Función debounce para optimizar rendimiento de filtros
function debounce(func: Function, wait: number) {
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

// Filtra posts según categoría y tag seleccionados
function filterPosts(
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

// Actualiza los contadores en los dropdowns de filtros
function updateFilterCounts(
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

// Actualiza las opciones de un dropdown específico
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

// Elementos del DOM
const categoryFilter = document.getElementById(
  "category-filter"
) as HTMLSelectElement;
const tagsFilter = document.getElementById("tags-filter") as HTMLSelectElement;
const postsGrid = document.getElementById("posts-grid") as HTMLElement;
const emptyState = document.getElementById("empty-state") as HTMLElement;
const resultsCount = document.getElementById("results-count") as HTMLElement;
const clearFiltersBtn = document.getElementById(
  "clear-filters"
) as HTMLButtonElement;

// Obtener todos los posts
const allPosts = Array.from(postsGrid.children) as HTMLElement[];

// Función de filtrado simplificada
function filterPostsOptimized() {
  const selectedCategory = categoryFilter.value;
  const selectedTag = tagsFilter.value;
  const visiblePosts = filterPosts(allPosts, selectedCategory, selectedTag);
  const count = visiblePosts.length;

  // Mostrar/ocultar posts
  allPosts.forEach((post) => {
    post.style.display = visiblePosts.includes(post) ? "block" : "none";
  });

  // Actualizar contador
  resultsCount.textContent = `Mostrando ${count} artículo${count !== 1 ? "s" : ""}`;

  // Actualizar contadores en filtros
  updateFilterCounts(visiblePosts, categoryFilter, tagsFilter);

  // Mostrar/ocultar estado vacío
  const isEmpty = count === 0;
  postsGrid.style.display = isEmpty ? "none" : "grid";
  emptyState.classList.toggle("hidden", !isEmpty);
}

// Función para limpiar filtros
function clearFilters() {
  categoryFilter.value = "";
  tagsFilter.value = "";
  filterPostsOptimized();
}

// Configurar event listeners con debounce
const debouncedFilter = debounce(filterPostsOptimized, 300);

categoryFilter.addEventListener("change", debouncedFilter);
tagsFilter.addEventListener("change", debouncedFilter);
clearFiltersBtn.addEventListener("click", clearFilters);
