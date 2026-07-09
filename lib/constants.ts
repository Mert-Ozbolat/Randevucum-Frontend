export const ROLES = {
  SUPER_ADMIN: 'super_admin',
  BUSINESS_OWNER: 'business_owner',
  CUSTOMER: 'customer',
} as const;

/** İşletme türü slug → kısa Türkçe etiket (liste / filtre) — backend enum ile uyumlu */
export const BUSINESS_TYPES: Record<string, string> = {
  hair_salon: 'Kuaför',
  dental_clinic: 'Diş Kliniği',
  beauty_center: 'Güzellik Merkezi',
  restaurant: 'Restoran & Cafe',
  other: 'Diğer',

  eye_doctor: 'Göz Sağlığı',
  physiotherapist: 'Fizyoterapi',
  psychologist: 'Psikolog / Ruh Sağlığı',
  dietitian: 'Diyetisyen',
  aesthetic_clinic: 'Estetik Kliniği',
  lab: 'Tıbbi Lab',

  nail_salon: 'Manikür & Nail',
  lash_brow: 'Kirpik & Kaş',
  laser_epilation: 'Lazer Epilasyon',
  skin_care: 'Cilt Bakımı',
  massage_salon: 'Masaj',
  spa_hamam: 'SPA & Hamam',

  auto_repair: 'Oto Tamir',
  car_wash: 'Oto Yıkama',
  tire_shop: 'Lastik',
  ac_service: 'Araç Kliması',
  body_paint: 'Kaporta & Boya',
  auto_expert: 'Ekspertiz',

  electrician: 'Elektrikçi',
  plumber: 'Tesisatçı',
  ac_install_maint: 'Klima Montaj',
  satellite_internet_setup: 'Uydu & İnternet',
  carpenter: 'Marangoz',
  painter: 'Boyacı',

  veterinarian: 'Veteriner',
  pet_groomer: 'Pet Kuaför',
  pet_trainer: 'Pet Eğitmen',
  pet_hotel: 'Pet Otel',
  pet_vaccine_tracking: 'Pet Sağlık Takibi',

  private_tutor: 'Özel Ders',
  driving_school: 'Sürücü Kursu',
  language_course: 'Dil Kursu',
  software_course: 'Yazılım Kursu',
  pilates_yoga_instructor: 'Pilates & Yoga',

  boat_tour: 'Tekne Turu',
  diving_center: 'Dalış',
  rent_a_car: 'Araç Kiralama',
  photographer: 'Fotoğrafçı',
  wedding_organization: 'Organizasyon',
};

export const RESERVATION_STATUS: Record<string, string> = {
  pending: 'Beklemede',
  approved: 'Onaylandı',
  canceled: 'İptal',
  completed: 'Tamamlandı',
  no_show: 'Gelmedi',
};

export const SUBSCRIPTION_STATUS: Record<string, string> = {
  active: 'Aktif',
  expired: 'Süresi Doldu',
  canceled: 'İptal',
};

export const DAYS_OF_WEEK = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi'];

/** KKTC şehirleri – alfabetik sıralı, konum dropdown için sabit veri */
export const KKTC_CITIES: string[] = [
  'Gazimağusa',
  'Girne',
  'Güzelyurt',
  'İskele',
  'Lefke',
  'Lefkoşa',
];
