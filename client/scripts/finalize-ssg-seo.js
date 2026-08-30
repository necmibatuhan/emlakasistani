import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, '../dist');

function htmlFiles(directory) {
  return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = path.join(directory, entry.name);
    return entry.isDirectory() ? htmlFiles(target) : entry.name.endsWith('.html') ? [target] : [];
  });
}

for (const file of htmlFiles(distDir)) {
  let html = fs.readFileSync(file, 'utf8');
  if (html.includes('<title data-rh="true">')) {
    html = html.replace(/<title>(?![^<]*data-rh)[^<]*<\/title>/g, '');
  }
  if (html.includes('data-rh="true" name="description"')) {
    html = html.replace(/<meta name="description"[^>]*>/g, '');
  }
  for (const property of ['og:type', 'og:url', 'og:title', 'og:description']) {
    if (html.includes(`data-rh="true" property="${property}"`)) {
      const escaped = property.replace(':', '\\:');
      html = html.replace(new RegExp(`<meta property="${escaped}"[^>]*>`, 'g'), '');
    }
  }
  fs.writeFileSync(file, html);
}

console.log('SSG sayfalarındaki varsayılan yinelenen SEO etiketleri temizlendi.');

