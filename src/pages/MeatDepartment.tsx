import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { Category, Product } from "../data";
import { getItems } from "../services/api";
import ProductCard from "../components/ProductCard";

interface MeatDepartmentProps {
  category: Category;
  onAddToCart: (p: Product, qty: number, variant: string) => void;
  onWishlist: (id: string | number) => void;
  wishlist: Set<string | number>;
}

export default function MeatDepartment({ category, onAddToCart, onWishlist, wishlist }: MeatDepartmentProps) {
  const navigate = useNavigate();
  const [activeSubcat, setActiveSubcat] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Derive subcategories from the backend category object
  const subcategories = category?.subcategories || [];

  useEffect(() => {
    // If there are subcategories and none is selected, select the first one automatically
    if (subcategories.length > 0 && !activeSubcat) {
      setActiveSubcat(subcategories[0].slug);
    }
  }, [subcategories, activeSubcat]);

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      setError(null);
      try {
        const query: any = { categorySlug: category.slug };
        if (activeSubcat) {
          query.subcategorySlug = activeSubcat;
        }
        
        const data = await getItems(query);
        setProducts(data.items as Product[]);
      } catch (err) {
        console.error("Failed to load meat products", err);
        setError("Unable to load products. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    
    if (activeSubcat || subcategories.length === 0) {
       loadProducts();
    }
  }, [category.slug, activeSubcat, subcategories.length]);

  return (
    <div className="bg-[#FAF9F8] min-h-screen pb-20">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <nav className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider uppercase text-muted-foreground">
          <Link to="/" className="hover:text-foreground transition-colors">Home</Link>
          <span>/</span>
          <Link to="/categories" className="hover:text-foreground transition-colors">Food & Groceries</Link>
          <span>/</span>
          <span className="text-primary">{category.name}</span>
        </nav>
      </div>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-12">
        <div className="relative rounded-3xl overflow-hidden bg-foreground text-background h-[300px] md:h-[400px] flex items-center">
          {/* Subtle overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent z-10" />
          
          {/* Premium Meat Background Image */}
          <img 
            src="https://images.unsplash.com/photo-1603048297172-c92544798d5e?q=80&w=2070&auto=format&fit=crop" 
            alt="Blessing Butcher Background" 
            className="absolute inset-0 w-full h-full object-cover opacity-80 mix-blend-overlay"
          />

          <div className="relative z-20 px-8 md:px-16 max-w-2xl">
            <h1 className="font-serif text-4xl md:text-6xl font-bold mb-4 text-white">Blessing Butcher</h1>
            <p className="text-lg md:text-xl text-gray-300 font-medium tracking-wide">
              Fresh, premium cuts for every meal. Delivered straight from our local butchers to your kitchen.
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Navigation */}
        <div className="mb-10">
          <h2 className="font-serif text-2xl font-bold mb-6 text-foreground">Choose your cut</h2>
          
          {subcategories.length > 0 ? (
            <div className="flex overflow-x-auto hide-scrollbar gap-3 pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
              {subcategories.map((sub: any) => {
                const isActive = activeSubcat === sub.slug;
                return (
                  <button
                    key={sub.id}
                    onClick={() => setActiveSubcat(sub.slug)}
                    className={`flex-shrink-0 px-8 py-4 rounded-2xl border-2 font-bold text-[13px] tracking-wider uppercase transition-all whitespace-nowrap ${
                      isActive 
                        ? "border-primary bg-primary text-white shadow-md" 
                        : "border-border bg-white text-muted-foreground hover:border-primary/50 hover:text-foreground"
                    }`}
                  >
                    {sub.name}
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="bg-white p-6 rounded-2xl border border-border text-center text-muted-foreground text-sm">
              No specific cuts available yet.
            </div>
          )}
        </div>

        {/* Product Grid */}
        <div className="mb-6 flex justify-between items-end border-b border-border pb-4">
          <h3 className="font-serif text-xl font-bold">
            {activeSubcat ? subcategories.find((s: any) => s.slug === activeSubcat)?.name : "All Products"}
          </h3>
          <span className="text-[12px] font-bold text-muted-foreground">{products.length} Items</span>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="py-20 text-center bg-white rounded-2xl border border-red-200">
            <p className="text-red-500 font-bold mb-2">{error}</p>
            <button onClick={() => window.location.reload()} className="text-[12px] underline text-muted-foreground hover:text-foreground">Retry</button>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={(p) => onAddToCart(p, 1, "")}
                onWishlist={onWishlist}
                onView={() => navigate(`/product/${product.id}`)}
                wishlisted={wishlist.has(product.id)}
              />
            ))}
          </div>
        ) : (
          <div className="py-20 text-center bg-white rounded-2xl border border-border">
            <p className="text-4xl mb-3">🥩</p>
            <p className="font-semibold mb-1">No products found</p>
            <p className="text-[12px] text-muted-foreground">We are restocking our butcher counter soon.</p>
          </div>
        )}
      </div>
    </div>
  );
}
