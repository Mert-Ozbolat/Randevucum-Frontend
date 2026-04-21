export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="text-3xl font-bold tracking-tight text-neutral-900 dark:text-neutral-50">
        Gizlilik Politikası
      </h1>
      <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-300">
        Bu metin, Randevucum (“Platform”) üzerinden sağlanan hizmetlerde kişisel verilerin işlenmesi ve
        gizlilik uygulamalarını açıklar.
      </p>

      <div className="prose prose-neutral mt-8 max-w-none dark:prose-invert">
        <h2>Kapsam</h2>
        <p>
          Bu politika; ziyaretçiler, müşteriler ve işletme sahipleri dahil olmak üzere Platform’u kullanan
          tüm kullanıcılar için geçerlidir.
        </p>

        <h2>Toplanan veriler</h2>
        <ul>
          <li>
            <strong>Hesap bilgileri</strong>: ad, soyad, e-posta, telefon (varsa), rol bilgisi.
          </li>
          <li>
            <strong>Randevu verileri</strong>: seçilen işletme/hizmet, tarih, saat, notlar (varsa), durum
            bilgisi.
          </li>
          <li>
            <strong>Teknik veriler</strong>: güvenlik ve oturum yönetimi için gerekli temel log/cihaz
            bilgileri (mümkün olduğu ölçüde minimize edilir).
          </li>
        </ul>

        <h2>Verilerin işlenme amaçları</h2>
        <ul>
          <li>Randevu oluşturma, yönetme ve görüntüleme.</li>
          <li>Hesap doğrulama, güvenlik, kötüye kullanımın önlenmesi.</li>
          <li>Hizmet kalitesini geliştirme ve destek süreçleri.</li>
        </ul>

        <h2>Çerezler ve benzeri teknolojiler</h2>
        <p>
          Platform, oturum yönetimi ve temel işlevler için gerekli teknik tanımlayıcıları kullanabilir.
          Tarayıcı ayarlarınızdan çerezleri yönetebilirsiniz.
        </p>

        <h2>Veri paylaşımı</h2>
        <p>
          Kişisel verileriniz, randevu sürecinin yürütülmesi için ilgili işletme ile paylaşılabilir.
          Bunun dışında, yasal yükümlülükler haricinde üçüncü taraflarla paylaşım yapılmaz.
        </p>

        <h2>Veri saklama</h2>
        <p>
          Veriler, hizmetin sunulması için gerekli süre boyunca ve ilgili mevzuatın öngördüğü süreler
          kapsamında saklanır.
        </p>

        <h2>Güvenlik</h2>
        <p>
          Uygun teknik ve organizasyonel önlemler alınır; ancak internet üzerinden yapılan hiçbir iletimin
          %100 güvenli olduğu garanti edilemez.
        </p>

        <h2>Haklarınız</h2>
        <p>
          Kişisel verilerinizle ilgili erişim, düzeltme, silme ve itiraz gibi talepleriniz için bizimle
          iletişime geçebilirsiniz.
        </p>

        <h2>İletişim</h2>
        <p>
          Gizlilik ile ilgili sorularınız için: <strong>destek@randevucum.com</strong>
        </p>

        <h2>Değişiklikler</h2>
        <p>
          Bu politika zaman zaman güncellenebilir. Güncel sürüm Platform’da yayınlandığı tarihten itibaren
          geçerlidir.
        </p>
      </div>
    </div>
  );
}

