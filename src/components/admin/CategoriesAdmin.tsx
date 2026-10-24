import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { SECTION_LABEL } from "@/lib/shop";
import { deleteCategoryLocally, saveCategoryLocally, useAdminTable, useRefresh, type AdminRow } from "./shared";

type Section = AdminRow<"categories">["section"];

export function CategoriesAdmin() {
  const { data: cats = [] } = useAdminTable("categories");
  const refresh = useRefresh();
  const [name, setName] = useState("");
  const [section, setSection] = useState<Section>("costumes");

  const add = async () => {
    if (!name.trim()) return;
    const newCat: AdminRow<"categories"> = {
      id: crypto.randomUUID(),
      name: name.trim(),
      section,
      sort_order: cats.length + 1,
      created_at: new Date().toISOString(),
    };
    try {
      const { error } = await supabase.from("categories").insert({ name: name.trim(), section, sort_order: cats.length + 1 });
      if (error) {
        console.warn("Supabase categories insert notice, saving locally:", error.message);
      }
    } catch (err) {
      console.warn("Supabase categories insert error, saving locally:", err);
    }
    saveCategoryLocally(newCat);
    setName("");
    toast.success("Category added");
    refresh();
  };

  const rename = async (c: AdminRow<"categories">) => {
    const n = prompt("Category name", c.name);
    if (!n?.trim()) return;
    const updated = { ...c, name: n.trim() };
    try {
      await supabase.from("categories").update({ name: n.trim() }).eq("id", c.id);
    } catch {
      // ignore
    }
    saveCategoryLocally(updated);
    toast.success("Category renamed");
    refresh();
  };

  const del = async (c: AdminRow<"categories">) => {
    if (!confirm(`Delete category "${c.name}"? Products stay but lose this category.`)) return;
    try {
      await supabase.from("categories").delete().eq("id", c.id);
    } catch {
      // ignore
    }
    deleteCategoryLocally(c.id);
    toast.success("Category deleted");
    refresh();
  };

  return (
    <div className="mt-4 space-y-6">
      <div className="flex flex-wrap gap-2 rounded-2xl border border-border bg-card p-4">
        <Input placeholder="New category name" value={name} onChange={(e) => setName(e.target.value)} className="max-w-xs" aria-label="New category name" />
        <select value={section} onChange={(e) => setSection(e.target.value as Section)} className="h-9 rounded-md border border-input bg-card px-3 text-sm" aria-label="Section">
          {(Object.keys(SECTION_LABEL) as Section[]).map((s) => <option key={s} value={s}>{SECTION_LABEL[s]}</option>)}
        </select>
        <Button variant="candy" onClick={add}>+ Add category</Button>
      </div>
      {(Object.keys(SECTION_LABEL) as Section[]).map((s) => (
        <div key={s}>
          <h3 className="mb-2 font-medium">{SECTION_LABEL[s]}</h3>
          <div className="divide-y divide-border rounded-2xl border border-border bg-card">
            {cats.filter((c) => c.section === s).map((c) => (
              <div key={c.id} className="flex items-center gap-2 p-3">
                <span className="flex-1">{c.name}</span>
                <Button size="sm" variant="soft" onClick={() => rename(c)}>Rename</Button>
                <Button size="sm" variant="ghost" onClick={() => del(c)}>Delete</Button>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
