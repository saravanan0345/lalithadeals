import { describe, expect, it } from "vitest";
import { discountPercent, quoteCart, type PricingOffer, type PricingProduct } from "@/lib/pricing";

const p = (id: string, price: number, extra: Partial<PricingProduct> = {}): PricingProduct => ({
  id, name: id, section: "costumes", price, mrp: null, is_available: true, stock: null, image_path: null, rental_terms: null, ...extra,
});
const o = (extra: Partial<PricingOffer>): PricingOffer => ({
  id: "o1", title: "Offer", offer_type: "percent", value: 0, buy_qty: 1, get_qty: 1, product_ids: [], conditions: null,
  starts_at: null, ends_at: null, is_active: true, ...extra,
});
const today = "2026-10-20";

describe("pricing", () => {
  it("discount percentage = round((MRP - offer) / MRP * 100)", () => {
    expect(discountPercent(1000, 750)).toBe(25);
    expect(discountPercent(999, 666)).toBe(33);
    expect(discountPercent(0, 10)).toBeNull();
    expect(discountPercent(100, 120)).toBeNull();
  });

  it("totals multiple items and quantities", () => {
    const q = quoteCart([{ productId: "a", qty: 2 }, { productId: "b", qty: 1 }], [p("a", 300), p("b", 150)], [], today);
    expect(q.subtotal).toBe(750);
    expect(q.total).toBe(750);
  });

  it("rejects unavailable products", () => {
    const q = quoteCart([{ productId: "a", qty: 1 }], [p("a", 300, { is_available: false })], [], today);
    expect(q.lines).toHaveLength(0);
    expect(q.errors).toHaveLength(1);
  });

  it("buy one get one makes the cheaper unit free", () => {
    const q = quoteCart([{ productId: "a", qty: 1 }, { productId: "b", qty: 1 }], [p("a", 500), p("b", 300)],
      [o({ offer_type: "bogo", product_ids: ["a", "b"] })], today);
    expect(q.discount).toBe(300);
    expect(q.total).toBe(500);
  });

  it("bundle applies only when every bundled product is in the cart", () => {
    const offer = o({ offer_type: "bundle", value: 600, product_ids: ["a", "g"] });
    expect(quoteCart([{ productId: "a", qty: 1 }], [p("a", 500), p("g", 300)], [offer], today).discount).toBe(0);
    expect(quoteCart([{ productId: "a", qty: 1 }, { productId: "g", qty: 1 }], [p("a", 500), p("g", 300)], [offer], today).total).toBe(600);
  });

  it("ignores expired and inactive offers", () => {
    const products = [p("a", 1000)];
    expect(quoteCart([{ productId: "a", qty: 1 }], products, [o({ value: 10, ends_at: "2026-10-19" })], today).discount).toBe(0);
    expect(quoteCart([{ productId: "a", qty: 1 }], products, [o({ value: 10, is_active: false })], today).discount).toBe(0);
    expect(quoteCart([{ productId: "a", qty: 1 }], products, [o({ value: 10 })], today).discount).toBe(100);
  });
});
