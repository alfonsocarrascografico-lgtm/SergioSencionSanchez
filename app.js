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
let currentIndex = 0;
let wheelLock = false;

const isMobile = () => window.innerWidth <= MOBILE_BREAKPOINT;

function closeMobileMenu() {
  mobileDrawer.classList.remove("open");
  mobileDrawer.setAttribute("aria-hidden", "true");
  mobileMenuBtn.setAttribute("aria-expanded", "false");
}

function toggleMobileMenu() {
  const willOpen = !mobileDrawer.classList.contains("open");
  mobileDrawer.classList.toggle("open", willOpen);
  mobileDrawer.setAttribute("aria-hidden", String(!willOpen));
  mobileMenuBtn.setAttribute("aria-expanded", String(willOpen));
}

function openCart() {
  closeMobileMenu();
  cartDrawer.classList.add("open");
  cartDrawer.setAttribute("aria-hidden", "false");
  backdrop.hidden = false;
}

function closeCart() {
  cartDrawer.classList.remove("open");
  cartDrawer.setAttribute("aria-hidden", "true");
  backdrop.hidden = true;
}

function updateUIState(index) {
  currentIndex = index;
  navLinks.forEach((link, idx) => link.classList.toggle("active", idx === index));
  mobileLinks.forEach((link, idx) => link.classList.toggle("active", idx === index));
  panelIndicator.textContent = `${String(index + 1).padStart(2, "0")} / ${String(panels.length).padStart(2, "0")}`;

  if (!isMobile()) {
    const pct = (index / (panels.length - 1)) * 100;
    progressFill.style.width = `${pct}%`;
  }
}

function goToPanel(index) {
  const clamped = Math.max(0, Math.min(panels.length - 1, index));
  closeMobileMenu();

  if (!isMobile()) {
    stage.scrollTo({
      left: clamped * window.innerWidth,
      behavior: "smooth"
    });
  } else {
    const topOffset = panels[clamped].offsetTop - MOBILE_TOPBAR_H;
    window.scrollTo({
      top: Math.max(0, topOffset),
      behavior: "smooth"
    });
  }
  updateUIState(clamped);
}

stage.addEventListener(
  "wheel",
  (e) => {
    if (isMobile()) return;
    if (cartDrawer.classList.contains("open")) return;
    if (Math.abs(e.deltaY) < 10 && Math.abs(e.deltaX) < 10) return;

    const currentPanel = panels[currentIndex];
    const hasVerticalOverflow = currentPanel && currentPanel.scrollHeight > currentPanel.clientHeight + 4;

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
  if (maxScroll > 0) {
    progressFill.style.width = `${(stage.scrollLeft / maxScroll) * 100}%`;
  }
  const idx = Math.round(stage.scrollLeft / window.innerWidth);
  if (idx !== currentIndex) {
    updateUIState(idx);
  }
});

window.addEventListener("scroll", () => {
  if (!isMobile()) return;
  const docHeight = document.documentElement.scrollHeight - window.innerHeight;
  if (docHeight > 0) {
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

mobileMenuBtn.addEventListener("click", toggleMobileMenu);
document.getElementById("prev-panel").addEventListener("click", () => goToPanel(currentIndex - 1));
document.getElementById("next-panel").addEventListener("click", () => goToPanel(currentIndex + 1));

window.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    closeCart();
    closeMobileMenu();
  }
  if (isMobile()) return;
  if (["INPUT", "TEXTAREA"].includes(document.activeElement.tagName)) return;

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
  if (!isMobile()) {
    closeMobileMenu();
    stage.scrollLeft = currentIndex * window.innerWidth;
  }
});

/* --- CATÁLOGO DE PRODUCTOS (4 NUEVOS ARRIBA + 4 ANTERIORES DEBAJO) --- */
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
  }
];

const CART_KEY = "sss_horizontal_cart_v3";
let cart = JSON.parse(localStorage.getItem(CART_KEY) || "[]");
let activeCategory = "todos";

const productGrid = document.getElementById("product-grid");
const cartItemsEl = document.getElementById("cart-items");
const cartCountEl = document.getElementById("cart-count");
const cartTotalEl = document.getElementById("cart-total");
const checkoutMsgEl = document.getElementById("checkout-msg");

const formatUYU = (n) => `$${n.toLocaleString("es-UY")}`;

function renderMediaBlock(product) {
  if (product.image) {
    return `<img src="${product.image}" alt="${product.name}" class="product-thumb" />`;
  }
  return `<div class="product-thumb-placeholder">Insumo · ${product.category}</div>`;
}

function renderProducts() {
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
  localStorage.setItem(CART_KEY, JSON.stringify(cart));
  const qty = cart.reduce((acc, item) => acc + item.qty, 0);
  const total = cart.reduce((acc, item) => acc + item.price * item.qty, 0);

  cartCountEl.textContent = qty;
  cartTotalEl.textContent = formatUYU(total);

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

productGrid.addEventListener("click", (e) => {
  const btn = e.target.closest("[data-add]");
  if (!btn) return;
  const id = Number(btn.dataset.add);
  const product = PRODUCTS.find((p) => p.id === id);
  const found = cart.find((item) => item.id === id);
  if (found) found.qty += 1;
  else cart.push({ ...product, qty: 1 });
  saveAndRenderCart();
});

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

document.getElementById("open-cart-btn").addEventListener("click", openCart);
document.getElementById("close-cart-btn").addEventListener("click", closeCart);
backdrop.addEventListener("click", closeCart);

document.getElementById("checkout-btn").addEventListener("click", () => {
  if (!cart.length) {
    checkoutMsgEl.textContent = "Agregá al menos un insumo antes de finalizar.";
    return;
  }
  const summary = cart
    .map((i) => `• ${i.qty} x ${i.name} (${i.unit}) — ${formatUYU(i.price * i.qty)}`)
    .join("\n");
  checkoutMsgEl.textContent = `Detalle listo para enviar:\n${summary}`;
});

document.getElementById("contact-form").addEventListener("submit", (e) => {
  e.preventDefault();
  document.getElementById("contact-feedback").textContent =
    "Consulta preparada. Podés conectarla a tu endpoint PHP o WhatsApp.";
  e.target.reset();
});

renderProducts();
saveAndRenderCart();
updateUIState(0);
