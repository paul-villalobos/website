/**
 * Script del cliente para la página de blog
 * Maneja filtros e interacciones
 */

import {
  debounce,
  filterPosts,
  updateFilterCounts,
} from "../utils/filterUtils";

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
