import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import type { Category, Product } from "../data";
import { getItems } from "../services/api";
import ProductCard from "../components/ProductCard";
import { useI18n } from "../i18n/LanguageContext";

interface MeatDepartmentProps {
  category: Category;
  onAddToCart: (p: Product) => void;
  onWishlist: (id: string | number) => void;
  wishlist: Set<string | number>;
}

export default function MeatDepartment({ category, onAddToCart, onWishlist, wishlist }: MeatDepartmentProps) {
  const navigate = useNavigate();
  const { t, catalog } = useI18n();
  const [activeSubcat, setActiveSubcat] = useState<string | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const cuts = category?.subcategories || [];
  const heroImage = category.imageUrl || category.img ||
    "https://images.unsplash.com/photo-1603048297172-c92544798d5e?q=80&w=2070&auto=format&fit=crop";

  useEffect(() => {
    setActiveSubcat(category.subcategories?.[0]?.slug ?? null);
  }, [category.id, category.slug]);

  useEffect(() => {
    async function loadProducts() {
      setLoading(true);
      setError(null);
      try {
        const query: { categorySlug: string; subcategorySlug?: string } = { categorySlug: category.slug };
        if (activeSubcat) query.subcategorySlug = activeSubcat;
        const data = await getItems(query);
        setProducts(data.items as Product[]);
      } catch (err) {
        console.error("Failed to load butcher", err);
        setError("load");
      } finally {
        setLoading(false);
      }
    }

    if (activeSubcat || cuts.length === 0) {
      loadProducts();
    }
  }, [category.slug, activeSubcat, cuts.length]);

  return (
    <div className="bg-[#FAF9F8] min-h-screen pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <nav className="flex items-center gap-1.5 text-[11px] font-bold tracking-wider uppercase text-muted-foreground">
          <Link to="/" className="hover:text-foreground transition-colors">{t("nav.home")}</Link>
          <span>/</span>
          <span className="text-primary">{t("cat.butcher")}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-12">
        <div className="relative rounded-3xl overflow-hidden bg-foreground text-background h-[300px] md:h-[400px] flex items-center">
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/50 to-transparent z-10" />
          <img
            src={heroImage}
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-80 mix-blend-overlay"
          />
          <div className="relative z-20 px-8 md:px-16 max-w-2xl">
            <p className="text-[10px] font-bold tracking-[0.25em] uppercase text-primary mb-3">Blessing</p>
            <h1 className="font-serif text-4xl md:text-6xl font-bold mb-4 text-white">{t("butcher.title")}</h1>
            <p className="text-lg md:text-xl text-gray-300 font-medium tracking-wide">
              {t("butcher.sub")}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="mb-10">
          <h2 className="font-serif text-2xl font-bold mb-6 text-foreground">{t("butcher.choose")}</h2>

          {cuts.length > 0 ? (
            <div className="flex overflow-x-auto hide-scrollbar gap-3 pb-4 -mx-4 px-4 sm:mx-0 sm:px-0">
              {cuts.map((cut) => {
                const isActive = activeSubcat === cut.slug;
                return (
                  <button
                    key={cut.id}
                    onClick={() => setActiveSubcat(cut.slug)}
                    className={`flex-shrink-0 px-6 py-3 rounded-xl border font-semibold text-[12px] tracking-wider uppercase transition-colors whitespace-nowrap ${
                      isActive
                        ? "border-primary bg-primary text-white"
                        : "border-border bg-white text-muted-foreground hover:border-primary hover:text-foreground"
                    }`}
                  >
                    {catalog(cut.slug, cut.name)}
                  </button>
                );
              })}
            </div>
          ) : (
            <p className="text-muted-foreground text-sm">{t("butcher.noCuts")}</p>
          )}
        </div>

        <div className="mb-6 flex justify-between items-end border-b border-border pb-4">
          <h3 className="font-serif text-xl font-bold">
            {activeSubcat ? catalog(activeSubcat, cuts.find((s) => s.slug === activeSubcat)?.name) : t("butcher.allCuts")}
          </h3>
          <span className="text-[12px] font-bold text-muted-foreground">
            {t(products.length === 1 ? "shop.itemOne" : "shop.itemMany", { n: products.length })}
          </span>
        </div>

        {loading ? (
          <div className="py-20 flex justify-center">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : error ? (
          <div className="py-20 text-center">
            <p className="text-red-600 mb-2">{t("butcher.loadError")}</p>
            <button onClick={() => window.location.reload()} className="text-[12px] underline text-muted-foreground hover:text-foreground">{t("shop.retry")}</button>
          </div>
        ) : products.length > 0 ? (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {products.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onAddToCart={onAddToCart}
                onWishlist={onWishlist}
                onView={() => navigate(`/product/${product.id}`)}
                wishlisted={wishlist.has(product.id)}
              />
            ))}
          </div>
        ) : (
          <p className="py-16 text-center text-muted-foreground">{t("butcher.emptyCut")}</p>
        )}
      </div>
    </div>
  );
}
