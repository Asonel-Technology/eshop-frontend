import { useState } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import Header from "./Header";
import Cart from "./Cart";
import ChatWidget from "./ChatWidget";
import type { CartItem, Category } from "../data";
import { useI18n } from "../i18n/LanguageContext";

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
  const { t } = useI18n();
  const cartCount = cartItems.reduce((s, i) => s + i.qty, 0);

  // Derive mobile tab from location
  let mobileTab = "home";
  if (location.pathname.startsWith("/categories")) mobileTab = "categories";
  else if (location.pathname.startsWith("/shop")) mobileTab = "shop";
  else if (location.pathname.startsWith("/wishlist")) mobileTab = "wishlist";

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
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-50 bg-background border-t border-border">
        <div className="grid grid-cols-4">
          {[
            { key: "home", label: t("nav.home"), path: "/" },
            { key: "categories", label: t("nav.categories"), path: "/categories" },
            { key: "shop", label: t("nav.shop"), path: "/shop" },
            { key: "wishlist", label: t("nav.saved"), path: "/wishlist" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => { window.scrollTo({ top: 0, behavior: "smooth" }); navigate(tab.path); }}
              className={`flex items-center justify-center py-3.5 text-[11px] font-medium transition-colors ${mobileTab === tab.key ? "text-primary" : "text-muted-foreground"}`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </nav>

      {/* Mobile nav spacer */}
      <div className="h-16 lg:hidden" />
    </div>
  );
}
