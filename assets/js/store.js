// MONTIVA — ortak arayüz + sepet mantığı (db.js'e bağlı)
const CART_KEY = "montiva_cart";

/* ---------------- sepet ---------------- */
function getCart() { try { return JSON.parse(localStorage.getItem(CART_KEY)) || []; } catch { return []; } }
function saveCart(cart) { localStorage.setItem(CART_KEY, JSON.stringify(cart)); updateCartBadge(); }
function addToCart(id, qty = 1) {
  const p = getProduct(id);
  if (!p) return;
  if (p.stock <= 0) { toast("⚠️ Bu ürün geçici olarak stokta yok"); return; }
  const cart = getCart();
  const row = cart.find(r => r.id === id);
  if (row) row.qty = Math.min(row.qty + qty, p.stock);
  else cart.push({ id, qty: Math.min(qty, p.stock) });
  saveCart(cart);
  toast(`<b>${p.name} (${p.color})</b> sepete eklendi ✓`);
}
function setQty(id, qty) {
  const p = getProduct(id);
  let cart = getCart();
  const row = cart.find(r => r.id === id);
  if (!row) return;
  qty = Math.max(0, Math.min(qty, p ? p.stock : 99));
  if (qty === 0) cart = cart.filter(r => r.id !== id);
  else row.qty = qty;
  saveCart(cart);
}
function removeFromCart(id) { saveCart(getCart().filter(r => r.id !== id)); }
function cartCount() { return getCart().reduce((s, r) => s + r.qty, 0); }
function cartTotal() { return getCart().reduce((s, r) => { const p = getProduct(r.id); return s + (p ? p.price * r.qty : 0); }, 0); }
function updateCartBadge() {
  const el = document.querySelector(".cart-count");
  if (el) { const n = cartCount(); el.textContent = n; el.style.display = n ? "grid" : "none"; }
}

/* ---------------- toast ---------------- */
let toastTimer;
function toast(html) {
  let t = document.getElementById("toast");
  if (!t) { t = document.createElement("div"); t.id = "toast"; document.body.appendChild(t); }
  t.innerHTML = html; t.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove("show"), 2600);
}

/* ---------------- ortak header / footer ---------------- */
function renderChrome(active) {
  const year = new Date().getFullYear();
  const header = `
  <div class="topbar">
    <div class="container">
      <div>${icon("zap", 14)} <b>${SITE.freeShippingLimit} TL üzeri ücretsiz kargo</b> — Türkiye'nin her yerine</div>
      <div>${icon("refresh", 14)} Tüm ürünlerde yedek parça desteği &nbsp;•&nbsp; ${icon("phone", 14)} ${SITE.phone}</div>
    </div>
  </div>
  <header class="site">
    <div class="container">
      <a class="logo" href="index.html"><span class="mark">▣</span><span>${SITE.brand}<small>DEMONTE MOBİLYA</small></span></a>
      <button class="burger" onclick="document.querySelector('nav.main').classList.toggle('open')">${icon("menu", 24)}</button>
      <nav class="main">
        <a href="index.html" ${active === "home" ? 'class="active"' : ""}>Ana Sayfa</a>
        <a href="urunler.html" id="nav-urunler" class="has-caret ${active === "products" ? "active" : ""}">Ürünler ${icon("chevron", 15)}</a>
        <a href="hakkimizda.html" ${active === "about" ? 'class="active"' : ""}>Hakkımızda</a>
        <a href="sss.html" ${active === "faq" ? 'class="active"' : ""}>S.S.S.</a>
        <a href="iletisim.html" ${active === "contact" ? 'class="active"' : ""}>İletişim</a>
      </nav>
      <a href="sepet.html"><button class="cart-btn">${icon("cart", 18)} <span class="lbl">Sepet</span><span class="cart-count">0</span></button></a>
    </div>
    ${buildMega()}
  </header>`;

  const footer = `
  <footer class="site">
    <div class="container">
      <div class="grid">
        <div>
          <a class="logo" href="index.html" style="margin-bottom:14px"><span class="mark">▣</span><span>${SITE.brand}<small>DEMONTE MOBİLYA</small></span></a>
          <p>Kendi üretimimiz demonte mobilyaları, anlaşılır montaj kılavuzları ve 3D önizleme ile kapınıza getiriyoruz. ${SITE.slogan}</p>
        </div>
        <div>
          <h4>Mağaza</h4>
          <a href="urunler.html">Tüm Ürünler</a>
          <a href="sepet.html">Sepetim</a>
          <a href="sss.html">Sıkça Sorulan Sorular</a>
        </div>
        <div>
          <h4>Kurumsal</h4>
          <a href="hakkimizda.html">Hakkımızda</a>
          <a href="destek.html">Satış Sonrası Destek</a>
          <a href="iletisim.html">İletişim</a>
          <a href="kvkk.html">KVKK & Gizlilik</a>
        </div>
        <div>
          <h4>Destek</h4>
          <p>${icon("mail", 15)} ${SITE.email}<br>${icon("phone", 15)} ${SITE.phone}<br>${icon("bot", 15)} 7/24 Yapay Zekâ Canlı Destek</p>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© ${year} ${SITE.brand} — Tüm hakları saklıdır.</span>
        <span>Güvenli ödeme: Visa • Mastercard • Troy &nbsp;•&nbsp; <a href="admin.html" style="opacity:.5">Yönetim</a></span>
      </div>
    </div>
  </footer>`;

  document.body.insertAdjacentHTML("afterbegin", header);
  document.body.insertAdjacentHTML("beforeend", footer);
  updateCartBadge();
  applyContent(document);
  attachMega();
}

