"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, X, Check, ChevronRight, ArrowLeft } from "lucide-react";

type Category = { id: string; label: string; description?: string };
type Supplement = { id: string; name: string; price: number };
type Drink = { id: string; name: string; price: number };
type Dessert = { id: string; name: string; price: number };

type Dish = {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  imageUrl?: string;
  popular: boolean;
  spiceable: boolean;
  feeds: number;
  categoryId: string;
  category?: { id: string; label: string };
  supplements: Supplement[];
  drinks: Drink[];
  desserts: Dessert[];
  discountAmount?: number;
};

type View = "categories" | "dishes";

export default function AdminMenu() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [view, setView] = useState<View>("categories");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [categoryForm, setCategoryForm] = useState({ label: "", description: "" });
  const [isAddingDish, setIsAddingDish] = useState(false);
  const [editingDishId, setEditingDishId] = useState<string | null>(null);
  const [dishForm, setDishForm] = useState<Partial<Dish>>({});
  const [supplementInput, setSupplementInput] = useState({ name: "", price: "" });
  const [confirmDeleteCatId, setConfirmDeleteCatId] = useState<string | null>(null);
  const [confirmDeleteDishId, setConfirmDeleteDishId] = useState<string | null>(null);
  const [globalSupplements, setGlobalSupplements] = useState<Supplement[]>([]);
  const [availableDrinks, setAvailableDrinks] = useState<Drink[]>([]);
  const [availableDesserts, setAvailableDesserts] = useState<Dessert[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [catRes, menuRes, supRes, drinkRes, dessertRes] = await Promise.all([
        fetch("/api/categories"), fetch("/api/menu"), fetch("/api/supplements"), fetch("/api/drinks"), fetch("/api/desserts"),
      ]);
      const [catData, menuData, supData, drinkData, dessertData] = await Promise.all([
        catRes.json(), menuRes.json(), supRes.json(), drinkRes.json(), dessertRes.json(),
      ]);
      setCategories(Array.isArray(catData) ? catData : []);
      setDishes(Array.isArray(menuData) ? menuData : []);
      setGlobalSupplements(Array.isArray(supData) ? [...supData].reverse().slice(0, 10) : []);
      setAvailableDrinks(Array.isArray(drinkData) ? drinkData : []);
      setAvailableDesserts(Array.isArray(dessertData) ? dessertData : []);
    } catch (error) { console.error("Failed to fetch data:", error); }
    finally { setIsLoading(false); }
  };

  const resetCategoryForm = () => { setCategoryForm({ label: "", description: "" }); setIsAddingCategory(false); setEditingCategoryId(null); };
  const resetDishForm = () => { setDishForm({}); setIsAddingDish(false); setEditingDishId(null); setSupplementInput({ name: "", price: "" }); };

  const saveCategoryForm = async () => {
    if (!categoryForm.label) return;
    try {
      if (isAddingCategory) {
        const res = await fetch("/api/categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ label: categoryForm.label, description: categoryForm.description }) });
        const newCat = await res.json();
        setCategories((prev) => [...prev, newCat]);
      } else if (editingCategoryId) {
        const res = await fetch(`/api/categories/${editingCategoryId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ label: categoryForm.label, description: categoryForm.description }) });
        const updated = await res.json();
        setCategories((prev) => prev.map((c) => c.id === editingCategoryId ? updated : c));
      }
    } catch (error) { console.error("Failed to save category:", error); }
    resetCategoryForm();
  };

  const deleteCategory = async (id: string) => {
    try {
      const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });
      if (res.ok) { setCategories((prev) => prev.filter((c) => c.id !== id)); setDishes((prev) => prev.filter((d) => d.categoryId !== id)); }
    } catch (error) { console.error("Failed to delete category:", error); }
    setConfirmDeleteCatId(null);
  };

  const startEditCategory = (cat: Category) => { setCategoryForm({ label: cat.label, description: cat.description || "" }); setEditingCategoryId(cat.id); setIsAddingCategory(false); };
  const openCategory = (cat: Category) => { setSelectedCategory(cat); setView("dishes"); resetDishForm(); };

  const startAddDish = () => {
    setDishForm({ name: "", description: "", longDescription: "", price: undefined, categoryId: selectedCategory?.id || "", spiceable: false, popular: false, feeds: undefined, supplements: [], drinks: [], desserts: [], imageUrl: "" });
    setEditingDishId(null); setIsAddingDish(true);
  };

  const startEditDish = (dish: Dish) => { setDishForm({ ...dish, discountAmount: undefined }); setEditingDishId(dish.id); setIsAddingDish(false); };

  const deleteDish = async (id: string) => {
    try {
      const res = await fetch(`/api/menu/${id}`, { method: "DELETE" });
      if (res.ok) setDishes((prev) => prev.filter((d) => d.id !== id));
    } catch (error) { console.error("Failed to delete dish:", error); }
    setConfirmDeleteDishId(null);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingImage(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.url) setDishForm((p) => ({ ...p, imageUrl: data.url }));
    } catch (error) { console.error("Upload failed:", error); }
    finally { setUploadingImage(false); }
  };

  const addSupplement = () => {
    if (!supplementInput.name || !supplementInput.price) return;
    const newSup: Supplement = { id: supplementInput.name.toLowerCase().replace(/\s+/g, "-"), name: supplementInput.name, price: parseFloat(supplementInput.price) };
    setDishForm((prev) => ({ ...prev, supplements: [...(prev.supplements || []), newSup] }));
    setSupplementInput({ name: "", price: "" });
  };

  const removeSupplement = (id: string) => { setDishForm((prev) => ({ ...prev, supplements: (prev.supplements || []).filter((s) => s.id !== id) })); };

  const toggleDrink = (drink: Drink) => {
    const current = dishForm.drinks || [];
    const exists = current.find((d) => d.id === drink.id);
    setDishForm((prev) => ({ ...prev, drinks: exists ? current.filter((d) => d.id !== drink.id) : [...current, drink] }));
  };

  const toggleDessert = (dessert: Dessert) => {
    const current = dishForm.desserts || [];
    const exists = current.find((d) => d.id === dessert.id);
    setDishForm((prev) => ({ ...prev, desserts: exists ? current.filter((d) => d.id !== dessert.id) : [...current, dessert] }));
  };

  const saveDishForm = async () => {
    if (!dishForm.name || !dishForm.price) return;
    const { discountAmount, category, categoryId: _cid, ...rest } = dishForm as any;
    const payload = {
      ...rest,
      categoryId: rest.categoryId || selectedCategory?.id,
      supplements: (rest.supplements || []).map((s: any) => ({ name: s.name, price: Number(s.price) })),
      drinks: (rest.drinks || []).map((d: any) => ({ id: d.id })),
      desserts: (rest.desserts || []).map((d: any) => ({ id: d.id })),
    };
    if (!payload.categoryId) return;
    try {
      if (isAddingDish) {
        const res = await fetch("/api/menu", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        const newDish = await res.json();
        if (!res.ok) { console.error("Error:", newDish.error); return; }
        setDishes((prev) => [...prev, newDish]);
      } else if (editingDishId) {
        const res = await fetch(`/api/menu/${editingDishId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
        const updated = await res.json();
        if (!res.ok) { console.error("Error:", updated.error); return; }
        setDishes((prev) => prev.map((d) => d.id === editingDishId ? updated : d));
      }
    } catch (error) { console.error("Failed to save dish:", error); }
    resetDishForm();
  };

  const categoryDishes = dishes.filter((d) => d.categoryId === selectedCategory?.id || d.category?.id === selectedCategory?.id);

  // ─── PALETTE ───
  const inputStyle = {
    width: "100%", padding: "0.75rem 1rem", borderRadius: "10px",
    background: "rgba(255,255,255,0.7)", border: "1px solid rgba(219,146,23,0.30)",
    color: "#743306", fontFamily: "var(--font-dm)", fontSize: "0.875rem",
    outline: "none", transition: "border-color 0.2s",
  };

  const labelStyle = {
    fontFamily: "var(--font-dm)", fontSize: "10px", fontWeight: 500,
    textTransform: "uppercase" as const, letterSpacing: "0.14em",
    color: "#A44B09", marginBottom: "0.4rem", display: "block",
  };

  const sectionTitle = {
    fontFamily: "var(--font-dm)", fontSize: "11px", fontWeight: 500,
    textTransform: "uppercase" as const, letterSpacing: "0.16em",
    color: "#743306", marginBottom: "0.75rem", display: "block",
    paddingTop: "0.75rem", borderTop: "1px solid rgba(219,146,23,0.25)",
  };

  const cardStyle = {
    background: "rgba(255,255,255,0.75)", backdropFilter: "blur(16px)",
    border: "1px solid rgba(219,146,23,0.30)", borderRadius: "16px",
    boxShadow: "0 4px 20px rgba(116,51,6,0.08)",
  };

  const renderDrinkRow = (item: Drink, color = "#E85E00", borderColor = "rgba(232,94,0,0.30)") => {
    const isSelected = !!(dishForm.drinks || []).find((d) => d.id === item.id);
    return (
      <button key={item.id} onClick={() => toggleDrink(item)}
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "0.7rem 1rem", borderRadius: "10px", cursor: "pointer", transition: "all 0.2s", background: isSelected ? `${color}18` : "rgba(255,255,255,0.5)", border: isSelected ? `1px solid ${borderColor}` : "1px solid rgba(219,146,23,0.20)", textAlign: "left" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ width: "16px", height: "16px", borderRadius: "4px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: isSelected ? color : "transparent", border: isSelected ? `1px solid ${color}` : "1px solid rgba(164,75,9,0.30)", transition: "all 0.2s" }}>
            {isSelected && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
          </div>
          <span style={{ fontFamily: "var(--font-dm)", fontSize: "0.875rem", color: isSelected ? "#743306" : "#A44B09", fontWeight: isSelected ? 500 : 300 }}>{item.name}</span>
        </div>
        <span style={{ fontFamily: "var(--font-dm)", fontSize: "0.875rem", color: isSelected ? color : "#DB9217", fontWeight: 600, flexShrink: 0 }}>+${Number(item.price).toFixed(2)}</span>
      </button>
    );
  };

  const renderDessertRow = (item: Dessert, color = "#DB9217", borderColor = "rgba(219,146,23,0.35)") => {
    const isSelected = !!(dishForm.desserts || []).find((d) => d.id === item.id);
    return (
      <button key={item.id} onClick={() => toggleDessert(item)}
        style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%", padding: "0.7rem 1rem", borderRadius: "10px", cursor: "pointer", transition: "all 0.2s", background: isSelected ? `${color}18` : "rgba(255,255,255,0.5)", border: isSelected ? `1px solid ${borderColor}` : "1px solid rgba(219,146,23,0.20)", textAlign: "left" }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
          <div style={{ width: "16px", height: "16px", borderRadius: "4px", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center", background: isSelected ? color : "transparent", border: isSelected ? `1px solid ${color}` : "1px solid rgba(164,75,9,0.30)", transition: "all 0.2s" }}>
            {isSelected && <svg width="10" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>}
          </div>
          <span style={{ fontFamily: "var(--font-dm)", fontSize: "0.875rem", color: isSelected ? "#743306" : "#A44B09", fontWeight: isSelected ? 500 : 300 }}>{item.name}</span>
        </div>
        <span style={{ fontFamily: "var(--font-dm)", fontSize: "0.875rem", color: isSelected ? color : "#DB9217", fontWeight: 600, flexShrink: 0 }}>+${Number(item.price).toFixed(2)}</span>
      </button>
    );
  };

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "4rem 0" }}>
        <div style={{ width: "40px", height: "40px", borderRadius: "50%", border: "2px solid rgba(194,61,12,0.20)", borderTop: "2px solid #C23D0C", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ─── CATEGORIES VIEW ───
  if (view === "categories") {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div>
            <h1 style={{ fontFamily: "var(--font-playfair)", fontWeight: 700, fontSize: "1.8rem", color: "#743306", marginBottom: "0.35rem" }}>
              Categories & Menu
            </h1>
            <p style={{ fontFamily: "var(--font-dm)", fontSize: "0.875rem", color: "#A44B09", fontWeight: 300 }}>
              {categories.length} categories · Click a category to manage its dishes.
            </p>
          </div>
          <button
            onClick={() => { setIsAddingCategory(true); setEditingCategoryId(null); setCategoryForm({ label: "", description: "" }); }}
            style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1.25rem", borderRadius: "100px", background: "linear-gradient(135deg, #C23D0C 0%, #743306 100%)", border: "none", color: "#ECD8B6", fontFamily: "var(--font-dm)", fontWeight: 500, fontSize: "0.875rem", cursor: "pointer", boxShadow: "0 4px 16px rgba(194,61,12,0.30)", transition: "all 0.2s", flexShrink: 0 }}
            onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-1px)")}
            onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
          >
            <Plus size={15} strokeWidth={2} />
            New Category
          </button>
        </div>

        {(isAddingCategory || editingCategoryId) && (
          <div style={{ ...cardStyle, padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <h2 style={{ fontFamily: "var(--font-playfair)", fontWeight: 700, fontSize: "1.1rem", color: "#743306" }}>
                {isAddingCategory ? "New Category" : "Edit Category"}
              </h2>
              <button onClick={resetCategoryForm} style={{ width: "32px", height: "32px", borderRadius: "50%", background: "rgba(164,75,9,0.08)", border: "1px solid rgba(219,146,23,0.25)", color: "#A44B09", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <X size={14} strokeWidth={2} />
              </button>
            </div>
            <div className="admin-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label style={labelStyle}>Category Name</label>
                <input style={inputStyle} placeholder="Category name" value={categoryForm.label} onChange={(e) => setCategoryForm((p) => ({ ...p, label: e.target.value }))} onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(194,61,12,0.50)")} onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(219,146,23,0.30)")} />
              </div>
              <div>
                <label style={labelStyle}>Description (optional)</label>
                <input style={inputStyle} placeholder="Short description..." value={categoryForm.description} onChange={(e) => setCategoryForm((p) => ({ ...p, description: e.target.value }))} onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(194,61,12,0.50)")} onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(219,146,23,0.30)")} />
              </div>
            </div>
            <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
              <button onClick={resetCategoryForm} style={{ padding: "0.75rem 1.5rem", borderRadius: "100px", background: "transparent", border: "1px solid rgba(164,75,9,0.25)", color: "#A44B09", fontFamily: "var(--font-dm)", fontSize: "0.875rem", cursor: "pointer" }}>Cancel</button>
              <button onClick={saveCategoryForm} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1.5rem", borderRadius: "100px", background: "linear-gradient(135deg, #C23D0C 0%, #743306 100%)", border: "none", color: "#ECD8B6", fontFamily: "var(--font-dm)", fontWeight: 500, fontSize: "0.875rem", cursor: "pointer", boxShadow: "0 4px 16px rgba(194,61,12,0.30)" }}>
                <Check size={15} strokeWidth={2} />
                {isAddingCategory ? "Create Category" : "Save Changes"}
              </button>
            </div>
          </div>
        )}

        {categories.length === 0 ? (
          <div style={{ ...cardStyle, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "5rem 2rem", gap: "1.5rem" }}>
            <p style={{ fontFamily: "var(--font-playfair)", fontWeight: 700, fontSize: "1.3rem", color: "rgba(194,61,12,0.4)" }}>No categories yet</p>
            <p style={{ fontFamily: "var(--font-dm)", fontSize: "0.875rem", color: "#A44B09", fontWeight: 300 }}>Create your first category to start adding dishes.</p>
            <button onClick={() => { setIsAddingCategory(true); setCategoryForm({ label: "", description: "" }); }} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1.5rem", borderRadius: "100px", background: "linear-gradient(135deg, #C23D0C 0%, #743306 100%)", border: "none", color: "#ECD8B6", fontFamily: "var(--font-dm)", fontWeight: 500, fontSize: "0.875rem", cursor: "pointer", boxShadow: "0 4px 16px rgba(194,61,12,0.30)" }}>
              <Plus size={15} strokeWidth={2} />
              New Category
            </button>
          </div>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "1rem" }}>
            {categories.map((cat) => {
              const count = dishes.filter((d) => d.categoryId === cat.id || d.category?.id === cat.id).length;
              return (
                <div
                  key={cat.id}
                  style={{ ...cardStyle, padding: "1.5rem", cursor: "pointer", transition: "all 0.2s", display: "flex", flexDirection: "column", gap: "1rem" }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(194,61,12,0.45)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(219,146,23,0.30)"; e.currentTarget.style.transform = "translateY(0)"; }}
                  onClick={() => openCategory(cat)}
                >
                  <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between" }}>
                    <div>
                      <h3 style={{ fontFamily: "var(--font-playfair)", fontWeight: 700, fontSize: "1.2rem", color: "#743306", marginBottom: "0.35rem" }}>{cat.label}</h3>
                      {cat.description && <p style={{ fontFamily: "var(--font-dm)", fontSize: "0.8rem", color: "#A44B09", fontWeight: 300 }}>{cat.description}</p>}
                    </div>
                    <ChevronRight size={18} strokeWidth={1.75} style={{ color: "#DB9217", flexShrink: 0 }} />
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <span style={{ fontFamily: "var(--font-dm)", fontSize: "11px", fontWeight: 500, color: "#C23D0C", background: "rgba(194,61,12,0.08)", border: "1px solid rgba(194,61,12,0.20)", padding: "0.2rem 0.65rem", borderRadius: "100px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                      {count} {count === 1 ? "dish" : "dishes"}
                    </span>
                    <div style={{ display: "flex", gap: "0.4rem" }} onClick={(e) => e.stopPropagation()}>
                      <button onClick={() => startEditCategory(cat)} style={{ width: "30px", height: "30px", borderRadius: "8px", background: "rgba(219,146,23,0.10)", border: "1px solid rgba(219,146,23,0.25)", color: "#DB9217", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(194,61,12,0.40)"; e.currentTarget.style.color = "#C23D0C"; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(219,146,23,0.25)"; e.currentTarget.style.color = "#DB9217"; }}>
                        <Pencil size={12} strokeWidth={1.75} />
                      </button>
                      {confirmDeleteCatId === cat.id ? (
                        <>
                          <button onClick={() => deleteCategory(cat.id)} style={{ padding: "0.2rem 0.6rem", borderRadius: "6px", background: "rgba(194,61,12,0.12)", border: "1px solid rgba(194,61,12,0.35)", color: "#C23D0C", cursor: "pointer", fontFamily: "var(--font-dm)", fontSize: "0.75rem" }}>Confirm</button>
                          <button onClick={() => setConfirmDeleteCatId(null)} style={{ padding: "0.2rem 0.6rem", borderRadius: "6px", background: "rgba(219,146,23,0.08)", border: "1px solid rgba(219,146,23,0.25)", color: "#A44B09", cursor: "pointer", fontFamily: "var(--font-dm)", fontSize: "0.75rem" }}>Cancel</button>
                        </>
                      ) : (
                        <button onClick={() => setConfirmDeleteCatId(cat.id)} style={{ width: "30px", height: "30px", borderRadius: "8px", background: "rgba(219,146,23,0.10)", border: "1px solid rgba(219,146,23,0.25)", color: "#DB9217", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(194,61,12,0.40)"; e.currentTarget.style.color = "#C23D0C"; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(219,146,23,0.25)"; e.currentTarget.style.color = "#DB9217"; }}>
                          <Trash2 size={12} strokeWidth={1.75} />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // ─── DISHES VIEW ───
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
          <button
            onClick={() => { setView("categories"); setSelectedCategory(null); resetDishForm(); }}
            style={{ display: "flex", alignItems: "center", gap: "0.5rem", background: "transparent", border: "none", color: "#A44B09", cursor: "pointer", fontFamily: "var(--font-dm)", fontSize: "0.875rem", padding: 0, transition: "color 0.2s" }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#743306")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#A44B09")}
          >
            <ArrowLeft size={16} strokeWidth={1.75} />
            Categories
          </button>
          <span style={{ color: "#DB9217" }}>/</span>
          <h1 style={{ fontFamily: "var(--font-playfair)", fontWeight: 700, fontSize: "1.5rem", color: "#743306" }}>
            {selectedCategory?.label}
          </h1>
        </div>
        <button
          onClick={startAddDish}
          style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1.25rem", borderRadius: "100px", background: "linear-gradient(135deg, #C23D0C 0%, #743306 100%)", border: "none", color: "#ECD8B6", fontFamily: "var(--font-dm)", fontWeight: 500, fontSize: "0.875rem", cursor: "pointer", boxShadow: "0 4px 16px rgba(194,61,12,0.30)", transition: "all 0.2s", flexShrink: 0 }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-1px)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
        >
          <Plus size={15} strokeWidth={2} />
          Add Dish
        </button>
      </div>

      {(isAddingDish || editingDishId) && (
        <div style={{ ...cardStyle, padding: "1.75rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <h2 style={{ fontFamily: "var(--font-playfair)", fontWeight: 700, fontSize: "1.2rem", color: "#743306" }}>
              {isAddingDish ? "New Dish" : "Edit Dish"}
            </h2>
            <button onClick={resetDishForm} style={{ width: "32px", height: "32px", borderRadius: "50%", background: "rgba(164,75,9,0.08)", border: "1px solid rgba(219,146,23,0.25)", color: "#A44B09", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <X size={14} strokeWidth={2} />
            </button>
          </div>

          <div className="admin-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div>
              <label style={labelStyle}>Name</label>
              <input style={inputStyle} value={dishForm.name || ""} onChange={(e) => { const val = e.target.value.replace(/[0-9]/g, ""); setDishForm((p) => ({ ...p, name: val })); }} placeholder="Dish name" onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(194,61,12,0.50)")} onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(219,146,23,0.30)")} />
            </div>
            <div>
              <label style={labelStyle}>Feeds (number of people)</label>
              <input style={{ ...inputStyle, appearance: "none" }} type="number" min="1" value={dishForm.feeds ?? ""} onChange={(e) => { const val = parseInt(e.target.value); if (e.target.value === "") { setDishForm((p) => ({ ...p, feeds: undefined })); } else if (val >= 1) { setDishForm((p) => ({ ...p, feeds: val })); } }} placeholder="Number of persons" onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(194,61,12,0.50)")} onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(219,146,23,0.30)")} />
            </div>
            <div>
              <label style={labelStyle}>Base Price ($)</label>
              <input style={{ ...inputStyle, appearance: "none" }} type="number" step="0.01" min="0" value={dishForm.originalPrice ?? dishForm.price ?? ""} onChange={(e) => { const basePrice = parseFloat(e.target.value); if (isNaN(basePrice)) { setDishForm((p) => ({ ...p, price: undefined, originalPrice: undefined })); return; } const discount = (dishForm as any).discountAmount || 0; const newPrice = discount ? parseFloat((basePrice - discount).toFixed(2)) : basePrice; const percent = discount && basePrice ? Math.round((discount / basePrice) * 100) : undefined; setDishForm((p) => ({ ...p, originalPrice: discount ? basePrice : undefined, price: newPrice > 0 ? newPrice : basePrice, discountPercent: percent })); }} placeholder="Price before discount" onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(194,61,12,0.50)")} onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(219,146,23,0.30)")} />
            </div>
            <div>
              <label style={labelStyle}>Discount ($) <span style={{ color: "#DB9217", fontWeight: 300, textTransform: "none", letterSpacing: 0, marginLeft: "0.5rem", fontSize: "10px" }}>leave empty for no discount</span></label>
              <input style={{ ...inputStyle, appearance: "none" }} type="number" step="0.01" min="0" value={(dishForm as any).discountAmount ?? ""} onChange={(e) => { const discount = parseFloat(e.target.value); const basePrice = dishForm.originalPrice || dishForm.price || 0; if (!discount || isNaN(discount)) { setDishForm((p) => ({ ...p, originalPrice: undefined, discountPercent: undefined, discountAmount: undefined, price: basePrice })); return; } if (discount >= basePrice) return; const newPrice = parseFloat((basePrice - discount).toFixed(2)); const percent = Math.round((discount / basePrice) * 100); setDishForm((p) => ({ ...p, originalPrice: basePrice, price: newPrice > 0 ? newPrice : basePrice, discountPercent: percent, discountAmount: discount })); }} placeholder="Discount amount" onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(194,61,12,0.50)")} onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(219,146,23,0.30)")} />
            </div>
          </div>

          {dishForm.originalPrice && dishForm.price && dishForm.originalPrice > dishForm.price && (
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 1rem", borderRadius: "10px", background: "rgba(219,146,23,0.10)", border: "1px solid rgba(219,146,23,0.30)" }}>
              <span style={{ fontFamily: "var(--font-dm)", fontSize: "0.8rem", color: "#A44B09" }}>Preview:</span>
              <span style={{ fontFamily: "var(--font-playfair)", fontWeight: 700, fontSize: "1rem", color: "#C23D0C" }}>${dishForm.price.toFixed(2)}</span>
              <span style={{ fontFamily: "var(--font-dm)", fontSize: "0.875rem", color: "#A44B09", textDecoration: "line-through" }}>${dishForm.originalPrice.toFixed(2)}</span>
              <span style={{ fontFamily: "var(--font-dm)", fontSize: "11px", fontWeight: 600, color: "#743306", background: "rgba(116,51,6,0.10)", border: "1px solid rgba(116,51,6,0.20)", padding: "0.2rem 0.6rem", borderRadius: "100px" }}>
                -{dishForm.discountPercent}% off
              </span>
            </div>
          )}

          <div>
            <label style={labelStyle}>Photo</label>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              {(dishForm as any).imageUrl && (
                <div style={{ position: "relative", width: "100%", height: "200px", borderRadius: "10px", overflow: "hidden", border: "1px solid rgba(219,146,23,0.30)" }}>
                  <img src={(dishForm as any).imageUrl} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center", display: "block" }} />
                  <button onClick={() => setDishForm((p) => ({ ...p, imageUrl: "" }))} style={{ position: "absolute", top: "0.5rem", right: "0.5rem", width: "28px", height: "28px", borderRadius: "50%", background: "rgba(116,51,6,0.75)", border: "none", color: "#ECD8B6", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <X size={14} strokeWidth={2} />
                  </button>
                </div>
              )}
              <label style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.75rem", padding: "0.85rem 1rem", borderRadius: "10px", cursor: uploadingImage ? "not-allowed" : "pointer", background: "rgba(255,255,255,0.5)", border: "1px dashed rgba(194,61,12,0.35)", color: "#A44B09", fontFamily: "var(--font-dm)", fontSize: "0.875rem", transition: "all 0.2s" }} onMouseEnter={(e) => { if (!uploadingImage) { e.currentTarget.style.borderColor = "rgba(194,61,12,0.65)"; e.currentTarget.style.color = "#743306"; } }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(194,61,12,0.35)"; e.currentTarget.style.color = "#A44B09"; }}>
                <input type="file" accept="image/*" onChange={handleImageUpload} style={{ display: "none" }} disabled={uploadingImage} />
                {uploadingImage ? "Uploading..." : (dishForm as any).imageUrl ? "Change photo" : "Upload photo"}
              </label>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Short Description</label>
            <input style={inputStyle} value={dishForm.description || ""} onChange={(e) => setDishForm((p) => ({ ...p, description: e.target.value }))} placeholder="Shown on the menu card" onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(194,61,12,0.50)")} onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(219,146,23,0.30)")} />
          </div>
          <div>
            <label style={labelStyle}>Full Description</label>
            <textarea style={{ ...inputStyle, resize: "none" }} rows={4} value={dishForm.longDescription || ""} onChange={(e) => setDishForm((p) => ({ ...p, longDescription: e.target.value }))} placeholder="Shown on the dish detail page" onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(194,61,12,0.50)")} onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(219,146,23,0.30)")} />
          </div>

          <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
            {[{ key: "popular", label: "Mark as Popular" }, { key: "spiceable", label: "Spice level option" }].map(({ key, label }) => (
              <label key={key} style={{ display: "flex", alignItems: "center", gap: "0.6rem", cursor: "pointer", fontFamily: "var(--font-dm)", fontSize: "0.875rem", color: "#A44B09" }}>
                <div onClick={() => setDishForm((p) => ({ ...p, [key]: !p[key as keyof Dish] }))} style={{ width: "40px", height: "22px", borderRadius: "100px", background: dishForm[key as keyof Dish] ? "#C23D0C" : "rgba(164,75,9,0.15)", border: "1px solid rgba(219,146,23,0.30)", position: "relative", cursor: "pointer", transition: "background 0.2s", flexShrink: 0 }}>
                  <div style={{ position: "absolute", top: "2px", left: dishForm[key as keyof Dish] ? "20px" : "2px", width: "16px", height: "16px", borderRadius: "50%", background: "white", transition: "left 0.2s" }} />
                </div>
                {label}
              </label>
            ))}
          </div>

          <div>
            <span style={sectionTitle}>Add-ons & Extras</span>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem", marginBottom: "0.75rem" }}>
              {(dishForm.supplements || []).map((s) => (
                <div key={s.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.6rem 1rem", borderRadius: "8px", background: "rgba(194,61,12,0.08)", border: "1px solid rgba(194,61,12,0.20)" }}>
                  <span style={{ fontFamily: "var(--font-dm)", fontSize: "0.875rem", color: "#743306" }}>{s.name}</span>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <span style={{ fontFamily: "var(--font-dm)", fontSize: "0.875rem", color: "#C23D0C", fontWeight: 600 }}>+${Number(s.price).toFixed(2)}</span>
                    <button onClick={() => removeSupplement(s.id)} style={{ width: "22px", height: "22px", borderRadius: "50%", background: "transparent", border: "1px solid rgba(194,61,12,0.30)", color: "#C23D0C", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <X size={10} strokeWidth={2.5} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {globalSupplements.length > 0 && (
              <>
                <p style={{ fontFamily: "var(--font-dm)", fontSize: "10px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.12em", color: "#DB9217", marginBottom: "0.5rem" }}>Recent add-ons</p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.4rem", marginBottom: "0.75rem" }}>
                  {globalSupplements.filter((s) => !(dishForm.supplements || []).find((ds) => ds.name === s.name)).map((s) => (
                    <button key={s.id} onClick={() => setDishForm((p) => ({ ...p, supplements: [...(p.supplements || []), { id: s.id, name: s.name, price: s.price }] }))} style={{ padding: "0.3rem 0.75rem", borderRadius: "100px", background: "rgba(255,255,255,0.6)", border: "1px solid rgba(219,146,23,0.30)", color: "#A44B09", fontFamily: "var(--font-dm)", fontSize: "0.78rem", cursor: "pointer", transition: "all 0.2s" }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(194,61,12,0.45)"; e.currentTarget.style.color = "#C23D0C"; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(219,146,23,0.30)"; e.currentTarget.style.color = "#A44B09"; }}>
                      + {s.name} (${Number(s.price).toFixed(2)})
                    </button>
                  ))}
                </div>
              </>
            )}

            <div style={{ display: "flex", gap: "0.5rem" }}>
              <input style={{ ...inputStyle, flex: 2 }} placeholder="Custom add-on name" value={supplementInput.name} onChange={(e) => setSupplementInput((p) => ({ ...p, name: e.target.value }))} onKeyDown={(e) => e.key === "Enter" && addSupplement()} onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(194,61,12,0.50)")} onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(219,146,23,0.30)")} />
              <input style={{ ...inputStyle, flex: 1, appearance: "none" }} placeholder="$0.00" type="number" step="0.25" min="0" value={supplementInput.price} onChange={(e) => setSupplementInput((p) => ({ ...p, price: e.target.value }))} onKeyDown={(e) => e.key === "Enter" && addSupplement()} onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(194,61,12,0.50)")} onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(219,146,23,0.30)")} />
              <button onClick={addSupplement} style={{ padding: "0.75rem 1rem", borderRadius: "10px", background: "rgba(194,61,12,0.10)", border: "1px solid rgba(194,61,12,0.25)", color: "#C23D0C", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s", flexShrink: 0 }} onMouseEnter={(e) => { e.currentTarget.style.background = "#C23D0C"; e.currentTarget.style.color = "#ECD8B6"; e.currentTarget.style.borderColor = "#C23D0C"; }} onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(194,61,12,0.10)"; e.currentTarget.style.color = "#C23D0C"; e.currentTarget.style.borderColor = "rgba(194,61,12,0.25)"; }}>
                <Plus size={16} strokeWidth={2} />
              </button>
            </div>
          </div>

          <div>
            <span style={sectionTitle}>Available Drinks</span>
            {availableDrinks.length === 0 ? (
              <p style={{ fontFamily: "var(--font-dm)", fontSize: "0.8rem", color: "#A44B09", fontWeight: 300 }}>No drinks yet — add some from <a href="/admin/addons" style={{ color: "#C23D0C", textDecoration: "none" }}>Drinks & Desserts</a>.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                {availableDrinks.map((drink) => renderDrinkRow(drink, "#E85E00", "rgba(232,94,0,0.30)"))}
              </div>
            )}
          </div>

          <div>
            <span style={sectionTitle}>Available Desserts</span>
            {availableDesserts.length === 0 ? (
              <p style={{ fontFamily: "var(--font-dm)", fontSize: "0.8rem", color: "#A44B09", fontWeight: 300 }}>No desserts yet — add some from <a href="/admin/addons" style={{ color: "#C23D0C", textDecoration: "none" }}>Drinks & Desserts</a>.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
                {availableDesserts.map((dessert) => renderDessertRow(dessert, "#DB9217", "rgba(219,146,23,0.35)"))}
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end", paddingTop: "0.5rem" }}>
            <button onClick={resetDishForm} style={{ padding: "0.75rem 1.5rem", borderRadius: "100px", background: "transparent", border: "1px solid rgba(164,75,9,0.25)", color: "#A44B09", fontFamily: "var(--font-dm)", fontSize: "0.875rem", cursor: "pointer" }}>Cancel</button>
            <button onClick={saveDishForm} style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1.5rem", borderRadius: "100px", background: "linear-gradient(135deg, #C23D0C 0%, #743306 100%)", border: "none", color: "#ECD8B6", fontFamily: "var(--font-dm)", fontWeight: 500, fontSize: "0.875rem", cursor: "pointer", boxShadow: "0 4px 16px rgba(194,61,12,0.30)" }}>
              <Check size={15} strokeWidth={2} />
              {isAddingDish ? "Add Dish" : "Save Changes"}
            </button>
          </div>
        </div>
      )}

      <div style={{ ...cardStyle, overflow: "hidden" }}>
        {categoryDishes.length === 0 && !isAddingDish && !editingDishId ? (
          <div style={{ padding: "4rem", textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
            <p style={{ fontFamily: "var(--font-playfair)", fontWeight: 700, fontSize: "1.2rem", color: "rgba(194,61,12,0.35)" }}>No dishes yet</p>
            <p style={{ fontFamily: "var(--font-dm)", fontSize: "0.875rem", color: "#A44B09", fontWeight: 300 }}>Click "Add Dish" to add your first dish in this category.</p>
          </div>
        ) : (
          <div className="admin-table-wrap" style={{ overflowX: "auto" }}>
            <div style={{ minWidth: "600px" }}>
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(219,146,23,0.20)", background: "rgba(236,216,182,0.25)" }}>
                    {["Dish", "Price", "Discount", "Feeds", "Add-ons", "Popular", "Actions"].map((h) => (
                      <th key={h} style={{ padding: "0.75rem 1.5rem", textAlign: "left", fontFamily: "var(--font-dm)", fontSize: "10px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.14em", color: "#A44B09", whiteSpace: "nowrap" }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {categoryDishes.map((dish, i) => (
                    <tr key={dish.id} style={{ borderBottom: i < categoryDishes.length - 1 ? "1px solid rgba(219,146,23,0.12)" : "none", transition: "background 0.15s", background: editingDishId === dish.id ? "rgba(194,61,12,0.05)" : "transparent" }} onMouseEnter={(e) => { if (editingDishId !== dish.id) e.currentTarget.style.background = "rgba(236,216,182,0.20)"; }} onMouseLeave={(e) => { if (editingDishId !== dish.id) e.currentTarget.style.background = "transparent"; }}>
                      <td style={{ padding: "1rem 1.5rem" }}>
                        <p style={{ fontFamily: "var(--font-playfair)", fontWeight: 700, fontSize: "0.95rem", color: "#743306", marginBottom: "0.2rem" }}>{dish.name}</p>
                        <p style={{ fontFamily: "var(--font-dm)", fontSize: "0.78rem", color: "#A44B09", fontWeight: 300, maxWidth: "200px" }}>{dish.description?.length > 45 ? dish.description.slice(0, 45) + "..." : dish.description}</p>
                      </td>
                      <td style={{ padding: "1rem 1.5rem" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.15rem" }}>
                          <span style={{ fontFamily: "var(--font-playfair)", fontSize: "1rem", color: "#C23D0C", fontWeight: 700, whiteSpace: "nowrap" }}>${Number(dish.price).toFixed(2)}</span>
                          {dish.originalPrice && <span style={{ fontFamily: "var(--font-dm)", fontSize: "0.75rem", color: "#DB9217", textDecoration: "line-through" }}>${Number(dish.originalPrice).toFixed(2)}</span>}
                        </div>
                      </td>
                      <td style={{ padding: "1rem 1.5rem" }}>
                        {dish.discountPercent ? (
                          <span style={{ fontFamily: "var(--font-dm)", fontSize: "11px", fontWeight: 600, color: "#743306", background: "rgba(116,51,6,0.10)", border: "1px solid rgba(116,51,6,0.20)", padding: "0.2rem 0.6rem", borderRadius: "100px" }}>-{dish.discountPercent}%</span>
                        ) : <span style={{ color: "#DB9217", fontFamily: "var(--font-dm)", fontSize: "0.875rem" }}>—</span>}
                      </td>
                      <td style={{ padding: "1rem 1.5rem", fontFamily: "var(--font-dm)", fontSize: "0.875rem", color: "#A44B09", whiteSpace: "nowrap" }}>{dish.feeds} {dish.feeds === 1 ? "person" : "people"}</td>
                      <td style={{ padding: "1rem 1.5rem" }}>
                        {dish.supplements?.length > 0 ? <span style={{ color: "#E85E00", fontFamily: "var(--font-dm)", fontSize: "0.875rem" }}>{dish.supplements.length} add-on{dish.supplements.length !== 1 ? "s" : ""}</span> : <span style={{ color: "#DB9217", fontFamily: "var(--font-dm)", fontSize: "0.875rem" }}>—</span>}
                      </td>
                      <td style={{ padding: "1rem 1.5rem" }}>
                        {dish.popular ? <span style={{ color: "#C23D0C", fontFamily: "var(--font-dm)", fontSize: "0.8rem", fontWeight: 500 }}>Yes</span> : <span style={{ color: "#DB9217", fontFamily: "var(--font-dm)", fontSize: "0.8rem" }}>—</span>}
                      </td>
                      <td style={{ padding: "1rem 1.5rem" }}>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                          <button onClick={() => startEditDish(dish)} style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(219,146,23,0.10)", border: "1px solid rgba(219,146,23,0.25)", color: "#DB9217", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(194,61,12,0.40)"; e.currentTarget.style.color = "#C23D0C"; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(219,146,23,0.25)"; e.currentTarget.style.color = "#DB9217"; }}>
                            <Pencil size={13} strokeWidth={1.75} />
                          </button>
                          {confirmDeleteDishId === dish.id ? (
                            <>
                              <button onClick={() => deleteDish(dish.id)} style={{ padding: "0.2rem 0.6rem", borderRadius: "6px", background: "rgba(194,61,12,0.12)", border: "1px solid rgba(194,61,12,0.35)", color: "#C23D0C", cursor: "pointer", fontFamily: "var(--font-dm)", fontSize: "0.75rem" }}>Confirm</button>
                              <button onClick={() => setConfirmDeleteDishId(null)} style={{ padding: "0.2rem 0.6rem", borderRadius: "6px", background: "rgba(219,146,23,0.08)", border: "1px solid rgba(219,146,23,0.25)", color: "#A44B09", cursor: "pointer", fontFamily: "var(--font-dm)", fontSize: "0.75rem" }}>Cancel</button>
                            </>
                          ) : (
                            <button onClick={() => setConfirmDeleteDishId(dish.id)} style={{ width: "32px", height: "32px", borderRadius: "8px", background: "rgba(219,146,23,0.10)", border: "1px solid rgba(219,146,23,0.25)", color: "#DB9217", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }} onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(194,61,12,0.40)"; e.currentTarget.style.color = "#C23D0C"; }} onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(219,146,23,0.25)"; e.currentTarget.style.color = "#DB9217"; }}>
                              <Trash2 size={13} strokeWidth={1.75} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}