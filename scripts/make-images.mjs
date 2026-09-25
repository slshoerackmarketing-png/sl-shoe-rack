// Generates illustration artwork until the client's real photos arrive.
// Run: node scripts/make-images.mjs
// Racks are drawn to their real proportions from src/data/products.json in the documented colours.
// Files are named *.illustration.jpg and the site labels them "Illustration". Drop a real photo
// with the plain name (e.g. products/single-3-step.jpg) and it replaces the illustration automatically.
import sharp from 'sharp';
import { mkdirSync, readFileSync } from 'node:fs';

const data = JSON.parse(readFileSync('src/data/products.json', 'utf8'));
const cat = Object.fromEntries(data.categories.map((c) => [c.id, c]));
const find = (id) => data.categories.flatMap((c) => c.products.map((p) => ({ ...p, cols: c.columns, colours: c.colours }))).find((p) => p.id === id);

const COLOURS = {
  'Grey white': { body: '#e3e6e7', door1: '#f1f3f3', door2: '#d9dddf', edge: '#a9b0b5', slot: '#7f878d', inside: '#3b4146' },
  'Coffee white': { body: '#d6c1a6', door1: '#e4d2bb', door2: '#cbb495', edge: '#a88f70', slot: '#7a644b', inside: '#3a3129' },
  Ivory: { body: '#efe5cf', door1: '#f8f1e2', door2: '#e6d9bc', edge: '#c5b690', slot: '#98896a', inside: '#3d3629' },
  Black: { body: '#2c2f33', door1: '#3a3e43', door2: '#24272a', edge: '#131517', slot: '#0b0c0d', inside: '#101112' },
};
const SHOES = ['#7b3f22', '#1d1f22', '#c9473a', '#eeeeee', '#35598a', '#b88a4a'];
const key = (c) => c.replace(/\s/g, '');
const defs = () =>
  Object.entries(COLOURS)
    .map(
      ([name, c]) => `<linearGradient id="d-${key(name)}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stop-color="${c.door1}"/><stop offset="1" stop-color="${c.door2}"/></linearGradient>`,
    )
    .join('') +
  `<filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="10"/></filter>
   <radialGradient id="light" cx="0.5" cy="0.25" r="0.8"><stop offset="0" stop-color="#fff" stop-opacity=".45"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>`;

/** A wall-mounted rack. x = left edge, bottom = bottom edge (px). open = list of "col-row" doors shown open with shoes. */
function rack({ x, bottom, ppi, p, colour, open = [] }) {
  const c = COLOURS[colour];
  const W = p.widthIn * ppi, H = p.heightIn * ppi, y = bottom - H;
  const pad = 0.7 * ppi, gap = 0.55 * ppi, cols = p.cols;
  const colW = (W - pad * 2 - gap * (cols - 1)) / cols;
  const doorH = (H - pad * 2 - gap * (p.steps - 1)) / p.steps;
  let s = `<rect x="${x + 12}" y="${y + 16}" width="${W}" height="${H}" rx="6" fill="#000" opacity=".22" filter="url(#soft)"/>
    <rect x="${x}" y="${y}" width="${W}" height="${H}" rx="4" fill="${c.body}" stroke="${c.edge}" stroke-width="2"/>
    <rect x="${x + 2}" y="${y + 2}" width="${W - 4}" height="${Math.max(3, ppi * 0.35)}" rx="2" fill="#fff" opacity="${colour === 'Black' ? 0.08 : 0.5}"/>`;
  let shoe = 0;
  for (let col = 0; col < cols; col++) {
    for (let row = 0; row < p.steps; row++) {
      const dx = x + pad + col * (colW + gap), dy = y + pad + row * (doorH + gap);
      if (open.includes(`${col}-${row}`)) {
        s += `<rect x="${dx}" y="${dy}" width="${colW}" height="${doorH}" rx="2" fill="${c.inside}"/>`;
        for (let k = 0; k < 2; k++) {
          const sw = colW * 0.34, sx = dx + colW * (0.12 + k * 0.42), sy = dy + doorH * 0.12;
          const col2 = SHOES[shoe++ % SHOES.length];
          s += `<path d="M${sx} ${sy + doorH * 0.5} q0 ${-doorH * 0.42} ${sw * 0.5} ${-doorH * 0.42} q${sw * 0.5} 0 ${sw * 0.5} ${doorH * 0.42} z" fill="${col2}"/>
            <rect x="${sx}" y="${sy + doorH * 0.44}" width="${sw}" height="${doorH * 0.08}" rx="2" fill="#000" opacity=".35"/>`;
        }
        const oy = dy + doorH * 0.5; // door tilted out: lower part of the opening, slightly proud
        s += `<rect x="${dx - 3}" y="${oy}" width="${colW + 6}" height="${doorH * 0.62}" rx="2" fill="url(#d-${key(colour)})" stroke="${c.edge}" stroke-width="1.5"/>
          <rect x="${dx - 3}" y="${oy + doorH * 0.62 - 3}" width="${colW + 6}" height="6" fill="#000" opacity=".15"/>`;
      } else {
        s += `<rect x="${dx}" y="${dy}" width="${colW}" height="${doorH}" rx="2" fill="url(#d-${key(colour)})" stroke="${c.edge}" stroke-width="1.5"/>`;
        const hw = colW * 0.36, hh = Math.max(5, doorH * 0.07);
        s += `<rect x="${dx + (colW - hw) / 2}" y="${dy + doorH * 0.13}" width="${hw}" height="${hh}" rx="${hh / 2}" fill="${c.slot}"/>`;
      }
    }
  }
  return s;
}

