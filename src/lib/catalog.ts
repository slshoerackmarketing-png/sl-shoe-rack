import data from '../data/products.json';
import { formatINR, sizeLine } from './format.ts';
import { productMessage, waLink } from './whatsapp.ts';

type RawProduct = {
  id: string;
  price: number;
  image: string;
  capacity?: string;
  steps?: number;
  feet?: number;
  size?: string;
  heightIn?: number | null;
  widthIn?: number | null;
  depthIn?: number | null;
  openDepthIn?: number | null;
};

export type Product = Required<Pick<RawProduct, 'id' | 'price' | 'image'>> & {
  steps: number;
  heightIn: number | null;
  widthIn: number | null;
  depthIn: number | null;
  openDepthIn: number | null;
  capacity: string | null;
  kind: 'rack' | 'hanger';
  categoryId: string;
  categoryName: string;
  description: string;
  colours: string[];
  deliveryNote: string;
  noun: string;
  columns: number;
  title: string;
  priceLabel: string;
  size: string;
  wa: string;
  url: string;
};

export const categories = data.categories.map((c) => ({
  ...c,
  kind: c.kind as Product['kind'],
  products: (c.products as RawProduct[]).map((p): Product => {
    const title = p.steps ? `${c.name}, ${p.steps} step` : `${c.name}, ${p.feet} ft`;
    const priceLabel = formatINR(p.price);
    return {
      id: p.id,
      price: p.price,
      image: p.image,
      steps: p.steps ?? 0,
      heightIn: p.heightIn ?? null,
      widthIn: p.widthIn ?? null,
      depthIn: p.depthIn ?? null,
      openDepthIn: p.openDepthIn ?? null,
      capacity: p.capacity ?? null,
      kind: c.kind as Product['kind'],
      categoryId: c.id,
      categoryName: c.name,
      description: c.description,
      colours: c.colours ?? [],
      deliveryNote: c.deliveryNote,
      noun: c.noun,
      columns: c.columns,
      title,
      priceLabel,
      size: p.size ?? sizeLine(p.heightIn ?? null, p.widthIn ?? null),
      wa: waLink(productMessage(title, priceLabel, c.noun)),
      url: `/racks/${p.id}/`,
    };
  }),
}));

export const rackCategories = categories.filter((c) => c.kind === 'rack');
export const hangerCategories = categories.filter((c) => c.kind === 'hanger');
export const products = categories.flatMap((c) => c.products);
export const racks = rackCategories.flatMap((c) => c.products);

const prices = products.map((p) => p.price);
export const minPrice = Math.min(...prices);
export const maxPrice = Math.max(...prices);
/** "from ₹…" in the hero and meta description talks about shoe racks only. */
export const rackMinPrice = Math.min(...racks.map((p) => p.price));
export const pricesIncludeGst = data.pricesIncludeGst;

/**
 * Product images named by product id, e.g. products/single-3-step.jpg.
 * Generated artwork is named <id>.illustration.jpg and is labelled as such on the page;
 * a real photo with the plain name always wins. Missing → CSS placeholder.
 */
const photos = import.meta.glob<{ default: ImageMetadata }>(
  '/src/assets/images/products/*.{jpg,jpeg,png,webp,avif}',
  { eager: true },
);
const byName = (id: string, suffix = '') =>
  Object.entries(photos).find(([path]) => path.split('/').pop()!.replace(/\.\w+$/, '') === id + suffix)?.[1]
    .default;
export const photoFor = (id: string) => {
  const real = byName(id);
  if (real) return { src: real, illustration: false };
  const art = byName(id, '.illustration');
  return art ? { src: art, illustration: true } : undefined;
};
