import { LEGAL } from './constants';
import type { LegalPageContent } from './types';

const contactNote: { type: 'note'; title: string; text: string } = {
  type: 'note',
  title: 'İletişim',
  text: `Sorularınız için ${LEGAL.supportEmail} adresine yazabilirsiniz.`,
};

export const privacyPolicy: LegalPageContent = {
  slug: 'privacy',
  title: 'Gizlilik Politikası',
  subtitle:
    'Kişisel verilerinizin nasıl toplandığını, kullanıldığını ve korunduğunu şeffaf biçimde açıklıyoruz.',
  sections: [
    {
      id: 'ozet',
      title: 'Kısa özet',
      summary: '1 dakikada özet',
      blocks: [
        {
          type: 'ul',
          items: [
            'Randevu hizmeti sunmak için ad, e-posta, telefon ve randevu bilgilerinizi işleriz.',
            'Randevu aldığınız işletme, hizmeti sunabilmesi için gerekli bilgileri görür.',
            'Oturum ve güvenlik için zorunlu çerezler kullanılır; pazarlama çerezi kullanılmaz.',
            'Verilerinize erişim, düzeltme ve silme talebinde bulunabilirsiniz.',
            'Ödeme işlemleri Stripe altyapısı üzerinden güvenli şekilde yürütülür.',
          ],
        },
      ],
    },
    {
      id: 'kapsam',
      title: 'Kapsam',
      blocks: [
        {
          type: 'p',
          text: `Bu Gizlilik Politikası, ${LEGAL.platformName} (“Platform”) üzerinden sunulan online randevu hizmetlerini kullanan ziyaretçiler, müşteriler ve işletme sahipleri için geçerlidir. Platformu kullanarak bu politikayı okuduğunuzu kabul etmiş sayılırsınız.`,
        },
      ],
    },
    {
      id: 'toplanan-veriler',
      title: 'Toplanan veriler',
      blocks: [
        {
          type: 'table',
          headers: ['Veri türü', 'Örnekler'],
          rows: [
            ['Kimlik ve iletişim', 'Ad, soyad, e-posta, telefon, profil fotoğrafı'],
            ['Hesap', 'Şifre (şifrelenmiş), Google hesap kimliği, kullanıcı rolü'],
            ['Randevu', 'İşletme, hizmet, tarih, saat, personel, notlar, durum'],
            ['İşletme', 'İşletme adı, adres, çalışma saatleri, hizmet ve personel bilgileri'],
            ['Ödeme (işletmeler)', 'Abonelik planı, fatura bilgileri — kart verisi Stripe’da tutulur'],
            ['Teknik', 'Oturum çerezi, IP adresi, tarayıcı türü, hata logları'],
            ['Kullanım', 'Favori işletmeler, katılım puanı, randevu geçmişi'],
          ],
        },
      ],
    },
    {
      id: 'amaclar',
      title: 'Verilerin işlenme amaçları',
      blocks: [
        {
          type: 'ul',
          items: [
            'Randevu oluşturma, onaylama, hatırlatma ve iptal süreçlerinin yürütülmesi',
            'İşletme paneli ve müşteri panelinin çalışması',
            'WhatsApp bildirimleri (onay, hatırlatma, gelmedi uyarısı) gönderilmesi',
            'Abonelik ve ödeme işlemlerinin yönetilmesi',
            'Hesap güvenliği, dolandırıcılık önleme ve kötüye kullanımın engellenmesi',
            'Yasal yükümlülüklerin yerine getirilmesi',
            'Hizmet kalitesinin iyileştirilmesi ve destek taleplerinin yanıtlanması',
          ],
        },
      ],
    },
    {
      id: 'hukuki-dayanak',
      title: 'Hukuki dayanak',
      blocks: [
        {
          type: 'p',
          text: 'Kişisel verileriniz; sözleşmenin kurulması ve ifası, meşru menfaat, hukuki yükümlülük ve açık rızanız kapsamında 6698 sayılı Kişisel Verilerin Korunması Kanunu (KVKK) ve ilgili mevzuata uygun olarak işlenir.',
        },
      ],
    },
    {
      id: 'paylasim',
      title: 'Veri paylaşımı',
      blocks: [
        {
          type: 'ul',
          items: [
            'Randevu aldığınız işletme: randevu detayları ve iletişim bilgileriniz',
            'Stripe: abonelik ödemeleri için ödeme altyapısı',
            'UltraMsg / WhatsApp: bildirim mesajları (telefon numaranız varsa)',
            'Google: Google ile giriş tercih ederseniz kimlik doğrulama',
            'ImageKit: yüklenen görsellerin barındırılması',
            'MongoDB Atlas: veritabanı barındırma',
          ],
        },
        {
          type: 'note',
          text: 'Kişisel verileriniz reklam amaçlı üçüncü taraflara satılmaz veya kiralanmaz.',
        },
      ],
    },
    {
      id: 'saklama',
      title: 'Saklama süreleri',
      blocks: [
        {
          type: 'ul',
          items: [
            'Hesap verileri: hesabınız aktif olduğu sürece',
            'Randevu kayıtları: hizmet ve yasal yükümlülükler için makul süre',
            'Ödeme kayıtları: vergi ve ticari mevzuatın öngördüğü süreler',
            'Log kayıtları: güvenlik amacıyla sınırlı süre',
          ],
        },
        {
          type: 'p',
          text: 'Hesabınızı silmeniz halinde, yasal zorunluluklar hariç verileriniz silinir veya anonimleştirilir.',
        },
      ],
    },
    {
      id: 'guvenlik',
      title: 'Güvenlik önlemleri',
      blocks: [
        {
          type: 'ul',
          items: [
            'HTTPS ile şifreli veri iletimi',
            'Şifrelerin hash’lenerek saklanması',
            'Yetkilendirme ve rol tabanlı erişim kontrolü',
            'Sunucu tarafı güvenlik ve rate limiting',
          ],
        },
        {
          type: 'p',
          text: 'Ticari ölçüde makul güvenlik önlemleri alınmaktadır; internet üzerinden hiçbir iletimin %100 güvenli olduğu garanti edilemez.',
        },
      ],
    },
    {
      id: 'haklar',
      title: 'Haklarınız',
      blocks: [
        {
          type: 'p',
          text: 'KVKK kapsamında aşağıdaki haklara sahipsiniz:',
        },
        {
          type: 'ul',
          items: [
            'Kişisel verilerinizin işlenip işlenmediğini öğrenme',
            'İşlenmişse buna ilişkin bilgi talep etme',
            'Eksik veya yanlış işlenmişse düzeltilmesini isteme',
            'Silinmesini veya yok edilmesini isteme',
            'İşlemenin kısıtlanmasını talep etme',
            'Aktarıldığı üçüncü kişileri bilme',
            'Otomatik sistemlerle analiz sonucu aleyhinize bir sonucun ortaya çıkmasına itiraz etme',
          ],
        },
        {
          type: 'p',
          text: `Taleplerinizi ${LEGAL.supportEmail} adresine iletebilirsiniz. Başvurularınız en geç 30 gün içinde yanıtlanır.`,
        },
      ],
    },
    {
      id: 'cocuklar',
      title: 'Çocukların gizliliği',
      blocks: [
        {
          type: 'p',
          text: 'Platform 18 yaş altı bireylere yönelik değildir. Bilerek 18 yaş altından kişisel veri toplanmaz.',
        },
      ],
    },
    {
      id: 'degisiklikler',
      title: 'Politika değişiklikleri',
      blocks: [
        {
          type: 'p',
          text: `Bu politika güncellenebilir. Güncel sürüm ${LEGAL.website} adresinde yayınlandığı tarihten itibaren geçerlidir. Önemli değişikliklerde kayıtlı kullanıcılara bildirim yapılabilir.`,
        },
        contactNote,
      ],
    },
  ],
};

