import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { inr } from "@/lib/shop";
import type { AppliedOffer, QuoteLine } from "@/lib/pricing";
import { useAdminTable, useRefresh } from "./shared";

const STATUSES = ["new", "confirmed", "ready", "completed", "cancelled"];

export function OrdersAdmin() {
  const { data: orders = [] } = useAdminTable("orders");
  const refresh = useRefresh();
  const setStatus = async (id: string, status: string) => {
    const { error } = await supabase.from("orders").update({ status }).eq("id", id);
    if (error) toast.error(error.message); else { toast.success("Status updated"); refresh(); }
  };
  return (
    <div className="mt-4 space-y-4">
      <p className="text-sm text-muted-foreground">Orders appear here when a customer taps Place Order. Confirm each one with the customer on WhatsApp.</p>
      {orders.length === 0 && <p className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">No orders yet.</p>}
      {orders.map((o) => (
        <div key={o.id} className="rounded-2xl border border-border bg-card p-4 text-sm shadow-soft">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-medium">{o.customer_name} · {o.phone}{o.email ? ` · ${o.email}` : ""}</p>
              <p className="text-xs text-muted-foreground">Ref {o.id.slice(0, 8).toUpperCase()} · {new Date(o.created_at).toLocaleString("en-IN")} · {o.fulfilment === "delivery" ? "Delivery" : "Pickup"}</p>
              {o.address && <p className="mt-1 text-xs text-muted-foreground">Address: {o.address}</p>}
              {o.notes && <p className="mt-1 text-xs text-muted-foreground">Notes: {o.notes}</p>}
            </div>
            <select value={o.status} onChange={(e) => setStatus(o.id, e.target.value)} className="h-9 rounded-md border border-input bg-card px-3 text-sm" aria-label="Order status">
              {STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
          </div>
          <ul className="mt-3 space-y-1">
            {(o.items as unknown as QuoteLine[]).map((l) => <li key={l.productId} className="flex justify-between"><span>{l.name} × {l.qty}</span><span>{inr(l.lineTotal)}</span></li>)}
            {(o.applied_offers as unknown as AppliedOffer[]).map((a) => <li key={a.offerId} className="flex justify-between text-success"><span>{a.title}</span><span>−{inr(a.discount)}</span></li>)}
          </ul>
          <p className="mt-2 text-right font-semibold">Total {inr(Number(o.total))}</p>
        </div>
      ))}
    </div>
  );
}
