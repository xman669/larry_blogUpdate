const fs = require('fs');
const path = require('path');

const ARTICULOS_DIR = './articulos_html';
const OUTPUT_FILE = './articulos_html/slider.html';

function generarSlider() {
  const archivos = fs.readdirSync(ARTICULOS_DIR)
    .filter(file =>
      file.endsWith('.html') &&
      !['index.html', 'destacados.html', 'slider.html'].includes(file)
    )
    .map(file => {
      const fullPath = path.join(ARTICULOS_DIR, file);
      const content = fs.readFileSync(fullPath, 'utf8');

      const titulo = content.match(/<h1[^>]*class=["'].*?heading-title.*?["'][^>]*>(.*?)<\/h1>/is)?.[1]?.trim() || 'Sin título';
      const fecha = content.match(/<i class="bi bi-calendar3"><\/i>([^<]*)/i)?.[1]?.trim() || '';
      const imagen = content.match(/<div class="hero-background">.*?<img[^>]+src=["']([^"']+)["']/is)?.[1] || '../../assets/img/default_main.webp';
      const categoria = content.match(/<span[^>]*class=["']badge["'][^>]*>(.*?)<\/span>/i)?.[1]?.trim() || 'General';
      const autor = content.match(/<h4>(.*?)<\/h4>/i)?.[1]?.trim() || 'Anónimo';
      // 🔹 Resumen (contenido principal antes de imágenes)
      const resumen = content.match(/<p[^>]*class=["']mb-0["'][^>]*>(.*?)<\/p>/i)?.[1]?.trim() || '';

      return { titulo, fecha, imagen, categoria, autor, resumen, archivo: file };
    });

  const recientes = archivos
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
    .slice(0, 5);

  const slides = recientes.map(a => `
    <div class="swiper-slide">
      <div class="card border-0 shadow-sm rounded-4 overflow-hidden h-100">
        <img src="${a.imagen}" class="w-100 object-fit-cover" style="height: 240px;" alt="${a.titulo}">
        <div class="card-body p-4 d-flex flex-column">
          <span class="badge bg-danger text-uppercase mb-2">${a.categoria}</span>
          <div class="d-flex align-items-center gap-2 mb-2">
            <img src="assets/img/Untitled%20design.jpg.webp" class="rounded-circle" width="36" height="36" alt="avatar">
            <div>
              <strong class="d-block small">${a.autor}</strong>
              <span class="text-muted small">${a.fecha}</span>
            </div>
          </div>
          <h5 class="fw-bold mb-1">${a.titulo}</h5>
          <p class="text-muted small mb-3">${a.resumen}</p>
          <div class="d-flex justify-content-between align-items-center mt-auto">
            <span class="text-muted small"><i class="bi bi-clock"></i> 5 min read</span>
            <a href="${a.archivo}" class="btn btn-danger btn-sm rounded-pill">READ MORE →</a>
          </div>
        </div>
      </div>
    </div>
  `).join('');

  const html = `
  <!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8">
    <title>Slider</title>
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.css" rel="stylesheet">
    <style>
      body {
        background: linear-gradient(to bottom, #fff, #fdf1ef);
        font-family: "Segoe UI", Roboto, Arial, sans-serif;
        color: #222;
      }
      .swiper {
        width: 100%;
        padding-bottom: 40px;
      }
      .swiper-slide {
        width: 300px;
      }
      .object-fit-cover {
        object-fit: cover;
      }
      .btn-danger {
        background-color: #e63946;
        border: none;
      }
      .btn-danger:hover {
        background-color: #c82d3a;
      }
      .swiper-pagination-bullet {
        background: #e63946;
      }
    </style>
  </head>
  <body>
    <div class="container py-5">
      <h1 class="text-center fw-bold">🎯 Featured Posts</h1>
      <p class="text-center text-muted mb-5">Lo mejor de Larry The Patriot esta semana</p>
      <div class="swiper mySwiper">
        <div class="swiper-wrapper">
          ${slides}
        </div>
        <div class="swiper-pagination mt-4"></div>
      </div>
    </div>

    <script src="https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.js"></script>
    <script>
      const swiper = new Swiper('.mySwiper', {
        slidesPerView: 1,
        spaceBetween: 30,
        loop: true,
        pagination: {
          el: '.swiper-pagination',
          clickable: true,
        },
        breakpoints: {
          768: { slidesPerView: 2 },
          992: { slidesPerView: 3 }
        }
      });
    </script>
  </body>
  </html>
  `;

  fs.writeFileSync(OUTPUT_FILE, html, 'utf8');
  console.log('✅ Archivo slider.html generado correctamente.');
}

generarSlider();