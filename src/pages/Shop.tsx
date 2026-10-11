import { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate, Link, useSearchParams } from "react-router-dom";
import type { Product, Category } from "../data";
import { isButcherItem, shopBrowseTiles, tilePath } from "../data";
import { getItems, type GetItemsParams } from "../services/api";
import ProductCard from "../components/ProductCard";
import { useI18n } from "../i18n/LanguageContext";

interface ShopProps {
  categories?: Category[];
  shopProducts?: Product[];
  onAddToCart: (p: Product) => void;
  onWishlist: (id: string | number) => void;
  wishlist: Set<string | number>;
}

export default function Shop({ categories = [], shopProducts = [], onAddToCart, onWishlist, wishlist }: ShopProps) {
  const navigate = useNavigate();
  const { t, catalog } = useI18n();
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

  const category =
    categories.find((c) => c.slug === slug) ||
    categories.find((c) => c.subcategories?.some((s) => s.slug === slug));
  const subFromPath = category?.subcategories?.find((s) => s.slug === slug && category.slug !== slug);
  const subFromQuery = searchParams.get("sub") || "";
  const activeSubSlug = subFromPath?.slug || subFromQuery || "";
  const browseTiles = shopBrowseTiles(categories, shopProducts);

  const [items, setItems] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [activeCategory, setActiveCategory] = useState<string>("all");
  const [activeSubcategory, setActiveSubcategory] = useState<string>("all");

  useEffect(() => {
    if (slug) {
      setActiveCategory(slug);
    } else {
      setActiveCategory("all");
    }
    setActiveSubcategory("all");
  }, [slug]);

  useEffect(() => {
    async function loadShopItems() {
      setLoading(true);
      setError(null);
      try {
        const query: GetItemsParams = { type: "PRODUCT" };
        if (pageId === "category" && category) query.categorySlug = category.slug;
        else if (activeCategory !== "all") query.categorySlug = activeCategory;
        if (pageId === "category" && activeSubSlug) query.subcategorySlug = activeSubSlug;
        else if (activeSubcategory !== "all") query.subcategorySlug = activeSubcategory;
        const querySearch = searchParams.get("q");
        if (querySearch) query.search = querySearch;

        if (pageId === "deals") query.discounted = true;
        if (pageId === "new") query.sort = "newest";
        if (pageId === "bestsellers") query.sort = "bestselling";

        const data = await getItems(query);
        const onlyShop = data.items.filter((p) => {
          if (isButcherItem(p)) return false;
          if (pageId === "category" && category && String(p.categoryId) !== String(category.id)) return false;
          if (pageId === "category" && activeSubSlug) {
            return p.subcategory?.slug === activeSubSlug || String(p.subcategoryId) === String(category?.subcategories?.find((s) => s.slug === activeSubSlug)?.id);
          }
          return true;
        });
        setItems(onlyShop);
        setTotal(onlyShop.length);
      } catch (err) {
        console.error("Failed to load shop items", err);
        setError("load");
      } finally {
        setLoading(false);
      }
    }
    loadShopItems();
  }, [activeCategory, activeSubcategory, searchParams, pageId, category?.id, category?.slug, activeSubSlug]);

  const pageTitles: Record<string, string> = {
    shop: searchQuery ? t("shop.results", { q: searchQuery }) : t("shop.allProducts"),
    deals: t("home.onOffer"),
    new: t("nav.new"),
    bestsellers: t("nav.bestsellers"),
    categories: t("nav.categories"),
  };

  const title = pageId === "category" ? catalog(category?.slug, category?.name) : pageTitles[pageId] || t("shop.products");

  const emptyCopy =
    pageId === "bestsellers"
      ? t("shop.emptyBestsellers")
      : pageId === "deals"
        ? t("shop.emptyDeals")
        : searchQuery
          ? t("shop.emptySearch")
          : t("shop.empty");

  const countLabel = t(total === 1 ? "shop.productOne" : "shop.productMany", { n: total });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 pb-20">
      {pageId === "category" && category && (
        <>
          <nav className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-6">
            <Link to="/" className="hover:text-foreground">{t("nav.home")}</Link>
            <span>/</span>
            <span className="text-foreground font-medium">{catalog(category.slug, category.name)}</span>
            {activeSubSlug && (
              <>
                <span>/</span>
                <span className="text-foreground font-medium">{catalog(activeSubSlug, category.subcategories?.find((s) => s.slug === activeSubSlug)?.name)}</span>
              </>
            )}
          </nav>
          <div className="mb-8">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold">
              {activeSubSlug
                ? catalog(activeSubSlug, category.subcategories?.find((s) => s.slug === activeSubSlug)?.name)
                : catalog(category.slug, category.name)}
            </h1>
            {total > 0 && (
              <p className="text-muted-foreground text-[13px] mt-1">{countLabel}</p>
            )}
            {(category.subcategories?.length || 0) > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => navigate(`/category/${category.slug}`)}
                  className={`min-h-11 px-4 text-[12px] font-semibold border ${!activeSubSlug ? "bg-foreground text-background border-foreground" : "border-border"}`}
                >
                  {catalog(category.slug, category.name)}
                </button>
                {category.subcategories!.map((sub) => (
                  <button
                    key={sub.id}
                    type="button"
                    onClick={() => navigate(`/category/${category.slug}?sub=${sub.slug}`)}
                    className={`min-h-11 px-4 text-[12px] font-semibold border ${activeSubSlug === sub.slug ? "bg-foreground text-background border-foreground" : "border-border"}`}
                  >
                    {catalog(sub.slug, sub.name)}
                  </button>
                ))}
              </div>
            )}
          </div>
        </>
      )}

      {pageId !== "category" && (
        <div className="mb-6">
          <h1 className="font-serif text-2xl sm:text-3xl font-bold">{title}</h1>
          {pageId !== "categories" && total > 0 && (
            <p className="text-muted-foreground text-[13px] mt-1">{countLabel}</p>
          )}
        </div>
      )}

      {pageId === "categories" ? (
        browseTiles.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {browseTiles.map((tile) => (
              <button
                key={tile.key}
                onClick={() => navigate(tilePath(tile))}
                className="group relative rounded-2xl overflow-hidden aspect-[4/3] flex flex-col justify-end text-left border border-border hover:border-primary transition-colors bg-muted"
              >
                {tile.img && <img src={tile.img} alt="" className="absolute inset-0 w-full h-full object-cover transition-transform duration-400 group-hover:scale-105" />}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                <div className="relative z-10 p-4">
                  <p className="text-white text-[13px] font-semibold leading-tight">{catalog(tile.slug, tile.label)}</p>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <p className="py-20 text-center text-muted-foreground">{t("shop.emptyCategories")}</p>
        )
      ) : loading ? (
        <div className="py-20 flex justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="py-20 text-center">
          <p className="text-red-600 mb-2">{t("shop.loadError")}</p>
          <button onClick={() => window.location.reload()} className="text-[12px] underline text-muted-foreground hover:text-foreground">
            {t("shop.retry")}
          </button>
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
        <p className="py-20 text-center text-muted-foreground">{emptyCopy}</p>
      )}
    </div>
  );
}
