import { type ReactNode, useRef, useState, useEffect, useCallback } from "react";
import { Link } from "@tanstack/react-router";
import { ShoppingBag, ChevronLeft, ChevronRight, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ProductCard, ProductImage } from "@/components/site/ProductCard";
import { useCart } from "@/lib/cart";
import { inr } from "@/lib/shop";
import type { Catalog, Offer } from "@/lib/queries";

export type ShopSection = "costumes" | "frames" | "gifts";

export function SectionHead({ title, intro }: { title: string; intro?: string }) {
  return (
    <div className="mx-auto mb-6 sm:mb-8 max-w-6xl px-3 sm:px-4">
      <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight">{title}</h2>
      {intro && <p className="mt-1.5 max-w-xl text-xs sm:text-sm text-muted-foreground">{intro}</p>}
    </div>
  );
}

export function Empty({ text }: { text: string }) {
  return <p className="mx-auto max-w-6xl px-3 sm:px-4 text-xs sm:text-sm text-muted-foreground">{text}</p>;
}

export function ProductGrid({ children }: { children: ReactNode[] }) {
  return (
    <div className="mx-auto grid max-w-6xl grid-cols-2 gap-3 sm:gap-5 px-3 sm:px-4 sm:grid-cols-3 lg:grid-cols-4">
      {children}
    </div>
  );
}

export function ProductScrollRail({ children }: { children: ReactNode[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 8);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll, { passive: true });
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [checkScroll, children]);

  const scroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (!el) return;
    const distance = el.clientWidth * 0.85;
    el.scrollBy({ left: direction === "left" ? -distance : distance, behavior: "smooth" });
  };

  return (
    <div className="relative mx-auto max-w-6xl px-3 sm:px-4 group/rail">
      {/* Left Chevron Button (Desktop / Tablet) */}
      {canScrollLeft && (
        <button
          type="button"
          onClick={() => scroll("left")}
          className="absolute -left-1 sm:-left-3 top-1/2 -translate-y-1/2 z-20 hidden sm:flex h-11 w-11 items-center justify-center rounded-full border-2 border-border bg-card/95 text-foreground shadow-lift backdrop-blur-md transition-all hover:bg-primary hover:text-primary-foreground hover:border-primary hover:scale-110 active:scale-95"
          aria-label="Scroll left"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}

      {/* Horizontal Scroll Track: Exactly 3 columns on tablet/desktop, 1.25 on mobile */}
      <div
        ref={scrollRef}
        className="flex gap-3 sm:gap-4 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory py-2 -mx-1 px-1"
      >
        {children.map((child, idx) => (
          <div
            key={idx}
            className="w-[76vw] max-w-[290px] sm:w-[calc((100%-1rem)/2)] md:w-[calc((100%-2rem)/3)] shrink-0 snap-start flex flex-col"
          >
            {child}
          </div>
        ))}
      </div>

      {/* Right Chevron Button (Desktop / Tablet) */}
      {canScrollRight && (
        <button
          type="button"
          onClick={() => scroll("right")}
          className="absolute -right-1 sm:-right-3 top-1/2 -translate-y-1/2 z-20 hidden sm:flex h-11 w-11 items-center justify-center rounded-full border-2 border-border bg-card/95 text-foreground shadow-lift backdrop-blur-md transition-all hover:bg-primary hover:text-primary-foreground hover:border-primary hover:scale-110 active:scale-95"
          aria-label="Scroll right"
        >
          <ChevronRight className="h-5 w-5" />
        </button>
      )}
    </div>
  );
}

export function offerSummary(o: Offer) {
  const v = Number(o.value);
  switch (o.offer_type) {
    case "percent": return `${v}% off`;
    case "flat": return `${inr(v)} off each`;
    case "bogo": return `Buy ${o.buy_qty} get ${o.get_qty} free`;
    case "bundle": return `Bundle for ${inr(v)}`;
    default: return "";
  }
}

export function OfferCard({ o, data }: { o: Offer; data: Catalog }) {
  const { add } = useCart();
  const items = data.products.filter((p) => o.product_ids.includes(p.id));
  return (
    <article className="group flex h-full w-full flex-col overflow-hidden rounded-3xl border-2 border-border bg-card p-2.5 sm:p-3.5 shadow-soft transition-all hover:border-primary/40 hover:shadow-pop">
      <ProductImage path={o.image_path ?? items[0]?.image_path ?? null} alt={o.title} fit="cover" />
      <div className="flex flex-1 flex-col px-0.5 sm:px-1 pt-2.5 sm:pt-3">
        <div className="h-5">
          <span className="inline-block rounded-full bg-peach px-2.5 py-0.5 text-[10px] sm:text-xs font-bold text-foreground">
            {offerSummary(o)}
          </span>
        </div>
        <h3 className="mt-0.5 h-10 sm:h-11 line-clamp-2 text-xs sm:text-sm font-bold leading-tight text-foreground">
          {o.title}
        </h3>
        <div className="mt-0.5 h-8 line-clamp-2 text-[11px] sm:text-xs text-muted-foreground">
          {o.description || (items.length > 0 ? `Includes: ${items.map((i) => i.name).join(", ")}` : "\u00A0")}
        </div>
        {items.length > 0 && (
          <div className="mt-auto w-full pt-2.5 sm:pt-3">
            <Button
              size="sm"
              variant="candy"
              className="flex h-8 w-full min-w-0 items-center justify-center gap-1.5 rounded-full px-2 text-xs font-bold shadow-soft active:scale-95"
              onClick={() => {
                const n = o.offer_type === "bogo" && items.length === 1 ? o.buy_qty + o.get_qty : 1;
                items.filter((i) => i.is_available).forEach((i) => add(i.id, n));
                toast.success("Offer items added to cart");
              }}
            >
              <ShoppingBag className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">Add offer to Cart</span>
            </Button>
          </div>
        )}
      </div>
    </article>
  );
}