export const kvkkNotice: LegalPageContent = {
  slug: 'kvkk',
  title: 'KVKK Aydınlatma Metni',
  subtitle: '6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında bilgilendirme.',
  sections: [
    {
      id: 'veri-sorumlusu',
      title: 'Veri sorumlusu',
      blocks: [
        {
          type: 'p',
          text: `${LEGAL.dataController} (“Veri Sorumlusu”), ${LEGAL.platformName} platformu kapsamında kişisel verilerinizin işlenmesinden sorumludur.`,
        },
        {
          type: 'table',
          headers: ['Bilgi', 'Değer'],
          rows: [
            ['Platform', LEGAL.platformName],
            ['Web sitesi', LEGAL.website],
            ['İletişim', LEGAL.supportEmail],
          ],
        },
      ],
    },
    {
      id: 'islenen-veriler',
      title: 'İşlenen kişisel veriler',
      blocks: [
        {
          type: 'ul',
          items: [
            'Kimlik: ad, soyad',
            'İletişim: e-posta, telefon',
            'Müşteri işlem: randevu geçmişi, favoriler, katılım puanı',
            'İşlem güvenliği: IP, oturum bilgisi, log kayıtları',
            'Finans (işletme): abonelik ve fatura bilgileri',
            'Görsel: profil ve işletme fotoğrafları',
          ],
        },
      ],
    },
    {
      id: 'amac-hukuki-sebep',
      title: 'Amaç ve hukuki sebep',
      blocks: [
        {
          type: 'table',
          headers: ['Amaç', 'Hukuki sebep'],
          rows: [
            ['Randevu hizmetinin sunulması', 'Sözleşmenin ifası'],
            ['Hesap oluşturma ve giriş', 'Sözleşmenin kurulması'],
            ['WhatsApp bildirimleri', 'Sözleşmenin ifası / açık rıza'],
            ['Güvenlik ve dolandırıcılık önleme', 'Meşru menfaat'],
            ['Yasal yükümlülükler', 'Kanuni yükümlülük'],
            ['Abonelik ödemeleri', 'Sözleşmenin ifası'],
          ],
        },
      ],
    },
    {
      id: 'aktarim',
      title: 'Veri aktarımı',
      blocks: [
        {
          type: 'p',
          text: 'Verileriniz; randevu aldığınız işletmelere, ödeme hizmeti sağlayıcısına (Stripe), bildirim hizmeti sağlayıcısına ve teknik altyapı sağlayıcılarına, hizmetin sunulması için gerekli ölçüde aktarılabilir. Yurt dışına aktarım söz konusu olduğunda KVKK’nın 9. maddesi kapsamında gerekli önlemler alınır.',
        },
      ],
    },
    {
      id: 'haklar-basvuru',
      title: 'Haklarınız ve başvuru',
      blocks: [
        {
          type: 'p',
          text: 'KVKK’nın 11. maddesi kapsamındaki haklarınızı kullanmak için aşağıdaki kanallardan başvurabilirsiniz:',
        },
        {
          type: 'ul',
          items: [
            `E-posta: ${LEGAL.supportEmail}`,
            `Konu satırı: "KVKK Başvurusu"`,
          ],
        },
        {
          type: 'p',
          text: 'Başvurularınız ücretsiz olarak değerlendirilir; işlemin ayrıca bir maliyet gerektirmesi halinde Kişisel Verileri Koruma Kurulu tarifesindeki ücret uygulanabilir.',
        },
        contactNote,
      ],
    },
  ],
};

