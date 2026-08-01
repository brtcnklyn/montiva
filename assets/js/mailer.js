// NOVORA — e-posta gönderimi (EmailJS üzerinden, arka uç gerektirmez)
// Admin → Ayarlar → E-posta Servisi bölümünden 3 anahtar girilince gerçek e-posta gider.
// Anahtarlar boşsa DEMO modunda çalışır: kod ekranda gösterilir, e-posta gitmez.
const MAILER = (() => {
  const cfg = () => {
    const s = (typeof DB !== "undefined") ? DB.site() : {};
    return {
      serviceId: (s.emailServiceId || "").trim(),
      templateId: (s.emailTemplateId || "").trim(),
      publicKey: (s.emailPublicKey || "").trim()
    };
  };
  const isReady = () => { const c = cfg(); return !!(c.serviceId && c.templateId && c.publicKey); };

  // EmailJS betiğini yalnızca gerektiğinde yükle
  let loading = null;
  function loadSdk() {
    if (window.emailjs) return Promise.resolve();
    if (loading) return loading;
    loading = new Promise((res, rej) => {
      const sc = document.createElement("script");
      sc.src = "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js";
      sc.onload = res;
      sc.onerror = () => rej(new Error("E-posta servisi yüklenemedi (internet bağlantısını kontrol edin)."));
      document.head.appendChild(sc);
    });
    return loading;
  }

  /**
   * Şifre sıfırlama kodunu gönderir.
   * @returns {Promise<{sent:boolean, demo:boolean}>}
   */
  async function sendResetCode({ toEmail, toName, code, expMin }) {
    const c = cfg();
    const brand = (typeof DB !== "undefined") ? DB.site().brand : "NOVORA";
    if (!isReady()) return { sent: false, demo: true };   // demo modu

    await loadSdk();
    window.emailjs.init({ publicKey: c.publicKey });
    await window.emailjs.send(c.serviceId, c.templateId, {
      to_email: toEmail,
      to_name: toName || "",
      passcode: code,
      code: code,                    // şablonda hangi ad kullanılırsa
      expires_min: String(expMin),
      brand: brand,
      subject: `${brand} — Şifre sıfırlama kodunuz: ${code}`,
      message: `Merhaba ${toName || ""},\n\n${brand} hesabınız için şifre sıfırlama kodunuz: ${code}\n` +
               `Bu kod ${expMin} dakika geçerlidir.\n\nBu talebi siz yapmadıysanız bu e-postayı yok sayabilirsiniz.`
    });
    return { sent: true, demo: false };
  }

  return { isReady, sendResetCode };
})();
