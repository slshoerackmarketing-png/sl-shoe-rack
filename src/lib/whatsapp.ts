import site from '../data/site.json';

export const GENERAL_MESSAGE = 'Hi, I saw your website. I want to know about your shoe racks.';

export const waLink = (text: string = GENERAL_MESSAGE) =>
  `https://wa.me/${site.whatsapp}?text=${encodeURIComponent(text)}`;

/** noun is "shoe rack" for racks, "" when the title already names the item (hangers). */
export const productMessage = (title: string, price: string, noun = 'shoe rack') =>
  `Hi, I'm interested in the ${title}${noun ? ` ${noun}` : ''} (${price}). Is it available?`;