export const termsOfService: LegalPageContent = {
  slug: 'terms',
  title: 'Kullanım Koşulları',
  subtitle: 'Platformu kullanırken uymanız gereken kurallar ve sorumluluklar.',
  sections: [
    {
      id: 'taraflar',
      title: 'Taraflar ve kabul',
      blocks: [
        {
          type: 'p',
          text: `Bu Kullanım Koşulları, ${LEGAL.platformName} platformunu kullanan tüm kullanıcılar ile ${LEGAL.dataController} arasında geçerlidir. Platforma kayıt olarak veya kullanmaya devam ederek bu koşulları kabul etmiş sayılırsınız.`,
        },
      ],
    },
    {
      id: 'hizmet',
      title: 'Hizmetin tanımı',
      blocks: [
        {
          type: 'p',
          text: `${LEGAL.platformName}, işletmelerin online randevu almasını ve müşterilerin randevu oluşturmasını sağlayan bir aracı platformdur. Platform, işletme ile müşteri arasındaki hizmet sözleşmesinin tarafı değildir; randevu konusu hizmetin kalitesinden doğrudan işletme sorumludur.`,
        },
      ],
    },
    {
      id: 'hesap',
      title: 'Hesap ve güvenlik',
      blocks: [
        {
          type: 'ul',
          items: [
            'Kayıt bilgilerinizin doğru ve güncel olmasından siz sorumlusunuz.',
            'Hesap şifrenizi gizli tutmalısınız; hesabınız altında yapılan işlemlerden siz sorumlusunuz.',
            '18 yaşından küçükler platformu kullanamaz.',
            'Bir kişi yalnızca bir müşteri hesabı oluşturmalıdır (istisnai durumlar hariç).',
          ],
        },
      ],
    },
    {
      id: 'musteri',
      title: 'Müşteri yükümlülükleri',
      blocks: [
        {
          type: 'ul',
          items: [
            'Randevu saatinde işletmeye zamanında gelmek veya gelmeyecekseniz önceden iptal etmek',
            'Randevu iptal kurallarına uymak (başlangıç saatinden en az 12 saat önce iptal)',
            'Tekrarlayan randevuya gelmeme durumunda katılım puanının düşürülmesini ve uyarı almayı kabul etmek',
            'Platformu yanıltıcı veya kötüye kullanım amaçlı kullanmamak',
          ],
        },
      ],
    },
    {
      id: 'isletme',
      title: 'İşletme yükümlülükleri',
      blocks: [
        {
          type: 'ul',
          items: [
            'İşletme bilgilerinin doğru ve güncel tutulması',
            'Müsait saatlerin ve hizmet bilgilerinin doğru yönetilmesi',
            'Müşteri verilerinin yalnızca hizmet sunumu amacıyla kullanılması',
            'Abonelik ücretlerinin zamanında ödenmesi',
            'Yürürlükteki meslek ve sektör mevzuatına uyum',
          ],
        },
      ],
    },
    {
      id: 'yasak',
      title: 'Yasaklanan kullanımlar',
      blocks: [
        {
          type: 'ul',
          items: [
            'Yasa dışı faaliyetler, spam, zararlı yazılım yayma',
            'Başkalarının hesabına yetkisiz erişim',
            'Platform altyapısına müdahale veya tersine mühendislik',
            'Sahte randevu oluşturma veya sistemi manipüle etme',
            'Telif ve marka haklarının ihlali',
          ],
        },
      ],
    },
    {
      id: 'fikri-mulkiyet',
      title: 'Fikri mülkiyet',
      blocks: [
        {
          type: 'p',
          text: `Platform tasarımı, yazılımı, logosu ve içeriği ${LEGAL.dataController}'a aittir. İzinsiz kopyalama, dağıtma veya ticari kullanım yasaktır.`,
        },
      ],
    },
    {
      id: 'sorumluluk',
      title: 'Sorumluluk sınırlaması',
      blocks: [
        {
          type: 'p',
          text: 'Platform "olduğu gibi" sunulur. İşletme hizmetlerinin kalitesi, randevu iptalleri veya müşteri-işletme anlaşmazlıklarından Platform doğrudan sorumlu tutulamaz. Makul ölçüde kesinti ve bakım hakkı saklıdır.',
        },
      ],
    },
    {
      id: 'fesih',
      title: 'Hesabın askıya alınması',
      blocks: [
        {
          type: 'p',
          text: 'Koşulların ihlali, dolandırıcılık şüphesi veya yasal zorunluluk halinde hesabınız önceden bildirim yapılmaksızın askıya alınabilir veya sonlandırılabilir.',
        },
        contactNote,
      ],
    },
  ],
};

