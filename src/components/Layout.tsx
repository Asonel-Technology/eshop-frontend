import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Header from "./Header";
import Cart from "./Cart";
import ChatWidget from "./ChatWidget";
import type { CartItem, Category } from "../data";

interface LayoutProps {
  cartItems: CartItem[];
  wishlistCount: number;
  cartOpen: boolean;
  setCartOpen: (open: boolean) => void;
  removeFromCart: (index: number) => void;
  updateQty: (index: number, qty: number) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  categories?: Category[];
}

export default function Layout({
  cartItems,
  wishlistCount,
  cartOpen,
  setCartOpen,
  removeFromCart,
  updateQty,
  searchQuery,
  setSearchQuery,
  categories = []
}: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const cartCount = cartItems.reduce((s, i) => s + i.qty, 0);

  // Derive mobile tab from location
  let mobileTab = "home";
  if (location.pathname.startsWith("/categories")) mobileTab = "categories";
  else if (location.pathname.startsWith("/shop")) mobileTab = "shop";
  // Wishlist tab logic would go here if there was a dedicated route for it

  function handleSearchSubmit() {
    if (!searchQuery.trim()) return;
    navigate(`/shop?q=${encodeURIComponent(searchQuery)}`);
  }

  return (
    <div className="min-h-full bg-background text-foreground">
      <Header
        cartCount={cartCount}
        wishlistCount={wishlistCount}
        onCartOpen={() => setCartOpen(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onSearchSubmit={handleSearchSubmit}
        categories={categories}
      />

      <main>
        <Outlet />
      </main>

      {/* Cart Drawer */}
      {cartOpen && (
        <Cart
          items={cartItems}
          onClose={() => setCartOpen(false)}
          onRemove={removeFromCart}
          onUpdateQty={updateQty}
          onCheckout={() => { setCartOpen(false); navigate("/checkout"); }}
        />
      )}

      <ChatWidget />

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-background/97 backdrop-blur-md border-t border-border">
        <div className="grid grid-cols-4">
          {[
            { key: "home", icon: "🏠", label: "Home", path: "/" },
            { key: "categories", icon: "☰", label: "Categories", path: "/categories" },
            { key: "shop", icon: "🛍️", label: "Shop", path: "/shop" },
            { key: "wishlist", icon: "❤️", label: "Wishlist", path: "/wishlist" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => { window.scrollTo({ top: 0, behavior: "smooth" }); navigate(tab.path); }}
              className={`flex flex-col items-center gap-0.5 py-3 text-[9px] font-bold tracking-[0.1em] uppercase transition-colors ${mobileTab === tab.key ? "text-primary" : "text-muted-foreground"}`}
            >
              <span className="text-base">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
        {/* Cart FAB */}
        <button
          onClick={() => setCartOpen(true)}
          className="absolute -top-5 left-1/2 -translate-x-1/2 bg-primary text-white w-11 h-11 rounded-full flex items-center justify-center shadow-lg hover:bg-secondary transition-colors"
          style={{ left: "calc(50% + 0px)" }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-white text-primary text-[9px] font-bold rounded-full flex items-center justify-center">{cartCount}</span>
          )}
        </button>
      </nav>

      {/* Mobile nav spacer */}
      <div className="h-16 lg:hidden" />
    </div>
  );
}
