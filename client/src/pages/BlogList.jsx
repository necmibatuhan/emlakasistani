import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Logo } from '../components/Logo';

import { BLOG_POSTS } from '../data/blogPosts';

export default function BlogList() {
  return (
    <div className="min-h-screen bg-background text-on-surface font-sans">
      <Helmet>
        <title>Kapora Blog | Emlak Profesyonelleri İçin Satış ve Teknoloji Taktikleri</title>
        <meta name="description" content="Gayrimenkul sektöründeki en son yapay zeka trendleri, CRM stratejileri ve satış artırma taktiklerini keşfedin." />
        <meta property="og:title" content="Kapora Blog | Emlak Sektörü Taktikleri" />
        <meta property="og:description" content="Emlak danışmanları için teknoloji ve satış rehberi." />
        <link rel="canonical" href="https://kapora.online/blog" />
      </Helmet>

      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-outline-variant">
        <div className="max-w-[1200px] mx-auto px-6 h-16 flex items-center justify-between">
          <Logo />
          <div className="flex items-center gap-stack-lg">
            <Link to="/" className="text-on-surface-variant hover:text-on-surface font-body-sm font-medium transition-colors">Ana Sayfa</Link>
            <Link to="/auth" className="bg-primary hover:bg-primary/90 text-on-primary font-body-sm font-medium px-5 py-2 rounded-md transition-colors">
              Ücretsiz Başla
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-16 px-6 max-w-[1000px] mx-auto text-center">
        <h1 className="font-display-lg text-[40px] md:text-[56px] font-semibold leading-[1.2] text-on-surface mb-6">
          Emlak Profesyonelleri İçin <br/>
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-[#818cf8]">Bilgi ve Teknoloji Kaynağı</span>
        </h1>
        <p className="font-body-lg text-on-surface-variant max-w-[600px] mx-auto">
          Gayrimenkul sektöründeki en son yapay zeka trendleri, CRM stratejileri ve satış artırma taktiklerini keşfedin.
        </p>
      </section>

      {/* Blog Grid */}
      <section className="px-6 pb-24 max-w-[1200px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {BLOG_POSTS.map((post) => (
            <Link to={`/blog/${post.slug}`} key={post.slug} className="group block">
              <div className="bg-surface-container border border-outline rounded-2xl p-6 h-full shadow-[0_4px_20px_-4px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.4)] transition-all duration-300 transform hover:-translate-y-1">
                <div className="flex items-center gap-3 mb-4">
                  <span className="bg-primary/10 text-primary text-[11px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {post.category}
                  </span>
                  <span className="text-on-surface-variant text-[13px]">{post.readTime} okuma</span>
                </div>
                
                <h2 className="text-[20px] font-semibold text-on-surface mb-3 group-hover:text-primary transition-colors leading-tight">
                  {post.title}
                </h2>
                
                <p className="text-on-surface-variant text-[15px] leading-relaxed mb-6">
                  {post.excerpt}
                </p>

                <div className="flex items-center text-primary text-[14px] font-medium mt-auto group-hover:translate-x-1 transition-transform">
                  Devamını Oku 
                  <span className="material-symbols-outlined text-[18px] ml-1">arrow_right_alt</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
      
      {/* CTA Bottom */}
      <section className="bg-surface-container-high py-20 px-6 text-center border-t border-outline">
        <h2 className="text-[32px] font-bold text-on-surface mb-4">Satışlarınızı Katlamaya Hazır Mısınız?</h2>
        <p className="text-on-surface-variant mb-8 max-w-[500px] mx-auto">Manuel veri girişini bırakın, bırakın asistanınız sizin yerinize çalışsın. Hemen ücretsiz denemeye başlayın.</p>
        <Link to="/auth" className="inline-block bg-primary text-on-primary font-bold px-8 py-3.5 rounded-lg hover:bg-primary/90 transition-colors">
          Hemen Ücretsiz Dene
        </Link>
      </section>
    </div>
  );
}
