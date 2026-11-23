const stage = document.getElementById("horizontal-stage");
const panels = Array.from(document.querySelectorAll(".panel"));
const navLinks = Array.from(document.querySelectorAll(".nav-link[data-nav]"));
const mobileLinks = Array.from(document.querySelectorAll(".mobile-link[data-nav]"));
const progressFill = document.getElementById("scroll-progress");
const panelIndicator = document.getElementById("panel-indicator");

const mobileMenuBtn = document.getElementById("mobile-menu-btn");
const mobileDrawer = document.getElementById("mobile-drawer");
const cartDrawer = document.getElementById("cart-drawer");
const techModal = document.getElementById("tech-modal");
const backdrop = document.getElementById("backdrop");
const splashGate = document.getElementById("splash-gate");

const MOBILE_BREAKPOINT = 860;
const MOBILE_TOPBAR_H = 66;
const WHATSAPP_NUMBER = "59899703667";
let currentIndex = 0;
let wheelLock = false;
let activeTechProductId = null;

if (splashGate) {
  const enterSite = () => {
    splashGate.classList.add("is-hidden");
    setTimeout(() => {
      splashGate.remove();
    }, 350);
  };

  splashGate.addEventListener("click", enterSite);
  splashGate.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      enterSite();
    }
  });
}

const isMobile = () => window.innerWidth <= MOBILE_BREAKPOINT;

function ensurePanelsVisible() {
  panels.forEach((panel) => panel.classList.add("is-visible"));
}

function syncBackdrop() {
  if (!backdrop) return;
  const isCartOpen = Boolean(cartDrawer && cartDrawer.classList.contains("open"));
  const isTechOpen = Boolean(techModal && !techModal.hidden);
  backdrop.hidden = !(isCartOpen || isTechOpen);
}

function closeMobileMenu() {
  if (!mobileDrawer || !mobileMenuBtn) return;
  mobileDrawer.classList.remove("open");
  mobileDrawer.setAttribute("aria-hidden", "true");
  mobileMenuBtn.setAttribute("aria-expanded", "false");
}

function toggleMobileMenu() {
  if (!mobileDrawer || !mobileMenuBtn) return;
  const willOpen = !mobileDrawer.classList.contains("open");
  mobileDrawer.classList.toggle("open", willOpen);
  mobileDrawer.setAttribute("aria-hidden", String(!willOpen));
  mobileMenuBtn.setAttribute("aria-expanded", String(willOpen));
}

function closeTechSheet() {
  if (!techModal) return;
  techModal.hidden = true;
  techModal.setAttribute("aria-hidden", "true");
  activeTechProductId = null;
  syncBackdrop();
}

function openCart() {
  if (!cartDrawer) return;
  closeMobileMenu();
  closeTechSheet();
  cartDrawer.classList.add("open");
  cartDrawer.setAttribute("aria-hidden", "false");
  syncBackdrop();
}

function closeCart() {
  if (!cartDrawer) return;
  cartDrawer.classList.remove("open");
  cartDrawer.setAttribute("aria-hidden", "true");
  syncBackdrop();
}

function closeAllOverlays() {
  closeCart();
  closeTechSheet();
  closeMobileMenu();
}

function updateUIState(index) {
  if (!panels.length) return;
  const clamped = Math.max(0, Math.min(panels.length - 1, index));
  currentIndex = clamped;

  if (navLinks.length) {
    navLinks.forEach((link, idx) => link.classList.toggle("active", idx === clamped));
  }
  if (mobileLinks.length) {
    mobileLinks.forEach((link, idx) => link.classList.toggle("active", idx === clamped));
  }

  if (panelIndicator) {
    panelIndicator.textContent = `${String(clamped + 1).padStart(2, "0")} / ${String(panels.length).padStart(2, "0")}`;
  }

  if (progressFill && !isMobile() && panels.length > 1) {
    const denominator = Math.max(1, panels.length - 1);
    const pct = (clamped / denominator) * 100;
    progressFill.style.width = `${pct}%`;
  }
}

