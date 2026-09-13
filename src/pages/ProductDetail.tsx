import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import type { Product } from "../data";
import { formatRWF, discountPct } from "../data";
import ProductCard from "../components/ProductCard";
import { getItem, getItems } from "../services/api";

interface ProductDetailProps {
  onAddToCart: (p: Product, qty: number, variant: string) => void;
  onWishlist: (id: string | number) => void;
  wishlist: Set<string | number>;
}

export default function ProductDetail({ onAddToCart, onWishlist, wishlist }: ProductDetailProps) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [qty, setQty] = useState(1);
  const [selectedVariants, setSelectedVariants] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<"description" | "specs" | "reviews">("description");

  const [product, setProduct] = useState<Product | null>(null);
  const [parsedVariants, setParsedVariants] = useState<{type: string; label: string; options: string[]}[]>([]);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      if (!id) return;
      setLoading(true);
      setError(null);
      
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
           setRelated(relatedData.items.filter((p: any) => String(p.id) !== String(id)).slice(0, 4));
        }

      } catch (err) {
        console.error("Failed to load product details", err);
        setError("Unable to load product details. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  if (error) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4 text-red-500">Error</h1>
        <p className="text-muted-foreground mb-4">{error}</p>
        <button onClick={() => window.location.reload()} className="text-primary hover:underline">Try Again</button>
      </div>
    );
  }

  if (!product && !loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
        <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
        <button onClick={() => navigate(-1)} className="text-primary hover:underline">Go Back</button>
      </div>
    );
  }

  const getActiveStock = () => {
     if (!product) return "Out of Stock";
     const variants = product.variants || [];
     if (variants.length === 0) return product.stock;
     const match = variants.find(v => 
        (selectedVariants["color"] ? v.color === selectedVariants["color"] : true) &&
        (selectedVariants["size"] ? v.size === selectedVariants["size"] : true)
     );
     if (!match) return "Out of Stock";
     return match.quantity > 5 ? "In Stock" : match.quantity > 0 ? "Low Stock" : "Out of Stock";
  };
  
  const activeStock = getActiveStock();
  const isAvailable = activeStock !== "Out of Stock";
  const variantSummary = Object.entries(selectedVariants).map(([, v]) => v).join(", ");

  function handleAddToCart() {
    if (isAvailable && product) onAddToCart(product, qty, variantSummary);
  }

  const gallery = product?.images?.length ? product.images : product ? [product.img, product.img, product.img, product.img] : [];
  const displayGallery = [...gallery, ...Array(4)].slice(0, 4);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 pb-16">
      {product && (
        <nav className="flex items-center gap-1.5 text-[11px] text-muted-foreground mb-6 flex-wrap">
          <button onClick={() => navigate(-1)} className="hover:text-foreground transition-colors">Home</button>
          <span>/</span>
          <button onClick={() => navigate(-1)} className="hover:text-foreground transition-colors">{product.category}</button>
          <span>/</span>
          <span className="text-foreground font-medium line-clamp-1">{product.name}</span>
        </nav>
      )}

      {loading || !product ? (
        <div className="py-32 flex justify-center">
           <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <>
          <div className="grid lg:grid-cols-2 gap-10 mb-16">
            <div className="flex flex-col gap-3">
              <div className="rounded-2xl overflow-hidden bg-[#F5F5F5] aspect-square border border-border">
                <img src={displayGallery[0] || product.img} alt={product.name} className="w-full h-full object-cover" />
              </div>
              <div className="grid grid-cols-4 gap-2">
                {displayGallery.map((imgUrl, i) => (
                  <div key={i} className={`rounded-xl overflow-hidden border-2 aspect-square bg-[#F5F5F5] cursor-pointer ${i === 0 ? "border-primary" : "border-border hover:border-muted-foreground"}`}>
                    {imgUrl && <img src={imgUrl} alt="" className="w-full h-full object-cover opacity-70 hover:opacity-100 transition-opacity" />}
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-primary mb-1.5">{product.category}</p>
              <h1 className="font-serif text-2xl sm:text-3xl font-bold leading-snug mb-3">{product.name}</h1>

              <div className="flex items-center gap-3 mb-4">
                <div className="flex">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill={i <= Math.round(product.rating) ? "#C4622D" : "none"} stroke="#C4622D" strokeWidth="1.5">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  ))}
                </div>
                <span className="text-[12px] font-semibold">{product.rating}</span>
                <span className="text-[12px] text-muted-foreground">({product.reviews} reviews)</span>
                <span className={`text-[11px] font-bold ml-2 ${activeStock === "In Stock" ? "text-emerald-600" : activeStock === "Low Stock" ? "text-amber-600" : "text-red-500"}`}>
                  ● {activeStock}
                </span>
              </div>

              <div className="flex items-end gap-3 mb-6 pb-6 border-b border-border">
                <p className="font-serif text-3xl font-bold text-foreground">{formatRWF(product.price)}</p>
                {product.originalPrice && (
                  <>
                    <p className="text-muted-foreground text-base line-through mb-0.5">{formatRWF(product.originalPrice)}</p>
                    <span className="bg-primary text-white text-[11px] font-bold px-2 py-0.5 rounded-sm mb-1">
                      -{discountPct(product.price, product.originalPrice)}% OFF
                    </span>
                  </>
                )}
              </div>

              <p className="text-muted-foreground text-[14px] leading-relaxed mb-6">{product.description}</p>

              {parsedVariants.map((variant) => (
                <div key={variant.type} className="mb-5">
                  <p className="text-[12px] font-bold mb-2">
                    {variant.label}:&nbsp;
                    <span className="text-primary font-bold">{selectedVariants[variant.type] || "Select"}</span>
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {variant.options.map((opt) => (
                      <button
                        key={opt}
                        onClick={() => setSelectedVariants((prev) => ({ ...prev, [variant.type]: opt }))}
                        className={`text-[11px] font-semibold px-3.5 py-2 rounded-lg border transition-all ${selectedVariants[variant.type] === opt ? "bg-foreground text-background border-foreground" : "border-border hover:border-foreground"}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

              <div className="flex items-center gap-4 mb-6">
                <p className="text-[12px] font-bold">Quantity:</p>
                <div className="flex items-center border border-border rounded-xl overflow-hidden">
                  <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-10 h-10 flex items-center justify-center hover:bg-muted font-bold text-lg transition-colors">−</button>
                  <span className="w-12 text-center font-semibold text-[14px]">{qty}</span>
                  <button onClick={() => setQty(qty + 1)} className="w-10 h-10 flex items-center justify-center hover:bg-muted font-bold text-lg transition-colors">+</button>
                </div>
                <p className="text-[12px] text-muted-foreground">Total: <span className="font-bold text-foreground">{formatRWF(product.price * qty)}</span></p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 mb-6">
                <button
                  onClick={handleAddToCart}
                  disabled={!isAvailable}
                  className="flex-1 bg-primary text-white font-bold text-[12px] tracking-[0.15em] uppercase py-4 rounded-xl hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isAvailable ? "Add to Cart" : "Out of Stock"}
                </button>
                <button
                  onClick={handleAddToCart}
                  disabled={!isAvailable}
                  className="flex-1 bg-foreground text-background font-bold text-[12px] tracking-[0.15em] uppercase py-4 rounded-xl hover:bg-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Buy Now
                </button>
                <button
                  onClick={() => onWishlist(product.id)}
                  className={`w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-xl border-2 transition-colors ${wishlist.has(product.id) ? "border-primary bg-primary text-white" : "border-border hover:border-primary"}`}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill={wishlist.has(product.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2">
                    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                  </svg>
                </button>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {[
                  { icon: "🚚", label: "Free delivery over 50,000 RWF" },
                  { icon: "↩️", label: "7-day return policy" },
                  { icon: "🔒", label: "Secure MTN MoMo payment" },
                  { icon: "💬", label: "24/7 WhatsApp support" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
                    <span className="text-base">{item.icon}</span>
                    <span className="text-[11px] font-medium leading-tight">{item.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-border pt-8 mb-12">
            <div className="flex gap-1 mb-6">
              {(["description", "specs", "reviews"] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`text-[11px] font-bold tracking-wider uppercase px-5 py-2.5 rounded-lg transition-all ${activeTab === tab ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground hover:bg-muted"}`}
                >
                  {tab === "description" ? "Description" : tab === "specs" ? "Specifications" : `Reviews (${product.reviews})`}
                </button>
              ))}
            </div>

            {activeTab === "description" && (
              <div className="max-w-2xl">
                <p className="text-[14px] leading-relaxed text-muted-foreground">{product.description}</p>
              </div>
            )}
            {activeTab === "specs" && (
              <div className="max-w-2xl">
                <table className="w-full text-[13px]">
                  <tbody>
                    {[
                      ["Category", product.category],
                      ["Stock", activeStock],
                      ["Rating", `${product.rating} / 5 (${product.reviews} reviews)`],
                      ...(parsedVariants.map((v) => [v.label + " Options", v.options.join(", ")])),
                    ].map(([k, v], i) => (
                      <tr key={i} className={i % 2 === 0 ? "bg-muted" : ""}>
                        <td className="py-2.5 px-4 font-semibold text-[12px] w-1/3">{k}</td>
                        <td className="py-2.5 px-4 text-muted-foreground">{v}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            {activeTab === "reviews" && (
              <div className="max-w-2xl space-y-4">
                {[
                  { name: "M. Uwimana", rating: 5, text: "Excellent quality! Exactly as described. Fast delivery too.", date: "2 days ago" },
                  { name: "J. Habimana", rating: 5, text: "Very happy with my purchase. Will definitely order again.", date: "1 week ago" },
                  { name: "C. Mukamana", rating: 4, text: "Good product, packaging was great. Delivery was quick.", date: "2 weeks ago" },
                ].map((review, i) => (
                  <div key={i} className="border border-border rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-primary text-white text-[11px] font-bold flex items-center justify-center">
                          {review.name[0]}
                        </div>
                        <span className="text-[13px] font-semibold">{review.name}</span>
                      </div>
                      <span className="text-[11px] text-muted-foreground">{review.date}</span>
                    </div>
                    <div className="flex mb-2">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <svg key={i} width="12" height="12" viewBox="0 0 24 24" fill={i <= review.rating ? "#C4622D" : "none"} stroke="#C4622D" strokeWidth="1.5">
                          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                        </svg>
                      ))}
                    </div>
                    <p className="text-[13px] text-muted-foreground">{review.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>

           {/* Related products */}
          {related.length > 0 && (
            <div>
              <h3 className="font-serif text-xl font-semibold mb-5">You May Also Like</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {related.map((p) => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    onAddToCart={(prod) => onAddToCart(prod, 1, "") }
                    onWishlist={onWishlist}
                    onView={() => navigate(`/product/${p.id}`)}
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