/* ---------------- mega menü (kategoriler + görseller) ---------------- */
function megaGroups() {
  const g = {};
  PRODUCTS.forEach(p => { const c = p.category || "Diğer"; (g[c] = g[c] || []).push(p); });
  return g;
}
function buildMega() {
  const g = megaGroups();
  const cats = Object.keys(g);
  if (!cats.length) return "";
  const catList = cats.map((c, i) => `
    <a class="mega-cat ${i === 0 ? "active" : ""}" data-cat="${encodeURIComponent(c)}" href="urunler.html?cat=${encodeURIComponent(c)}">
      <span>${c}</span><small>${g[c].length} ürün ${icon("arrowRight", 14)}</small>
    </a>`).join("") +
    `<a class="mega-cat all" href="urunler.html"><span>Tüm Ürünler</span><small>${PRODUCTS.length} ürün ${icon("arrowRight", 14)}</small></a>`;
  return `
  <div class="mega" id="mega">
    <div class="mega-inner">
      <div class="mega-cats" id="mega-cats">${catList}</div>
      <div class="mega-preview" id="mega-preview"></div>
    </div>
  </div>`;
}
function megaPreview(cat) {
  const g = megaGroups();
  const items = g[cat] || [];
  const box = document.getElementById("mega-preview");
  if (!box) return;
  box.innerHTML = `
    <div class="mega-head"><b>${cat}</b>
      <a href="urunler.html?cat=${encodeURIComponent(cat)}">Kategoriyi Gör ${icon("arrowRight", 13)}</a></div>
    <div class="mega-grid">
      ${items.slice(0, 4).map(p => `
        <a class="mega-prod" href="urun.html?id=${p.id}">
          <div class="mega-thumb"><img src="${p.images[0]}" alt="${p.name}" loading="lazy"></div>
          <div class="mega-info"><b>${p.name}</b><span>${p.color} • ${fmtPrice(p.price)}</span></div>
        </a>`).join("")}
    </div>`;
}
function attachMega() {
  const trigger = document.getElementById("nav-urunler");
  const mega = document.getElementById("mega");
  if (!trigger || !mega) return;
  const header = document.querySelector("header.site");
  const placeMega = () => { mega.style.top = header.offsetHeight + "px"; };
  placeMega();
  window.addEventListener("resize", placeMega);
  const cats = Object.keys(megaGroups());
  if (cats.length) megaPreview(cats[0]);
  let t;
  const open = () => {
    clearTimeout(t); placeMega(); mega.classList.add("open");
    mega.style.opacity = "1"; mega.style.visibility = "visible"; mega.style.transform = "translateY(0)"; mega.style.pointerEvents = "auto";
  };
  const close = () => {
    t = setTimeout(() => {
      mega.classList.remove("open");
      mega.style.opacity = "0"; mega.style.visibility = "hidden"; mega.style.transform = "translateY(-8px)"; mega.style.pointerEvents = "none";
    }, 160);
  };
  [trigger, mega].forEach(el => { el.addEventListener("mouseenter", open); el.addEventListener("mouseleave", close); });
  mega.querySelectorAll(".mega-cat[data-cat]").forEach(a => {
    a.addEventListener("mouseenter", () => {
      mega.querySelectorAll(".mega-cat").forEach(x => x.classList.remove("active"));
      a.classList.add("active");
      megaPreview(decodeURIComponent(a.dataset.cat));
    });
  });
}

/* ---------------- ürün kartı ---------------- */
function productCardHTML(p) {
  const disc = Math.round((1 - p.price / p.listPrice) * 100);
  const isMint = /mint/i.test(p.color);
  const out = p.stock <= 0;
  const low = p.stock > 0 && p.stock <= 5;
  return `
  <article class="card">
    ${p.badge ? `<span class="badge ${isMint ? "mint" : ""}">${p.badge}</span>` : ""}
    <span class="chip-3d">${icon("cube", 13)} 3D</span>
    <a class="imgwrap" href="urun.html?id=${p.id}"><img src="${p.images[0]}" alt="${p.name} ${p.color}" loading="lazy"></a>
    <div class="body">
      <span class="color">${p.color}</span>
      <h3><a href="urun.html?id=${p.id}">${p.name}</a></h3>
      <div class="prices">
        <span class="price">${fmtPrice(p.price)}</span>
        <span class="old-price">${fmtPrice(p.listPrice)}</span>
        <span class="discount-tag">%${disc}</span>
      </div>
      ${out ? `<span class="stock-mini low">Stokta yok</span>` : low ? `<span class="stock-mini low">Son ${p.stock} adet!</span>` : `<span class="stock-mini ok">Stokta</span>`}
      <button class="add" ${out ? "disabled" : ""} onclick="addToCart('${p.id}')">${out ? "Stokta Yok" : icon("cart", 17) + " Sepete Ekle"}</button>
    </div>
  </article>`;
}
