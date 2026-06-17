import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Logo } from '../components/Logo';
import { BLOG_POSTS } from './BlogList';

export default function BlogPost() {
  const { slug } = useParams();
  const post = BLOG_POSTS.find(p => p.slug === slug);

  if (!post) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center text-on-surface">
        <h1 className="text-2xl font-bold mb-4">Yazı bulunamadı.</h1>
        <Link to="/blog" className="text-primary hover:underline">Blog'a Dön</Link>
      </div>
    );
  }

  // Dummy content generator based on slug
  const renderContent = () => {
    if (slug.includes('en-iyi-5-musteri-takip')) {
      return (
        <div className="prose prose-invert prose-lg max-w-none prose-p:text-on-surface-variant prose-headings:text-on-surface">
          <p>Emlak danışmanları için portföy takibi, müşteri (lead) yönetimi ve satış kapatma süreçleri her zaman karmaşık olmuştur. Geleneksel ajandalar veya Excel tabloları artık günümüzün hızına ayak uyduramıyor.</p>
          <h2>1. Kapora AI</h2>
          <p><strong>Kapora AI</strong>, yalnızca bir CRM değil, aynı zamanda yapay zeka destekli bir emlak satış asistanıdır. Sesli notlarınızı saniyeler içinde analiz eder, bütçe ve lokasyon bilgilerini çıkararak portföylerinizle otomatik eşleştirir. WhatsApp taslaklarını sizin yerinize hazırlar.</p>
          <h2>2. Salesforce for Real Estate</h2>
          <p>Dünyanın en popüler sistemlerinden biri olsa da, küçük ve orta ölçekli emlak ofisleri için kurulumu ve kullanımı oldukça karmaşıktır.</p>
          <h2>3. Pipedrive</h2>
          <p>Satış hunisi yönetimi konusunda başarılıdır ancak emlak sektörüne özel "portföy-müşteri eşleştirme" dinamikleri eksiktir.</p>
          <h2>4. HubSpot</h2>
          <p>Harika bir pazarlama otomasyonu sunar ancak maliyetleri oldukça yüksektir ve yapay zeka emlak analizi özellikleri bulunmaz.</p>
          <h2>5. Zoho CRM</h2>
          <p>Uygun fiyatlı bir alternatiftir ancak Türkiye emlak pazarının dinamiklerine (sahadan sesli not girme gibi) hızlı adapte olamaz.</p>
          <h3>Sonuç</h3>
          <p>Eğer sahada sürekli hareket halindeyseniz, "Emlak danışmanı müşteri takip programı" arayışınızda sesli veri girişi ve akıllı eşleştirme sunan sistemleri tercih etmelisiniz.</p>
          
          <div className="mt-8 pt-8 border-t border-outline-variant">
            <h4 className="text-lg font-semibold mb-4 text-on-surface">Referans Linkleri</h4>
            <ul className="list-disc pl-5 space-y-2">
              <li><a href="https://www.endeksa.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Endeksa CRM ve Emlak Çözümleri</a></li>
              <li><a href="https://www.re-os.com/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">RE-OS Emlak Yönetim Sistemleri</a></li>
              <li><a href="https://www.pipedrive.com/en/blog/real-estate-crm" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Pipedrive: Why Real Estate Agents Need a CRM</a></li>
            </ul>
          </div>
        </div>
      );
    }

    if (slug.includes('sesli-crm-nedir')) {
      return (
        <div className="prose prose-invert prose-lg max-w-none prose-p:text-on-surface-variant prose-headings:text-on-surface">
          <p>Sahada müşteri gezdirirken veya direksiyon başındayken gelen bir telefon görüşmesinin notlarını almak her zaman zordur. İşte bu noktada <strong>Sesli CRM (Voice CRM)</strong> teknolojisi devreye giriyor.</p>
          <h2>Yapay Zeka Emlak Asistanı Nasıl Çalışır?</h2>
          <p>Siz sadece telefonunuza "Bugün Mehmet Bey aradı, Kadıköy'de 15 milyona kadar satılık 3+1 arıyor" şeklinde bir sesli not bırakırsınız. Yapay zeka bu sesi dinler, niyeti (Alıcı), lokasyonu (Kadıköy) ve bütçeyi (15.000.000 TL) otomatik olarak ayrıştırarak veritabanınıza kaydeder.</p>
          <h2>Manuel Veri Girişine Son</h2>
          <p>Sisteme klavyeyle veri girmek zorunda kalmadığınız için zamandan tasarruf edersiniz ve hiçbir müşteriyi unutmazsınız. Kapora AI gibi sistemler bu sesli notları dinleyerek size doğrudan eşleşen evleri önerir.</p>

          <div className="mt-8 pt-8 border-t border-outline-variant">
            <h4 className="text-lg font-semibold mb-4 text-on-surface">Referans Linkleri</h4>
            <ul className="list-disc pl-5 space-y-2">
              <li><a href="https://www.inman.com/technology/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Inman News: Real Estate Technology & AI Trends</a></li>
              <li><a href="https://www.forbes.com/sites/forbestechcouncil/2021/08/17/how-voice-ai-is-transforming-the-real-estate-industry/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Forbes: How Voice AI Is Transforming The Real Estate Industry</a></li>
            </ul>
          </div>
        </div>
      );
    }

    return (
      <div className="prose prose-invert prose-lg max-w-none prose-p:text-on-surface-variant prose-headings:text-on-surface">
        <p>Emlak ofislerinde zamanın %60'ı maalesef operasyonel işlere, veri girişine ve Excel tablolarını düzenlemeye gidiyor. Oysa bir emlak danışmanının ana işi sahada olmak, müzakere etmek ve satış kapatmaktır.</p>
        <h2>Otomasyona Nereden Başlamalı?</h2>
        <p>Gelen çağrıları ve müşteri taleplerini otomatik olarak kategorize eden <strong>Gayrimenkul eşleştirme yazılımları</strong> kullanmalısınız. Bir müşteri sisteme düştüğünde, elinizdeki portföylerle saniyeler içinde eşleşip WhatsApp üzerinden müşteriye sunum gönderilebilir olmalıdır.</p>
        <h2>Yapay Zekanın Gücü</h2>
        <p>Manuel işleri yapay zekaya devrettiğinizde, haftada ortalama 15 saatlik bir zaman kazancı sağlarsınız. Bu da daha fazla müşteri görüşmesi ve daha yüksek komisyon demektir.</p>

        <div className="mt-8 pt-8 border-t border-outline-variant">
          <h4 className="text-lg font-semibold mb-4 text-on-surface">Referans Linkleri</h4>
          <ul className="list-disc pl-5 space-y-2">
            <li><a href="https://www.nar.realtor/research-and-statistics" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">National Association of Realtors (NAR) - Technology Impact Report</a></li>
            <li><a href="https://hbr.org/2019/06/how-ai-will-change-sales" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Harvard Business Review: How AI Will Change Sales</a></li>
          </ul>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background text-on-surface font-sans">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-outline-variant">
        <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-stack-lg">
            <Link to="/blog" className="text-on-surface-variant hover:text-on-surface font-body-sm font-medium transition-colors">Blog</Link>
            <Link to="/auth" className="bg-primary hover:bg-primary/90 text-on-primary font-body-sm font-medium px-5 py-2 rounded-md transition-colors">
              Ücretsiz Başla
            </Link>
          </div>
        </div>
      </nav>

      {/* Article Header */}
      <article className="pt-32 pb-16 px-6 max-w-[800px] mx-auto">
        <div className="flex items-center gap-4 mb-6">
          <Link to="/blog" className="text-on-surface-variant hover:text-primary flex items-center text-sm font-medium transition-colors">
            <span className="material-symbols-outlined text-[18px] mr-1">arrow_back</span>
            Tüm Yazılar
          </Link>
          <span className="text-outline-variant">|</span>
          <span className="bg-primary/10 text-primary text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
            {post.category}
          </span>
          <span className="text-on-surface-variant text-[13px]">{post.readTime} okuma</span>
        </div>
        
        <h1 className="font-display-lg text-[36px] md:text-[48px] font-semibold leading-[1.2] text-on-surface mb-6">
          {post.title}
        </h1>
        
        <div className="text-on-surface-variant text-sm mb-12 flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-surface-container-high border border-outline flex items-center justify-center">
             <span className="material-symbols-outlined text-[16px]">edit</span>
          </div>
          <div>
            <div className="font-medium text-on-surface">Kapora AI Editör Ekibi</div>
            <div>{new Date(post.date).toLocaleDateString('tr-TR', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
          </div>
        </div>

        {/* Article Content */}
        <div className="border-t border-outline-variant pt-8">
          {renderContent()}
        </div>

        {/* Inline CTA */}
        <div className="mt-16 bg-surface-container border border-primary/30 rounded-2xl p-8 text-center shadow-[0_0_30px_rgba(217,167,74,0.1)]">
          <h3 className="text-[24px] font-bold text-on-surface mb-4">Teoriyi Pratiğe Dökün</h3>
          <p className="text-on-surface-variant mb-6">Türkiye'nin en gelişmiş emlak CRM'i Kapora AI ile bugün tanışın. Saniyeler içinde kayıt olun, yapay zekanın gücünü ofisinize taşıyın.</p>
          <Link to="/auth" className="inline-block bg-primary text-on-primary font-bold px-8 py-3 rounded-lg hover:bg-primary/90 transition-colors">
            Ücretsiz Başlayın
          </Link>
        </div>
      </article>

    </div>
  );
}
