// NOVORA — Yapay Zekâ Canlı Destek (NOVO) v2
// Gelişmiş kural + niyet skorlama motoru: bağlam hafızası, ürün/renk/bütçe çıkarımı,
// ürün karşılaştırma, yazım hatası toleransı. Bilgi kaynağı: canlı DB (PRODUCTS, SITE).

(function () {
  const BOT = "NOVO";
  const ctx = { lastProduct: null, greeted: false };

  /* ---------- arayüz ---------- */
  function mount() {
    const fab = document.createElement("button");
    fab.id = "chat-fab"; fab.title = "Yapay Zekâ Canlı Destek";
    fab.innerHTML = `${icon("bot", 26)}<span class="pulse"></span>`;
    fab.onclick = toggle;

    const panel = document.createElement("div");
    panel.id = "chat-panel";
    panel.innerHTML = `
      <div class="chat-head">
        <div class="avatar">${icon("bot", 22)}</div>
        <div><b>${BOT} — Yapay Zekâ Asistanı</b><span>Çevrimiçi • Anında yanıt</span></div>
        <button onclick="document.getElementById('chat-panel').classList.remove('open')">${icon("close", 16)}</button>
      </div>
      <div id="chat-msgs"></div>
      <div class="quick-replies" id="chat-quick"></div>
      <div class="chat-input">
        <input id="chat-in" type="text" placeholder="Sorunuzu yazın..." autocomplete="off">
        <button id="chat-send">${icon("send", 18)}</button>
      </div>
      <div class="chat-foot">${BOT}, ${SITE.brand}'nın yapay zekâ destek asistanıdır.</div>`;
    document.body.appendChild(fab);
    document.body.appendChild(panel);
    document.getElementById("chat-send").onclick = send;
    document.getElementById("chat-in").addEventListener("keydown", e => { if (e.key === "Enter") send(); });

    const u = (typeof AUTH !== "undefined") ? AUTH.current() : null;
    quickReplies(u
      ? ["Siparişlerim", "İade nasıl yapılır?", "Hangisini önerirsin?", "Kargo & teslimat"]
      : ["Ürünleri göster", "Hangisini önerirsin?", "Kargo & teslimat", "İade nasıl yapılır?"]);
    setTimeout(() => {
      if (u) {
        const n = (u.name || "").split(" ")[0];
        const cnt = AUTH.myOrders().length;
        botSay(`${selam()} <b>${n}</b>! 👋 Ben <b>${BOT}</b>, ${SITE.brand} asistanıyım.` +
          (cnt ? `<br>Hesabında <b>${cnt} sipariş</b> görünüyor — durumunu sorabilir, iade talebi oluşturabilirsin.`
               : `<br>Ürün seçimi, kargo, montaj, iade... ne istersen sor.`));
      } else {
        botSay(`${selam()} 👋 Ben <b>${BOT}</b>, ${SITE.brand}'nın yapay zekâ asistanıyım.<br>Ürün seçimi, fiyat, kargo, montaj, 3D önizleme, iade... aklına ne takılırsa yaz. 🙂<br><br>💡 <a href="giris.html">Üye olursan</a> siparişlerini buradan takip edebilirsin.`);
      }
    }, 500);
  }
  function toggle() {
    const p = document.getElementById("chat-panel");
    p.classList.toggle("open");
    if (p.classList.contains("open")) document.getElementById("chat-in").focus();
  }
  function selam() {
    const h = new Date().getHours();
    if (h < 6) return "İyi geceler";
    if (h < 12) return "Günaydın";
    if (h < 18) return "Merhaba";
    return "İyi akşamlar";
  }

  function el(html) { const d = document.createElement("div"); d.innerHTML = html; return d.firstElementChild; }
  function scrollDown() { const m = document.getElementById("chat-msgs"); m.scrollTop = m.scrollHeight; }
  function userSay(t) { const d = el(`<div class="msg user"></div>`); d.textContent = t; document.getElementById("chat-msgs").appendChild(d); scrollDown(); }
  function botSay(html) { document.getElementById("chat-msgs").appendChild(el(`<div class="msg bot">${html}</div>`)); scrollDown(); }
  function typing(cb) {
    const t = el(`<div class="msg bot typing"><i></i><i></i><i></i></div>`);
    document.getElementById("chat-msgs").appendChild(t); scrollDown();
    setTimeout(() => { t.remove(); cb(); }, 650 + Math.random() * 550);
  }
  function quickReplies(items) {
    const q = document.getElementById("chat-quick"); q.innerHTML = "";
    items.forEach(txt => {
      const b = document.createElement("button"); b.textContent = txt;
      b.onclick = () => { userSay(txt); typing(() => answer(txt)); };
      q.appendChild(b);
    });
  }
  function send() {
    const inp = document.getElementById("chat-in"); const t = inp.value.trim();
    if (!t) return; inp.value = ""; userSay(t); typing(() => answer(t));
  }
  function card(p) {
    return `<a class="mini-card" href="urun.html?id=${p.id}"><img src="${p.images[0]}" alt="">
      <div><b>${p.name} — ${p.color}</b><span>${fmtPrice(p.price)}${p.stock <= 0 ? " • tükendi" : ""}</span></div></a>`;
  }

  /* ---------- TR normalizasyon + benzerlik ---------- */
  function norm(s) {
    return s.toLocaleLowerCase("tr-TR").replace(/ı/g, "i").replace(/ş/g, "s").replace(/ğ/g, "g")
      .replace(/ü/g, "u").replace(/ö/g, "o").replace(/ç/g, "c").replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
  }
  // kelime-sınırı farkında eşleştirme: kısa heceler (ar, 3d, tl) yalnızca tam kelime olarak eşleşir;
  // uzun kökler ekli kelimelerde de yakalanır (montaj → montajı)
  function has(t, ...ws) {
    const toks = t.split(" ");
    return ws.some(w => {
      const nw = norm(w);
      if (nw.includes(" ")) return t.includes(nw);
      if (nw.length <= 3) return toks.includes(nw);
      return toks.some(tok => tok.includes(nw));
    });
  }
  // Levenshtein (yazım hatası toleransı)
  function lev(a, b) {
    const m = a.length, n = b.length; if (!m) return n; if (!n) return m;
    const d = Array.from({ length: m + 1 }, (_, i) => [i, ...Array(n).fill(0)]);
    for (let j = 0; j <= n; j++) d[0][j] = j;
    for (let i = 1; i <= m; i++) for (let j = 1; j <= n; j++)
      d[i][j] = Math.min(d[i-1][j]+1, d[i][j-1]+1, d[i-1][j-1] + (a[i-1] === b[j-1] ? 0 : 1));
    return d[m][n];
  }
  function fuzzyHas(t, ...ws) {
    const toks = t.split(" ");
    return ws.some(w => { const nw = norm(w); return toks.some(tok => tok.length > 3 && lev(tok, nw) <= 1); });
  }

  /* ---------- varlık çıkarımı ---------- */
  function findProducts(t) {
    const list = PRODUCTS.filter(p =>
      norm(p.name).split(" ").some(w => w.length > 3 && t.includes(w)) ||
      (p.keywords || []).some(k => t.includes(norm(k))));
    return list;
  }
  function detectColor(t) {
    if (has(t, "mint", "yesil", "yeşil")) return "mint";
    if (has(t, "siyah", "black")) return "siyah";
    return null;
  }
  function detectBudget(t) {
    const m = t.replace(/\./g, "").match(/(\d{3,6})/);
    return m ? parseInt(m[1]) : null;
  }

  /* ---------- yanıt motoru ---------- */
  function answer(raw) {
    const t = norm(raw);
    let matched = findProducts(t);
    const color = detectColor(t);
    if (matched.length && color) {
      const f = matched.filter(p => norm(p.color).includes(color));
      if (f.length) matched = f;
    }
    if (matched.length) ctx.lastProduct = matched[0];

    // selam / hal hatır
    if (has(t, "merhaba", "selam", "gunaydin", "iyi aksamlar", "iyi gunler", "hey", "alo") && t.length < 25) {
      botSay(`${selam()}! 😊 Size nasıl yardımcı olabilirim? Ürünler, fiyatlar, kargo veya montaj hakkında sorabilirsiniz.`);
      quickReplies(["Ürünleri göster", "Hangisini önerirsin?", "En uygun fiyatlı hangisi?"]); return;
    }
    if (has(t, "nasilsin", "naber", "ne haber")) {
      botSay("Teşekkürler, ben bir asistanım ama her zaman formda sayılırım! 😄 Siz nasıl yardım isterdiniz — ürün seçimi mi, sipariş mi?"); return;
    }
    if (has(t, "tesekkur", "sagol", "eyvallah", "harika", "super", "cok iyi", "helal")) {
      botSay("Rica ederim! 💙 Başka bir sorunuz olursa buradayım. Keyifli alışverişler dilerim!"); return;
    }
    if (has(t, "gorusuruz", "hoscakal", "bay bay", "iyi gunler")) { botSay("Görüşmek üzere! 👋 İyi günler."); return; }

    // insan temsilci
    if (has(t, "insan", "temsilci", "gercek kisi", "yetkili", "operator", "musteri hizmet")) {
      botSay(`Elbette! Hafta içi 09:00–18:00 arası ekibimize ulaşabilirsiniz:<br>📞 <b>${SITE.phone}</b><br>📧 <b>${SITE.email}</b><br>Dilerseniz sorunuzu bana da yazın, çoğu konuda anında yardımcı olabiliyorum. 🤖`); return;
    }

    // 3D / AR
    if (has(t, "3d", "3 boyut", "artir", "artırılmış", "evimde", "gorurum", "gormek", "gorebilir", "kamera", "gercek boyut", "odama", "yerlestir", "ar modu")) {
      botSay(`🧊 <b>3D önizleme & AR</b> en sevdiğim özelliğimiz!<br>• Her ürün sayfasında <b>"3D İncele"</b> ile ürünü fareyle çevirip yakınlaştırabilirsiniz.<br>• <b>Telefondan</b> girerseniz <b>"Evimde Gör (AR)"</b> butonuyla kameranızı açıp ürünü <b>gerçek boyutunda</b> odanıza yerleştirebilirsiniz — alır mı, rengi uyar mı hemen görürsünüz.<br>Hangi ürünü denemek istersiniz?`);
      quickReplies(PRODUCTS.slice(0, 3).map(p => p.name.split(" ")[0])); return;
    }

    // karşılaştırma
    if (has(t, "fark", "karsilastir", "hangisi daha", "mi yoksa", "vs", "ayni mi")) {
      const two = matched.length >= 2 ? matched.slice(0, 2) : PRODUCTS.slice(0, 2);
      botSay(`Karşılaştıralım: ⚖️<br>` + two.map(p =>
        `<b>${p.name.split("&")[0].trim()} (${p.color})</b><br>&nbsp;&nbsp;📏 ${p.dims} • 💰 ${fmtPrice(p.price)} • 🛠 ${p.specs["Montaj Süresi"]}`).join("<br><br>") +
        `<br><br>Kısaca: <b>LYRA</b> en kompakt ve uygun fiyatlı, <b>FABIO</b> mikrodalga rafı ekler, <b>CAPELLA</b> en geniş depolama alanını sunar.`); return;
    }

    // bütçe / en ucuz / en pahalı
    if (has(t, "en ucuz", "en uygun", "en hesapli", "ucuz olan")) {
      const p = [...PRODUCTS].sort((a, b) => a.price - b.price)[0];
      botSay(`En uygun fiyatlı ürünümüz bu: 💸` + card(p)); ctx.lastProduct = p; return;
    }
    if (has(t, "en pahali", "en iyi", "ust segment", "premium", "en genis")) {
      const p = [...PRODUCTS].sort((a, b) => b.price - a.price)[0];
      botSay(`En üst segment / en geniş ürünümüz: ✨` + card(p)); ctx.lastProduct = p; return;
    }
    const budget = detectBudget(t);
    if (budget && has(t, "butce", "butcem", "param", "lira", "tl", "kadar param", "altinda", "en fazla", "max")) {
      const fit = PRODUCTS.filter(p => p.price <= budget).sort((a, b) => b.price - a.price);
      if (fit.length) botSay(`${budget.toLocaleString("tr-TR")} TL bütçenize uyan ürünler: 👍` + fit.map(card).join(""));
      else botSay(`${budget.toLocaleString("tr-TR")} TL bütçeye uyan ürün şu an yok; en uygun ürünümüz <b>${fmtPrice(Math.min(...PRODUCTS.map(p=>p.price)))}</b>'den başlıyor. Havale ile %3 indirim de var. 😊`);
      return;
    }

    // kargo
    if (has(t, "kargo", "teslimat", "ne zaman gelir", "kac gun", "gonderim", "elime ulas")) {
      botSay(`🚚 <b>Kargo & teslimat:</b><br>• Siparişler <b>1–3 iş günü</b> içinde kargoya verilir.<br>• Teslimat <b>2–4 iş günü</b> sürer.<br>• <b>${SITE.freeShippingLimit} TL üzeri ücretsiz kargo</b> — tüm ürünlerimiz bu kapsamda! 🎉<br>• Güçlendirilmiş, darbeye dayanıklı kolilerde gönderilir.`);
      quickReplies(["İade koşulları", "Montaj zor mu?", "Sipariş nasıl veririm?"]); return;
    }

    // montaj (ürün bağlamıyla)
    if (has(t, "montaj", "kurulum", "kurmasi", "zor mu", "vida", "alyan", "kurulur", "monte", "toplama")) {
      const p = ctx.lastProduct;
      let extra = "";
      if (p) extra = `<br><br>Özellikle <b>${p.name.split("&")[0].trim()}</b> için: montaj süresi <b>${p.specs["Montaj Süresi"]}</b>, adımlar: ${p.montaj.join(" → ")}. <a href="${p.pdf}" download>PDF kılavuzu indir</a>.`;
      botSay(`🔧 <b>Montaj çok kolay!</b> Tüm ürünler demonte gelir:<br>• Gerekli alyan anahtarı <b>kutuda</b>.<br>• Adım adım <b>PDF kılavuz</b> her ürün sayfasında.<br>• LYRA ~30 dk (tek kişi), FABIO ~45 dk, CAPELLA ~1 saat (2 kişi önerilir).${extra}`); return;
    }
    if (has(t, "pdf", "kilavuz", "klavuz", "talimat")) {
      const p = ctx.lastProduct;
      if (p) botSay(`📄 <b>${p.name} (${p.color})</b> montaj kılavuzu hazır: <a href="${p.pdf}" download>PDF indir</a>` + card(p));
      else { botSay(`📄 Her ürün sayfasında <b>"Montaj Kılavuzunu İndir (PDF)"</b> butonu var. Hangi ürünün kılavuzunu istersiniz?`); quickReplies(PRODUCTS.slice(0,3).map(p=>p.name.split(" ")[0])); }
      return;
    }

    // iade / garanti
    if (has(t, "iade", "degisim", "geri gonder", "cayma", "iade et")) {
      const u = (typeof AUTH !== "undefined") ? AUTH.current() : null;
      const ords = u ? AUTH.myOrders() : [];
      let ek = "";
      if (ords.length) {
        const o = ords[0];
        ek = `<br><br>Son siparişin <b>${o.no}</b> (${new Date(o.date).toLocaleDateString("tr-TR")}). ` +
             `<a href="iade.html?no=${encodeURIComponent(o.no)}&mail=${encodeURIComponent(o.email)}">Bu sipariş için iade talebi oluştur →</a>`;
      }
      botSay(`↩️ <b>İade çok kolay:</b><br>` +
        `1. <a href="iade.html">İade Talebi sayfasını</a> aç (üst menüde <b>İade</b>).<br>` +
        `2. <b>Sipariş numaran + e-postan</b> ile siparişini doğrula.<br>` +
        `3. İade sebebini seç ve <b>ürünün fotoğrafını</b> ekle.<br>` +
        `4. Talebini gönder — sonucu e-posta ile bildiririz.<br><br>` +
        `• Teslimattan itibaren <b>14 gün</b> koşulsuz iade hakkın var.<br>` +
        `• Ürün <b>monte edilmemiş</b> ve orijinal ambalajında olmalı.<br>` +
        `• Hasarlı/eksik parçada <b>ücretsiz yedek parça</b> gönderiyoruz — iadeye gerek kalmaz.` + ek);
      quickReplies(u ? ["Siparişlerim", "Kargo & teslimat", "Garanti"] : ["İade sayfasını aç", "Sipariş takibi", "Kargo & teslimat"]);
      return;
    }
    if (has(t, "iade sayfasi", "iade sayfasını aç")) { location.href = "iade.html"; return; }
    if (has(t, "garanti", "bozul", "kirik", "hasar", "eksik parca", "arizali")) {
      botSay(`🛡️ Tüm ürünler <b>2 yıl garantili</b>.<br>Kargo hasarı veya eksik parçada, fotoğrafla ${SITE.email} adresine yazın — <b>48 saat içinde</b> yedek parçanız ücretsiz kargolanır. Ömür boyu yedek parça desteğimiz var.`); return;
    }

    // ödeme
    if (has(t, "odeme", "kredi kart", "havale", "taksit", "kapida", "nasil oderim", "eft")) {
      botSay(`💳 <b>Ödeme seçenekleri:</b><br>• Kredi/banka kartı (Visa, Mastercard, Troy)<br>• Havale/EFT — <b>%3 indirim</b><br>• Kapıda ödeme (+49,90 TL)<br>Tüm ödemeler SSL ile şifrelenir. 🔒`); return;
    }

    // stok (renk bazlı)
    if (has(t, "stok", "stokta", "mevcut", "var mi", "kaldi mi", "tukendi mi", "kac tane")) {
      if (matched.length) botSay(matched.map(p => `${p.stock > 0 ? "✅" : "❌"} <b>${p.name} (${p.color})</b>: ${p.stock > 0 ? `stokta <b>${p.stock} adet</b>` : "geçici olarak tükendi"}` + (p.stock>0?card(p):"")).join("<br>"));
      else { botSay("Hangi ürün/rengin stok durumunu kontrol edeyim?"); quickReplies(PRODUCTS.slice(0,3).map(p=>`${p.name.split(" ")[0]} ${p.color}`)); }
      return;
    }

    // fiyat
    if (has(t, "fiyat", "kac para", "kaca", "ne kadar", "ucret", "kac lira", "kac tl")) {
      if (matched.length) botSay(`İşte fiyat bilgisi: 💙` + matched.map(card).join(""));
      else botSay(`Güncel fiyatlarımız (hepsi indirimli): 💙` + PRODUCTS.map(card).join(""));
      return;
    }

    // ölçü / sığar mı
    if (has(t, "boyut", "olcu", "kac cm", "yukseklik", "genislik", "derinlik", "sigar", "ebat")) {
      const list = matched.length ? matched : PRODUCTS;
      botSay(`📏 <b>Ölçüler (G×D×Y):</b><br>` + list.map(p => `• <b>${p.name.split("&")[0].trim()} (${p.color})</b>: ${p.dims}`).join("<br>") +
        `<br><br>💡 İpucu: Ürün sayfasındaki <b>AR / Evimde Gör</b> ile telefonundan gerçek boyutunu odanda görebilirsin!`); return;
    }

    // öneri
    if (has(t, "oner", "tavsiye", "hangisi", "hangi urun", "ne alsam", "kararsiz", "yardim et sec")) {
      botSay(`Tabii, kısa bir rehber: 🤖<br>• <b>Dar alan / bütçe dostu</b> → LYRA (64 cm, ${fmtPrice(PRODUCTS.find(p=>p.id==='lyra-siyah').price)})<br>• <b>Mikrodalganız varsa</b> → FABIO (güçlendirilmiş fırın rafı)<br>• <b>Maksimum depolama</b> → CAPELLA (80×180, tel kapaklı)<br><br>Renk tercihiniz var mı — <b>mint yeşili</b> mi <b>siyah</b> mı? Ona göre daraltalım.`);
      quickReplies(["Mint yeşili göster", "Siyah göster", "En çok satan hangisi?"]); return;
    }
    if (has(t, "en cok satan", "populer", "trend", "cok tercih")) {
      const p = PRODUCTS.find(x => /satan/i.test(x.badge || "")) || PRODUCTS[0];
      botSay(`En çok tercih edilen ürünümüz bu: 🔥` + card(p)); ctx.lastProduct = p; return;
    }

    // renk filtresi (renk + "göster/olanlar/hepsi" veya sadece renk)
    if (color && (has(t, "goster", "olanlar", "hepsi", "tum", "listele", "hangi") || !matched.length)) {
      const list = PRODUCTS.filter(p => norm(p.color).includes(color));
      botSay(`${color === "mint" ? "Mint yeşili" : "Siyah"} seçeneklerimiz: 🎨` + list.map(card).join("")); return;
    }

    // sepet / sipariş
    if (has(t, "sepet", "satin al", "nasil eklerim", "siparis ver", "nasil alirim", "order")) {
      botSay(`🛒 Çok kolay:<br>1. Ürün sayfasında <b>"Sepete Ekle"</b>.<br>2. Sağ üstteki <b>Sepet</b>'e gidin.<br>3. <b>"Ödemeye Geç"</b> ile adres + ödeme.<br>Sipariş onayınız e-postaya gelir. ✅` + (ctx.lastProduct ? card(ctx.lastProduct) : "")); return;
    }
    if (has(t, "siparisim", "siparislerim", "siparisim nerede", "takip", "siparis durumu", "nerede kaldi", "kargom")) {
      const u = (typeof AUTH !== "undefined") ? AUTH.current() : null;
      if (u) {
        const ords = AUTH.myOrders();
        if (!ords.length) { botSay(`Hesabında henüz sipariş görünmüyor. <a href="urunler.html">Koleksiyona göz at →</a>`); return; }
        botSay(`📦 <b>Siparişlerin:</b><br>` + ords.slice(0,4).map(o =>
          `• <b>${o.no}</b> — ${o.total} · <b>${o.status||"Yeni"}</b> (${new Date(o.date).toLocaleDateString("tr-TR")})<br>` +
          `&nbsp;&nbsp;<a href="siparis-takip.html?no=${encodeURIComponent(o.no)}&mail=${encodeURIComponent(o.email)}">Detay</a> · ` +
          `<a href="iade.html?no=${encodeURIComponent(o.no)}&mail=${encodeURIComponent(o.email)}">İade</a>`).join("<br>") +
          `<br><br><a href="hesabim.html?t=orders">Tüm siparişlerim →</a>`);
        quickReplies(["İade nasıl yapılır?", "Kargo & teslimat", "Garanti"]);
        return;
      }
      botSay(`📦 Siparişini iki şekilde takip edebilirsin:<br>` +
        `• <a href="siparis-takip.html">Sipariş Takibi sayfasından</a> — sipariş numaran + e-postanla.<br>` +
        `• <a href="giris.html">Üye olursan</a> tüm siparişlerin "Siparişlerim" bölümünde listelenir.`);
      quickReplies(["Sipariş takibi", "Üye ol", "İade nasıl yapılır?"]);
      return;
    }
    // üyelik soruları
    if (has(t, "uye", "uyelik", "kayit ol", "hesap ac", "giris yap", "sifre")) {
      const u = (typeof AUTH !== "undefined") ? AUTH.current() : null;
      if (u) { botSay(`Zaten giriş yapmışsın 🙂 <b>${u.name}</b> (${u.email}).<br><a href="hesabim.html">Hesabım sayfası →</a>`); return; }
      botSay(`👤 <b>Üyelik ücretsiz!</b> Üye olursan:<br>• Siparişlerin tek yerde listelenir<br>• Sipariş durumunu anında görürsün<br>• İade talebini tek tıkla oluşturursun<br>• Kampanyalardan ilk sen haberdar olursun<br><br><a href="giris.html?mode=reg">Hemen üye ol →</a> · <a href="giris.html">Giriş yap</a>`);
      return;
    }

    // ürün adı geçtiyse detay
    if (matched.length) {
      const p = matched[0];
      botSay(`<b>${p.name} — ${p.color}</b> 💙<br>${p.short}<br><br>📏 ${p.dims} • 💰 ${fmtPrice(p.price)} • 🛠 ${p.specs["Montaj Süresi"]} • ${p.stock>0?`✅ ${p.stock} adet stokta`:"❌ tükendi"}` + card(p));
      quickReplies(["3D / Evimde gör", "Montaj zor mu?", "Kargo ne zaman?"]); return;
    }
    // ürünleri göster
    if (has(t, "urun", "goster", "katalog", "neler var", "liste", "hepsi", "tum urun")) {
      botSay(`İşte tüm ürünlerimiz: 🛍️` + PRODUCTS.map(card).join("")); return;
    }

    // fallback — anlamadıysa yönlendir
    botSay(`Bunu tam yakalayamadım 🤔 ama şu konularda kesin yardımcı olurum:<br>• 🛍️ Ürün, fiyat, stok<br>• 🧊 3D önizleme & AR<br>• 🚚 Kargo & teslimat<br>• 🔧 Montaj & PDF kılavuz<br>• ↩️ İade & garanti<br>Sorunuzu biraz farklı yazar mısınız? Ya da ekibimiz: <b>${SITE.email}</b>`);
    quickReplies(["Hangisini önerirsin?", "Ürünleri göster", "Kargo bilgisi", "3D nasıl çalışır?"]);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", mount);
  else mount();
})();
