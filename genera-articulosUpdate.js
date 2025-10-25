const fs = require('fs');
const path = require('path');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

// Configuración principal
const API_URL = 'http://localhost:1337/api/articulos?populate=*';
const API_TOKEN = '66542ac0f521d15cba3cf9fceecc42f68d795c26d1dbfe8fb2ef434454ef564293bf808df06ae1cdeb77719697bd54a02e116d7af025432e02d752163f4f8936ae9683c3e5406a1900dc26d21207213210ae5bc4a55fe16228e37d07520e51f067e3ab6ff1ba13e69394418a0d1d46fa75c0a3f1f6dfda0697674f24c402656f';  // Reemplaza con tu token real
const STRAPI_URL = 'http://localhost:1337';
const PLANTILLA_PATH = './plantilla.html';
const OUTPUT_DIR = './articulos_html/';

// 📸 Función auxiliar para obtener la URL completa de una imagen
function getImageUrl(imgField) {
  if (!imgField) return null;
  if (imgField.data?.attributes?.url) return `${STRAPI_URL}${imgField.data.attributes.url}`;
  if (imgField.url) return `${STRAPI_URL}${imgField.url}`;
  return null;
}

async function generarHTMLdesdeStrapi() {
  try {
    // Crear carpeta de salida si no existe
    if (!fs.existsSync(OUTPUT_DIR)) fs.mkdirSync(OUTPUT_DIR);

    // Leer plantilla base
    const plantilla = fs.readFileSync(PLANTILLA_PATH, 'utf8');

    // Consultar la API de Strapi con token
    const res = await fetch(API_URL, {
      headers: {
        'Authorization': `Bearer ${API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    const result = await res.json();
    const articulos = result.data;

    if (!articulos || !articulos.length) {
      console.log('⚠️ No hay artículos disponibles en Strapi.');
      return;
    }

    // Procesar cada artículo individualmente
    for (const item of articulos) {
      const attr = item.attributes || item;

      const title = attr.title || 'Sin título';
      const subtitle = attr.subtitle || 'Sin subtítulo';
      const content = attr.content || '';
      const content2 = attr.content_2 || ''; // ✅ Nuevo campo content_2
      const author = attr.author || 'Anónimo';
      const quote = attr.quote || 'QUOTE';
      const author_quote = attr.author_quote || 'AUTHOR_QUOTE';
      const dateRaw = attr.date || new Date().toISOString();
      const dateHuman = new Date(dateRaw).toDateString();
      const category = attr.category || 'General';
      const tags = attr.tags
      const description = attr.description
      const keywords = attr.keywords
        ? attr.tags.split(',').map(t => `<li><a href="#">${t.trim()}</a></li>`).join('')
        : '';

      const imgMain = getImageUrl(attr.img_main) || '../../assets/img/default_main.webp';
      const imgSecondary = getImageUrl(attr.img_secondary) || '../../assets/img/default_secondary.webp';
      const imgAlt = attr.img_main?.alternativeText || `Imagen de ${title}`;

      const nombreArchivo = (attr.nombre_archivo || `articulo-${item.id}`).trim() + '.html';

      // Reemplazo de variables en la plantilla HTML
      let htmlFinal = plantilla
        .replace(/{{TITLE}}/g, title)
        .replace('{{CONTENT}}', content)
        .replace('{{CONTENT_2}}', content2) // ✅ Insertar nuevo contenido en la plantilla
        .replace('{{AUTHOR}}', author)
        .replace('{{DATE_RAW}}', dateRaw)
        .replace('{{DATE_HUMAN}}', dateHuman)
        .replace('{{CATEGORY}}', category)
        .replace('{{IMG_MAIN}}', imgMain)
        .replace('{{IMG_SECONDARY}}', imgSecondary)
        .replace('{{IMG_ALT}}', imgAlt)
        .replace('{{TAGS}}', tags)
        .replace('{{SUBTITLE}}', subtitle)
        .replace('{{QUOTE}}', quote)
        .replace('{{AUTHOR_QUOTE}}', author_quote)
        .replace('{{DESCRIPTION}}', description)
        .replace('{{KEYWORDS}}', keywords);
        

      // Guardar archivo final en carpeta de salida
      const rutaFinal = path.join(OUTPUT_DIR, nombreArchivo);
      fs.writeFileSync(rutaFinal, htmlFinal);
      console.log(`✅ Archivo generado: ${rutaFinal}`);
      console.log('🧪 Atributos del artículo:', attr);//codigo para ver los articulos que se obtubieron de strapi
    }

  } catch (err) {
    console.error('❌ Error generando archivos:', err.message);
  }
}

generarHTMLdesdeStrapi();