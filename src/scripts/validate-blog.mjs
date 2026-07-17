import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// Helper directories
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const blogDir = path.resolve(__dirname, '../content/blog');
const assetsDir = path.resolve(__dirname, '../assets');

// Negative keywords blacklist (case-insensitive)
const BLACKLIST = [
  'gratis', 'free', 'crack', 'descargar', 'barato',
  'definición', 'definicion', 'qué es', 'que es', 'concepto', 'historia', 'tesis', 'pdf', 'wikipedia',
  'marketing digital', 'tips'
];

// Tag Groups configuration
const GROUP_A = ["ToFu - Demanda", "MoFu - Gestión de Leads", "BoFu - Cierre y Negociación", "Postventa y LTV", "Inteligencia Comercial"];
const GROUP_B = ["WhatsApp & Chatbots", "KPIs & Métricas", "Excel & Data", "Stack Tecnológico"];
const GROUP_C = ["Playbook Táctico", "Estrategia & Opinión", "Caso de Estudio"];

const CATEGORIES = [
  "estrategia-ventas-b2b-direccion",
  "embudos-pipeline-revops",
  "crm-tecnologia-ventas",
  "inteligencia-artificial-automatizacion"
];

console.log('🔍 Iniciando validación de posts del Blog...');

let hasErrors = false;
let warningCount = 0;
let errorCount = 0;

