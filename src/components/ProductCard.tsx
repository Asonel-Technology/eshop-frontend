import { Link } from "react-router-dom";
import { useState } from "react";
import type { Product } from "../data";
import { formatRWF, discountPct } from "../data";
import { useI18n } from "../i18n/LanguageContext";

function IconHeart({ filled = false }: { filled?: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onWishlist: (id: string | number) => void;
  onView?: (product: Product) => void;
  wishlisted: boolean;
}

export default function ProductCard({ product, onAddToCart, onWishlist, wishlisted }: ProductCardProps) {
  const { t, catalog, stock } = useI18n();
  const [added, setAdded] = useState(false);

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  function handleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    onWishlist(product.id);
  }

  const showStock = product.stock === "Low Stock" || product.stock === "Out of Stock";

  return (
    <Link
      to={`/product/${product.id}`}
      className="group bg-card border border-border rounded-xl overflow-hidden flex flex-col"
    >
      <div className="relative overflow-hidden bg-[#F5F5F5] aspect-square">
        <img
          src={product.img}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {product.originalPrice && (
          <span className="absolute top-2.5 left-2.5 bg-primary text-white text-[9px] font-bold tracking-widest uppercase px-2 py-0.5">
            −{discountPct(product.price, product.originalPrice)}%
          </span>
        )}

        <button
          onClick={handleWishlist}
          aria-label={wishlisted ? t("card.unsave") : t("card.save")}
          className={`absolute top-2.5 right-2.5 w-7 h-7 rounded-full flex items-center justify-center ${wishlisted ? "bg-primary text-white" : "bg-white text-foreground hover:bg-primary hover:text-white"}`}
        >
          <IconHeart filled={wishlisted} />
        </button>
      </div>

      <div className="p-3 flex flex-col gap-1.5 flex-1">
        {product.category && (
          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{catalog(product.categorySlug, product.category)}</p>
        )}
        <h3 className="text-[13px] font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors">
          {product.name}
        </h3>

        {showStock && (
          <p className={`text-[11px] ${product.stock === "Out of Stock" ? "text-red-600" : "text-amber-700"}`}>
            {stock(product.stock)}
          </p>
        )}

        <div className="flex items-end justify-between mt-auto pt-2 border-t border-border">
          <div>
            <p className="text-[14px] font-bold leading-none">{formatRWF(product.price)}</p>
            {product.originalPrice && (
              <p className="text-[10px] text-muted-foreground line-through mt-0.5">{formatRWF(product.originalPrice)}</p>
            )}
          </div>
          <button
            onClick={handleAdd}
            disabled={product.stock === "Out of Stock"}
            className={`text-[10px] font-bold tracking-wider uppercase px-3 py-2 rounded-lg transition-colors disabled:opacity-40 ${added ? "bg-emerald-600 text-white" : "bg-primary text-white hover:bg-secondary"}`}
          >
            {added ? t("card.added") : t("card.add")}
          </button>
        </div>
      </div>
    </Link>
  );
}
