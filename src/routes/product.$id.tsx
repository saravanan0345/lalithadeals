import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { PriceBlock, ProductImage } from "@/components/site/ProductCard";
import { catalogQuery } from "@/lib/queries";
import { useCart } from "@/lib/cart";
import { MAX_QTY } from "@/lib/pricing";
import { SECTION_LABEL, inr, waLink } from "@/lib/shop";

export const Route = createFileRoute("/product/$id")({
  loader: async ({ context, params }) => {
    const data = await context.queryClient.ensureQueryData(catalogQuery);
    const p = data.products.find((x) => x.id === params.id);
    if (!p) throw notFound();
    return { name: p.name, description: p.description };
  },
  head: ({ loaderData }) => ({
    meta: loaderData
      ? [
          { title: `${loaderData.name} — Lalitha / L Deals` },
          { name: "description", content: loaderData.description?.slice(0, 150) || `${loaderData.name} at Lalitha / L Deals.` },
          { property: "og:title", content: `${loaderData.name} — Lalitha / L Deals` },
          { property: "og:description", content: loaderData.description?.slice(0, 150) || `${loaderData.name} at Lalitha / L Deals.` },
          { property: "og:type", content: "product" },
          { name: "twitter:card", content: "summary_large_image" },
        ]
      : [{ title: "Unavailable — Lalitha / L Deals" }, { name: "robots", content: "noindex" }],
  }),
  notFoundComponent: () => (
    <div className="mx-auto max-w-xl px-4 py-24 text-center"><h1 className="text-2xl font-semibold">Product not found</h1><Link to="/" className="mt-4 inline-block underline">Back to shop</Link></div>
  ),
  component: ProductPage,
});

function ProductPage() {
  const { id } = Route.useParams();
  const { data } = useSuspenseQuery(catalogQuery);
  const p = data.products.find((x) => x.id === id)!;
  const cat = data.categories.find((c) => c.id === p.category_id);
  const { add } = useCart();
  const [qty, setQty] = useState(1);
  const available = p.is_available && (p.stock == null || p.stock > 0);
  const terms = p.section === "costumes" ? p.rental_terms || data.settings?.rental_terms : null;
  const askText = `Hi Lalitha / L Deals! I'm interested in "${p.name}" — ${inr(Number(p.price))}${p.section === "costumes" ? " (rental)" : ""}. Please share more details.`;
  return (
    <div className="mx-auto grid max-w-5xl gap-10 px-4 py-12 md:grid-cols-2">
      <ProductImage path={p.image_path} alt={p.name} />
      <div>
        <p className="text-xs uppercase tracking-wider text-muted-foreground">{SECTION_LABEL[p.section]}{cat ? ` · ${cat.name}` : ""}</p>
        <h1 className="mt-2 text-3xl font-semibold">{p.name}</h1>
        <div className="mt-4"><PriceBlock p={p} /></div>
        <p className={`mt-2 text-sm ${available ? "text-success" : "text-destructive"}`}>{available ? "Available" : "Currently unavailable"}</p>
        {p.description && <p className="mt-6 whitespace-pre-line text-muted-foreground">{p.description}</p>}
        <dl className="mt-6 space-y-2 text-sm">
          {p.age_info && <div><dt className="inline font-medium">Age: </dt><dd className="inline text-muted-foreground">{p.age_info}</dd></div>}
          {p.size_info && <div><dt className="inline font-medium">Size: </dt><dd className="inline text-muted-foreground">{p.size_info}</dd></div>}
          {terms && <div><dt className="font-medium">Rental terms</dt><dd className="whitespace-pre-line text-muted-foreground">{terms}</dd></div>}
          {p.section === "costumes" && data.settings?.deposit_info && <div><dt className="font-medium">Deposit</dt><dd className="whitespace-pre-line text-muted-foreground">{data.settings.deposit_info}</dd></div>}
          {p.customization && <div><dt className="font-medium">Customisation</dt><dd className="whitespace-pre-line text-muted-foreground">{p.customization}</dd></div>}
        </dl>
        <div className="mt-8 flex flex-wrap items-center gap-3">
          <label className="text-sm" htmlFor="qty">Qty</label>
          <input id="qty" type="number" min={1} max={MAX_QTY} value={qty} onChange={(e) => setQty(Math.max(1, Math.min(MAX_QTY, Number(e.target.value) || 1)))}
            className="h-10 w-20 rounded-full border border-input bg-card px-4 text-center" />
          <Button size="lg" disabled={!available} onClick={() => { add(p.id, qty); toast.success("Added to cart"); }}>Add to Cart</Button>
          <Button asChild size="lg" variant="whatsapp"><a href={waLink(askText)} target="_blank" rel="noreferrer">Ask on WhatsApp</a></Button>
        </div>
      </div>
    </div>
  );
}