function goToPanel(index) {
  if (!panels.length) return;
  const clamped = Math.max(0, Math.min(panels.length - 1, index));
  closeMobileMenu();
  ensurePanelsVisible();

  if (!isMobile() && stage) {
    stage.scrollTo({
      left: clamped * window.innerWidth,
      behavior: "smooth"
    });
  } else if (panels[clamped]) {
    const topOffset = panels[clamped].offsetTop - MOBILE_TOPBAR_H;
    window.scrollTo({
      top: Math.max(0, topOffset),
      behavior: "smooth"
    });
  }
  updateUIState(clamped);
}

if (stage && panels.length > 1) {
  stage.addEventListener(
    "wheel",
    (e) => {
      if (isMobile()) return;
      if (cartDrawer && cartDrawer.classList.contains("open")) return;
      if (techModal && !techModal.hidden) return;
      if (Math.abs(e.deltaY) < 10 && Math.abs(e.deltaX) < 10) return;

      const currentPanel = panels[currentIndex];
      const hasVerticalOverflow =
        currentPanel && currentPanel.scrollHeight > currentPanel.clientHeight + 4;

      if (hasVerticalOverflow && Math.abs(e.deltaY) >= Math.abs(e.deltaX)) {
        const atTop = currentPanel.scrollTop <= 2;
        const atBottom =
          currentPanel.scrollTop + currentPanel.clientHeight >= currentPanel.scrollHeight - 2;

        if ((e.deltaY > 0 && !atBottom) || (e.deltaY < 0 && !atTop)) {
          return;
        }
      }

      e.preventDefault();
      if (wheelLock) return;

      const delta = Math.abs(e.deltaY) >= Math.abs(e.deltaX) ? e.deltaY : e.deltaX;
      wheelLock = true;
      goToPanel(currentIndex + (delta > 0 ? 1 : -1));
      setTimeout(() => {
        wheelLock = false;
      }, 480);
    },
    { passive: false }
  );

  stage.addEventListener("scroll", () => {
    if (isMobile()) return;
    const maxScroll = stage.scrollWidth - stage.clientWidth;
    if (progressFill && maxScroll > 0) {
      progressFill.style.width = `${(stage.scrollLeft / maxScroll) * 100}%`;
    }
    const width = Math.max(1, window.innerWidth);
    const idx = Math.round(stage.scrollLeft / width);
    if (idx !== currentIndex) {
      updateUIState(idx);
    }
  });
}

window.addEventListener("scroll", () => {
  if (!isMobile()) return;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  if (progressFill && docHeight > 0) {
    progressFill.style.width = `${(window.scrollY / docHeight) * 100}%`;
  }
});

const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        if (isMobile() && panels.length > 1) {
          updateUIState(Number(entry.target.dataset.index));
        }
      }
    });
  },
  { threshold: isMobile() ? 0.08 : 0.25 }
);

panels.forEach((panel) => observer.observe(panel));

document.querySelectorAll("[data-nav]").forEach((trigger) => {
  trigger.addEventListener("click", (e) => {
    e.preventDefault();
    goToPanel(Number(trigger.dataset.nav));
  });
});

if (mobileMenuBtn) {
  mobileMenuBtn.addEventListener("click", toggleMobileMenu);
}

const prevPanelBtn = document.getElementById("prev-panel");
const nextPanelBtn = document.getElementById("next-panel");
if (prevPanelBtn) prevPanelBtn.addEventListener("click", () => goToPanel(currentIndex - 1));
if (nextPanelBtn) nextPanelBtn.addEventListener("click", () => goToPanel(currentIndex + 1));

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeAllOverlays();
    return;
  }
  if (techModal && !techModal.hidden) return;
  if (isMobile()) return;
  if (document.activeElement && ["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) {
    return;
  }

  if (e.key === "ArrowDown" || e.key === "ArrowUp") {
    const activePanel = panels[currentIndex];
    if (activePanel && activePanel.scrollHeight > activePanel.clientHeight + 4) {
      e.preventDefault();
      const step = 140;
      activePanel.scrollBy({
        top: e.key === "ArrowDown" ? step : -step,
        behavior: "smooth"
      });
    }
    return;
  }

  if (panels.length > 1) {
    if (e.key === "ArrowRight") goToPanel(currentIndex + 1);
    if (e.key === "ArrowLeft") goToPanel(currentIndex - 1);
  }
});

