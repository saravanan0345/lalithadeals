import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { quoteCart, MAX_QTY, type PricingOffer, type PricingProduct } from "./pricing";

export const DEFAULT_CATEGORIES = [
  { id: "11111111-1111-4111-a111-111111111111", name: "Fancy Costumes below 15 years old", section: "costumes" as const, sort_order: 1, created_at: "2026-01-01T00:00:00Z" },
  { id: "66666666-6666-4666-a666-666666666666", name: "Blazer below 25 years old", section: "costumes" as const, sort_order: 2, created_at: "2026-01-01T00:00:00Z" },
  { id: "77777777-7777-4777-a777-777777777777", name: "Photo Frames", section: "frames" as const, sort_order: 1, created_at: "2026-01-01T00:00:00Z" },
  { id: "88888888-8888-4888-a888-888888888888", name: "Gifts", section: "gifts" as const, sort_order: 1, created_at: "2026-01-01T00:00:00Z" },
];

export const DEFAULT_PRODUCTS = [
  {
    id: "a1010101-1010-4010-a010-101010101010",
    name: "Kids Police Officer Uniform Set",
    section: "costumes" as const,
    category_id: "11111111-1111-4111-a111-111111111111",
    description: "Complete khaki police costume with shirt, pants, belt, badge, whistle and cap. Ideal for school annual days and fancy dress competitions.",
    price: "499.00",
    mrp: "1200.00",
    age_info: "4 – 10 years",
    size_info: "Chest 26–32 in",
    is_available: true,
    stock: 5,
    rental_terms: "Rental duration: 24–48 hours. Please return in neat condition.",
    customization: null,
    image_path: null,
    sort_order: 1,
    created_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "a2020202-2020-4020-a020-202020202020",
    name: "Superhero Spidey Suit Costume",
    section: "costumes" as const,
    category_id: "11111111-1111-4111-a111-111111111111",
    description: "Full body superhero jumpsuit with separate matching mask. Breathable fabric and vibrant print for kids parties and fancy dress.",
    price: "599.00",
    mrp: "1499.00",
    age_info: "3 – 12 years",
    size_info: "Height 100–140 cm",
    is_available: true,
    stock: 4,
    rental_terms: "Rental duration: 24–48 hours.",
    customization: null,
    image_path: null,
    sort_order: 2,
    created_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "a3030303-3030-4030-a030-303030303030",
    name: "Little Krishna Devotional Costume",
    section: "costumes" as const,
    category_id: "11111111-1111-4111-a111-111111111111",
    description: "Traditional yellow dhoti, kurta, mukut with peacock feather, bansuri (flute), and pearl necklace. Perfect for Gokulashtami and cultural events.",
    price: "549.00",
    mrp: "1350.00",
    age_info: "2 – 8 years",
    size_info: "Adjustable waist",
    is_available: true,
    stock: 6,
    rental_terms: "Rental duration: 24–48 hours.",
    customization: null,
    image_path: null,
    sort_order: 3,
    created_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "a4040404-4040-4040-a040-404040404040",
    name: "Netaji Subhash Chandra Bose Historical Dress",
    section: "costumes" as const,
    category_id: "11111111-1111-4111-a111-111111111111",
    description: "Military style INA freedom fighter costume with jacket, trousers, cap, cross belt and round spectacles for Independence Day or Republic Day.",
    price: "499.00",
    mrp: "1100.00",
    age_info: "5 – 14 years",
    size_info: "Sizes S, M, L",
    is_available: true,
    stock: 3,
    rental_terms: "Rental duration: 24–48 hours.",
    customization: null,
    image_path: null,
    sort_order: 4,
    created_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "a5050505-5050-4050-a050-505050505050",
    name: "Youth Formal Slim-Fit Blazer",
    section: "costumes" as const,
    category_id: "66666666-6666-4666-a666-666666666666",
    description: "Premium navy blue/black party wear blazer for college presentations, weddings, and formal occasions up to age 25.",
    price: "899.00",
    mrp: "2999.00",
    age_info: "15 – 25 years",
    size_info: "Chest 34–40",
    is_available: true,
    stock: 5,
    rental_terms: "Dry clean return or rental return in original cover.",
    customization: null,
    image_path: null,
    sort_order: 5,
    created_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "b1010101-1010-4010-b010-101010101010",
    name: "Custom Wooden Photo Collage Frame (8x12)",
    section: "frames" as const,
    category_id: "77777777-7777-4777-a777-777777777777",
    description: "Handcrafted wooden collage frame with 4–6 photos printed on premium glossy photographic paper. Glass or shatterproof acrylic cover.",
    price: "699.00",
    mrp: "1299.00",
    age_info: null,
    size_info: "8 x 12 inches",
    is_available: true,
    stock: 10,
    rental_terms: null,
    customization: "Send 4-6 high resolution photos via WhatsApp after placing the order.",
    image_path: null,
    sort_order: 1,
    created_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "b2020202-2020-4020-b020-202020202020",
    name: "Custom Acrylic LED Night Photo Frame",
    section: "frames" as const,
    category_id: "77777777-7777-4777-a777-777777777777",
    description: "Illuminated acrylic photo frame with warm LED wooden base. Stunning bedside night lamp and keepsake.",
    price: "899.00",
    mrp: "1599.00",
    age_info: null,
    size_info: "6 x 8 inches",
    is_available: true,
    stock: 8,
    rental_terms: null,
    customization: "Includes custom photo engraving and custom text/dates on the base.",
    image_path: null,
    sort_order: 2,
    created_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "b3030303-3030-4030-b030-303030303030",
    name: "Couple Anniversary Frame with Name & Date",
    section: "frames" as const,
    category_id: "77777777-7777-4777-a777-777777777777",
    description: "Elegant matte black border frame featuring your special date, names, and couple photo. Perfect wedding or anniversary gift.",
    price: "799.00",
    mrp: "1499.00",
    age_info: null,
    size_info: "10 x 14 inches",
    is_available: true,
    stock: 6,
    rental_terms: null,
    customization: "Share names, anniversary date, and photo on WhatsApp.",
    image_path: null,
    sort_order: 3,
    created_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "c1010101-1010-4010-c010-101010101010",
    name: "Personalized Ceramic Magic Mug with Photo",
    section: "gifts" as const,
    category_id: "88888888-8888-4888-a888-888888888888",
    description: "Heat-sensitive colour changing ceramic mug. Black when cold; reveals your custom photo and message when hot beverage is poured.",
    price: "349.00",
    mrp: "699.00",
    age_info: null,
    size_info: "330 ml capacity",
    is_available: true,
    stock: 15,
    rental_terms: null,
    customization: "Provide 1-2 photos and custom greeting text.",
    image_path: null,
    sort_order: 1,
    created_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "c2020202-2020-4020-c020-202020202020",
    name: "Custom Engraved Metal Keychain & Pen Set",
    section: "gifts" as const,
    category_id: "88888888-8888-4888-a888-888888888888",
    description: "Premium metallic rollerball pen and matching heavy metal keychain engraved with your name. Comes in a royal presentation box.",
    price: "399.00",
    mrp: "799.00",
    age_info: null,
    size_info: "Gift Box",
    is_available: true,
    stock: 12,
    rental_terms: null,
    customization: "Laser engraved with recipient's name.",
    image_path: null,
    sort_order: 2,
    created_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "c3030303-3030-4030-c030-303030303030",
    name: "Luxury Celebration Gift Hamper Box",
    section: "gifts" as const,
    category_id: "88888888-8888-4888-a888-888888888888",
    description: "Beautifully curated gift box containing a personalized mug, scented candle, greeting card, and chocolates in a ribbon-wrapped gift box.",
    price: "999.00",
    mrp: "1899.00",
    age_info: null,
    size_info: "Standard Hamper",
    is_available: true,
    stock: 7,
    rental_terms: null,
    customization: "Choice of theme (Birthday / Anniversary / Congratulations).",
    image_path: null,
    sort_order: 3,
    created_at: "2026-01-01T00:00:00Z",
  },
];

