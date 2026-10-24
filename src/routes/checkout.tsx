import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { QuoteTotals } from "@/components/site/QuoteSummary";
import { useCart } from "@/lib/cart";
import { useQuote } from "@/lib/useQuote";
import { placeOrder } from "@/lib/shop.functions";
import { catalogQuery } from "@/lib/queries";
import { imageUrl, inr, waLink } from "@/lib/shop";
import type { Quote } from "@/lib/pricing";

export const Route = createFileRoute("/checkout")({
  head: () => ({
    meta: [
      { title: "Checkout — Lalitha / L Deals" },
      { name: "description", content: "Send your order to Lalitha / L Deals on WhatsApp." },
      { property: "og:title", content: "Checkout — Lalitha / L Deals" },
      { property: "og:description", content: "Send your order on WhatsApp." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Checkout,
});

const schema = z.object({
  name: z.string().trim().min(1, "Please enter your name").max(100),
  phone: z.string().trim().regex(/^[+\d][\d\s-]{6,18}$/, "Please enter a valid phone number"),
  email: z.string().trim().email("Please enter a valid email").max(255).or(z.literal("")),
  fulfilment: z.enum(["delivery", "pickup"], { message: "Please choose delivery or pickup" }),
  address: z.string().trim().max(500),
  notes: z.string().trim().max(500),
}).refine((d) => d.fulfilment !== "delivery" || d.address.length >= 5, { message: "Please enter your delivery address", path: ["address"] });

type Form = { name: string; phone: string; email: string; fulfilment: "" | "delivery" | "pickup"; address: string; notes: string };

function buildMessage(f: Form, q: Quote, orderId: string, terms: string | null) {
  const origin = window.location.origin;
  const L = [
    "Hi Lalitha / L Deals! I'd like to place an order.",
    `Order ref: ${orderId.slice(0, 8).toUpperCase()}`,
    "",
    `Name: ${f.name}`, `Phone: ${f.phone}`,
    ...(f.email ? [`Email: ${f.email}`] : []),
    `Fulfilment: ${f.fulfilment === "delivery" ? "Delivery" : "Pickup at shop"}`,
    ...(f.fulfilment === "delivery" ? [`Delivery address: ${f.address}`] : []),
    "", "Items:",
    ...q.lines.flatMap((l, i) => {
      const img = imageUrl(l.imagePath);
      return [
        `${i + 1}. ${l.name}${l.section === "costumes" ? " (rental)" : ""} — ${l.qty} × ${inr(l.unitPrice)} = ${inr(l.lineTotal)}`,
        ...(img ? [`   Image: ${origin}${img}`] : []),
      ];
    }),
    "", `Subtotal: ${inr(q.subtotal)}`,
    ...q.applied.map((a) => `Offer: ${a.title} (−${inr(a.discount)})`),
    `Grand total: ${inr(q.total)}`,
    ...(terms && q.lines.some((l) => l.section === "costumes") ? ["", `Rental terms: ${terms}`] : []),
    ...(f.notes ? ["", `Notes: ${f.notes}`] : []),
    "", "Please confirm availability and my order. Thank you!",
  ];
  return L.join("\n");
}

function Checkout() {
  const { items, clear } = useCart();
  const { data: q } = useQuote(items);
  const { data: catalog } = useQuery(catalogQuery);
  const submit = useServerFn(placeOrder);
  const [f, setF] = useState<Form>({ name: "", phone: "", email: "", fulfilment: "", address: "", notes: "" });
  const [errors, setErrors] = useState<Partial<Record<keyof Form, string>>>({});
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState<{ link: string } | null>(null);
  const [serverError, setServerError] = useState("");
  const set = (k: keyof Form) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });

  if (sent)
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <h1 className="text-3xl font-semibold">Almost done — tap Send in WhatsApp</h1>
        <p className="mt-4 text-muted-foreground">WhatsApp has opened with your order drafted. Please review it and <strong>tap Send</strong>. Your order is not confirmed until the shop replies to confirm it.</p>
        <Button asChild variant="whatsapp" size="lg" className="mt-8"><a href={sent.link} target="_blank" rel="noreferrer">Open WhatsApp again</a></Button>
        <div className="mt-4"><Link to="/" className="text-sm underline">Back to shop</Link></div>
      </div>
    );

  if (items.length === 0)
    return <div className="mx-auto max-w-xl px-4 py-24 text-center"><h1 className="text-2xl font-semibold">Your cart is empty</h1><Link to="/" className="mt-4 inline-block underline">Browse the shop</Link></div>;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setServerError("");
    const r = schema.safeParse(f);
    if (!r.success) {
      setErrors(Object.fromEntries(r.error.issues.map((i) => [String(i.path[0]), i.message])));
      return;
    }
    setErrors({});
    setBusy(true);
    // Open the window synchronously so mobile browsers don't block the popup.
    const win = window.open("", "_blank");
    try {
      const res = await submit({ data: { ...r.data, items } });
      if (!res.ok) { win?.close(); setServerError(res.quote.errors.join(" ") || "Some items are unavailable."); return; }
      const link = waLink(buildMessage(f, res.quote, res.orderId, catalog?.settings?.rental_terms ?? null));
      if (win) win.location.href = link; else window.location.href = link;
      clear();
      setSent({ link });
    } catch {
      win?.close();
      setServerError("We couldn't place your order. Please try again.");
    } finally { setBusy(false); }
  };

  return (
    <div className="mx-auto grid max-w-5xl gap-10 px-4 py-12 md:grid-cols-[1fr_340px]">
      <form onSubmit={onSubmit} noValidate className="space-y-5">
        <h1 className="text-3xl font-semibold">Checkout</h1>
        <Field id="name" label="Name *" error={errors.name}><Input id="name" value={f.name} onChange={set("name")} autoComplete="name" /></Field>
        <Field id="phone" label="Phone number *" error={errors.phone}><Input id="phone" type="tel" value={f.phone} onChange={set("phone")} autoComplete="tel" /></Field>
        <Field id="email" label="Email (optional)" error={errors.email}><Input id="email" type="email" value={f.email} onChange={set("email")} autoComplete="email" /></Field>
        <fieldset>
          <legend className="text-sm font-medium">Fulfilment *</legend>
          <div className="mt-2 grid grid-cols-2 gap-3">
            {(["delivery", "pickup"] as const).map((v) => (
              <label key={v} className={`cursor-pointer rounded-xl border p-4 text-sm ${f.fulfilment === v ? "border-ring bg-blush" : "border-border bg-card"}`}>
                <input type="radio" name="fulfilment" value={v} checked={f.fulfilment === v} onChange={set("fulfilment")} className="sr-only" />
                {v === "delivery" ? "Delivery" : "Pickup at shop"}
              </label>
            ))}
          </div>
          {errors.fulfilment && <p className="mt-1 text-sm text-destructive">{errors.fulfilment}</p>}
          {f.fulfilment === "delivery" && catalog?.settings?.delivery_info && <p className="mt-2 text-xs text-muted-foreground">{catalog.settings.delivery_info}</p>}
        </fieldset>
        {f.fulfilment === "delivery" && (
          <Field id="address" label="Delivery address *" error={errors.address}><Textarea id="address" value={f.address} onChange={set("address")} autoComplete="street-address" /></Field>
        )}
        <Field id="notes" label="Notes (optional)" error={errors.notes}><Textarea id="notes" value={f.notes} onChange={set("notes")} placeholder="Event date, sizes, frame text…" /></Field>
        {serverError && <p className="text-sm text-destructive">{serverError}</p>}
        <Button type="submit" variant="whatsapp" size="lg" className="w-full" disabled={busy || !q || q.errors.length > 0}>{busy ? "Preparing…" : "Place Order on WhatsApp"}</Button>
        <p className="text-xs text-muted-foreground">WhatsApp will open with your order drafted — you'll need to tap Send. The shop will confirm your order separately.</p>
      </form>
      <aside className="h-fit rounded-2xl border border-border bg-ivory p-6 shadow-soft">
        <h2 className="font-semibold">Order summary</h2>
        <ul className="my-4 space-y-2 text-sm">
          {q?.lines.map((l) => <li key={l.productId} className="flex justify-between gap-2"><span>{l.name} × {l.qty}</span><span>{inr(l.lineTotal)}</span></li>)}
        </ul>
        {q && <QuoteTotals q={q} />}
        {q?.errors.map((e) => <p key={e} className="mt-2 text-sm text-destructive">{e}</p>)}
      </aside>
    </div>
  );
}

function Field({ id, label, error, children }: { id: string; label: string; error?: string | undefined; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {error && <p className="text-sm text-destructive" role="alert">{error}</p>}
    </div>
  );
}