window.addEventListener("resize", () => {
  ensurePanelsVisible();
  if (!isMobile()) {
    closeMobileMenu();
    if (stage && panels.length > 1) {
      stage.scrollLeft = currentIndex * window.innerWidth;
    }
  }
});

/* --- CATÁLOGO DE PRODUCTOS CON FICHAS TÉCNICAS --- */
const CATEGORY_LABELS = {
  puratos: "Productos Puratos",
  harinas: "Harinas, Premezclas y Levaduras",
  pasteleria: "Pastelería y Confitería",
  "almacen-gastronomia": "Insumos de Almacén y Gastronomía"
};

/* Nota: category puede ser un texto ("harinas") o una lista (["harinas", "puratos"])
   para que un mismo producto aparezca en más de un botón de filtro.
   Los productos Puratos figuran en primer lugar. */
const PRODUCTS = [
  {
    id: 5,
    name: "Easy Prepizza",
    unit: "Bolsa 10 kg",
    category: ["puratos", "harinas"],
    price: 1380,
    image: "easypizza.webp",
    techSheet: {
      tipo: "Premezcla completa para prepizzas y focaccias",
      presentacion: "Bolsa de 10 kg",
      aplicaciones: "Prepizzas al molde, a la piedra, pizzetas y focaccias.",
      rendimiento: "Estandariza tiempos de fermentación y evita errores de dosificación.",
      conservacion: "Conservar bien cerrada en lugar fresco y seco."
    }
  },
  {
    id: 6,
    name: "Easy Salvado",
    unit: "Bolsa 5 kg",
    category: ["puratos", "harinas"],
    price: 980,
    image: "easysalvado.webp",
    techSheet: {
      tipo: "Premezcla para panificados con salvado",
      presentacion: "Bolsa de 5 kg",
      aplicaciones: "Panes integrales, figazas con fibra, tostadas y sándwiches.",
      rendimiento: "Aporte equilibrado de fibra con miga húmeda y tierna.",
      conservacion: "Lugar fresco y seco, lejos de fuentes de calor."
    }
  },
  {
    id: 7,
    name: "Easy Pan Blanco tipo Artesanal",
    unit: "Bolsa 10 kg",
    category: ["puratos", "harinas"],
    price: 1420,
    image: "easypanblanco.webp",
    techSheet: {
      tipo: "Premezcla para pan blanco rústico / artesanal",
      presentacion: "Bolsa de 10 kg",
      aplicaciones: "Hogazas rústicas, baguettes, ciabattas y panes de corteza crocante.",
      rendimiento: "Alveolado abierto, aroma tradicional y buena conservación.",
      conservacion: "Lugar fresco, seco y ventilado."
    }
  },
  {
    id: 8,
    name: "Easy Multicereal Plus",
    unit: "Bolsa 5 kg",
    category: ["puratos", "harinas"],
    price: 1190,
    image: "easymulticereal.webp",
    techSheet: {
      tipo: "Premezcla con mix de semillas y cereales",
      presentacion: "Bolsa de 5 kg",
      aplicaciones: "Panes multicereal, barras con semillas, pan de molde integral y grisines.",
      rendimiento: "Distribución homogénea de semillas y excelente volumen.",
      conservacion: "Mantener en envase cerrado en lugar fresco y seco."
    }
  },
  {
    id: 9,
    name: "Harina de Almendras",
    unit: "Bolsa 1 kg",
    category: ["puratos", "harinas", "pasteleria"],
    price: 1490,
    image: "harinadealmendras.webp",
    techSheet: {
      tipo: "Almendra repelada finamente molida",
      presentacion: "Bolsa de 1 kg",
      aplicaciones: "Macarons, financiers, frangipane, alfajores y pastelería sin harina de trigo.",
      rendimiento: "Granulometría fina que evita grumos en batidos delicados.",
      conservacion: "Lugar fresco, oscuro y seco (idealmente refrigerado tras abrir)."
    }
  },
  {
    id: 10,
    name: "Patis´omalt",
    unit: "Balde 4 kg",
    category: ["puratos", "pasteleria"],
    price: 1220,
    image: "patisomalt.webp",
    techSheet: {
      tipo: "Sustituto de azúcar para piezas artísticas y caramelo",
      presentacion: "Balde de 4 kg",
      aplicaciones: "Decoraciones de azúcar estirado/soplado, vitrales, pirulines y confitería.",
      rendimiento: "Alta transparencia, baja higroscopicidad y resistencia a la humedad.",
      conservacion: "Mantener el balde herméticamente cerrado en ambiente seco."
    }
  },
  {
    id: 11,
    name: "Praliné de avellanas",
    unit: "Balde 5 kg",
    category: ["puratos", "pasteleria"],
    price: 1540,
    image: "pralinedeavellanas.webp",
    techSheet: {
      tipo: "Pasta praliné de avellanas tostadas caramelizadas",
      presentacion: "Balde de 5 kg",
      aplicaciones: "Rellenos de bombonería, mousses, cremas pasteleras, heladería y tortas.",
      rendimiento: "Sabor intenso a avellana tostada y textura lista para incorporar.",
      conservacion: "Lugar fresco y seco (15 °C a 20 °C), bien tapado."
    }
  },
  {
    id: 1,
    name: "Molino Dolores Fideera",
    unit: "Bolsa 25 kg · Pastera A",
    category: "harinas",
    price: 1250,
    image: "fideera.jpg",
    techSheet: {
      tipo: "Harina de trigo Pastera A",
      presentacion: "Bolsa de 25 kg",
      aplicaciones: "Pastas frescas, fideos, tallarines, ravioles y masas laminadas.",
      rendimiento: "Alta elasticidad y firmeza al laminado sin quiebre.",
      conservacion: "Ambiente fresco, seco y ventilado, sobre tarima."
    }
  },
  {
    id: 2,
    name: "Molino Dolores Panadera",
    unit: "Bolsa 25 kg · Panadera C",
    category: "harinas",
    price: 1180,
    image: "panadera.jpg",
    techSheet: {
      tipo: "Harina de trigo Panadera C adicionada",
      presentacion: "Bolsa de 25 kg",
      aplicaciones: "Pan francés, flautas, porteños, galleta de campaña y panificación diaria.",
      rendimiento: "Buena absorción de agua y volumen estable en horneado.",
      conservacion: "Lugar fresco y seco, protegido de humedad y luz directa."
    }
  },
  {
    id: 3,
    name: "Molino Dolores Panadera Verde",
    unit: "Bolsa 25 kg · Panadera C",
    category: "harinas",
    price: 1190,
    image: "panadera verde.jpg",
    techSheet: {
      tipo: "Harina de trigo Panadera C · Línea Verde",
      presentacion: "Bolsa de 25 kg",
      aplicaciones: "Panificados de fermentación controlada, bizcochos y masas sobadas.",
      rendimiento: "Miga pareja y corteza dorada uniforme.",
      conservacion: "Lugar fresco, seco y ventilado."
    }
  },
  {
    id: 4,
    name: "Molino Dolores Panadera Superior",
    unit: "Bolsa 25 kg · Panadera B",
    category: "harinas",
    price: 1290,
    image: "panadera superior.jpg",
    techSheet: {
      tipo: "Harina de trigo Panadera B de fuerza superior",
      presentacion: "Bolsa de 25 kg",
      aplicaciones: "Panes de molde, viena, hamburguesa, masas enriquecidas y fermentaciones largas.",
      rendimiento: "Mayor tolerancia al amasado y excelente retención de gas.",
      conservacion: "Lugar fresco, seco y alejado de olores fuertes."
    }
  },
  {
    id: 12,
    name: "Almendras fileteadas",
    unit: "Bolsa 1 kg",
    category: "pasteleria",
    price: 610,
    image: "almendrasfileteadas.webp",
    techSheet: {
      tipo: "Almendras laminadas listas para hornear o tostar",
      presentacion: "Bolsa de 1 kg",
      aplicaciones: "Terminación de tortas, facturas, stollen, croissants de almendra y granola.",
      rendimiento: "Láminas parejas de tostado rápido y uniforme.",
      conservacion: "Lugar fresco, seco y protegido de la luz."
    }
  }
];

