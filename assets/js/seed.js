// NOVORA — varsayılan tohum veriler (ilk açılışta localStorage'a yüklenir)
// Admin panelinden yapılan değişiklikler localStorage'da saklanır; "Fabrika ayarlarına dön" bunları geri yükler.

// Katalog/içerik sürümü — bunu artırınca ziyaretçilerin tarayıcısındaki eski veri
// otomatik yenilenir (siparişler, mesajlar ve sepet korunur).
const SEED_VERSION = 3;

const DEFAULT_SITE = {
  brand: "NOVORA",
  slogan: "Simple to Assemble. Beautiful to Live.",
  phone: "0850 000 00 00",
  email: "destek@novora.com.tr",
  address: "Üretim ve sevkiyat merkezi — (adres eklenecek)",
  freeShippingLimit: 500,
  currency: "₺",
  adminPass: "montiva2026",
  heroImage: "assets/img/urun/lumen-koleksiyon.webp",
  arSpotProduct: "aurelio-sage",
  arBase: "https://brtcnklyn.github.io/montiva",
  emailServiceId: "",
  emailTemplateId: "",
  emailPublicKey: ""
};

const P = "assets/img/urun/";
const M = "assets/models/";
const PDF = "assets/pdf/";

/* ---------- ortak metin blokları ---------- */
const SPEC_BAR = { "Boyutlar (G×D×Y)": "90 × 40 × 160 cm", "Malzeme": "Toz boyalı çelik + tel örgü panel", "İç Donanım": "Kadeh askısı, 8'li şaraplık, ahşap servis tablası", "Ağırlık": "27 kg", "Paket": "Tek koli, demonte", "Montaj Süresi": "40–55 dk", "Garanti": "2 yıl" };
const SPEC_VITRIN = { "Boyutlar (G×D×Y)": "80 × 40 × 130 cm", "Malzeme": "Toz boyalı çelik + genişletilmiş sac", "Raf Sayısı": "3 (ayarlanabilir)", "Raf Başına Taşıma": "15 kg", "Ağırlık": "22 kg", "Paket": "Tek koli, demonte", "Montaj Süresi": "30–40 dk", "Garanti": "2 yıl" };
const SPEC_DOLAP = { "Boyutlar (G×D×Y)": "80 × 40 × 120 cm", "Malzeme": "Toz boyalı çelik + delikli sac kapak", "Bölme": "1 kapaklı + 3 açık raf", "Raf Başına Taşıma": "12 kg", "Ağırlık": "19 kg", "Paket": "Tek koli, demonte", "Montaj Süresi": "25–35 dk", "Garanti": "2 yıl" };
const SPEC_CURVA = { "Boyutlar (G×D×Y)": "80 × 40 × 110 cm", "Malzeme": "Toz boyalı çelik, yuvarlatılmış köşe gövde", "Kapak": "Çift kapaklı, gizli menteşe", "Raflar": "2 adet, ayarlanabilir", "Ağırlık": "20 kg", "Paket": "Tek koli, demonte", "Montaj Süresi": "30–40 dk", "Garanti": "2 yıl" };
const SPEC_KONSOL = { "Boyutlar (G×D×Y)": "120 × 40 × 75 cm", "Malzeme": "Toz boyalı çelik + genişletilmiş sac kapak", "Bölme": "2 kapaklı, tek raflı", "Ayak": "Kızak ayak (metal)", "Ağırlık": "24 kg", "Paket": "Tek koli, demonte", "Montaj Süresi": "30–40 dk", "Garanti": "2 yıl" };
const SPEC_ARCO = { "Boyutlar (G×D×Y)": "70 × 38 × 140 cm", "Malzeme": "Toz boyalı çelik boru + genişletilmiş sac", "Bölme": "1 kapaklı dolap + 2 açık raf", "Renk Yapısı": "Çok renkli pastel (mavi/sarı/lila/mint)", "Ağırlık": "17 kg", "Paket": "Tek koli, demonte", "Montaj Süresi": "30–40 dk", "Garanti": "2 yıl" };
const SPEC_TRIO = { "Boyutlar (G×D×Y)": "60 × 32 × 80 cm", "Malzeme": "Toz boyalı çelik boru + delikli raf", "Raf Sayısı": "3", "Raf Başına Taşıma": "10 kg", "Ağırlık": "9 kg", "Paket": "Tek koli, demonte", "Montaj Süresi": "15–20 dk", "Garanti": "2 yıl" };
const SPEC_LUMEN = { "Boyutlar (G×D×Y)": "70 × 35 × 175 cm", "Malzeme": "Toz boyalı çelik + ince tel örgü", "Bölme": "3 açık raf + 1 kapaklı bölme", "Raf Başına Taşıma": "12 kg", "Ağırlık": "21 kg", "Paket": "Tek koli, demonte", "Montaj Süresi": "35–45 dk", "Garanti": "2 yıl" };

const MONTAJ_STD = ["Parçaları kontrol edin", "Yan panelleri taban ile birleştirin", "Rafları yerleştirin", "Kapak/menteşeleri takın", "Cıvataları çapraz sırayla sıkın", "Ayakları ayarlayın, duvara sabitleyin"];

function mk(o) {
  return Object.assign({
    active: true, badge: null, listPrice: 0, stock: 12,
    pdf: PDF + "montaj-lyra-mint.pdf",
    montaj: MONTAJ_STD, specs: SPEC_DOLAP, keywords: []
  }, o);
}

