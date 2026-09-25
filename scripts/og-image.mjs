// Regenerates public/og-image.jpg (1200×630) from data. Run: node scripts/og-image.mjs
// Replace with a showroom photo + name once the client's photos arrive.
import sharp from 'sharp';
import { readFileSync } from 'node:fs';

const site = JSON.parse(readFileSync('src/data/site.json', 'utf8'));
const data = JSON.parse(readFileSync('src/data/products.json', 'utf8'));
const racks = data.categories.find((c) => c.id === 'single').products;
const min = Math.min(...data.categories.filter((c) => c.kind === 'rack').flatMap((c) => c.products).map((p) => p.price));
const inr = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n);

const ppi = 4.2, floor = 560, x0 = 690, gap = 20;
const rack = (p, i) => {
  const w = p.widthIn * ppi, h = p.heightIn * ppi, x = x0 + i * (w + gap), y = floor - h;
  const pad = 7, g = 5, dh = (h - pad * 2 - g * (p.steps - 1)) / p.steps;
  const doors = Array.from({ length: p.steps }, (_, r) => {
    const dy = y + pad + r * (dh + g);
    return `<rect x="${x + pad}" y="${dy}" width="${w - pad * 2}" height="${dh}" rx="2" fill="#F5F7F8" stroke="#3D5568" stroke-width="2"/>
      <line x1="${x + w * 0.38}" x2="${x + w * 0.62}" y1="${dy + 8}" y2="${dy + 8}" stroke="#3D5568" stroke-width="3" stroke-linecap="round"/>`;
  }).join('');
  return `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="#fff" stroke="#3D5568" stroke-width="3"/>${doors}`;
};
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630">
  <rect width="1200" height="630" fill="#F5F7F8"/>
  <text x="72" y="150" font-family="Arial Narrow, Arial, sans-serif" font-weight="800" font-size="40" fill="#3D5568">${site.shortName}</text>
  <text x="72" y="250" font-family="Arial, sans-serif" font-weight="800" font-size="64" fill="#22272B">Metal shoe racks</text>
  <text x="72" y="325" font-family="Arial, sans-serif" font-weight="800" font-size="64" fill="#22272B">that fit your wall.</text>
  <text x="72" y="400" font-family="Arial, sans-serif" font-size="30" fill="#4A535A">Single and double decker, from ${inr(min)}</text>
  <rect x="72" y="425" width="160" height="5" fill="#E3A21A"/>
  <text x="72" y="540" font-family="Arial, sans-serif" font-size="26" fill="#22272B">${site.address.street}, ${site.address.city}  ·  ${site.phoneDisplay}</text>
  ${racks.map(rack).join('')}
  <line x1="${x0 - 20}" x2="1170" y1="${floor}" y2="${floor}" stroke="#22272B" stroke-width="4"/>
  <line x1="${x0 - 20}" x2="1170" y1="${floor - 40 * ppi}" y2="${floor - 40 * ppi}" stroke="#3D5568" stroke-width="2" stroke-dasharray="8 6"/>
</svg>`;
await sharp(Buffer.from(svg)).jpeg({ quality: 82, mozjpeg: true }).toFile('public/og-image.jpg');
console.log('public/og-image.jpg written');
