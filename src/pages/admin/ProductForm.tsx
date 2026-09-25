import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { createAdminItem, getAdminCategories, getAdminItem, updateAdminItem } from "../../services/admin";
import { slugify } from "./labels";

interface VariantRow {
  color: string;
  size: string;
  quantity: number;
}

export default function ProductForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNew = !id || id === "new";

  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [type, setType] = useState<"FOOD" | "PRODUCT">("FOOD");
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [originalPrice, setOriginalPrice] = useState("");
  const [quantity, setQuantity] = useState("0");
  const [isFeatured, setIsFeatured] = useState(false);
  const [categoryId, setCategoryId] = useState("");
  const [subcategoryId, setSubcategoryId] = useState("");
  const [variants, setVariants] = useState<VariantRow[]>([]);
  const [existingImages, setExistingImages] = useState<string[]>([]);
  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    getAdminCategories().then(setCategories).catch((err) => setError(err.message));
  }, []);

  useEffect(() => {
    if (isNew || !id) return;
    getAdminItem(id)
      .then((item) => {
        setType(item.type);
        setName(item.name);
        setSlug(item.slug);
        setDescription(item.description || "");
        setPrice(String(item.price ?? ""));
        setOriginalPrice(item.originalPrice != null ? String(item.originalPrice) : "");
        setQuantity(String(item.quantity ?? 0));
        setIsFeatured(!!item.isFeatured);
        setCategoryId(item.categoryId);
        setSubcategoryId(item.subcategoryId || "");
        setExistingImages(item.images || []);
        setVariants(
          (item.variants || []).map((v: any) => ({
            color: v.color || "",
            size: v.size || "",
            quantity: v.quantity ?? 0,
          }))
        );
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [id, isNew]);

  const typedCats = categories.filter((c) => c.type === type);
  const selected = typedCats.find((c) => c.id === categoryId);

  function onName(value: string) {
    setName(value);
    if (isNew) setSlug(slugify(value));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (isNew && files.length === 0) {
      setError("Add at least one photo.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const form = new FormData();
      form.append("type", type);
      form.append("name", name);
      form.append("slug", slug || slugify(name));
      form.append("description", description);
      form.append("price", price);
      form.append("originalPrice", originalPrice);
      form.append("quantity", quantity);
      form.append("isFeatured", String(isFeatured));
      form.append("categoryId", categoryId);
      if (subcategoryId) form.append("subcategoryId", subcategoryId);
      if (variants.length > 0) {
        form.append(
          "variants",
          JSON.stringify(variants.map((v) => ({
            color: v.color || undefined,
            size: v.size || undefined,
            quantity: Number(v.quantity) || 0,
          })))
        );
      }
      files.forEach((file) => form.append("images", file));

      if (isNew) await createAdminItem(form);
      else await updateAdminItem(id!, form);
      navigate("/admin/products");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-[#6b6256]">Loading item…</p>;

  return (
    <form onSubmit={save} className="max-w-xl space-y-5">
      <Link to="/admin/products" className="text-[12px] text-[#6b6256] hover:text-[#1c1915]">
        ← Stock
      </Link>
      {error && <p className="text-[#9a3412] text-[13px]">{error}</p>}

      <div className="flex gap-2">
        {(["FOOD", "PRODUCT"] as const).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => { setType(value); setCategoryId(""); setSubcategoryId(""); }}
            className={`px-3 py-1.5 text-[12px] border ${type === value ? "bg-[#1c1915] text-[#efe8dc] border-[#1c1915]" : "border-[#d8cfc0]"}`}
          >
            {value === "FOOD" ? "Butcher" : "Product"}
          </button>
        ))}
      </div>

      <label className="block">
        <span className="block text-[12px] mb-1">Name</span>
        <input value={name} onChange={(e) => onName(e.target.value)} required className="w-full h-11 px-3 bg-[#f7f1e7] border border-[#d8cfc0]" />
      </label>

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="block text-[12px] mb-1">Price (RWF)</span>
          <input type="number" min={0} value={price} onChange={(e) => setPrice(e.target.value)} required className="w-full h-11 px-3 bg-[#f7f1e7] border border-[#d8cfc0] tabular" />
        </label>
        <label className="block">
          <span className="block text-[12px] mb-1">Was (optional)</span>
          <input type="number" min={0} value={originalPrice} onChange={(e) => setOriginalPrice(e.target.value)} className="w-full h-11 px-3 bg-[#f7f1e7] border border-[#d8cfc0] tabular" />
        </label>
      </div>

      <label className="block">
        <span className="block text-[12px] mb-1">{type === "FOOD" ? "Butcher" : "Product category"}</span>
        <select
          value={categoryId}
          onChange={(e) => { setCategoryId(e.target.value); setSubcategoryId(""); }}
          required
          className="w-full h-11 px-3 bg-[#f7f1e7] border border-[#d8cfc0]"
        >
          <option value="">Select</option>
          {typedCats.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </label>

      {selected?.subcategories?.length > 0 && (
        <label className="block">
          <span className="block text-[12px] mb-1">{type === "FOOD" ? "Cut" : "Subcategory"}</span>
          <select value={subcategoryId} onChange={(e) => setSubcategoryId(e.target.value)} className="w-full h-11 px-3 bg-[#f7f1e7] border border-[#d8cfc0]">
            <option value="">None</option>
            {selected.subcategories.map((s: any) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </label>
      )}

      <label className="block">
        <span className="block text-[12px] mb-1">Description</span>
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className="w-full px-3 py-2 bg-[#f7f1e7] border border-[#d8cfc0]" />
      </label>

      {variants.length === 0 && (
        <label className="block">
          <span className="block text-[12px] mb-1">Quantity</span>
          <input type="number" min={0} value={quantity} onChange={(e) => setQuantity(e.target.value)} className="w-full h-11 px-3 bg-[#f7f1e7] border border-[#d8cfc0] tabular" />
        </label>
      )}

      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-[12px]">Variants (optional)</span>
          <button
            type="button"
            onClick={() => setVariants((prev) => [...prev, { color: "", size: "", quantity: 0 }])}
            className="text-[12px] underline"
          >
            Add colour / size
          </button>
        </div>
        {variants.map((row, i) => (
          <div key={i} className="grid grid-cols-4 gap-2 mb-2">
            <input placeholder="Colour" value={row.color} onChange={(e) => setVariants((p) => p.map((r, n) => n === i ? { ...r, color: e.target.value } : r))} className="h-10 px-2 bg-[#f7f1e7] border border-[#d8cfc0]" />
            <input placeholder="Size" value={row.size} onChange={(e) => setVariants((p) => p.map((r, n) => n === i ? { ...r, size: e.target.value } : r))} className="h-10 px-2 bg-[#f7f1e7] border border-[#d8cfc0]" />
            <input type="number" min={0} value={row.quantity} onChange={(e) => setVariants((p) => p.map((r, n) => n === i ? { ...r, quantity: Number(e.target.value) } : r))} className="h-10 px-2 bg-[#f7f1e7] border border-[#d8cfc0] tabular" />
            <button type="button" onClick={() => setVariants((p) => p.filter((_, n) => n !== i))} className="text-[11px] text-[#9a3412]">Remove</button>
          </div>
        ))}
      </div>

      <label className="flex items-center gap-2 text-[13px]">
        <input type="checkbox" checked={isFeatured} onChange={(e) => setIsFeatured(e.target.checked)} />
        Show on the home page
      </label>

      {existingImages.length > 0 && (
        <div className="flex gap-2 flex-wrap">
          {existingImages.map((src) => (
            <img key={src} src={src} alt="" className="w-16 h-16 object-cover border border-[#d8cfc0]" />
          ))}
        </div>
      )}

      <label className="block">
        <span className="block text-[12px] mb-1">{isNew ? "Photos" : "Replace photos"}</span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={(e) => setFiles(Array.from(e.target.files || []).slice(0, 5))}
        />
        <p className="text-[11px] text-[#6b6256] mt-1">JPG, PNG or WebP. Up to 5. Replacing photos removes the old ones.</p>
      </label>

      <button type="submit" disabled={saving} className="h-11 px-6 bg-[#1c1915] text-[#efe8dc] text-[12px] tracking-[0.14em] uppercase disabled:opacity-50">
        {saving ? "Saving…" : isNew ? "Add to stock" : "Save changes"}
      </button>
    </form>
  );
}
