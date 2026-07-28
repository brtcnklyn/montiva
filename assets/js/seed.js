// MONTIVA — varsayılan tohum veriler (ilk açılışta localStorage'a yüklenir)
// Admin panelinden yapılan değişiklikler localStorage'da saklanır; "Fabrika ayarlarına dön" bunları geri yükler.

const DEFAULT_SITE = {
  brand: "MONTIVA",
  slogan: "Kur. Kullan. Keyfini çıkar.",
  phone: "0850 000 00 00",
  email: "destek@montiva.com.tr",
  address: "Üretim ve sevkiyat merkezi — (adres eklenecek)",
  freeShippingLimit: 500,
  currency: "₺",
  adminPass: "montiva2026",
  heroImage: "assets/img/hero-bg.svg",
  arSpotProduct: "capella-siyah",
  arBase: "https://brtcnklyn.github.io/montiva"
};

const DEFAULT_PRODUCTS = [
  {
    id: "lyra-mint", name: "LYRA Kahve Köşesi & Mutfak Rafı", color: "Mint Yeşili", sku: "MNT-LYRA-M",
    price: 3959.99, listPrice: 4949.99, stock: 14, badge: "Çok Satan", active: true,
    images: ["assets/img/lyra-mint-1.webp", "assets/img/lyra-mint-2.webp", "assets/img/lyra-mint-3.webp", "assets/img/lyra-mint-4.webp"],
    model: "assets/models/lyra-mint.glb", usdzModel: "assets/models/lyra-mint.usdz", dims: "64 × 40 × 156 cm", category: "Kahve Köşesi",
    pdf: "assets/pdf/montaj-lyra-mint.pdf",
    short: "Atlantik çam raflar ve mint yeşili metal gövdeyle mutfağınıza modern bir kahve istasyonu.",
    desc: "LYRA, mutfakta yer kaplamadan şık bir kahve köşesi kurmak isteyenler için tasarlandı. Atlantik çam ahşap rafları ve toz boyalı metal gövdesiyle hem dayanıklı hem de estetik. Kahve makinesi, kapsül standı, fincanlar ve küçük mutfak aletleri için 5 ayrı seviye sunar. Demonte gönderilir; ortalama 30 dakikada, tek kişiyle kolayca kurulur.",
    specs: { "Boyutlar (G×D×Y)": "64 × 40 × 156 cm", "Malzeme": "Atlantik çam suntalam + toz boyalı metal profil", "Raf Sayısı": "5", "Raf Başına Taşıma": "12 kg", "Ağırlık": "18,5 kg", "Paket": "Tek koli, demonte", "Montaj Süresi": "25–35 dk", "Garanti": "2 yıl" },
    montaj: ["Parçaları kontrol edin", "Yan çerçeveleri alt tablayla birleştirin", "Rafları yerleştirin", "Cıvataları çapraz sırayla sıkın", "Duvara sabitleyin"],
    keywords: ["lyra", "mint", "yeşil", "raf", "kahve köşesi", "mutfak rafı"]
  },
  {
    id: "lyra-siyah", name: "LYRA Kahve Köşesi & Mutfak Rafı", color: "Siyah", sku: "MNT-LYRA-S",
    price: 3599.99, listPrice: 4499.99, stock: 22, badge: "İndirimde", active: true,
    images: ["assets/img/lyra-siyah-1.webp", "assets/img/lyra-siyah-2.webp", "assets/img/lyra-siyah-3.webp"],
    model: "assets/models/lyra-siyah.glb", usdzModel: "assets/models/lyra-siyah.usdz", dims: "64 × 40 × 156 cm", category: "Kahve Köşesi",
    pdf: "assets/pdf/montaj-lyra-siyah.pdf",
    short: "Endüstriyel siyah gövde ve doğal ahşap raflarla her dekora uyan kahve istasyonu.",
    desc: "LYRA'nın siyah versiyonu, endüstriyel tarzı sevenler için ideal. Mat siyah toz boyalı metal gövdesi doğal ahşap raflarla buluşur; mutfağınızda, salonunuzda hatta ofisinizde şık bir kahve ve sunum alanı yaratır. Demonte gönderilir; ortalama 30 dakikada, tek kişiyle kolayca kurulur.",
    specs: { "Boyutlar (G×D×Y)": "64 × 40 × 156 cm", "Malzeme": "Atlantik çam suntalam + toz boyalı metal profil", "Raf Sayısı": "5", "Raf Başına Taşıma": "12 kg", "Ağırlık": "18,5 kg", "Paket": "Tek koli, demonte", "Montaj Süresi": "25–35 dk", "Garanti": "2 yıl" },
    montaj: ["Parçaları kontrol edin", "Yan çerçeveleri alt tablayla birleştirin", "Rafları yerleştirin", "Cıvataları çapraz sırayla sıkın", "Duvara sabitleyin"],
    keywords: ["lyra", "siyah", "raf", "kahve köşesi", "mutfak rafı", "endüstriyel"]
  },
  {
    id: "fabio-siyah", name: "FABIO Kahve Köşesi & Fırın Dolabı", color: "Siyah", sku: "MNT-FABIO-S",
    price: 5239.99, listPrice: 6539.99, stock: 9, badge: "Yeni", active: true,
    images: ["assets/img/fabio-siyah-1.webp", "assets/img/fabio-siyah-2.webp", "assets/img/fabio-siyah-3.webp", "assets/img/fabio-siyah-4.webp"],
    model: "assets/models/fabio-siyah.glb", usdzModel: "assets/models/fabio-siyah.usdz", dims: "70 × 45 × 168 cm", category: "Mutfak & Fırın Dolabı",
    pdf: "assets/pdf/montaj-fabio-siyah.pdf",
    short: "Mikrodalga rafı, kapaklı dolabı ve açık raflarıyla komple bir mutfak çözümü.",
    desc: "FABIO tek üründe üç işlevi birleştirir: kahve köşesi, mutfak rafı ve mikrodalga fırın dolabı. 15 kg taşıma kapasiteli güçlendirilmiş fırın rafı, kapaklı saklama dolabı ve açık raflarıyla küçük mutfaklarda maksimum depolama sağlar. Metal gövdesi uzun ömürlü kullanım için toz boyayla kaplanmıştır. Demonte gönderilir; 2 kişiyle 45 dakikada kurulur.",
    specs: { "Boyutlar (G×D×Y)": "70 × 45 × 168 cm", "Malzeme": "Suntalam + toz boyalı metal gövde", "Mikrodalga Rafı": "15 kg kapasiteli, güçlendirilmiş", "Dolap": "2 kapaklı + 2 açık raf", "Ağırlık": "26 kg", "Paket": "İki koli, demonte", "Montaj Süresi": "40–50 dk", "Garanti": "2 yıl" },
    montaj: ["Parçaları kontrol edin", "Metal profilleri alt modüle bağlayın", "Mikrodalga rafını 4 noktadan sabitleyin", "Üst dolabı monte edin", "Kapak ayarlarını yapın", "Duvara sabitleyin"],
    keywords: ["fabio", "siyah", "mikrodalga", "fırın", "dolap", "kapaklı"]
  },
  {
    id: "fabio-mint", name: "FABIO Kahve Köşesi & Fırın Dolabı", color: "Mint Yeşili", sku: "MNT-FABIO-M",
    price: 5719.99, listPrice: 7139.99, stock: 6, badge: null, active: true,
    images: ["assets/img/fabio-mint-1.webp", "assets/img/fabio-mint-2.webp", "assets/img/fabio-mint-3.webp", "assets/img/fabio-mint-4.webp"],
    model: "assets/models/fabio-mint.glb", usdzModel: "assets/models/fabio-mint.usdz", dims: "70 × 45 × 168 cm", category: "Mutfak & Fırın Dolabı",
    pdf: "assets/pdf/montaj-fabio-mint.pdf",
    short: "Mint yeşili dokunuşuyla mutfağınıza renk katan çok amaçlı fırın dolabı.",
    desc: "FABIO'nun mint yeşili versiyonu, fonksiyonelliği pastel bir estetikle buluşturur. Güçlendirilmiş mikrodalga rafı, kapaklı dolabı ve açık raflarıyla komple bir mutfak istasyonudur. Retro tarzda mutfaklar için birebirdir. Demonte gönderilir; 2 kişiyle 45 dakikada kurulur.",
    specs: { "Boyutlar (G×D×Y)": "70 × 45 × 168 cm", "Malzeme": "Suntalam + toz boyalı metal gövde", "Mikrodalga Rafı": "15 kg kapasiteli, güçlendirilmiş", "Dolap": "2 kapaklı + 2 açık raf", "Ağırlık": "26 kg", "Paket": "İki koli, demonte", "Montaj Süresi": "40–50 dk", "Garanti": "2 yıl" },
    montaj: ["Parçaları kontrol edin", "Metal profilleri alt modüle bağlayın", "Mikrodalga rafını 4 noktadan sabitleyin", "Üst dolabı monte edin", "Kapak ayarlarını yapın", "Duvara sabitleyin"],
    keywords: ["fabio", "mint", "yeşil", "mikrodalga", "fırın", "dolap"]
  },
  {
    id: "capella-siyah", name: "CAPELLA Kahve Köşesi Standı", color: "Siyah Metal", sku: "MNT-CAPELLA-S",
    price: 4759.99, listPrice: 6629.99, stock: 11, badge: "%28 İndirim", active: true,
    images: ["assets/img/capella-siyah-1.webp", "assets/img/capella-siyah-2.webp", "assets/img/capella-siyah-3.webp", "assets/img/capella-siyah-4.webp"],
    model: "assets/models/capella-siyah.glb", usdzModel: "assets/models/capella-siyah.usdz", dims: "80 × 40 × 180 cm", category: "Çok Amaçlı Dolap",
    pdf: "assets/pdf/montaj-capella-siyah.pdf",
    short: "Tel kapaklı dolabı ve 80×180 cm boyutuyla geniş depolamalı kahve standı.",
    desc: "CAPELLA, serinin en geniş ürünü. 80 cm genişliğinde ve 180 cm yüksekliğindeki gövdesi, tel kapaklı dolabı ve ayarlanabilir raflarıyla hem dekoratif hem de yüksek kapasiteli bir depolama alanı sunar. Mıknatıslı tel kapakları içindekileri gösterirken tozdan korur. Demonte gönderilir; 2 kişiyle yaklaşık 1 saatte kurulur.",
    specs: { "Boyutlar (G×D×Y)": "80 × 40 × 180 cm", "Malzeme": "Suntalam + toz boyalı metal gövde", "Dolap": "Mıknatıslı tel kapaklı", "Raflar": "5 cm aralıklarla ayarlanabilir", "Ağırlık": "31 kg", "Paket": "İki koli, demonte", "Montaj Süresi": "45–60 dk", "Garanti": "2 yıl" },
    montaj: ["Parçaları kontrol edin", "Dikey profilleri tabana bağlayın", "Tel kapaklı modülü sabitleyin", "Rafları istediğiniz seviyeye takın", "Üst tablayı monte edin", "Duvara sabitleyin"],
    keywords: ["capella", "siyah", "tel kapak", "stand", "geniş", "180"]
  }
];