const wall = (W, floorY, colour) =>
  `<rect width="${W}" height="${floorY}" fill="${colour}"/><rect width="${W}" height="${floorY}" fill="url(#light)"/>`;
const woodFloor = (W, H, floorY) => {
  let s = `<rect y="${floorY}" width="${W}" height="${H - floorY}" fill="#c49c72"/>`;
  for (let i = 1, y = floorY; y < H; i++) {
    y = floorY + Math.pow(i, 1.55) * 9;
    s += `<line x1="0" x2="${W}" y1="${y}" y2="${y}" stroke="#a97f57" stroke-width="1.5" opacity=".55"/>`;
  }
  return s + `<rect y="${floorY - 16}" width="${W}" height="16" fill="#fbfaf7"/><line x1="0" x2="${W}" y1="${floorY}" y2="${floorY}" stroke="#8d6a48" stroke-width="2"/>`;
};
const tileFloor = (W, H, floorY, colour = '#d8d3cb') => {
  let s = `<rect y="${floorY}" width="${W}" height="${H - floorY}" fill="${colour}"/>`;
  for (let i = 1, y = floorY; y < H; i++) {
    y = floorY + Math.pow(i, 1.7) * 12;
    s += `<line x1="0" x2="${W}" y1="${y}" y2="${y}" stroke="#fff" stroke-width="2" opacity=".6"/>`;
  }
  for (let x = -600; x < W + 600; x += 140) s += `<line x1="${W / 2 + (x - W / 2) * 0.35}" y1="${floorY}" x2="${x}" y2="${H}" stroke="#fff" stroke-width="2" opacity=".5"/>`;
  return s + `<rect y="${floorY - 14}" width="${W}" height="14" fill="#f4f2ee"/>`;
};
const door = (x, floorY, w, h, colour = '#8a6242') =>
  `<rect x="${x - 14}" y="${floorY - h - 14}" width="${w + 28}" height="${h + 14}" fill="#f7f5f0" stroke="#d8d2c6" stroke-width="2"/>
   <rect x="${x}" y="${floorY - h}" width="${w}" height="${h}" fill="${colour}"/>
   <rect x="${x + w * 0.12}" y="${floorY - h * 0.92}" width="${w * 0.76}" height="${h * 0.36}" fill="none" stroke="#000" stroke-opacity=".15" stroke-width="3"/>
   <rect x="${x + w * 0.12}" y="${floorY - h * 0.5}" width="${w * 0.76}" height="${h * 0.42}" fill="none" stroke="#000" stroke-opacity=".15" stroke-width="3"/>
   <circle cx="${x + w * 0.86}" cy="${floorY - h * 0.47}" r="7" fill="#d9b25a"/>`;
const plant = (x, floorY, s = 1) =>
  `<ellipse cx="${x}" cy="${floorY + 6}" rx="${48 * s}" ry="${9 * s}" fill="#000" opacity=".15"/>
   <path d="M${x - 38 * s} ${floorY - 90 * s} h${76 * s} l${-10 * s} ${90 * s} h${-56 * s} z" fill="#c9714c"/>
   ${[[-40, -175, -25], [30, -190, 20], [0, -230, 0], [-60, -130, -50], [55, -140, 45], [-15, -160, -10], [20, -150, 15]]
     .map(([dx, dy, r]) => `<ellipse cx="${x + dx * s}" cy="${floorY + dy * s}" rx="${22 * s}" ry="${60 * s}" transform="rotate(${r} ${x + dx * s} ${floorY + dy * s})" fill="${r % 2 ? '#4e7c49' : '#6b9b5d'}"/>`)
     .join('')}`;
const mat = (cx, floorY, w) => `<rect x="${cx - w / 2}" y="${floorY + 40}" width="${w}" height="46" rx="10" fill="#6f5f52"/><rect x="${cx - w / 2 + 10}" y="${floorY + 48}" width="${w - 20}" height="30" rx="6" fill="none" stroke="#a89280" stroke-width="3"/>`;
const mirror = (x, y, w, h) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${w / 2}" fill="#cfdde5" stroke="#b28c5f" stroke-width="10"/>
   <path d="M${x + w * 0.25} ${y + h * 0.2} l${w * 0.3} ${-h * 0.05} l${-w * 0.2} ${h * 0.6} l${-w * 0.2} ${h * 0.02} z" fill="#fff" opacity=".35"/>`;
const frame = (x, y, w, h) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="#fff" stroke="#2d3033" stroke-width="8"/>
   <circle cx="${x + w * 0.35}" cy="${y + h * 0.45}" r="${h * 0.22}" fill="#e3a21a" opacity=".85"/>
   <rect x="${x + w * 0.45}" y="${y + h * 0.3}" width="${w * 0.35}" height="${h * 0.45}" fill="#3d5568"/>`;