function getProductCategories(product) {
  if (Array.isArray(product.category)) return product.category;
  return product.category ? [product.category] : [];
}

const CART_KEY = "sss_horizontal_cart_v3";
let cart = [];
try {
  const parsed = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
  if (Array.isArray(parsed)) {
    cart = parsed.filter(
      (item) =>
        item &&
        typeof item.id === "number" &&
        typeof item.name === "string" &&
        Number(item.price) > 0 &&
        Number(item.qty) > 0
    );
  }
} catch (_err) {
  cart = [];
}

const VALID_CATEGORIES = ["todos", "puratos", "harinas", "pasteleria", "almacen-gastronomia"];
const urlCategory = new URLSearchParams(window.location.search).get("categoria");
let activeCategory = VALID_CATEGORIES.includes(urlCategory) ? urlCategory : "todos";

const productGrid = document.getElementById("product-grid");
const cartItemsEl = document.getElementById("cart-items");
const cartCountEl = document.getElementById("cart-count");
const cartTotalEl = document.getElementById("cart-total");
const checkoutMsgEl = document.getElementById("checkout-msg");
const customerNameEl = document.getElementById("cart-customer-name");
const customerLocationEl = document.getElementById("cart-customer-location");

const techModalCategoryEl = document.getElementById("tech-modal-category");
const techModalMediaEl = document.getElementById("tech-modal-media");
const techModalUnitEl = document.getElementById("tech-modal-unit");
const techModalTitleEl = document.getElementById("tech-modal-title");
const techModalPriceEl = document.getElementById("tech-modal-price");
const techModalSpecsEl = document.getElementById("tech-modal-specs");
const techModalAddBtn = document.getElementById("tech-modal-add-btn");

