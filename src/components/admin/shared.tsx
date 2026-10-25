import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, type ReactNode } from "react";
import { Upload, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { imageUrl } from "@/lib/shop";
import { uploadImage, deleteImage } from "@/lib/admin";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { Database } from "@/integrations/supabase/types";

export type AdminRow<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"];

export const FALLBACK_CATEGORIES: AdminRow<"categories">[] = [
  { id: "c1", name: "Fancy Costumes below 15 years old", section: "costumes", sort_order: 1, created_at: "2026-01-01T00:00:00Z" },
  { id: "c2", name: "Blazer below 25 years old", section: "costumes", sort_order: 2, created_at: "2026-01-01T00:00:00Z" },
  { id: "c3", name: "Photo Frames", section: "frames", sort_order: 1, created_at: "2026-01-01T00:00:00Z" },
  { id: "c4", name: "Gifts", section: "gifts", sort_order: 1, created_at: "2026-01-01T00:00:00Z" },
];

export const FALLBACK_PRODUCTS: AdminRow<"products">[] = [
  {
    id: "p1",
    name: "Kids Police Officer Uniform Set",
    section: "costumes",
    category_id: "c1",
    description: "Complete khaki police costume with shirt, pants, belt, badge, whistle and cap. Ideal for school annual days and fancy dress competitions.",
    price: 499,
    mrp: 1200,
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
    id: "p2",
    name: "Superhero Spidey Suit Costume",
    section: "costumes",
    category_id: "c1",
    description: "Full body superhero jumpsuit with separate matching mask. Breathable fabric and vibrant print for kids parties and fancy dress.",
    price: 599,
    mrp: 1499,
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
    id: "p3",
    name: "Little Krishna Devotional Costume",
    section: "costumes",
    category_id: "c1",
    description: "Traditional yellow dhoti, kurta, mukut with peacock feather, bansuri (flute), and pearl necklace. Perfect for Gokulashtami and cultural events.",
    price: 449,
    mrp: 999,
    age_info: "2 – 8 years",
    size_info: "Chest 22–28 in",
    is_available: true,
    stock: 6,
    rental_terms: "Rental duration: 24–48 hours.",
    customization: null,
    image_path: null,
    sort_order: 3,
    created_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "p4",
    name: "Personalised Wooden Photo Frame (8x10)",
    section: "frames",
    category_id: "c3",
    description: "Premium handcrafted wooden frame with high-resolution photo print and gloss lamination.",
    price: 450,
    mrp: 699,
    age_info: null,
    size_info: "8 x 10 inches",
    is_available: true,
    stock: 15,
    rental_terms: null,
    customization: "Send your high-res photo via WhatsApp after placing the order.",
    image_path: null,
    sort_order: 1,
    created_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "p5",
    name: "Custom Acrylic LED Night Lamp Frame",
    section: "frames",
    category_id: "c3",
    description: "Warm glow LED engraved acrylic keepsake frame with wooden stand. Ideal gift for birthdays and anniversaries.",
    price: 799,
    mrp: 1299,
    age_info: null,
    size_info: "6 x 8 inches",
    is_available: true,
    stock: 8,
    rental_terms: null,
    customization: "Share custom names, date, and couple/baby photo via WhatsApp.",
    image_path: null,
    sort_order: 2,
    created_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "p6",
    name: "Personalised Magic Colour-Changing Mug",
    section: "gifts",
    category_id: "c4",
    description: "Ceramic black mug that reveals your custom photo and message when hot beverage is poured.",
    price: 349,
    mrp: 599,
    age_info: null,
    size_info: "325 ml",
    is_available: true,
    stock: 20,
    rental_terms: null,
    customization: "Send photo and caption via WhatsApp.",
    image_path: null,
    sort_order: 1,
    created_at: "2026-01-01T00:00:00Z",
  },
  {
    id: "p7",
    name: "Customised Name Keyring & Pen Combo Gift Box",
    section: "gifts",
    category_id: "c4",
    description: "Luxury matte finish metal rollerball pen and faux-leather keyring laser engraved with your name. Comes in a presentation box.",
    price: 299,
    mrp: 499,
    age_info: null,
    size_info: "Standard Gift Box",
    is_available: true,
    stock: 12,
    rental_terms: null,
    customization: "Provide the name to engrave.",
    image_path: null,
    sort_order: 2,
    created_at: "2026-01-01T00:00:00Z",
  },
];

export function getLocalCategories(): AdminRow<"categories">[] {
  if (typeof window === "undefined") return FALLBACK_CATEGORIES;
  try {
    const raw = localStorage.getItem("lalitha_local_categories");
    return raw ? JSON.parse(raw) : FALLBACK_CATEGORIES;
  } catch {
    return FALLBACK_CATEGORIES;
  }
}

export function saveCategoryLocally(cat: AdminRow<"categories">) {
  if (typeof window === "undefined") return;
  try {
    const list = getLocalCategories();
    const idx = list.findIndex((c) => c.id === cat.id);
    if (idx >= 0) {
      list[idx] = cat;
    } else {
      list.push(cat);
    }
    localStorage.setItem("lalitha_local_categories", JSON.stringify(list));
  } catch (e) {
    console.warn("Could not save category locally:", e);
  }
}

export function deleteCategoryLocally(id: string) {
  if (typeof window === "undefined") return;
  try {
    const list = getLocalCategories().filter((c) => c.id !== id);
    localStorage.setItem("lalitha_local_categories", JSON.stringify(list));
  } catch (e) {
    console.warn("Could not delete category locally:", e);
  }
}

export function getLocalProducts(): AdminRow<"products">[] {
  if (typeof window === "undefined") return FALLBACK_PRODUCTS;
  try {
    const raw = localStorage.getItem("lalitha_local_products");
    return raw ? JSON.parse(raw) : FALLBACK_PRODUCTS;
  } catch {
    return FALLBACK_PRODUCTS;
  }
}

export function saveProductLocally(prod: AdminRow<"products">) {
  if (typeof window === "undefined") return;
  try {
    const list = getLocalProducts();
    const idx = list.findIndex((p) => p.id === prod.id);
    if (idx >= 0) {
      list[idx] = prod;
    } else {
      list.unshift(prod);
    }
    localStorage.setItem("lalitha_local_products", JSON.stringify(list));
  } catch (e) {
    console.warn("Could not save product locally:", e);
  }
}

export function deleteProductLocally(id: string) {
  if (typeof window === "undefined") return;
  try {
    const list = getLocalProducts().filter((p) => p.id !== id);
    localStorage.setItem("lalitha_local_products", JSON.stringify(list));
  } catch (e) {
    console.warn("Could not delete product locally:", e);
  }
}

export function getLocalOffers(): AdminRow<"offers">[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("lalitha_local_offers");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveOfferLocally(offer: AdminRow<"offers">) {
  if (typeof window === "undefined") return;
  try {
    const list = getLocalOffers();
    const idx = list.findIndex((o) => o.id === offer.id);
    if (idx >= 0) {
      list[idx] = offer;
    } else {
      list.unshift(offer);
    }
    localStorage.setItem("lalitha_local_offers", JSON.stringify(list));
  } catch (e) {
    console.warn("Could not save offer locally:", e);
  }
}

export function deleteOfferLocally(id: string) {
  if (typeof window === "undefined") return;
  try {
    const list = getLocalOffers().filter((o) => o.id !== id);
    localStorage.setItem("lalitha_local_offers", JSON.stringify(list));
  } catch (e) {
    console.warn("Could not delete offer locally:", e);
  }
}

export function useAdminTable<T extends "products" | "categories" | "offers" | "orders">(table: T) {
  return useQuery({
    queryKey: ["admin", table],
    queryFn: async () => {
      try {
        const q = supabase.from(table).select("*");
        const { data, error } = await (table === "categories" ? q.order("sort_order") : q.order("created_at", { ascending: false }));
        
        if (table === "products") {
          const local = getLocalProducts();
          const remote = data ? (data as AdminRow<"products">[]) : [];
          if (remote.length > 0) {
            const remoteIds = new Set(remote.map((r) => r.id));
            const merged = [...local.filter((l) => !remoteIds.has(l.id)), ...remote];
            return merged as never as AdminRow<T>[];
          }
          return local as never as AdminRow<T>[];
        }

        if (table === "offers") {
          const local = getLocalOffers();
          const remote = data ? (data as AdminRow<"offers">[]) : [];
          const remoteIds = new Set(remote.map((r) => r.id));
          const merged = [...local.filter((l) => !remoteIds.has(l.id)), ...remote];
          return merged as never as AdminRow<T>[];
        }

        if (error) {
          return (table === "categories" ? getLocalCategories() : table === "products" ? getLocalProducts() : []) as never as AdminRow<T>[];
        }
        if (table === "categories" && (!data || data.length === 0)) {
          return getLocalCategories() as never as AdminRow<T>[];
        }
        return (data ?? []) as never as AdminRow<T>[];
      } catch {
        if (table === "products") {
          return getLocalProducts() as never as AdminRow<T>[];
        }
        if (table === "offers") {
          return getLocalOffers() as never as AdminRow<T>[];
        }
        return (table === "categories" ? getLocalCategories() : []) as never as AdminRow<T>[];
      }
    },
  });
}

export function useRefresh() {
  const qc = useQueryClient();
  return () => { qc.invalidateQueries({ queryKey: ["admin"] }); qc.invalidateQueries({ queryKey: ["catalog"] }); };
}

export function F({ label, id, children, hint }: { label: string; id: string; children: ReactNode; hint?: string | undefined }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

export function ImagePicker(props: {
  value?: string | null;
  onChange?: (url: string | null) => void;
  current?: string | null;
  file?: File | null;
  onFile?: (f: File | null) => void;
  onRemove?: () => void;
}) {
  const [uploading, setUploading] = useState(false);
  const [localPreview, setLocalPreview] = useState<string | null>(null);

  if (props.onChange !== undefined) {
    const val = props.value ?? null;
    const src = imageUrl(val) || val;
    return (
      <div className="space-y-2">
        <Label className="text-sm font-semibold">Image</Label>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border bg-muted shadow-sm">
            {src ? (
              <img src={src} alt="Preview" className="h-full w-full object-contain" />
            ) : (
              <span className="text-xs text-muted-foreground">No image</span>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-primary/30 bg-background px-4 py-2 text-sm font-bold text-primary shadow-soft hover:bg-primary/10 transition-colors">
              <Upload className="h-4 w-4" /> {uploading ? "Uploading…" : val ? "Replace image" : "Upload image"}
              <input
                type="file"
                accept="image/*"
                className="sr-only"
                disabled={uploading}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setUploading(true);
                  try {
                    const path = await uploadImage(file, "products");
                    props.onChange!(path);
                    toast.success("Image added successfully");
                  } catch (err) {
                    toast.error((err as Error).message || "Upload failed");
                  } finally {
                    setUploading(false);
                    e.target.value = "";
                  }
                }}
              />
            </label>
            {val && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={async () => {
                  await deleteImage(val);
                  props.onChange!(null);
                  toast.success("Image removed");
                }}
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="mr-1 h-4 w-4" /> Remove
              </Button>
            )}
          </div>
        </div>
      </div>
    );
  }

  const displaySrc = props.file ? localPreview : imageUrl(props.current);
  return (
    <div className="space-y-2">
      <Label className="text-sm font-semibold">Image</Label>
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-2xl border border-border bg-muted shadow-sm">
          {displaySrc ? (
            <img src={displaySrc} alt="Preview" className="h-full w-full object-contain" />
          ) : (
            <span className="text-xs text-muted-foreground">No image</span>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <label className="inline-flex cursor-pointer items-center gap-2 rounded-full border border-primary/30 bg-background px-4 py-2 text-sm font-bold text-primary shadow-soft hover:bg-primary/10 transition-colors">
            <Upload className="h-4 w-4" /> {props.file || props.current ? "Change image" : "Add image"}
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0] ?? null;
                if (f) {
                  setLocalPreview(URL.createObjectURL(f));
                } else {
                  setLocalPreview(null);
                }
                props.onFile?.(f);
              }}
            />
          </label>
          {(props.current || props.file) && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                setLocalPreview(null);
                props.onFile?.(null);
                props.onRemove?.();
              }}
              className="text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="mr-1 h-4 w-4" /> Remove
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export const num = (v: string) => (v.trim() === "" ? null : Number(v));
