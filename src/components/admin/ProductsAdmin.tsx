import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { deleteImage, uploadImage } from "@/lib/admin";
import { discountPercent } from "@/lib/pricing";
import { SECTION_LABEL, imageUrl, inr } from "@/lib/shop";
import { F, ImagePicker, deleteProductLocally, num, saveProductLocally, useAdminTable, useRefresh, type AdminRow } from "./shared";

type P = AdminRow<"products">;
type Section = P["section"];
const blank = (section: Section) => ({
  id: "", section, category_id: "", name: "", description: "", image_path: null as string | null,
  mrp: "", price: "", age_info: "", size_info: "", is_available: true, stock: "", rental_terms: "", customization: "", sort_order: "0",
});
type Form = ReturnType<typeof blank>;

export function ProductsAdmin() {
  const { data: products = [] } = useAdminTable("products");
  const { data: cats = [] } = useAdminTable("categories");
  const [section, setSection] = useState<Section | "all">("all");
  const [edit, setEdit] = useState<Form | null>(null);
  const refresh = useRefresh();
  const list = section === "all" ? products : products.filter((p) => p.section === section);

  const open = (p?: P) => setEdit(p ? {
    ...blank(p.section), ...p, category_id: p.category_id ?? "", description: p.description ?? "",
    mrp: p.mrp?.toString() ?? "", price: p.price.toString(), age_info: p.age_info ?? "", size_info: p.size_info ?? "",
    stock: p.stock?.toString() ?? "", rental_terms: p.rental_terms ?? "", customization: p.customization ?? "", sort_order: String(p.sort_order),
  } : blank(section === "all" ? "costumes" : section));

  const del = async (p: P) => {
    if (!confirm(`Delete "${p.name}"?`)) return;
    try {
      await supabase.from("products").delete().eq("id", p.id);
    } catch {
      // ignore
    }
    deleteProductLocally(p.id);
    await deleteImage(p.image_path);
    toast.success("Deleted"); refresh();
  };

  return (
    <div className="mt-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <Button size="sm" variant={section === "all" ? "default" : "soft"} onClick={() => setSection("all")}>All</Button>
          {(Object.keys(SECTION_LABEL) as Section[]).map((s) => (
            <Button key={s} size="sm" variant={s === section ? "default" : "soft"} onClick={() => setSection(s)}>{SECTION_LABEL[s]}</Button>
          ))}
        </div>
        <Button size="sm" onClick={() => open()}>Add product</Button>
      </div>
      <div className="mt-4 divide-y divide-border rounded-2xl border border-border bg-card">
        {list.length === 0 && <p className="p-6 text-sm text-muted-foreground">No products yet.</p>}
        {list.map((p) => (
          <div key={p.id} className="flex items-center gap-4 p-3">
            <div className="h-16 w-14 shrink-0 overflow-hidden rounded-md bg-muted">{p.image_path && <img src={imageUrl(p.image_path)!} alt="" className="h-full w-full object-contain" />}</div>
            <div className="flex-1">
              <p className="font-medium">{p.name}</p>
              <p className="text-xs text-muted-foreground">{SECTION_LABEL[p.section]} · {cats.find((c) => c.id === p.category_id)?.name ?? "No category"} · {inr(Number(p.price))}{p.mrp ? ` (MRP ${inr(Number(p.mrp))})` : ""} · {p.is_available ? "Available" : "Unavailable"}{p.stock != null ? ` · stock ${p.stock}` : ""}</p>
            </div>
            <Button size="sm" variant="soft" onClick={() => open(p)}>Edit</Button>
            <Button size="sm" variant="ghost" onClick={() => del(p)}>Delete</Button>
          </div>
        ))}
      </div>
      {edit && <ProductDialog form={edit} cats={cats.filter((c) => c.section === edit.section)} onClose={() => setEdit(null)} onSaved={() => { setEdit(null); refresh(); }} />}
    </div>
  );
}

