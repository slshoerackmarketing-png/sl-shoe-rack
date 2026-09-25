# SL Shoe Rack Marketing website

Static catalog and contact site for SL Shoe Rack Marketing, Davangere. Built with Astro and plain CSS. There is no server and no database: all content comes from two JSON files.

Live: https://sl-shoe-rack.pages.dev (TODO: confirm the Cloudflare Pages project name)

## Run locally

Needs Node 22.12 or newer (Astro 7 requirement). Run the commands from the folder that holds `package.json`.

```sh
npm install
npm run dev      # http://localhost:4321
npm run build    # production build into dist/
npm run preview  # serve dist/ locally
npm test         # formatting helper checks
```

## Change a price

1. Open `src/data/products.json`.
2. Edit the `price` number, for example `"price": 4500`. Use plain numbers: no ₹ sign, no commas.
3. Set `lastUpdated` to today's date (`YYYY-MM-DD`). The site shows it under the price list.
4. Commit and push to `main`. Cloudflare Pages redeploys in about a minute.

Each price shows up in the catalog cards, the size lineup, the product pages, the enquiry form dropdown, the WhatsApp messages and the Google structured data. The "from ₹3,500" text in the hero and meta description uses the lowest price in the file.

## Add a product

Add an entry to the right category's `products` list in `src/data/products.json`:

```json
{ "id": "single-6-step", "steps": 6, "price": 7500, "heightIn": null, "widthIn": null, "depthIn": null, "image": "single-6-step" }
```

- The title is built for you: "Single decker, 6 step".
- If a size is unknown, leave it as `null`. The site then shows "Size on request". Never guess a size.
- A single decker with both `heightIn` and `widthIn` set also appears in the to-scale lineup in the hero.
- A product page is created at `/racks/<id>/`.

## Add photos

Images live in `src/assets/images/`. Astro converts them to AVIF and WebP at build time, so upload the original JPG or PNG files.

| Folder | File name | Used for |
|---|---|---|
| `hero/` | `showroom-lineup.jpg` | Showroom photo under the hero |
| `products/` | `<product id>.jpg`, for example `single-3-step.jpg` | Product card and product page |
| `gallery/` | Descriptive name, for example `white-single-decker-in-hallway.jpg` | "From the shop" grid. The file name becomes the alt text. A number prefix such as `01-` sets the order and is dropped from the alt text. The grid shows up to 9 photos. |

Until a real photo is added, the site uses the generated artwork (`*.illustration.jpg`, made by `node scripts/make-images.mjs` from the product data). A real photo with the plain name (for example `products/single-3-step.jpg`) replaces it automatically.

Customer installation photos go in `installed/`. The file name becomes the caption, and a number prefix such as `01-` sets the order.

`public/og-image.jpg` is the link preview image for WhatsApp and social media. For now it is generated from the data with `node scripts/og-image.mjs`. Replace it with a 1200×630 showroom photo once one arrives.

## Change business details

All in `src/data/site.json`: phone, WhatsApp number, address, hours, email, Google profile link, colours and the wholesale note. Any value still set to `"TODO…"` or `null` is hidden on the site, never shown as text.

- **Open days:** set `hours.days` to a list, for example `["Monday", "Tuesday", …]`. The days then appear on the site and in the Google structured data.
- **Contact people:** replace `"name": "TODO"` with the real name. The names then appear in the Visit us section.
- **Map coordinates:** set `geo.lat` and `geo.lng` from Google Maps.

## Enquiry form (Web3Forms)

1. Create a free access key at https://web3forms.com using the client's email address. Messages go to that email.
2. Paste the key into `web3formsKey` in `site.json`. The key is safe to keep in a public repo.
3. To change the email later, use the Web3Forms dashboard. No code change is needed.

Until the key is set, the form shows an error that links to WhatsApp with the visitor's details already filled in, and the build prints a warning. Without JavaScript, the form posts to Web3Forms directly and then redirects to `/thank-you/`.

## Deploy (Cloudflare Pages)

1. Push this repo to GitHub (public) on branch `main`.
2. In the Cloudflare dashboard, go to Workers & Pages → Create → Pages → Connect to Git and choose the repo.
3. Choose the **Astro** framework preset. Set the build command to `npm run build` and the output directory to `dist`. Add the environment variable `NODE_VERSION=22`. If the site is not at the repo root, set **Root directory** to its folder (for example `CL-00001-00001-SL01/Code`).
4. Name the project `sl-shoe-rack`. If you use a different name, update `site` in `astro.config.mjs` and the sitemap line in `public/robots.txt`.
5. Every push to `main` redeploys the site.

After launch: add the site URL to the Google Business Profile ("Add website"), then submit `https://sl-shoe-rack.pages.dev/sitemap-index.xml` in Google Search Console.

## Project layout

```
src/data/        site.json, products.json   ← all content
src/lib/         format.ts (₹, sizes), whatsapp.ts (wa.me links), catalog.ts (product list)
src/components/  page sections; RackLineup is the to-scale size visual
src/pages/       index, racks/[id] (racks and hangers), thank-you, 404
scripts/         og-image.mjs (link preview image), make-images.mjs (placeholder illustrations)
src/styles/      global.css (colour tokens, type, buttons)
```

