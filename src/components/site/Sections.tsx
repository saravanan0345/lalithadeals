import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ProductCard, ProductImage } from "@/components/site/ProductCard";
import { useCart } from "@/lib/cart";
import { inr } from "@/lib/shop";
import type { Catalog, Offer } from "@/lib/queries";

export type ShopSection = "costumes" | "frames" | "gifts";

export function SectionHead({ title, intro }: { title: string; intro?: string }) {
  return (
    <div className="mx-auto mb-8 max-w-6xl px-4">
      <h2 className="text-3xl font-semibold">{title}</h2>
      {intro && <p className="mt-2 max-w-xl text-muted-foreground">{intro}</p>}
    </div>
  );
}

export function Empty({ text }: { text: string }) {
  return <p className="mx-auto max-w-6xl px-4 text-sm text-muted-foreground">{text}</p>;
}

export function ProductGrid({ children }: { children: ReactNode[] }) {
  return (
    <div className="mx-auto grid max-w-6xl grid-cols-2 gap-5 px-4 sm:grid-cols-3 lg:grid-cols-4">
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
    <article className="flex h-full flex-col rounded-2xl border border-border bg-card p-3 shadow-soft">
      <ProductImage path={o.image_path ?? items[0]?.image_path ?? null} alt={o.title} fit="cover" />
      <div className="flex flex-1 flex-col px-1 pt-4">
        <span className="w-fit rounded-full bg-peach px-2.5 py-0.5 text-xs font-medium">{offerSummary(o)}</span>
        <h3 className="mt-2 font-medium">{o.title}</h3>
        {o.description && <p className="mt-1 line-clamp-3 text-sm text-muted-foreground">{o.description}</p>}
        {items.length > 0 && <p className="mt-2 text-xs text-muted-foreground">Includes: {items.map((i) => i.name).join(", ")}</p>}
        {o.conditions && <p className="mt-1 text-xs text-muted-foreground">Conditions: {o.conditions}</p>}
        {(o.starts_at || o.ends_at) && <p className="mt-1 text-xs text-muted-foreground">Valid {o.starts_at ? `from ${o.starts_at} ` : ""}{o.ends_at ? `until ${o.ends_at}` : ""}</p>}
        {items.length > 0 && (
          <Button size="sm" className="mt-auto" onClick={() => {
            const n = o.offer_type === "bogo" && items.length === 1 ? o.buy_qty + o.get_qty : 1;
            items.filter((i) => i.is_available).forEach((i) => add(i.id, n));
            toast.success("Offer items added to cart");
          }}>Add offer to Cart</Button>
        )}
      </div>
    </article>
  );
}

function ViewAllButton({ section }: { section: ShopSection }) {
  return (
    <div className="mx-auto mt-6 max-w-6xl px-4">
      <Button asChild variant="soft"><Link to="/shop/$section" params={{ section }}>View All</Link></Button>
    </div>
  );
}

export function Section({ id, title, intro, data, section, tint, viewAll = false }: { id: string; title: string; intro: string; data: Catalog; section: ShopSection; tint: string; viewAll?: boolean }) {
  const cats = data.categories.filter((c) => c.section === section);
  const prods = data.products.filter((p) => p.section === section);
  const catName = (cid: string | null) => cats.find((c) => c.id === cid)?.name;
  const groups = section === "costumes"
    ? [...cats.map((c) => ({ key: c.id, name: c.name, items: prods.filter((p) => p.category_id === c.id) })),
       { key: "other", name: "More costumes", items: prods.filter((p) => !cats.some((c) => c.id === p.category_id)) }].filter((g) => g.items.length)
    : [{ key: "all", name: "", items: prods }];
  return (
    <section id={id} className={`scroll-mt-24 py-16 ${tint}`}>
      <SectionHead title={title} intro={intro} />
      {prods.length === 0 ? <Empty text="Products will be added here soon." /> : groups.map((g) => (
        <div key={g.key} className="mb-8">
          {g.name && <h3 className="mx-auto mb-4 max-w-6xl px-4 text-lg font-medium">{g.name}</h3>}
          <ProductGrid>{g.items.map((p) => <ProductCard key={p.id} p={p} categoryName={catName(p.category_id)} />)}</ProductGrid>
        </div>
      ))}
      {viewAll && <ViewAllButton section={section} />}
    </section>
  );
}

export function OffersSection({ data, viewAll = false }: { data: Catalog; viewAll?: boolean }) {
  return (
    <section id="offers" className="scroll-mt-24 py-16">
      <SectionHead title="Special Offers" intro="Combos, bundles and seasonal savings." />
      {data.offers.length === 0 ? <Empty text="New offers are coming soon. Message us on WhatsApp for current deals." /> : (
        <ProductGrid>{data.offers.map((o) => <OfferCard key={o.id} o={o} data={data} />)}</ProductGrid>
      )}
      {viewAll && (
        <div className="mx-auto mt-6 max-w-6xl px-4">
          <Button asChild variant="soft"><Link to="/offers">View All</Link></Button>
        </div>
      )}
    </section>
  );
}
