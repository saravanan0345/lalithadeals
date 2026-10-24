import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { MAX_QTY } from "./pricing";

export type CartItem = { productId: string; qty: number };
type Ctx = {
  items: CartItem[];
  count: number;
  add: (id: string, qty?: number) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
};
const CartContext = createContext<Ctx | null>(null);
const KEY = "lalitha-cart-v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    try { setItems(JSON.parse(localStorage.getItem(KEY) || "[]")); } catch { /* ignore */ }
    setLoaded(true);
  }, []);
  useEffect(() => { if (loaded) localStorage.setItem(KEY, JSON.stringify(items)); }, [items, loaded]);

  const clamp = (n: number) => Math.max(1, Math.min(MAX_QTY, Math.floor(n) || 1));
  const value: Ctx = {
    items,
    count: items.reduce((s, i) => s + i.qty, 0),
    add: (id, qty = 1) => setItems((cur) => {
      const ex = cur.find((i) => i.productId === id);
      return ex ? cur.map((i) => (i.productId === id ? { ...i, qty: clamp(i.qty + qty) } : i)) : [...cur, { productId: id, qty: clamp(qty) }];
    }),
    setQty: (id, qty) => setItems((cur) => cur.map((i) => (i.productId === id ? { ...i, qty: clamp(qty) } : i))),
    remove: (id) => setItems((cur) => cur.filter((i) => i.productId !== id)),
    clear: () => setItems([]),
  };
  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const c = useContext(CartContext);
  if (!c) throw new Error("useCart outside CartProvider");
  return c;
}