const formatUYU = (n) => `$${Number(n || 0).toLocaleString("es-UY")}`;

function renderMediaBlock(product) {
  const cats = getProductCategories(product);
  const label = cats.map((c) => CATEGORY_LABELS[c] || c).join(" · ") || "Insumo";
  if (product.image) {
    return `<img src="${product.image}" alt="${product.name}" class="product-thumb" loading="lazy" />`;
  }
  return `<div class="product-thumb-placeholder">Insumo · ${label}</div>`;
}

function addProductToCart(id) {
  const product = PRODUCTS.find((p) => p.id === id);
  if (!product) return;
  const found = cart.find((item) => item.id === id);
  if (found) found.qty += 1;
  else cart.push({ ...product, qty: 1 });
  saveAndRenderCart();
}

function openTechSheet(id) {
  const product = PRODUCTS.find((p) => p.id === id);
  if (!product || !techModal) return;

  closeMobileMenu();
  closeCart();
  activeTechProductId = product.id;

  const cats = getProductCategories(product);
  const categoryText =
    cats.map((c) => CATEGORY_LABELS[c]).filter(Boolean).join(" · ") || "Ficha Técnica";

  if (techModalCategoryEl) {
    techModalCategoryEl.textContent = categoryText;
  }
  if (techModalMediaEl) {
    techModalMediaEl.innerHTML = renderMediaBlock(product);
  }
  if (techModalUnitEl) {
    techModalUnitEl.textContent = product.unit;
  }
  if (techModalTitleEl) {
    techModalTitleEl.textContent = product.name;
  }
  if (techModalPriceEl) {
    techModalPriceEl.textContent = "";
    techModalPriceEl.hidden = true;
  }

  if (techModalSpecsEl) {
    const specs = product.techSheet || {};
    const rows = [
      ["Tipo de insumo", specs.tipo || product.name],
      ["Presentación", specs.presentacion || product.unit],
      ["Aplicaciones", specs.aplicaciones || "Panificación y gastronomía profesional."],
      ["Rendimiento", specs.rendimiento || "Calidad seleccionada para obrador."],
      ["Conservación", specs.conservacion || "Lugar fresco y seco."]
    ];

    techModalSpecsEl.innerHTML = rows
      .map(
        ([label, value]) => `
        <div class="tech-spec-row">
          <dt>${label}</dt>
          <dd>${value}</dd>
        </div>
      `
      )
      .join("");
  }

  techModal.hidden = false;
  techModal.setAttribute("aria-hidden", "false");
  syncBackdrop();
}