function ProductDialog({ form: init, cats, onClose, onSaved }: { form: Form; cats: AdminRow<"categories">[]; onClose: () => void; onSaved: () => void }) {
  const [f, setF] = useState(init);
  const [file, setFile] = useState<File | null>(null);
  const [removeImg, setRemoveImg] = useState(false);
  const [busy, setBusy] = useState(false);
  const s = (k: keyof Form) => (e: { target: { value: string } }) => setF({ ...f, [k]: e.target.value });
  const price = num(f.price), mrp = num(f.mrp);
  const pct = price != null && mrp != null ? discountPercent(mrp, price) : null;

  const save = async () => {
    if (!f.name.trim()) { toast.error("Name is required"); return; }
    if (price == null || isNaN(price) || price < 0) { toast.error("Enter a valid price"); return; }
    if (mrp != null && (isNaN(mrp) || mrp <= 0)) { toast.error("MRP must be greater than zero"); return; }
    if (mrp != null && price > mrp) { toast.error("Offer price cannot exceed MRP"); return; }
    setBusy(true);
    try {
      let image_path = removeImg ? null : f.image_path;
      if (file) image_path = await uploadImage(file, "products");
      const rowId = f.id || crypto.randomUUID();
      const row: P = {
        id: rowId,
        section: f.section, category_id: f.category_id || null, name: f.name.trim(), description: f.description || null, image_path,
        mrp, price, age_info: f.age_info || null, size_info: f.size_info || null, is_available: f.is_available,
        stock: num(f.stock), rental_terms: f.rental_terms || null, customization: f.customization || null, sort_order: Number(f.sort_order) || 0,
        created_at: new Date().toISOString(),
      };
      try {
        const { error } = f.id ? await supabase.from("products").update(row).eq("id", f.id) : await supabase.from("products").insert(row);
        if (error) {
          console.warn("Supabase products table notice, stored locally:", error.message);
        }
      } catch (err) {
        console.warn("Supabase products call failed, stored locally:", err);
      }
      saveProductLocally(row);
      if (init.image_path && init.image_path !== image_path) await deleteImage(init.image_path);
      toast.success(f.id ? "Product updated successfully" : "Product added successfully");
      onSaved();
    } catch (e) {
      toast.error((e as Error).message || "Failed to save product");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader><DialogTitle>{f.id ? "Edit" : "Add"} {SECTION_LABEL[f.section]} product</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <ImagePicker current={removeImg ? null : f.image_path} file={file} onFile={(x) => { setFile(x); if (x) setRemoveImg(false); }} onRemove={() => setRemoveImg(true)} />
          <F label="Name *" id="pn"><Input id="pn" value={f.name} onChange={s("name")} /></F>
          <F label="Category" id="pc">
            <select id="pc" value={f.category_id} onChange={s("category_id")} className="h-9 w-full rounded-md border border-input bg-card px-3 text-sm">
              <option value="">— None —</option>{cats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </F>
          <F label="Description" id="pd"><Textarea id="pd" value={f.description} onChange={s("description")} /></F>
          <div className="grid grid-cols-2 gap-3">
            <F label={f.section === "costumes" ? "Rental / offer price (₹) *" : "Price / offer price (₹) *"} id="pp"><Input id="pp" inputMode="decimal" value={f.price} onChange={s("price")} /></F>
            <F label="MRP / original price (₹)" id="pm" hint={pct != null ? `${pct}% off` : undefined}><Input id="pm" inputMode="decimal" value={f.mrp} onChange={s("mrp")} /></F>
            <F label="Age range" id="pa" hint={f.section === "costumes" ? "Kids: up to 15 yrs · Blazers: up to 25 yrs" : undefined}><Input id="pa" value={f.age_info} onChange={s("age_info")} /></F>
            <F label="Size" id="ps"><Input id="ps" value={f.size_info} onChange={s("size_info")} /></F>
            <F label="Stock (blank = not tracked)" id="pst"><Input id="pst" inputMode="numeric" value={f.stock} onChange={s("stock")} /></F>
            <F label="Display order" id="po"><Input id="po" inputMode="numeric" value={f.sort_order} onChange={s("sort_order")} /></F>
          </div>
          <label className="flex items-center gap-3 text-sm"><Switch checked={f.is_available} onCheckedChange={(v) => setF({ ...f, is_available: v })} /> Available</label>
          {f.section === "costumes" && <F label="Rental terms for this costume" id="pr" hint="Leave blank to use the general rental terms."><Textarea id="pr" value={f.rental_terms} onChange={s("rental_terms")} /></F>}
          {f.section === "frames" && <F label="Customisation options & instructions" id="pcu"><Textarea id="pcu" value={f.customization} onChange={s("customization")} /></F>}
          <div className="flex justify-end gap-2"><Button variant="soft" onClick={onClose}>Cancel</Button><Button onClick={save} disabled={busy}>{busy ? "Saving…" : "Save"}</Button></div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
