import type { Quote } from "@/lib/pricing";
import { inr } from "@/lib/shop";

export function QuoteTotals({ q }: { q: Quote }) {
  return (
    <div className="space-y-2 text-sm">
      <div className="flex justify-between"><span>Subtotal</span><span>{inr(q.subtotal)}</span></div>
      {q.applied.map((a) => (
        <div key={a.offerId} className="flex justify-between text-success">
          <span>{a.title}{a.conditions ? <span className="block text-xs text-muted-foreground">{a.conditions}</span> : null}</span>
          <span>−{inr(a.discount)}</span>
        </div>
      ))}
      <div className="flex justify-between border-t border-border pt-3 text-base font-semibold"><span>Total</span><span>{inr(q.total)}</span></div>
      {q.discount > 0 && <p className="text-xs text-success">You save {inr(q.discount)}</p>}
    </div>
  );
}
