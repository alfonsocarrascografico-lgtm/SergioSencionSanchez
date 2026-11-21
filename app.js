const stage = document.getElementById("horizontal-stage");
const panels = Array.from(document.querySelectorAll(".panel"));
const navLinks = Array.from(document.querySelectorAll(".nav-link"));
const mobileLinks = Array.from(document.querySelectorAll(".mobile-link"));
const progressFill = document.getElementById("scroll-progress");
const panelIndicator = document.getElementById("panel-indicator");

const mobileMenuBtn = document.getElementById("mobile-menu-btn");
const mobileDrawer = document.getElementById("mobile-drawer");
const cartDrawer = document.getElementById("cart-drawer");
const backdrop = document.getElementById("backdrop");

const MOBILE_BREAKPOINT = 860;
const MOBILE_TOPBAR_H = 66;
const WHATSAPP_NUMBER = "59899703667";
let currentIndex = 0;
let wheelLock = false;

const isMobile = () => window.innerWidth <= MOBILE_BREAKPOINT;

function ensurePanelsVisible() {
  panels.forEach((panel) => panel.classList.add("is-visible"));
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

function openCart() {
  if (!cartDrawer || !backdrop) return;
  closeMobileMenu();
  cartDrawer.classList.add("open");
  cartDrawer.setAttribute("aria-hidden", "false");
  backdrop.hidden = false;
}

function closeCart() {
  if (!cartDrawer || !backdrop) return;
  cartDrawer.classList.remove("open");
  cartDrawer.setAttribute("aria-hidden", "true");
  backdrop.hidden = true;
}

function updateUIState(index) {
  if (!panels.length) return;
  const clamped = Math.max(0, Math.min(panels.length - 1, index));
  currentIndex = clamped;

  navLinks.forEach((link, idx) => link.classList.toggle("active", idx === clamped));
  mobileLinks.forEach((link, idx) => link.classList.toggle("active", idx === clamped));

  if (panelIndicator) {
    panelIndicator.textContent = `${String(clamped + 1).padStart(2, "0")} / ${String(panels.length).padStart(2, "0")}`;
  }

  if (progressFill && !isMobile()) {
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

if (stage) {
  stage.addEventListener(
    "wheel",
    (e) => {
      if (isMobile()) return;
      if (cartDrawer && cartDrawer.classList.contains("open")) return;
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
        if (isMobile()) {
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
    closeCart();
    closeMobileMenu();
  }
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

  if (e.key === "ArrowRight") goToPanel(currentIndex + 1);
  if (e.key === "ArrowLeft") goToPanel(currentIndex - 1);
});

window.addEventListener("resize", () => {
  ensurePanelsVisible();
  if (!isMobile()) {
    closeMobileMenu();
    if (stage) {
      stage.scrollLeft = currentIndex * window.innerWidth;
    }
  }
});

/* --- CATÁLOGO DE PRODUCTOS (ESCALABLE PARA CRECIMIENTO VERTICAL) --- */
const PRODUCTS = [
  {
    id: 1,
    name: "Molino Dolores Fideera",
    unit: "Bolsa 25 kg · Pastera A",
    category: "harinas",
    price: 1250,
    image: "harinaamarillaparatiendaweb.jpg"
  },
  {
    id: 2,
    name: "Molino Dolores Panadera",
    unit: "Bolsa 25 kg · Panadera C",
    category: "harinas",
    price: 1180,
    image: "IMG_20260418_110003-eZDuHPR7S_vpUngCIHLtUA.jpg"
  },
  {
    id: 3,
    name: "Molino Dolores Panadera Verde",
    unit: "Bolsa 25 kg · Panadera C",
    category: "harinas",
    price: 1190,
    image: "IMG_20260418_110515-WoUc_N1egkx198m2ki3LVQ.jpg"
  },
  {
    id: 4,
    name: "Molino Dolores Panadera Superior",
    unit: "Bolsa 25 kg · Panadera B",
    category: "harinas",
    price: 1290,
    image: "IMG_20260418_112549_1-Zy2K2zDtGtg8hqCtUgWlAw.jpg"
  },
  {
    id: 5,
    name: "Easy Prepizza",
    unit: "Bolsa 10 kg",
    category: "harinas",
    price: 1380,
    image: "easypizza.webp"
  },
  {
    id: 6,
    name: "Easy Salvado",
    unit: "Bolsa 5 kg",
    category: "especiales",
    price: 980,
    image: "easysalvado.webp"
  },
  {
    id: 7,
    name: "Easy Pan Blanco tipo Artesanal",
    unit: "Bolsa 10 kg",
    category: "especiales",
    price: 1420,
    image: "easypanblanco.webp"
  },
  {
    id: 8,
    name: "Easy Multicereal Plus",
    unit: "Bolsa 5 kg",
    category: "especiales",
    price: 1190,
    image: "easymulticereal.webp"
  },
  {
    id: 9,
    name: "Harina de Almendras",
    unit: "Bolsa 1 kg",
    category: "harinas",
    price: 1490,
    image: "harinadealmendras.webp"
  },
  {
    id: 10,
    name: "Patis´omalt",
    unit: "Balde 4 kg",
    category: "reposteria",
    price: 1220,
    image: "patisomalt.webp"
  },
  {
    id: 11,
    name: "praline de avellanas",
    unit: "Balde 5 kg",
    category: "reposteria",
    price: 1540,
    image: "pralinedeavellanas.webp"
  },
  {
    id: 12,
    name: "Almendras fileteadas",
    unit: "Bolsa 1 kg",
    category: "reposteria",
    price: 610,
    image: "almendrasfileteadas.webp"
  }
];

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
let activeCategory = "todos";

const productGrid = document.getElementById("product-grid");
const cartItemsEl = document.getElementById("cart-items");
const cartCountEl = document.getElementById("cart-count");
const cartTotalEl = document.getElementById("cart-total");
const checkoutMsgEl = document.getElementById("checkout-msg");
const customerNameEl = document.getElementById("cart-customer-name");
const customerLocationEl = document.getElementById("cart-customer-location");

const formatUYU = (n) => `$${Number(n || 0).toLocaleString("es-UY")}`;

function renderMediaBlock(product) {
  if (product.image) {
    return `<img src="${product.image}" alt="${product.name}" class="product-thumb" loading="lazy" />`;
  }
  return `<div class="product-thumb-placeholder">Insumo · ${product.category}</div>`;
}

function renderProducts() {
  if (!productGrid) return;
  const list =
    activeCategory === "todos"
      ? PRODUCTS
      : PRODUCTS.filter((p) => p.category === activeCategory);

  if (!list.length) {
    productGrid.innerHTML = "<p>No hay insumos cargados en esta categoría todavía.</p>";
    return;
  }

  productGrid.innerHTML = list
    .map(
      (p) => `
      <article class="product-card">
        <div>
          <div class="product-thumb-wrap">
            ${renderMediaBlock(p)}
          </div>
          <span class="product-meta">${p.unit}</span>
          <h3>${p.name}</h3>
        </div>
        <div>
          <div class="product-price">${formatUYU(p.price)}</div>
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
    document.querySelectorAll(".filter-pill").forEach((p) => p.classList.remove("active"));
    pill.classList.add("active");
    activeCategory = pill.dataset.category;
    renderProducts();
  });
});

if (productGrid) {
  productGrid.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-add]");
    if (!btn) return;
    const id = Number(btn.dataset.add);
    const product = PRODUCTS.find((p) => p.id === id);
    if (!product) return;
    const found = cart.find((item) => item.id === id);
    if (found) found.qty += 1;
    else cart.push({ ...product, qty: 1 });
    saveAndRenderCart();
  });
}

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
if (backdrop) backdrop.addEventListener("click", closeCart);

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
renderProducts();
saveAndRenderCart();
updateUIState(0);