import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";

export function DemoDashboard() {
  const [products, setProducts] = useState<string[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [editing, setEditing] = useState(false);
  const [saved, setSaved] = useState(false);
  return <div className="mx-auto max-w-6xl px-4 py-10">
    <div className="mb-6 border-l-4 border-primary bg-muted p-4" role="status">
      <p className="font-semibold">DEMO / PREVIEW ONLY</p>
      <p className="mt-1 text-sm text-muted-foreground">No real customer or order data. Changes are temporary and reset when this page closes.</p>
    </div>
    <div className="flex flex-wrap items-center justify-between gap-4">
      <h1 className="text-2xl font-semibold">Admin dashboard</h1>
      <Button variant="soft" size="sm" asChild><Link to="/admin/login">Exit demo</Link></Button>
    </div>
    <Tabs defaultValue="products" className="mt-6">
      <TabsList className="h-auto flex-wrap justify-start">
        {([ ["products", "Products"], ["categories", "Categories"], ["offers", "Offers"], ["orders", "Orders"], ["business", "Business info"], ["account", "Admin Settings"] ] as const).map(([value, label]) => <TabsTrigger key={value} value={value}>{label}</TabsTrigger>)}
      </TabsList>
      <TabsContent value="products" className="mt-4">
        <div className="flex flex-wrap justify-between gap-3"><div className="flex flex-wrap gap-2">{["All", "Costumes", "Photo Frames", "Gifts"].map(label => <Button key={label} size="sm" variant="soft" onClick={() => setSaved(false)}>{label}</Button>)}</div><Button size="sm" onClick={() => { setName(""); setEditing(true); }}>Add product</Button></div>
        <div className="mt-4 divide-y divide-border">{products.length === 0 ? <p className="py-6 text-sm text-muted-foreground">No demo products yet.</p> : products.map((product, index) => <div key={index} className="flex items-center justify-between gap-4 py-4"><p>{product}</p><Button variant="ghost" size="sm" onClick={() => setProducts(products.filter((_, i) => i !== index))}>Delete</Button></div>)}</div>
      </TabsContent>
      <TabsContent value="categories" className="mt-4">
        <form className="flex max-w-lg flex-wrap items-end gap-3" onSubmit={e => { e.preventDefault(); if (!category.trim()) return; setCategories([...categories, category.trim()]); setCategory(""); }}><div className="min-w-0 flex-1 space-y-2"><Label htmlFor="demo-category">Category name</Label><Input id="demo-category" value={category} onChange={e => setCategory(e.target.value)} required /></div><Button type="submit">Add category</Button></form>
        {categories.map((item, index) => <p key={index} className="border-b border-border py-4">{item}</p>)}
      </TabsContent>
      <TabsContent value="offers"><p className="py-6 text-sm text-muted-foreground">No demo offers.</p><Button variant="soft" disabled>Add offer</Button></TabsContent>
      <TabsContent value="orders"><p className="py-6 text-sm text-muted-foreground">No demo orders. Real orders are not connected.</p></TabsContent>
      <TabsContent value="business" className="max-w-xl space-y-4 py-4">
        <div className="space-y-2"><Label htmlFor="demo-shop">Shop name</Label><Input id="demo-shop" defaultValue="Lalitha / L Deals" /></div>
        <div className="space-y-2"><Label htmlFor="demo-address">Address</Label><Input id="demo-address" defaultValue="1, Sri Kamatchi St, Padmavathi Nagar, Iyyappanthangal, Tamil Nadu 600077, India" /></div>
        <Button onClick={() => setSaved(true)}>Save demo changes</Button>{saved && <p role="status" className="text-sm text-muted-foreground">Saved for this preview only.</p>}
      </TabsContent>
      <TabsContent value="account" className="max-w-xl space-y-4 py-4">
        <h2 className="text-lg font-semibold">Admin Settings</h2>
        <div className="space-y-2"><Label htmlFor="demo-username">Username</Label><Input id="demo-username" defaultValue="lalithadeals" disabled /></div>
        <p className="text-sm text-muted-foreground">Credential changes require the real owner account. Demo mode cannot change login details.</p>
        <Button disabled>Change credentials</Button>
      </TabsContent>
    </Tabs>
    <Dialog open={editing} onOpenChange={setEditing}><DialogContent><DialogHeader><DialogTitle>Add demo product</DialogTitle><DialogDescription>Temporary preview item. No shop data will be changed.</DialogDescription></DialogHeader><form className="space-y-4" onSubmit={e => { e.preventDefault(); if (!name.trim()) return; setProducts([...products, name.trim()]); setEditing(false); }}><div className="space-y-2"><Label htmlFor="demo-product">Product name</Label><Input id="demo-product" value={name} onChange={e => setName(e.target.value)} required /></div><Button type="submit">Save demo product</Button></form></DialogContent></Dialog>
  </div>;
}