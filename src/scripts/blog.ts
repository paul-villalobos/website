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

/**
 * Actualiza los contadores globales en las opciones "Todas..."
 * Mantiene los contadores individuales estáticos (total del blog)
 */
function updateFilterCounts(
  visiblePosts: HTMLElement[],
  categoryFilter: HTMLSelectElement,
  tagsFilter: HTMLSelectElement
): void {
  const totalVisible = visiblePosts.length;

  // Actualizar solo el placeholder "Todas las categorías (N)"
  const categoryDefaultOption =
    categoryFilter.querySelector('option[value=""]');
  if (categoryDefaultOption) {
    categoryDefaultOption.textContent = `Todas las categorías (${totalVisible})`;
  }

  // Actualizar solo el placeholder "Todos los tags (N)"
  const tagsDefaultOption = tagsFilter.querySelector('option[value=""]');
  if (tagsDefaultOption) {
    tagsDefaultOption.textContent = `Todos los tags (${totalVisible})`;
  }
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

  // Actualizar contador visual de texto
  resultsCount.textContent = `Mostrando ${count} artículo${
    count !== 1 ? "s" : ""
  }`;

  // Actualizar dropdowns (Solo totales generales)
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

  // Restaurar el texto original de "Todas las categorías" con el total absoluto
  const categoryDefaultOption =
    categoryFilter.querySelector('option[value=""]');
  if (categoryDefaultOption)
    categoryDefaultOption.textContent = `Todas las categorías (${allPosts.length})`;

  const tagsDefaultOption = tagsFilter.querySelector('option[value=""]');
  if (tagsDefaultOption)
    tagsDefaultOption.textContent = `Todos los tags (${allPosts.length})`;
}

// Configurar event listeners con debounce
const debouncedFilter = debounce(filterPostsOptimized, 300);

if (categoryFilter && tagsFilter && clearFiltersBtn) {
  categoryFilter.addEventListener("change", debouncedFilter);
  tagsFilter.addEventListener("change", debouncedFilter);
  clearFiltersBtn.addEventListener("click", clearFilters);
}
