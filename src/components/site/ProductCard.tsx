import { Link } from "@tanstack/react-router";
import { ImageOff } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { discountPercent } from "@/lib/pricing";
import { imageUrl, inr } from "@/lib/shop";
import type { Product } from "@/lib/queries";

export function ProductImage({ path, alt, fit = "contain" }: { path: string | null; alt: string; fit?: "contain" | "cover" }) {
  const src = imageUrl(path);
  return (
    <div className="aspect-[4/5] w-full overflow-hidden rounded-xl bg-muted">
      {src ? (
        <img src={src} alt={alt} loading="lazy" className={`h-full w-full ${fit === "cover" ? "object-cover" : "object-contain"}`} />
      ) : (
        <div className="grid h-full place-items-center text-muted-foreground"><ImageOff className="h-6 w-6" aria-label="No image" /></div>
      )}
    </div>
  );
}

export function PriceBlock({ p }: { p: Pick<Product, "price" | "mrp" | "section"> }) {
  const price = Number(p.price);
  const mrp = p.mrp == null ? null : Number(p.mrp);
  const pct = discountPercent(mrp, price);
  return (
    <div className="flex flex-wrap items-baseline gap-x-2">
      <span className="text-lg font-semibold">{inr(price)}</span>
      {p.section === "costumes" && <span className="text-xs text-muted-foreground">rental</span>}
      {pct != null && mrp != null && (
        <>
          <span className="text-sm text-muted-foreground line-through">{inr(mrp)}</span>
          <span className="rounded-full bg-sage px-2 py-0.5 text-xs font-medium text-secondary-foreground">{pct}% off</span>
        </>
      )}
    </div>
  );
}

export function ProductCard({ p, categoryName }: { p: Product; categoryName?: string | undefined }) {
  const { add } = useCart();
  const available = p.is_available && (p.stock == null || p.stock > 0);
  return (
    <article className="flex h-full w-full flex-col rounded-2xl border border-border bg-card p-3 shadow-soft">
      <ProductImage path={p.image_path} alt={p.name} />
      <div className="flex flex-1 flex-col px-1 pt-4">
        {categoryName && <p className="text-xs uppercase tracking-wider text-muted-foreground">{categoryName}</p>}
        <h3 className="mt-1 line-clamp-2 font-medium leading-snug">{p.name}</h3>
        {(p.age_info || p.size_info) && (
          <p className="mt-1 text-xs text-muted-foreground">{[p.age_info, p.size_info].filter(Boolean).join(" · ")}</p>
        )}
        <div className="mt-2"><PriceBlock p={p} /></div>
        <p className={`mt-1 text-xs ${available ? "text-success" : "text-destructive"}`}>{available ? "Available" : "Currently unavailable"}</p>
        <div className="mt-auto flex gap-2 pt-4">
          <Button asChild variant="soft" size="sm" className="flex-1"><Link to="/product/$id" params={{ id: p.id }}>View Details</Link></Button>
          <Button size="sm" className="flex-1" disabled={!available} onClick={() => { add(p.id); toast.success(`${p.name} added to cart`); }}>Add to Cart</Button>
        </div>
      </div>
    </article>
  );
}
