import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import type { Product } from "../data";
import { getItem } from "../services/api";
import ProductCard from "../components/ProductCard";
import { useI18n } from "../i18n/LanguageContext";

interface WishlistProps {
  ids: Set<string | number>;
  onAddToCart: (p: Product) => void;
  onWishlist: (id: string | number) => void;
}

export default function Wishlist({ ids, onAddToCart, onWishlist }: WishlistProps) {
  const navigate = useNavigate();
  const { t } = useI18n();
  const [items, setItems] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const results = await Promise.all(
        Array.from(ids).map((id) => getItem(id).catch(() => null))
      );
      if (!cancelled) {
        setItems(results.filter((p): p is Product => p !== null));
        setLoading(false);
      }
    }
    if (ids.size === 0) {
      setItems([]);
      setLoading(false);
      return;
    }
    load();
    return () => { cancelled = true; };
  }, [ids]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10 pb-20">
      <h1 className="font-serif text-2xl sm:text-3xl font-bold mb-8">{t("wish.title")}</h1>

      {loading ? (
        <div className="py-20 flex justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : items.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-muted-foreground mb-6">{t("wish.empty")}</p>
          <button
            onClick={() => navigate("/shop")}
            className="bg-primary text-white font-bold text-[11px] tracking-wider uppercase px-6 py-3 rounded-xl"
          >
            {t("wish.browse")}
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((p) => (
            <ProductCard
              key={p.id}
              product={p}
              onAddToCart={onAddToCart}
              onWishlist={onWishlist}
              wishlisted
            />
          ))}
        </div>
      )}
    </div>
  );
}
