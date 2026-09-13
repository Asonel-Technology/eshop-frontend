import type { CartItem } from "../data";
import { formatRWF } from "../data";

interface CartProps {
  items: CartItem[];
  onClose: () => void;
  onRemove: (index: number) => void;
  onUpdateQty: (index: number, qty: number) => void;
  onCheckout: () => void;
}

export default function Cart({ items, onClose, onRemove, onUpdateQty, onCheckout }: CartProps) {
  const subtotal = items.reduce((s, i) => s + i.price * i.qty, 0);
  const FREE_DELIVERY = 50000;
  const remaining = Math.max(0, FREE_DELIVERY - subtotal);
  const delivery = remaining === 0 ? 0 : 2000;
  const total = subtotal + delivery;

  return (
    <div className="fixed inset-0 z-[100] flex justify-end">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-background w-full max-w-[420px] flex flex-col shadow-2xl">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2.5">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" /><line x1="3" y1="6" x2="21" y2="6" /><path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
            <h2 className="font-semibold text-base">Shopping Bag</h2>
            <span className="bg-primary text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{items.length}</span>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">✕</button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6">
            <div className="text-6xl">🛍️</div>
            <div className="text-center">
              <p className="font-semibold mb-1">Your bag is empty</p>
              <p className="text-muted-foreground text-sm">Add items from our store to get started.</p>
            </div>
            <button onClick={onClose} className="bg-primary text-white text-[11px] font-bold tracking-wider uppercase px-6 py-3 rounded-lg hover:bg-secondary transition-colors">
              Continue Shopping
            </button>
          </div>
        ) : (
          <>
            {/* Free delivery progress */}
            <div className="mx-5 mt-4">
              {remaining > 0 ? (
                <div className="bg-[#FFF5F0] border border-[#FFD5C0] rounded-xl px-4 py-3">
                  <p className="text-[11px] text-foreground mb-2">
                    Add <span className="font-bold text-primary">{formatRWF(remaining)}</span> more for free delivery
                  </p>
                  <div className="h-1.5 bg-[#FFD5C0] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full transition-all duration-500"
                      style={{ width: `${Math.min(100, (subtotal / FREE_DELIVERY) * 100)}%` }}
                    />
                  </div>
                </div>
              ) : (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5">
                  <p className="text-[11px] text-emerald-700 font-semibold">🎉 You qualify for free delivery!</p>
                </div>
              )}
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-5 py-3 flex flex-col gap-1">
              {items.map((item, i) => (
                <div key={i} className="flex items-start gap-3 py-3.5 border-b border-border last:border-none">
                  <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted flex-shrink-0 border border-border">
                    <img src={item.img} alt={item.name} className="w-full h-full object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[12px] font-semibold leading-snug line-clamp-2">{item.name}</p>
                    {item.variant && <p className="text-[10px] text-muted-foreground mt-0.5">{item.variant}</p>}
                    <p className="text-[13px] font-bold text-primary mt-1">{formatRWF(item.price)}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <button onClick={() => onRemove(i)} className="text-muted-foreground hover:text-red-500 transition-colors text-[11px]">✕</button>
                    <div className="flex items-center gap-1 border border-border rounded-lg overflow-hidden">
                      <button
                        onClick={() => onUpdateQty(i, Math.max(1, item.qty - 1))}
                        className="w-7 h-7 flex items-center justify-center hover:bg-muted transition-colors text-sm font-bold"
                      >−</button>
                      <span className="w-6 text-center text-[12px] font-semibold">{item.qty}</span>
                      <button
                        onClick={() => onUpdateQty(i, item.qty + 1)}
                        className="w-7 h-7 flex items-center justify-center hover:bg-muted transition-colors text-sm font-bold"
                      >+</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="px-5 py-5 border-t border-border bg-card">
              <div className="flex justify-between text-[12px] mb-1.5">
                <span className="text-muted-foreground">Subtotal ({items.length} items)</span>
                <span className="font-semibold">{formatRWF(subtotal)}</span>
              </div>
              <div className="flex justify-between text-[12px] mb-3">
                <span className="text-muted-foreground">Delivery</span>
                <span className="font-semibold">{delivery === 0 ? <span className="text-emerald-600">Free</span> : formatRWF(delivery)}</span>
              </div>
              <div className="flex justify-between font-bold text-base pt-3 mb-4 border-t border-border">
                <span>Total</span>
                <span>{formatRWF(total)}</span>
              </div>
              <button
                onClick={onCheckout}
                className="w-full bg-primary text-white font-bold text-[11px] tracking-[0.15em] uppercase py-4 rounded-xl hover:bg-secondary transition-colors mb-2"
              >
                Proceed to Checkout
              </button>
              <button onClick={onClose} className="w-full text-[11px] font-semibold text-muted-foreground tracking-wider uppercase hover:text-foreground transition-colors">
                Continue Shopping
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