const DEFAULT_PRODUCTS = [
  /* ============ AURELIO — Bar Dolabı ============ */
  mk({ id: "aurelio-sage", name: "AURELIO Bar Dolabı", color: "Adaçayı Yeşili", hex: "#94A98B", sku: "MNT-AUR-SG",
    price: 8490, listPrice: 10990, stock: 8, badge: "Yeni", category: "Bar Dolabı",
    images: [P+"aurelio-ana.webp", P+"aurelio-katalog.webp"],
    model: M+"capella-siyah.glb", usdzModel: M+"capella-siyah.usdz", dims: "90 × 40 × 160 cm",
    short: "Kemerli tel örgü gövde, kadeh askısı ve şaraplık bölmesiyle salonunuzun yıldızı.",
    desc: "AURELIO, klasik bar dolabını modern metal estetiğiyle yeniden yorumluyor. Kemerli üst formu, ince tel örgü panelleri ve içindeki ahşap servis tablasıyla hem dekoratif hem işlevsel. Üst bölmede kadeh askısı, ortada 8 şişelik şaraplık, altta geniş saklama alanı bulunur. Demonte gönderilir, PDF kılavuzla kolayca kurulur.",
    specs: SPEC_BAR, keywords: ["aurelio","bar","dolap","şarap","kadeh","yeşil","sage"] }),
  mk({ id: "aurelio-blush", name: "AURELIO Bar Dolabı", color: "Pudra", hex: "#E8B8B0", sku: "MNT-AUR-BL", price: 8490, listPrice: 10990, stock: 6, category: "Bar Dolabı",
    images: [P+"aurelio-blush.webp", P+"aurelio-katalog.webp"], model: M+"capella-siyah.glb", usdzModel: M+"capella-siyah.usdz", dims: "90 × 40 × 160 cm",
    short: "Yumuşak pudra tonuyla sıcak ve zarif bir bar köşesi.", desc: "AURELIO'nun pudra tonu, metal gövdeye yumuşak bir zarafet katar. Kadeh askısı, şaraplık ve ahşap servis tablasıyla tam donanımlı bir bar dolabı.", specs: SPEC_BAR, keywords: ["aurelio","bar","pudra","blush","pembe"] }),
  mk({ id: "aurelio-mustard", name: "AURELIO Bar Dolabı", color: "Hardal Sarısı", hex: "#E0B84A", sku: "MNT-AUR-MS", price: 8490, listPrice: 10990, stock: 7, badge: "Çok Satan", category: "Bar Dolabı",
    images: [P+"aurelio-mustard.webp", P+"aurelio-katalog.webp"], model: M+"capella-siyah.glb", usdzModel: M+"capella-siyah.usdz", dims: "90 × 40 × 160 cm",
    short: "Hardal sarısıyla enerjik, retro esintili bir bar dolabı.", desc: "AURELIO hardal sarısı, mekâna sıcak ve iddialı bir vurgu katar. Kemerli form, tel örgü panel ve şaraplık bölmesi ile hem şık hem kullanışlı.", specs: SPEC_BAR, keywords: ["aurelio","bar","hardal","sarı","mustard"] }),
  mk({ id: "aurelio-sky", name: "AURELIO Bar Dolabı", color: "Gök Mavisi", hex: "#8FB4D9", sku: "MNT-AUR-SK", price: 8490, listPrice: 10990, stock: 9, category: "Bar Dolabı",
    images: [P+"aurelio-sky.webp", P+"aurelio-katalog.webp"], model: M+"capella-siyah.glb", usdzModel: M+"capella-siyah.usdz", dims: "90 × 40 × 160 cm",
    short: "Gök mavisi tonuyla ferah ve dingin bir sunum alanı.", desc: "AURELIO gök mavisi, açık renk mekânlarda hafif ve ferah bir etki yaratır. Kadeh askısı ve şaraplık bölmesiyle tam donanımlı bar dolabı.", specs: SPEC_BAR, keywords: ["aurelio","bar","mavi","gök","sky"] }),
  mk({ id: "aurelio-lilac", name: "AURELIO Bar Dolabı", color: "Lila", hex: "#B9A5DC", sku: "MNT-AUR-LL", price: 8490, listPrice: 10990, stock: 5, category: "Bar Dolabı",
    images: [P+"aurelio-lilac.webp", P+"aurelio-katalog.webp"], model: M+"capella-siyah.glb", usdzModel: M+"capella-siyah.usdz", dims: "90 × 40 × 160 cm",
    short: "Lila tonuyla iddialı ve modern bir bar dolabı.", desc: "AURELIO lila, cesur renk tercihlerini sevenler için. Kemerli tel örgü gövde, kadeh askısı ve şaraplık ile hem gösterişli hem fonksiyonel.", specs: SPEC_BAR, keywords: ["aurelio","bar","lila","mor","lilac"] }),
  mk({ id: "aurelio-terracotta", name: "AURELIO Bar Dolabı", color: "Terrakota", hex: "#D98B6B", sku: "MNT-AUR-TR", price: 8490, listPrice: 10990, stock: 6, category: "Bar Dolabı",
    images: [P+"aurelio-terracotta.webp", P+"aurelio-katalog.webp"], model: M+"capella-siyah.glb", usdzModel: M+"capella-siyah.usdz", dims: "90 × 40 × 160 cm",
    short: "Toprak tonlu terrakota ile sıcak, Akdeniz esintili bir bar.", desc: "AURELIO terrakota, doğal ve sıcak bir atmosfer yaratır. Kadeh askısı, 8'li şaraplık ve ahşap servis tablası standarttır.", specs: SPEC_BAR, keywords: ["aurelio","bar","terrakota","turuncu","kiremit"] }),

  /* ============ KLARA — Vitrin Dolabı ============ */
  mk({ id: "klara-sage", name: "KLARA Vitrin Dolabı", color: "Adaçayı & Krem", hex: "#A3B899", sku: "MNT-KLR-SG",
    price: 5990, listPrice: 7490, stock: 14, badge: "Çok Satan", category: "Dolap & Vitrin",
    images: [P+"klara-sage.webp", P+"klara-katalog.webp"], model: M+"capella-siyah.glb", usdzModel: M+"capella-siyah.usdz", dims: "80 × 40 × 130 cm",
    short: "Genişletilmiş sac panelli, üç raflı vitrin dolabı — hafif ve şık.",
    desc: "KLARA, genişletilmiş sac panelleri sayesinde içindekileri gösterirken tozdan koruyan modern bir vitrin dolabıdır. Üç ayarlanabilir rafı, ince metal gövdesi ve yumuşak renk paletiyle mutfakta, salonda veya çalışma odasında kullanılabilir. Demonte gönderilir, tek kişiyle 30 dakikada kurulur.",
    specs: SPEC_VITRIN, keywords: ["klara","vitrin","dolap","adaçayı","yeşil","sage"] }),
  mk({ id: "klara-blush", name: "KLARA Vitrin Dolabı", color: "Pudra & Terrakota", hex: "#E8B0A0", sku: "MNT-KLR-BL", price: 5990, listPrice: 7490, stock: 11, category: "Dolap & Vitrin",
    images: [P+"klara-blush.webp", P+"klara-katalog.webp"], model: M+"capella-siyah.glb", usdzModel: M+"capella-siyah.usdz", dims: "80 × 40 × 130 cm",
    short: "Pudra gövde ve terrakota detaylarla sıcak bir vitrin.", desc: "KLARA pudra & terrakota, yumuşak ve sıcak bir renk uyumu sunar. Üç ayarlanabilir raf, genişletilmiş sac panel ve ince metal gövde.", specs: SPEC_VITRIN, keywords: ["klara","vitrin","pudra","terrakota","pembe"] }),
  mk({ id: "klara-mint", name: "KLARA Vitrin Dolabı", color: "Mint & Lila", hex: "#A8D5BA", sku: "MNT-KLR-MN", price: 5990, listPrice: 7490, stock: 13, badge: "Yeni", category: "Dolap & Vitrin",
    images: [P+"klara-mint.webp", P+"klara-katalog.webp"], model: M+"capella-siyah.glb", usdzModel: M+"capella-siyah.usdz", dims: "80 × 40 × 130 cm",
    short: "Mint gövde, lila kulp — taze ve oyuncul bir kombinasyon.", desc: "KLARA mint & lila, pastel renkleri sevenler için tasarlandı. Mint gövde üzerinde lila kulp detayı, üç ayarlanabilir raf ve hafif metal yapı.", specs: SPEC_VITRIN, keywords: ["klara","vitrin","mint","lila","yeşil"] }),
  mk({ id: "klara-mustard", name: "KLARA Vitrin Dolabı", color: "Hardal & Fildişi", hex: "#E3BE5C", sku: "MNT-KLR-MS", price: 5990, listPrice: 7490, stock: 10, category: "Dolap & Vitrin",
    images: [P+"klara-mustard.webp", P+"klara-katalog.webp"], model: M+"capella-siyah.glb", usdzModel: M+"capella-siyah.usdz", dims: "80 × 40 × 130 cm",
    short: "Hardal sarısı gövde ile mekâna sıcak bir vurgu.", desc: "KLARA hardal & fildişi, nötr mekânlarda güçlü bir renk aksanı yaratır. Genişletilmiş sac panel ve üç ayarlanabilir raf standarttır.", specs: SPEC_VITRIN, keywords: ["klara","vitrin","hardal","sarı","fildişi"] }),
  mk({ id: "klara-cobalt", name: "KLARA Vitrin Dolabı", color: "Kobalt & Buz Mavisi", hex: "#3F6BB0", sku: "MNT-KLR-CB", price: 5990, listPrice: 7490, stock: 9, category: "Dolap & Vitrin",
    images: [P+"klara-cobalt.webp", P+"klara-katalog.webp"], model: M+"capella-siyah.glb", usdzModel: M+"capella-siyah.usdz", dims: "80 × 40 × 130 cm",
    short: "Kobalt mavi gövde, buz mavisi kulp — canlı ve modern.", desc: "KLARA kobalt & buz mavisi, iddialı bir renk tercihi. Derin mavi gövde üzerinde açık mavi kulp kontrastı, üç ayarlanabilir raf.", specs: SPEC_VITRIN, keywords: ["klara","vitrin","kobalt","mavi","buz"] }),
  mk({ id: "klara-charcoal", name: "KLARA Vitrin Dolabı", color: "Antrasit & Şeftali", hex: "#4A4E52", sku: "MNT-KLR-CH", price: 5990, listPrice: 7490, stock: 12, category: "Dolap & Vitrin",
    images: [P+"klara-charcoal.webp", P+"klara-katalog.webp"], model: M+"capella-siyah.glb", usdzModel: M+"capella-siyah.usdz", dims: "80 × 40 × 130 cm",
    short: "Antrasit gövde ve şeftali kulpla zamansız bir denge.", desc: "KLARA antrasit & şeftali, koyu gövde ile sıcak kulp detayını buluşturur. Her dekora uyum sağlayan nötr bir seçim.", specs: SPEC_VITRIN, keywords: ["klara","vitrin","antrasit","gri","şeftali"] }),

  /* ============ NORDA — Delikli Metal Dolap ============ */
  mk({ id: "norda-mavi", name: "NORDA Delikli Dolap", color: "Klein Mavi", hex: "#2E6FD9", sku: "MNT-NRD-KM",
    price: 6490, listPrice: 8290, stock: 10, badge: "Çok Satan", category: "Dolap & Vitrin",
    images: [P+"norda-mavi.webp", P+"norda-mavi-2.webp"], model: M+"fabio-siyah.glb", usdzModel: M+"fabio-siyah.usdz", dims: "80 × 40 × 120 cm",
    short: "Delikli sac kapak, yan açık raflar ve kontrast kulpla karakterli bir dolap.",
    desc: "NORDA, delikli sac kapağı ve yandaki üç açık rafıyla hem kapalı hem açık saklama sunar. Kontrast renkli uzun kulbu tasarımın imzasıdır. Kitaplarınız, vazolarınız ve sevdiğiniz objeler için ideal. Demonte gönderilir, PDF kılavuzla kolayca kurulur.",
    specs: SPEC_DOLAP, keywords: ["norda","dolap","delikli","mavi","klein"] }),
  mk({ id: "norda-buz", name: "NORDA Delikli Dolap", color: "Buz Mavisi", hex: "#A9C4DC", sku: "MNT-NRD-BZ", price: 6490, listPrice: 8290, stock: 12, category: "Dolap & Vitrin",
    images: [P+"norda-buz.webp"], model: M+"fabio-siyah.glb", usdzModel: M+"fabio-siyah.usdz", dims: "80 × 40 × 120 cm",
    short: "Buz mavisi gövde, mercan kulp — yumuşak ve ferah.", desc: "NORDA buz mavisi, dingin ve ferah mekânlar için. Delikli sac kapak, yan açık raflar ve mercan kulp detayı.", specs: SPEC_DOLAP, keywords: ["norda","dolap","buz","mavi","açık"] }),
  mk({ id: "norda-lacivert", name: "NORDA Delikli Dolap", color: "Lacivert", hex: "#2C4A6E", sku: "MNT-NRD-LC", price: 6490, listPrice: 8290, stock: 8, category: "Dolap & Vitrin",
    images: [P+"norda-lacivert.webp"], model: M+"fabio-siyah.glb", usdzModel: M+"fabio-siyah.usdz", dims: "80 × 40 × 120 cm",
    short: "Derin lacivert gövde ile şık ve zamansız.", desc: "NORDA lacivert, koyu ve sofistike bir görünüm sunar. Kırmızı kulp kontrastı tasarıma canlılık katar.", specs: SPEC_DOLAP, keywords: ["norda","dolap","lacivert","koyu","mavi"] }),
  mk({ id: "norda-bordo", name: "NORDA Delikli Dolap", color: "Bordo", hex: "#6E2F45", sku: "MNT-NRD-BR", price: 6490, listPrice: 8290, stock: 7, category: "Dolap & Vitrin",
    images: [P+"norda-bordo.webp"], model: M+"fabio-siyah.glb", usdzModel: M+"fabio-siyah.usdz", dims: "80 × 40 × 120 cm",
    short: "Bordo gövde ve hardal kulpla zengin bir renk uyumu.", desc: "NORDA bordo, sıcak ve zengin bir atmosfer yaratır. Hardal sarısı kulp detayı ile klasik bir kontrast.", specs: SPEC_DOLAP, keywords: ["norda","dolap","bordo","kırmızı","mor"] }),
  mk({ id: "norda-petrol", name: "NORDA Delikli Dolap", color: "Petrol Mavisi", hex: "#6E97A3", sku: "MNT-NRD-PT", price: 6490, listPrice: 8290, stock: 11, badge: "Yeni", category: "Dolap & Vitrin",
    images: [P+"norda-petrol.webp"], model: M+"fabio-siyah.glb", usdzModel: M+"fabio-siyah.usdz", dims: "80 × 40 × 120 cm",
    short: "Petrol mavisi ve turuncu kulpla dengeli, modern bir duruş.", desc: "NORDA petrol mavisi, doğal ışıkta değişen zarif bir tondur. Turuncu kulp aksanıyla modern bir denge kurar.", specs: SPEC_DOLAP, keywords: ["norda","dolap","petrol","mavi","turkuaz"] }),

  /* ============ CURVA — Yuvarlak Köşe Dolap ============ */
  mk({ id: "curva-turkuaz", name: "CURVA Yuvarlak Köşe Dolap", color: "Turkuaz & Yavruağzı", hex: "#7FA8A4", sku: "MNT-CRV-TQ",
    price: 6990, listPrice: 8790, stock: 9, badge: "Yeni", category: "Dolap & Vitrin",
    images: [P+"curva-turkuaz.webp", P+"curva-turkuaz-2.webp", P+"curva-katalog.webp"],
    model: M+"fabio-mint.glb", usdzModel: M+"fabio-mint.usdz", dims: "80 × 40 × 110 cm",
    short: "Yuvarlatılmış köşeler, ince delikli gövde ve yavruağzı kulp.",
    desc: "CURVA, yumuşak yuvarlatılmış köşeleri ve tamamen delikli metal gövdesiyle hafif, havadar bir görünüm sunar. Yavruağzı kulp detayı sıcak bir kontrast yaratır. Gizli menteşe sistemi ve ayarlanabilir rafları ile fonksiyonel. 60/80/90/120 cm boyut seçenekleri mevcuttur.",
    specs: SPEC_CURVA, keywords: ["curva","dolap","turkuaz","yuvarlak","yavruağzı"] }),

  /* ============ LINEA — Alçak Konsol ============ */
  mk({ id: "linea-petrol", name: "LINEA Alçak Konsol", color: "Petrol Mavisi", hex: "#5A7A93", sku: "MNT-LNA-PT",
    price: 5490, listPrice: 6990, stock: 13, badge: "Çok Satan", category: "Konsol & Sideboard",
    images: [P+"linea-mavi-ana.webp", P+"linea-mavi.webp"], model: M+"lyra-siyah.glb", usdzModel: M+"lyra-siyah.usdz", dims: "120 × 40 × 75 cm",
    short: "Genişletilmiş sac kapaklar, kızak ayak ve kırmızı kulp aksanı.",
    desc: "LINEA, televizyon ünitesi veya konsol olarak kullanabileceğiniz alçak bir metal dolaptır. Genişletilmiş sac kapakları havadar bir görünüm sunarken, kızak ayakları modern bir duruş kazandırır. Kırmızı oval kulplar tasarımın imzasıdır.",
    specs: SPEC_KONSOL, keywords: ["linea","konsol","sideboard","tv","petrol","mavi"] }),
  mk({ id: "linea-kiremit", name: "LINEA Alçak Konsol", color: "Kiremit", hex: "#C96A55", sku: "MNT-LNA-KR", price: 5490, listPrice: 6990, stock: 10, category: "Konsol & Sideboard",
    images: [P+"linea-kiremit.webp"], model: M+"lyra-siyah.glb", usdzModel: M+"lyra-siyah.usdz", dims: "120 × 40 × 75 cm",
    short: "Kiremit tonu ile sıcak ve karakterli bir konsol.", desc: "LINEA kiremit, mekâna toprak tonlu bir sıcaklık katar. Genişletilmiş sac kapaklar ve kızak ayak detayı.", specs: SPEC_KONSOL, keywords: ["linea","konsol","kiremit","turuncu","terrakota"] }),
  mk({ id: "linea-bej", name: "LINEA Alçak Konsol", color: "Kum Beji", hex: "#D6C6AC", sku: "MNT-LNA-BJ", price: 5490, listPrice: 6990, stock: 11, category: "Konsol & Sideboard",
    images: [P+"linea-bej.webp"], model: M+"lyra-mint.glb", usdzModel: M+"lyra-mint.usdz", dims: "120 × 40 × 75 cm",
    short: "Kum beji ile nötr, her dekora uyan bir seçim.", desc: "LINEA kum beji, sakin ve nötr mekânlar için ideal. Turuncu kulp aksanı sıcak bir detay ekler.", specs: SPEC_KONSOL, keywords: ["linea","konsol","bej","kum","krem"] }),
  mk({ id: "linea-yesil", name: "LINEA Alçak Konsol", color: "Adaçayı Yeşili", hex: "#94A98B", sku: "MNT-LNA-YS", price: 5490, listPrice: 6990, stock: 12, category: "Konsol & Sideboard",
    images: [P+"linea-yesil.webp"], model: M+"lyra-mint.glb", usdzModel: M+"lyra-mint.usdz", dims: "120 × 40 × 75 cm",
    short: "Adaçayı yeşili ile doğal ve dingin bir konsol.", desc: "LINEA adaçayı, doğa tonlarını sevenler için. Genişletilmiş sac kapaklar ve pudra kulp detayı.", specs: SPEC_KONSOL, keywords: ["linea","konsol","yeşil","adaçayı","sage"] }),
  mk({ id: "linea-antrasit", name: "LINEA Alçak Konsol", color: "Antrasit", hex: "#3E434A", sku: "MNT-LNA-AN", price: 5490, listPrice: 6990, stock: 9, category: "Konsol & Sideboard",
    images: [P+"linea-antrasit.webp"], model: M+"lyra-siyah.glb", usdzModel: M+"lyra-siyah.usdz", dims: "120 × 40 × 75 cm",
    short: "Antrasit gövde ve sarı kulpla güçlü bir kontrast.", desc: "LINEA antrasit, koyu ve modern mekânlar için. Hardal sarısı kulp detayı canlı bir vurgu yaratır.", specs: SPEC_KONSOL, keywords: ["linea","konsol","antrasit","gri","siyah"] }),

  /* ============ ARCO — Pastel Kemerli Dolap ============ */
  mk({ id: "arco-pastel", name: "ARCO Kemerli Dolap", color: "Pastel Mix", hex: "#A9C6E8", sku: "MNT-ARC-PM",
    price: 7290, listPrice: 9190, stock: 7, badge: "Tasarım", category: "Dolap & Vitrin",
    images: [P+"arco-pastel.webp", P+"arco-pastel-2.webp", P+"arco-sari.webp", P+"arco-vitrin.webp"],
    model: M+"lyra-mint.glb", usdzModel: M+"lyra-mint.usdz", dims: "70 × 38 × 140 cm",
    short: "Mavi çerçeve, sarı kapak, lila ve mint raflar — sanat eseri gibi bir parça.",
    desc: "ARCO, kemerli boru çerçevesi ve çok renkli pastel paletiyle bir mobilyadan fazlası. Sarı genişletilmiş sac kapaklı dolap bölmesi, lila açık raf ve mint delikli alt raf bir arada. Renkleri sevenler için tasarlanmış, mekânın odak noktası olacak bir parça.",
    specs: SPEC_ARCO, keywords: ["arco","kemerli","pastel","mavi","sarı","lila","mint"] }),

  /* ============ TRIO — Pastel Açık Raf ============ */
  mk({ id: "trio-pastel", name: "TRIO Pastel Raf", color: "Pastel Mix", hex: "#C9B8E4", sku: "MNT-TRI-PM",
    price: 2790, listPrice: 3590, stock: 18, badge: "Uygun Fiyat", category: "Raf & Kitaplık",
    images: [P+"trio-pastel.webp"], model: M+"lyra-mint.glb", usdzModel: M+"lyra-mint.usdz", dims: "60 × 32 × 80 cm",
    short: "Lila, sarı ve mint raflarla üç katlı kompakt yan sehpa.",
    desc: "TRIO, dar alanlar için tasarlanmış üç katlı pastel raf ünitesidir. Mavi boru gövde üzerine lila düz tabla, sarı ve mint delikli raflar. Yatak odasında komodin, salonda yan sehpa, banyoda düzenleyici olarak kullanılabilir. 15 dakikada kurulur.",
    specs: SPEC_TRIO, keywords: ["trio","raf","pastel","sehpa","lila","sarı","mint"] }),

  /* ============ LUMEN — Kemerli Vitrin Kitaplık ============ */
  mk({ id: "lumen-sage", name: "LUMEN Kemerli Kitaplık", color: "Adaçayı Yeşili", hex: "#94A98B", sku: "MNT-LMN-SG",
    price: 7990, listPrice: 9990, stock: 10, badge: "Çok Satan", category: "Raf & Kitaplık",
    images: [P+"lumen-koleksiyon.webp", P+"lumen-katalog.webp", P+"lumen-duvar.webp"],
    model: M+"capella-siyah.glb", usdzModel: M+"capella-siyah.usdz", dims: "70 × 35 × 175 cm",
    short: "Kemerli üst form, ince tel örgü sırt ve kapaklı alt bölme.",
    desc: "LUMEN, kemerli üst formu ve ince tel örgü sırtıyla klasik ile moderni buluşturan bir kitaplıktır. Üstte üç açık raf, altta kapaklı saklama bölmesi bulunur. Kitaplarınız, bitkileriniz ve dekoratif objeleriniz için ideal bir vitrin.",
    specs: SPEC_LUMEN, keywords: ["lumen","kitaplık","raf","kemerli","yeşil","adaçayı"] }),
  mk({ id: "lumen-sky", name: "LUMEN Kemerli Kitaplık", color: "Gök Mavisi", hex: "#8FB4D9", sku: "MNT-LMN-SK", price: 7990, listPrice: 9990, stock: 11, category: "Raf & Kitaplık",
    images: [P+"lumen-koleksiyon.webp", P+"lumen-katalog.webp"], model: M+"capella-siyah.glb", usdzModel: M+"capella-siyah.usdz", dims: "70 × 35 × 175 cm",
    short: "Gök mavisi tonuyla ferah ve hafif bir kitaplık.", desc: "LUMEN gök mavisi, açık mekânlarda havadar bir etki yaratır. Kemerli form, tel örgü sırt ve kapaklı alt bölme.", specs: SPEC_LUMEN, keywords: ["lumen","kitaplık","mavi","gök","sky"] }),
  mk({ id: "lumen-mercan", name: "LUMEN Kemerli Kitaplık", color: "Mercan", hex: "#E0937A", sku: "MNT-LMN-MR", price: 7990, listPrice: 9990, stock: 8, category: "Raf & Kitaplık",
    images: [P+"lumen-koleksiyon.webp", P+"lumen-katalog.webp"], model: M+"capella-siyah.glb", usdzModel: M+"capella-siyah.usdz", dims: "70 × 35 × 175 cm",
    short: "Mercan tonuyla sıcak ve canlı bir vitrin kitaplık.", desc: "LUMEN mercan, mekâna enerjik bir sıcaklık katar. Kemerli üst form ve kapaklı alt bölme ile hem dekoratif hem işlevsel.", specs: SPEC_LUMEN, keywords: ["lumen","kitaplık","mercan","turuncu","şeftali"] }),
  mk({ id: "lumen-hardal", name: "LUMEN Kemerli Kitaplık", color: "Hardal Sarısı", hex: "#E0B84A", sku: "MNT-LMN-HR", price: 7990, listPrice: 9990, stock: 9, category: "Raf & Kitaplık",
    images: [P+"lumen-koleksiyon.webp", P+"lumen-katalog.webp"], model: M+"capella-siyah.glb", usdzModel: M+"capella-siyah.usdz", dims: "70 × 35 × 175 cm",
    short: "Hardal sarısıyla retro esintili, sıcak bir kitaplık.", desc: "LUMEN hardal sarısı, nötr mekânlarda güçlü bir odak noktası oluşturur. Üç açık raf ve kapaklı alt bölme.", specs: SPEC_LUMEN, keywords: ["lumen","kitaplık","hardal","sarı"] }),
  mk({ id: "lumen-lila", name: "LUMEN Kemerli Kitaplık", color: "Lila", hex: "#B9A5DC", sku: "MNT-LMN-LL", price: 7990, listPrice: 9990, stock: 7, badge: "Yeni", category: "Raf & Kitaplık",
    images: [P+"lumen-koleksiyon.webp", P+"lumen-katalog.webp"], model: M+"capella-siyah.glb", usdzModel: M+"capella-siyah.usdz", dims: "70 × 35 × 175 cm",
    short: "Lila tonuyla yumuşak ve iddialı bir kitaplık.", desc: "LUMEN lila, pastel tonları sevenler için özel. Kemerli form ve ince tel örgü sırt ile zarif bir duruş.", specs: SPEC_LUMEN, keywords: ["lumen","kitaplık","lila","mor"] }),

  /* ============ MIRA — Askılı Duvar Rafı ============ */
  mk({ id: "mira-sage", name: "MIRA Askılı Duvar Rafı", color: "Adaçayı Yeşili", hex: "#94A98B", sku: "MNT-MRA-SG",
    price: 1890, listPrice: 2490, stock: 22, badge: "Uygun Fiyat", category: "Raf & Kitaplık",
    images: [P+"lumen-duvar.webp", P+"lumen-katalog.webp"], model: M+"lyra-mint.glb", usdzModel: M+"lyra-mint.usdz", dims: "60 × 15 × 50 cm",
    short: "Kemerli çerçeve, tel örgü sırt ve altında kupa askıları.",
    desc: "MIRA, mutfak veya çalışma duvarınız için tasarlanmış kompakt bir askılı raftır. Kemerli metal çerçevesi, tel örgü sırtı ve alt kısmındaki üç kancasıyla kupalarınızı, küçük bitkilerinizi ve kitaplarınızı düzenlemenizi sağlar.",
    specs: { "Boyutlar (G×D×Y)": "60 × 15 × 50 cm", "Malzeme": "Toz boyalı çelik + tel örgü", "Raf Sayısı": "2", "Kanca": "3 adet", "Ağırlık": "4,5 kg", "Paket": "Tek koli, demonte", "Montaj Süresi": "15–20 dk", "Garanti": "2 yıl" },
    keywords: ["mira","duvar","raf","askı","kupa","yeşil"] }),
  mk({ id: "mira-sky", name: "MIRA Askılı Duvar Rafı", color: "Gök Mavisi", hex: "#8FB4D9", sku: "MNT-MRA-SK", price: 1890, listPrice: 2490, stock: 20, category: "Raf & Kitaplık",
    images: [P+"lumen-duvar.webp"], model: M+"lyra-mint.glb", usdzModel: M+"lyra-mint.usdz", dims: "60 × 15 × 50 cm",
    short: "Gök mavisi tonuyla ferah bir duvar rafı.", desc: "MIRA gök mavisi, mutfak ve banyo duvarları için ferah bir çözüm. Kemerli çerçeve, tel örgü sırt ve kupa askıları.",
    specs: { "Boyutlar (G×D×Y)": "60 × 15 × 50 cm", "Malzeme": "Toz boyalı çelik + tel örgü", "Raf Sayısı": "2", "Kanca": "3 adet", "Ağırlık": "4,5 kg", "Paket": "Tek koli, demonte", "Montaj Süresi": "15–20 dk", "Garanti": "2 yıl" },
    keywords: ["mira","duvar","raf","mavi","gök"] }),
  mk({ id: "mira-mercan", name: "MIRA Askılı Duvar Rafı", color: "Mercan", hex: "#E0937A", sku: "MNT-MRA-MR", price: 1890, listPrice: 2490, stock: 19, category: "Raf & Kitaplık",
    images: [P+"lumen-duvar.webp"], model: M+"lyra-mint.glb", usdzModel: M+"lyra-mint.usdz", dims: "60 × 15 × 50 cm",
    short: "Mercan tonuyla sıcak ve canlı bir duvar rafı.", desc: "MIRA mercan, mekâna neşeli bir dokunuş katar. Kemerli çerçeve ve alt kancalarıyla hem dekoratif hem pratik.",
    specs: { "Boyutlar (G×D×Y)": "60 × 15 × 50 cm", "Malzeme": "Toz boyalı çelik + tel örgü", "Raf Sayısı": "2", "Kanca": "3 adet", "Ağırlık": "4,5 kg", "Paket": "Tek koli, demonte", "Montaj Süresi": "15–20 dk", "Garanti": "2 yıl" },
    keywords: ["mira","duvar","raf","mercan","turuncu"] }),

  /* ============ PERFO — Uzun Delikli Dolap ============ */
  mk({ id: "perfo-mavi", name: "PERFO Uzun Dolap", color: "Açık Mavi", hex: "#8FB4D9", sku: "MNT-PRF-MV",
    price: 9490, listPrice: 11990, stock: 6, badge: "Yeni", category: "Dolap & Vitrin",
    images: [P+"perfo-kule.webp", P+"perfo-katalog.webp", P+"perfo-renkler.webp"],
    model: M+"capella-siyah.glb", usdzModel: M+"capella-siyah.usdz", dims: "90 × 45 × 180 cm",
    short: "İnce ayaklı, tamamen delikli sac gövdeli uzun boy dolap.",
    desc: "PERFO, ince uzun ayakları ve tamamen delikli sac gövdesiyle hafif görünen ama yüksek kapasiteli bir dolaptır. Pirinç kulp detayı ve 8 farklı renk seçeneğiyle her mekâna uyum sağlar. Giyim odası, hol veya çalışma alanı için ideal.",
    specs: { "Boyutlar (G×D×Y)": "90 × 45 × 180 cm", "Malzeme": "Toz boyalı çelik + delikli sac", "Kapak": "Çift kapaklı, pirinç kulp", "Raflar": "3 adet, ayarlanabilir", "Ağırlık": "32 kg", "Paket": "İki koli, demonte", "Montaj Süresi": "50–65 dk", "Garanti": "2 yıl" },
    keywords: ["perfo","dolap","uzun","delikli","mavi"] }),
  mk({ id: "perfo-adacayi", name: "PERFO Uzun Dolap", color: "Adaçayı Yeşili", hex: "#94A98B", sku: "MNT-PRF-AD", price: 9490, listPrice: 11990, stock: 7, category: "Dolap & Vitrin",
    images: [P+"perfo-kule.webp", P+"perfo-renkler.webp"], model: M+"capella-siyah.glb", usdzModel: M+"capella-siyah.usdz", dims: "90 × 45 × 180 cm",
    short: "Adaçayı yeşili ile doğal ve sakin bir uzun dolap.", desc: "PERFO adaçayı, doğa tonlarını mekâna taşır. Genişletilmiş sac gövde ve pirinç kulp detayı.",
    specs: { "Boyutlar (G×D×Y)": "90 × 45 × 180 cm", "Malzeme": "Toz boyalı çelik + genişletilmiş sac", "Kapak": "Çift kapaklı, pirinç kulp", "Raflar": "3 adet, ayarlanabilir", "Ağırlık": "32 kg", "Paket": "İki koli, demonte", "Montaj Süresi": "50–65 dk", "Garanti": "2 yıl" },
    keywords: ["perfo","dolap","yeşil","adaçayı"] }),
  mk({ id: "perfo-lila", name: "PERFO Uzun Dolap", color: "Lila", hex: "#B9A5DC", sku: "MNT-PRF-LL", price: 9490, listPrice: 11990, stock: 5, category: "Dolap & Vitrin",
    images: [P+"perfo-kule.webp", P+"perfo-renkler.webp"], model: M+"capella-siyah.glb", usdzModel: M+"capella-siyah.usdz", dims: "90 × 45 × 180 cm",
    short: "Lila tonuyla iddialı ve modern bir uzun dolap.", desc: "PERFO lila, cesur renk tercihlerini sevenler için. Delikli sac gövde ve ince ayak detayı.",
    specs: { "Boyutlar (G×D×Y)": "90 × 45 × 180 cm", "Malzeme": "Toz boyalı çelik + delikli sac", "Kapak": "Çift kapaklı, pirinç kulp", "Raflar": "3 adet, ayarlanabilir", "Ağırlık": "32 kg", "Paket": "İki koli, demonte", "Montaj Süresi": "50–65 dk", "Garanti": "2 yıl" },
    keywords: ["perfo","dolap","lila","mor"] }),
  mk({ id: "perfo-hardal", name: "PERFO Uzun Dolap", color: "Hardal Sarısı", hex: "#E0B84A", sku: "MNT-PRF-HR", price: 9490, listPrice: 11990, stock: 6, category: "Dolap & Vitrin",
    images: [P+"perfo-kule.webp", P+"perfo-renkler.webp"], model: M+"capella-siyah.glb", usdzModel: M+"capella-siyah.usdz", dims: "90 × 45 × 180 cm",
    short: "Hardal sarısıyla sıcak ve iddialı bir uzun dolap.", desc: "PERFO hardal sarısı, mekânın odak noktası olacak canlı bir seçim. Genişletilmiş sac gövde.",
    specs: { "Boyutlar (G×D×Y)": "90 × 45 × 180 cm", "Malzeme": "Toz boyalı çelik + genişletilmiş sac", "Kapak": "Çift kapaklı, pirinç kulp", "Raflar": "3 adet, ayarlanabilir", "Ağırlık": "32 kg", "Paket": "İki koli, demonte", "Montaj Süresi": "50–65 dk", "Garanti": "2 yıl" },
    keywords: ["perfo","dolap","hardal","sarı"] }),
  mk({ id: "perfo-terrakota", name: "PERFO Uzun Dolap", color: "Terrakota", hex: "#C96A55", sku: "MNT-PRF-TR", price: 9490, listPrice: 11990, stock: 5, category: "Dolap & Vitrin",
    images: [P+"perfo-kule.webp", P+"perfo-renkler.webp"], model: M+"capella-siyah.glb", usdzModel: M+"capella-siyah.usdz", dims: "90 × 45 × 180 cm",
    short: "Terrakota tonuyla toprak sıcaklığında bir uzun dolap.", desc: "PERFO terrakota, Akdeniz esintili sıcak bir ton. Delikli sac gövde ve pirinç kulp.",
    specs: { "Boyutlar (G×D×Y)": "90 × 45 × 180 cm", "Malzeme": "Toz boyalı çelik + delikli sac", "Kapak": "Çift kapaklı, pirinç kulp", "Raflar": "3 adet, ayarlanabilir", "Ağırlık": "32 kg", "Paket": "İki koli, demonte", "Montaj Süresi": "50–65 dk", "Garanti": "2 yıl" },
    keywords: ["perfo","dolap","terrakota","turuncu"] }),

  /* ============ MESA — Expanded Metal Konsol ============ */
  mk({ id: "mesa-lagoon", name: "MESA Metal Konsol", color: "Lagün Mavisi", hex: "#7FA3CC", sku: "MNT-MSA-LG",
    price: 4990, listPrice: 6390, stock: 15, badge: "Çok Satan", category: "Konsol & Sideboard",
    images: [P+"mesa-koleksiyon.webp", P+"mesa-renkler.webp"], model: M+"lyra-siyah.glb", usdzModel: M+"lyra-siyah.usdz", dims: "100 × 40 × 80 cm",
    short: "Genişletilmiş sac kapak, ince tel ayak ve mercan kulp.",
    desc: "MESA, hafif tel ayakları ve genişletilmiş sac kapaklarıyla minimal bir konsol dolabıdır. Salonda, holde veya yatak odasında kullanılabilir. Yan açıklık, çekmeceli ve alt raflı versiyonları mevcuttur.",
    specs: { "Boyutlar (G×D×Y)": "100 × 40 × 80 cm", "Malzeme": "Toz boyalı çelik + genişletilmiş sac", "Bölme": "2 kapaklı, tek raflı", "Ayak": "İnce tel kızak ayak", "Ağırlık": "18 kg", "Paket": "Tek koli, demonte", "Montaj Süresi": "25–35 dk", "Garanti": "2 yıl" },
    keywords: ["mesa","konsol","lagün","mavi","sideboard"] }),
  mk({ id: "mesa-clay", name: "MESA Metal Konsol", color: "Kiremit", hex: "#C96A55", sku: "MNT-MSA-CL", price: 4990, listPrice: 6390, stock: 12, category: "Konsol & Sideboard",
    images: [P+"mesa-koleksiyon.webp", P+"mesa-renkler.webp"], model: M+"lyra-siyah.glb", usdzModel: M+"lyra-siyah.usdz", dims: "100 × 40 × 80 cm",
    short: "Kiremit tonu ve krem kulpla sıcak bir konsol.", desc: "MESA kiremit, toprak tonlarıyla sıcak bir atmosfer yaratır. Genişletilmiş sac kapak ve ince tel ayak.",
    specs: { "Boyutlar (G×D×Y)": "100 × 40 × 80 cm", "Malzeme": "Toz boyalı çelik + genişletilmiş sac", "Bölme": "2 kapaklı, tek raflı", "Ayak": "İnce tel kızak ayak", "Ağırlık": "18 kg", "Paket": "Tek koli, demonte", "Montaj Süresi": "25–35 dk", "Garanti": "2 yıl" },
    keywords: ["mesa","konsol","kiremit","turuncu"] }),
  mk({ id: "mesa-forest", name: "MESA Metal Konsol", color: "Orman Yeşili", hex: "#7C8C6E", sku: "MNT-MSA-FR", price: 4990, listPrice: 6390, stock: 13, category: "Konsol & Sideboard",
    images: [P+"mesa-koleksiyon.webp", P+"mesa-renkler.webp"], model: M+"lyra-mint.glb", usdzModel: M+"lyra-mint.usdz", dims: "100 × 40 × 80 cm",
    short: "Orman yeşili ve pudra kulpla doğal bir denge.", desc: "MESA orman yeşili, dingin ve doğal mekânlar için. Pudra kulp detayı yumuşak bir kontrast sağlar.",
    specs: { "Boyutlar (G×D×Y)": "100 × 40 × 80 cm", "Malzeme": "Toz boyalı çelik + genişletilmiş sac", "Bölme": "2 kapaklı, tek raflı", "Ayak": "İnce tel kızak ayak", "Ağırlık": "18 kg", "Paket": "Tek koli, demonte", "Montaj Süresi": "25–35 dk", "Garanti": "2 yıl" },
    keywords: ["mesa","konsol","yeşil","orman"] }),
  mk({ id: "mesa-citrus", name: "MESA Metal Konsol", color: "Tereyağı Sarısı", hex: "#E5B93C", sku: "MNT-MSA-CT", price: 4990, listPrice: 6390, stock: 11, category: "Konsol & Sideboard",
    images: [P+"mesa-koleksiyon.webp", P+"mesa-renkler.webp"], model: M+"lyra-siyah.glb", usdzModel: M+"lyra-siyah.usdz", dims: "100 × 40 × 80 cm",
    short: "Tereyağı sarısı ve kobalt kulpla enerjik bir konsol.", desc: "MESA tereyağı sarısı, mekâna neşe katar. Kobalt mavi kulp kontrastı modern bir dokunuş.",
    specs: { "Boyutlar (G×D×Y)": "100 × 40 × 80 cm", "Malzeme": "Toz boyalı çelik + genişletilmiş sac", "Bölme": "2 kapaklı, tek raflı", "Ayak": "İnce tel kızak ayak", "Ağırlık": "18 kg", "Paket": "Tek koli, demonte", "Montaj Süresi": "25–35 dk", "Garanti": "2 yıl" },
    keywords: ["mesa","konsol","sarı","tereyağı","citrus"] }),
  mk({ id: "mesa-berry", name: "MESA Metal Konsol", color: "Lavanta", hex: "#B9A5DC", sku: "MNT-MSA-BR", price: 4990, listPrice: 6390, stock: 10, badge: "Yeni", category: "Konsol & Sideboard",
    images: [P+"mesa-koleksiyon.webp", P+"mesa-renkler.webp"], model: M+"lyra-mint.glb", usdzModel: M+"lyra-mint.usdz", dims: "100 × 40 × 80 cm",
    short: "Lavanta tonu ve bordo kulpla zarif bir kombinasyon.", desc: "MESA lavanta, yumuşak mor tonuyla zarif bir seçim. Bordo kulp detayı derinlik katar.",
    specs: { "Boyutlar (G×D×Y)": "100 × 40 × 80 cm", "Malzeme": "Toz boyalı çelik + genişletilmiş sac", "Bölme": "2 kapaklı, tek raflı", "Ayak": "İnce tel kızak ayak", "Ağırlık": "18 kg", "Paket": "Tek koli, demonte", "Montaj Süresi": "25–35 dk", "Garanti": "2 yıl" },
    keywords: ["mesa","konsol","lavanta","mor","berry"] })
];

