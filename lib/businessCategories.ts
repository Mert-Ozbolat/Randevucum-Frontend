export type BusinessCategoryGroup = {
  name: string;
  subcategories: string[];
};

/**
 * İşletme kaydı: alan (ana kategori) → meslek (alt kategori).
 * Backend `areaProfessionData.js` ile senkron tutulmalı.
 */
export const BUSINESS_CATEGORY_GROUPS: BusinessCategoryGroup[] = [
  {
    name: 'Sağlık',
    subcategories: [
      'Psikolog',
      'Psikiyatrist',
      'Diyetisyen',
      'Fizyoterapist',
      'Diş Hekimi',
      'Göz Doktoru',
      'Estetik Kliniği',
      'Tıbbi Laboratuvar',
      'Aile Hekimi / Genel Pratisyen',
      'Hemşirelik & Evde Sağlık',
      'Osteopat / Manuel Terapist',
    ],
  },
  {
    name: 'Güzellik & Bakım',
    subcategories: [
      'Kuaför',
      'Berber',
      'Güzellik Uzmanı',
      'Lazer Epilasyon Merkezi',
      'Manikür & Pedikür',
      'Kirpik & Kaş Tasarımı',
      'Cilt Bakımı',
      'Masaj Salonu',
      'SPA & Hamam',
      'Kaş Microblading',
      'Profesyonel Makyaj',
    ],
  },
  {
    name: 'Spor & Wellness',
    subcategories: [
      'Pilates Eğitmeni',
      'Yoga Eğitmeni',
      'Fitness & Personal Trainer',
      'Yüzme Antrenörü',
      'Grup Ders Eğitmeni',
      'Beslenme & Spor Koçluğu',
    ],
  },
  {
    name: 'Eğitim',
    subcategories: [
      'Özel Ders (İlköğretim / Lise)',
      'Özel Ders (Üniversite)',
      'Yabancı Dil Kursu',
      'Yazılım & IT Kursu',
      'Müzik Kursu',
      'Resim & Sanat Atölyesi',
      'Sürücü Kursu',
      'Halk Eğitim / Meslek Kursu',
    ],
  },
  {
    name: 'Danışmanlık & Hukuk',
    subcategories: [
      'Avukatlık',
      'Mali Müşavirlik',
      'İş & Yönetim Danışmanlığı',
      'İnsan Kaynakları Danışmanlığı',
      'Emlak Danışmanlığı',
      'Kariyer Koçluğu',
      'Yeminli Müşavirlik',
    ],
  },
  {
    name: 'Otomotiv',
    subcategories: [
      'Oto Tamir & Mekanik Servis',
      'Oto Yıkama & Detay',
      'Lastik & Balans',
      'Araç Klima Servisi',
      'Kaporta & Boya',
      'Ekspertiz',
      'Oto Elektrik',
    ],
  },
  {
    name: 'Ev & Teknik Hizmet',
    subcategories: [
      'Elektrikçi',
      'Tesisatçı',
      'Klima Montaj & Bakım',
      'Uydu & İnternet Kurulum',
      'Marangoz',
      'Boyacı',
      'Çilingir',
      'Halı & Koltuk Yıkama',
      'Temizlik Hizmeti',
    ],
  },
  {
    name: 'Hayvan Bakımı',
    subcategories: [
      'Veteriner Kliniği',
      'Pet Kuaförü',
      'Köpek Eğitmeni',
      'Pet Otel & Pansiyon',
      'Pet Aşı & Sağlık Takibi',
      'Pet Bakım & Günlük İzleme',
    ],
  },
  {
    name: 'Yeme & İçme',
    subcategories: ['Restoran', 'Cafe & Kahve', 'Pastane & Fırın', 'Catering & Davet Yemeği', 'Fast Food'],
  },
  {
    name: 'Turizm & Etkinlik',
    subcategories: [
      'Tekne Turu',
      'Dalış Merkezi',
      'Araç Kiralama',
      'Profesyonel Fotoğrafçı',
      'Düğün & Etkinlik Organizasyonu',
      'Konaklama & Pansiyon',
    ],
  },
  {
    name: 'Diğer',
    subcategories: ['Diğer İşletme'],
  },
];