function ViewAllButton({
  section,
  title,
}: {
  section: ShopSection | "offers";
  title: string;
}) {
  const to = section === "offers" ? "/offers" : `/shop/${section}`;
  return (
    <div className="mx-auto mt-6 sm:mt-8 max-w-6xl px-3 sm:px-4 flex justify-center sm:justify-start">
      <Button
        asChild
        variant="soft"
        size="lg"
        className="rounded-full font-bold px-7 py-2.5 border-2 border-border/80 bg-card hover:bg-primary hover:text-primary-foreground hover:border-primary shadow-soft hover:shadow-pop transition-all inline-flex items-center gap-2 group text-sm sm:text-base cursor-pointer"
      >
        <Link to={to}>
          <span>See More / View All {title}</span>
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
        </Link>
      </Button>
    </div>
  );
}

export function Section({
  id,
  title,
  intro,
  data,
  section,
  tint,
  viewAll = false,
}: {
  id: string;
  title: string;
  intro: string;
  data: Catalog;
  section: ShopSection;
  tint: string;
  viewAll?: boolean;
}) {
  const cats = data.categories.filter((c) => c.section === section);
  const prods = data.products.filter((p) => p.section === section);
  const catName = (cid: string | null) => cats.find((c) => c.id === cid)?.name;
  const [selectedCat, setSelectedCat] = useState<string>("all");

  const displayedProds =
    viewAll && selectedCat !== "all"
      ? prods.filter((p) => p.category_id === selectedCat)
      : prods;

  return (
    <section id={id} className={`scroll-mt-24 py-10 sm:py-16 ${tint}`}>
      <SectionHead title={title} intro={intro} />

      {/* Category filter pills for sections with categories (e.g. Costumes) when viewAll is true */}
      {viewAll && cats.length > 0 && prods.length > 0 && (
        <div className="mx-auto mb-5 max-w-6xl px-3 sm:px-4">
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar py-1">
            <button
              type="button"
              onClick={() => setSelectedCat("all")}
              className={`rounded-full px-4 py-1.5 text-xs font-bold transition-all cursor-pointer ${
                selectedCat === "all"
                  ? "bg-primary text-primary-foreground shadow-soft"
                  : "bg-card border border-border text-foreground hover:bg-muted"
              }`}
            >
              All
            </button>
            {cats.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCat(c.id)}
                className={`rounded-full px-4 py-1.5 text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCat === c.id
                    ? "bg-primary text-primary-foreground shadow-soft"
                    : "bg-card border border-border text-foreground hover:bg-muted"
                }`}
              >
                {c.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {displayedProds.length === 0 ? (
        <Empty text="Products will be added here soon." />
      ) : viewAll ? (
        <ProductScrollRail>
          {displayedProds.map((p) => (
            <ProductCard key={p.id} p={p} categoryName={catName(p.category_id)} />
          ))}
        </ProductScrollRail>
      ) : (
        (section === "costumes"
          ? [
              ...cats.map((c) => ({
                key: c.id,
                name: c.name,
                items: prods.filter((p) => p.category_id === c.id),
              })),
              {
                key: "other",
                name: "More costumes",
                items: prods.filter((p) => !cats.some((c) => c.id === p.category_id)),
              },
            ].filter((g) => g.items.length)
          : [{ key: "all", name: "", items: prods }]
        ).map((g) => (
          <div key={g.key} className="mb-6 sm:mb-8">
            {g.name && (
              <h3 className="mx-auto mb-3 sm:mb-4 max-w-6xl px-3 sm:px-4 text-base sm:text-lg font-bold">
                {g.name}
              </h3>
            )}
            <ProductGrid>
              {g.items.map((p) => (
                <ProductCard key={p.id} p={p} categoryName={catName(p.category_id)} />
              ))}
            </ProductGrid>
          </div>
        ))
      )}

      {viewAll && <ViewAllButton section={section} title={title} />}
    </section>
  );
}

export function OffersSection({ data, viewAll = false }: { data: Catalog; viewAll?: boolean }) {
  return (
    <section id="offers" className="scroll-mt-24 py-10 sm:py-16">
      <SectionHead title="Special Deals" intro="Combos, bundles and seasonal savings." />
      {data.offers.length === 0 ? (
        <Empty text="New offers are coming soon. Message us on WhatsApp for current deals." />
      ) : viewAll ? (
        <ProductScrollRail>
          {data.offers.map((o) => (
            <OfferCard key={o.id} o={o} data={data} />
          ))}
        </ProductScrollRail>
      ) : (
        <ProductGrid>
          {data.offers.map((o) => (
            <OfferCard key={o.id} o={o} data={data} />
          ))}
        </ProductGrid>
      )}
      {viewAll && <ViewAllButton section="offers" title="Special Deals" />}
    </section>
  );
}
