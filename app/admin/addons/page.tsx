"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, Pencil, X, Check } from "lucide-react";

type Item = { id: string; name: string; price: number; imageUrl?: string | null };
type EditForm = { name: string; price: string; imageUrl: string };

export default function AdminAddons() {
  const [drinks, setDrinks] = useState<Item[]>([]);
  const [desserts, setDesserts] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newDrink, setNewDrink] = useState({ name: "", price: "" });
  const [newDessert, setNewDessert] = useState({ name: "", price: "" });
  const [editingDrink, setEditingDrink] = useState<string | null>(null);
  const [editingDessert, setEditingDessert] = useState<string | null>(null);
  const [drinkEditForm, setDrinkEditForm] = useState<EditForm>({ name: "", price: "", imageUrl: "" });
  const [dessertEditForm, setDessertEditForm] = useState<EditForm>({ name: "", price: "", imageUrl: "" });
  const [uploadingNew, setUploadingNew] = useState<{ drink: boolean; dessert: boolean }>({ drink: false, dessert: false });
  const [newDrinkImage, setNewDrinkImage] = useState("");
  const [newDessertImage, setNewDessertImage] = useState("");
  const [formError, setFormError] = useState("");

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [drinkRes, dessertRes] = await Promise.all([fetch("/api/drinks"), fetch("/api/desserts")]);
      const [drinkData, dessertData] = await Promise.all([drinkRes.json(), dessertRes.json()]);
      setDrinks(Array.isArray(drinkData) ? drinkData : []);
      setDesserts(Array.isArray(dessertData) ? dessertData : []);
    } catch (error) { console.error("Failed to fetch:", error); }
    finally { setIsLoading(false); }
  };

  const handleUpload = async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const data = await res.json();
    return data.url || null;
  };

  const addDrink = async () => {
    if (!newDrink.name || !newDrink.price) return;
    if (parseFloat(newDrink.price) < 0) { setFormError("Price can't be negative."); return; }
    setFormError("");
    const res = await fetch("/api/drinks", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: newDrink.name, price: parseFloat(newDrink.price), imageUrl: newDrinkImage || null }) });
    const created = await res.json();
    setDrinks((prev) => [...prev, created]);
    setNewDrink({ name: "", price: "" });
    setNewDrinkImage("");
  };

  const updateDrink = async (id: string) => {
    if (parseFloat(drinkEditForm.price) < 0) { setFormError("Price can't be negative."); return; }
    setFormError("");
    const res = await fetch("/api/drinks", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, name: drinkEditForm.name, price: parseFloat(drinkEditForm.price), imageUrl: drinkEditForm.imageUrl || null }) });
    const updated = await res.json();
    setDrinks((prev) => prev.map((d) => d.id === id ? updated : d));
    setEditingDrink(null);
  };

  const deleteDrink = async (id: string) => {
    await fetch("/api/drinks", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setDrinks((prev) => prev.filter((d) => d.id !== id));
  };

  const addDessert = async () => {
    if (!newDessert.name || !newDessert.price) return;
    if (parseFloat(newDessert.price) < 0) { setFormError("Price can't be negative."); return; }
    setFormError("");
    const res = await fetch("/api/desserts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ name: newDessert.name, price: parseFloat(newDessert.price), imageUrl: newDessertImage || null }) });
    const created = await res.json();
    setDesserts((prev) => [...prev, created]);
    setNewDessert({ name: "", price: "" });
    setNewDessertImage("");
  };

  const updateDessert = async (id: string) => {
    if (parseFloat(dessertEditForm.price) < 0) { setFormError("Price can't be negative."); return; }
    setFormError("");
    const res = await fetch("/api/desserts", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, name: dessertEditForm.name, price: parseFloat(dessertEditForm.price), imageUrl: dessertEditForm.imageUrl || null }) });
    const updated = await res.json();
    setDesserts((prev) => prev.map((d) => d.id === id ? updated : d));
    setEditingDessert(null);
  };

  const deleteDessert = async (id: string) => {
    await fetch("/api/desserts", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setDesserts((prev) => prev.filter((d) => d.id !== id));
  };

  const inputStyle = {
    width: "100%", padding: "0.75rem 1rem", borderRadius: "10px",
    background: "rgba(255,255,255,0.70)", border: "1px solid rgba(219,146,23,0.30)",
    color: "#743306", fontFamily: "var(--font-dm)", fontSize: "0.875rem",
    outline: "none", transition: "border-color 0.2s",
  };

  const cardStyle = {
    background: "rgba(255,255,255,0.75)", backdropFilter: "blur(16px)" as const,
    border: "1px solid rgba(219,146,23,0.30)", borderRadius: "16px",
    overflow: "hidden" as const, boxShadow: "0 4px 20px rgba(116,51,6,0.08)",
  };

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "4rem 0" }}>
        <div style={{ width: "40px", height: "40px", borderRadius: "50%", border: "2px solid rgba(194,61,12,0.20)", borderTop: "2px solid #C23D0C", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const renderSection = (
    title: string,
    subtitle: string,
    accentColor: string,
    items: Item[],
    editingId: string | null,
    setEditingId: (id: string | null) => void,
    editForm: EditForm,
    setEditForm: (f: EditForm) => void,
    onUpdate: (id: string) => void,
    onDelete: (id: string) => void,
    onAdd: () => void,
    newItem: { name: string; price: string },
    setNewItem: (v: { name: string; price: string }) => void,
    newImage: string,
    setNewImage: (v: string) => void,
    uploadingNewKey: "drink" | "dessert",
    namePlaceholder: string,
  ) => (
    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
      <div>
        <h2 className="admin-card-title" style={{ fontFamily: "var(--font-playfair)", fontWeight: 700, fontSize: "1.3rem", color: "#743306", marginBottom: "0.2rem" }}>{title}</h2>
        <p style={{ fontFamily: "var(--font-dm)", fontSize: "0.8rem", color: "#A44B09", fontWeight: 300 }}>{items.length} items · {subtitle}</p>
      </div>

      <div style={cardStyle}>
        <div className="admin-addon-list" style={{ padding: "1.25rem 1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          {items.length === 0 && (
            <p style={{ fontFamily: "var(--font-dm)", fontSize: "0.875rem", color: "#A44B09", fontWeight: 300, padding: "1rem 0" }}>
              No items yet — add one below.
            </p>
          )}
          {items.map((item, i) => (
            <div key={item.id}>
              {editingId === item.id ? (
                <div style={{ padding: "1rem", borderRadius: "10px", background: `${accentColor}10`, border: `1px solid ${accentColor}33`, display: "flex", flexDirection: "column", gap: "0.75rem" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
                    <input style={inputStyle} value={editForm.name} onChange={(e) => setEditForm({ ...editForm, name: e.target.value })} placeholder="Name" onFocus={(e) => (e.currentTarget.style.borderColor = `${accentColor}88`)} onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(219,146,23,0.30)")} />
                    <input style={{ ...inputStyle, appearance: "none" }} type="number" step="0.25" min="0" value={editForm.price} onChange={(e) => setEditForm({ ...editForm, price: e.target.value })} placeholder="Price" onFocus={(e) => (e.currentTarget.style.borderColor = `${accentColor}88`)} onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(219,146,23,0.30)")} />
                  </div>
                  {editForm.imageUrl && (
                    <div style={{ position: "relative", width: "100%", height: "120px", borderRadius: "8px", overflow: "hidden", border: `1px solid ${accentColor}44` }}>
                      <img src={editForm.imageUrl} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                      <button onClick={() => setEditForm({ ...editForm, imageUrl: "" })} style={{ position: "absolute", top: "0.4rem", right: "0.4rem", width: "24px", height: "24px", borderRadius: "50%", background: "rgba(116,51,6,0.7)", border: "none", color: "#ECD8B6", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <X size={12} strokeWidth={2} />
                      </button>
                    </div>
                  )}
                  <label style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", padding: "0.6rem 1rem", borderRadius: "8px", cursor: "pointer", background: "rgba(255,255,255,0.5)", border: `1px dashed ${accentColor}55`, color: "#A44B09", fontFamily: "var(--font-dm)", fontSize: "0.8rem" }}>
                    <input type="file" accept="image/*" style={{ display: "none" }} onChange={async (e) => { const file = e.target.files?.[0]; if (!file) return; const url = await handleUpload(file); if (url) setEditForm({ ...editForm, imageUrl: url }); }} />
                    {editForm.imageUrl ? "Change photo" : "Upload photo"}
                  </label>
                  <div style={{ display: "flex", gap: "0.5rem", justifyContent: "flex-end" }}>
                    <button onClick={() => setEditingId(null)} style={{ padding: "0.5rem 1rem", borderRadius: "8px", background: "transparent", border: "1px solid rgba(164,75,9,0.25)", color: "#A44B09", fontFamily: "var(--font-dm)", fontSize: "0.8rem", cursor: "pointer" }}>Cancel</button>
                    <button onClick={() => onUpdate(item.id)} style={{ display: "flex", alignItems: "center", gap: "0.4rem", padding: "0.5rem 1rem", borderRadius: "8px", background: accentColor, border: "none", color: "#ECD8B6", fontFamily: "var(--font-dm)", fontSize: "0.8rem", cursor: "pointer" }}>
                      <Check size={13} strokeWidth={2} /> Save
                    </button>
                  </div>
                </div>
              ) : (
                <div
                  style={{ display: "flex", alignItems: "center", gap: "1rem", padding: "0.85rem 1rem", borderRadius: "10px", borderBottom: i < items.length - 1 ? "1px solid rgba(219,146,23,0.12)" : "none", transition: "background 0.15s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(236,216,182,0.20)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  {item.imageUrl ? (
                    <div style={{ width: "44px", height: "44px", borderRadius: "8px", overflow: "hidden", flexShrink: 0, border: `1px solid ${accentColor}33` }}>
                      <img src={item.imageUrl} alt={item.name} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    </div>
                  ) : (
                    <div style={{ width: "44px", height: "44px", borderRadius: "8px", background: "rgba(219,146,23,0.10)", border: "1px solid rgba(219,146,23,0.20)", flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <span style={{ fontSize: "18px" }}>🖼</span>
                    </div>
                  )}
                  <span style={{ fontFamily: "var(--font-dm)", fontSize: "0.875rem", color: "#743306", flex: 1 }}>{item.name}</span>
                  <span style={{ fontFamily: "var(--font-playfair)", fontSize: "0.95rem", color: accentColor, fontWeight: 700, flexShrink: 0 }}>
                    ${Number(item.price).toFixed(2)}
                  </span>
                  <div style={{ display: "flex", gap: "0.4rem", flexShrink: 0 }}>
                    <button
                      onClick={() => { setEditingId(item.id); setEditForm({ name: item.name, price: String(item.price), imageUrl: item.imageUrl || "" }); }}
                      style={{ width: "28px", height: "28px", borderRadius: "7px", background: "rgba(219,146,23,0.10)", border: "1px solid rgba(219,146,23,0.25)", color: "#DB9217", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${accentColor}66`; e.currentTarget.style.color = accentColor; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(219,146,23,0.25)"; e.currentTarget.style.color = "#DB9217"; }}
                    >
                      <Pencil size={11} strokeWidth={1.75} />
                    </button>
                    <button
                      onClick={() => onDelete(item.id)}
                      style={{ width: "28px", height: "28px", borderRadius: "7px", background: "transparent", border: "1px solid rgba(194,61,12,0.20)", color: "#A44B09", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(194,61,12,0.50)"; e.currentTarget.style.color = "#C23D0C"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(194,61,12,0.20)"; e.currentTarget.style.color = "#A44B09"; }}
                    >
                      <Trash2 size={11} strokeWidth={1.75} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Add new */}
        <div className="admin-addon-list" style={{ padding: "1.25rem 1.5rem", borderTop: "1px solid rgba(219,146,23,0.15)", display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {newImage && (
            <div style={{ position: "relative", width: "100%", height: "100px", borderRadius: "8px", overflow: "hidden", border: `1px solid ${accentColor}33` }}>
              <img src={newImage} alt="preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <button onClick={() => setNewImage("")} style={{ position: "absolute", top: "0.4rem", right: "0.4rem", width: "24px", height: "24px", borderRadius: "50%", background: "rgba(116,51,6,0.7)", border: "none", color: "#ECD8B6", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <X size={12} strokeWidth={2} />
              </button>
            </div>
          )}
          <div style={{ display: "flex", gap: "0.5rem" }}>
            <input
              style={{ ...inputStyle, flex: 2 }}
              placeholder={namePlaceholder}
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && onAdd()}
              onFocus={(e) => (e.currentTarget.style.borderColor = `${accentColor}66`)}
              onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(219,146,23,0.30)")}
            />
            <input
              style={{ ...inputStyle, flex: 1, appearance: "none" }}
              placeholder="$0.00" type="number" step="0.25" min="0"
              value={newItem.price}
              onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
              onKeyDown={(e) => e.key === "Enter" && onAdd()}
              onFocus={(e) => (e.currentTarget.style.borderColor = `${accentColor}66`)}
              onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(219,146,23,0.30)")}
            />
            <label
              style={{ padding: "0.75rem 1rem", borderRadius: "10px", background: "rgba(255,255,255,0.5)", border: `1px dashed ${accentColor}44`, color: "#A44B09", cursor: uploadingNew[uploadingNewKey] ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s" }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = `${accentColor}88`; e.currentTarget.style.color = "#743306"; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = `${accentColor}44`; e.currentTarget.style.color = "#A44B09"; }}
            >
              <input type="file" accept="image/*" style={{ display: "none" }} disabled={uploadingNew[uploadingNewKey]}
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  setUploadingNew((p) => ({ ...p, [uploadingNewKey]: true }));
                  const url = await handleUpload(file);
                  if (url) setNewImage(url);
                  setUploadingNew((p) => ({ ...p, [uploadingNewKey]: false }));
                }}
              />
              {uploadingNew[uploadingNewKey] ? "..." : "📷"}
            </label>
            <button
              onClick={onAdd}
              style={{ padding: "0.75rem 1.25rem", borderRadius: "10px", background: `linear-gradient(135deg, #C23D0C 0%, #743306 100%)`, border: "none", color: "#ECD8B6", cursor: "pointer", display: "flex", alignItems: "center", gap: "0.4rem", fontFamily: "var(--font-dm)", fontSize: "0.875rem", fontWeight: 500, flexShrink: 0, boxShadow: "0 4px 12px rgba(194,61,12,0.25)", transition: "all 0.2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-1px)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
            >
              <Plus size={15} strokeWidth={2} />
              Add
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>
      <div className="admin-page-head">
        <h1 className="admin-page-title" style={{ fontFamily: "var(--font-playfair)", fontWeight: 700, fontSize: "1.8rem", color: "#743306", marginBottom: "0.35rem" }}>
          Drinks & Desserts
        </h1>
        <p className="admin-page-subtitle" style={{ fontFamily: "var(--font-dm)", fontSize: "0.875rem", color: "#A44B09", fontWeight: 300 }}>
          Manage your drinks and desserts — with photos, prices and names.
        </p>
      </div>

      {formError && (
        <p style={{ fontFamily: "var(--font-dm)", fontSize: "0.8rem", color: "#C23D0C", background: "rgba(194,61,12,0.08)", border: "1px solid rgba(194,61,12,0.25)", borderRadius: "8px", padding: "0.6rem 1rem" }}>
          {formError}
        </p>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "2rem" }}>
        {renderSection("Drinks", "Beverages available on the site", "#E85E00", drinks, editingDrink, setEditingDrink, drinkEditForm, setDrinkEditForm, updateDrink, deleteDrink, addDrink, newDrink, setNewDrink, newDrinkImage, setNewDrinkImage, "drink", "e.g. Bissap, Ginger lemonade...")}
        {renderSection("Desserts", "Sweet endings available on the site", "#DB9217", desserts, editingDessert, setEditingDessert, dessertEditForm, setDessertEditForm, updateDessert, deleteDessert, addDessert, newDessert, setNewDessert, newDessertImage, setNewDessertImage, "dessert", "e.g. Chin chin, Beignets...")}
      </div>
    </div>
  );
}