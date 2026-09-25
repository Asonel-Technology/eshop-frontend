import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { formatRWF } from "../../data";
import { getAdminItems, getAdminOrders, getAdminSettings } from "../../services/admin";
import { stockQty } from "./labels";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [pending, setPending] = useState<any[]>([]);
  const [lowStock, setLowStock] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [confirmedToday, setConfirmedToday] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        const [orders, catalog, shop] = await Promise.all([
          getAdminOrders(),
          getAdminItems({ pageSize: 100 }),
          getAdminSettings(),
        ]);
        const waiting = orders.filter((o: any) => o.status === "PENDING_CONFIRMATION");
        setPending(waiting);
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        setConfirmedToday(
          orders
            .filter((o: any) => o.status === "CONFIRMED" || o.status === "DELIVERED")
            .filter((o: any) => new Date(o.updatedAt || o.createdAt) >= start)
            .reduce((sum: number, o: any) => sum + (o.total || 0), 0)
        );
        setLowStock(catalog.items.filter((item: any) => stockQty(item) <= 5));
        setSettings(shop);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) return <p className="text-[#6b6256]">Loading.</p>;
  if (error) return <p className="text-[#9a3412]">{error}</p>;

  const missing = [
    !settings?.momoCode && "MoMo code",
    !settings?.whatsappNumber && "WhatsApp number",
    !settings?.shopSectorId && "shop location",
  ].filter(Boolean);

  return (
    <div className="max-w-4xl space-y-8">
      {missing.length > 0 && (
        <div className="border border-[#9a3412] bg-[#f4e4d8] px-4 py-3 text-[13px]">
          The shop cannot take orders until you set {missing.join(", ")}.{" "}
          <Link to="/admin/settings" className="underline font-medium">
            Open shop details
          </Link>
        </div>
      )}

      <section>
        <p className="text-[11px] tracking-[0.18em] uppercase text-[#6b6256] mb-3">
          Waiting on WhatsApp · {pending.length}
        </p>
        {pending.length === 0 ? (
          <p className="text-[#6b6256] text-[14px]">None waiting.</p>
        ) : (
          <div className="border border-[#d8cfc0] bg-[#f7f1e7] divide-y divide-[#d8cfc0]">
            {pending.slice(0, 8).map((order) => (
              <Link
                key={order.id}
                to={`/admin/orders/${order.id}`}
                className="flex items-baseline justify-between gap-4 px-4 py-3 hover:bg-[#efe8dc]"
              >
                <div>
                  <p className="font-medium">{order.customerName}</p>
                  <p className="text-[12px] text-[#6b6256]">{order.phone}</p>
                </div>
                <p className="tabular text-[14px]">{formatRWF(order.total)}</p>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="grid sm:grid-cols-2 gap-6">
        <div>
          <p className="text-[11px] tracking-[0.18em] uppercase text-[#6b6256] mb-2">Confirmed today</p>
          <p className="tabular text-[28px] leading-none">{formatRWF(confirmedToday)}</p>
          <p className="text-[12px] text-[#6b6256] mt-2">Confirmed or delivered today.</p>
        </div>
        <div>
          <p className="text-[11px] tracking-[0.18em] uppercase text-[#6b6256] mb-2">Low stock</p>
          {lowStock.length === 0 ? (
            <p className="text-[14px] text-[#6b6256]">None at 5 or below.</p>
          ) : (
            <ul className="space-y-1">
              {lowStock.slice(0, 6).map((item) => (
                <li key={item.id} className="flex justify-between text-[13px]">
                  <Link to={`/admin/products/${item.id}`} className="hover:underline">{item.name}</Link>
                  <span className="tabular">{stockQty(item)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </div>
  );
}
