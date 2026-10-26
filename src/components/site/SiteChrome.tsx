import { Link } from "@tanstack/react-router";
import { ShoppingBag, MessageCircle, MapPin } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { catalogQuery } from "@/lib/queries";
import { Logo } from "./Logo";
import { useCart } from "@/lib/cart";
import { DEFAULT_ADDRESS, SHOP, WA_GREETING, directionsLink, mapsLink, waLink } from "@/lib/shop";

function useAddress() {
  const { data } = useQuery(catalogQuery);
  return data?.settings?.address || DEFAULT_ADDRESS;
}

function useMapsLink() {
  const { data } = useQuery(catalogQuery);
  return directionsLink(data?.settings);
}

export function SiteHeader() {
  const { count } = useCart();
  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/90 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-3 sm:px-4 sm:h-20">
        <Link to="/" aria-label="Lalitha Deals home" className="group">
          <Logo />
        </Link>
        <nav aria-label="Main" className="hidden items-center gap-7 text-sm font-bold text-muted-foreground md:flex">
          <a href="/#offers" className="hover:text-foreground">Offers</a>
          <a href="/#costumes" className="hover:text-foreground">Fancy Costumes</a>
          <a href="/#frames" className="hover:text-foreground">Photo Frames</a>
          <a href="/#gifts" className="hover:text-foreground">Gifts</a>
          <a href="/#google-reviews" className="hover:text-foreground">Reviews</a>
          <a href="/#contact" className="hover:text-foreground">Contact</a>
        </nav>
        <Link to="/cart" className="relative inline-flex h-9 sm:h-10 items-center gap-2 rounded-full border border-border bg-card px-3 sm:px-4 text-xs sm:text-sm font-bold shadow-soft hover:bg-muted" aria-label={`Cart, ${count} items`}>
          <ShoppingBag className="h-4 w-4" />
          <span className="hidden sm:inline">Cart</span>
          {count > 0 && <span className="grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1.5 text-xs font-semibold text-primary-foreground">{count}</span>}
        </Link>
      </div>
      <nav aria-label="Mobile Sections" className="flex items-center gap-2 overflow-x-auto no-scrollbar px-3 py-2 border-t border-border/40 md:hidden text-xs">
        <a href="/#offers" className="rounded-full bg-card border border-border/70 px-3 py-1 font-bold whitespace-nowrap shadow-soft text-foreground hover:bg-muted">Special Deals</a>
        <a href="/#costumes" className="rounded-full bg-card border border-border/70 px-3 py-1 font-bold whitespace-nowrap shadow-soft text-foreground hover:bg-muted">Fancy Costumes</a>
        <a href="/#frames" className="rounded-full bg-card border border-border/70 px-3 py-1 font-bold whitespace-nowrap shadow-soft text-foreground hover:bg-muted">Photo Frames</a>
        <a href="/#gifts" className="rounded-full bg-card border border-border/70 px-3 py-1 font-bold whitespace-nowrap shadow-soft text-foreground hover:bg-muted">Gifts</a>
        <a href="/#google-reviews" className="rounded-full bg-card border border-border/70 px-3 py-1 font-bold whitespace-nowrap shadow-soft text-foreground hover:bg-muted">Reviews</a>
      </nav>
    </header>
  );
}

export function SiteFooter() {
  const address = useAddress();
  const maps = useMapsLink();
  return (
    <footer className="mt-24 border-t border-border bg-ivory">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:grid-cols-3">
        <div>
          <Logo className="mb-3" />
          <p className="mt-2 text-sm text-muted-foreground">Rental fancy costumes, custom photo frames and thoughtful gifts.</p>
        </div>
        <div className="text-sm">
          <h3 className="font-semibold">Shop hours</h3>
          <ul className="mt-3 space-y-1 text-muted-foreground">{SHOP.hours.map((h) => <li key={h}>{h}</li>)}</ul>
        </div>
        <div className="text-sm">
          <h3 className="font-semibold">Contact</h3>
          <a className="mt-3 block text-muted-foreground hover:text-foreground" href={waLink(WA_GREETING)} target="_blank" rel="noreferrer">WhatsApp {SHOP.phoneDisplay}</a>
          <a className="mt-3 block whitespace-pre-line text-muted-foreground hover:text-foreground" href={maps} target="_blank" rel="noreferrer">{address}</a>
          <Link to="/admin" className="mt-6 block text-xs text-muted-foreground/70 hover:text-foreground">Admin</Link>
        </div>
      </div>
      <p className="pb-8 text-center text-xs text-muted-foreground">© {new Date().getFullYear()} Lalitha / L Deals</p>
    </footer>
  );
}

export function WhatsAppFab() {
  const maps = mapsLink(useAddress());
  return (
    <>
    <a href={maps} target="_blank" rel="noreferrer" aria-label="Get Directions" title="Get Directions"
      className="fixed bottom-[4.75rem] right-4 z-50 inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-lavender text-accent-foreground shadow-lift transition-transform hover:scale-105 sm:bottom-[6.25rem] sm:right-8 sm:h-14 sm:w-14"
      style={{ marginBottom: "env(safe-area-inset-bottom)" }}>
      <MapPin className="h-5 w-5 sm:h-6 sm:w-6" />
    </a>
    <a href={waLink(WA_GREETING)} target="_blank" rel="noreferrer" aria-label="Chat with us on WhatsApp"
      className="fixed bottom-4 right-4 z-50 inline-flex h-12 w-12 items-center justify-center rounded-full bg-whatsapp text-whatsapp-foreground shadow-lift transition-transform hover:scale-105 sm:bottom-8 sm:right-8 sm:h-14 sm:w-14"
      style={{ marginBottom: "env(safe-area-inset-bottom)" }}>
      <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6" />
    </a>
    </>
  );
}
