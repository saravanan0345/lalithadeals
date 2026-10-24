// Pure pricing logic. Used on the server for authoritative totals.
export type PricingProduct = {
  id: string;
  name: string;
  section: "costumes" | "frames" | "gifts";
  price: number;
  mrp: number | null;
  is_available: boolean;
  stock: number | null;
  image_path: string | null;
  rental_terms: string | null;
};

export type PricingOffer = {
  id: string;
  title: string;
  offer_type: "percent" | "flat" | "bogo" | "bundle";
  value: number;
  buy_qty: number;
  get_qty: number;
  product_ids: string[];
  conditions: string | null;
  starts_at: string | null;
  ends_at: string | null;
  is_active: boolean;
};

export type CartInput = { productId: string; qty: number };

export type QuoteLine = {
  productId: string;
  name: string;
  section: PricingProduct["section"];
  qty: number;
  unitPrice: number;
  lineTotal: number;
  imagePath: string | null;
  rentalTerms: string | null;
};

export type AppliedOffer = { offerId: string; title: string; conditions: string | null; discount: number };

export type Quote = {
  lines: QuoteLine[];
  applied: AppliedOffer[];
  subtotal: number;
  discount: number;
  total: number;
  errors: string[];
};

export const MAX_QTY = 20;

const r2 = (n: number) => Math.round(n * 100) / 100;

export function discountPercent(mrp: number | null | undefined, price: number): number | null {
  if (!mrp || mrp <= 0 || price > mrp || price === mrp) return null;
  return Math.round(((mrp - price) / mrp) * 100);
}

export function isOfferValid(o: PricingOffer, today: string): boolean {
  if (!o.is_active) return false;
  if (o.starts_at && o.starts_at > today) return false;
  if (o.ends_at && o.ends_at < today) return false;
  return true;
}

function eligibleLines(o: PricingOffer, lines: QuoteLine[]) {
  if (o.product_ids.length === 0) return o.offer_type === "percent" || o.offer_type === "flat" ? lines : [];
  return lines.filter((l) => o.product_ids.includes(l.productId));
}

export function offerDiscount(o: PricingOffer, lines: QuoteLine[]): number {
  const el = eligibleLines(o, lines);
  if (el.length === 0) return 0;
  switch (o.offer_type) {
    case "percent": {
      const pct = Math.min(Math.max(o.value, 0), 100);
      return r2(el.reduce((s, l) => s + l.lineTotal, 0) * (pct / 100));
    }
    case "flat":
      return r2(el.reduce((s, l) => s + Math.min(Math.max(o.value, 0), l.unitPrice) * l.qty, 0));
    case "bogo": {
      const buy = Math.max(1, o.buy_qty);
      const get = Math.max(1, o.get_qty);
      const units = el.flatMap((l) => Array(l.qty).fill(l.unitPrice) as number[]).sort((a, b) => b - a);
      const group = buy + get;
      let d = 0;
      for (let i = 0; i + group <= units.length; i += group) {
        for (let j = i + buy; j < i + group; j++) d += units[j]!;
      }
      return r2(d);
    }
    case "bundle": {
      if (!o.product_ids.every((id) => el.some((l) => l.productId === id))) return 0;
      const sets = Math.min(...o.product_ids.map((id) => el.find((l) => l.productId === id)!.qty));
      const normal = o.product_ids.reduce((s, id) => s + el.find((l) => l.productId === id)!.unitPrice, 0);
      return r2(Math.max(0, normal - Math.max(o.value, 0)) * sets);
    }
  }
}

export function quoteCart(items: CartInput[], products: PricingProduct[], offers: PricingOffer[], today: string): Quote {
  const errors: string[] = [];
  const merged = new Map<string, number>();
  for (const it of items) merged.set(it.productId, (merged.get(it.productId) ?? 0) + it.qty);

  const lines: QuoteLine[] = [];
  for (const [productId, qty] of merged) {
    const p = products.find((x) => x.id === productId);
    if (!p) { errors.push("An item in your cart is no longer available."); continue; }
    if (!Number.isInteger(qty) || qty < 1 || qty > MAX_QTY) { errors.push(`Please choose a quantity between 1 and ${MAX_QTY} for ${p.name}.`); continue; }
    if (!p.is_available) { errors.push(`${p.name} is currently unavailable.`); continue; }
    if (p.stock != null && qty > p.stock) { errors.push(`Only ${p.stock} of ${p.name} available.`); continue; }
    lines.push({
      productId, name: p.name, section: p.section, qty,
      unitPrice: Number(p.price), lineTotal: r2(Number(p.price) * qty),
      imagePath: p.image_path, rentalTerms: p.rental_terms,
    });
  }

  const candidates = offers
    .filter((o) => isOfferValid(o, today))
    .map((o) => ({ o, d: offerDiscount(o, lines), ids: eligibleLines(o, lines).map((l) => l.productId) }))
    .filter((c) => c.d > 0)
    .sort((a, b) => b.d - a.d);

  const claimed = new Set<string>();
  const applied: AppliedOffer[] = [];
  for (const c of candidates) {
    if (c.ids.some((id) => claimed.has(id))) continue;
    c.ids.forEach((id) => claimed.add(id));
    applied.push({ offerId: c.o.id, title: c.o.title, conditions: c.o.conditions, discount: c.d });
  }

  const subtotal = r2(lines.reduce((s, l) => s + l.lineTotal, 0));
  const discount = r2(Math.min(subtotal, applied.reduce((s, a) => s + a.discount, 0)));
  return { lines, applied, subtotal, discount, total: r2(subtotal - discount), errors };
}
