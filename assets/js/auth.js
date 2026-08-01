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

  /* ---- şifremi unuttum ----
     Not: Gerçek sistemde sıfırlama bağlantısı e-posta ile gönderilir (arka uç gerekir).
     Burada kimlik, hesapta kayıtlı telefonun son 4 hanesiyle doğrulanır. */
  function resetInfo(email) {
    const u = load().find(x => x.email === norm(email));
    if (!u) throw new Error("Bu e-posta ile kayıtlı hesap bulunamadı.");
    const tel = (u.phone || "").replace(/\D/g, "");
    // güvenlik: son 4 hane ipucu olarak DÖNDÜRÜLMEZ — doğrulamanın anlamı kalmazdı
    return { name: u.name, hasPhone: tel.length >= 4 };
  }

  async function resetPassword(email, last4, newPw) {
    const users = load();
    const u = users.find(x => x.email === norm(email));
    if (!u) throw new Error("Bu e-posta ile kayıtlı hesap bulunamadı.");
    const tel = (u.phone || "").replace(/\D/g, "");
    if (tel.length >= 4) {
      if (String(last4).replace(/\D/g, "") !== tel.slice(-4))
        throw new Error("Telefon numaranızın son 4 hanesi eşleşmiyor.");
    }
    if (!newPw || newPw.length < 6) throw new Error("Yeni şifre en az 6 karakter olmalı.");
    u.salt = newSalt(); u.pass = await hash(newPw, u.salt);
    save(users);
    localStorage.setItem(SK, u.id);   // sıfırlama sonrası otomatik giriş
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
           resetInfo, resetPassword, myOrders, myReturns, allUsers, campaignEmails };
})();

/* ---- oturum gerektiren sayfalar için yardımcı ---- */
function requireLogin(redirect) {
  if (!AUTH.current()) {
    location.href = "giris.html?next=" + encodeURIComponent(redirect || location.pathname.split("/").pop());
    return false;
  }
  return true;
}
