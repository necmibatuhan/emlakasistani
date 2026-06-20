import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Domain URL
const DOMAIN = 'https://kapora.online';

// Read the blogPosts.jsx file as text
const blogPostsFilePath = path.join(__dirname, '../src/data/blogPosts.jsx');
const content = fs.readFileSync(blogPostsFilePath, 'utf8');

// Use Regex to extract all slugs
const slugRegex = /slug:\s*['"]([^'"]+)['"]/g;
const slugs = [];
let match;
while ((match = slugRegex.exec(content)) !== null) {
  slugs.push(match[1]);
}

// Fixed URLs
const urls = [
  '/',
  '/pricing',
  '/auth',
  '/blog',
  '/aydinlatma-metni',
  '/gizlilik-politikasi',
  '/ilan-analizi'
];

// Combine with blog slugs
const allUrls = [
  ...urls.map(url => `${DOMAIN}${url}`),
  ...slugs.map(slug => `${DOMAIN}/blog/${slug}`)
];

// Generate sitemap.xml
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(url => `  <url>
    <loc>${url}</loc>
    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${url === DOMAIN + '/' ? '1.0' : '0.8'}</priority>
  </url>`).join('\n')}
</urlset>
`;

const publicDir = path.join(__dirname, '../public');
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemap);
console.log('sitemap.xml generated successfully!');

// Generate robots.txt
const robotsTxt = `User-agent: *
Allow: /
Disallow: /dashboard
Disallow: /leads
Disallow: /integrations
Disallow: /whatsapp
Disallow: /properties
Disallow: /profile
Disallow: /offices
Disallow: /agents
Disallow: /reports

Sitemap: ${DOMAIN}/sitemap.xml
`;

fs.writeFileSync(path.join(publicDir, 'robots.txt'), robotsTxt);
console.log('robots.txt generated successfully!');
