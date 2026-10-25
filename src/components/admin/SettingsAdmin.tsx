import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { deleteImage, uploadImage } from "@/lib/admin";
import heroDefault from "@/assets/hero.jpg";
import { F, ImagePicker, useRefresh } from "./shared";

const FIELDS = [
  ["address", "Shop address (shown in contact, footer and directions)"],
  ["maps_link", "Google Maps pin link (optional — used for the Get Directions buttons; leave blank to search by address)"],
  ["about", "About the shop"],
  ["rental_terms", "General costume rental terms (duration, returns)"],
  ["deposit_info", "Deposit information"],
  ["delivery_info", "Delivery information (areas, charges)"],
  ["frame_instructions", "Custom photo frame instructions"],
] as const;
type Key = (typeof FIELDS)[number][0];

export function SettingsAdmin() {
  const refresh = useRefresh();
  const { data, refetch } = useQuery({
    queryKey: ["admin", "settings"],
    queryFn: async () => {
      if (typeof window !== "undefined") {
        try {
          const raw = localStorage.getItem("lalitha_local_settings");
          if (raw) return JSON.parse(raw);
        } catch {}
      }
      try {
        const res = await supabase.from("settings").select("*").eq("id", 1).maybeSingle();
        if (res.data) return res.data;
      } catch (e) {
        console.warn("Could not load settings:", e);
      }
      return {
        id: 1,
        address: "3/237, Sri Kamatchi street, Padmavati Nagar, Iyyappanthangal near oil mill road",
        maps_link: "https://maps.app.goo.gl/JE4r246QNFvA5oed6",
        about: "Fancy costume rentals, custom photo frames and thoughtful gifts for every celebration.",
        rental_terms: "Rental costumes for children below 15 years old, plus blazers below 25 years old.",
        deposit_info: "Standard security deposit required at pickup.",
        delivery_info: "Store pickup available at Iyyappanthangal. Home delivery available on request.",
        frame_instructions: "Personalised frames made for your favourite moments.",
        hero_image_path: null,
        hero_alt: "Costumes on a rack beside a gift box and photo frame",
        updated_at: new Date().toISOString(),
      };
    },
  });
  const [f, setF] = useState<Record<Key, string>>({ about: "", address: "", maps_link: "", rental_terms: "", deposit_info: "", delivery_info: "", frame_instructions: "" });
  const [alt, setAlt] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [removeImg, setRemoveImg] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (!data) return;
    setF(Object.fromEntries(FIELDS.map(([k]) => [k, data[k] ?? ""])) as Record<Key, string>);
    setAlt(data.hero_alt ?? "");
  }, [data]);

  const save = async () => {
    setBusy(true);
    try {
      const old = data?.hero_image_path ?? null;
      let hero_image_path = removeImg ? null : old;
      if (file) hero_image_path = await uploadImage(file, "hero");
      const row = Object.fromEntries(FIELDS.map(([k]) => [k, f[k].trim() || null]));
      try {
        const { error } = await supabase.from("settings")
          .update({ ...row, hero_image_path, hero_alt: alt.trim() || null, updated_at: new Date().toISOString() }).eq("id", 1);
        if (error) {
          console.warn("Supabase settings update notice, saving locally:", error.message);
        }
      } catch (err) {
        console.warn("Supabase settings call error, saving locally:", err);
      }
      if (typeof window !== "undefined") {
        localStorage.setItem("lalitha_local_settings", JSON.stringify({ ...data, ...row, hero_image_path, hero_alt: alt.trim() || null }));
      }
      if (old && old !== hero_image_path) await deleteImage(old);
      setFile(null); setRemoveImg(false);
      toast.success("Settings saved successfully"); refresh(); refetch();
    } catch (e) { toast.error((e as Error).message || "Failed to save settings"); } finally { setBusy(false); }
  };

  const current = removeImg ? null : data?.hero_image_path ?? null;
  return (
    <div className="mt-4 space-y-4 rounded-2xl border border-border bg-card p-6">
      <section className="space-y-3 border-b border-border pb-6">
        <h3 className="font-medium">Homepage main image</h3>
        <ImagePicker current={current} file={file} onFile={(x) => { setFile(x); if (x) setRemoveImg(false); }} onRemove={() => setRemoveImg(true)} />
        {!current && !file && (
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <img src={heroDefault} alt="" className="h-12 w-16 rounded object-cover" /> The default image will be shown.
          </div>
        )}
        <F label="Image description (alt text)" id="halt"><Input id="halt" value={alt} onChange={(e) => setAlt(e.target.value)} /></F>
      </section>
      <p className="text-sm text-muted-foreground">Anything left blank is hidden on the website.</p>
      {FIELDS.map(([k, label]) => (
        <F key={k} label={label} id={k}><Textarea id={k} value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} /></F>
      ))}
      <Button onClick={save} disabled={busy}>{busy ? "Saving…" : "Save"}</Button>
    </div>
  );
}
