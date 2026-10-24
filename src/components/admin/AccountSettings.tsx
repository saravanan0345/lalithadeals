import { useEffect, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { updateAdminCredentials } from "@/lib/admin.functions";
import { newPasswordSchema, usernameSchema } from "@/lib/credentials";

export function AccountSettings() {
  const nav = useNavigate();
  const cache = useQueryClient();
  const change = useServerFn(updateAdminCredentials);
  const [username, setUsername] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const { data } = useQuery({ queryKey: ["admin", "account"], queryFn: async () => {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (!error && user) {
        const profile = await supabase.from("profiles").select("display_name").eq("id", user.id).maybeSingle();
        return { id: user.id, username: user.email?.split("@")[0] ?? "lalithadeals", displayName: profile?.data?.display_name || "Owner" };
      }
    } catch {
      // fallback
    }
    return { id: "owner-id", username: "lalithadeals", displayName: "Lalitha / L Deals Owner" };
  } });
  useEffect(() => { if (data) { setUsername(data.username); setDisplayName(data.displayName); } }, [data]);
  async function saveProfile(e: React.FormEvent) {
    e.preventDefault();
    if (!data) return;
    setBusy(true);
    const result = await supabase.from("profiles").update({ display_name: displayName.trim(), updated_at: new Date().toISOString() }).eq("id", data.id);
    setBusy(false);
    if (result.error) toast.error("Could not save your profile.");
    else toast.success("Profile saved");
  }
  async function saveCredentials(e: React.FormEvent) {
    e.preventDefault(); setError("");
    if (!usernameSchema.safeParse(username).success) return setError("Username must be 3–32 characters: letters, numbers, dots, underscores or hyphens.");
    if (password && !newPasswordSchema.safeParse(password).success) return setError("Use 12–128 characters with uppercase, lowercase, a number and a symbol.");
    if (password !== confirm) return setError("New passwords do not match.");
    setBusy(true);
    try {
      await change({ data: { username, currentPassword, ...(password ? { newPassword: password } : {}) } });
      setCurrentPassword(""); setPassword(""); setConfirm("");
      await cache.cancelQueries(); cache.clear();
      await supabase.auth.signOut();
      toast.success("Login details changed. Sign in with your updated details.");
      await nav({ to: "/admin/login", replace: true });
    } catch (e) { setError(e instanceof Error ? e.message : "Could not change login details."); }
    finally { setBusy(false); }
  }
  return <div className="mt-8 grid gap-10 md:grid-cols-2">
    <form className="space-y-4" onSubmit={saveProfile}>
      <h2 className="text-lg font-medium">Profile</h2>
      <div className="space-y-2"><Label htmlFor="display-name">Display name</Label><Input id="display-name" value={displayName} onChange={(e) => setDisplayName(e.target.value)} maxLength={100} /></div>
      <Button disabled={busy || !data}>Save profile</Button>
    </form>
    <form className="space-y-4" onSubmit={saveCredentials}>
      <h2 className="text-lg font-medium">Login details</h2>
      <div className="space-y-2"><Label htmlFor="new-username">Username</Label><Input id="new-username" value={username} onChange={(e) => setUsername(e.target.value)} autoComplete="username" required minLength={3} maxLength={32} /></div>
      <div className="space-y-2"><Label htmlFor="current-password">Current password</Label><Input id="current-password" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} autoComplete="current-password" required /></div>
      <div className="space-y-2"><Label htmlFor="new-password">New password (optional)</Label><Input id="new-password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" aria-describedby="password-requirements" /><p id="password-requirements" className="text-xs text-muted-foreground">12–128 characters, uppercase, lowercase, number and symbol.</p></div>
      <div className="space-y-2"><Label htmlFor="confirm-password">Confirm new password</Label><Input id="confirm-password" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" required={!!password} /></div>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <Button disabled={busy || !data}>{busy ? "Saving…" : "Save login details"}</Button>
    </form>
  </div>;
}