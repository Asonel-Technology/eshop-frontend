import { useState, useEffect } from "react";
import { Routes, Route, useParams } from "react-router-dom";
import type { Product, Category, CartItem } from "./data";
import { isButcherCategory } from "./data";
import { getPublicSettings, getFeaturedItems, getCategories, PublicSettings } from "./services/api";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Shop from "./pages/Shop";
import ProductDetail from "./pages/ProductDetail";
import Checkout from "./pages/Checkout";
import MeatDepartment from "./pages/MeatDepartment";
import Wishlist from "./pages/Wishlist";
import AdminApp from "./pages/admin/AdminApp";
import { useI18n } from "./i18n/LanguageContext";

const CART_STORAGE_KEY = "blessingCart";
const WISHLIST_STORAGE_KEY = "blessingWishlist";

/** The cart is never persisted server-side, so a refresh would otherwise empty it. */
function readStoredCart(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function App() {
  const [cartOpen, setCartOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>(readStoredCart);
  const [wishlist, setWishlist] = useState<Set<string | number>>(() => {
    try {
      const raw = localStorage.getItem(WISHLIST_STORAGE_KEY);
      const parsed = raw ? JSON.parse(raw) : [];
      return new Set(Array.isArray(parsed) ? parsed : []);
    } catch {
      return new Set();
    }
  });
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(Array.from(wishlist)));
  }, [wishlist]);

  useEffect(() => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cartItems));
  }, [cartItems]);

  const [apiCategories, setApiCategories] = useState<Category[]>([]);
  const [apiFeatured, setApiFeatured] = useState<Product[]>([]);
  const [settings, setSettings] = useState<PublicSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { t } = useI18n();

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
        setError("load");
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
        <h2 className="font-serif text-xl font-bold mb-2">{t("app.errorTitle")}</h2>
        <p className="text-muted-foreground text-sm mb-6 text-center">{t("app.error")}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-primary text-white font-bold text-[11px] tracking-wider uppercase px-6 py-3 rounded-xl hover:bg-secondary transition-colors"
        >
          {t("app.retry")}
        </button>
      </div>
    );
  }

  function addToCart(product: Product, qty = 1, variant: { color?: string; size?: string } = {}) {
    const color = variant.color || undefined;
    const size = variant.size || undefined;

    setCartItems((prev) => {
      const existIdx = prev.findIndex((i) => i.id === product.id && i.color === color && i.size === size);
      if (existIdx >= 0) {
        const next = [...prev];
        next[existIdx] = { ...next[existIdx], qty: next[existIdx].qty + qty };
        return next;
      }
      return [...prev, { id: product.id, name: product.name, price: product.price, img: product.img, qty, color, size }];
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

        <Route path="/wishlist" element={
          <Wishlist
            ids={wishlist}
            onAddToCart={addToCart}
            onWishlist={toggleWishlist}
          />
        } />

        <Route path="/category/:slug" element={
          <CategorySwitch
            categories={apiCategories}
            onAddToCart={addToCart}
            onWishlist={toggleWishlist}
            wishlist={wishlist}
          />
        } />

        {["/shop", "/deals", "/new", "/bestsellers", "/categories"].map((path) => (
          <Route key={path} path={path} element={
            <Shop
              categories={apiCategories}
              onAddToCart={addToCart}
              onWishlist={toggleWishlist}
              wishlist={wishlist}
            />
          } />
        ))}
      </Route>
    </Routes>
  );
}

function CategorySwitch({
  categories,
  onAddToCart,
  onWishlist,
  wishlist,
}: {
  categories: Category[];
  onAddToCart: (p: Product, qty?: number, variant?: { color?: string; size?: string }) => void;
  onWishlist: (id: string | number) => void;
  wishlist: Set<string | number>;
}) {
  const { slug } = useParams();
  const category = categories.find((c) => c.slug === slug);

  if (category && isButcherCategory(category)) {
    return (
      <MeatDepartment
        category={category}
        onAddToCart={onAddToCart}
        onWishlist={onWishlist}
        wishlist={wishlist}
      />
    );
  }

  return (
    <Shop
      categories={categories}
      onAddToCart={onAddToCart}
      onWishlist={onWishlist}
      wishlist={wishlist}
    />
  );
}