export const cookiePolicy: LegalPageContent = {
  slug: 'cookies',
  title: 'Çerez Politikası',
  subtitle: 'Platformda hangi çerezlerin kullanıldığını ve nasıl yönetebileceğinizi açıklar.',
  sections: [
    {
      id: 'nedir',
      title: 'Çerez nedir?',
      blocks: [
        {
          type: 'p',
          text: 'Çerezler, web sitesini ziyaret ettiğinizde cihazınıza kaydedilen küçük metin dosyalarıdır. Oturumunuzu sürdürmek ve temel işlevleri sağlamak için kullanılır.',
        },
      ],
    },
    {
      id: 'kullandiklarimiz',
      title: 'Kullandığımız çerezler',
      blocks: [
        {
          type: 'table',
          headers: ['Çerez', 'Amaç / süre'],
          rows: [
            ['token (oturum)', 'Giriş oturumu — 7 gün'],
            ['Tema tercihi', 'Açık/koyu mod — kalıcı'],
            ['Çerez onayı', 'Bildirim tercihi — 1 yıl'],
            ['Favoriler', 'Giriş yapmış kullanıcı favorileri — oturum'],
          ],
        },
        {
          type: 'note',
          text: 'Platform reklam veya izleme amaçlı üçüncü taraf pazarlama çerezleri kullanmaz.',
        },
      ],
    },
    {
      id: 'yonetim',
      title: 'Çerezleri yönetme',
      blocks: [
        {
          type: 'ul',
          items: [
            'Tarayıcı ayarlarından çerezleri silebilir veya engelleyebilirsiniz.',
            'Oturum çerezini engellerseniz giriş yapamaz ve paneli kullanamazsınız.',
            'Google ile giriş kullanıyorsanız Google’ın kendi çerez politikası da geçerlidir.',
          ],
        },
        contactNote,
      ],
    },
  ],
};