const DEFAULT_CONTENT = {
  home: {
    heroEyebrow: "Yeni Nesil Demonte Mobilya",
    heroTitle1: "Mobilyanı",
    heroHighlight: "kendin kur",
    heroTitle2: "farkı hemen gör.",
    heroLead: "MONTIVA, kahve köşesi ve mutfak düzenleyici mobilyaları demonte olarak üretir, anlaşılır PDF kılavuzlarla kapına getirir. Alyan anahtarı bizden, keyif senden.",
    cta1: "Ürünleri Keşfet",
    cta2: "Nasıl Çalışır?",
    stats: [
      { n: "30 dk", l: "ortalama montaj" }, { n: "2 yıl", l: "garanti" },
      { n: "%100", l: "yerli üretim" }, { n: "7/24", l: "AI canlı destek" }
    ],
    productsHeading: "Öne Çıkan Ürünler",
    productsSub: "Kahve köşenizi kurmanız için ihtiyacınız olan her şey — demonte, dayanıklı ve şık.",
    features: [
      { i: "truck", t: "Ücretsiz Kargo", d: "500 TL üzeri tüm siparişlerde Türkiye'nin her yerine." },
      { i: "wrench", t: "Alet Dahil", d: "Montaj için gereken alyan anahtarı her kutuda." },
      { i: "file", t: "PDF Kılavuz", d: "Adım adım görsel montaj kılavuzu her üründe." },
      { i: "scan", t: "3D Önizleme & AR", d: "Ürünü 3D incele, telefonunla evine gerçek boyutta yerleştir." }
    ],
    steps: [
      { t: "Seç & Sipariş Ver", d: "Ürününü seç, güvenli ödeme ile siparişini tamamla." },
      { t: "Demonte Kargo", d: "Ürünün güçlendirilmiş kolide, parçalar halinde kapına gelsin." },
      { t: "PDF ile Kur", d: "Kutudaki alyan anahtarı ve PDF kılavuzla ~30 dakikada kur." },
      { t: "Keyfini Çıkar", d: "Kahve köşen hazır! Sorun olursa AI destek her an yanında." }
    ],
    ctaTitle: "Aklına takılan bir şey mi var?",
    ctaText: "Yapay zekâ destekli asistanımız MONTI; ürünler, kargo, montaj ve iade hakkında tüm sorularını saniyeler içinde yanıtlar.",
    ctaButton: "Canlı Desteğe Bağlan"
  },
  about: {
    title: "Hakkımızda",
    sub: "İki ortak, bir atölye ve büyük bir fikir: kaliteli mobilyayı herkes için ulaşılabilir kılmak.",
    blocks: [
      { h: "MONTIVA'nın Hikâyesi", p: "MONTIVA, iki ortağın hayaliyle kuruldu: biri tasarımı ve dijital deneyimi, diğeri üretimi üstlendi. Amacımız basit — showroom masrafı, aracı maliyeti ve şişirilmiş fiyatlar olmadan, doğrudan atölyeden evinize kaliteli mobilya ulaştırmak." },
      { h: "Neden Demonte?", p: "Basit bir gerçek var: mobilya demonte taşındığında kargo hasarı azalır, nakliye maliyeti düşer ve bu tasarruf doğrudan fiyata yansır. Biz de tüm ürünlerimizi demonte üretiyor, anlaşılır PDF kılavuzlar ve kutudan çıkan aletlerle ortalama 30-60 dakikada kurulabilecek şekilde tasarlıyoruz. Üstelik her ürünü 3D olarak inceleyip AR ile evinize gerçek boyutunda yerleştirebilirsiniz." },
      { h: "Üretim Anlayışımız", p: "Tüm ürünlerimiz kendi atölyemizde, yerli malzemeyle üretilir. Metal gövdeler toz boya ile kaplanır, ahşap yüzeylerde E1 standardında suntalam kullanılır. Her ürün 2 yıl garantilidir ve tüm parçalar için yedek parça desteği sunuyoruz — tek bir vida bile eksik çıksa 48 saat içinde yenisini gönderiyoruz." },
      { h: "Teknoloji ile Destek", p: "Küçük bir ekibiz ama desteğimiz büyük: sitemizdeki yapay zekâ asistanımız MONTI, ürün seçiminden montaj sorularına kadar 7/24 yanınızda. Ayrıca her ürünü 3D olarak inceleyebilir, telefonunuzun kamerasıyla evinize gerçek boyutunda yerleştirebilirsiniz." }
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
      { q: "Montaj ne kadar sürer, zor mu?", a: "Ürüne göre 25-60 dakika arasında değişir. Her ürünün sayfasından indirebileceğiniz adım adım PDF kılavuz ile herhangi bir ustalık gerektirmeden kurabilirsiniz. LYRA tek kişiyle, FABIO ve CAPELLA için 2 kişi öneriyoruz." },
      { q: "Kargo ücreti ne kadar? Ne zaman elime ulaşır?", a: "500 TL üzeri tüm siparişlerde kargo ücretsizdir — yani tüm ürünlerimiz ücretsiz kargoludur. Siparişler 1-3 iş günü içinde kargoya verilir, teslimat genellikle 2-4 iş günü sürer." },
      { q: "İade ve değişim koşulları nelerdir?", a: "Teslimattan itibaren 14 gün içinde koşulsuz iade hakkınız vardır. Ürünün monte edilmemiş ve orijinal ambalajında olması gerekir. İade kargo ücreti hasar/ayıp durumunda bize aittir." },
      { q: "Parça eksik veya hasarlı çıkarsa ne yapmalıyım?", a: "Fotoğrafıyla birlikte destek@montiva.com.tr adresine yazmanız yeterli. Eksik veya hasarlı parçanız 48 saat içinde ücretsiz olarak kargolanır — ürünü iade etmenize gerek kalmaz." },
      { q: "Garanti süresi ne kadar?", a: "Tüm ürünlerimiz 2 yıl garantilidir. Ayrıca tüm ürünler için ömür boyu yedek parça desteği sunuyoruz." },
      { q: "3D önizleme ve AR nasıl çalışıyor?", a: "Her ürün sayfasında ürünü fareyle döndürüp yakınlaştırabileceğiniz bir 3D model bulunur. Telefonunuzdan girerseniz 'Evimde Gör' butonuyla kameranızı açıp ürünü gerçek boyutunda odanıza yerleştirebilirsiniz." },
      { q: "Hangi ödeme yöntemlerini kullanabilirim?", a: "Kredi/banka kartı (Visa, Mastercard, Troy), havale/EFT (%3 indirimli) ve kapıda ödeme (+49,90 TL) seçenekleri mevcuttur." }
    ]
  }
};

