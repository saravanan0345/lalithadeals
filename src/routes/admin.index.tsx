import { createFileRoute, Navigate, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { LogOut, Settings as SettingsIcon } from "lucide-react";
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
    await cache.cancelQueries();
    cache.clear();
    await supabase.auth.signOut();
    await nav({ to: "/admin/login", replace: true });
  };

  const status = useAdminStatus();
  if (status === "loading") return <p className="px-4 py-24 text-center text-muted-foreground">Loading…</p>;
  if (status === "signedout") return <Navigate to="/admin/login" />;
  if (status === "forbidden")
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <p className="text-lg font-bold">This account doesn't have admin access.</p>
        <Button variant="candy" className="mt-4" onClick={signOut}>Sign out</Button>
      </div>
    );

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Admin dashboard</h1>
          <p className="text-xs text-muted-foreground mt-0.5">Manage costumes, custom photo frames, gifts, offers & orders</p>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm" className="rounded-full">
            <Link to="/admin/settings" className="flex items-center gap-1.5">
              <SettingsIcon className="h-3.5 w-3.5" />
              Credentials
            </Link>
          </Button>
          <Button variant="outline" size="sm" className="rounded-full" onClick={signOut}>
            <LogOut className="h-3.5 w-3.5 mr-1" />
            Sign out
          </Button>
        </div>
      </div>

      <Tabs defaultValue="products" className="space-y-6">
        <TabsList className="h-auto flex-wrap gap-1.5 rounded-full bg-muted/80 p-1.5">
          <TabsTrigger
            value="products"
            className="rounded-full px-5 py-2 text-sm font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-soft"
          >
            Products
          </TabsTrigger>
          <TabsTrigger
            value="offers"
            className="rounded-full px-5 py-2 text-sm font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-soft"
          >
            Special Deals
          </TabsTrigger>
          <TabsTrigger
            value="categories"
            className="rounded-full px-5 py-2 text-sm font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-soft"
          >
            Categories
          </TabsTrigger>
          <TabsTrigger
            value="orders"
            className="rounded-full px-5 py-2 text-sm font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-soft"
          >
            Orders
          </TabsTrigger>
          <TabsTrigger
            value="settings"
            className="rounded-full px-5 py-2 text-sm font-bold data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-soft"
          >
            Shop details
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <ProductsAdmin />
        </TabsContent>
        <TabsContent value="offers">
          <OffersAdmin />
        </TabsContent>
        <TabsContent value="categories">
          <CategoriesAdmin />
        </TabsContent>
        <TabsContent value="orders">
          <OrdersAdmin />
        </TabsContent>
        <TabsContent value="settings">
          <SettingsAdmin />
        </TabsContent>
      </Tabs>
    </div>
  );
}
