/**
 * Script del cliente para la página de blog
 * Maneja filtros, lazy loading y interacciones
 */

import {
  debounce,
  filterPosts,
  updateFilterCounts,
  setupLazyLoading,
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

// Función de filtrado optimizada
function filterPostsOptimized() {
  postsGrid.classList.add("loading"); // Mostrar indicador de carga

  const selectedCategory = categoryFilter.value;
  const selectedTag = tagsFilter.value;

  // Filtrar posts usando utility
  const visiblePosts = filterPosts(allPosts, selectedCategory, selectedTag);

  // Usar requestAnimationFrame para actualizaciones suaves
  requestAnimationFrame(() => {
    // Ocultar todos los posts
    allPosts.forEach((post) => {
      post.style.display = "none";
    });

    // Mostrar posts visibles
    visiblePosts.forEach((post) => {
      post.style.display = "block";
    });

    // Actualizar contador
    const count = visiblePosts.length;
    resultsCount.textContent = `Mostrando ${count} artículo${
      count !== 1 ? "s" : ""
    }`;

    // Actualizar contadores en filtros
    updateFilterCounts(visiblePosts, categoryFilter, tagsFilter);

    // Mostrar/ocultar estado vacío
    if (count === 0) {
      postsGrid.style.display = "none";
      emptyState.classList.remove("hidden");
    } else {
      postsGrid.style.display = "grid";
      emptyState.classList.add("hidden");
    }

    postsGrid.classList.remove("loading"); // Ocultar indicador de carga
  });
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

// Configurar lazy loading
setupLazyLoading();

// Configurar indicador de carga
const style = document.createElement("style");
style.textContent = `
  .loading {
    opacity: 0.6;
    pointer-events: none;
  }
  
  .loading::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 20px;
    height: 20px;
    margin: -10px 0 0 -10px;
    border: 2px solid #f3f3f3;
    border-top: 2px solid #3498db;
    border-radius: 50%;
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;
document.head.appendChild(style);
