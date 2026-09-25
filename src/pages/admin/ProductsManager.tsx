import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { formatRWF } from "../../data";
import { deleteAdminItem, getAdminItems } from "../../services/admin";
import { stockQty } from "./labels";

export default function ProductsManager() {
  const [type, setType] = useState<"FOOD" | "PRODUCT" | "">("FOOD");
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function load() {
    setLoading(true);
    setError("");
    try {
      const data = await getAdminItems({ type: type || undefined, pageSize: 100 });
      setItems(data.items);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [type]);

  async function remove(id: string, name: string) {
    if (!window.confirm(`Delete “${name}”? This cannot be undone.`)) return;
    try {
      await deleteAdminItem(id);
      load();
    } catch (err: any) {
      alert(err.message);
    }
  }

  return (
    <div className="max-w-5xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          {(["FOOD", "PRODUCT", ""] as const).map((value) => (
            <button
              key={value || "all"}
              onClick={() => setType(value)}
              className={`px-3 py-1.5 text-[12px] border ${
                type === value ? "bg-[#1c1915] text-[#efe8dc] border-[#1c1915]" : "border-[#d8cfc0]"
              }`}
            >
              {value === "FOOD" ? "Butcher" : value === "PRODUCT" ? "Products" : "All"}
            </button>
          ))}
        </div>
        <Link
          to="/admin/products/new"
          className="h-10 px-4 inline-flex items-center bg-[#1c1915] text-[#efe8dc] text-[12px] tracking-[0.12em] uppercase"
        >
          Add item
        </Link>
      </div>

      {error && <p className="text-[#9a3412]">{error}</p>}
      {loading ? (
        <p className="text-[#6b6256]">Loading stock…</p>
      ) : items.length === 0 ? (
        <p className="text-[#6b6256]">Nothing in this list.</p>
      ) : (
        <div className="border border-[#d8cfc0] bg-[#f7f1e7] divide-y divide-[#d8cfc0]">
          {items.map((item) => (
            <div key={item.id} className="flex items-center gap-3 px-3 py-3">
              <img src={item.images?.[0]} alt="" className="w-14 h-14 object-cover bg-[#efe8dc] border border-[#d8cfc0]" />
              <div className="flex-1 min-w-0">
                <Link to={`/admin/products/${item.id}`} className="font-medium hover:underline">
                  {item.name}
                </Link>
                <p className="text-[12px] text-[#6b6256]">
                  {item.category?.name}
                  {item.subcategory?.name ? ` · ${item.subcategory.name}` : ""}
                </p>
              </div>
              <p className="tabular text-[13px] hidden sm:block">{formatRWF(item.price)}</p>
              <p className="tabular text-[13px] w-10 text-right">{stockQty(item)}</p>
              <button
                onClick={() => remove(item.id, item.name)}
                className="text-[11px] text-[#9a3412] hover:underline"
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
