import React, { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Head } from 'vite-react-ssg';
import PublicPageShell from '../components/PublicPageShell';

const money = new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 2 });

export default function CommissionCalculator() {
  const [type, setType] = useState('sale');
  const [amount, setAmount] = useState(5000000);
  const [rate, setRate] = useState(4);
  const [rentMonths, setRentMonths] = useState(1);
  const [vatRate, setVatRate] = useState(20);
  const [vatIncluded, setVatIncluded] = useState(false);

  const result = useMemo(() => {
    const safeAmount = Math.max(0, Number(amount) || 0);
    const grossInput = type === 'sale'
      ? safeAmount * Math.max(0, Number(rate) || 0) / 100
      : safeAmount * Math.max(0, Number(rentMonths) || 0);
    const vatMultiplier = 1 + Math.max(0, Number(vatRate) || 0) / 100;
    const net = vatIncluded ? grossInput / vatMultiplier : grossInput;
    const vat = vatIncluded ? grossInput - net : net * (vatMultiplier - 1);
    return { net, vat, total: net + vat, perParty: (net + vat) / 2 };
  }, [amount, rate, rentMonths, type, vatIncluded, vatRate]);

  const canonical = 'https://kapora.online/araclar/emlak-komisyonu-hesaplama';
  const faq = [
    ['Satışta emlak komisyonu üst sınırı nedir?', 'Taşınmaz Ticareti Hakkında Yönetmelik bilgisinde toplam hizmet bedeli KDV hariç satış bedelinin yüzde 4’ünü aşamaz.'],
    ['Kiralamada hizmet bedeli üst sınırı nedir?', 'Resmî düzenleme bilgisinde kiralamaya aracılık hizmet bedeli KDV hariç bir aylık kira bedelini aşamaz.'],
    ['Komisyon taraflar arasında nasıl paylaşılır?', 'Aksi yazılı olarak kararlaştırılmadıkça hizmet bedeli taraflar arasında eşit paylaşılır; somut sözleşmenizi kontrol edin.'],
  ];

  const inputClass = 'mt-2 w-full rounded-xl border border-outline bg-background px-4 py-3 text-on-surface outline-none focus:border-primary';
  return (
    <PublicPageShell>
      <Head>
        <title>Emlak Komisyonu Hesaplama Aracı 2026</title>
        <meta name="description" content="Satış veya kiralama tutarı, komisyon oranı ve KDV seçimine göre emlak hizmet bedelini ücretsiz hesaplayın." />
        <link rel="canonical" href={canonical} /><meta property="og:type" content="website" /><meta property="og:title" content="Emlak Komisyonu Hesaplama Aracı" /><meta property="og:description" content="Satış ve kiralama için KDV dahil veya hariç hizmet bedelini hesaplayın." /><meta property="og:url" content={canonical} />
        <script type="application/ld+json">{JSON.stringify({ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: faq.map(([q, a]) => ({ '@type': 'Question', name: q, acceptedAnswer: { '@type': 'Answer', text: a } })) })}</script>
      </Head>
      <main>
        <section className="mx-auto max-w-[1000px] px-4 py-14 sm:px-6 sm:py-20">
          <div className="text-center"><span className="text-sm font-bold uppercase tracking-wider text-primary">Ücretsiz araç</span><h1 className="mt-3 text-4xl font-bold sm:text-5xl">Emlak Komisyonu Hesaplama</h1><p className="mx-auto mt-4 max-w-2xl leading-7 text-on-surface-variant">Satış veya kiralama işleminde hizmet bedelini ve KDV’yi ayrı görün. Sonuç bilgilendirme amaçlıdır; sözleşmenizi ve güncel mevzuatı doğrulayın.</p></div>
          <div className="mt-10 grid gap-6 lg:grid-cols-[1.1fr_.9fr]">
            <section className="rounded-2xl border border-outline bg-surface-container p-5 sm:p-7" aria-labelledby="calculator-title">
              <h2 id="calculator-title" className="text-2xl font-bold">İşlem bilgileri</h2>
              <div className="mt-6 grid grid-cols-2 rounded-xl bg-background p-1">
                <button type="button" onClick={() => setType('sale')} className={`rounded-lg px-3 py-3 font-semibold ${type === 'sale' ? 'bg-primary text-on-primary' : 'text-on-surface-variant'}`}>Satış</button>
                <button type="button" onClick={() => setType('rent')} className={`rounded-lg px-3 py-3 font-semibold ${type === 'rent' ? 'bg-primary text-on-primary' : 'text-on-surface-variant'}`}>Kiralama</button>
              </div>
              <div className="mt-5 space-y-5">
                <label className="block text-sm font-semibold">{type === 'sale' ? 'Satış bedeli (TL)' : 'Aylık kira bedeli (TL)'}<input className={inputClass} type="number" min="0" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value)} /></label>
                {type === 'sale' ? <label className="block text-sm font-semibold">Toplam hizmet bedeli oranı (%)<input className={inputClass} type="number" min="0" step="0.1" value={rate} onChange={(e) => setRate(e.target.value)} /><span className={`mt-2 block text-xs ${Number(rate) > 4 ? 'text-red-400' : 'text-on-surface-variant'}`}>Resmî üst sınır bilgisi: KDV hariç toplam %4.</span></label>
                  : <label className="block text-sm font-semibold">Hizmet bedeli (ay)<input className={inputClass} type="number" min="0" step="0.1" value={rentMonths} onChange={(e) => setRentMonths(e.target.value)} /><span className={`mt-2 block text-xs ${Number(rentMonths) > 1 ? 'text-red-400' : 'text-on-surface-variant'}`}>Resmî üst sınır bilgisi: KDV hariç bir aylık kira.</span></label>}
                <div className="grid gap-4 sm:grid-cols-2"><label className="block text-sm font-semibold">KDV oranı (%)<input className={inputClass} type="number" min="0" value={vatRate} onChange={(e) => setVatRate(e.target.value)} /></label><label className="block text-sm font-semibold">Girilen bedel<input className={inputClass} value={vatIncluded ? 'KDV dahil' : 'KDV hariç'} readOnly /></label></div>
                <button type="button" role="switch" aria-checked={vatIncluded} onClick={() => setVatIncluded((value) => !value)} className="flex w-full items-center justify-between rounded-xl border border-outline bg-background p-4 text-left"><span><strong className="block">Hizmet bedeline KDV dahil</strong><span className="text-xs text-on-surface-variant">{vatIncluded ? 'KDV girilen tutarın içinden ayrılır.' : 'KDV hizmet bedeline eklenir.'}</span></span><span className={`h-6 w-11 rounded-full p-1 ${vatIncluded ? 'bg-primary' : 'bg-outline'}`}><span className={`block h-4 w-4 rounded-full bg-white transition-transform ${vatIncluded ? 'translate-x-5' : ''}`} /></span></button>
              </div>
            </section>
            <aside className="rounded-2xl border border-primary/30 bg-primary/10 p-5 sm:p-7" aria-live="polite">
              <h2 className="text-2xl font-bold">Hesaplama sonucu</h2>
              <dl className="mt-7 space-y-4"><div className="flex justify-between gap-4 border-b border-outline pb-4"><dt>Hizmet bedeli (KDV hariç)</dt><dd className="font-bold">{money.format(result.net)}</dd></div><div className="flex justify-between gap-4 border-b border-outline pb-4"><dt>KDV</dt><dd className="font-bold">{money.format(result.vat)}</dd></div><div className="flex justify-between gap-4 text-lg"><dt className="font-bold">Toplam</dt><dd className="font-bold text-primary">{money.format(result.total)}</dd></div><div className="rounded-xl bg-background/60 p-4"><dt className="text-sm text-on-surface-variant">Eşit paylaşım varsayımıyla taraf başına</dt><dd className="mt-1 text-xl font-bold">{money.format(result.perParty)}</dd></div></dl>
              <p className="mt-6 text-xs leading-5 text-on-surface-variant">Taraflar farklı bir paylaşım kararlaştırabilir. Bu araç vergi veya hukuk danışmanlığı sunmaz ve fatura hesabının yerini tutmaz.</p>
            </aside>
          </div>
        </section>
        <section className="border-y border-outline bg-surface-container px-5 py-14"><div className="mx-auto max-w-[900px]"><h2 className="text-3xl font-bold">Yasal üst sınırlar hakkında</h2><p className="mt-4 leading-7 text-on-surface-variant">Ticaret Bakanlığı kaynaklarında satışa aracılık hizmet bedelinin KDV hariç satış bedelinin toplam %4’ünü; kiralamada ise KDV hariç bir aylık kira bedelini aşamayacağı belirtilir. Aksi kararlaştırılmadıkça bedel taraflar arasında eşit paylaşılır.</p><a href="https://antalya.ticaret.gov.tr/basvurular/tasinmaz-ticareti-yetki-belgesi-verilmesi" target="_blank" rel="noreferrer" className="mt-4 inline-block font-semibold text-primary hover:underline">Ticaret Bakanlığı kaynak bilgisini aç →</a><div className="mt-7 flex flex-col gap-3 sm:flex-row"><Link to="/blog/emlak-komisyonu-ne-kadar-2026" className="rounded-xl border border-outline px-5 py-3 font-semibold">2026 komisyon rehberini incele</Link><Link to="/emlak-crm" className="rounded-xl bg-primary px-5 py-3 text-center font-bold text-on-primary">Satış sürecini Kapora ile yönet</Link></div></div></section>
        <section className="mx-auto max-w-[900px] px-5 py-14"><h2 className="text-3xl font-bold">Sık sorulan sorular</h2><div className="mt-6 space-y-4">{faq.map(([q, a]) => <details key={q} className="rounded-xl border border-outline p-5"><summary className="cursor-pointer font-bold">{q}</summary><p className="mt-3 text-on-surface-variant">{a}</p></details>)}</div></section>
      </main>
    </PublicPageShell>
  );
}

