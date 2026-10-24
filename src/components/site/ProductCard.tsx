import { Link } from "@tanstack/react-router";
import { ImageOff, ShoppingBag } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCart } from "@/lib/cart";
import { discountPercent } from "@/lib/pricing";
import { imageUrl, inr } from "@/lib/shop";
import type { Product } from "@/lib/queries";

export function ProductImage({
  path,
  alt,
  fit = "contain",
}: {
  path: string | null;
  alt: string;
  fit?: "contain" | "cover";
}) {
  const src = imageUrl(path);
  return (
    <div className="relative aspect-square w-full shrink-0 overflow-hidden rounded-2xl bg-muted/60 flex items-center justify-center">
      {src ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          className={`h-full w-full p-2 transition-transform duration-300 group-hover:scale-105 ${
            fit === "cover" ? "object-cover" : "object-contain"
          }`}
        />
      ) : (
        <div className="grid h-full place-items-center text-muted-foreground">
          <ImageOff className="h-6 w-6 opacity-40" aria-label="No image" />
        </div>
      )}
    </div>
  );
}

export function PriceBlock({ p }: { p: Pick<Product, "price" | "mrp" | "section"> }) {
  const price = Number(p.price);
  const mrp = p.mrp == null ? null : Number(p.mrp);
  const pct = discountPercent(mrp, price);
  return (
    <div className="flex flex-wrap items-baseline gap-x-1.5 gap-y-0.5">
      <span className="text-base sm:text-lg font-black text-primary">{inr(price)}</span>
      {p.section === "costumes" && (
        <span className="text-[10px] sm:text-xs font-bold text-muted-foreground">rental</span>
      )}
      {pct != null && mrp != null && (
        <>
          <span className="text-[11px] sm:text-xs text-muted-foreground line-through">
            {inr(mrp)}
          </span>
          <span className="rounded-full bg-sunny px-1.5 py-0.5 text-[9px] sm:text-[10px] font-black text-foreground">
            {pct}% OFF
          </span>
        </>
      )}
    </div>
  );
}

export function ProductCard({
  p,
  categoryName,
}: {
  p: Product;
  categoryName?: string | undefined;
}) {
  const { add } = useCart();
  const available = p.is_available && (p.stock == null || p.stock > 0);

  return (
    <article className="group flex h-full w-full flex-col overflow-hidden rounded-3xl border-2 border-border bg-card p-2.5 sm:p-3.5 shadow-soft transition-all hover:border-primary/40 hover:shadow-pop">
      {/* 1:1 Aspect ratio square image */}
      <ProductImage path={p.image_path} alt={p.name} />

      <div className="flex flex-1 flex-col px-0.5 sm:px-1 pt-2.5 sm:pt-3">
        {/* Category Badge with fixed height */}
        <div className="h-4 truncate">
          {categoryName ? (
            <span className="block truncate text-[10px] sm:text-xs font-black uppercase tracking-wider text-sky">
              {categoryName}
            </span>
          ) : (
            <span className="block text-[10px] select-none text-transparent">General</span>
          )}
        </div>

        {/* Product Title with fixed 2-line height */}
        <h3
          className="mt-0.5 h-10 sm:h-11 line-clamp-2 text-xs sm:text-sm font-bold leading-tight text-foreground"
          title={p.name}
        >
          {p.name}
        </h3>

        {/* Age / Size with fixed height */}
        <div className="mt-0.5 h-4 sm:h-5 truncate text-[11px] sm:text-xs text-muted-foreground">
          {[p.age_info, p.size_info].filter(Boolean).join(" · ") || "\u00A0"}
        </div>

        {/* Price block with fixed min-height */}
        <div className="mt-1 flex min-h-[1.85rem] sm:min-h-[2.25rem] items-center">
          <PriceBlock p={p} />
        </div>

        {/* Availability Status with fixed height */}
        <div className="mt-1 flex h-4 items-center gap-1.5 text-[11px] sm:text-xs font-bold">
          <span
            className={`h-2 w-2 shrink-0 rounded-full ${
              available ? "bg-success" : "bg-destructive"
            }`}
          />
          <span className={`truncate ${available ? "text-success" : "text-destructive"}`}>
            {available ? (p.stock != null ? `In stock (${p.stock})` : "Available") : "Unavailable"}
          </span>
        </div>

        {/* Action Buttons: Responsive full width on phones, side-by-side on tablet/desktop */}
        <div className="mt-auto flex w-full flex-col gap-1.5 pt-2.5 sm:flex-row sm:gap-2 sm:pt-3">
          <Button
            size="sm"
            variant="candy"
            className="flex h-8 w-full min-w-0 items-center justify-center gap-1.5 rounded-full px-2 text-xs font-bold shadow-soft active:scale-95 sm:flex-1"
            disabled={!available}
            onClick={() => {
              add(p.id);
              toast.success(`${p.name} added to cart`);
            }}
            aria-label={`Add ${p.name} to cart`}
          >
            <ShoppingBag className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">Add to Cart</span>
          </Button>

          <Button
            asChild
            variant="soft"
            size="sm"
            className="h-7 w-full min-w-0 rounded-full px-2 text-xs font-bold text-foreground/85 hover:text-foreground sm:h-8 sm:flex-1"
          >
            <Link to="/product/$id" params={{ id: p.id }} className="truncate text-center">
              View Details
            </Link>
          </Button>
        </div>
      </div>
    </article>
  );
}
