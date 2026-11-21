<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Sergio Sención Sánchez — Insumos para Panaderías y Gastronomía</title>
  <link rel="stylesheet" href="styles.css" />
</head>
<body>
  <header class="site-header">
    <div class="container header-inner">
      <a href="#inicio" class="brand">Sergio Sención Sánchez</a>
      <nav aria-label="Navegación principal" class="nav">
        <a href="#inicio">Inicio</a>
        <a href="#tienda">Tienda</a>
        <a href="#envios">Envíos</a>
        <a href="#recetas">Recetas</a>
        <a href="#contacto">Contacto</a>
      </nav>
      <button type="button" id="open-cart-btn" class="cart-trigger" aria-label="Abrir carrito">
        Carrito (<span id="cart-count">0</span>)
      </button>
    </div>
  </header>

  <main id="inicio">
    <section class="hero">
      <div class="container">
        <p class="eyebrow">Distribuidora · Durazno y envíos a todo el país</p>
        <h1>Insumos de panadería y repostería para tu negocio</h1>
        <p class="lead">
          Harinas, premezclas, ingredientes para panes artesanales, tortas y líneas especiales
          (sin gluten y bajas en azúcar), con entregas programadas para panaderías y restaurantes.
        </p>
        <div class="hero-actions">
          <a href="#tienda" class="btn btn-primary">Ver productos</a>
          <a href="#contacto" class="btn btn-secondary">Solicitar presupuesto</a>
        </div>
      </div>
    </section>

    <section id="tienda" class="section container">
      <div class="section-head">
        <h2>Catálogo de insumos</h2>
        <div class="filters" role="group" aria-label="Filtrar por categoría">
          <button type="button" class="filter-btn active" data-category="todos">Todos</button>
          <button type="button" class="filter-btn" data-category="harinas">Harinas y premezclas</button>
          <button type="button" class="filter-btn" data-category="especiales">Sin gluten / Bajos en azúcar</button>
          <button type="button" class="filter-btn" data-category="reposteria">Repostería</button>
        </div>
      </div>
      <div id="product-grid" class="product-grid"></div>
    </section>

    <section id="envios" class="section section-alt">
      <div class="container features-grid">
        <article class="card">
          <h3>Entregas programadas</h3>
          <p>Coordinación directa para mantener abastecida tu producción sin cortes de stock.</p>
        </article>
        <article class="card">
          <h3>Cobertura nacional</h3>
          <p>Envíos a todo el país para comercios, panaderías, cafeterías y cocinas profesionales.</p>
        </article>
        <article class="card">
          <h3>Líneas especiales</h3>
          <p>Opciones seleccionadas para elaboraciones sin gluten y preparaciones bajas en azúcar.</p>
        </article>
      </div>
    </section>

    <section id="recetas" class="section container">
      <h2>Recetas y aplicaciones</h2>
      <p>Fichas técnicas y sugerencias de uso para panificación artesanal, masas y repostería.</p>
    </section>

    <section id="contacto" class="section section-alt">
      <div class="container contact-box">
        <div>
          <h2>Contacto y distribución</h2>
          <p>Antonio Grasiuso 926, 97000 Durazno</p>
          <p>Tel.: <a href="tel:+59843622500">+598 4362 2500</a> · Correo: <a href="mailto:info@sergiosencionsanchez.com.uy">info@sergiosencionsanchez.com.uy</a></p>
        </div>
      </div>
    </section>
  </main>

  <aside id="cart-drawer" class="cart-drawer" aria-label="Carrito de compras" aria-hidden="true">
    <div class="cart-header">
      <h3>Tu pedido</h3>
      <button type="button" id="close-cart-btn" aria-label="Cerrar carrito">✕</button>
    </div>
    <div id="cart-items" class="cart-items"></div>
    <div class="cart-footer">
      <div class="cart-total">
        <span>Subtotal estimado</span>
        <strong id="cart-total">$0</strong>
      </div>
      <button type="button" id="checkout-btn" class="btn btn-primary btn-full">Generar detalle del pedido</button>
      <p id="checkout-summary" class="checkout-summary" aria-live="polite"></p>
    </div>
  </aside>

  <script src="cart.js"></script>
</body>
</html>