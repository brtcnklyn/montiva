// MONTIVA — localStorage veri katmanı. seed.js'ten sonra yüklenmeli.
// Admin panelindeki değişiklikler burada saklanır ve tüm sayfalar buradan okur.
const DB = (() => {
  const K = { site: "montiva_site", products: "montiva_products", content: "montiva_content",
              orders: "montiva_orders", cart: "montiva_cart", messages: "montiva_messages",
              returns: "montiva_returns", version: "montiva_seed_version" };

  function load(key, def) {
    try { const v = JSON.parse(localStorage.getItem(key)); return v == null ? def : v; }
    catch { return def; }
  }
  function save(key, val) { localStorage.setItem(key, JSON.stringify(val)); }

  // ---- ilk açılışta tohumla / katalog sürümü değiştiyse yenile ----
  function ensureSeed() {
    const cur = typeof SEED_VERSION === "number" ? SEED_VERSION : 1;
    const stored = parseInt(localStorage.getItem(K.version) || "0", 10);
    if (stored < cur) {
      // yeni katalog yayınlandı → ürün, içerik ve site ayarlarını tazele.
      // Siparişler, mesajlar ve sepet olduğu gibi korunur.
      const prevSite = load(K.site, {});
      save(K.products, DEFAULT_PRODUCTS);
      save(K.content, DEFAULT_CONTENT);
      // yöneticinin kendi girdiği iletişim/marka bilgilerini koru
      const keep = {};
      ["brand", "phone", "email", "address", "adminPass", "arBase"].forEach(k => {
        if (prevSite && prevSite[k]) keep[k] = prevSite[k];
      });
      save(K.site, { ...DEFAULT_SITE, ...keep });
      // eski katalogdan kalan sepet satırlarını temizle (artık var olmayan ürünler)
      const ids = new Set(DEFAULT_PRODUCTS.map(p => p.id));
      const cart = load(K.cart, []).filter(r => ids.has(r.id));
      save(K.cart, cart);
      localStorage.setItem(K.version, String(cur));
      return;
    }
    if (localStorage.getItem(K.site) == null) save(K.site, DEFAULT_SITE);
    if (localStorage.getItem(K.products) == null) save(K.products, DEFAULT_PRODUCTS);
    if (localStorage.getItem(K.content) == null) save(K.content, DEFAULT_CONTENT);
  }
  ensureSeed();

  return {
    K,
    site: () => ({ ...DEFAULT_SITE, ...load(K.site, {}) }),
    saveSite: (s) => save(K.site, s),
    products: () => load(K.products, DEFAULT_PRODUCTS),
    activeProducts: () => load(K.products, DEFAULT_PRODUCTS).filter(p => p.active !== false),
    saveProducts: (arr) => save(K.products, arr),
    content: () => load(K.content, DEFAULT_CONTENT),
    saveContent: (c) => save(K.content, c),
    orders: () => load(K.orders, []),
    saveOrders: (o) => save(K.orders, o),
    addOrder: (o) => { const a = load(K.orders, []); a.push(o); save(K.orders, a); },
    messages: () => load(K.messages, []),
    addMessage: (m) => { const a = load(K.messages, []); a.push(m); save(K.messages, a); },
    // ---- iade talepleri ----
    returns: () => load(K.returns, []),
    saveReturns: (r) => save(K.returns, r),
    addReturn: (r) => { const a = load(K.returns, []); a.push(r); save(K.returns, a); },
    // sipariş no + e-posta ile sipariş bul (takip / iade doğrulaması)
    findOrder: (no, email) => {
      const n = String(no || "").trim().toUpperCase();
      const e = String(email || "").trim().toLowerCase();
      return load(K.orders, []).find(o =>
        String(o.no).toUpperCase() === n && String(o.email || "").toLowerCase() === e) || null;
    },
    resetAll: () => {
      save(K.site, DEFAULT_SITE); save(K.products, DEFAULT_PRODUCTS); save(K.content, DEFAULT_CONTENT);
      localStorage.setItem(K.version, String(typeof SEED_VERSION === "number" ? SEED_VERSION : 1));
    },
    // stok düş (sipariş sonrası)
    decrementStock: (items) => {
      const ps = load(K.products, DEFAULT_PRODUCTS);
      items.forEach(it => { const p = ps.find(x => x.id === it.id); if (p) p.stock = Math.max(0, p.stock - it.qty); });
      save(K.products, ps);
    }
  };
})();

// ---- global canlı veriler (tüm sayfalar bunları kullanır) ----
let SITE = DB.site();
let PRODUCTS = DB.activeProducts();
let CONTENT = DB.content();

function getProduct(id) { return DB.products().find(p => p.id === id); }
function fmtPrice(n) {
  return (SITE.currency || "₺") + " " + Number(n).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// [data-content="home.heroLead"] gibi işaretli öğeleri CONTENT'ten doldurur
function applyContent(root = document) {
  root.querySelectorAll("[data-content]").forEach(el => {
    const path = el.getAttribute("data-content").split(".");
    let v = CONTENT;
    for (const k of path) { v = v && v[k]; }
    if (typeof v === "string") el.innerHTML = v;
  });
}
