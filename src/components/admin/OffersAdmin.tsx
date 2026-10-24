import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { deleteImage, uploadImage } from "@/lib/admin";
import { SECTION_LABEL } from "@/lib/shop";
import { F, ImagePicker, deleteOfferLocally, saveOfferLocally, useAdminTable, useRefresh, type AdminRow } from "./shared";

type O = AdminRow<"offers">;
const TYPES: Record<string, { label: string; valueLabel: string; hint: string }> = {
  percent: { label: "Percentage discount", valueLabel: "Discount %", hint: "No products selected = applies to the whole cart." },
  flat: { label: "Flat ₹ off each item", valueLabel: "₹ off per item", hint: "No products selected = applies to every item." },
  bogo: { label: "Buy X get Y free", valueLabel: "(not used)", hint: "Select eligible products. Cheapest units are free." },
  bundle: { label: "Combo / bundle price", valueLabel: "Bundle price (₹)", hint: "All selected products must be in the cart." },
};
const blank = { id: "", title: "", description: "", image_path: null as string | null, offer_type: "percent", value: "0", buy_qty: "1", get_qty: "1", product_ids: [] as string[], conditions: "", starts_at: "", ends_at: "", is_active: true };
type Form = typeof blank;

export function OffersAdmin() {
  const { data: offers = [] } = useAdminTable("offers");
  const { data: products = [] } = useAdminTable("products");
  const refresh = useRefresh();
  const [edit, setEdit] = useState<Form | null>(null);

  const toggle = async (o: O) => {
    const { error } = await supabase.from("offers").update({ is_active: !o.is_active }).eq("id", o.id);
    if (error) toast.error(error.message); else refresh();
  };
  const del = async (o: O) => {
    if (!confirm(`Delete offer "${o.title}"?`)) return;
    try {
      await supabase.from("offers").delete().eq("id", o.id);
    } catch {
      // ignore
    }
    deleteOfferLocally(o.id);
    await deleteImage(o.image_path);
    toast.success("Deleted");
    refresh();
  };

  return (
    <div className="mt-4 space-y-4">
      <div className="flex justify-end">
        <Button variant="candy" onClick={() => setEdit(blank)}>+ Add offer</Button>
      </div>
      <div className="mt-4 divide-y divide-border rounded-2xl border border-border bg-card">
        {offers.length === 0 && <p className="p-6 text-sm text-muted-foreground">No offers yet.</p>}
        {offers.map((o) => (
          <div key={o.id} className="flex flex-wrap items-center gap-3 p-3">
            <div className="flex-1">
              <p className="font-medium">{o.title}</p>
              <p className="text-xs text-muted-foreground">{TYPES[o.offer_type]?.label} · {o.product_ids.length} products{o.ends_at ? ` · until ${o.ends_at}` : ""}</p>
            </div>
            <label className="flex items-center gap-2 text-xs"><Switch checked={o.is_active} onCheckedChange={() => toggle(o)} /> {o.is_active ? "Active" : "Inactive"}</label>
            <Button size="sm" variant="soft" onClick={() => setEdit({ ...blank, ...o, description: o.description ?? "", conditions: o.conditions ?? "", value: String(o.value), buy_qty: String(o.buy_qty), get_qty: String(o.get_qty), starts_at: o.starts_at ?? "", ends_at: o.ends_at ?? "" })}>Edit</Button>
            <Button size="sm" variant="ghost" onClick={() => del(o)}>Delete</Button>
          </div>
        ))}
      </div>
      {edit && <OfferDialog init={edit} products={products} onClose={() => setEdit(null)} onSaved={() => { setEdit(null); refresh(); }} />}
    </div>
  );
}

