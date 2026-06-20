import puppeteer from 'puppeteer';
import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read the blogPosts.jsx file as text to extract slugs
const blogPostsFilePath = path.join(__dirname, '../src/data/blogPosts.jsx');
const content = fs.readFileSync(blogPostsFilePath, 'utf8');

const slugRegex = /slug:\s*['"]([^'"]+)['"]/g;
const slugs = [];
let match;
while ((match = slugRegex.exec(content)) !== null) {
  slugs.push(match[1]);
}

const routesToPrerender = [
  '/',
  '/blog',
  ...slugs.map(slug => `/blog/${slug}`),
  '/aydinlatma-metni',
  '/gizlilik-politikasi',
  '/ilan-analizi'
];

const PORT = 54321;
const distPath = path.resolve(__dirname, '../dist');

async function run() {
  console.log('Starting prerender server...');
  const app = express();
  
  // Serve static files from dist
  app.use(express.static(distPath));
  
  // Fallback to index.html for SPA routing
  app.use((req, res) => {
    res.sendFile(path.join(distPath, 'index.html'));
  });

  const server = app.listen(PORT, async () => {
    console.log(`Server listening on port ${PORT}`);
    
    console.log('Launching Puppeteer...');
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    for (const route of routesToPrerender) {
      console.log(`Prerendering ${route}...`);
      const page = await browser.newPage();
      
      try {
        await page.goto(`http://localhost:${PORT}${route}`, {
          waitUntil: 'networkidle0',
          timeout: 30000
        });

        // Ensure React has hydrated/rendered
        await page.waitForFunction('document.querySelector("#root").hasChildNodes()');

        const html = await page.content();
        
        // Determine file path
        let filePath;
        if (route === '/') {
          filePath = path.join(distPath, 'index.html');
        } else {
          const dirPath = path.join(distPath, route.substring(1));
          if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
          }
          filePath = path.join(dirPath, 'index.html');
        }

        fs.writeFileSync(filePath, html);
        console.log(`Successfully generated ${filePath}`);
      } catch (err) {
        console.error(`Failed to prerender ${route}:`, err.message);
      } finally {
        await page.close();
      }
    }

    await browser.close();
    server.close();
    console.log('Prerendering complete!');
  });
}

run();
