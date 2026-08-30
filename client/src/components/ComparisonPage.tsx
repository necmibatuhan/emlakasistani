import React from 'react';
import { Link } from 'react-router-dom';
import { Head } from 'vite-react-ssg';
import PublicPageShell from './PublicPageShell';

export default function ComparisonPage({ config, slug }) {
  const canonical = `https://kapora.online/karsilastirma/${slug}`;
  const faq = [
    { q: `Kapora, ${config.competitor} yerine kullanılabilir mi?`, a: 'Uygunluk; ekip yapısı, gerekli entegrasyonlar ve günlük iş akışına göre değişir. Karar vermeden önce iki ürünü de gerçek senaryonuzla deneyin.' },
    { q: 'Karşılaştırmadaki rakip bilgileri neden genel?', a: 'Rakip ürünlerin özellik ve fiyatları değişebilir. Doğrulanmamış iddialar yerine satın alma sırasında teyit edilmesi gereken ölçütleri gösteriyoruz.' },
  ];
  return (
    <PublicPageShell>
      <Head>
        <title>{config.seoTitle}</title><meta name="description" content={config.description} /><link rel="canonical" href={canonical} />
        <meta property="og:type" content="website" /><meta property="og:title" content={config.title} /><meta property="og:description" content={config.description} /><meta property="og:url" content={canonical} />
        <script type="application/ld+json">{JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map(({ q, a }) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) })}</script>
      </Head>
      <main>
        <section className="mx-auto max-w-[900px] px-5 py-20 text-center sm:py-28">
          <span className="text-sm font-bold uppercase tracking-wider text-primary">Şeffaf ürün karşılaştırması</span>
          <h1 className="mt-4 text-4xl font-bold leading-tight sm:text-6xl">{config.title}</h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-on-surface-variant">{config.intro}</p>
          <Link to="/auth" className="mt-8 inline-block rounded-xl bg-primary px-7 py-4 font-bold text-on-primary">Kapora’yı Ücretsiz Dene</Link>
        </section>
        <section className="border-y border-outline bg-surface-container px-4 py-16">
          <div className="mx-auto max-w-[1000px]">
            <h2 className="text-3xl font-bold">Karar verirken karşılaştırılacak başlıklar</h2>
            <p className="mt-3 text-on-surface-variant">Bu tablo rakip hakkında doğrulanmamış yokluk veya fiyat iddiası içermez.</p>
            <div className="mt-8 overflow-x-auto rounded-2xl border border-outline bg-background">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead className="border-b border-outline bg-surface-container-high"><tr><th className="p-4">Ölçüt</th><th className="p-4 text-primary">Kapora</th><th className="p-4">{config.competitor}</th></tr></thead>
                <tbody>{config.rows.map((row) => <tr key={row.feature} className="border-b border-outline last:border-0"><th className="p-4 font-semibold">{row.feature}</th><td className="p-4 text-on-surface-variant">{row.kapora}</td><td className="p-4 text-on-surface-variant">{row.competitor}</td></tr>)}</tbody>
              </table>
            </div>
          </div>
        </section>
        <section className="mx-auto grid max-w-[1000px] gap-5 px-5 py-16 md:grid-cols-2">
          <div className="rounded-2xl border border-outline p-6"><h2 className="text-2xl font-bold">Kapora kimler için uygun?</h2><ul className="mt-4 space-y-3 text-on-surface-variant"><li>• Sahada hızlı müşteri kaydı isteyen danışmanlar</li><li>• Yapay zekâ çıktılarında insan onayını koruyan ekipler</li><li>• Takip, eşleştirme ve pipeline’ı tek yerde görmek isteyen ofisler</li></ul></div>
          <div className="rounded-2xl border border-outline p-6"><h2 className="text-2xl font-bold">Demo sırasında neyi test etmeli?</h2><ul className="mt-4 space-y-3 text-on-surface-variant"><li>• Kendi telefonunuzda lead ekleme süresi</li><li>• Bir gerçek talep için eşleşme kalitesi</li><li>• Rol, veri aktarımı, destek ve toplam maliyet</li></ul></div>
          <div className="md:col-span-2 rounded-2xl bg-primary/10 p-8 text-center"><h2 className="text-2xl font-bold">Kendi iş akışınızla karşılaştırın</h2><p className="mt-3 text-on-surface-variant">Kapora’yı gerçek bir müşteri senaryosuyla ücretsiz deneyin.</p><div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row"><Link to="/auth" className="rounded-xl bg-primary px-6 py-3 font-bold text-on-primary">Ücretsiz Başla</Link><Link to="/emlak-crm" className="rounded-xl border border-outline px-6 py-3 font-bold">Tüm Özellikleri Gör</Link></div></div>
        </section>
      </main>
    </PublicPageShell>
  );
}

