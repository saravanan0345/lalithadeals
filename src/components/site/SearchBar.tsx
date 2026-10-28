import { useState, useRef, useEffect, useMemo } from "react";
import { Link } from "@tanstack/react-router";
import { Search, X, ImageOff } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { catalogQuery, type Product } from "@/lib/queries";
import { SECTION_LABEL, imageUrl, inr, type ShopSection } from "@/lib/shop";

export function SearchBar({ className = "" }: { className?: string }) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data } = useQuery(catalogQuery);
  const products = data?.products || [];
  const categories = data?.categories || [];

  const catMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const c of categories) {
      map.set(c.id, c.name);
    }
    return map;
  }, [categories]);

  // Click outside listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Filter and rank products
  const searchResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    type ScoredProduct = { product: Product; score: number };
    const scored: ScoredProduct[] = [];

    for (const p of products) {
      const name = p.name.toLowerCase();
      const words = name.split(/\s+/);
      const catName = p.category_id ? (catMap.get(p.category_id) || "").toLowerCase() : "";
      const secLabel = (SECTION_LABEL[p.section as ShopSection] || "").toLowerCase();
      const desc = (p.description || "").toLowerCase();

      // Priority 1: Name starts exactly with query (e.g. typing "p" matches "Police costume" first)
      if (name.startsWith(q)) {
        scored.push({ product: p, score: 1 });
      }
      // Priority 2: Any word in the title starts with the query (e.g. "Baby Krishna" matches "k")
      else if (words.some((w) => w.startsWith(q))) {
        scored.push({ product: p, score: 2 });
      }
      // Priority 3: Title contains the query substring
      else if (name.includes(q)) {
        scored.push({ product: p, score: 3 });
      }
      // Priority 4: Category name or Section label matches
      else if (catName.includes(q) || secLabel.includes(q)) {
        scored.push({ product: p, score: 4 });
      }
      // Priority 5: Description contains the query
      else if (desc.includes(q)) {
        scored.push({ product: p, score: 5 });
      }
    }

    // Sort by score ascending, then by availability, then name
    scored.sort((a, b) => {
      if (a.score !== b.score) return a.score - b.score;
      const aAvail = a.product.is_available ? 1 : 0;
      const bAvail = b.product.is_available ? 1 : 0;
      if (aAvail !== bAvail) return bAvail - aAvail;
      return a.product.name.localeCompare(b.product.name);
    });

    return scored.map((s) => s.product);
  }, [query, products, catMap]);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Input pill */}
      <div className="relative flex items-center">
        <Search className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => {
            if (query.trim()) setIsOpen(true);
          }}
          placeholder="Search costumes, frames, gifts..."
          className="h-9 w-full rounded-full border border-border bg-card/90 pl-9 pr-8 text-xs sm:text-sm text-foreground shadow-soft placeholder:text-muted-foreground/70 transition-all focus:border-primary focus:bg-card focus:outline-none focus:ring-2 focus:ring-primary/20"
          aria-label="Search products"
        />
        {query && (
          <button
            type="button"
            onClick={() => {
              setQuery("");
              setIsOpen(false);
              inputRef.current?.focus();
            }}
            className="absolute right-2.5 flex h-5 w-5 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && query.trim().length > 0 && (
        <div className="absolute left-0 right-0 top-full mt-2 z-50 max-h-[70vh] w-full min-w-[280px] sm:min-w-[340px] overflow-hidden rounded-2xl border-2 border-border bg-card/95 p-2 shadow-lift backdrop-blur-md">
          <div className="px-2.5 py-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground border-b border-border/50 flex justify-between items-center">
            <span>Products</span>
            <span className="text-[10px] font-normal lowercase">{searchResults.length} found</span>
          </div>

          <div className="mt-1 max-h-[58vh] overflow-y-auto no-scrollbar space-y-1">
            {searchResults.length === 0 ? (
              <div className="px-3 py-6 text-center text-xs text-muted-foreground">
                <p>No products found for "{query}"</p>
                <p className="mt-1 text-[11px] opacity-75">Try checking for typos or search by category.</p>
              </div>
            ) : (
              searchResults.slice(0, 8).map((p) => {
                const img = imageUrl(p.image_path);
                const categoryName = p.category_id ? catMap.get(p.category_id) : SECTION_LABEL[p.section as ShopSection];
                const available = p.is_available && (p.stock == null || p.stock > 0);

                return (
                  <Link
                    key={p.id}
                    to="/product/$id"
                    params={{ id: p.id }}
                    onClick={() => {
                      setIsOpen(false);
                      setQuery("");
                    }}
                    className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-muted/70 group"
                  >
                    {/* Thumbnail */}
                    <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-muted/60 flex items-center justify-center">
                      {img ? (
                        <img src={img} alt={p.name} className="h-full w-full object-contain p-1" />
                      ) : (
                        <ImageOff className="h-4 w-4 text-muted-foreground opacity-40" />
                      )}
                    </div>

                    {/* Details */}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs sm:text-sm font-bold text-foreground truncate group-hover:text-primary transition-colors">
                        {p.name}
                      </p>
                      <div className="flex items-center gap-2 text-[10px] text-muted-foreground">
                        <span className="font-semibold uppercase tracking-wider text-primary/80 truncate">
                          {categoryName || p.section}
                        </span>
                        <span>•</span>
                        <span className={available ? "text-success font-medium" : "text-destructive font-medium"}>
                          {available ? "In Stock" : "Unavailable"}
                        </span>
                      </div>
                    </div>

                    {/* Price */}
                    <div className="text-right shrink-0">
                      <span className="text-xs sm:text-sm font-black text-foreground">
                        {inr(p.price)}
                      </span>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}
