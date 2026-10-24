import { createFileRoute, Link, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";
import { AccountSettings } from "@/components/admin/AccountSettings";

export const Route = createFileRoute("/admin/settings")({
  ssr: false,
  beforeLoad: async () => {
    if (typeof window !== "undefined" && localStorage.getItem("lalitha_admin_session") === "true") {
      return;
    }
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw redirect({ to: "/admin/login" });
    const role = await supabase.rpc("has_role", { _user_id: user.id, _role: "admin" });
    if (role.error || !role.data) throw redirect({ to: "/admin/login" });
  },
  head: () => ({ meta: [
    { title: "Admin Settings — Lalitha / L Deals" },
    { name: "description", content: "Private owner profile and login settings for Lalitha / L Deals." },
    { property: "og:title", content: "Admin Settings — Lalitha / L Deals" },
    { property: "og:description", content: "Private owner profile and login settings for Lalitha / L Deals." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
    { name: "robots", content: "noindex" },
  ] }),
  component: () => <div className="mx-auto max-w-4xl px-4 py-10"><Link to="/admin" className="text-sm text-muted-foreground">← Admin dashboard</Link><h1 className="mt-4 text-2xl font-semibold">Admin Settings</h1><AccountSettings /></div>,
});