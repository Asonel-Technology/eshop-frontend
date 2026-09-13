import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { Category } from "../data";

interface HeaderProps {
  cartCount: number;
  wishlistCount: number;
  onCartOpen: () => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onSearchSubmit: () => void;
  categories?: Category[];
}

export default function Header({
  cartCount,
  wishlistCount,
  onCartOpen,
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  categories = [],
}: HeaderProps) {
  const navigate = useNavigate();
  const [megaOpen, setMegaOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const megaRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (megaRef.current && !megaRef.current.contains(e.target as Node)) setMegaOpen(false);
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const popularSearches = ["Fresh Chicken", "Sneakers", "Wireless Earbuds", "Chef Knife", "Smart Watch", "Yoga Mat"];

  return (
    <header className="sticky top-0 z-50 bg-background shadow-sm shadow-black/5">
      {/* Announcement bar */}
      <div className="bg-secondary text-secondary-foreground text-center py-2 px-4 text-[10px] font-bold tracking-[0.2em] uppercase">
        Fast Delivery &nbsp;·&nbsp; Secure Payment &nbsp;·&nbsp; Shop Across Rwanda
      </div>

      {/* Main header */}
      <div className="border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
          {/* Logo */}
          <Link
            to="/"
            className="flex-shrink-0 flex flex-col leading-none"
          >
            <span className="font-serif text-2xl font-bold tracking-tight text-foreground">Blessing</span>
            <span className="text-[8px] tracking-[0.2em] uppercase text-primary font-bold hidden sm:block">Your Online Marketplace</span>
          </Link>

          {/* Search — desktop */}
          <div className="flex-1 hidden md:block max-w-2xl relative" ref={undefined}>
            <div className={`flex border rounded-xl overflow-hidden transition-all ${searchFocused ? "border-primary shadow-sm shadow-primary/20" : "border-border"}`}>
              <input
                ref={searchRef}
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onFocus={() => setSearchFocused(true)}
                onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                onKeyDown={(e) => e.key === "Enter" && onSearchSubmit()}
                placeholder="Search products, categories and brands..."
                className="flex-1 px-4 py-2.5 text-[13px] outline-none bg-background"
              />
              <button
                onClick={onSearchSubmit}
                className="bg-primary text-white px-4 flex items-center gap-1.5 hover:bg-secondary transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
                <span className="text-[11px] font-bold tracking-wider uppercase hidden lg:block">Search</span>
              </button>
            </div>

            {/* Search dropdown */}
            {searchFocused && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-card border border-border rounded-xl shadow-xl shadow-black/12 py-3 z-50">
                <p className="px-4 py-1 text-[10px] font-bold tracking-wider uppercase text-muted-foreground">Popular Searches</p>
                {popularSearches.map((s) => (
                  <button
                    key={s}
                    onMouseDown={() => { onSearchChange(s); onSearchSubmit(); }}
                    className="w-full text-left px-4 py-2 text-[13px] hover:bg-muted flex items-center gap-2"
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-muted-foreground">
                      <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                    </svg>
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right actions */}
          <div className="flex items-center gap-1 ml-auto md:ml-0">
            {/* Mobile search */}
            <button className="md:hidden p-2.5 hover:text-primary transition-colors rounded-lg hover:bg-muted">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
            </button>

            <button className="hidden sm:flex p-2.5 hover:text-primary transition-colors rounded-lg hover:bg-muted relative">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              {wishlistCount > 0 && (
                <span className="absolute top-0.5 right-0.5 w-4 h-4 bg-primary text-white text-[9px] font-bold rounded-full flex items-center justify-center">{wishlistCount}</span>
              )}
            </button>

            <button
              onClick={onCartOpen}
              className="p-2.5 hover:text-primary transition-colors rounded-lg hover:bg-muted relative"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
              {cartCount > 0 && (
                <span className="absolute -top-0.5 right-0.5 w-4 h-4 bg-primary text-white text-[9px] font-bold rounded-full flex items-center justify-center">{cartCount}</span>
              )}
            </button>

            {/* Mobile hamburger */}
            <button onClick={() => setMenuOpen(!menuOpen)} className="lg:hidden p-2.5 rounded-lg hover:bg-muted">
              <div className="flex flex-col gap-1.5 w-5">
                <span className="block h-px bg-foreground" />
                <span className="block h-px bg-foreground" />
                <span className="block h-px bg-foreground w-3/4" />
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Nav bar */}
      <div className="hidden lg:block border-b border-border bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-10 flex items-center gap-6">
          {/* Categories mega menu trigger */}
          <div ref={megaRef} className="relative">
            <button
              onClick={() => setMegaOpen(!megaOpen)}
              className={`flex items-center gap-1.5 text-[11px] font-bold tracking-[0.1em] uppercase h-10 px-3 border-b-2 transition-all ${megaOpen ? "border-primary text-primary" : "border-transparent hover:text-primary"}`}
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="12" x2="21" y2="12" /><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="18" x2="21" y2="18" />
              </svg>
              Categories
            </button>

            {megaOpen && (
              <div className="absolute top-full left-0 mt-0 w-[680px] bg-card border border-border shadow-2xl shadow-black/15 rounded-b-2xl py-6 px-6 z-50 grid grid-cols-4 gap-4">
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/category/${cat.slug}`}
                    onClick={() => setMegaOpen(false)}
                    className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-muted transition-colors text-center group"
                  >
                    <div className="w-12 h-12 rounded-xl overflow-hidden bg-muted">
                      <img src={cat.img} alt={cat.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                    </div>
                    <div>
                      <p className="text-[11px] font-semibold leading-tight">{cat.name}</p>
                      <p className="text-[9px] text-muted-foreground">{cat.count}+ items</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {[
            { label: "Home", page: "/" },
            { label: "Deals 🔥", page: "/deals" },
            { label: "New Arrivals", page: "/new" },
            { label: "Best Sellers", page: "/bestsellers" },
          ].map((link) => (
            <Link
              key={link.label}
              to={link.page}
              className="text-[11px] font-semibold tracking-[0.1em] uppercase text-muted-foreground hover:text-foreground h-10 px-1 border-b-2 border-transparent hover:border-foreground transition-all flex items-center"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="lg:hidden bg-card border-t border-border">
          <div className="px-4 py-3 border-b border-border">
            <div className="flex border border-border rounded-xl overflow-hidden">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && onSearchSubmit()}
                placeholder="Search products..."
                className="flex-1 px-3 py-2.5 text-sm outline-none bg-background"
              />
              <button onClick={onSearchSubmit} className="bg-primary text-white px-3">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
                </svg>
              </button>
            </div>
          </div>
          {[
            { label: "Home", page: "/" },
            { label: "All Categories", page: "/categories" },
            { label: "Deals 🔥", page: "/deals" },
            { label: "New Arrivals", page: "/new" },
            { label: "Best Sellers", page: "/bestsellers" },
          ].map((link) => (
            <Link
              key={link.label}
              to={link.page}
              onClick={() => setMenuOpen(false)}
              className="flex items-center justify-between w-full px-5 py-3.5 text-sm font-semibold text-muted-foreground hover:text-foreground hover:bg-muted border-b border-border/40 transition-colors"
            >
              {link.label}
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
              </svg>
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
