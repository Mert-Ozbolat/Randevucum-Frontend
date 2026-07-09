/** Platform yasal bilgileri — güncellemelerde bu dosyayı kontrol edin */
export const LEGAL = {
  platformName: "Randevucum",
  website: "https://www.randevucum.online",
  supportEmail: "mertozbolat008@gmail.com",
  dataController: "Randevucum",
  lastUpdated: "9 Temmuz 2026",
  jurisdiction: "KKTC mevzuatı",
} as const;

export const LEGAL_LINKS = [
  { href: "/privacy", label: "Gizlilik Politikası" },
  { href: "/kvkk", label: "KVKK Aydınlatma Metni" },
  { href: "/terms", label: "Kullanım Koşulları" },
  { href: "/cookies", label: "Çerez Politikası" },
  { href: "/distance-sales", label: "Mesafeli Satış Sözleşmesi" },
  { href: "/refund-policy", label: "İptal ve İade Politikası" },
] as const;
