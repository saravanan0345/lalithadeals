import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import { quoteCart, MAX_QTY, type PricingOffer, type PricingProduct } from "./pricing";

function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
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
  const sb = publicClient();
  const [cats, prods, offers, settings] = await Promise.all([
    sb.from("categories").select("*").order("sort_order"),
    sb.from("products").select("*").order("sort_order").order("created_at", { ascending: false }),
    sb.from("offers").select("*").eq("is_active", true).order("created_at", { ascending: false }),
    sb.from("settings").select("*").eq("id", 1).maybeSingle(),
  ]);
  const today = todayIST();
  return {
    categories: cats.data ?? [],
    products: prods.data ?? [],
    offers: (offers.data ?? []).filter((o) => (!o.starts_at || o.starts_at <= today) && (!o.ends_at || o.ends_at >= today)),
    settings: settings.data,
  };
});

const itemsSchema = z.array(z.object({ productId: z.string().uuid(), qty: z.number().int().min(1).max(MAX_QTY) })).max(50);

async function authoritativeQuote(items: z.infer<typeof itemsSchema>) {
  const sb = publicClient();
  const ids = [...new Set(items.map((i) => i.productId))];
  const [prods, offers] = await Promise.all([
    ids.length ? sb.from("products").select("*").in("id", ids) : Promise.resolve({ data: [] }),
    sb.from("offers").select("*").eq("is_active", true),
  ]);
  return quoteCart(
    items,
    (prods.data ?? []).map((p) => ({ ...p, price: Number(p.price), mrp: p.mrp == null ? null : Number(p.mrp) })) as PricingProduct[],
    (offers.data ?? []).map((o) => ({ ...o, value: Number(o.value) })) as PricingOffer[],
    todayIST(),
  );
}

export const getQuote = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => z.object({ items: itemsSchema }).parse(d))
  .handler(async ({ data }) => authoritativeQuote(data.items));

const orderSchema = z
  .object({
    items: itemsSchema.min(1),
    name: z.string().trim().min(1).max(100),
    phone: z.string().trim().regex(/^[+\d][\d\s-]{6,18}$/),
    email: z.string().trim().email().max(255).optional().or(z.literal("")),
    fulfilment: z.enum(["delivery", "pickup"]),
    address: z.string().trim().max(500).optional(),
    notes: z.string().trim().max(500).optional(),
  })
  .refine((d) => d.fulfilment === "pickup" || (d.address && d.address.length >= 5), { message: "Address required", path: ["address"] });

export const placeOrder = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => orderSchema.parse(d))
  .handler(async ({ data }) => {
    const q = await authoritativeQuote(data.items);
    if (q.errors.length || q.lines.length === 0) return { ok: false as const, quote: q };
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: row, error } = await supabaseAdmin
      .from("orders")
      .insert({
        customer_name: data.name, phone: data.phone, email: data.email || null,
        fulfilment: data.fulfilment, address: data.fulfilment === "delivery" ? data.address! : null,
        notes: data.notes || null, items: q.lines, applied_offers: q.applied,
        subtotal: q.subtotal, discount: q.discount, total: q.total,
      })
      .select("id")
      .single();
    if (error) throw new Error("Could not save your order. Please try again.");
    return { ok: true as const, orderId: row.id, quote: q };
  });
