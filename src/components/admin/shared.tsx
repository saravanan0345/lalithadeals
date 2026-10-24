import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { Upload, Image as ImageIcon, X, Check } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { imageUrl } from "@/lib/shop";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import type { Database } from "@/integrations/supabase/types";

export type AdminRow<T extends keyof Database["public"]["Tables"]> = Database["public"]["Tables"][T]["Row"];

const FALLBACK_CATEGORIES: AdminRow<"categories">[] = [
  { id: "c1", name: "Superhero-inspired", section: "costumes", sort_order: 1, created_at: new Date().toISOString() },
  { id: "c2", name: "Police & Uniforms", section: "costumes", sort_order: 2, created_at: new Date().toISOString() },
  { id: "c3", name: "Freedom Fighters & Historical", section: "costumes", sort_order: 3, created_at: new Date().toISOString() },
  { id: "c4", name: "Mythological & Devotional", section: "costumes", sort_order: 4, created_at: new Date().toISOString() },
  { id: "c5", name: "Fancy Dress & Events", section: "costumes", sort_order: 5, created_at: new Date().toISOString() },
  { id: "c6", name: "Blazers", section: "costumes", sort_order: 6, created_at: new Date().toISOString() },
  { id: "c7", name: "Custom Photo Frames", section: "frames", sort_order: 1, created_at: new Date().toISOString() },
  { id: "c8", name: "Gifts", section: "gifts", sort_order: 1, created_at: new Date().toISOString() },
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
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem("lalitha_local_products");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
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
          const remoteIds = new Set(remote.map((r) => r.id));
          const merged = [...local.filter((l) => !remoteIds.has(l.id)), ...remote];
          return merged as never as AdminRow<T>[];
        }

        if (table === "offers") {
          const local = getLocalOffers();
          const remote = data ? (data as AdminRow<"offers">[]) : [];
          const remoteIds = new Set(remote.map((r) => r.id));
          const merged = [...local.filter((l) => !remoteIds.has(l.id)), ...remote];
          return merged as never as AdminRow<T>[];
        }

        if (error) {
          return (table === "categories" ? getLocalCategories() : []) as never as AdminRow<T>[];
        }
        if (table === "categories" && (!data || data.length === 0)) {
          return getLocalCategories() as never as AdminRow<T>[];
        }
        return (data ?? []) as never as AdminRow<T>[];
      } catch (e) {
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

export function ImagePicker({ current, file, onFile, onRemove }: { current: string | null; file: File | null; onFile: (f: File | null) => void; onRemove: () => void }) {
  const [preview, setPreview] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!file) { setPreview(null); return; }
    const u = URL.createObjectURL(file);
    setPreview(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);

  const src = preview ?? imageUrl(current);

  return (
    <div className="space-y-2">
      <Label className="text-sm font-medium">Product Image</Label>
      <div className="flex flex-wrap items-center gap-4">
        <div className="relative flex h-28 w-24 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted shadow-sm">
          {src ? (
            <img src={src} alt="Preview" className="h-full w-full object-contain" />
          ) : (
            <ImageIcon className="h-8 w-8 text-muted-foreground/40" />
          )}
        </div>
        <div className="space-y-2.5">
          <input
            ref={inputRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/gif"
            onChange={(e) => onFile(e.target.files?.[0] ?? null)}
            className="hidden"
            aria-label="Upload product image"
          />
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => inputRef.current?.click()}
              className="flex items-center gap-2 border-primary/30 hover:border-primary hover:bg-primary/5"
            >
              <Upload className="h-4 w-4 text-primary" />
              {file || current ? "Change Image" : "Add Image"}
            </Button>
            {(current || file) && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                onClick={() => {
                  if (inputRef.current) inputRef.current.value = "";
                  onFile(null);
                  onRemove();
                }}
              >
                <X className="mr-1 h-3.5 w-3.5" />
                Remove
              </Button>
            )}
          </div>
          {file ? (
            <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Check className="h-3.5 w-3.5 text-green-600" />
              <span className="font-medium text-foreground">{file.name}</span>
            </p>
          ) : (
            <p className="text-xs text-muted-foreground">
              {current ? "Current image displayed." : "No image selected. Click \"Add Image\" to select a photo."}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

export const num = (v: string) => (v.trim() === "" ? null : Number(v));
