import fs from 'fs';
import path from 'path';
import process from 'node:process';
import { fileURLToPath } from 'url';
import { SEO_BLOG_DRAFTS } from '../src/data/seoBlogDrafts.js';
import { COMPARISONS } from '../src/data/comparisons.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const sitemap = fs.readFileSync(path.join(__dirname, '../public/sitemap.xml'), 'utf8');
const errors = [];
const seen = new Set();

for (const post of SEO_BLOG_DRAFTS) {
  if (seen.has(post.slug)) errors.push(`Tekrarlanan slug: ${post.slug}`);
  seen.add(post.slug);
  if ((post.seoTitle || '').length >= 60) errors.push(`Başlık 60 karakter sınırında değil: ${post.slug}`);
  if ((post.metaDescription || '').length >= 155) errors.push(`Meta açıklama 155 karakter sınırında değil: ${post.slug}`);
  if (!sitemap.includes(`/blog/${post.slug}</loc>`)) errors.push(`Sitemap eksik: ${post.slug}`);
  if (!post.summary || !post.outline?.length) errors.push(`Taslak şeması eksik: ${post.slug}`);
}

for (const [slug, comparison] of Object.entries(COMPARISONS)) {
  if (comparison.seoTitle.length >= 60) errors.push(`Karşılaştırma başlığı uzun: ${slug}`);
  if (comparison.description.length >= 155) errors.push(`Karşılaştırma meta açıklaması uzun: ${slug}`);
  if (!sitemap.includes(`/karsilastirma/${slug}</loc>`)) errors.push(`Sitemap karşılaştırması eksik: ${slug}`);
}

for (const url of ['/emlak-crm', '/araclar/emlak-komisyonu-hesaplama']) {
  if (!sitemap.includes(`${url}</loc>`)) errors.push(`Sitemap sayfası eksik: ${url}`);
}

if (errors.length) {
  console.error(errors.join('\n'));
  process.exit(1);
}

console.log(`${SEO_BLOG_DRAFTS.length} taslak ve tüm yeni statik sayfalar için SEO kontrolü başarılı.`);