/** Alt kategori etiketi → API `businessType` slug */
export const SUBCATEGORY_TO_BUSINESS_TYPE: Record<string, string> = {
  Psikolog: 'psychologist',
  Psikiyatrist: 'psychologist',
  Diyetisyen: 'dietitian',
  Fizyoterapist: 'physiotherapist',
  'Diş Hekimi': 'dental_clinic',
  'Göz Doktoru': 'eye_doctor',
  'Estetik Kliniği': 'aesthetic_clinic',
  'Tıbbi Laboratuvar': 'lab',
  'Aile Hekimi / Genel Pratisyen': 'other',
  'Hemşirelik & Evde Sağlık': 'other',
  'Osteopat / Manuel Terapist': 'physiotherapist',

  Kuaför: 'hair_salon',
  Berber: 'barber',
  'Güzellik Uzmanı': 'beauty_center',
  'Lazer Epilasyon Merkezi': 'laser_epilation',
  'Manikür & Pedikür': 'nail_salon',
  'Kirpik & Kaş Tasarımı': 'lash_brow',
  'Cilt Bakımı': 'skin_care',
  'Masaj Salonu': 'massage_salon',
  'SPA & Hamam': 'spa_hamam',
  'Kaş Microblading': 'lash_brow',
  'Profesyonel Makyaj': 'beauty_center',

  'Pilates Eğitmeni': 'pilates_yoga_instructor',
  'Yoga Eğitmeni': 'pilates_yoga_instructor',
  'Fitness & Personal Trainer': 'pilates_yoga_instructor',
  'Yüzme Antrenörü': 'pilates_yoga_instructor',
  'Grup Ders Eğitmeni': 'pilates_yoga_instructor',
  'Beslenme & Spor Koçluğu': 'dietitian',

  'Özel Ders (İlköğretim / Lise)': 'private_tutor',
  'Özel Ders (Üniversite)': 'private_tutor',
  'Yabancı Dil Kursu': 'language_course',
  'Yazılım & IT Kursu': 'software_course',
  'Müzik Kursu': 'private_tutor',
  'Resim & Sanat Atölyesi': 'private_tutor',
  'Sürücü Kursu': 'driving_school',
  'Halk Eğitim / Meslek Kursu': 'software_course',

  Avukatlık: 'other',
  'Mali Müşavirlik': 'other',
  'İş & Yönetim Danışmanlığı': 'other',
  'İnsan Kaynakları Danışmanlığı': 'other',
  'Emlak Danışmanlığı': 'other',
  'Kariyer Koçluğu': 'other',
  'Yeminli Müşavirlik': 'other',

  'Oto Tamir & Mekanik Servis': 'auto_repair',
  'Oto Yıkama & Detay': 'car_wash',
  'Lastik & Balans': 'tire_shop',
  'Araç Klima Servisi': 'ac_service',
  'Kaporta & Boya': 'body_paint',
  Ekspertiz: 'auto_expert',
  'Oto Elektrik': 'auto_repair',

  Elektrikçi: 'electrician',
  Tesisatçı: 'plumber',
  'Klima Montaj & Bakım': 'ac_install_maint',
  'Uydu & İnternet Kurulum': 'satellite_internet_setup',
  Marangoz: 'carpenter',
  Boyacı: 'painter',
  Çilingir: 'other',
  'Halı & Koltuk Yıkama': 'other',
  'Temizlik Hizmeti': 'other',

  'Veteriner Kliniği': 'veterinarian',
  'Pet Kuaförü': 'pet_groomer',
  'Köpek Eğitmeni': 'pet_trainer',
  'Pet Otel & Pansiyon': 'pet_hotel',
  'Pet Aşı & Sağlık Takibi': 'pet_vaccine_tracking',
  'Pet Bakım & Günlük İzleme': 'pet_groomer',

  Restoran: 'restaurant',
  'Cafe & Kahve': 'restaurant',
  'Pastane & Fırın': 'restaurant',
  'Catering & Davet Yemeği': 'restaurant',
  'Fast Food': 'restaurant',

  'Tekne Turu': 'boat_tour',
  'Dalış Merkezi': 'diving_center',
  'Araç Kiralama': 'rent_a_car',
  'Profesyonel Fotoğrafçı': 'photographer',
  'Düğün & Etkinlik Organizasyonu': 'wedding_organization',
  'Konaklama & Pansiyon': 'other',

  'Diğer İşletme': 'other',
};

/** businessType slug → gösterim etiketi (son yazılan alt kategori adı kalır) */
export const BUSINESS_TYPE_LABELS: Record<string, string> = Object.fromEntries(
  Object.entries(SUBCATEGORY_TO_BUSINESS_TYPE).map(([label, slug]) => [slug, label])
);
