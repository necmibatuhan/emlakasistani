import React from 'react';
import { Link } from 'react-router-dom';
import { Logo } from './Logo';

export default function PublicPageShell({ children }) {
  return (
    <div className="min-h-screen bg-background text-on-surface font-sans">
      <nav className="sticky top-0 z-50 border-b border-outline-variant bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-4 sm:px-6">
          <Logo />
          <div className="flex items-center gap-3 sm:gap-6">
            <Link to="/blog" className="hidden text-sm font-medium text-on-surface-variant hover:text-on-surface sm:block">Blog</Link>
            <Link to="/pricing" className="hidden text-sm font-medium text-on-surface-variant hover:text-on-surface md:block">Fiyatlar</Link>
            <Link to="/auth" className="rounded-lg bg-primary px-4 py-2 text-sm font-bold text-on-primary hover:bg-primary/90">Ücretsiz Başla</Link>
          </div>
        </div>
      </nav>
      {children}
      <footer className="border-t border-outline bg-surface-container px-6 py-10 text-center text-sm text-on-surface-variant">
        <div className="mb-3 flex flex-wrap justify-center gap-5">
          <Link to="/emlak-crm" className="hover:text-primary">Emlak CRM</Link>
          <Link to="/blog" className="hover:text-primary">Blog</Link>
          <Link to="/araclar/emlak-komisyonu-hesaplama" className="hover:text-primary">Komisyon Hesaplama</Link>
        </div>
        © 2026 Kapora. Emlak profesyonelleri için müşteri ve satış yönetimi.
      </footer>
    </div>
  );
}

