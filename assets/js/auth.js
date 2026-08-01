// NOVORA — üyelik / oturum katmanı (db.js'ten sonra yüklenmeli)
// NOT: Bu tarayıcı tabanlı bir demo sistemidir. Şifreler SHA-256 ile özetlenerek saklanır,
// ancak gerçek güvenlik (sunucu doğrulaması, oturum anahtarı) için arka uç gerekir.
const AUTH = (() => {
  const UK = "montiva_users";
  const SK = "montiva_session";

  const load = () => { try { return JSON.parse(localStorage.getItem(UK)) || []; } catch { return []; } };
  const save = (u) => localStorage.setItem(UK, JSON.stringify(u));
  const norm = (e) => String(e || "").trim().toLowerCase();

  // SHA-256 özet (Web Crypto)
  async function hash(pw, salt) {
    const data = new TextEncoder().encode(salt + "::" + pw);
    const buf = await crypto.subtle.digest("SHA-256", data);
    return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
  }
  const newSalt = () => [...crypto.getRandomValues(new Uint8Array(8))].map(b => b.toString(16).padStart(2, "0")).join("");

  async function register({ name, email, phone, password, campaigns }) {
    const e = norm(email);
    if (!name || !name.trim()) throw new Error("Ad soyad gerekli.");
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) throw new Error("Geçerli bir e-posta girin.");
    if (!password || password.length < 6) throw new Error("Şifre en az 6 karakter olmalı.");
    const users = load();
    if (users.some(u => u.email === e)) throw new Error("Bu e-posta ile zaten bir hesap var. Giriş yapın.");
    const salt = newSalt();
    const user = {
      id: "U-" + Date.now().toString(36),
      name: name.trim(), email: e, phone: (phone || "").trim(),
      salt, pass: await hash(password, salt),
      campaigns: !!campaigns,           // kampanya e-postası izni
      address: "", city: "", district: "",
      created: new Date().toISOString()
    };
    users.push(user); save(users);
    localStorage.setItem(SK, user.id);
    return publicUser(user);
  }

  async function login(email, password) {
    const e = norm(email);
    const u = load().find(x => x.email === e);
    if (!u) throw new Error("Bu e-posta ile kayıtlı hesap bulunamadı.");
    const h = await hash(password, u.salt);
    if (h !== u.pass) throw new Error("Şifre hatalı.");
    localStorage.setItem(SK, u.id);
    return publicUser(u);
  }

  function logout() { localStorage.removeItem(SK); }

  function current() {
    const id = localStorage.getItem(SK);
    if (!id) return null;
    const u = load().find(x => x.id === id);
    return u ? publicUser(u) : null;
  }

  function publicUser(u) {
    const { pass, salt, ...rest } = u;
    return rest;
  }

  function updateProfile(patch) {
    const id = localStorage.getItem(SK);
    const users = load();
    const u = users.find(x => x.id === id);
    if (!u) throw new Error("Oturum bulunamadı.");
    ["name", "phone", "address", "city", "district"].forEach(k => {
      if (patch[k] !== undefined) u[k] = String(patch[k]).trim();
    });
    if (patch.campaigns !== undefined) u.campaigns = !!patch.campaigns;
    save(users);
    return publicUser(u);
  }

  async function changePassword(oldPw, newPw) {
    const id = localStorage.getItem(SK);
    const users = load();
    const u = users.find(x => x.id === id);
    if (!u) throw new Error("Oturum bulunamadı.");
    if (await hash(oldPw, u.salt) !== u.pass) throw new Error("Mevcut şifre hatalı.");
    if (!newPw || newPw.length < 6) throw new Error("Yeni şifre en az 6 karakter olmalı.");
    u.salt = newSalt(); u.pass = await hash(newPw, u.salt);
    save(users);
  }

  /* ---- şifremi unuttum: e-posta doğrulama kodu ---- */
  const CK = "montiva_reset_codes";
  const CODE_TTL = 10 * 60 * 1000;   // 10 dakika
  const MAX_TRY = 3;

  const loadCodes = () => { try { return JSON.parse(localStorage.getItem(CK)) || {}; } catch { return {}; } };
  const saveCodes = (c) => localStorage.setItem(CK, JSON.stringify(c));

  function resetInfo(email) {
    const u = load().find(x => x.email === norm(email));
    if (!u) throw new Error("Bu e-posta ile kayıtlı hesap bulunamadı.");
    return { name: u.name, email: u.email };
  }

  // 6 haneli kod üret ve sakla (kodun kendisi çağırana döner — e-posta ile gönderilir)
  function issueResetCode(email) {
    const e = norm(email);
    const u = load().find(x => x.email === e);
    if (!u) throw new Error("Bu e-posta ile kayıtlı hesap bulunamadı.");
    const code = String(crypto.getRandomValues(new Uint32Array(1))[0] % 1000000).padStart(6, "0");
    const codes = loadCodes();
    codes[e] = { code, exp: Date.now() + CODE_TTL, tries: 0 };
    saveCodes(codes);
    return { code, name: u.name, expMin: CODE_TTL / 60000 };
  }

  function verifyResetCode(email, code) {
    const e = norm(email);
    const codes = loadCodes();
    const rec = codes[e];
    if (!rec) throw new Error("Kod bulunamadı. Lütfen yeni kod isteyin.");
    if (Date.now() > rec.exp) { delete codes[e]; saveCodes(codes); throw new Error("Kodun süresi doldu. Yeni kod isteyin."); }
    if (String(code).trim() !== rec.code) {
      rec.tries++;
      if (rec.tries >= MAX_TRY) { delete codes[e]; saveCodes(codes); throw new Error("Çok fazla hatalı deneme. Lütfen yeni kod isteyin."); }
      saveCodes(codes);
      throw new Error(`Kod hatalı. Kalan deneme: ${MAX_TRY - rec.tries}`);
    }
    rec.verified = true; saveCodes(codes);
    return true;
  }

  async function resetPassword(email, newPw) {
    const e = norm(email);
    const codes = loadCodes();
    if (!codes[e] || !codes[e].verified) throw new Error("Önce e-postanıza gelen kodu doğrulayın.");
    if (Date.now() > codes[e].exp) { delete codes[e]; saveCodes(codes); throw new Error("Doğrulama süresi doldu. Baştan başlayın."); }
    if (!newPw || newPw.length < 6) throw new Error("Yeni şifre en az 6 karakter olmalı.");
    const users = load();
    const u = users.find(x => x.email === e);
    if (!u) throw new Error("Hesap bulunamadı.");
    u.salt = newSalt(); u.pass = await hash(newPw, u.salt);
    save(users);
    delete codes[e]; saveCodes(codes);      // kod tek kullanımlık
    localStorage.setItem(SK, u.id);          // sıfırlama sonrası otomatik giriş
    return publicUser(u);
  }

  // üyenin siparişleri (e-posta eşleşmesiyle — misafirken verdiği siparişler de gelir)
  function myOrders() {
    const u = current(); if (!u) return [];
    return DB.orders().filter(o => norm(o.email) === u.email).reverse();
  }
  function myReturns() {
    const u = current(); if (!u) return [];
    return DB.returns().filter(r => norm(r.email) === u.email).reverse();
  }

  // admin için: tüm üyeler (şifresiz)
  const allUsers = () => load().map(publicUser);
  const campaignEmails = () => load().filter(u => u.campaigns).map(u => u.email);

  return { register, login, logout, current, updateProfile, changePassword,
           resetInfo, issueResetCode, verifyResetCode, resetPassword,
           myOrders, myReturns, allUsers, campaignEmails };
})();

/* ---- oturum gerektiren sayfalar için yardımcı ---- */
function requireLogin(redirect) {
  if (!AUTH.current()) {
    location.href = "giris.html?next=" + encodeURIComponent(redirect || location.pathname.split("/").pop());
    return false;
  }
  return true;
}
