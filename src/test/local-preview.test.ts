import { describe, expect, it } from "vitest";
import { canUseLocalPreview, localPreviewCatalog } from "@/lib/local-preview";
import { quoteCart } from "@/lib/pricing";

describe("local storefront preview", () => {
  it("is enabled only in development when Supabase configuration is incomplete", () => {
    expect(canUseLocalPreview(true)).toBe(true);
    expect(canUseLocalPreview(true, "https://example.supabase.co", "public-key")).toBe(false);
    expect(canUseLocalPreview(true, "https://example.supabase.co")).toBe(true);
    expect(canUseLocalPreview(false)).toBe(false);
  });

  it("contains sample items that can be priced by the server preview", () => {
    const product = localPreviewCatalog.products[0]!;
    const quote = quoteCart(
      [{ productId: product.id, qty: 2 }],
      localPreviewCatalog.products,
      [],
      "2026-10-21",
    );

    expect(quote.errors).toEqual([]);
    expect(quote.subtotal).toBe(700);
    expect(quote.total).toBe(700);
  });
});
