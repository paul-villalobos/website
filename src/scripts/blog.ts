/**
 * Script del cliente para la página de blog
 * Maneja filtros e interacciones
 */

// Mapa de nombres legibles para las categorías (Hardcoded o pasado desde el server si fuera necesario)
// Idealmente debería sincronizarse con constants.ts, pero como es client-side y constants.ts es server-side/build-time,
// duplicamos o inyectamos. Para simplicidad y evitar complejidades de build, podemos extraerlo del texto inicial de las opciones.
const CATEGORY_LABELS: Record<string, string> = {};

// Al cargar, guardar los nombres originales de las categorías
function initializeCategoryLabels(dropdown: HTMLSelectElement) {
    const options = dropdown.querySelectorAll("option");
    options.forEach(option => {
        if (option.value) {
            // Extraer solo el nombre, quitando el conteo "(N)"
            // Ejemplo: "Estrategia (3)" -> "Estrategia"
            const text = option.textContent || "";
            const name = text.replace(/\s\(\d+\)$/, "");
            CATEGORY_LABELS[option.value] = name;
        }
    });
}


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

// MODIFICADO: Ya no actualizamos los contadores de las opciones NO seleccionadas para evitar que se pongan en cero.
// Solo actualizamos el contador global "Todas las categorías (N)" y quizás deshabilitamos opciones vacías si se desea,
// pero para mantener la UX de ver todos los totales siempre, calculamos los totales GLOBALES (sin filtros) una sola vez al inicio,
// o simplemente NO actualizamos los textos de las opciones individuales dinámicamente, solo filtramos la grilla.
//
// El usuario pide: "deberían mostrar siempre el total en cada una".
// Esto significa que el número (N) al lado de cada categoría debe ser el TOTAL de posts en esa categoría,
// independientemente del filtro activo.
//
// Por lo tanto, NO debemos recalcular los conteos basándonos en los posts VISIBLES para el dropdown.
// Debemos dejar los conteos iniciales estáticos (que representan el total de la colección).
function updateFilterCounts(
  visiblePosts: HTMLElement[],
  categoryFilter: HTMLSelectElement,
  tagsFilter: HTMLSelectElement
): void {
    // Solo actualizamos la opción "Todas" para reflejar el total filtrado actual,
    // pero mantenemos los conteos individuales estáticos para que el usuario vea
    // cuántos hay en total en cada grupo, o si prefiere ver cuántos quedan activos
    // con el filtro cruzado (ej. Tag "X" dentro de Categoría "Y").
    //
    // EL FEEDBACK DEL USUARIO ES: "las otras categorías aparecen con cero (pero deberían mostrar siempre el total en cada una)".
    // Esto indica que prefiere conteos ESTÁTICOS (Totales absolutos) en las opciones, no dinámicos.

    // Opción 1: Conteos estáticos (Total del blog).
    // En este caso, simplemente NO hacemos nada con las opciones individuales del dropdown
    // excepto quizás la opción por defecto "Todas".
    
    const totalVisible = visiblePosts.length;
    
    // Actualizar solo el placeholder "Todas las categorías (N)"
    const categoryDefaultOption = categoryFilter.querySelector('option[value=""]');
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

// Inicializar etiquetas
if (categoryFilter) {
    initializeCategoryLabels(categoryFilter);
}

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
  resultsCount.textContent = `Mostrando ${count} artículo${count !== 1 ? "s" : ""}`;

  // Actualizar dropdowns (Solo totales generales, manteniendo conteos individuales fijos)
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
  // (Esto requiere conocer el total absoluto inicial, lo podemos sacar de allPosts.length)
  const categoryDefaultOption = categoryFilter.querySelector('option[value=""]');
  if (categoryDefaultOption) categoryDefaultOption.textContent = `Todas las categorías (${allPosts.length})`;
  
  const tagsDefaultOption = tagsFilter.querySelector('option[value=""]');
  if (tagsDefaultOption) tagsDefaultOption.textContent = `Todos los tags (${allPosts.length})`;
}

// Configurar event listeners con debounce
const debouncedFilter = debounce(filterPostsOptimized, 300);

categoryFilter.addEventListener("change", debouncedFilter);
tagsFilter.addEventListener("change", debouncedFilter);
clearFiltersBtn.addEventListener("click", clearFilters);

// Inicialización: Guardar los textos iniciales "reales" (con nombres bonitos) 
// para que si la lógica de filtrado quisiera restaurarlos, pudiera.
// Pero con el cambio actual de NO tocar las opciones individuales, ya no se perderán.
