import React, { useMemo } from 'react';
import { useParams, Link, Navigate } from 'react-router-dom';
import { Head } from 'vite-react-ssg';
import { Logo } from '../components/Logo';
import { ArrowRight, MapPin, Target, Zap, Bot, Smartphone, CheckCircle2 } from 'lucide-react';
import districtsData from '../data/districts.json';

export default function RegionalLanding() {
  const { slug } = useParams();
  
  const district = useMemo(() => {
    return districtsData.find(d => d.slug === slug);
  }, [slug]);

  if (!district) {
    return <Navigate to="/" replace />;
  }

  // Schema Markup for Local SEO
  const schemaMarkup = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": `Kapora AI - ${district.name} Emlak CRM`,
    "applicationCategory": "BusinessApplication",
    "description": `${district.name} bölgesindeki gayrimenkul danışmanları için özel olarak optimize edilmiş yapay zeka destekli portföy ve müşteri takip programı.`,
    "operatingSystem": "All",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "TRY"
    },
    "areaServed": {
      "@type": "City",
      "name": district.name
    }
  };

  return (
    <div className="min-h-screen bg-background text-on-surface font-sans">
      <Head>
        <title>Kapora AI: {district.name} Emlak Asistanı ve CRM Programı</title>
        <meta name="description" content={`${district.name} bölgesinde ${district.target} satışlarınızı yapay zeka destekli emlak asistanı ile ${district.verb}. Manuel Excel takibine son verin!`} />
        <meta name="keywords" content={`${district.name} emlak programı, ${district.name} gayrimenkul crm, emlak asistanı, portföy takip`} />
        <script type="application/ld+json">
          {JSON.stringify(schemaMarkup)}
        </script>
      </Head>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-outline-variant">
        <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-4">
            <Link to="/" className="text-on-surface-variant hover:text-on-surface font-medium text-sm transition-colors hidden sm:block">Ana Sayfa</Link>
            <Link to="/auth" className="bg-primary hover:bg-primary/90 text-on-primary font-medium text-sm px-5 py-2 rounded-md transition-colors shadow-sm">
              Ücretsiz Dene
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="pt-32 pb-20 px-6">
        <div className="max-w-[1200px] mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-6">
              <MapPin className="w-4 h-4" />
              <span>{district.city}, {district.name} Emlak Piyasasına Özel</span>
            </div>
            
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 text-on-surface leading-tight tracking-tight">
              <span className="text-primary">{district.name}</span> Bölgesindeki Emlak Ofisleri İçin Yapay Zeka
            </h1>
            
            <p className="text-lg text-on-surface-variant mb-8 leading-relaxed max-w-2xl mx-auto">
              <span className="font-semibold text-on-surface">{district.dynamic}</span> {district.name} bölgesinde her gün yüzlerce müşteri arayışa giriyor. Geleneksel ajandaları bırakın, bölgedeki <span className="font-semibold text-on-surface">{district.target}</span> yapay zeka asistanımızla saniyeler içinde <span className="text-primary font-bold">{district.verb}</span>.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/auth" className="w-full sm:w-auto flex items-center justify-center gap-2 bg-primary hover:bg-primary/90 text-on-primary px-8 py-4 rounded-xl font-semibold text-lg transition-all shadow-lg hover:shadow-primary/25">
                Hemen Ücretsiz Başla <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>

          {/* Features specific to the region */}
          <div className="grid md:grid-cols-3 gap-8 mt-24">
            <div className="bg-surface-container border border-outline-variant rounded-2xl p-8 hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6">
                <Target className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-on-surface">
                {district.name} İçi Hızlı Eşleştirme
              </h3>
              <p className="text-on-surface-variant leading-relaxed">
                Sokak sokak {district.name} ve çevresinde arama yapan müşterilerinizi sesli notlarla sisteme kaydedin. Yapay zeka, elinizdeki portföylerle saniyeler içinde eşleştirsin.
              </p>
            </div>

            <div className="bg-surface-container border border-outline-variant rounded-2xl p-8 hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-on-surface">
                Rekabetçi Takip
              </h3>
              <p className="text-on-surface-variant leading-relaxed">
                {district.city} emlak piyasasında portföy çalınmasını ve takipsizliği bitirin. Sisteme girdiğiniz müşteriye saniyeler içinde profesyonel WhatsApp sunumu gönderin.
              </p>
            </div>

            <div className="bg-surface-container border border-outline-variant rounded-2xl p-8 hover:border-primary/50 transition-colors">
              <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center text-primary mb-6">
                <Bot className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3 text-on-surface">
                Sözleşmeli Portföy Garantisi
              </h3>
              <p className="text-on-surface-variant leading-relaxed">
                Mülk sahibine gidip <em>"Benim {district.name}'de {district.target} ev arayan 150 hazır müşterim var"</em> diyerek tek yetki alma şansınızı artırın.
              </p>
            </div>
          </div>

          {/* Value Prop Section */}
          <div className="mt-24 bg-surface-container border border-outline-variant rounded-3xl p-8 md:p-12 text-center md:text-left flex flex-col md:flex-row items-center gap-12">
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-6 text-on-surface">
                Neden {district.name} Bölgesinde Kapora Kullanmalısınız?
              </h2>
              <p className="text-lg text-on-surface-variant mb-6">
                {district.city} şehrinin en hareketli lokasyonlarından biri olan {district.name}, danışmanlar için büyük fırsatlar sunarken artan rekabet hata payını sıfıra indiriyor.
              </p>
              <ul className="space-y-4 text-left">
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-primary shrink-0" />
                  <span className="text-on-surface-variant">Sesli komutla telefondan anında veri girişi.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-primary shrink-0" />
                  <span className="text-on-surface-variant">Karmaşık CRM ve Excel tabloları yerine sade, akıllı arayüz.</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle2 className="w-6 h-6 text-primary shrink-0" />
                  <span className="text-on-surface-variant">Sahadan müşterinize otomatik WhatsApp mesaj taslakları.</span>
                </li>
              </ul>
            </div>
            <div className="flex-1 flex justify-center">
              <div className="bg-background rounded-2xl border border-outline-variant shadow-xl p-6 w-full max-w-sm">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                    <Smartphone className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <h4 className="font-bold text-on-surface">Sesli Not Analizi</h4>
                    <p className="text-sm text-on-surface-variant">Yapay Zeka Dinliyor...</p>
                  </div>
                </div>
                <div className="bg-surface-variant/50 p-4 rounded-xl text-sm text-on-surface-variant italic mb-4">
                  "Bugün Ahmet Bey aradı, {district.name}'de 3+1 ev arıyor, bütçesi 5 milyon TL..."
                </div>
                <div className="space-y-2">
                  <div className="h-2 bg-primary/20 rounded w-full overflow-hidden">
                    <div className="h-full bg-primary w-2/3 animate-pulse"></div>
                  </div>
                  <p className="text-xs text-center text-primary font-medium">Portföylerle eşleştiriliyor</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