export const distanceSales: LegalPageContent = {
  slug: 'distance-sales',
  title: 'Mesafeli Satış Sözleşmesi',
  subtitle: 'İşletme abonelik paketleri için 6502 sayılı Tüketicinin Korunması Hakkında Kanun kapsamında bilgilendirme.',
  sections: [
    {
      id: 'taraflar',
      title: 'Taraflar',
      blocks: [
        {
          type: 'table',
          headers: ['', ''],
          rows: [
            ['Satıcı / Hizmet sağlayıcı', `${LEGAL.dataController} — ${LEGAL.supportEmail}`],
            ['Alıcı', 'Platform üzerinden abonelik satın alan işletme sahibi'],
            ['Ürün / Hizmet', 'Dijital abonelik paketi (Standart / Pro)'],
          ],
        },
      ],
    },
    {
      id: 'konu',
      title: 'Sözleşmenin konusu',
      blocks: [
        {
          type: 'p',
          text: 'Bu sözleşme; işletmenin Platform üzerinden online randevu yönetimi, personel ve hizmet yönetimi gibi dijital abonelik hizmetlerini satın almasına ilişkindir. Ödeme Stripe güvenli ödeme altyapısı üzerinden tahsil edilir.',
        },
      ],
    },
    {
      id: 'ucret',
      title: 'Ücret ve ödeme',
      blocks: [
        {
          type: 'ul',
          items: [
            'Abonelik ücretleri Fiyatlar sayfasında belirtilen tutarlardır.',
            'Ücretler aylık veya yıllık periyotlarla tahsil edilebilir.',
            'Vergiler fiyatlara dahil veya ayrıca belirtilir.',
            'Ödeme başarısız olursa hizmet askıya alınabilir.',
          ],
        },
      ],
    },
    {
      id: 'ifa',
      title: 'Hizmetin ifası',
      blocks: [
        {
          type: 'p',
          text: 'Dijital hizmet, ödeme onayından hemen sonra hesabınıza tanımlanır. Deneme süresi varsa bu süre boyunca belirtilen özellikler kullanılabilir.',
        },
      ],
    },
    {
      id: 'cayma',
      title: 'Cayma hakkı',
      blocks: [
        {
          type: 'p',
          text: 'Dijital içerik ve anında ifa edilen hizmetlerde, hizmetin ifasına başlandıktan sonra cayma hakkı kullanılamayabilir. Abonelik iptali için İptal ve İade Politikası geçerlidir.',
        },
        {
          type: 'p',
          text: `Cayma talepleri ${LEGAL.supportEmail} adresine yazılı olarak iletilmelidir.`,
        },
      ],
    },
    {
      id: 'uyusmazlik',
      title: 'Uyuşmazlık çözümü',
      blocks: [
        {
          type: 'p',
          text: 'Uyuşmazlıklarda Tüketici Hakem Heyetleri ve Tüketici Mahkemeleri yetkilidir. Tüketici sıfatıyla başvuru yapılabilir.',
        },
        contactNote,
      ],
    },
  ],
};