function setActiveCategory(category) {
  activeCategory = VALID_CATEGORIES.includes(category) ? category : "todos";
  document.querySelectorAll(".filter-pill").forEach((pill) => {
    pill.classList.toggle("active", pill.dataset.category === activeCategory);
  });
  renderProducts();
}

function renderProducts() {
  if (!productGrid) return;
  const list =
    activeCategory === "todos"
      ? PRODUCTS
      : PRODUCTS.filter((p) => getProductCategories(p).includes(activeCategory));

  if (!list.length) {
    productGrid.innerHTML = "<p>No hay insumos cargados en esta categoría todavía.</p>";
    return;
  }

  productGrid.innerHTML = list
    .map(
      (p) => `
      <article class="product-card" data-product-id="${p.id}" tabindex="0" role="button" aria-label="Ver ficha técnica de ${p.name}">
        <div>
          <div class="product-thumb-wrap">
            ${renderMediaBlock(p)}
            <span class="product-sheet-hint">Ficha técnica</span>
          </div>
          <span class="product-meta">${p.unit}</span>
          <h3>${p.name}</h3>
        </div>
        <div>
          <button type="button" class="btn btn-primary btn-full" data-add="${p.id}">
            Agregar
          </button>
        </div>
      </article>
    `
    )
    .join("");
}

function saveAndRenderCart() {
  try {
    localStorage.setItem(CART_KEY, JSON.stringify(cart));
  } catch (_err) {
    // Continuar aunque el almacenamiento local no esté disponible
  }

  const qty = cart.reduce((acc, item) => acc + Number(item.qty || 0), 0);
  const total = cart.reduce((acc, item) => acc + Number(item.price || 0) * Number(item.qty || 0), 0);

  if (cartCountEl) cartCountEl.textContent = qty;
  if (cartTotalEl) cartTotalEl.textContent = formatUYU(total);

  if (!cartItemsEl) return;

  if (!cart.length) {
    cartItemsEl.innerHTML = "<p>Tu carrito está vacío.</p>";
    return;
  }

  cartItemsEl.innerHTML = cart
    .map(
      (item) => `
      <div class="cart-row">
        <div class="cart-item-main">
          ${
            item.image
              ? `<img src="${item.image}" alt="${item.name}" class="cart-item-thumb" />`
              : `<div class="cart-item-thumb product-thumb-placeholder">SSS</div>`
          }
          <div>
            <strong>${item.name}</strong>
            <div class="product-meta">${item.unit} · ${formatUYU(item.price * item.qty)}</div>
          </div>
        </div>
        <div class="qty-box">
          <button type="button" data-dec="${item.id}" aria-label="Restar unidad">-</button>
          <span>${item.qty}</span>
          <button type="button" data-inc="${item.id}" aria-label="Sumar unidad">+</button>
        </div>
      </div>
    `
    )
    .join("");
}

document.querySelectorAll(".filter-pill").forEach((pill) => {
  pill.addEventListener("click", () => {
    setActiveCategory(pill.dataset.category);
  });
});

if (productGrid) {
  productGrid.addEventListener("click", (e) => {
    const addBtn = e.target.closest("[data-add]");
    if (addBtn) {
      e.stopPropagation();
      addProductToCart(Number(addBtn.dataset.add));
      return;
    }

    const card = e.target.closest("[data-product-id]");
    if (card) {
      openTechSheet(Number(card.dataset.productId));
    }
  });

  productGrid.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    if (e.target.closest("[data-add]")) return;
    const card = e.target.closest("[data-product-id]");
    if (card) {
      e.preventDefault();
      openTechSheet(Number(card.dataset.productId));
    }
  });
}