export const DEFAULT_OFFERS = [
  {
    id: "d1010101-1010-4010-d010-101010101010",
    title: "Festive Season: Flat 20% Off All Costumes & Gifts",
    description: "Special celebratory discount applied to your order.",
    offer_type: "percent" as const,
    value: "20.00",
    buy_qty: 1,
    get_qty: 1,
    product_ids: [] as string[],
    conditions: "Applied to all products in cart.",
    starts_at: null,
    ends_at: null,
    is_active: true,
    image_path: null,
    created_at: "2026-01-01T00:00:00Z",
  },
];

export const DEFAULT_SETTINGS = {
  id: 1,
  address: "3/237, Sri Kamatchi street, Padmavati Nagar, Iyyappanthangal near oil mill road",
  maps_link: "https://maps.app.goo.gl/JE4r246QNFvA5oed6",
  about: "Lalitha / L Deals offers fancy costume rentals for school events and competitions, handcrafted custom photo frames, and personalized gifts for all celebrations.",
  rental_terms: "Fancy costumes available for rent up to 24-48 hours. Clean return expected. Refundable deposit collected at pickup.",
  deposit_info: "Standard refundable security deposit applicable upon collection.",
  delivery_info: "Store pickup available at Iyyappanthangal, Chennai. Courier / delivery available on request.",
  frame_instructions: "Send high-resolution photos via WhatsApp for best frame printing quality. We share digital previews before crafting.",
  hero_image_path: null,
  hero_alt: "Fancy costumes, custom photo frames and thoughtful gifts at Lalitha / L Deals",
  updated_at: "2026-01-01T00:00:00Z",
};