const DEFAULT_CONTENT = {
  home: {
    heroEyebrow: "Renkli Metal Mobilya Koleksiyonu",
    heroTitle1: "Rengini seç,",
    heroHighlight: "evini yeniden yaz",
    heroTitle2: "",
    heroLead: "NOVORA, toz boyalı metal mobilyaları pastel yeşilden lavantaya uzanan bir renk paletiyle üretir. Demonte gönderir, anlaşılır PDF kılavuzla kapına getirir.",
    cta1: "Koleksiyonu Keşfet",
    cta2: "Almadan Önce Evinde Gör",
    stats: [
      { n: "30 dk", l: "ortalama montaj" }, { n: "2 yıl", l: "garanti" },
      { n: "24 renk", l: "seçeneği" }, { n: "7/24", l: "AI canlı destek" }
    ],
    productsHeading: "Öne Çıkan Ürünler",
    productsSub: "Bar dolabından kitaplığa, konsoldan vitrine — hepsi demonte, hepsi renkli.",
    features: [
      { i: "truck", t: "Ücretsiz Kargo", d: "500 TL üzeri tüm siparişlerde Türkiye'nin her yerine." },
      { i: "sparkle", t: "24 Renk Seçeneği", d: "Pastel yeşilden lavantaya, mekânına uyanı seç." },
      { i: "file", t: "PDF Kılavuz", d: "Adım adım görsel montaj kılavuzu her üründe." },
      { i: "scan", t: "3D Önizleme & AR", d: "Ürünü 3D incele, telefonunla evine gerçek boyutta yerleştir." }
    ],
    steps: [
      { t: "Rengini Seç", d: "24 renk seçeneği arasından mekânına en çok yakışanı seç." },
      { t: "Demonte Kargo", d: "Ürünün güçlendirilmiş kolide, parçalar halinde kapına gelsin." },
      { t: "PDF ile Kur", d: "Kutudaki alyan anahtarı ve PDF kılavuzla ~30 dakikada kur." },
      { t: "Keyfini Çıkar", d: "Mekânın hazır! Sorun olursa AI destek her an yanında." }
    ],
    ctaTitle: "Aklına takılan bir şey mi var?",
    ctaText: "Yapay zekâ destekli asistanımız MONTI; ürünler, renkler, kargo, montaj ve iade hakkında tüm sorularını saniyeler içinde yanıtlar.",
    ctaButton: "Canlı Desteğe Bağlan"
  },
  about: {
    title: "Hakkımızda",
    sub: "İki ortak, bir atölye ve renkli bir fikir: metal mobilyayı sıkıcı olmaktan çıkarmak.",
    blocks: [
      { h: "NOVORA'nın Hikâyesi", p: "Adımız \"yeni\" anlamına gelen <i>novo</i> kökünden geliyor; sloganımız da işimizi özetliyor: <b>Simple to Assemble. Beautiful to Live.</b> — Kurması kolay, yaşaması güzel. NOVORA, iki ortağın hayaliyle kuruldu: biri tasarımı ve dijital deneyimi, diğeri üretimi üstlendi. Amacımız basit — showroom masrafı, aracı maliyeti ve şişirilmiş fiyatlar olmadan, doğrudan atölyeden evinize renkli ve kaliteli mobilya ulaştırmak." },
      { h: "Neden Renk?", p: "Metal mobilya denince akla hep gri, siyah, beyaz gelir. Biz bunu değiştirmek istedik. Adaçayı yeşilinden lavantaya, tereyağı sarısından terrakotaya uzanan paletimizle her mekâna ve her karaktere uyan bir seçenek sunuyoruz. Elektrostatik toz boya sayesinde renkler solmaz, çizilmez." },
      { h: "Neden Demonte?", p: "Basit bir gerçek var: mobilya demonte taşındığında kargo hasarı azalır, nakliye maliyeti düşer ve bu tasarruf doğrudan fiyata yansır. Biz de tüm ürünlerimizi demonte üretiyor, anlaşılır PDF kılavuzlar ve kutudan çıkan aletlerle ortalama 30-60 dakikada kurulabilecek şekilde tasarlıyoruz. Üstelik her ürünü 3D olarak inceleyip AR ile evinize gerçek boyutunda yerleştirebilirsiniz." },
      { h: "Üretim Anlayışımız", p: "Tüm ürünlerimiz kendi atölyemizde, yerli çelik ile üretilir. Gövdeler elektrostatik toz boya ile kaplanır; delikli ve genişletilmiş sac paneller kendi tesisimizde şekillendirilir. Her ürün 2 yıl garantilidir ve tüm parçalar için yedek parça desteği sunuyoruz — tek bir vida bile eksik çıksa 48 saat içinde yenisini gönderiyoruz." }
    ]
  },
  contact: {
    title: "İletişim",
    sub: "Sorularınız için buradayız — en hızlı yanıt için sağ alttaki AI canlı desteği deneyin."
  },
  faq: {
    title: "Sıkça Sorulan Sorular",
    sub: "Cevabını bulamadığınız sorular için sağ alttaki AI canlı desteğe yazabilirsiniz.",
    items: [
      { q: "Ürünler monteli mi geliyor?", a: "Hayır, tüm ürünlerimiz demonte (parçalar halinde) gönderilir. Bu sayede kargo hasarı en aza iner ve fiyatlar düşük kalır. Montaj için gereken alyan anahtarı kutuya dahildir." },
      { q: "Kaç renk seçeneği var?", a: "Koleksiyonumuzda adaçayı yeşili, mint, gök mavisi, kobalt, lacivert, petrol, lila, lavanta, hardal sarısı, tereyağı, terrakota, kiremit, mercan, pudra, kum beji, bordo ve antrasit dahil 24'ten fazla renk bulunur. Her ürünün sayfasında mevcut renkleri görebilirsiniz." },
      { q: "Renkler solar mı, çizilir mi?", a: "Ürünlerimiz elektrostatik toz boya ile kaplanır. Bu yöntem, ıslak boyaya göre çok daha dayanıklı ve homojen bir yüzey sağlar; normal kullanımda solma ve çizilme yapmaz." },
      { q: "Montaj ne kadar sürer, zor mu?", a: "Ürüne göre 15-65 dakika arasında değişir. Her ürünün sayfasından indirebileceğiniz adım adım PDF kılavuz ile herhangi bir ustalık gerektirmeden kurabilirsiniz. Büyük ürünlerde 2 kişi öneriyoruz." },
      { q: "Kargo ücreti ne kadar? Ne zaman elime ulaşır?", a: "500 TL üzeri tüm siparişlerde kargo ücretsizdir — yani tüm ürünlerimiz ücretsiz kargoludur. Siparişler 1-3 iş günü içinde kargoya verilir, teslimat genellikle 2-4 iş günü sürer." },
      { q: "İade ve değişim koşulları nelerdir?", a: "Teslimattan itibaren 14 gün içinde koşulsuz iade hakkınız vardır. Ürünün monte edilmemiş ve orijinal ambalajında olması gerekir. İade kargo ücreti hasar/ayıp durumunda bize aittir." },
      { q: "Parça eksik veya hasarlı çıkarsa ne yapmalıyım?", a: "Fotoğrafıyla birlikte destek@novora.com.tr adresine yazmanız yeterli. Eksik veya hasarlı parçanız 48 saat içinde ücretsiz olarak kargolanır — ürünü iade etmenize gerek kalmaz." },
      { q: "3D önizleme ve AR nasıl çalışıyor?", a: "Her ürün sayfasında ürünü fareyle döndürüp yakınlaştırabileceğiniz bir 3D model bulunur. Telefonunuzdan girerseniz 'Evimde Gör' butonuyla kameranızı açıp ürünü gerçek boyutunda odanıza yerleştirebilirsiniz." },
      { q: "Hangi ödeme yöntemlerini kullanabilirim?", a: "Kredi/banka kartı (Visa, Mastercard, Troy), havale/EFT (%3 indirimli) ve kapıda ödeme (+49,90 TL) seçenekleri mevcuttur." }
    ]
  }
};

