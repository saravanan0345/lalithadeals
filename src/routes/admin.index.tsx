import { createFileRoute, Navigate, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { useAdminStatus } from "@/lib/admin";
import { ProductsAdmin } from "@/components/admin/ProductsAdmin";
import { CategoriesAdmin } from "@/components/admin/CategoriesAdmin";
import { OffersAdmin } from "@/components/admin/OffersAdmin";
import { OrdersAdmin } from "@/components/admin/OrdersAdmin";
import { SettingsAdmin } from "@/components/admin/SettingsAdmin";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Admin dashboard — Lalitha / L Deals" },
      { name: "description", content: "Manage products, offers and orders." },
      { property: "og:title", content: "Admin dashboard — Lalitha / L Deals" },
      { property: "og:description", content: "Manage products, offers and orders." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Admin,
});

function Admin() {
  const cache = useQueryClient();
  const nav = useNavigate();
  const signOut = async () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("lalitha_admin_session");
    }
    await cache.cancelQueries(); cache.clear();
    await supabase.auth.signOut();
    await nav({ to: "/admin/login", replace: true });
  };
  const status = useAdminStatus();
  if (status === "loading") return <p className="px-4 py-24 text-center text-muted-foreground">Loading…</p>;
  if (status === "signedout") return <Navigate to="/admin/login" />;
  if (status === "forbidden")
    return (
      <div className="px-4 py-24 text-center">
        <p>This account doesn't have admin access.</p>
        <Button variant="soft" className="mt-4" onClick={signOut}>Sign out</Button>
      </div>
    );
  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Admin dashboard</h1>
        <div className="flex items-center gap-4"><Link to="/admin/settings" className="text-sm underline underline-offset-4">Admin Settings</Link><Button variant="soft" size="sm" onClick={signOut}>Sign out</Button></div>
      </div>
      <Tabs defaultValue="products" className="mt-6">
        <TabsList className="flex-wrap">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="offers">Offers</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="settings">Business info</TabsTrigger>
        </TabsList>
        <TabsContent value="products"><ProductsAdmin /></TabsContent>
        <TabsContent value="categories"><CategoriesAdmin /></TabsContent>
        <TabsContent value="offers"><OffersAdmin /></TabsContent>
        <TabsContent value="orders"><OrdersAdmin /></TabsContent>
        <TabsContent value="settings"><SettingsAdmin /></TabsContent>
      </Tabs>
    </div>
  );
}
