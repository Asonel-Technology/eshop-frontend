import type { CartItem } from "../data";
import { formatRWF, variantLabel } from "../data";
import { useI18n } from "../i18n/LanguageContext";

interface CartProps {
  items: CartItem[];
  onClose: () => void;
  onRemove: (index: number) => void;
  onUpdateQty: (index: number, qty: number) => void;
  onCheckout: () => void;
}

export default function Cart({ items, onClose, onRemove, onUpdateQty, onCheckout }: CartProps) {
  const { t } = useI18n();
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-background w-full max-w-[420px] flex flex-col shadow-2xl">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <h2 className="font-semibold text-base">{t("nav.bag")}</h2>
            {items.length > 0 && (
              <span className="text-[12px] text-muted-foreground">{items.length}</span>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground"
            aria-label={t("nav.close")}
          >
            ✕
          </button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-5 px-6">
            <p className="text-muted-foreground">{t("cart.empty")}</p>
            <button
              onClick={onClose}
              className="bg-primary text-white text-[11px] font-bold tracking-wider uppercase px-6 py-3 rounded-lg hover:bg-secondary transition-colors"
            >
              {t("cart.continue")}
            </button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-5 py-3 flex flex-col gap-1">
              {items.map((item, i) => (
                <div key={i} className="flex items-start gap-3 py-3.5 border-b border-border last:border-none">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0 border border-border">
                    <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold leading-snug line-clamp-2">{item.name}</p>
                    {variantLabel(item) && <p className="text-[10px] text-muted-foreground mt-0.5">{variantLabel(item)}</p>}
                    <p className="text-[13px] font-bold text-primary mt-1">{formatRWF(item.price)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <button onClick={() => onRemove(i)} className="text-muted-foreground hover:text-red-500 text-[11px]" aria-label={t("cart.remove")}>
                      ✕
                    </button>
                    <div className="flex items-center gap-1 border border-border rounded-lg overflow-hidden">
                      <button
                        onClick={() => onUpdateQty(i, Math.max(1, item.qty - 1))}
                        className="w-7 h-7 flex items-center justify-center hover:bg-muted text-sm font-bold"
                      >
                        −
                      </button>
                      <span className="w-6 text-center text-[12px] font-semibold">{item.qty}</span>
                      <button
                        onClick={() => onUpdateQty(i, item.qty + 1)}
                        className="w-7 h-7 flex items-center justify-center hover:bg-muted text-sm font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="px-5 py-5 border-t border-border bg-card">
              <div className="flex justify-between text-[12px] mb-1.5">
                <span className="text-muted-foreground">{t("cart.subtotal")}</span>
                <span className="font-semibold">{formatRWF(subtotal)}</span>
              </div>
              <div className="flex justify-between text-[12px] mb-4">
                <span className="text-muted-foreground">{t("cart.delivery")}</span>
                <span className="text-muted-foreground">{t("cart.deliveryLater")}</span>
              </div>
              <button
                onClick={onCheckout}
                className="w-full bg-primary text-white font-bold text-[11px] tracking-[0.15em] uppercase py-4 rounded-xl hover:bg-secondary transition-colors mb-2"
              >
                {t("cart.checkout")}
              </button>
              <button onClick={onClose} className="w-full text-[11px] font-semibold text-muted-foreground tracking-wider uppercase hover:text-foreground">
                {t("cart.continue")}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
