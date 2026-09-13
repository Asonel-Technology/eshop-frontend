import { Link } from "react-router-dom";
import { useState } from "react";
import type { Product } from "../data";
import { formatRWF, discountPct } from "../data";

function IconHeart({ filled = false }: { filled?: boolean }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}

function StarRow({ rating, reviews }: { rating: number; reviews: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((i) => (
          <svg key={i} width="11" height="11" viewBox="0 0 24 24" fill={i <= Math.round(rating) ? "#C4622D" : "none"} stroke="#C4622D" strokeWidth="1.5">
            <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
          </svg>
        ))}
      </div>
      <span className="text-[10px] text-muted-foreground">({reviews})</span>
    </div>
  );
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
  onWishlist: (id: string | number) => void;
  onView?: (product: Product) => void; // Made optional
  wishlisted: boolean;
}

export default function ProductCard({ product, onAddToCart, onWishlist, onView, wishlisted }: ProductCardProps) {
  const [added, setAdded] = useState(false);

  function handleAdd(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  }

  function handleAction(e: React.MouseEvent, action: () => void) {
    e.preventDefault();
    e.stopPropagation();
    action();
  }

  return (
    <Link
      to={`/product/${product.id}`}
      className="group bg-card border border-border rounded-xl overflow-hidden flex flex-col cursor-pointer transition-all duration-250 hover:shadow-lg hover:shadow-black/8 hover:-translate-y-px"
    >
      {/* Image */}
      <div className="relative overflow-hidden bg-[#F5F5F5] aspect-square">
        <img
          src={product.img}
          alt={product.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1">
          {product.badge && (
            <span className="bg-primary text-white text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-sm">
              {product.badge}
            </span>
          )}
          {product.isNew && !product.badge && (
            <span className="bg-[#1A6B3C] text-white text-[9px] font-bold tracking-widest uppercase px-2 py-0.5 rounded-sm">
              NEW
            </span>
          )}
        </div>

        {/* Wishlist */}
        <button
          onClick={(e) => handleAction(e, () => onWishlist(product.id))}
          className={`absolute top-2.5 right-2.5 w-7 h-7 rounded-full flex items-center justify-center transition-all shadow-sm ${wishlisted ? "bg-primary text-white" : "bg-white text-foreground hover:bg-primary hover:text-white"}`}
        >
          <IconHeart filled={wishlisted} />
        </button>

        {/* Quick View overlay */}
        {onView && (
          <div className="absolute inset-x-0 bottom-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              onClick={(e) => handleAction(e, () => onView(product))}
              className="w-full bg-white/95 text-foreground text-[10px] font-bold tracking-wider uppercase py-1.5 rounded-lg hover:bg-foreground hover:text-white transition-colors"
            >
              Quick View
            </button>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="p-3 flex flex-col gap-1.5 flex-1">
        <p className="text-[9px] font-bold tracking-[0.15em] uppercase text-muted-foreground">{product.category}</p>
        <h3 className="text-[13px] font-semibold leading-snug line-clamp-2 group-hover:text-primary transition-colors">{product.name}</h3>
        <StarRow rating={product.rating} reviews={product.reviews} />

        <div className="flex items-center gap-1.5 mt-0.5">
          <span
            className={`text-[9px] font-bold ${product.stock === "In Stock" ? "text-emerald-600" : product.stock === "Low Stock" ? "text-amber-600" : "text-red-500"}`}
          >
            ● {product.stock}
          </span>
        </div>

        <div className="flex items-end justify-between mt-auto pt-2 border-t border-border">
          <div>
            <p className="text-[14px] font-bold leading-none">{formatRWF(product.price)}</p>
            {product.originalPrice && (
              <div className="flex items-center gap-1.5 mt-0.5">
                <p className="text-[10px] text-muted-foreground line-through">{formatRWF(product.originalPrice)}</p>
                <span className="text-[9px] text-primary font-bold">-{discountPct(product.price, product.originalPrice)}%</span>
              </div>
            )}
          </div>
          <button
            onClick={handleAdd}
            className={`text-[10px] font-bold tracking-wider uppercase px-3 py-2 rounded-lg transition-all duration-200 ${added ? "bg-emerald-600 text-white" : "bg-primary text-white hover:bg-secondary"}`}
          >
            {added ? "✓ Added" : "+ Cart"}
          </button>
        </div>
      </div>
    </Link>
  );
}