// Ürün bazlı müşteri yorumları
const DEFAULT_REVIEWS = {};
const _revPool = [
  [ { n: "Elif K.", c: "İstanbul", r: 5, d: "2 hafta önce", t: "Rengi fotoğraftaki gibi çıktı, çok memnunum. Kurulumu tek başıma yarım saatte bitirdim." },
    { n: "Seda A.", c: "Bursa", r: 5, d: "1 ay önce", t: "AR ile önce salona yerleştirip baktım, ölçü tam oturdu. Metal kalitesi beklediğimden iyi." },
    { n: "Gökhan T.", c: "Antalya", r: 4, d: "1 ay önce", t: "Çok şık duruyor, montaj kolay. Tek eksik bir vidaydı, yazdım ertesi gün kargoladılar." } ],
  [ { n: "Murat D.", c: "Ankara", r: 5, d: "3 hafta önce", t: "Boya kalitesi gerçekten iyi, hiçbir yerinde kusur yok. Salonuma çok yakıştı." },
    { n: "Aylin V.", c: "İzmir", r: 5, d: "2 hafta önce", t: "PDF kılavuz o kadar netti ki hiç zorlanmadım. Raflar sağlam, sallanma yok." },
    { n: "Can B.", c: "Kocaeli", r: 4, d: "1 ay önce", t: "Paketleme çok sağlamdı, hiçbir yeri çizilmemişti. Beklediğimden hızlı geldi." } ],
  [ { n: "Zeynep Y.", c: "İstanbul", r: 5, d: "1 hafta önce", t: "Tam aradığım renk buydu. Mekânıma karakter kattı, herkes nereden aldığımı soruyor." },
    { n: "Emre S.", c: "Eskişehir", r: 5, d: "3 hafta önce", t: "İki kişi 40 dakikada kurduk. Metal gövde çok kaliteli. Kesinlikle tavsiye ederim." },
    { n: "Deniz K.", c: "İzmir", r: 4, d: "1 ay önce", t: "Fonksiyonel ve şık bir ürün. Kargo biraz geç geldi ama ürünü görünce unuttum." } ]
];
DEFAULT_PRODUCTS.forEach((p, i) => { DEFAULT_REVIEWS[p.id] = _revPool[i % _revPool.length]; });

function getReviews(id) {
  const stored = (function () { try { return JSON.parse(localStorage.getItem("montiva_reviews")); } catch { return null; } })();
  const all = stored || DEFAULT_REVIEWS;
  return all[id] || [];
}

// Üye yorumu ekler; aynı üye aynı ürüne tekrar yazarsa eskisini günceller
function addUserReview(id, rev) {
  const stored = (function () { try { return JSON.parse(localStorage.getItem("montiva_reviews")); } catch { return null; } })();
  const all = stored || JSON.parse(JSON.stringify(DEFAULT_REVIEWS));
  all[id] = all[id] || [];
  const i = all[id].findIndex(r => r.e && rev.e && r.e === rev.e);
  if (i >= 0) all[id][i] = rev; else all[id].unshift(rev);
  localStorage.setItem("montiva_reviews", JSON.stringify(all));
}