function publicClient() {
  const url = process.env["SUPABASE_URL"] || "https://hfttprzshhjppxakzqyk.supabase.co";
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"] || "sb_publishable_iYdo1jKhoppEZtGo83cYgA_wGEb55ku";
  return createClient<Database>(url, key, {
    auth: { persistSession: false },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

const todayIST = () => new Date(Date.now() + 5.5 * 3600_000).toISOString().slice(0, 10);

export const getCatalog = createServerFn({ method: "GET" }).handler(async () => {
  let categories: any[] = DEFAULT_CATEGORIES;
  let products: any[] = DEFAULT_PRODUCTS;
  let offers: any[] = DEFAULT_OFFERS;
  let settings: any = DEFAULT_SETTINGS;

  try {
    const sb = publicClient();
    const [cats, prods, offs, sett] = await Promise.all([
      sb.from("categories").select("*").order("sort_order"),
      sb.from("products").select("*").order("sort_order").order("created_at", { ascending: false }),
      sb.from("offers").select("*").eq("is_active", true).order("created_at", { ascending: false }),
      sb.from("settings").select("*").eq("id", 1).maybeSingle(),
    ]);

    if (cats.data && cats.data.length > 0) categories = cats.data;
    if (prods.data && prods.data.length > 0) products = prods.data;
    if (offs.data && offs.data.length > 0) offers = offs.data;
    if (sett.data) settings = sett.data;
  } catch (err) {
    console.warn("Notice: Using built-in catalog fallback:", err);
  }

  const today = todayIST();
  return {
    categories,
    products,
    offers: offers.filter((o) => (!o.starts_at || o.starts_at <= today) && (!o.ends_at || o.ends_at >= today)),
    settings,
  };
});

const itemsSchema = z.array(z.object({ productId: z.string().uuid(), qty: z.number().int().min(1).max(MAX_QTY) })).max(50);

async function authoritativeQuote(items: z.infer<typeof itemsSchema>) {
  const ids = [...new Set(items.map((i) => i.productId))];
  let prodsList: any[] = [];
  let offersList: any[] = [];

  try {
    const sb = publicClient();
    const [prods, offers] = await Promise.all([
      ids.length ? sb.from("products").select("*").in("id", ids) : Promise.resolve({ data: [] }),
      sb.from("offers").select("*").eq("is_active", true),
    ]);
    if (prods.data && prods.data.length > 0) prodsList = prods.data;
    if (offers.data && offers.data.length > 0) offersList = offers.data;
  } catch {
    // fallback below
  }

  if (prodsList.length === 0) {
    prodsList = DEFAULT_PRODUCTS.filter((p) => ids.includes(p.id));
  }
  if (offersList.length === 0) {
    offersList = DEFAULT_OFFERS.filter((o) => o.is_active);
  }

  return quoteCart(
    items,
    prodsList.map((p) => ({ ...p, price: Number(p.price), mrp: p.mrp == null ? null : Number(p.mrp) })) as PricingProduct[],
    offersList.map((o) => ({ ...o, value: Number(o.value) })) as PricingOffer[],
    todayIST(),
  );
}

export const getQuote = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ items: itemsSchema }).parse(d))
  .handler(async ({ data }) => authoritativeQuote(data.items));

const placeOrderSchema = z.object({
  name: z.string().trim().min(1).max(100),
  phone: z.string().trim().regex(/^[+\d][\d\s-]{6,18}$/),
  email: z.string().trim().email().max(255).or(z.literal("")),
  fulfilment: z.enum(["delivery", "pickup"]),
  address: z.string().trim().max(500),
  notes: z.string().trim().max(500),
  items: itemsSchema,
});

export const placeOrder = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => placeOrderSchema.parse(d))
  .handler(async ({ data }) => {
    const q = await authoritativeQuote(data.items);
    if (q.errors.length > 0) return { ok: false as const, quote: q, orderId: "" };

    const orderId = crypto.randomUUID();
    const row = {
      id: orderId,
      customer_name: data.name,
      phone: data.phone,
      email: data.email || null,
      fulfilment: data.fulfilment,
      address: data.address || null,
      notes: data.notes || null,
      items: q.lines,
      applied_offers: q.applied,
      subtotal: q.subtotal,
      discount: q.discount,
      total: q.total,
      status: "new",
      created_at: new Date().toISOString(),
    };

    try {
      const sb = publicClient();
      await sb.from("orders").insert(row);
    } catch (e) {
      console.warn("Could not record order in Supabase:", e);
    }

    return { ok: true as const, quote: q, orderId };
  });
