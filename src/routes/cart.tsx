import { createFileRoute, Link } from "@tanstack/react-router";
import { Minus, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProductImage } from "@/components/site/ProductCard";
import { QuoteTotals } from "@/components/site/QuoteSummary";
import { useCart } from "@/lib/cart";
import { useQuote } from "@/lib/useQuote";
import { inr } from "@/lib/shop";

export const Route = createFileRoute("/cart")({
  head: () => ({
    meta: [
      { title: "Your Cart — Lalitha / L Deals" },
      { name: "description", content: "Review your costumes, photo frames and gifts before ordering." },
      { property: "og:title", content: "Your Cart — Lalitha / L Deals" },
      { property: "og:description", content: "Review your cart at Lalitha / L Deals." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: CartPage,
});

function CartPage() {
  const { items, setQty, remove } = useCart();
  const { data: q, isLoading, isError } = useQuote(items);

  if (items.length === 0)
    return (
      <div className="mx-auto max-w-xl px-4 py-24 text-center">
        <h1 className="text-3xl font-semibold">Your cart is empty</h1>
        <Button asChild className="mt-6"><Link to="/">Browse the shop</Link></Button>
      </div>
    );

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <h1 className="text-3xl font-semibold">Your cart</h1>
      {isError && <p className="mt-4 text-destructive">Couldn't load prices. Please refresh.</p>}
      <div className="mt-8 grid gap-8 md:grid-cols-[1fr_320px]">
        <ul className="space-y-4">
          {items.map((it) => {
            const line = q?.lines.find((l) => l.productId === it.productId);
            return (
              <li key={it.productId} className="flex gap-4 rounded-2xl border border-border bg-card p-3 shadow-soft">
                <div className="w-20 shrink-0"><ProductImage path={line?.imagePath ?? null} alt={line?.name ?? ""} /></div>
                <div className="flex flex-1 flex-col">
                  <p className="font-medium">{line?.name ?? (isLoading ? "Loading…" : "Unavailable item")}</p>
                  {line && <p className="text-sm text-muted-foreground">{inr(line.unitPrice)}{line.section === "costumes" ? " rental" : ""} each</p>}
                  {line?.section === "costumes" && line.rentalTerms && <p className="text-xs text-muted-foreground">{line.rentalTerms}</p>}
                  <div className="mt-auto flex items-center gap-2 pt-2">
                    <button aria-label="Decrease quantity" onClick={() => setQty(it.productId, it.qty - 1)} className="grid h-8 w-8 place-items-center rounded-full border border-border hover:bg-muted"><Minus className="h-3 w-3" /></button>
                    <span className="w-6 text-center text-sm" aria-live="polite">{it.qty}</span>
                    <button aria-label="Increase quantity" onClick={() => setQty(it.productId, it.qty + 1)} className="grid h-8 w-8 place-items-center rounded-full border border-border hover:bg-muted"><Plus className="h-3 w-3" /></button>
                    <button aria-label="Remove item" onClick={() => remove(it.productId)} className="ml-2 grid h-8 w-8 place-items-center rounded-full text-muted-foreground hover:bg-muted"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </div>
                {line && <p className="font-medium">{inr(line.lineTotal)}</p>}
              </li>
            );
          })}
        </ul>
        <aside className="h-fit rounded-2xl border border-border bg-ivory p-6 shadow-soft">
          {q ? <QuoteTotals q={q} /> : <p className="text-sm text-muted-foreground">Calculating…</p>}
          {q?.errors.map((e) => <p key={e} className="mt-3 text-sm text-destructive">{e}</p>)}
          <Button asChild className="mt-6 w-full" size="lg" disabled={!q || q.errors.length > 0}>
            {q && q.errors.length === 0 ? <Link to="/checkout">Checkout</Link> : <span>Checkout</span>}
          </Button>
        </aside>
      </div>
    </div>
  );
}