if (techModalAddBtn) {
  techModalAddBtn.addEventListener("click", () => {
    if (activeTechProductId === null) return;
    addProductToCart(activeTechProductId);
    closeTechSheet();
    openCart();
  });
}

const closeTechBtn = document.getElementById("close-tech-btn");
if (closeTechBtn) closeTechBtn.addEventListener("click", closeTechSheet);

if (cartItemsEl) {
  cartItemsEl.addEventListener("click", (e) => {
    const inc = e.target.closest("[data-inc]");
    const dec = e.target.closest("[data-dec]");
    if (inc) {
      const item = cart.find((i) => i.id === Number(inc.dataset.inc));
      if (item) item.qty += 1;
    }
    if (dec) {
      cart = cart
        .map((i) => (i.id === Number(dec.dataset.dec) ? { ...i, qty: i.qty - 1 } : i))
        .filter((i) => i.qty > 0);
    }
    saveAndRenderCart();
  });
}

const openCartBtn = document.getElementById("open-cart-btn");
const closeCartBtn = document.getElementById("close-cart-btn");
if (openCartBtn) openCartBtn.addEventListener("click", openCart);
if (closeCartBtn) closeCartBtn.addEventListener("click", closeCart);
if (backdrop) backdrop.addEventListener("click", closeAllOverlays);

const checkoutBtn = document.getElementById("checkout-btn");
if (checkoutBtn) {
  checkoutBtn.addEventListener("click", () => {
    if (!cart.length) {
      if (checkoutMsgEl) {
        checkoutMsgEl.textContent = "Agregá al menos un insumo antes de finalizar.";
      }
      return;
    }

    const customerName = customerNameEl ? customerNameEl.value.trim() : "";
    const customerLocation = customerLocationEl ? customerLocationEl.value.trim() : "";

    if (!customerName || !customerLocation) {
      if (checkoutMsgEl) {
        checkoutMsgEl.textContent = "Completá tu nombre o comercio y la localidad antes de enviar.";
      }
      return;
    }

    const selectedIntentEl = document.querySelector('input[name="cart-intent"]:checked');
    const intent = selectedIntentEl ? selectedIntentEl.value : "Pedido";
    const introLine =
      intent === "Consulta"
        ? "Hola, quisiera realizar una CONSULTA sobre los siguientes insumos:"
        : "Hola, quisiera coordinar el siguiente PEDIDO:";

    const total = cart.reduce((acc, item) => acc + item.price * item.qty, 0);
    const lines = cart.map(
      (i) => `• ${i.qty} x ${i.name} (${i.unit}) — ${formatUYU(i.price * i.qty)}`
    );
    const message = [
      introLine,
      `Tipo: ${intent}`,
      `Cliente / Comercio: ${customerName}`,
      `Localidad / envío: ${customerLocation}`,
      "",
      ...lines,
      `Subtotal estimado: ${formatUYU(total)}`
    ].join("\n");

    const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
    if (checkoutMsgEl) {
      checkoutMsgEl.textContent = `Abriendo WhatsApp con el detalle:\n${lines.join("\n")}\nSubtotal estimado: ${formatUYU(total)}`;
    }
    window.open(waUrl, "_blank", "noopener,noreferrer");
  });
}

const contactForm = document.getElementById("contact-form");
if (contactForm) {
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const empresa = String(formData.get("empresa") || "").trim();
    const telefono = String(formData.get("telefono") || "").trim();
    const mensaje = String(formData.get("mensaje") || "").trim();

    const text = [
      "Hola, quisiera realizar una consulta comercial:",
      `Nombre o comercio: ${empresa}`,
      `Teléfono / WhatsApp: ${telefono}`,
      `Detalle: ${mensaje}`
    ].join("\n");

    const waUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
    const feedbackEl = document.getElementById("contact-feedback");
    if (feedbackEl) {
      feedbackEl.textContent = "Abriendo WhatsApp con tu consulta...";
    }
    window.open(waUrl, "_blank", "noopener,noreferrer");
    e.target.reset();
  });
}

ensurePanelsVisible();
setActiveCategory(activeCategory);
saveAndRenderCart();
updateUIState(0);
