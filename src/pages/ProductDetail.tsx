import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import type { Product } from "../data";
import { formatRWF, discountPct } from "../data";
import ProductCard from "../components/ProductCard";
import { getItem, getItems } from "../services/api";
import { useI18n } from "../i18n/LanguageContext";

interface ProductDetailProps {
  onAddToCart: (p: Product, qty: number, variant?: { color?: string; size?: string }) => void;
  onWishlist: (id: string | number) => void;
  wishlist: Set<string | number>;
}

export default function ProductDetail({ onAddToCart, onWishlist, wishlist }: ProductDetailProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t, catalog, stock } = useI18n();
  const [qty, setQty] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [activeImg, setActiveImg] = useState(0);

  const [product, setProduct] = useState<Product | null>(null);
  const [parsedVariants, setParsedVariants] = useState<{ type: string; label: string; options: string[] }[]>([]);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      setLoading(true);
      setError(null);
      setActiveImg(0);

      try {
        const fullItem = await getItem(id);
        if (!fullItem) return;
        setProduct(fullItem as Product);

        const rv = fullItem.variants || [];
        const colors = Array.from(new Set(rv.map((v) => v.color).filter(Boolean))) as string[];
        const sizes = Array.from(new Set(rv.map((v) => v.size).filter(Boolean))) as string[];

        const variantsToSet = [];
        if (colors.length > 0) variantsToSet.push({ type: "color", label: "Color", options: colors });
        if (sizes.length > 0) variantsToSet.push({ type: "size", label: "Size", options: sizes });
        setParsedVariants(variantsToSet);

        const defaultSels: Record<string, string> = {};
        if (colors.length > 0) defaultSels["color"] = colors[0];
        if (sizes.length > 0) defaultSels["size"] = sizes[0];
        setSelectedVariants(defaultSels);

        if (fullItem.categorySlug) {
          const relatedData = await getItems({ categorySlug: fullItem.categorySlug, pageSize: 5 });
          setRelated(relatedData.items.filter((p: Product) => String(p.id) !== String(id)).slice(0, 4));
        }
      } catch (err) {
        console.error("Failed to load product details", err);
        setError("load");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
        <p className="text-muted-foreground mb-4">{t("product.loadError")}</p>
        <button onClick={() => window.location.reload()} className="text-primary hover:underline">{t("shop.retry")}</button>
      </div>
    );
  }

  if (!product && !loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
        <p className="text-muted-foreground mb-4">{t("product.notFound")}</p>
        <button onClick={() => navigate("/shop")} className="text-primary hover:underline">{t("product.backShop")}</button>
      </div>
    );
  }

  const getActiveStock = () => {
    if (!product) return "Out of Stock";
    const variants = product.variants || [];
    if (variants.length === 0) return product.stock;
    const match = variants.find((v) =>
      (selectedVariants["color"] ? v.color === selectedVariants["color"] : true) &&
      (selectedVariants["size"] ? v.size === selectedVariants["size"] : true)
    );
    if (!match) return "Out of Stock";
    return match.quantity > 5 ? "In Stock" : match.quantity > 0 ? "Low Stock" : "Out of Stock";
  };

  const activeStock = getActiveStock();
  const isAvailable = activeStock !== "Out of Stock";
  const missingSelection = parsedVariants.some((v) => !selectedVariants[v.type]);
  const canAddToCart = isAvailable && !missingSelection;

  function handleAddToCart() {
    if (canAddToCart && product) {
      onAddToCart(product, qty, {
        color: selectedVariants["color"],
        size: selectedVariants["size"],
      });
    }
  }

  const gallery = product?.images?.filter(Boolean).length
    ? product.images.filter(Boolean)
    : product?.img
      ? [product.img]
      : [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-16">
      {product && (
        <nav className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-6 flex-wrap">
          <Link to="/" className="hover:text-foreground">{t("nav.home")}</Link>
          <span>/</span>
          {product.categorySlug ? (
            <Link to={`/category/${product.categorySlug}`} className="hover:text-foreground">{catalog(product.categorySlug, product.category)}</Link>
          ) : (
            <span>{catalog(undefined, product.category)}</span>
          )}
          <span>/</span>
          <span className="text-foreground font-medium line-clamp-1">{product.name}</span>
        </nav>
      )}

      {loading || !product ? (
        <div className="py-32 flex justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <div className="grid lg:grid-cols-2 gap-10 mb-16">
            <div className="flex flex-col gap-3">
              <div className="rounded-2xl overflow-hidden bg-[#F5F5F5] aspect-square border border-border">
                <img src={gallery[activeImg] || product.img} alt={product.name} className="w-full h-full object-cover" />
              </div>
              {gallery.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {gallery.map((imgUrl, i) => (
                    <button
                      key={`${imgUrl}-${i}`}
                      type="button"
                      onClick={() => setActiveImg(i)}
                      className={`rounded-xl overflow-hidden border aspect-square bg-[#F5F5F5] ${i === activeImg ? "border-foreground" : "border-border hover:border-muted-foreground"}`}
                    >
                      <img src={imgUrl} alt="" className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-primary mb-1.5">{catalog(product.categorySlug, product.category)}</p>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold leading-snug mb-3">{product.name}</h1>

              <div className="flex items-center gap-3 mb-4">
                {product.reviews > 0 && (
                  <span className="text-[12px] text-muted-foreground">{product.rating} · {t("product.reviews", { n: product.reviews })}</span>
                )}
                {activeStock !== "In Stock" && (
                  <span className={`text-[12px] ${activeStock === "Low Stock" ? "text-amber-700" : "text-red-600"}`}>
                    {stock(activeStock)}
                  </span>
                )}
              </div>

              <div className="flex items-end gap-3 mb-6 pb-6 border-b border-border">
                <p className="font-serif text-3xl font-bold text-foreground">{formatRWF(product.price)}</p>
                {product.originalPrice && (
                  <>
                    <p className="text-muted-foreground text-base line-through mb-0.5">{formatRWF(product.originalPrice)}</p>
                    <span className="text-[12px] text-primary font-semibold mb-1">
                      −{discountPct(product.price, product.originalPrice)}%
                    </span>
                  </>
                )}
              </div>

              {product.description && (
                <p className="text-muted-foreground text-[14px] leading-relaxed mb-6">{product.description}</p>
              )}

              {parsedVariants.map((variant) => (
                <div key={variant.type} className="mb-5">
                  <p className="text-[12px] font-semibold mb-2">
                    {variant.type === "color" ? t("product.color") : t("product.size")}: {selectedVariants[variant.type] || t("product.select")}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {variant.options.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setSelectedVariants((prev) => ({ ...prev, [variant.type]: opt }))}
                        className={`text-[11px] font-semibold px-3.5 py-2 rounded-lg border ${selectedVariants[variant.type] === opt ? "bg-foreground text-background border-foreground" : "border-border hover:border-foreground"}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              <div className="flex items-center gap-4 mb-6">
                <p className="text-[12px] font-semibold">{t("product.qty")}</p>
                <div className="flex items-center border border-border rounded-xl overflow-hidden">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-10 flex items-center justify-center hover:bg-muted font-bold text-lg">−</button>
                  <span className="w-12 text-center font-semibold text-[14px]">{qty}</span>
                  <button onClick={() => setQty(qty + 1)} className="w-10 h-10 flex items-center justify-center hover:bg-muted font-bold text-lg">+</button>
                </div>
                {qty > 1 && (
                  <p className="text-[12px] text-muted-foreground">
                    {formatRWF(product.price * qty)}
                  </p>
                )}
              </div>

              <div className="flex gap-3 mb-6">
                <button
                  onClick={handleAddToCart}
                  disabled={!canAddToCart}
                  className="flex-1 bg-primary text-white font-bold text-[12px] tracking-[0.15em] uppercase py-4 rounded-xl hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {!isAvailable ? t("stock.out") : missingSelection ? t("product.selectOptions") : t("product.addBag")}
                </button>
                <button
                  onClick={() => onWishlist(product.id)}
                  aria-label={t("card.save")}
                  className={`w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-xl border ${wishlist.has(product.id) ? "border-primary bg-primary text-white" : "border-border hover:border-primary"}`}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill={wishlist.has(product.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </button>
              </div>

              <p className="text-[12px] text-muted-foreground">{t("product.payHint")}</p>
            </div>
          </div>

          {related.length > 0 && (
            <div>
              <h2 className="font-serif text-xl font-semibold mb-5">
                {t("product.moreIn", { name: catalog(product.categorySlug, product.category) })}
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {related.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    onAddToCart={(prod) => onAddToCart(prod, 1)}
                    onWishlist={onWishlist}
                    wishlisted={wishlist.has(p.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
