import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Head } from 'vite-react-ssg';
import { Logo } from '../components/Logo';
import { BLOG_POSTS, getBlogPostContent } from '../data/blogPosts';

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

  // Use the external generator
  const renderContent = () => {
    return getBlogPostContent(slug);
  };

  return (
    <div className="min-h-screen bg-background text-on-surface font-sans">
      <Head>
        <title>{post.title} | Kapora Blog</title>
        <meta name="description" content={post.excerpt} />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.excerpt} />
        <link rel="canonical" href={`https://kapora.online/blog/${post.slug}`} />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            "headline": post.title,
            "description": post.excerpt,
            "author": {
              "@type": "Organization",
              "name": "Kapora AI Editör Ekibi"
            },
            "publisher": {
              "@type": "Organization",
              "name": "Kapora AI",
              "logo": {
                "@type": "ImageObject",
                "url": "https://www.kapora.online/logo-k.png"
              }
            },
            "datePublished": new Date(post.date).toISOString(),
            "dateModified": new Date(post.date).toISOString(),
            "mainEntityOfPage": {
              "@type": "WebPage",
              "@id": `https://kapora.online/blog/${post.slug}`
            }
          })}
        </script>
      </Head>
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
          <p className="text-on-surface-variant mb-6">Türkiye'nin en gelişmiş emlak Sistem'i Kapora AI ile bugün tanışın. Saniyeler içinde kayıt olun, yapay zekanın gücünü ofisinize taşıyın.</p>
          <Link to="/auth" className="inline-block bg-primary text-on-primary font-bold px-8 py-3 rounded-lg hover:bg-primary/90 transition-colors">
            Ücretsiz Başlayın
          </Link>
        </div>
      </article>

    </div>
  );
}
