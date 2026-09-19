import { useState, useEffect } from "react";
import { useAuth } from "../../contexts/AuthContext";
import { getAdminCategories, createAdminCategory, createAdminSubcategory, deleteAdminCategory, deleteAdminSubcategory } from "../../services/admin";

export default function CategoriesManager() {
  const { token } = useAuth();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [newCatName, setNewCatName] = useState("");
  const [newCatType, setNewCatType] = useState("PRODUCT");
  const [loadingAddCat, setLoadingAddCat] = useState(false);

  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [newSubcatName, setNewSubcatName] = useState("");
  const [loadingAddSubcat, setLoadingAddSubcat] = useState(false);

  const loadCategories = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const data = await getAdminCategories(token);
      setCategories(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, [token]);

  const generateSlug = (name: string) => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newCatName) return;
    setLoadingAddCat(true);
    try {
      await createAdminCategory(token, {
        name: newCatName,
        type: newCatType,
        slug: generateSlug(newCatName)
      });
      setNewCatName("");
      loadCategories();
    } catch (err: any) {
      alert("Failed to add category: " + err.message);
    } finally {
      setLoadingAddCat(false);
    }
  };

  const handleAddSubcategory = async (categoryId: string) => {
    if (!token || !newSubcatName) return;
    setLoadingAddSubcat(true);
    try {
      await createAdminSubcategory(token, {
        categoryId,
        name: newSubcatName,
        slug: generateSlug(newSubcatName)
      });
      setNewSubcatName("");
      setActiveCategoryId(null);
      loadCategories();
    } catch (err: any) {
      alert("Failed to add subcategory: " + err.message);
    } finally {
      setLoadingAddSubcat(false);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!token || !window.confirm("Are you sure? This will fail if there are any products attached to this category.")) return;
    try {
      await deleteAdminCategory(token, id);
      loadCategories();
    } catch (err: any) {
      alert("Failed to delete: " + err.message);
    }
  };

  const handleDeleteSubcategory = async (id: string) => {
    if (!token || !window.confirm("Are you sure? This will fail if there are any products attached to this subcategory.")) return;
    try {
      await deleteAdminSubcategory(token, id);
      loadCategories();
    } catch (err: any) {
      alert("Failed to delete: " + err.message);
    }
  };

  if (loading) {
    return <div className="py-10 text-center">Loading categories...</div>;
  }

  return (
    <div className="space-y-8 max-w-5xl">
      {error && <div className="bg-red-50 text-red-600 p-4 rounded-xl">{error}</div>}

      <div className="bg-white border border-border rounded-2xl p-6 shadow-sm">
        <h3 className="font-serif text-lg font-bold mb-4">Add New Category</h3>
        <form onSubmit={handleAddCategory} className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-[11px] font-bold tracking-wider uppercase text-muted-foreground mb-1.5">Category Name</label>
            <input
              type="text"
              required
              value={newCatName}
              onChange={(e) => setNewCatName(e.target.value)}
              placeholder="e.g. Meat"
              className="w-full h-10 px-3 rounded-lg border border-border focus:border-primary outline-none text-[13px]"
            />
          </div>
          <div className="w-48">
            <label className="block text-[11px] font-bold tracking-wider uppercase text-muted-foreground mb-1.5">Type</label>
            <select
              value={newCatType}
              onChange={(e) => setNewCatType(e.target.value)}
              className="w-full h-10 px-3 rounded-lg border border-border focus:border-primary outline-none text-[13px]"
            >
              <option value="PRODUCT">Product</option>
              <option value="FOOD">Food/Grocery</option>
            </select>
          </div>
          <button
            type="submit"
            disabled={loadingAddCat || !newCatName}
            className="h-10 px-6 bg-primary text-white font-bold text-[11px] tracking-wider uppercase rounded-lg hover:bg-secondary disabled:opacity-50 transition-colors"
          >
            Add Category
          </button>
        </form>
      </div>

      <div className="space-y-4">
        {categories.map((cat) => (
          <div key={cat.id} className="bg-white border border-border rounded-2xl shadow-sm overflow-hidden">
            <div className="bg-[#fcfcfc] p-4 border-b border-border flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-serif text-lg font-bold text-foreground">{cat.name}</span>
                  <span className="bg-muted text-muted-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">{cat.type}</span>
                </div>
                <p className="text-[12px] text-muted-foreground">/{cat.slug}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setActiveCategoryId(activeCategoryId === cat.id ? null : cat.id)}
                  className="px-4 py-2 bg-foreground text-background text-[11px] font-bold tracking-wider uppercase rounded-lg hover:bg-secondary transition-colors"
                >
                  + Subcategory
                </button>
                <button
                  onClick={() => handleDeleteCategory(cat.id)}
                  className="px-4 py-2 border border-red-200 text-red-600 hover:bg-red-50 text-[11px] font-bold tracking-wider uppercase rounded-lg transition-colors"
                >
                  Delete
                </button>
              </div>
            </div>

            {/* Add Subcategory Form */}
            {activeCategoryId === cat.id && (
              <div className="p-4 bg-muted/30 border-b border-border flex gap-3">
                <input
                  type="text"
                  placeholder="Subcategory Name (e.g. Beef)"
                  value={newSubcatName}
                  onChange={(e) => setNewSubcatName(e.target.value)}
                  className="flex-1 h-9 px-3 rounded-lg border border-border text-[13px] outline-none focus:border-primary"
                />
                <button
                  onClick={() => handleAddSubcategory(cat.id)}
                  disabled={loadingAddSubcat || !newSubcatName}
                  className="h-9 px-4 bg-primary text-white text-[11px] font-bold uppercase tracking-wider rounded-lg disabled:opacity-50"
                >
                  Save
                </button>
                <button
                  onClick={() => setActiveCategoryId(null)}
                  className="h-9 px-4 border border-border text-[11px] font-bold uppercase tracking-wider rounded-lg"
                >
                  Cancel
                </button>
              </div>
            )}

            <div className="p-4">
              {cat.subcategories && cat.subcategories.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {cat.subcategories.map((sub: any) => (
                    <div key={sub.id} className="flex items-center justify-between p-3 border border-border rounded-xl group hover:border-primary transition-colors">
                      <div>
                        <p className="font-semibold text-[13px]">{sub.name}</p>
                        <p className="text-[11px] text-muted-foreground">/{sub.slug}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteSubcategory(sub.id)}
                        className="text-red-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity p-1"
                        title="Delete Subcategory"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-[12px] text-muted-foreground italic">No subcategories. Add some cuts or types!</p>
              )}
            </div>
          </div>
        ))}

        {categories.length === 0 && !loading && (
          <div className="py-12 text-center text-muted-foreground bg-white border border-border rounded-2xl">
            No categories found. Create "Meat" to get started!
          </div>
        )}
      </div>
    </div>
  );
}