// Ürün bazlı müşteri yorumları (admin ileride düzenleyebilir)
const DEFAULT_REVIEWS = {
  "lyra-mint": [
    { n: "Elif K.", c: "İstanbul", r: 5, d: "2 hafta önce", t: "Mint yeşili tam umduğum gibi çıktı, mutfağıma renk kattı. Kurulumu tek başıma 25 dakikada bitirdim." },
    { n: "Seda A.", c: "Bursa", r: 5, d: "1 ay önce", t: "AR ile önce mutfağıma yerleştirip baktım, ölçü tam oturdu. Raflar sağlam, kahve köşem harika oldu." },
    { n: "Gökhan T.", c: "Antalya", r: 4, d: "1 ay önce", t: "Ürün çok şık, montaj kolay. Tek eksik bir vidaydı, yazdım ertesi gün kargoladılar." }
  ],
  "lyra-siyah": [
    { n: "Murat D.", c: "Ankara", r: 5, d: "3 hafta önce", t: "Siyah gövde salonuma çok yakıştı, endüstriyel bir hava kattı. Kalitesi fiyatının üstünde." },
    { n: "Aylin V.", c: "İzmir", r: 5, d: "2 hafta önce", t: "PDF kılavuz o kadar netti ki hiç zorlanmadım. Rafların taşıma kapasitesi de gayet iyi." },
    { n: "Can B.", c: "Kocaeli", r: 4, d: "1 ay önce", t: "Paketleme çok sağlamdı, hiçbir yeri çizilmemişti. Montaj beklediğimden hızlı oldu." }
  ],
  "fabio-siyah": [
    { n: "Zeynep Y.", c: "İstanbul", r: 5, d: "1 hafta önce", t: "Mikrodalgamı koydum, raf çok sağlam. Kapaklı bölüm sayesinde mutfağım çok daha düzenli görünüyor." },
    { n: "Emre S.", c: "Eskişehir", r: 5, d: "3 hafta önce", t: "İki kişi 40 dakikada kurduk. Metal gövde çok kaliteli, sallanma yok. Kesinlikle tavsiye ederim." },
    { n: "Hakan M.", c: "Adana", r: 4, d: "1 ay önce", t: "Fonksiyonel bir ürün, her şey elimin altında. Montaj videosu da olsa süper olurmuş." }
  ],
  "fabio-mint": [
    { n: "Deniz K.", c: "İzmir", r: 5, d: "2 hafta önce", t: "Mint rengi mutfağıma retro bir hava kattı, çok beğenildi. Depolama alanı gerçekten bol." },
    { n: "Buse T.", c: "Ankara", r: 5, d: "1 ay önce", t: "Hem şık hem kullanışlı. AR özelliğiyle rengin mutfağıma uyup uymayacağını önceden gördüm, çok işime yaradı." },
    { n: "Onur A.", c: "Bursa", r: 4, d: "3 hafta önce", t: "Kaliteli ürün, kurulumu kolay. Kargo biraz geç geldi ama ürün değince unuttum." }
  ],
  "capella-siyah": [
    { n: "Merve A.", c: "İstanbul", r: 5, d: "1 hafta önce", t: "Tel kapaklı dolap hem şık hem pratik. 180 cm boyu depolama derdimi tamamen çözdü." },
    { n: "Serkan Ö.", c: "Ankara", r: 5, d: "2 hafta önce", t: "Duvara sabitleme kiti dahil, çok güvenli. İki kişi bir saatte kurduk, sonuç çok profesyonel." },
    { n: "İpek D.", c: "Muğla", r: 4, d: "1 ay önce", t: "Geniş ve dayanıklı. Raf aralıkları ayarlanabiliyor, ihtiyacıma göre düzenledim. Memnunum." }
  ]
};
function getReviews(id) {
  const stored = (function(){ try { return JSON.parse(localStorage.getItem("montiva_reviews")); } catch { return null; } })();
  const all = stored || DEFAULT_REVIEWS;
  return all[id] || [];
}
