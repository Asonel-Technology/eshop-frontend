import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { formatRWF, variantLabel } from "../../data";
import { getAdminOrder, updateAdminOrderStatus } from "../../services/admin";
import { STATUS_LABEL } from "./labels";

export default function OrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [working, setWorking] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    getAdminOrder(id)
      .then(setOrder)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function setStatus(status: string) {
    if (!id) return;
    const confirmMsg =
      status === "CONFIRMED"
        ? "Confirm this order? Stock will drop for each line."
        : status === "REJECTED"
          ? "Reject this order? Stock will not change."
          : "Mark this order delivered?";
    if (!window.confirm(confirmMsg)) return;
    setWorking(status);
    setError("");
    try {
      const updated = await updateAdminOrderStatus(id, status);
      setOrder((prev: any) => ({ ...prev, ...updated }));
    } catch (err: any) {
      setError(err.message);
    } finally {
      setWorking("");
    }
  }

  if (loading) return <p className="text-[#6b6256]">Opening order…</p>;
  if (!order) return <p className="text-[#9a3412]">{error || "Order not found."}</p>;

  const place = [order.address, order.sector?.name, order.district?.name, order.province?.name]
    .filter(Boolean)
    .join(" · ");

  return (
    <div className="max-w-5xl space-y-6">
      <Link to="/admin/orders" className="text-[12px] text-[#6b6256] hover:text-[#1c1915]">
        ← All orders
      </Link>

      {error && <p className="text-[#9a3412] text-[13px]">{error}</p>}

      <div className="grid lg:grid-cols-2 gap-8">
        <section>
          <p className="text-[11px] tracking-[0.18em] uppercase text-[#6b6256] mb-2">Payment proof</p>
          {order.paymentProofUrl ? (
            <a href={order.paymentProofUrl} target="_blank" rel="noreferrer">
              <img
                src={order.paymentProofUrl}
                alt="MoMo payment screenshot"
                className="w-full border border-[#d8cfc0] bg-[#f7f1e7] max-h-[520px] object-contain"
              />
            </a>
          ) : (
            <p className="text-[#6b6256]">No screenshot attached.</p>
          )}
        </section>

        <section className="space-y-5">
          <div>
            <p className="text-[11px] tracking-[0.18em] uppercase text-[#6b6256]">Expected total</p>
            <p className="tabular text-[40px] leading-none mt-1">{formatRWF(order.total)}</p>
            <p className="text-[12px] text-[#6b6256] mt-2">
              Items {formatRWF(order.subtotal)} + delivery {formatRWF(order.deliveryFee)}
            </p>
            <p className="text-[13px] mt-2">{STATUS_LABEL[order.status] || order.status}</p>
          </div>

          <div className="text-[13px] space-y-1">
            <p className="font-medium">{order.customerName}</p>
            <p className="tabular">{order.phone}</p>
            {order.email && <p>{order.email}</p>}
            <p className="text-[#4a433a]">{place}</p>
            {order.notes && <p className="text-[#6b6256]">Note: {order.notes}</p>}
          </div>

          <ul className="border-t border-[#d8cfc0] pt-3 space-y-2">
            {order.items?.map((line: any) => (
              <li key={line.id} className="flex justify-between gap-3 text-[13px]">
                <span>
                  {line.itemName}
                  {variantLabel(line) ? ` · ${variantLabel(line)}` : ""}
                  <span className="text-[#6b6256]"> × {line.quantity}</span>
                </span>
                <span className="tabular">{formatRWF(line.lineTotal)}</span>
              </li>
            ))}
          </ul>

          {order.status === "PENDING_CONFIRMATION" && (
            <div className="flex flex-wrap gap-3 pt-2">
              <button
                onClick={() => setStatus("CONFIRMED")}
                disabled={!!working}
                className="h-11 px-5 bg-[#1c1915] text-[#efe8dc] text-[12px] tracking-[0.12em] uppercase disabled:opacity-50"
              >
                {working === "CONFIRMED" ? "Confirming…" : "Confirm payment"}
              </button>
              <button
                onClick={() => setStatus("REJECTED")}
                disabled={!!working}
                className="h-11 px-5 border border-[#9a3412] text-[#9a3412] text-[12px] tracking-[0.12em] uppercase disabled:opacity-50"
              >
                {working === "REJECTED" ? "Rejecting…" : "Reject"}
              </button>
            </div>
          )}

          {order.status === "CONFIRMED" && (
            <button
              onClick={() => setStatus("DELIVERED")}
              disabled={!!working}
              className="h-11 px-5 bg-[#1c1915] text-[#efe8dc] text-[12px] tracking-[0.12em] uppercase disabled:opacity-50"
            >
              {working === "DELIVERED" ? "Saving…" : "Mark delivered"}
            </button>
          )}
        </section>
      </div>
    </div>
  );
}