function OfferDialog({ init, products, onClose, onSaved }: { init: Form; products: AdminRow<"products">[]; onClose: () => void; onSaved: () => void }) {
  const [f, setF] = useState(init);
  const [file, setFile] = useState<File | null>(null);
  const [removeImg, setRemoveImg] = useState(false);
  const [busy, setBusy] = useState(false);
  const s = (k: keyof Form) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });
  const t = TYPES[f.offer_type]!;
  const toggleP = (id: string) => setF({ ...f, product_ids: f.product_ids.includes(id) ? f.product_ids.filter((x) => x !== id) : [...f.product_ids, id] });

  const save = async () => {
    const value = Number(f.value), buy = Number(f.buy_qty), get = Number(f.get_qty);
    if (!f.title.trim()) { toast.error("Title is required"); return; }
    if (isNaN(value) || value < 0) { toast.error("Enter a valid value"); return; }
    if (f.offer_type === "percent" && value > 100) { toast.error("Percentage cannot exceed 100"); return; }
    if ((f.offer_type === "bogo" || f.offer_type === "bundle") && f.product_ids.length === 0) { toast.error("Select eligible products"); return; }
    if (f.offer_type === "bundle" && f.product_ids.length < 2) { toast.error("A bundle needs at least 2 products"); return; }
    if (f.offer_type === "bogo" && (!(buy >= 1) || !(get >= 1))) { toast.error("Buy and get quantities must be at least 1"); return; }
    if (f.starts_at && f.ends_at && f.ends_at < f.starts_at) { toast.error("End date is before start date"); return; }
    setBusy(true);
    try {
      let image_path = removeImg ? null : f.image_path;
      if (file) image_path = await uploadImage(file, "offers");
      const rowId = f.id || crypto.randomUUID();
      const row: O = {
        id: rowId,
        title: f.title.trim(), description: f.description || null, image_path, offer_type: f.offer_type, value,
        buy_qty: Math.floor(buy) || 1, get_qty: Math.floor(get) || 1, product_ids: f.product_ids, conditions: f.conditions || null,
        starts_at: f.starts_at || null, ends_at: f.ends_at || null, is_active: f.is_active,
        created_at: new Date().toISOString(),
      };
      try {
        const { error } = f.id ? await supabase.from("offers").update(row).eq("id", f.id) : await supabase.from("offers").insert(row);
        if (error) {
          console.warn("Supabase offers update notice, saved locally:", error.message);
        }
      } catch (err) {
        console.warn("Supabase offers call failed, saved locally:", err);
      }
      saveOfferLocally(row);
      if (init.image_path && init.image_path !== image_path) await deleteImage(init.image_path);
      toast.success(f.id ? "Offer updated successfully" : "Offer added successfully");
      onSaved();
    } catch (e) {
      toast.error((e as Error).message || "Failed to save offer");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader><DialogTitle>{f.id ? "Edit" : "Add"} offer</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <ImagePicker current={removeImg ? null : f.image_path} file={file} onFile={(x) => { setFile(x); if (x) setRemoveImg(false); }} onRemove={() => setRemoveImg(true)} />
          <F label="Title *" id="ot"><Input id="ot" value={f.title} onChange={s("title")} /></F>
          <F label="Description" id="od"><Textarea id="od" value={f.description} onChange={s("description")} /></F>
          <F label="Offer type" id="oty" hint={t.hint}>
            <select id="oty" value={f.offer_type} onChange={s("offer_type")} className="h-9 w-full rounded-md border border-input bg-card px-3 text-sm">
              {Object.entries(TYPES).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </F>
          {f.offer_type === "bogo" ? (
            <div className="grid grid-cols-2 gap-3">
              <F label="Buy quantity" id="ob"><Input id="ob" inputMode="numeric" value={f.buy_qty} onChange={s("buy_qty")} /></F>
              <F label="Get free quantity" id="og"><Input id="og" inputMode="numeric" value={f.get_qty} onChange={s("get_qty")} /></F>
            </div>
          ) : <F label={t.valueLabel} id="ov"><Input id="ov" inputMode="decimal" value={f.value} onChange={s("value")} /></F>}
          <F label="Conditions shown to customers" id="oc"><Input id="oc" value={f.conditions} onChange={s("conditions")} /></F>
          <div className="grid grid-cols-2 gap-3">
            <F label="Valid from" id="os"><Input id="os" type="date" value={f.starts_at} onChange={s("starts_at")} /></F>
            <F label="Valid until" id="oe"><Input id="oe" type="date" value={f.ends_at} onChange={s("ends_at")} /></F>
          </div>
          <label className="flex items-center gap-3 text-sm"><Switch checked={f.is_active} onCheckedChange={(v) => setF({ ...f, is_active: v })} /> Active</label>
          <fieldset>
            <legend className="text-sm font-medium">Eligible products</legend>
            <div className="mt-2 max-h-56 space-y-3 overflow-y-auto rounded-md border border-border p-3 text-sm">
              {(["costumes", "frames", "gifts"] as const).map((sec) => {
                const list = products.filter((p) => p.section === sec);
                return list.length ? (
                  <div key={sec}><p className="mb-1 text-xs uppercase text-muted-foreground">{SECTION_LABEL[sec]}</p>
                    {list.map((p) => <label key={p.id} className="flex items-center gap-2 py-0.5"><input type="checkbox" checked={f.product_ids.includes(p.id)} onChange={() => toggleP(p.id)} />{p.name}</label>)}
                  </div>
                ) : null;
              })}
              {products.length === 0 && <p className="text-muted-foreground">Add products first.</p>}
            </div>
          </fieldset>
          <div className="flex justify-end gap-2"><Button variant="soft" onClick={onClose}>Cancel</Button><Button onClick={save} disabled={busy}>{busy ? "Saving…" : "Save"}</Button></div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
