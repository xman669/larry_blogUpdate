// Generador de HTML combinado con 4 secciones: hero, destacados, últimos, carrusel
const fs = require('fs');
const path = require('path');

const ARTICULOS_DIR = './articulos_html';
const OUTPUT_FILE = './articulos_html/index.html';

function extraerArticulos() {
  return fs.readdirSync(ARTICULOS_DIR)
    .filter(file => file.endsWith('.html') && !['index.html', 'articulos_combinados.html'].includes(file))
    .map(file => {
      const content = fs.readFileSync(path.join(ARTICULOS_DIR, file), 'utf8');

      // 🔹 Título principal
      const titulo = content.match(/<h1[^>]*class=["']heading-title["'][^>]*>(.*?)<\/h1>/i)?.[1]?.trim() || 'Sin título';

      // 🔹 Fecha original (como "Wed Oct 29 2025")
      const fecha = content.match(/<time[^>]*>\s*<i[^>]*><\/i>\s*([A-Za-z]{3} [A-Za-z]{3} \d{1,2} \d{4})<\/time>/)?.[1] || '';

      // 🔹 Fecha en formato humano (como "29 de octubre de 2025")
      const fecha_humana = content.match(/<time[^>]*datetime=["'][^"']+["'][^>]*>(.*?)<\/time>/i)?.[1]?.trim() || '';

      // 🔹 Imagen destacada principal
      const imagen = content.match(/<img[^>]*class=["']hero-bg-image["'][^>]*src=["'](.*?)["']/i)?.[1]?.trim() || '../../assets/img/default_main.webp';

      // 🔹 Categoría (segunda línea del bloque .author-details)
      const categoria = content.match(/<div[^>]*class=["']author-details["'][^>]*>\s*<h4>.*?<\/h4>\s*<span>(.*?)<\/span>/i)?.[1]?.trim() || 'General';

      // 🔹 Resumen (contenido principal antes de imágenes)
      const resumen = content.match(/<p[^>]*class=["']mb-0["'][^>]*>(.*?)<\/p>/i)?.[1]?.trim() || 'Sin resumen';

      // 🔹 Autor (primera línea del bloque .author-details)
      const autor = content.match(/<div[^>]*class=["']author-details["'][^>]*>\s*<h4>(.*?)<\/h4>/i)?.[1]?.trim() || 'Anónimo';

      // 🔹 Primer tag (opcional)
      const tags = content.match(/<div[^>]*class=["']category-badges["'][^>]*>.*?<span[^>]*class=["']badge["'][^>]*>(.*?)<\/span>/i)?.[1]?.trim() || 'Sin etiquetas';

      return {
        titulo,
        fecha,
        fecha_humana,
        imagen,
        categoria,
        resumen,
        autor,
        tags,
        archivo: file
      };
    })
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
}

function formatoFecha(f) {
  const d = new Date(f);
  if (isNaN(d)) {
    return {
      dia: '??',
      mes: '???',
      completa: 'Fecha inválida'
    };
  }

  return {
    dia: d.getDate().toString().padStart(2, '0'),
    mes: d.toLocaleDateString('en-US', { month: 'short' }),
    completa: d.toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })
  };
}

function seccionHeroSlider(articulos) {
  const slides = articulos.slice(0, 3).map((a, i) => {
    return `
      <div class="carousel-item ${i === 0 ? 'active' : ''}">
        <div class="overflow-hidden rounded" style="border-radius: 8px;">
          <img src="${a.imagen}" class="d-block w-100 object-fit-cover" style="height: 480px; border-radius: 8px;" alt="${a.titulo}">
          <div class="carousel-caption d-block text-start px-4 py-3" style="background: rgba(0, 0, 0, 0.5); max-width: 650px; border-radius: 12px;">
            <h2 class="fw-bold mb-2" style="color: white;">${a.titulo}</h2>
            <p class="mb-3">${a.resumen}</p>
            <a href="${a.archivo}" class="btn btn-danger rounded-pill px-4">Read More →</a>
          </div>
        </div>
      </div>
    `;
  }).join('');

  return `
    <style>
      @media (max-width: 768px) {
        .carousel-caption {
          bottom: 20px !important;
          font-size: 14px;
          padding: 1rem !important;
        }
        .carousel-caption h2 {
          font-size: 1.25rem;
        }
        .carousel-caption p {
          font-size: 0.95rem;
        }
        .carousel-caption a.btn {
          font-size: 0.9rem;
          padding: 0.4rem 0.9rem;
        }
        .carousel-item img {
          height: 300px !important;
        }

        /* Margen en pantallas pequeñas */
        .slider-container {
          margin-inline: 1rem;
        }
      }

      /* Redondear el bloque completo */
      #heroCarousel .carousel-inner {
        border-radius: 8px;
        overflow: hidden;
      }

      /* Margen lateral en pantallas grandes */
      .slider-container {
        margin-inline: 0.08rem;
      }
    </style>

    <section class="slider-container" style="margin-bottom: 3rem;">
      <div id="heroCarousel" class="carousel slide" data-bs-ride="carousel">
        <div class="carousel-inner">
          ${slides}
        </div>
        <button class="carousel-control-prev" type="button" data-bs-target="#heroCarousel" data-bs-slide="prev">
          <span class="carousel-control-prev-icon"></span>
        </button>
        <button class="carousel-control-next" type="button" data-bs-target="#heroCarousel" data-bs-slide="next">
          <span class="carousel-control-next-icon"></span>
        </button>
      </div>
    </section>
  `;
}

function seccionDestacados(articulos) {
  const tarjetas = articulos.slice(0, 6).map(a => {
    const { dia, mes } = formatoFecha(a.fecha);
    return `
      <div class="col-md-6 col-lg-4 mb-5">
        <div class="card border-0 shadow-sm rounded-4 overflow-hidden h-100">
          <img src="${a.imagen}" class="w-100 object-fit-cover" style="height: 220px;" alt="${a.titulo}">
          <div class="card-body p-4 d-flex flex-column">
            <span class="badge bg-danger mb-2 text-uppercase">${a.categoria}</span>
            <h5 class="fw-bold mb-1">${a.titulo}</h5>
            <p class="text-muted small mb-3">${a.resumen}</p>
            <div class="d-flex justify-content-between align-items-center mt-auto">
             <span class="text-muted small">${dia} ${mes}</span>
              <a href="${a.archivo}" class="btn btn-danger btn-sm rounded-pill">Read More →</a>
            </div>
          </div>
        </div>
      </div>`;
  }).join('');

  return `
  <section class="mb-5">
    <h2 class="text-center fw-bold mb-4">Featured Insights</h2>
    <div class="row">${tarjetas}</div>
  </section>`;
}

function formatoFecha(fechaStr) {
  const fecha = new Date(fechaStr);
  const dia = fecha.toLocaleDateString("es-ES", { day: '2-digit' });
  const mes = fecha.toLocaleDateString("es-ES", { month: 'short' });
  return { dia, mes };
}

function seccionUltimosTres(articulos) {
  const [primero, segundo, tercero] = articulos.slice(0, 3);
  const { dia, mes } = formatoFecha(primero.fecha);

  return `
  <section class="mb-5">
    <h2 class="text-center fw-bold mb-4" style="font-size: 2rem;">Latest Articles</h2>
    <div class="row">
      <!-- Artículo Principal -->
      <div class="col-lg-8 mb-4">
        <div class="position-relative overflow-hidden rounded-4 shadow-lg h-100" style="min-height: 400px;">
          <img src="${primero.imagen}" class="img-fluid w-100 object-fit-cover position-absolute top-0 start-0" style="height: 100%; z-index: 1;" alt="${primero.titulo}">
          <div class="position-absolute top-0 start-0 p-3 text-white z-2">
            <div class="bg-danger px-3 py-1 rounded-pill small fw-bold shadow-sm">${dia} ${mes}</div>
            <div class="bg-dark px-3 py-1 rounded-pill small fw-bold mt-2 shadow-sm">${primero.categoria}</div>
          </div>
          <div class="position-absolute bottom-0 start-0 text-white p-4 z-2" style="background: linear-gradient(to top, rgba(0,0,0,0.75), transparent); width: 100%;">
            <h3 class="fw-bold mb-2" style="line-height: 1.2 color: white;">${primero.titulo}</h3>
            <p class="small d-none d-md-block mb-2">${primero.resumen}</p>
            <div class="small text-white-50 mb-2">Por ${primero.autor}</div>
            <a href="${primero.archivo}" class="btn btn-light btn-sm px-3 py-2 rounded-pill fw-semibold">Continue  →</a>
          </div>
        </div>
      </div>

      <!-- Artículos secundarios -->
      <div class="col-lg-4 d-flex flex-column gap-3">
        ${[segundo, tercero].map(a => {
          const { dia, mes } = formatoFecha(a.fecha);
          return `
          <div class="d-flex border rounded-3 shadow-sm p-2 align-items-start bg-white hover-shadow transition">
            <img src="${a.imagen}" class="rounded-3 me-3" style="width: 90px; height: 90px; object-fit: cover;" alt="${a.titulo}">
            <div>
              <div class="text-muted small mb-1">${dia} ${mes} • ${a.categoria}</div>
              <h6 class="fw-semibold mb-1" style="line-height: 1.2;">${a.titulo}</h6>
              <a href="${a.archivo}" class="small text-danger text-decoration-none fw-semibold">Read article →</a>
            </div>
          </div>`;
        }).join('')}
      </div>
    </div>
  </section>`;
}
function generarSeccionSlider(articulos) {
  const slides = articulos.slice(0, 5).map(a => `
    <div class="swiper-slide">
      <div class="card border-0 shadow-sm rounded-4 overflow-hidden h-100">
        <img src="${a.imagen}" class="w-100 object-fit-cover" style="height: 240px;" alt="${a.titulo}">
        <div class="card-body p-4 d-flex flex-column">
          <span class="badge bg-danger text-uppercase mb-2">${a.categoria}</span>
          <div class="d-flex align-items-center gap-2 mb-2">
            <img src="assets/img/Untitled%20design.jpg.webp" class="rounded-circle" width="36" height="36" alt="avatar">
            <div>
              <strong class="d-block small">${a.autor}</strong>
              <span class="text-muted small">${new Date(a.fecha).toLocaleDateString('es-ES')}</span>
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

  return `
<section class="container py-5">
<style>
 .swiper-pagination-bullet {
        background: #e63946;
      }
        </style>
  <h2 class="text-center fw-bold mb-3"></h2>
  <div class="swiper mySwiper">
    <div class="swiper-wrapper">
      ${slides}
    </div>
    <div class="swiper-pagination mt-4"></div>
  </div>
</section>`;
}

function generarArchivo() {
  const articulos = extraerArticulos();
  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <title>Blog Name</title>
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet">
  <link href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.10.5/font/bootstrap-icons.css" rel="stylesheet">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.css" />
  <!------------header de la palntilla----------------------->
  <meta property="og:image" content="assets/img/Untitled%20design.jpg.webp">
    <link rel="stylesheet" href="assets/bootstrap/css/bootstrap.min.css">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,100;0,300;0,400;0,500;0,700;0,900;1,100;1,300;1,400;1,500;1,700;1,900&amp;family=Montserrat:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&amp;family=Raleway:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&amp;display=swap">
    <link rel="stylesheet" href="assets/css/bootstrap-icons.css">
    <link rel="stylesheet" href="assets/css/swiper-icons.css">
    <link rel="stylesheet" href="assets/css/bss-overrides.css">
    <link rel="stylesheet" href="assets/css/aos.min.css">
    <link rel="stylesheet" href="assets/css/vendor/bootstrap/css/bootstrap.min.css">
    <link rel="stylesheet" href="assets/css/vendor/bootstrap-icons/bootstrap-icons.css">
    <link rel="stylesheet" href="assets/css/vendor/aos/aos.css">
    <link rel="stylesheet" href="assets/css/vendor/swiper/swiper-bundle.min.css">
    <link rel="stylesheet" href="assets/css/css/main.css">
  <style>
    body {
      background: #fff;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
    }
    .object-fit-cover { object-fit: cover; }
    .carousel-inner img { object-fit: cover; height: 480px; }
  </style>
</head>
<body>
<header class="position-relative d-flex align-items-center header" id="header">
        <div class="container position-relative d-flex justify-content-between align-items-center"><a class="d-flex align-items-center me-auto me-xl-0 logo" href="index.html"><img class="img-fluid" width="180" height="180" style="width: 36px;height: 36px;" src="assets/img/180x180.png"></a>
            <nav id="navmenu" class="navmenu">
                <ul>
                    <li><a href="index.html" class="active">Home</a></li>
                     <li><a href="category.html">Category</a></li>
                    <li><a href="../about.html">About</a></li>
                    <li><a href="http://localhost:1337/admin/auth/login">Write an Article</a></li>
                    <li><a href="../author-profile.html">Author Profile</a></li>
                    <li class="dropdown">
                        <ul>
                            <li><a href="about.html">About</a></li>
                            <li><a href="category.html">Category</a></li>
                            <li><a href="plantilla.html">Blog Details</a></li>
                            <li><a href="author-profile.html">Author Profile</a></li>
                            <li><a href="search-results.html">Search Results</a></li>
                            <li><a href="404.html">404 Not Found Page</a></li>
                            <li class="dropdown"><span>Deep Dropdown</span><i class="bi bi-chevron-down toggle-dropdown"></i>
                                <ul>
                                    <li><a href="#">Deep Dropdown 1</a></li>
                                    <li><a href="#">Deep Dropdown 2</a></li>
                                    <li><a href="#">Deep Dropdown 3</a></li>
                                    <li><a href="#">Deep Dropdown 4</a></li>
                                    <li><a href="#">Deep Dropdown 5</a></li>
                                </ul>
                            </li>
                        </ul>
                    </li>
                    <li><a href="../contact.html">Contact</a></li>
                </ul><i class="d-xl-none mobile-nav-toggle bi bi-list"></i>
            </nav>
            <div class="header-social-links"><a href="https://x.com/DeyoungLar31586" class="twitter"><i class="bi bi-twitter-x"></i></a><a href="https://www.facebook.com/profile.php?id=61576683547488" class="facebook"><i class="bi bi-facebook"></i></a><a href="https://www.linkedin.com/authwall?trk=gf&amp;trkInfo=AQFWfPRStV6t6AAAAZoH_QnYKitbp7kbOnVpzQgzi_Fo7oHcfij2Ww6r5Xq4tSIvrPr0KsCo2qJGtxM-Zb6QnjGjFuzgaHNCKlFSXNz4G55o7nmsKwHl9gun8fGL0T2P-U3b2_g=&amp;original_referer=https://larrythepatriot.com/&amp;sessionRedirect=https%3A%2F%2Fwww.linkedin.com%2Fin%2Flarry-de-young-59641317a" class="linkedin"><i class="bi bi-linkedin"></i></a></div>
        </div>
    </header>
  <div class="container py-5">
    ${seccionHeroSlider(articulos)}
    ${generarSeccionSlider(articulos)}
    ${seccionDestacados(articulos)}
    ${seccionUltimosTres(articulos)}
    
  </div>
  <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/js/bootstrap.bundle.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/swiper@10/swiper-bundle.min.js"></script>
  <script>
    const swiper = new Swiper(".mySwiper", {
      slidesPerView: 1,
      spaceBetween: 16,
      loop: true,
      pagination: { el: ".swiper-pagination", clickable: true },
      breakpoints: {
        768: { slidesPerView: 2 },
        992: { slidesPerView: 3 }
      }
    });
  </script>
  <footer class="position-relative footer light-background" id="footer">
        <div class="container">
            <div class="row gy-5">
                <div class="col-lg-4">
                    <div class="footer-brand"><a class="d-flex align-items-center mb-3 logo" href="index.html"><img class="img-fluid" width="180" height="180" style="width: 40px;height: 40px;" src="assets/img/180x180.png"></a><p class="tagline">For truth, freedom, and the awakening of America</p>
                        <div class="mt-4 social-links"><a href="https://www.facebook.com/profile.php?id=61576683547488" aria-label="Facebook"><i class="bi bi-facebook"></i></a><a href="https://www.youtube.com/@LarryDeYoung-t7y" aria-label="LinkedIn"><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 16 16" class="bi bi-youtube">
                                    <path d="M8.051 1.999h.089c.822.003 4.987.033 6.11.335a2.01 2.01 0 0 1 1.415 1.42c.101.38.172.883.22 1.402l.01.104.022.26.008.104c.065.914.073 1.77.074 1.957v.075c-.001.194-.01 1.108-.082 2.06l-.008.105-.009.104c-.05.572-.124 1.14-.235 1.558a2.007 2.007 0 0 1-1.415 1.42c-1.16.312-5.569.334-6.18.335h-.142c-.309 0-1.587-.006-2.927-.052l-.17-.006-.087-.004-.171-.007-.171-.007c-1.11-.049-2.167-.128-2.654-.26a2.007 2.007 0 0 1-1.415-1.419c-.111-.417-.185-.986-.235-1.558L.09 9.82l-.008-.104A31.4 31.4 0 0 1 0 7.68v-.123c.002-.215.01-.958.064-1.778l.007-.103.003-.052.008-.104.022-.26.01-.104c.048-.519.119-1.023.22-1.402a2.007 2.007 0 0 1 1.415-1.42c.487-.13 1.544-.21 2.654-.26l.17-.007.172-.006.086-.003.171-.007A99.788 99.788 0 0 1 7.858 2h.193zM6.4 5.209v4.818l4.157-2.408z"></path>
                                </svg></a><a href="https://x.com/DeyoungLar31586" aria-label="Twitter"><i class="bi bi-twitter-x"></i></a></div>
                    </div>
                </div>
                <div class="col-lg-6">
                    <div class="footer-links-grid">
                        <div class="row">
                            <div class="col-6 col-md-4">
                                <h5>Company</h5><ul class="list-unstyled">
    <li><a href="../about.html">About Us</a></li>
    <li><a href="index.html">Home</a></li>
    <li><a href="../author-profile.html">Author</a></li>
    <li><a href="../contact.html">Contact</a></li>
</ul>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="col-lg-2">
                    <div class="footer-cta">
                        <h5>Let's Connect</h5><a class="btn btn-outline" role="button" href="../contact.html">Get in Touch</a>
                    </div>
                </div>
            </div>
        </div>
        <div class="footer-bottom">
            <div class="container">
                <div class="row">
                    <div class="col-12">
                        <div class="footer-bottom-content">
                            <p class="mb-0">©Larry The Patriot. All rights reserved.</p>
                            <div class="credits"><span> Designed by </span><a href="https://theroberts.io">The Robert's Marketing Agency</a></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </footer><a class="d-flex justify-content-center align-items-center scroll-top" href="#" id="scroll-top"><i class="bi bi-arrow-up-short"></i></a>
    <script src="assets/bootstrap/js/bootstrap.min.js"></script>
    <script src="assets/js/aos.min.js"></script>
    <script src="assets/js/bs-init.js"></script>
    <script src="assets/js/vendor/bootstrap/js/bootstrap.bundle.min.js"></script>
    <script src="assets/js/vendor/php-email-form/validate.js"></script>
    <script src="assets/js/vendor/aos/aos.js"></script>
    <script src="assets/js/vendor/swiper/swiper-bundle.min.js"></script>
    <script src="assets/js/vendor/purecounter/purecounter_vanilla.js"></script>
    <script src="assets/js/js/main.js"></script>
</body>

</html>`;

  fs.writeFileSync(OUTPUT_FILE, html, 'utf8');
  console.log('✅ Archivo index.html generado con todas las secciones.');
  console.log(`🧪 Archivo: ${file}`);
  console.log(`➡️ Fecha cruda extraída: "${fecha}"`);
  console.log(`➡️ Resultado new Date(fecha):`, new Date(fecha));
}

generarArchivo();