const shoesOnFloor = (x, floorY) =>
  `<ellipse cx="${x}" cy="${floorY + 64}" rx="34" ry="11" fill="#1d1f22"/><ellipse cx="${x + 46}" cy="${floorY + 70}" rx="34" ry="11" fill="#1d1f22"/>`;

const svg = (W, H, body) => `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}"><defs>${defs()}</defs>${body}</svg>`;
const out = async (file, s) => {
  await sharp(Buffer.from(s)).jpeg({ quality: 82, mozjpeg: true }).toFile(file);
  console.log('wrote', file);
};

mkdirSync('src/assets/images/products', { recursive: true });
mkdirSync('src/assets/images/installed', { recursive: true });
mkdirSync('src/assets/images/hero', { recursive: true });

// 1. One studio-style image per rack, all at the same scale so sizes compare honestly.
{
  const W = 1200, H = 900, floorY = 820, ppi = 9;
  for (const c of data.categories.filter((c) => c.kind === 'rack')) {
    for (const [i, raw] of c.products.entries()) {
      const p = { ...raw, cols: c.columns };
      const colour = c.colours[i % c.colours.length];
      const w = p.widthIn * ppi;
      const body =
        wall(W, floorY, '#eceff1') +
        tileFloor(W, H, floorY, '#dcd8d2') +
        rack({ x: (W - w) / 2, bottom: floorY - 7 * ppi, ppi, p, colour, open: p.steps > 2 ? [`0-${p.steps - 1}`] : [] });
      await out(`src/assets/images/products/${p.id}.illustration.jpg`, svg(W, H, body));
    }
  }
}

// 2. Showroom lineup: single deckers shortest to tallest, then double deckers.
{
  const W = 1600, H = 800, floorY = 740, gap = 22, margin = 70;
  const order = [...cat.single.products.map((p) => ({ ...p, cols: 1 })), ...cat.double.products.map((p) => ({ ...p, cols: 2 }))];
  const ppi = (W - margin * 2 - gap * (order.length - 1)) / order.reduce((n, p) => n + p.widthIn, 0);
  let x = margin, body = wall(W, floorY, '#e7ebee') + tileFloor(W, H, floorY);
  const palette = ['Grey white', 'Coffee white', 'Ivory', 'Grey white', 'Black', 'Ivory', 'Coffee white', 'Black'];
  order.forEach((p, i) => {
    body += rack({ x, bottom: floorY, ppi, p, colour: palette[i] });
    x += p.widthIn * ppi + gap;
  });
  await out('src/assets/images/hero/showroom-lineup.illustration.jpg', svg(W, H, body));
}

// 3. "Installed in homes" reference scenes.
{
  const W = 1200, H = 900, floorY = 720, ppi = 7.2, mount = 8 * ppi;
  const scenes = {
    'hallway-single-4-step':
      wall(W, floorY, '#e9e4dc') + woodFloor(W, H, floorY) + door(110, floorY, 280, 600) + mat(250, floorY, 260) +
      rack({ x: 560, bottom: floorY - mount, ppi, p: find('single-4-step'), colour: 'Grey white', open: ['0-3'] }) +
      shoesOnFloor(640, floorY) + plant(1010, floorY, 1),
    'entrance-double-3-step':
      wall(W, floorY, '#dfe7ec') + tileFloor(W, H, floorY) +
      rack({ x: 420, bottom: floorY - mount, ppi, p: find('double-3-step'), colour: 'Ivory', open: ['1-1'] }) +
      plant(220, floorY, 1.1) + frame(820, 160, 220, 160),
    'office-double-5-step':
      wall(W, floorY, '#d8dde1') + tileFloor(W, H, floorY, '#c9c9c7') +
      rack({ x: 380, bottom: floorY - mount, ppi, p: find('double-5-step'), colour: 'Black', open: ['0-4', '1-2'] }) +
      frame(830, 150, 240, 170) + plant(960, floorY, 0.9),
    'flat-single-2-step':
      wall(W, floorY, '#efe9e1') + woodFloor(W, H, floorY) + mirror(470, 90, 260, 330) +
      rack({ x: 510, bottom: floorY - mount, ppi, p: find('single-2-step'), colour: 'Coffee white' }) +
      mat(600, floorY, 300) + plant(220, floorY, 0.9),
    'family-home-double-4-step':
      wall(W, floorY, '#e4e9e6') + woodFloor(W, H, floorY) + door(840, floorY, 260, 600, '#5d6b73') +
      rack({ x: 330, bottom: floorY - mount, ppi, p: find('double-4-step'), colour: 'Coffee white', open: ['0-1', '1-3'] }) +
      shoesOnFloor(420, floorY),
  };
  for (const [name, body] of Object.entries(scenes)) await out(`src/assets/images/installed/${name}.illustration.jpg`, svg(W, H, body));
}
