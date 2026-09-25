import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { formatRWF } from "../../data";
import { getAdminOrders } from "../../services/admin";
import { STATUS_LABEL } from "./labels";

const FILTERS = ["", "PENDING_CONFIRMATION", "CONFIRMED", "REJECTED", "DELIVERED"];

export default function OrdersManager() {
  const [status, setStatus] = useState("");
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getAdminOrders(status || undefined)
      .then((data) => { if (!cancelled) setOrders(data); })
      .catch((err) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [status]);

  return (
    <div className="max-w-5xl space-y-5">
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((value) => (
          <button
            key={value || "all"}
            onClick={() => setStatus(value)}
            className={`px-3 py-1.5 text-[12px] border ${
              status === value ? "bg-[#1c1915] text-[#efe8dc] border-[#1c1915]" : "border-[#d8cfc0] text-[#4a433a]"
            }`}
          >
            {value ? STATUS_LABEL[value] : "All"}
          </button>
        ))}
      </div>

      {error && <p className="text-[#9a3412]">{error}</p>}
      {loading ? (
        <p className="text-[#6b6256]">Loading orders…</p>
      ) : orders.length === 0 ? (
        <p className="text-[#6b6256]">No orders in this list.</p>
      ) : (
        <div className="border border-[#d8cfc0] bg-[#f7f1e7] overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="text-[11px] tracking-[0.12em] uppercase text-[#6b6256] border-b border-[#d8cfc0]">
              <tr>
                <th className="px-3 py-2 font-medium">Customer</th>
                <th className="px-3 py-2 font-medium hidden sm:table-cell">Place</th>
                <th className="px-3 py-2 font-medium text-right">Total</th>
                <th className="px-3 py-2 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#d8cfc0]">
              {orders.map((order) => (
                <tr key={order.id} className="hover:bg-[#efe8dc]">
                  <td className="px-3 py-3">
                    <Link to={`/admin/orders/${order.id}`} className="font-medium hover:underline">
                      {order.customerName}
                    </Link>
                    <p className="text-[12px] text-[#6b6256] tabular">{order.phone}</p>
                  </td>
                  <td className="px-3 py-3 hidden sm:table-cell text-[#4a433a]">
                    {[order.sector?.name, order.district?.name, order.province?.name].filter(Boolean).join(", ")}
                  </td>
                  <td className="px-3 py-3 text-right tabular">{formatRWF(order.total)}</td>
                  <td className="px-3 py-3 text-[12px]">{STATUS_LABEL[order.status] || order.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
