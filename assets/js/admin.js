// MONTIVA — Admin Paneli motoru (db.js'e bağlı). Tüm veriler localStorage'da.
(function () {
  const AUTH_KEY = "montiva_admin_auth";
  const app = () => document.getElementById("admin-app");
  const esc = s => String(s == null ? "" : s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  const money = n => "₺" + Number(n || 0).toLocaleString("tr-TR", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  let state = { view: "dashboard", products: [], content: null, site: null };
  let pendingUpload = { glb: null, usdz: null };

  // masaüstünden 3D dosyası seç → veri olarak sakla (data URL)
  function onModelFile(type) {
    const inp = document.getElementById(type === "glb" ? "m-model-file" : "m-usdz-file");
    const file = inp.files && inp.files[0];
    if (!file) return;
    if (file.size > 6 * 1024 * 1024) { toast("⚠️ Dosya çok büyük (~6MB üzeri). Daha küçük bir model kullanın."); inp.value = ""; return; }
    const r = new FileReader();
    r.onload = () => {
      pendingUpload[type] = r.result;
      document.getElementById(type === "glb" ? "m-model-name" : "m-usdz-name").textContent = file.name + " ✓ (kaydedince uygulanır)";
    };
    r.readAsDataURL(file);
  }

  // hero arka plan görseli seç
  function onHeroFile() {
    const f = document.getElementById("s-heroimg-file").files[0];
    if (!f) return;
    if (f.size > 4 * 1024 * 1024) { toast("⚠️ Görsel çok büyük (~4MB üzeri). Daha küçük bir görsel seçin."); return; }
    const r = new FileReader();
    r.onload = () => {
      document.getElementById("s-heroimg").value = r.result;
      document.getElementById("s-heroimg-name").textContent = f.name + " ✓ (kaydedince uygulanır)";
    };
    r.readAsDataURL(f);
  }

  /* ================= GİRİŞ ================= */
  function isAuthed() { return sessionStorage.getItem(AUTH_KEY) === "1"; }
  function renderLogin(err) {
    app().innerHTML = `
      <div class="admin-login">
        <div class="box">
          <div class="mark">▣</div>
          <h1>${esc(DB.site().brand)} Yönetim</h1>
          <p>Devam etmek için yönetici şifrenizi girin</p>
          <div class="field"><input id="adm-pass" type="password" placeholder="Şifre" style="text-align:center"></div>
          ${err ? `<div class="demo-note" style="margin-bottom:12px">❌ Hatalı şifre, tekrar deneyin.</div>` : ""}
          <button class="btn btn-primary" style="width:100%" id="adm-login">Giriş Yap →</button>
          <p style="margin-top:16px;font-size:.76rem">Varsayılan şifre: <b>montiva2026</b> (Ayarlar'dan değiştirin)</p>
        </div>
      </div>`;
    const tryLogin = () => {
      const v = document.getElementById("adm-pass").value;
      if (v === DB.site().adminPass) { sessionStorage.setItem(AUTH_KEY, "1"); boot(); }
      else renderLogin(true);
    };
    document.getElementById("adm-login").onclick = tryLogin;
    document.getElementById("adm-pass").addEventListener("keydown", e => { if (e.key === "Enter") tryLogin(); });
    document.getElementById("adm-pass").focus();
  }
  function logout() { sessionStorage.removeItem(AUTH_KEY); renderLogin(); }

  /* ================= KABUK ================= */
  const NAV = [
    { id: "dashboard", icon: "📊", label: "Panel" },
    { id: "products", icon: "📦", label: "Ürünler & Stok" },
    { id: "orders", icon: "🧾", label: "Siparişler" },
    { id: "messages", icon: "✉️", label: "Mesajlar" },
    { id: "content", icon: "📝", label: "Sayfa Metinleri" },
    { id: "settings", icon: "⚙️", label: "Ayarlar" }
  ];
  function renderApp() {
    app().innerHTML = `
      <div class="admin">
        <aside class="admin-side">
          <div class="brand"><span class="mark">▣</span> ${esc(DB.site().brand)}</div>
          ${NAV.map(n => `<a data-view="${n.id}">${n.icon} ${n.label}</a>`).join("")}
          <div class="sep"></div>
          <a href="index.html" target="_blank">🌐 Siteyi Aç</a>
          <a class="logout" id="adm-logout">🚪 Çıkış Yap</a>
        </aside>
        <main class="admin-main">
          <div id="admin-view"></div>
        </main>
      </div>`;
    app().querySelectorAll(".admin-side a[data-view]").forEach(a =>
      a.onclick = () => switchView(a.dataset.view));
    document.getElementById("adm-logout").onclick = logout;
    switchView(state.view);
  }
  function switchView(v) {
    state.view = v;
    app().querySelectorAll(".admin-side a[data-view]").forEach(a => a.classList.toggle("active", a.dataset.view === v));
    ({ dashboard: renderDashboard, products: renderProducts, orders: renderOrders,
       messages: renderMessages, content: renderContent, settings: renderSettings }[v])();
  }
  function setView(html) { document.getElementById("admin-view").innerHTML = html; }
  function topbar(title, sub) { return `<div class="admin-topbar"><div><h1>${title}</h1><div class="sub">${sub}</div></div></div>`; }

  /* ================= PANEL ================= */
  function renderDashboard() {
    const ps = DB.products(), orders = DB.orders(), msgs = DB.messages();
    const totalStock = ps.reduce((s, p) => s + (p.stock || 0), 0);
    const revenue = orders.reduce((s, o) => s + (parseFloat(String(o.total).replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", ".")) || 0), 0);
    const low = ps.filter(p => p.stock <= 5);
    const newOrders = orders.filter(o => (o.status || "Yeni") === "Yeni").length;
    setView(`
      ${topbar("Panel", "Mağazanızın genel durumu")}
      <div class="stat-grid">
        <div class="stat"><div class="ic">📦</div><b>${ps.length}</b><span>Aktif ürün çeşidi</span></div>
        <div class="stat"><div class="ic">🗃️</div><b>${totalStock}</b><span>Toplam stok adedi</span></div>
        <div class="stat"><div class="ic">🧾</div><b>${orders.length}</b><span>Toplam sipariş (${newOrders} yeni)</span></div>
        <div class="stat"><div class="ic">💰</div><b>${money(revenue)}</b><span>Toplam ciro (demo)</span></div>
      </div>
      <div class="panel">
        <div class="panel-head"><div><h2>⚠️ Stok Uyarıları</h2><div class="desc">5 adet ve altına düşen ürünler</div></div></div>
        ${low.length ? `<table class="atable"><thead><tr><th></th><th>Ürün</th><th>Renk</th><th>Kalan</th><th></th></tr></thead><tbody>
          ${low.map(p => `<tr><td><img class="thumb" src="${p.images[0]}"></td><td>${esc(p.name)}</td><td>${esc(p.color)}</td>
            <td><span class="pill ${p.stock <= 0 ? "red" : "amber"}">${p.stock} adet</span></td>
            <td><button class="btn-sm btn-save" onclick="ADMIN.go('products')">Stok Ekle</button></td></tr>`).join("")}
        </tbody></table>` : `<p class="muted">Tüm ürünlerin stoğu yeterli. 👍</p>`}
      </div>
      <div class="panel">
        <div class="panel-head"><div><h2>🧾 Son Siparişler</h2></div><button class="btn-sm btn-save" onclick="ADMIN.go('orders')">Tümünü Gör</button></div>
        ${orders.length ? `<table class="atable"><thead><tr><th>Sipariş No</th><th>Müşteri</th><th>Tutar</th><th>Durum</th><th>Tarih</th></tr></thead><tbody>
          ${orders.slice(-5).reverse().map(o => `<tr><td><b>${esc(o.no)}</b></td><td>${esc(o.name)}</td><td>${esc(o.total)}</td>
            <td>${statusPill(o.status)}</td><td>${new Date(o.date).toLocaleDateString("tr-TR")}</td></tr>`).join("")}
        </tbody></table>` : `<p class="muted">Henüz sipariş yok. Siteden bir test siparişi verip burada görebilirsiniz.</p>`}
      </div>`);
  }
  function statusPill(s) {
    s = s || "Yeni";
    const map = { "Yeni": "blue", "Hazırlanıyor": "amber", "Kargoda": "blue", "Teslim Edildi": "green", "İptal": "red" };
    return `<span class="pill ${map[s] || "grey"}">${esc(s)}</span>`;
  }

  /* ================= ÜRÜNLER & STOK ================= */
  function renderProducts() {
    state.products = structuredClone(DB.products());
    drawProducts();
  }
  function drawProducts() {
    const rows = state.products.map((p, i) => `
      <tr data-i="${i}">
        <td><img class="thumb" src="${p.images[0]}"></td>
        <td><input value="${esc(p.name)}" data-k="name"></td>
        <td><input value="${esc(p.color)}" data-k="color" style="width:120px"></td>
        <td><input class="w-price" type="number" step="0.01" value="${p.price}" data-k="price"></td>
        <td><input class="w-price" type="number" step="0.01" value="${p.listPrice}" data-k="listPrice"></td>
        <td><input class="w-stock" type="number" value="${p.stock}" data-k="stock"></td>
        <td><input value="${esc(p.badge || "")}" data-k="badge" placeholder="—" style="width:110px"></td>
        <td><select data-k="active"><option value="true" ${p.active !== false ? "selected" : ""}>Yayında</option><option value="false" ${p.active === false ? "selected" : ""}>Gizli</option></select></td>
        <td style="white-space:nowrap">
          <button class="icon-btn" title="Detay düzenle" onclick="ADMIN.editProduct(${i})">✏️</button>
          <button class="icon-btn" title="Sil" onclick="ADMIN.deleteProduct(${i})">🗑️</button>
        </td>
      </tr>`).join("");
    setView(`
      ${topbar("Ürünler & Stok", "Fiyat, stok ve durum bilgilerini düzenleyin. Renk bazında stok = her satır.")}
      <div class="panel">
        <div class="panel-head">
          <div><h2>Ürün Listesi</h2><div class="desc">Hücreleri düzenleyip alttaki <b>Kaydet</b> ile uygulayın</div></div>
          <button class="btn btn-primary btn-sm" onclick="ADMIN.newProduct()">+ Yeni Ürün</button>
        </div>
        <table class="atable">
          <thead><tr><th></th><th>Ürün Adı</th><th>Renk</th><th>Fiyat ₺</th><th>Liste ₺</th><th>Stok</th><th>Rozet</th><th>Durum</th><th></th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
        <div class="save-bar">
          <button class="btn btn-ghost btn-sm" onclick="ADMIN.go('products')">Değişiklikleri İptal Et</button>
          <button class="btn btn-primary btn-sm" onclick="ADMIN.saveProducts()">💾 Değişiklikleri Kaydet</button>
        </div>
      </div>`);
    // inputları drafta bağla
    document.querySelectorAll(".atable tr[data-i]").forEach(tr => {
      const i = +tr.dataset.i;
      tr.querySelectorAll("[data-k]").forEach(inp => {
        inp.addEventListener("input", () => {
          const k = inp.dataset.k;
          let v = inp.value;
          if (k === "price" || k === "listPrice") v = parseFloat(v) || 0;
          else if (k === "stock") v = parseInt(v) || 0;
          else if (k === "active") v = v === "true";
          else if (k === "badge") v = v.trim() || null;
          state.products[i][k] = v;
        });
      });
    });
  }
  function saveProducts() { DB.saveProducts(state.products); PRODUCTS = DB.activeProducts(); toast("✅ Ürünler kaydedildi"); switchView("products"); }

  function newProduct() {
    const id = "urun-" + Date.now().toString().slice(-6);
    state.products.push({
      id, name: "Yeni Ürün", color: "Renk", sku: "MNT-" + id.toUpperCase(), price: 0, listPrice: 0, stock: 0,
      badge: "Yeni", active: false, images: ["assets/img/lyra-mint-1.webp"], model: "assets/models/lyra-mint.glb",
      dims: "-", pdf: "assets/pdf/montaj-lyra-mint.pdf", short: "", desc: "", specs: {}, montaj: [], keywords: []
    });
    editProduct(state.products.length - 1);
  }
  function deleteProduct(i) {
    if (!confirm(`"${state.products[i].name} (${state.products[i].color})" ürününü silmek istediğinize emin misiniz?`)) return;
    state.products.splice(i, 1); DB.saveProducts(state.products); PRODUCTS = DB.activeProducts(); toast("🗑️ Ürün silindi"); drawProducts();
  }
  function editProduct(i) {
    const p = state.products[i];
    pendingUpload = { glb: null, usdz: null };
    openModal(`
      <h3>Ürün Detayı — ${esc(p.name)}</h3>
      <div class="frow">
        <div class="cfield"><label>Ürün Adı</label><input id="m-name" value="${esc(p.name)}"></div>
        <div class="cfield"><label>Renk</label><input id="m-color" value="${esc(p.color)}"></div>
      </div>
      <div class="frow">
        <div class="cfield"><label>SKU</label><input id="m-sku" value="${esc(p.sku)}"></div>
        <div class="cfield"><label>Ölçü (G×D×Y)</label><input id="m-dims" value="${esc(p.dims)}"></div>
      </div>
      <div class="frow">
        <div class="cfield"><label>Satış Fiyatı ₺</label><input id="m-price" type="number" step="0.01" value="${p.price}"></div>
        <div class="cfield"><label>Liste Fiyatı ₺</label><input id="m-list" type="number" step="0.01" value="${p.listPrice}"></div>
      </div>
      <div class="frow">
        <div class="cfield"><label>Stok</label><input id="m-stock" type="number" value="${p.stock}"></div>
        <div class="cfield"><label>Rozet (boş = yok)</label><input id="m-badge" value="${esc(p.badge || "")}"></div>
      </div>
      <div class="cfield"><label>Kategori (üst menüde bu başlık altında listelenir)</label>
        <input id="m-cat" value="${esc(p.category || "")}" placeholder="Örn: Kahve Köşesi" list="cat-list">
        <datalist id="cat-list">${[...new Set(state.products.map(x => x.category).filter(Boolean))].map(c => `<option value="${esc(c)}">`).join("")}</datalist>
      </div>
      <div class="cfield"><label>Kısa Açıklama</label><textarea id="m-short">${esc(p.short)}</textarea></div>
      <div class="cfield"><label>Uzun Açıklama</label><textarea id="m-desc" style="min-height:110px">${esc(p.desc)}</textarea></div>
      <div class="cfield"><label>Görsel URL'leri (her satıra bir tane)</label><textarea id="m-imgs" style="min-height:90px">${esc((p.images||[]).join("\n"))}</textarea></div>

      <div class="upload-block">
        <div class="cfield" style="margin-bottom:12px">
          <label>3D Model — Android & Masaüstü (.glb)</label>
          <div class="upload-row">
            <input type="file" id="m-model-file" accept=".glb,model/gltf-binary" style="display:none" onchange="ADMIN.onModelFile('glb')">
            <button type="button" class="btn-sm btn-save" onclick="document.getElementById('m-model-file').click()">${icon("upload", 15)} Dosya Seç (.glb)</button>
            <span class="upload-name" id="m-model-name">${p.model ? "Mevcut model yüklü" : "Dosya seçilmedi"}</span>
          </div>
          <input id="m-model" value="${esc(p.model || "")}" placeholder="veya dosya yolu / URL yapıştır" style="margin-top:8px;font-size:.82rem">
        </div>
        <div class="cfield" style="margin-bottom:0">
          <label>3D Model — iPhone AR (.usdz)</label>
          <div class="upload-row">
            <input type="file" id="m-usdz-file" accept=".usdz,model/vnd.usdz+zip" style="display:none" onchange="ADMIN.onModelFile('usdz')">
            <button type="button" class="btn-sm btn-save" onclick="document.getElementById('m-usdz-file').click()">${icon("upload", 15)} Dosya Seç (.usdz)</button>
            <span class="upload-name" id="m-usdz-name">${p.usdzModel ? "Mevcut model yüklü" : "Dosya seçilmedi"}</span>
          </div>
          <input id="m-usdz" value="${esc(p.usdzModel || "")}" placeholder="veya dosya yolu / URL yapıştır" style="margin-top:8px;font-size:.82rem">
        </div>
      </div>
      <div class="cfield"><label>Montaj PDF yolu</label><input id="m-pdf" value="${esc(p.pdf)}"></div>
      <div class="cfield"><label>Teknik Özellikler (Anahtar: Değer, her satıra bir tane)</label><textarea id="m-specs" style="min-height:110px">${esc(Object.entries(p.specs||{}).map(([k,v])=>k+": "+v).join("\n"))}</textarea></div>
      <div class="cfield"><label>Montaj Adımları (her satıra bir tane)</label><textarea id="m-montaj" style="min-height:90px">${esc((p.montaj||[]).join("\n"))}</textarea></div>
      <div style="display:flex;gap:12px;justify-content:flex-end;margin-top:8px">
        <button class="btn btn-ghost btn-sm" onclick="ADMIN.closeModal()">Vazgeç</button>
        <button class="btn btn-primary btn-sm" onclick="ADMIN.applyProduct(${i})">✓ Uygula</button>
      </div>`);
  }
  function applyProduct(i) {
    const g = id => document.getElementById(id).value;
    const p = state.products[i];
    p.name = g("m-name").trim(); p.color = g("m-color").trim(); p.sku = g("m-sku").trim(); p.dims = g("m-dims").trim();
    p.price = parseFloat(g("m-price")) || 0; p.listPrice = parseFloat(g("m-list")) || 0; p.stock = parseInt(g("m-stock")) || 0;
    p.badge = g("m-badge").trim() || null; p.short = g("m-short").trim(); p.desc = g("m-desc").trim();
    p.images = g("m-imgs").split("\n").map(s => s.trim()).filter(Boolean);
    p.category = g("m-cat").trim();
    p.model = pendingUpload.glb || g("m-model").trim();
    p.usdzModel = pendingUpload.usdz || g("m-usdz").trim();
    p.pdf = g("m-pdf").trim();
    p.specs = {}; g("m-specs").split("\n").forEach(l => { const idx = l.indexOf(":"); if (idx > 0) p.specs[l.slice(0, idx).trim()] = l.slice(idx + 1).trim(); });
    p.montaj = g("m-montaj").split("\n").map(s => s.trim()).filter(Boolean);
    p.keywords = [p.name, p.color, p.category].join(" ").toLowerCase().split(/\s+/);
    try { DB.saveProducts(state.products); }
    catch (e) { toast("⚠️ Kayıt alanı doldu — yüklediğiniz 3D dosya çok büyük olabilir. Daha küçük bir model deneyin."); return; }
    PRODUCTS = DB.activeProducts();
    closeModal(); toast("✅ Ürün güncellendi"); drawProducts();
  }

  /* ================= SİPARİŞLER ================= */
  function renderOrders() {
    const orders = DB.orders().slice().reverse();
    setView(`
      ${topbar("Siparişler", "Siteden gelen tüm siparişler")}
      <div class="panel">
        ${orders.length ? `<table class="atable"><thead><tr><th>No</th><th>Müşteri</th><th>Ürünler</th><th>Tutar</th><th>Ödeme</th><th>Durum</th><th>Tarih</th><th></th></tr></thead><tbody>
          ${orders.map(o => `<tr><td><b>${esc(o.no)}</b></td><td>${esc(o.name)}</td>
            <td>${(o.items||[]).reduce((s,i)=>s+i.qty,0)} ürün</td><td>${esc(o.total)}</td><td>${esc(o.pay||"-")}</td>
            <td>${statusPill(o.status)}</td><td>${new Date(o.date).toLocaleString("tr-TR",{dateStyle:"short",timeStyle:"short"})}</td>
            <td><button class="btn-sm btn-save" onclick="ADMIN.viewOrder('${o.no}')">Detay</button></td></tr>`).join("")}
        </tbody></table>` : `<p class="muted">Henüz sipariş yok. Siteden test siparişi verildiğinde burada listelenir.</p>`}
      </div>`);
  }
  function viewOrder(no) {
    const o = DB.orders().find(x => x.no === no); if (!o) return;
    const statuses = ["Yeni", "Hazırlanıyor", "Kargoda", "Teslim Edildi", "İptal"];
    openModal(`
      <h3>Sipariş ${esc(o.no)}</h3>
      <div class="order-detail-row"><span class="muted">Müşteri</span><b>${esc(o.name)}</b></div>
      <div class="order-detail-row"><span class="muted">E-posta</span><span>${esc(o.email||"-")}</span></div>
      <div class="order-detail-row"><span class="muted">Telefon</span><span>${esc(o.phone||"-")}</span></div>
      <div class="order-detail-row"><span class="muted">Adres</span><span style="max-width:60%;text-align:right">${esc(o.address||"-")}</span></div>
      <div class="order-detail-row"><span class="muted">Ödeme</span><span>${esc(o.pay||"-")}</span></div>
      <div class="order-detail-row"><span class="muted">Tarih</span><span>${new Date(o.date).toLocaleString("tr-TR")}</span></div>
      <h3 style="margin:20px 0 10px;font-size:1rem">Ürünler</h3>
      ${(o.items||[]).map(i => `<div class="order-detail-row"><span>${esc(i.name)} (${esc(i.color)}) × ${i.qty}</span><b>${money(i.price*i.qty)}</b></div>`).join("")}
      <div class="order-detail-row" style="border:none"><b>TOPLAM</b><b style="color:var(--primary-700)">${esc(o.total)}</b></div>
      <div class="cfield" style="margin-top:20px"><label>Sipariş Durumu</label>
        <select id="o-status">${statuses.map(s => `<option ${(o.status||"Yeni")===s?"selected":""}>${s}</option>`).join("")}</select></div>
      <div style="display:flex;gap:12px;justify-content:flex-end">
        <button class="btn btn-ghost btn-sm" onclick="ADMIN.closeModal()">Kapat</button>
        <button class="btn btn-primary btn-sm" onclick="ADMIN.saveOrderStatus('${o.no}')">💾 Durumu Kaydet</button>
      </div>`);
  }
  function saveOrderStatus(no) {
    const orders = DB.orders(); const o = orders.find(x => x.no === no);
    if (o) { o.status = document.getElementById("o-status").value; DB.saveOrders(orders); }
    closeModal(); toast("✅ Sipariş durumu güncellendi"); renderOrders();
  }

  /* ================= MESAJLAR ================= */
  function renderMessages() {
    const msgs = DB.messages().slice().reverse();
    setView(`
      ${topbar("İletişim Mesajları", "Sitedeki iletişim formundan gelenler")}
      <div class="panel">
        ${msgs.length ? msgs.map(m => `<div class="repeat-item">
          <div style="display:flex;justify-content:space-between;gap:12px"><b>${esc(m.name)}</b><span class="muted" style="font-size:.8rem">${new Date(m.date).toLocaleString("tr-TR")}</span></div>
          <div class="muted" style="font-size:.82rem;margin:4px 0">${esc(m.email)} • ${esc(m.subject||"")}</div>
          <div style="font-size:.9rem">${esc(m.msg)}</div>
          <a href="mailto:${esc(m.email)}" class="btn-sm btn-save" style="display:inline-block;margin-top:10px;text-decoration:none">↩️ Yanıtla</a>
        </div>`).join("") : `<p class="muted">Henüz mesaj yok.</p>`}
      </div>`);
  }

  /* ================= SAYFA METİNLERİ ================= */
  function renderContent() {
    state.content = structuredClone(DB.content());
    const c = state.content;
    const str = (path, label, ta) => {
      const val = path.split(".").reduce((o, k) => o[k], c);
      return `<div class="cfield"><label>${label}</label>${ta
        ? `<textarea data-path="${path}">${esc(val)}</textarea>`
        : `<input data-path="${path}" value="${esc(val)}">`}</div>`;
    };
    setView(`
      ${topbar("Sayfa Metinleri", "Sitedeki yazıları buradan düzenleyin, sayfaları kod bilmeden güncelleyin")}
      <details class="content-group" open><summary>🏠 Ana Sayfa — Karşılama</summary><div class="gbody">
        ${str("home.heroEyebrow", "Üst etiket")}
        <div class="frow">${str("home.heroTitle1", "Başlık 1. bölüm")}${str("home.heroHighlight", "Vurgulu kelime")}</div>
        ${str("home.heroTitle2", "Başlık 2. satır")}
        ${str("home.heroLead", "Açıklama paragrafı", true)}
        <div class="frow">${str("home.cta1", "1. buton")}${str("home.cta2", "2. buton")}</div>
      </div></details>

      <details class="content-group"><summary>📊 Ana Sayfa — İstatistikler (rakamlar)</summary><div class="gbody" id="grp-stats"></div></details>
      <details class="content-group"><summary>✨ Ana Sayfa — Özellik Kartları</summary><div class="gbody" id="grp-features"></div></details>
      <details class="content-group"><summary>🔢 Ana Sayfa — Nasıl Çalışır Adımları</summary><div class="gbody" id="grp-steps"></div></details>

      <details class="content-group"><summary>🛍️ Ana Sayfa — Ürün & CTA başlıkları</summary><div class="gbody">
        ${str("home.productsHeading", "Ürünler başlığı")}
        ${str("home.productsSub", "Ürünler alt açıklaması", true)}
        ${str("home.ctaTitle", "Alt CTA başlığı")}
        ${str("home.ctaText", "Alt CTA metni", true)}
        ${str("home.ctaButton", "Alt CTA buton yazısı")}
      </div></details>

      <details class="content-group"><summary>ℹ️ Hakkımızda Sayfası</summary><div class="gbody">
        ${str("about.title", "Başlık")}
        ${str("about.sub", "Alt başlık", true)}
        <div id="grp-about"></div>
      </div></details>

      <details class="content-group"><summary>✉️ İletişim Sayfası</summary><div class="gbody">
        ${str("contact.title", "Başlık")}
        ${str("contact.sub", "Alt başlık", true)}
      </div></details>

      <details class="content-group"><summary>❓ S.S.S. Sayfası</summary><div class="gbody">
        ${str("faq.title", "Başlık")}
        ${str("faq.sub", "Alt başlık", true)}
        <div id="grp-faq"></div>
      </div></details>

      <div class="save-bar">
        <button class="btn btn-ghost btn-sm" onclick="ADMIN.go('content')">İptal</button>
        <button class="btn btn-primary btn-sm" onclick="ADMIN.saveContent()">💾 Metinleri Kaydet</button>
      </div>`);

    // basit input/textarea'ları drafta bağla
    document.querySelectorAll("[data-path]").forEach(inp => inp.addEventListener("input", () => {
      const parts = inp.dataset.path.split("."); let o = c;
      for (let i = 0; i < parts.length - 1; i++) o = o[parts[i]];
      o[parts[parts.length - 1]] = inp.value;
    }));
    // tekrarlı gruplar
    drawRepeat("grp-stats", c.home.stats, [["n", "Rakam"], ["l", "Etiket"]], { n: "Yeni", l: "" });
    drawRepeat("grp-features", c.home.features, [["i", "İkon (emoji)"], ["t", "Başlık"], ["d", "Açıklama", true]], { i: "⭐", t: "", d: "" });
    drawRepeat("grp-steps", c.home.steps, [["t", "Başlık"], ["d", "Açıklama", true]], { t: "", d: "" });
    drawRepeat("grp-about", c.about.blocks, [["h", "Başlık"], ["p", "Paragraf", true]], { h: "", p: "" });
    drawRepeat("grp-faq", c.faq.items, [["q", "Soru"], ["a", "Cevap", true]], { q: "", a: "" });
  }
  function drawRepeat(containerId, arr, fields, blank) {
    const cont = document.getElementById(containerId); if (!cont) return;
    const render = () => {
      cont.innerHTML = arr.map((item, idx) => `
        <div class="repeat-item">
          ${fields.map(([k, lbl, ta]) => `<div class="cfield"><label>${lbl}</label>${ta
            ? `<textarea data-i="${idx}" data-k="${k}">${esc(item[k])}</textarea>`
            : `<input data-i="${idx}" data-k="${k}" value="${esc(item[k])}">`}</div>`).join("")}
          <button class="btn-sm btn-danger" onclick="this.closest('.repeat-item').__del()">🗑️ Sil</button>
        </div>`).join("") + `<button class="btn-sm btn-save" id="${containerId}-add">+ Ekle</button>`;
      cont.querySelectorAll("[data-i]").forEach(inp => inp.addEventListener("input", () => {
        arr[+inp.dataset.i][inp.dataset.k] = inp.value;
      }));
      cont.querySelectorAll(".repeat-item").forEach((el, idx) => el.__del = () => { arr.splice(idx, 1); render(); });
      document.getElementById(containerId + "-add").onclick = () => { arr.push(structuredClone(blank)); render(); };
    };
    render();
  }
  function saveContent() { DB.saveContent(state.content); CONTENT = DB.content(); toast("✅ Sayfa metinleri kaydedildi"); }

  /* ================= AYARLAR ================= */
  function renderSettings() {
    const s = structuredClone(DB.site()); state.site = s;
    setView(`
      ${topbar("Ayarlar", "Site geneli bilgiler ve yönetici erişimi")}
      <div class="panel">
        <h2>Mağaza Bilgileri</h2><div class="desc">Bu bilgiler tüm sayfalarda (başlık, altbilgi, iletişim) otomatik güncellenir</div>
        <div class="frow">
          <div class="cfield"><label>Marka Adı</label><input id="s-brand" value="${esc(s.brand)}"></div>
          <div class="cfield"><label>Slogan</label><input id="s-slogan" value="${esc(s.slogan)}"></div>
        </div>
        <div class="frow">
          <div class="cfield"><label>Telefon</label><input id="s-phone" value="${esc(s.phone)}"></div>
          <div class="cfield"><label>E-posta</label><input id="s-email" value="${esc(s.email)}"></div>
        </div>
        <div class="cfield"><label>Adres</label><input id="s-address" value="${esc(s.address)}"></div>
        <div class="frow">
          <div class="cfield"><label>Ücretsiz Kargo Limiti (TL)</label><input id="s-ship" type="number" value="${s.freeShippingLimit}"></div>
          <div class="cfield"><label>Yönetici Şifresi</label><input id="s-pass" value="${esc(s.adminPass)}"></div>
        </div>
        <div class="cfield"><label>Genel AR/QR Adresi (site yayına alınınca kendi alan adınız)</label><input id="s-arbase" value="${esc(s.arBase || "")}" placeholder="https://siteniz.com"></div>
      </div>
      <div class="panel">
        <h2>Hero Arka Plan Görseli</h2><div class="desc">Ana sayfanın en üst bölümünün arka planı. Kendi tasarımınızı/görselinizi masaüstünden yükleyin (yatay/geniş görsel önerilir).</div>
        <div class="upload-row">
          <input type="file" id="s-heroimg-file" accept="image/*,.svg" style="display:none" onchange="ADMIN.onHeroFile()">
          <button type="button" class="btn-sm btn-save" onclick="document.getElementById('s-heroimg-file').click()">${icon("upload", 15)} Görsel Yükle</button>
          <span class="upload-name" id="s-heroimg-name">${s.heroImage ? "Mevcut görsel yüklü" : "Görsel seçilmedi"}</span>
        </div>
        <input id="s-heroimg" value="${esc(s.heroImage || "")}" placeholder="veya görsel yolu / URL yapıştır" style="margin-top:8px;font-size:.82rem">
      </div>
      <div class="panel">
        <h2>Ana Sayfa 3D / AR Vitrini</h2><div class="desc">Ana sayfadaki "Almadan önce evinde gör" bölümünde hangi ürünün 3D modeli dönsün?</div>
        <div class="cfield"><label>Gösterilecek Ürün</label>
          <select id="s-arprod">${DB.products().map(p => `<option value="${esc(p.id)}" ${s.arSpotProduct === p.id ? "selected" : ""}>${esc(p.name)} — ${esc(p.color)}</option>`).join("")}</select>
        </div>
      </div>
      <div class="panel">
        <h2>Veri Yönetimi</h2><div class="desc">Tüm ürün/metin/ayarları başlangıç durumuna döndürür (siparişler ve mesajlar korunur)</div>
        <button class="btn-sm btn-danger" onclick="ADMIN.resetAll()">↺ Fabrika Ayarlarına Dön</button>
      </div>
      <div class="save-bar">
        <button class="btn btn-ghost btn-sm" onclick="ADMIN.go('settings')">İptal</button>
        <button class="btn btn-primary btn-sm" onclick="ADMIN.saveSettings()">💾 Ayarları Kaydet</button>
      </div>`);
  }
  function saveSettings() {
    const g = id => document.getElementById(id).value;
    const s = DB.site();
    s.brand = g("s-brand").trim(); s.slogan = g("s-slogan").trim(); s.phone = g("s-phone").trim();
    s.email = g("s-email").trim(); s.address = g("s-address").trim();
    s.freeShippingLimit = parseInt(g("s-ship")) || 0; s.adminPass = g("s-pass").trim() || "montiva2026";
    s.arBase = g("s-arbase").trim();
    s.arSpotProduct = g("s-arprod");
    s.heroImage = g("s-heroimg").trim() || "assets/img/hero-bg.svg";
    try { DB.saveSite(s); }
    catch (e) { toast("⚠️ Kayıt alanı doldu — yüklediğiniz görsel çok büyük olabilir."); return; }
    SITE = DB.site(); toast("✅ Ayarlar kaydedildi"); renderApp();
  }
  function resetAll() {
    if (!confirm("Tüm ürün, metin ve ayarlar başlangıç durumuna dönecek. Emin misiniz?")) return;
    DB.resetAll(); SITE = DB.site(); PRODUCTS = DB.activeProducts(); CONTENT = DB.content();
    toast("↺ Fabrika ayarları yüklendi"); renderApp();
  }

  /* ================= MODAL ================= */
  function openModal(html) {
    let bg = document.getElementById("adm-modal");
    if (!bg) { bg = document.createElement("div"); bg.id = "adm-modal"; bg.className = "modal-bg"; document.body.appendChild(bg);
      bg.addEventListener("click", e => { if (e.target === bg) closeModal(); }); }
    bg.innerHTML = `<div class="modal">${html}</div>`; bg.classList.add("show");
  }
  function closeModal() { const bg = document.getElementById("adm-modal"); if (bg) bg.classList.remove("show"); }

  /* ================= BAŞLAT ================= */
  function boot() { if (isAuthed()) renderApp(); else renderLogin(); }
  window.ADMIN = {
    go: switchView, newProduct, deleteProduct, editProduct, applyProduct, saveProducts,
    viewOrder, saveOrderStatus, saveContent, saveSettings, resetAll, closeModal, onModelFile, onHeroFile
  };
  boot();
})();