export const refundPolicy: LegalPageContent = {
  slug: 'refund-policy',
  title: 'İptal ve İade Politikası',
  subtitle: 'Abonelik iptali, iade koşulları ve randevu iptal kuralları.',
  sections: [
    {
      id: 'abonelik-iptal',
      title: 'Abonelik iptali',
      blocks: [
        {
          type: 'ul',
          items: [
            'İşletme aboneliğinizi panel üzerinden veya Stripe müşteri portalından iptal edebilirsiniz.',
            'İptal, mevcut fatura döneminin sonunda geçerli olur; dönem sonuna kadar hizmet devam eder.',
            'Kullanılmayan süre için oransal iade, yasal zorunluluklar dışında genel kural olarak yapılmaz.',
            'Deneme süresi bitmeden iptal ederseniz ücret tahsil edilmez.',
          ],
        },
      ],
    },
    {
      id: 'iade',
      title: 'İade koşulları',
      blocks: [
        {
          type: 'ul',
          items: [
            'Teknik arıza nedeniyle hizmetin uzun süre kullanılamaması halinde iade değerlendirilir.',
            'Yanlışlıkla yapılan çift ödemeler iade edilir.',
            'İade talepleri 14 gün içinde değerlendirilir.',
            'Onaylanan iadeler 14 iş günü içinde ödeme yöntemine iade edilir.',
          ],
        },
        {
          type: 'p',
          text: `İade talebi: ${LEGAL.supportEmail}`,
        },
      ],
    },
    {
      id: 'randevu-iptal',
      title: 'Randevu iptal kuralları',
      blocks: [
        {
          type: 'ul',
          items: [
            'Müşteriler randevuyu başlangıç saatinden en az 12 saat önce iptal edebilir.',
            'Bu süreden sonra iptal yapılamaz; işletme panelinden işletme sahibi iptal edebilir.',
            'Randevuya gelmeme durumunda katılım puanı düşürülür ve uyarı gönderilebilir.',
          ],
        },
        contactNote,
      ],
    },
  ],
};

export const LEGAL_PAGES: Record<string, LegalPageContent> = {
  privacy: privacyPolicy,
  kvkk: kvkkNotice,
  terms: termsOfService,
  cookies: cookiePolicy,
  'distance-sales': distanceSales,
  'refund-policy': refundPolicy,
};
