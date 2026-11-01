import { queryOptions } from "@tanstack/react-query";
import { getCatalog } from "./shop.functions";

export const catalogQuery = queryOptions({
  queryKey: ["catalog"],
  queryFn: async () => {
    const data = await getCatalog();
    if (typeof window !== "undefined") {
      try {
        // 1. Merge Local Products (new products + modified products)
        const rawProds = localStorage.getItem("lalitha_local_products");
        if (rawProds) {
          const localProds = JSON.parse(rawProds);
          if (Array.isArray(localProds) && localProds.length > 0) {
            const localMap = new Map(localProds.map((p: Product) => [p.id, p]));
            // Update existing items if modified
            const merged = data.products.map((p) => (localMap.has(p.id) ? { ...p, ...localMap.get(p.id) } : p));
            // Add new items that aren't in data.products
            const existingIds = new Set(data.products.map((p) => p.id));
            for (const p of localProds) {
              if (!existingIds.has(p.id)) merged.unshift(p);
            }
            data.products = merged;
          }
        }

        // 2. Merge Local Settings (Address, About, Phone, Hero image, etc.)
        const rawSettings = localStorage.getItem("lalitha_local_settings");
        if (rawSettings) {
          const localSettings = JSON.parse(rawSettings);
          if (localSettings && typeof localSettings === "object") {
            data.settings = { ...data.settings, ...localSettings };
          }
        }

        // 3. Merge Local Categories
        const rawCats = localStorage.getItem("lalitha_local_categories");
        if (rawCats) {
          const localCats = JSON.parse(rawCats);
          if (Array.isArray(localCats) && localCats.length > 0) {
            const localMap = new Map(localCats.map((c: any) => [c.id, c]));
            const merged = data.categories.map((c) => (localMap.has(c.id) ? { ...c, ...localMap.get(c.id) } : c));
            const existingIds = new Set(data.categories.map((c) => c.id));
            for (const c of localCats) {
              if (!existingIds.has(c.id)) merged.push(c);
            }
            data.categories = merged;
          }
        }

        // 4. Merge Local Offers / Deals
        const rawOffers = localStorage.getItem("lalitha_local_offers");
        if (rawOffers) {
          const localOffers = JSON.parse(rawOffers);
          if (Array.isArray(localOffers) && localOffers.length > 0) {
            const localMap = new Map(localOffers.map((o: any) => [o.id, o]));
            const merged = data.offers.map((o) => (localMap.has(o.id) ? { ...o, ...localMap.get(o.id) } : o));
            const existingIds = new Set(data.offers.map((o) => o.id));
            for (const o of localOffers) {
              if (!existingIds.has(o.id)) merged.unshift(o);
            }
            data.offers = merged;
          }
        }
      } catch (err) {
        console.warn("Could not merge local catalog changes:", err);
      }
    }
    return data;
  },
  staleTime: 30_000,
});

export type Catalog = Awaited<ReturnType<typeof getCatalog>>;
export type Product = Catalog["products"][number];
export type Offer = Catalog["offers"][number];
