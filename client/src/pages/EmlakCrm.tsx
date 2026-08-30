import React from 'react';
import { Link } from 'react-router-dom';
import { Head } from 'vite-react-ssg';
import PublicPageShell from '../components/PublicPageShell';

const capabilities = [
  ['Sesli nottan müşteri kaydı', 'Görüşmeyi sesle anlatın; yapay zekâ aday müşteri alanlarını taslak olarak hazırlasın, siz onaylayın.'],
  ['Akıllı müşteri önceliği', 'Günlük arama listenizi aktivite, takip zamanı ve satış sinyallerine göre görün.'],
  ['Semantik portföy eşleştirme', 'Müşterinin serbest metin talepleriyle portföy açıklamalarını anlam benzerliğine göre eşleştirin.'],
  ['WhatsApp taslakları', 'Müşteri bağlamına uygun mesaj taslağı hazırlayın; gönderimden önce insan onayını koruyun.'],
  ['Takip planları', 'Çok adımlı hatırlatma, mesaj taslağı ve skor güncelleme akışlarını planlayın.'],
  ['Satış pipeline görünümü', 'Yeni adaydan kapanışa kadar her fırsatın aşamasını ve sıradaki işi tek ekranda izleyin.'],
  ['Ofis ve ekip yönetimi', 'Danışman, ofis ve şirket seviyesinde rol bazlı görünürlük ve operasyon düzeni kurun.'],
  ['Raporlar ve dönüşüm analizi', 'Aktiviteleri, darboğazları ve performans göstergelerini ölçülebilir hale getirin.'],
  ['Mobil öncelikli çalışma', 'Sahadayken hızlı kayıt, takip ve müşteri bağlamına küçük ekranlardan erişin.'],
];

const faq = [
  ['Emlak CRM nedir?', 'Emlak CRM; müşteri, portföy, görüşme, görev ve satış fırsatlarını düzenli biçimde takip etmeye yarayan müşteri ilişkileri yönetimi yazılımıdır.'],
  ['Kapora müşteriden ödeme alır mı?', 'Hayır. Kapora bir CRM ve yapay zekâ destekli satış asistanıdır; kapora veya başka bir ödeme tahsil etmez.'],
  ['Yapay zekâ müşteriye otomatik mesaj gönderir mi?', 'Kapora mesaj taslağı hazırlayabilir; gönderim öncesinde danışman onayı esastır.'],
];

export default function EmlakCrm() {
  const canonical = 'https://kapora.online/emlak-crm';
  return (
    <PublicPageShell>
      <Head>
        <title>Emlak CRM: Yapay Zekâ Destekli Müşteri Yönetimi</title>
        <meta name="description" content="Kapora emlak CRM ile müşteri takibi, sesli kayıt, portföy eşleştirme, WhatsApp taslakları ve satış pipeline süreçlerini yönetin." />
        <link rel="canonical" href={canonical} />
        <meta property="og:type" content="website" /><meta property="og:title" content="Kapora Emlak CRM" />
        <meta property="og:description" content="Emlak danışmanları ve ofisleri için yapay zekâ destekli müşteri ve satış yönetimi." /><meta property="og:url" content={canonical} />
        <script type="application/ld+json">{JSON.stringify({ '@context': 'https://schema.org', '@graph': [
          { '@type': 'Organization', '@id': 'https://kapora.online/#organization', name: 'Kapora', url: 'https://kapora.online', logo: 'https://kapora.online/logo-k.png' },
          { '@type': 'SoftwareApplication', name: 'Kapora Emlak CRM', applicationCategory: 'BusinessApplication', operatingSystem: 'Web', url: canonical, description: 'Emlak profesyonelleri için yapay zekâ destekli müşteri ve satış yönetimi.' },
          { '@type': 'FAQPage', mainEntity: faq.map(([question, answer]) => ({ '@type': 'Question', name: question, acceptedAnswer: { '@type': 'Answer', text: answer } })) }
        ] })}</script>
      </Head>

      <main>
        <section className="mx-auto max-w-[1100px] px-5 py-20 text-center sm:py-28">
          <span className="rounded-full border border-primary/30 bg-primary/10 px-4 py-2 text-sm font-semibold text-primary">Emlak danışmanları ve ofisleri için</span>
          <h1 className="mx-auto mt-7 max-w-4xl text-4xl font-bold leading-tight sm:text-6xl">Müşteri Takibini Kolaylaştıran Yapay Zekâ Destekli <span className="text-primary">Emlak CRM</span></h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-on-surface-variant">Kapora, müşteri notlarını, takipleri, portföy eşleşmelerini ve satış fırsatlarını tek yerde toplar. Yapay zekâ işleri hızlandırır; kritik kararlar danışmanda kalır.</p>
          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Link to="/auth" className="rounded-xl bg-primary px-7 py-4 font-bold text-on-primary hover:bg-primary/90">Ücretsiz Başla</Link>
            <Link to="/ilan-analizi" className="rounded-xl border border-outline px-7 py-4 font-bold hover:border-primary">Ücretsiz İlan Analizini Dene</Link>
          </div>
        </section>

        <section className="border-y border-outline bg-surface-container px-5 py-16 sm:py-24">
          <div className="mx-auto max-w-[1100px]">
            <h2 className="text-center text-3xl font-bold sm:text-4xl">Emlak CRM ile neleri yönetebilirsiniz?</h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-on-surface-variant">Sahadaki hızlı kayıttan ofis seviyesindeki performans görünümüne kadar satış sürecinin temel işlerini bir araya getirin.</p>
            <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {capabilities.map(([title, description], index) => (
                <article key={title} className="rounded-2xl border border-outline bg-background p-6">
                  <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-primary/15 font-bold text-primary">{index + 1}</div>
                  <h3 className="text-xl font-bold">{title}</h3><p className="mt-3 leading-7 text-on-surface-variant">{description}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-[900px] px-5 py-16 sm:py-24">
          <h2 className="text-center text-3xl font-bold">Sık sorulan sorular</h2>
          <div className="mt-8 space-y-4">{faq.map(([q, a]) => <details key={q} className="rounded-xl border border-outline bg-surface-container p-5"><summary className="cursor-pointer font-bold">{q}</summary><p className="mt-3 leading-7 text-on-surface-variant">{a}</p></details>)}</div>
          <div className="mt-12 rounded-2xl border border-primary/30 bg-primary/10 p-8 text-center"><h2 className="text-2xl font-bold">Dağınık takibi tek iş akışına dönüştürün</h2><p className="mt-3 text-on-surface-variant">Kapora’yı ücretsiz deneyin; müşterilerinizi ve sıradaki işleri tek ekranda görün.</p><Link to="/auth" className="mt-6 inline-block rounded-xl bg-primary px-7 py-3 font-bold text-on-primary">Hemen Başla</Link></div>
        </section>
      </main>
    </PublicPageShell>
  );
}

