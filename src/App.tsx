import { useState, useEffect } from "react";
import { Routes, Route } from "react-router-dom";
import type { Product, Category, CartItem } from "./data";
import { getPublicSettings, getFeaturedItems, getCategories, PublicSettings } from "./services/api";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Checkout from "./pages/Checkout";
import MeatDepartment from "./pages/MeatDepartment";
import AdminApp from "./pages/admin/AdminApp";

export default function App() {
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<Set<string | number>>(new Set());
  const [searchQuery, setSearchQuery] = useState("");

  const [apiCategories, setApiCategories] = useState<Category[]>([]);
  const [apiFeatured, setApiFeatured] = useState<Product[]>([]);
  const [settings, setSettings] = useState<PublicSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadInitialData() {
      try {
        setError(null);
        const [settingsData, featuredData, productCats, foodCats] = await Promise.all([
          getPublicSettings(),
          getFeaturedItems(),
          getCategories("PRODUCT"),
          getCategories("FOOD")
        ]);
        setSettings(settingsData);
        setApiFeatured([...featuredData.products, ...featuredData.foods]);
        setApiCategories([...productCats, ...foodCats]);
      } catch (err) {
        console.error("Failed to load backend data:", err);
        setError("Unable to connect to the store. Please try again.");
      } finally {
        setIsLoading(false);
      }
    }
    loadInitialData();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="text-red-500 mb-4">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>
        <h2 className="font-serif text-xl font-bold mb-2">Something went wrong</h2>
        <p className="text-muted-foreground text-sm mb-6 text-center">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-primary text-white font-bold text-[11px] tracking-wider uppercase px-6 py-3 rounded-xl hover:bg-secondary transition-colors"
        >
          Try Again
        </button>
      </div>
    );
  }

  function addToCart(product: Product, qty = 1, variant = "") {
    setCartItems((prev) => {
      const existIdx = prev.findIndex((i) => i.id === product.id && i.variant === variant);
      if (existIdx >= 0) {
        const next = [...prev];
        next[existIdx] = { ...next[existIdx], qty: next[existIdx].qty + qty };
        return next;
      }
      return [...prev, { id: product.id, name: product.name, price: product.price, img: product.img, qty, variant }];
    });
    setCartOpen(true);
  }

  function removeFromCart(index: number) {
    setCartItems((prev) => prev.filter((_, i) => i !== index));
  }

  function updateQty(index: number, qty: number) {
    setCartItems((prev) => prev.map((item, i) => i === index ? { ...item, qty } : item));
  }

  function toggleWishlist(id: string | number) {
    setWishlist((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  }

  return (
    <Routes>
      <Route path="/admin/*" element={<AdminApp onExit={() => window.location.href = '/'} />} />
      <Route element={
        <Layout 
          cartItems={cartItems} 
          wishlistCount={wishlist.size} 
          cartOpen={cartOpen} 
          setCartOpen={setCartOpen} 
          removeFromCart={removeFromCart} 
          updateQty={updateQty} 
          searchQuery={searchQuery} 
          setSearchQuery={setSearchQuery} 
          categories={apiCategories}
        />
      }>
        <Route path="/" element={
          <Home
            categories={apiCategories}
            featuredItems={apiFeatured}
            onAddToCart={addToCart}
            onWishlist={toggleWishlist}
            wishlist={wishlist}
          />
        } />
        
        <Route path="/product/:id" element={
          <ProductDetail
            onAddToCart={addToCart}
            onWishlist={toggleWishlist}
            wishlist={wishlist}
          />
        } />

        <Route path="/checkout" element={
          <Checkout
            items={cartItems}
            settings={settings}
            onClearCart={() => setCartItems([])}
          />
        } />

        <Route path="/category/meat" element={
          <MeatDepartment
            category={apiCategories.find(c => c.slug === "meat") || { id: "meat", name: "Meat", slug: "meat", count: 0 } as any}
            onAddToCart={addToCart}
            onWishlist={toggleWishlist}
            wishlist={wishlist}
          />
        } />

        <Route path="/category/:slug" element={
          <Shop
            onAddToCart={addToCart}
            onWishlist={toggleWishlist}
            wishlist={wishlist}
          />
        } />

        <Route path="/shop" element={
          <Shop
            onAddToCart={addToCart}
            onWishlist={toggleWishlist}
            wishlist={wishlist}
          />
        } />
      </Route>
    </Routes>
  );
}
