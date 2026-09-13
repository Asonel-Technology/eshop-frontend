import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate, Link, useSearchParams } from "react-router-dom";
import type { Product, Category } from "../data";
import { getItems, GetItemsParams } from "../services/api";
import ProductCard from "../components/ProductCard";

interface ShopProps {
  categories?: Category[];
  onAddToCart: (p: Product) => void;
  onWishlist: (id: string | number) => void;
  wishlist: Set<string | number>;
}

export default function Shop({ categories = [], onAddToCart, onWishlist, wishlist }: ShopProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const searchQuery = searchParams.get("q") || "";
  
  let pageId = "shop";
  if (location.pathname.includes("/deals")) pageId = "deals";
  else if (location.pathname.includes("/new")) pageId = "new";
  else if (location.pathname.includes("/bestsellers")) pageId = "bestsellers";
  else if (location.pathname.includes("/categories")) pageId = "categories";
  else if (location.pathname.includes("/category/")) pageId = "category";

  const category = categories.find((c) => c.slug === slug);

  const [items, setItems] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Search/Filter state
  const [activeCategory, setActiveCategory] = useState<string>("all");

  // Handle URL changes
  useEffect(() => {
    if (slug) {
      setActiveCategory(slug);
    } else {
      setActiveCategory("all");
    }
  }, [slug]);

  // Load items from backend based on filters
  useEffect(() => {
    async function loadShopItems() {
      setLoading(true);
      setError(null);
      try {
        const query: any = {};
        if (activeCategory !== "all") query.categorySlug = activeCategory;
        const querySearch = searchParams.get("q");
        if (querySearch) query.search = querySearch;
        
        const data = await getItems(query);
        setItems(data.items);
        setTotal(data.total);
      } catch (err) {
        console.error("Failed to load shop items", err);
        setError("Unable to load products. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    loadShopItems();
  }, [activeCategory, searchParams]);

  const pageTitles: Record<string, string> = {
    shop: searchQuery ? `Results for "${searchQuery}"` : "All Products",
    deals: "Deals & Promotions 🔥",
    new: "New Arrivals ✨",
    bestsellers: "Best Sellers ⭐",
    categories: "All Categories",
  };

  const title = pageId === "category" ? category?.name : pageTitles[pageId] || "Products";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-20">
      {/* Category Banner */}
      {pageId === "category" && category && (
        <>
          <div className="relative rounded-2xl overflow-hidden mb-8 h-48">
            <img src={category.img} alt={category.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent flex items-center px-8">
              <div>
                <p className="text-white/60 text-[11px] font-bold tracking-wider uppercase mb-1">Category</p>
                <h1 className="font-serif text-3xl font-bold text-white">{category.name}</h1>
                <p className="text-white/60 text-sm mt-1">{total} products</p>
              </div>
            </div>
          </div>
          <nav className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-6">
            <Link to="/" className="hover:text-foreground">Home</Link>
            <span>/</span>
            <span className="text-foreground font-medium">{category.name}</span>
          </nav>
        </>
      )}

      {pageId !== "category" && (
        <div className="mb-6">
          <h1 className="font-serif text-2xl sm:text-3xl font-bold">{title}</h1>
          <p className="text-muted-foreground text-[13px] mt-1">{total} products</p>
        </div>
      )}

      {loading ? (
        <div className="py-20 flex justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : error ? (
        <div className="py-20 text-center bg-white rounded-2xl border border-red-200">
          <p className="text-red-500 font-bold mb-2">{error}</p>
          <button onClick={() => window.location.reload()} className="text-[12px] underline text-muted-foreground hover:text-foreground">Retry</button>
        </div>
      ) : items.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onAddToCart={onAddToCart}
              onWishlist={onWishlist}
              onView={() => navigate(`/product/${p.id}`)}
              wishlisted={wishlist.has(p.id)}
            />
          ))}
        </div>
      ) : (
        <div className="py-20 text-center text-muted-foreground">
          No products found.
        </div>
      )}
    </div>
  );
}
