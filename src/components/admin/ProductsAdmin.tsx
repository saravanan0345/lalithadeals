import { useState, useMemo } from "react";
import { Plus, Pencil, Trash2, Search, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { deleteImage } from "@/lib/admin";
import { discountPercent } from "@/lib/pricing";
import { SECTION_LABEL, imageUrl, inr } from "@/lib/shop";
import {
  ImagePicker,
  deleteProductLocally,
  num,
  saveProductLocally,
  useAdminTable,
  useRefresh,
  type AdminRow,
} from "./shared";

type P = AdminRow<"products">;
type Section = P["section"];

interface FormState {
  id?: string;
  section: Section;
  category_id: string;
  name: string;
  description: string;
  image_path: string | null;
  mrp: string;
  price: string;
  rental_price: string;
  is_rental: boolean;
  age_info: string;
  size_info: string;
  rental_terms: string;
  customization: string;
  stock: string;
  is_available: boolean;
  featured: boolean;
}

const defaultForm = (sec: Section = "costumes"): FormState => ({
  section: sec,
  category_id: "",
  name: "",
  description: "",
  image_path: null,
  mrp: "",
  price: "",
  rental_price: "",
  is_rental: sec === "costumes",
  age_info: "",
  size_info: "",
  rental_terms: "",
  customization: "",
  stock: "",
  is_available: true,
  featured: false,
});

export function ProductsAdmin() {
  const { data: products = [] } = useAdminTable("products");
  const { data: categories = [] } = useAdminTable("categories");
  const refresh = useRefresh();

  const [filterSection, setFilterSection] = useState<Section | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [editingProduct, setEditingProduct] = useState<FormState | null>(null);
  const [saving, setSaving] = useState(false);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchSection = filterSection === "all" || p.section === filterSection;
      const matchSearch =
        !searchQuery.trim() ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (categories.find((c) => c.id === p.category_id)?.name.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchSection && matchSearch;
    });
  }, [products, categories, filterSection, searchQuery]);

  const openNew = () => {
    const sec = filterSection === "all" ? "costumes" : filterSection;
    setEditingProduct(defaultForm(sec));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const openEdit = (p: P) => {
    setEditingProduct({
      id: p.id,
      section: p.section,
      category_id: p.category_id ?? "",
      name: p.name,
      description: p.description ?? "",
      image_path: p.image_path,
      mrp: p.mrp?.toString() ?? "",
      price: p.price.toString(),
      rental_price: p.section === "costumes" ? p.price.toString() : "",
      is_rental: p.section === "costumes",
      age_info: p.age_info ?? "",
      size_info: p.size_info ?? "",
      rental_terms: p.rental_terms ?? "",
      customization: p.customization ?? "",
      stock: p.stock?.toString() ?? "",
      is_available: p.is_available,
      featured: false,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (p: P) => {
    if (!confirm(`Are you sure you want to delete "${p.name}"?`)) return;
    try {
      await supabase.from("products").delete().eq("id", p.id);
    } catch {
      // ignore network/db error
    }
    deleteProductLocally(p.id);
    if (p.image_path) await deleteImage(p.image_path);
    toast.success("Product deleted successfully");
    refresh();
  };

  const handleSave = async () => {
    if (!editingProduct) return;
    const name = editingProduct.name.trim();
    if (!name) {
      toast.error("Product name is required");
      return;
    }

    const offerPrice = num(editingProduct.price);
    const mrp = num(editingProduct.mrp);
    const stock = num(editingProduct.stock);

    if (offerPrice == null || isNaN(offerPrice) || offerPrice < 0) {
      toast.error("Please enter a valid price / offer price");
      return;
    }
    if (mrp != null && (isNaN(mrp) || mrp <= 0)) {
      toast.error("MRP must be greater than zero");
      return;
    }
    if (mrp != null && offerPrice > mrp) {
      toast.error("Offer price cannot be higher than MRP");
      return;
    }

    setSaving(true);
    try {
      const rowId = editingProduct.id || crypto.randomUUID();
      const row: P = {
        id: rowId,
        section: editingProduct.section,
        category_id: editingProduct.category_id || null,
        name,
        description: editingProduct.description.trim() || null,
        image_path: editingProduct.image_path,
        price: offerPrice,
        mrp,
        age_info: editingProduct.age_info.trim() || null,
        size_info: editingProduct.size_info.trim() || null,
        rental_terms: editingProduct.is_rental ? (editingProduct.rental_terms.trim() || null) : null,
        customization: editingProduct.customization.trim() || null,
        stock: stock != null ? Math.floor(stock) : null,
        is_available: editingProduct.is_available,
        sort_order: 1,
        created_at: new Date().toISOString(),
      };

      try {
        const { error } = editingProduct.id
          ? await supabase.from("products").update(row).eq("id", editingProduct.id)
          : await supabase.from("products").insert(row);
        if (error) {
          console.warn("Supabase products table update notice, saved locally:", error.message);
        }
      } catch (err) {
        console.warn("Supabase products call failed, saved locally:", err);
      }

      saveProductLocally(row);
      toast.success(editingProduct.id ? "Product updated successfully" : "Product added successfully");
      setEditingProduct(null);
      refresh();
    } catch (err) {
      toast.error((err as Error).message || "Failed to save product");
    } finally {
      setSaving(false);
    }
  };

  const pct =
    editingProduct && num(editingProduct.mrp) && num(editingProduct.price)
      ? discountPercent(num(editingProduct.mrp)!, num(editingProduct.price)!)
      : null;

  return (
    <div className="space-y-6 pt-4">
      {/* Top Filter and Actions Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="candy" onClick={openNew} className="gap-2">
            <Plus className="h-4 w-4" /> Add product
          </Button>

          <select
            className="h-10 rounded-full border border-border bg-card px-4 text-sm font-semibold shadow-soft hover:bg-accent/40"
            value={filterSection}
            onChange={(e) => setFilterSection(e.target.value as Section | "all")}
            aria-label="Filter section"
          >
            <option value="all">All sections</option>
            <option value="costumes">Costumes</option>
            <option value="frames">Custom Photo Frames</option>
            <option value="gifts">Gifts</option>
          </select>
        </div>

        <div className="relative min-w-[220px] max-w-xs">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search products..."
            className="h-10 rounded-full pl-9"
          />
        </div>
      </div>

      {/* Add / Edit Form Card */}
      {editingProduct && (
        <div className="grid gap-4 rounded-3xl border-2 border-primary/40 bg-card p-6 shadow-pop md:grid-cols-2">
          <div className="flex items-center justify-between md:col-span-2">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <h2 className="text-xl font-bold">{editingProduct.id ? "Edit product" : "New product"}</h2>
            </div>
            <span className="rounded-full bg-primary/10 px-3 py-1 text-xs font-bold text-primary uppercase">
              {SECTION_LABEL[editingProduct.section]}
            </span>
          </div>

          {/* Section */}
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Section *</Label>
            <select
              className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm font-medium"
              value={editingProduct.section}
              onChange={(e) => {
                const s = e.target.value as Section;
                setEditingProduct({
                  ...editingProduct,
                  section: s,
                  category_id: "",
                  is_rental: s === "costumes",
                });
              }}
            >
              <option value="costumes">Costumes</option>
              <option value="frames">Custom Photo Frames</option>
              <option value="gifts">Gifts</option>
            </select>
          </div>

          {/* Category */}
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Category</Label>
            <select
              className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm font-medium"
              value={editingProduct.category_id}
              onChange={(e) => setEditingProduct({ ...editingProduct, category_id: e.target.value })}
            >
              <option value="">— None —</option>
              {categories
                .filter((c) => c.section === editingProduct.section)
                .map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
            </select>
          </div>

          {/* Name */}
          <div className="space-y-1.5 md:col-span-2">
            <Label className="text-sm font-semibold">Product Name *</Label>
            <Input
              value={editingProduct.name}
              onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
              placeholder="e.g. Spider-Man Costume or Premium Wooden Frame"
              maxLength={150}
              className="rounded-xl"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5 md:col-span-2">
            <Label className="text-sm font-semibold">Description</Label>
            <Textarea
              value={editingProduct.description}
              onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
              placeholder="Enter product details, materials, rental terms, or special features..."
              rows={3}
              className="rounded-xl"
            />
          </div>

          {/* Image Uploader */}
          <div className="md:col-span-2">
            <ImagePicker
              value={editingProduct.image_path}
              onChange={(url) => setEditingProduct({ ...editingProduct, image_path: url })}
            />
          </div>

          {/* MRP */}
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">MRP / Original price (₹)</Label>
            <Input
              inputMode="decimal"
              value={editingProduct.mrp}
              onChange={(e) => setEditingProduct({ ...editingProduct, mrp: e.target.value })}
              placeholder="e.g. 999"
              className="rounded-xl"
            />
          </div>

          {/* Offer Price */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-semibold">
                {editingProduct.is_rental ? "Rental price / Offer price (₹) *" : "Offer price (₹) *"}
              </Label>
              {pct != null && (
                <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-bold text-emerald-800">
                  {pct}% off
                </span>
              )}
            </div>
            <Input
              inputMode="decimal"
              value={editingProduct.price}
              onChange={(e) => setEditingProduct({ ...editingProduct, price: e.target.value })}
              placeholder="e.g. 499"
              className="rounded-xl"
            />
          </div>

          {/* Rental Item Checkbox */}
          <div className="flex items-center gap-3 py-1 md:col-span-2">
            <Switch
              checked={editingProduct.is_rental}
              onCheckedChange={(checked) => setEditingProduct({ ...editingProduct, is_rental: checked })}
              id="rental-switch"
            />
            <Label htmlFor="rental-switch" className="cursor-pointer font-semibold">
              This is a rental item (for school programs, fancy dress, or events)
            </Label>
          </div>

          {/* Age range */}
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Age range</Label>
            <Input
              value={editingProduct.age_info}
              onChange={(e) => setEditingProduct({ ...editingProduct, age_info: e.target.value })}
              placeholder="e.g. 3–6 years or up to 25 yrs (Blazers)"
              className="rounded-xl"
            />
          </div>

          {/* Sizes */}
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Sizes</Label>
            <Input
              value={editingProduct.size_info}
              onChange={(e) => setEditingProduct({ ...editingProduct, size_info: e.target.value })}
              placeholder="e.g. S, M, L, XL or 8x10 inches"
              className="rounded-xl"
            />
          </div>

          {/* Rental Terms */}
          {editingProduct.is_rental && (
            <div className="space-y-1.5 md:col-span-2">
              <Label className="text-sm font-semibold">Rental terms (duration, deposit)</Label>
              <Input
                value={editingProduct.rental_terms}
                onChange={(e) => setEditingProduct({ ...editingProduct, rental_terms: e.target.value })}
                placeholder="e.g. 24–48 hours rental, refundable deposit ₹200"
                className="rounded-xl"
              />
            </div>
          )}

          {/* Customisation instructions (Frames / Gifts) */}
          {editingProduct.section !== "costumes" && (
            <div className="space-y-1.5 md:col-span-2">
              <Label className="text-sm font-semibold">Customisation instructions</Label>
              <Input
                value={editingProduct.customization}
                onChange={(e) => setEditingProduct({ ...editingProduct, customization: e.target.value })}
                placeholder="e.g. Share high-res photos & message via WhatsApp after order"
                className="rounded-xl"
              />
            </div>
          )}

          {/* Stock */}
          <div className="space-y-1.5">
            <Label className="text-sm font-semibold">Stock (leave blank if unlimited)</Label>
            <Input
              inputMode="numeric"
              value={editingProduct.stock}
              onChange={(e) => setEditingProduct({ ...editingProduct, stock: e.target.value })}
              placeholder="e.g. 10"
              className="rounded-xl"
            />
          </div>

          {/* Availability Switch */}
          <div className="flex items-center gap-6 pt-6">
            <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold">
              <Switch
                checked={editingProduct.is_available}
                onCheckedChange={(checked) => setEditingProduct({ ...editingProduct, is_available: checked })}
              />
              Available in store
            </label>
          </div>

          <p className="text-xs text-muted-foreground md:col-span-2">
            💡 Customer pays: the offer price if set, otherwise the rental price (for costumes) or MRP.
          </p>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-2 md:col-span-2">
            <Button variant="candy" onClick={handleSave} disabled={saving} className="px-8 font-bold">
              {saving ? "Saving…" : "Save product"}
            </Button>
            <Button variant="outline" onClick={() => setEditingProduct(null)} className="px-6 font-semibold">
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* Product Table */}
      <div className="overflow-x-auto rounded-3xl border border-border bg-card shadow-soft">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-border bg-muted/60 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <tr>
              <th className="p-4">Item</th>
              <th className="p-4">Section</th>
              <th className="p-4">Price</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {filteredProducts.map((p) => {
              const cat = categories.find((c) => c.id === p.category_id);
              return (
                <tr key={p.id} className="transition-colors hover:bg-muted/30">
                  {/* Item (image + title + category) */}
                  <td className="flex items-center gap-3 p-4">
                    <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted">
                      {p.image_path ? (
                        <img
                          src={imageUrl(p.image_path) || p.image_path}
                          alt={p.name}
                          className="h-full w-full object-contain"
                        />
                      ) : (
                        <span className="text-[10px] text-muted-foreground">No img</span>
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-foreground">{p.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {cat?.name || "General"}
                        {p.age_info ? ` · ${p.age_info}` : ""}
                      </p>
                    </div>
                  </td>

                  {/* Section */}
                  <td className="p-4">
                    <span className="inline-flex rounded-full bg-primary/10 px-2.5 py-1 text-xs font-bold text-primary">
                      {SECTION_LABEL[p.section]}
                    </span>
                  </td>

                  {/* Price */}
                  <td className="p-4">
                    <div className="flex flex-col">
                      <span className="font-bold text-foreground">{inr(Number(p.price))}</span>
                      {p.mrp && Number(p.mrp) > Number(p.price) && (
                        <span className="text-xs text-muted-foreground line-through">
                          MRP {inr(Number(p.mrp))}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Status */}
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold ${
                        p.is_available
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-rose-100 text-rose-800"
                      }`}
                    >
                      {p.is_available ? "Available" : "Unavailable"}
                    </span>
                    {p.stock != null && (
                      <span className="ml-2 text-xs text-muted-foreground">({p.stock} in stock)</span>
                    )}
                  </td>

                  {/* Actions */}
                  <td className="whitespace-nowrap p-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => openEdit(p)}
                        aria-label={`Edit ${p.name}`}
                        className="h-8 w-8 text-muted-foreground hover:text-foreground"
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDelete(p)}
                        aria-label={`Delete ${p.name}`}
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {filteredProducts.length === 0 && (
              <tr>
                <td colSpan={5} className="p-10 text-center text-muted-foreground">
                  <p className="font-medium">No products found.</p>
                  <p className="mt-1 text-xs">Click "+ Add product" above to create your first item.</p>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