try {
  const files = fs.readdirSync(blogDir).filter(file => file.endsWith('.md') || file.endsWith('.mdx'));
  
  if (files.length === 0) {
    console.log('ℹ️ No se encontraron posts para validar.');
    process.exit(0);
  }

  for (const file of files) {
    const filePath = path.join(blogDir, file);
    const content = fs.readFileSync(filePath, 'utf-8');
    const relativePath = path.relative(process.cwd(), filePath);
    
    // Extract frontmatter
    const fmMatch = content.match(/^---\s*([\s\S]*?)\s*---/);
    if (!fmMatch) {
      console.error(`\x1b[31m[ERROR]\x1b[0m ${relativePath}: No se encontró el bloque de frontmatter.`);
      hasErrors = true;
      errorCount++;
      continue;
    }

    const frontmatterRaw = fmMatch[1];
    const bodyContent = content.substring(fmMatch[0].length).trim();
    
    // Parse helper
    const getVal = (key) => {
      const regex = new RegExp(`^${key}:\\s*(.+)$`, 'm');
      const match = frontmatterRaw.match(regex);
      if (!match) return null;
      let val = match[1].trim();
      if (val.startsWith('"') || val.startsWith("'")) {
        val = val.replace(/^["']|["']$/g, '');
      }
      return val;
    };

    // Parse values
    const title = getVal('title');
    const description = getVal('description');
    const category = getVal('category');
    const pubDate = getVal('pubDate');
    const slug = getVal('slug');
    const draft = getVal('draft') === 'true';

    // Parse tags array
    let tags = [];
    const tagsMatch = frontmatterRaw.match(/^tags:\s*\[([\s\S]*?)\]/m);
    if (tagsMatch) {
      tags = tagsMatch[1].split(',').map(t => t.trim().replace(/^["']|["']$/g, '')).filter(Boolean);
    } else {
      // Intenta parsear formato de lista YAML si no es array inline
      const tagsListMatch = frontmatterRaw.match(/^tags:\s*\n((?:\s*-\s*.+\n?)+)/m);
      if (tagsListMatch) {
        tags = tagsListMatch[1].split('\n').map(t => t.replace(/^\s*-\s*/, '').trim().replace(/^["']|["']$/g, '')).filter(Boolean);
      }
    }

    // Parse heroImage
    let heroImageSrc = null;
    const heroImageMatch = frontmatterRaw.match(/heroImage:\s*\n\s*src:\s*(.+)/);
    if (heroImageMatch) {
      heroImageSrc = heroImageMatch[1].trim().replace(/^["']|["']$/g, '');
    } else {
      const heroImageSingle = getVal('heroImage');
      if (heroImageSingle && typeof heroImageSingle === 'string') {
        heroImageSrc = heroImageSingle;
      }
    }

    // 1. Validar campos requeridos
    if (!title) {
      console.error(`\x1b[31m[ERROR]\x1b[0m ${relativePath}: Falta el título ('title').`);
      hasErrors = true;
      errorCount++;
    }
    if (!description) {
      console.error(`\x1b[31m[ERROR]\x1b[0m ${relativePath}: Falta la descripción ('description').`);
      hasErrors = true;
      errorCount++;
    }
    if (!category) {
      console.error(`\x1b[31m[ERROR]\x1b[0m ${relativePath}: Falta la categoría ('category').`);
      hasErrors = true;
      errorCount++;
    } else if (!CATEGORIES.includes(category)) {
      console.error(`\x1b[31m[ERROR]\x1b[0m ${relativePath}: Categoría inválida "${category}". Permitidas: ${CATEGORIES.join(', ')}`);
      hasErrors = true;
      errorCount++;
    }
    if (!pubDate) {
      console.error(`\x1b[31m[ERROR]\x1b[0m ${relativePath}: Falta la fecha de publicación ('pubDate').`);
      hasErrors = true;
      errorCount++;
    }

    // 2. Validar estructura de tags (Metodología AI Sales Engine)
    if (tags.length === 0) {
      console.error(`\x1b[31m[ERROR]\x1b[0m ${relativePath}: No tiene tags asignados.`);
      hasErrors = true;
      errorCount++;
    } else {
      const countA = tags.filter(t => GROUP_A.includes(t)).length;
      const countB = tags.filter(t => GROUP_B.includes(t)).length;
      const countC = tags.filter(t => GROUP_C.includes(t)).length;

      if (countA !== 1 || countB > 1 || countC !== 1) {
        console.error(`\x1b[31m[ERROR]\x1b[0m ${relativePath}: Estructura de tags inválida.`);
        console.error(`       Tags actuales: [${tags.join(', ')}]`);
        console.error(`       -> Grupo A (Fase Metodología - Requiere exactamente 1): encontró ${countA}`);
        console.error(`       -> Grupo B (Herramienta - Permite máximo 1): encontró ${countB}`);
        console.error(`       -> Grupo C (Formato - Requiere exactamente 1): encontró ${countC}`);
        hasErrors = true;
        errorCount++;
      }
    }

    // 3. Validar existencia del asset heroImage si se define ruta local
    if (heroImageSrc) {
      if (heroImageSrc.startsWith('../../assets/')) {
        const localImagePath = path.resolve(blogDir, heroImageSrc);
        if (!fs.existsSync(localImagePath)) {
          console.error(`\x1b[31m[ERROR]\x1b[0m ${relativePath}: La imagen heroImage "${heroImageSrc}" no existe en el disco.`);
          console.error(`       Ruta buscada: ${localImagePath}`);
          hasErrors = true;
          errorCount++;
        }
      } else if (heroImageSrc.startsWith('/')) {
        // En public/
        const publicImagePath = path.resolve(__dirname, '../../public', heroImageSrc.substring(1));
        if (!fs.existsSync(publicImagePath)) {
          console.warn(`\x1b[33m[WARNING]\x1b[0m ${relativePath}: Imagen referenciada en public/ "${heroImageSrc}" no se encontró.`);
          warningCount++;
        }
      }
    } else {
      console.warn(`\x1b[33m[WARNING]\x1b[0m ${relativePath}: Falta la imagen destacada ('heroImage'). Requerido para SEO premium.`);
      warningCount++;
    }

    // 4. Buscar palabras prohibidas (Negative Keywords) en Título, Descripción y Tags
    const textToCheck = `${title} ${description} ${tags.join(' ')}`.toLowerCase();
    const foundKeywords = BLACKLIST.filter(kw => {
      const regex = new RegExp(`\\b${kw}\\b`, 'i');
      return regex.test(textToCheck);
    });

    if (foundKeywords.length > 0) {
      console.warn(`\x1b[33m[WARNING]\x1b[0m ${relativePath}: Contiene keywords prohibidas del cluster "Gratis/Bajo Valor": [${foundKeywords.join(', ')}]`);
      warningCount++;
    }

    // Buscar keywords prohibidas en las primeras 300 palabras del contenido
    const bodyWords = bodyContent.toLowerCase().split(/\s+/).slice(0, 300).join(' ');
    const foundInBody = BLACKLIST.filter(kw => {
      const regex = new RegExp(`\\b${kw}\\b`, 'i');
      return regex.test(bodyWords);
    });
    if (foundInBody.length > 0) {
      console.warn(`\x1b[33m[WARNING]\x1b[0m ${relativePath}: El inicio del post contiene keywords prohibidas: [${foundInBody.join(', ')}]`);
      warningCount++;
    }

    // 5. Validar que el slug sea consistente con el nombre del archivo
    const expectedSlug = path.parse(file).name;
    if (slug && slug !== expectedSlug) {
      console.warn(`\x1b[33m[WARNING]\x1b[0m ${relativePath}: El 'slug' en el frontmatter ("${slug}") no coincide con el nombre del archivo ("${expectedSlug}"). Se recomienda mantenerlos iguales.`);
      warningCount++;
    }
  }

  console.log(`\n📊 Resumen de validación:`);
  console.log(`   ✅ Posts procesados: ${files.length}`);
  if (errorCount > 0) {
    console.log(`   ❌ Errores encontrados: ${errorCount} (Corrige antes de compilar)`);
  } else {
    console.log(`   🟢 Todos los posts cumplen las reglas estructurales obligatorias.`);
  }
  if (warningCount > 0) {
    console.log(`   ⚠️ Advertencias (SEO/Editorial): ${warningCount}`);
  }

  if (hasErrors) {
    process.exit(1);
  } else {
    process.exit(0);
  }

} catch (err) {
  console.error('\x1b[31m[CRITICAL]\x1b[0m Error durante la ejecución del script de validación:', err);
  process.exit(1);
}
