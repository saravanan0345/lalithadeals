import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ShoppingBag } from "lucide-react";
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

function ViewAllButton({ section }: { section: ShopSection }) {
  return (
    <div className="mx-auto mt-6 max-w-6xl px-3 sm:px-4">
      <Button asChild variant="soft" className="rounded-full font-bold">
        <Link to="/shop/$section" params={{ section }}>View All</Link>
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
  const groups =
    section === "costumes"
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
      : [{ key: "all", name: "", items: prods }];

  return (
    <section id={id} className={`scroll-mt-24 py-10 sm:py-16 ${tint}`}>
      <SectionHead title={title} intro={intro} />
      {prods.length === 0 ? (
        <Empty text="Products will be added here soon." />
      ) : (
        groups.map((g) => (
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
      {viewAll && <ViewAllButton section={section} />}
    </section>
  );
}

export function OffersSection({ data, viewAll = false }: { data: Catalog; viewAll?: boolean }) {
  return (
    <section id="offers" className="scroll-mt-24 py-10 sm:py-16">
      <SectionHead title="Special Offers" intro="Combos, bundles and seasonal savings." />
      {data.offers.length === 0 ? (
        <Empty text="New offers are coming soon. Message us on WhatsApp for current deals." />
      ) : (
        <ProductGrid>
          {data.offers.map((o) => (
            <OfferCard key={o.id} o={o} data={data} />
          ))}
        </ProductGrid>
      )}
      {viewAll && (
        <div className="mx-auto mt-6 max-w-6xl px-3 sm:px-4">
          <Button asChild variant="soft" className="rounded-full font-bold">
            <Link to="/offers">View All</Link>
          </Button>
        </div>
      )}
    </section>
  );
}
