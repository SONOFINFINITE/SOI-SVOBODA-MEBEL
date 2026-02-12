/**
 * Генерирует sitemap.xml с подстановкой SITE_URL.
 * Запуск: SITE_URL=https://ваш-домен.ru node scripts/generate-sitemap.js
 * Или добавьте в .env: SITE_URL=https://ваш-домен.ru и в package.json "prebuild": "node scripts/generate-sitemap.js"
 */
const fs = require('fs');
const path = require('path');

const SITE_URL = process.env.SITE_URL || process.env.VITE_SITE_URL || 'https://svobodameb.ru';
const base = SITE_URL.replace(/\/$/, '');

const urls = [
  { loc: '/', changefreq: 'weekly', priority: '1.0' },
  { loc: '/catalog', changefreq: 'weekly', priority: '0.9' },
  { loc: '/collections', changefreq: 'weekly', priority: '0.9' },
  { loc: '/collections/modern-minimalism', changefreq: 'monthly', priority: '0.8' },
  { loc: '/collections/french-classics', changefreq: 'monthly', priority: '0.8' },
  { loc: '/collections/comfort-relax', changefreq: 'monthly', priority: '0.8' },
  { loc: '/collections/industrial-loft', changefreq: 'monthly', priority: '0.8' },
  { loc: '/collections/scandinavian-hygge', changefreq: 'monthly', priority: '0.8' },
  { loc: '/collections/dining-groups', changefreq: 'monthly', priority: '0.8' },
];

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>
    <loc>${base}${u.loc}</loc>
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>
`;

const outPath = path.join(__dirname, '..', 'public', 'sitemap.xml');
fs.writeFileSync(outPath, xml, 'utf8');
console.log('sitemap.xml written with SITE_URL:', base);
