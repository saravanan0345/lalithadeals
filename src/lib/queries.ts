import { queryOptions } from "@tanstack/react-query";
import { getCatalog } from "./shop.functions";

export const catalogQuery = queryOptions({
  queryKey: ["catalog"],
  queryFn: async () => {
    const data = await getCatalog();
    if (typeof window !== "undefined") {
      try {
        const raw = localStorage.getItem("lalitha_local_products");
        if (raw) {
          const localProds = JSON.parse(raw);
          if (Array.isArray(localProds) && localProds.length > 0) {
            const existing = new Set(data.products.map((p) => p.id));
            const merged = [...data.products];
            for (const p of localProds) {
              if (!existing.has(p.id)) merged.unshift(p);
            }
            data.products = merged;
          }
        }
      } catch (err) {
        console.warn("Could not merge local products into catalog:", err);
      }
    }
    return data;
  },
  staleTime: 30_000,
});

export type Catalog = Awaited<ReturnType<typeof getCatalog>>;
export type Product = Catalog["products"][number];
export type Offer = Catalog["offers"][number];
