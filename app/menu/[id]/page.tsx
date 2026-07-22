"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useCart } from "@/app/context/CartContext";
import { ArrowLeft, Minus, Plus, Flame } from "lucide-react";

type SpiceLevel = "mild" | "medium" | "hot" | "extra-hot";

const spiceLevels = [
  { id: "mild" as SpiceLevel, label: "Mild" },
  { id: "medium" as SpiceLevel, label: "Medium" },
  { id: "hot" as SpiceLevel, label: "Hot" },
  { id: "extra-hot" as SpiceLevel, label: "Extra Hot" },
];

export default function DishPage() {
  const params = useParams();
  const dishId = Array.isArray(params.id) ? params.id[0] : params.id as string;
  const router = useRouter();
  const { addItem, openCart } = useCart();

  const [dish, setDish] = useState<any>(null);
  const [isLoadingDish, setIsLoadingDish] = useState(true);
  const [supplementQty, setSupplementQty] = useState<Record<string, number>>({});
  const [drinkQty, setDrinkQty] = useState<Record<string, number>>({});
  const [dessertQty, setDessertQty] = useState<Record<string, number>>({});
  const [spiceLevel, setSpiceLevel] = useState<SpiceLevel>("medium");
  const [quantity, setQuantity] = useState(1);

  useEffect(() => {
    const fetchDish = async () => {
      try {
        const res = await fetch(`/api/menu/${dishId}`);
        if (!res.ok) { setDish(null); return; }
        const data = await res.json();
        setDish(data);
      } catch (error) {
        console.error("Failed to fetch dish:", error);
      } finally {
        setIsLoadingDish(false);
      }
    };
    fetchDish();
  }, [dishId]);

  if (isLoadingDish) {
    return (
      <div style={{ minHeight: "100vh", background: "#FAF6F0", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: "40px", height: "40px", borderRadius: "50%", border: "2px solid rgba(194,61,12,0.20)", borderTop: "2px solid #C23D0C", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!dish) {
    return (
      <div style={{ minHeight: "100vh", background: "#FAF6F0", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <p style={{ color: "#A44B09", fontFamily: "var(--font-dm)" }}>Dish not found.</p>
      </div>
    );
  }

  // Qty helpers
  const setQty = (setter: React.Dispatch<React.SetStateAction<Record<string, number>>>, id: string, delta: number) => {
    setter((prev) => {
      const current = prev[id] || 0;
      const next = Math.max(0, current + delta);
      if (next === 0) {
        const { [id]: _, ...rest } = prev;
        return rest;
      }
      return { ...prev, [id]: next };
    });
  };

  // Totaux
  const supplementsTotal = (dish.supplements || []).reduce((sum: number, s: any) => sum + (supplementQty[s.id] || 0) * s.price, 0);
  const drinksTotal = (dish.drinks || []).reduce((sum: number, d: any) => sum + (drinkQty[d.id] || 0) * d.price, 0);
  const dessertsTotal = (dish.desserts || []).reduce((sum: number, d: any) => sum + (dessertQty[d.id] || 0) * d.price, 0);
  const unitPrice = dish.price + supplementsTotal + drinksTotal + dessertsTotal;
  const totalPrice = unitPrice * quantity;
  const categoryLabel = dish.category?.label || "West African";

  const handleAddToCart = () => {
    const supplements = [
      ...(dish.supplements || []).flatMap((s: any) => Array(supplementQty[s.id] || 0).fill({ id: s.id, name: s.name, price: s.price })),
      ...(dish.drinks || []).flatMap((d: any) => Array(drinkQty[d.id] || 0).fill({ id: d.id, name: d.name, price: d.price })),
      ...(dish.desserts || []).flatMap((d: any) => Array(dessertQty[d.id] || 0).fill({ id: d.id, name: d.name, price: d.price })),
    ];
    for (let i = 0; i < quantity; i++) { addItem(dish, supplements); }
    openCart();
    router.back();
  };

  const rowButton = (isSelected: boolean, color: string, borderColor: string) => ({
    display: "flex", alignItems: "center", justifyContent: "space-between",
    width: "100%", padding: "0.85rem 1rem", borderRadius: "12px",
    cursor: "pointer", transition: "all 0.2s", textAlign: "left" as const,
    background: isSelected ? `${color}18` : "rgba(255,255,255,0.70)",
    border: isSelected ? `1px solid ${borderColor}` : "1px solid rgba(219,146,23,0.25)",
    boxShadow: "0 1px 4px rgba(116,51,6,0.05)",
  });

  const QtyControl = ({ qty, onInc, onDec, color }: { qty: number; onInc: () => void; onDec: () => void; color: string }) => (
    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexShrink: 0 }}>
      {qty > 0 && (
        <>
          <button onClick={(e) => { e.stopPropagation(); onDec(); }} style={{ width: "22px", height: "22px", borderRadius: "50%", background: `${color}18`, border: `1px solid ${color}44`, color, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}>
            <Minus size={10} strokeWidth={2.5} />
          </button>
          <span style={{ fontFamily: "var(--font-dm)", fontWeight: 600, fontSize: "0.875rem", color, minWidth: "16px", textAlign: "center" }}>{qty}</span>
        </>
      )}
      <button onClick={(e) => { e.stopPropagation(); onInc(); }} style={{ width: "22px", height: "22px", borderRadius: "50%", background: qty > 0 ? `${color}18` : "rgba(255,255,255,0.5)", border: `1px solid ${color}44`, color, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s" }}>
        <Plus size={10} strokeWidth={2.5} />
      </button>
    </div>
  );

  return (
    <div style={{ minHeight: "100vh", background: "#FAF6F0" }}>
      <div style={{ height: "80px" }} />
      <div style={{ maxWidth: "900px", margin: "0 auto", padding: "0 2rem 4rem" }}>
        <button
          onClick={() => router.back()}
          style={{ display: "inline-flex", alignItems: "center", gap: "0.5rem", background: "transparent", border: "none", color: "#A44B09", fontFamily: "var(--font-dm)", fontSize: "0.875rem", cursor: "pointer", padding: "0.5rem 0", marginBottom: "2rem", transition: "color 0.2s" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#743306")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#A44B09")}
        >
          <ArrowLeft size={16} strokeWidth={1.75} />
          Back to menu
        </button>

        <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>

          {/* Image */}
          <div style={{ width: "100%", height: "320px", borderRadius: "20px", background: "linear-gradient(135deg, #F5EFE6 0%, #EDE4D6 100%)", border: "1px solid rgba(219,146,23,0.30)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", boxShadow: "0 4px 24px rgba(116,51,6,0.10)" }}>
            {dish.imageUrl ? (
              <img src={dish.imageUrl} alt={dish.name} style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }} />
            ) : (
              <>
                <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, #743306 1px, transparent 1px)", backgroundSize: "24px 24px", opacity: 0.04 }} />
                <span style={{ fontFamily: "var(--font-playfair)", fontWeight: 700, fontSize: "2rem", color: "rgba(194,61,12,0.35)", textAlign: "center", padding: "0 2rem", position: "relative", zIndex: 1 }}>{dish.name}</span>
              </>
            )}
            {dish.popular && (
              <div style={{ position: "absolute", top: "1rem", left: "1rem", background: "rgba(194,61,12,0.85)", backdropFilter: "blur(6px)", border: "1px solid rgba(255,255,255,0.20)", color: "#ECD8B6", fontSize: "10px", fontWeight: 700, fontFamily: "var(--font-dm)", padding: "0.25rem 0.75rem", borderRadius: "100px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                🔥 Popular
              </div>
            )}
            <div style={{ position: "absolute", bottom: "1rem", right: "1rem", background: "rgba(236,216,182,0.85)", border: "1px solid rgba(219,146,23,0.35)", color: "#743306", fontSize: "10px", fontWeight: 500, fontFamily: "var(--font-dm)", padding: "0.25rem 0.75rem", borderRadius: "100px", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              For {dish.feeds} {dish.feeds === 1 ? "person" : "people"}
            </div>
          </div>

          {/* Title + price */}
          <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "1rem" }}>
            <div>
              <h1 style={{ fontFamily: "var(--font-playfair)", fontWeight: 700, fontSize: "clamp(1.8rem, 4vw, 2.4rem)", color: "#743306", lineHeight: 1.1, marginBottom: "0.4rem" }}>{dish.name}</h1>
              <span style={{ fontFamily: "var(--font-dm)", fontSize: "11px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.14em", color: "#C23D0C" }}>{categoryLabel}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.25rem", flexShrink: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                {dish.originalPrice && <span style={{ fontFamily: "var(--font-dm)", fontSize: "0.95rem", color: "#DB9217", textDecoration: "line-through", fontWeight: 300 }}>${dish.originalPrice.toFixed(2)}</span>}
                <span style={{ fontFamily: "var(--font-playfair)", fontWeight: 700, fontSize: "2rem", color: "#C23D0C" }}>${dish.price.toFixed(2)}</span>
              </div>
              {dish.discountPercent && (
                <span style={{ display: "inline-flex", alignItems: "center", padding: "0.2rem 0.65rem", borderRadius: "100px", background: "rgba(116,51,6,0.10)", border: "1px solid rgba(116,51,6,0.22)", color: "#743306", fontFamily: "var(--font-dm)", fontSize: "11px", fontWeight: 600 }}>
                  -{dish.discountPercent}% off
                </span>
              )}
            </div>
          </div>

          {/* Description */}
          <p style={{ fontFamily: "var(--font-dm)", fontWeight: 300, fontSize: "1rem", color: "#A44B09", lineHeight: 1.9, paddingBottom: "1.5rem", borderBottom: "1px solid rgba(219,146,23,0.20)" }}>
            {dish.longDescription}
          </p>

          {/* Spice level */}
          {dish.spiceable && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <p style={{ fontFamily: "var(--font-dm)", fontWeight: 500, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.16em", color: "#743306", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                <Flame size={13} strokeWidth={1.75} style={{ color: "#C23D0C" }} />
                Spice Level
              </p>
              <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
                {spiceLevels.map((level) => {
                  const isActive = spiceLevel === level.id;
                  return (
                    <button key={level.id} onClick={() => setSpiceLevel(level.id)} style={{ padding: "0.5rem 1.25rem", borderRadius: "100px", fontSize: "0.8rem", fontFamily: "var(--font-dm)", fontWeight: 500, cursor: "pointer", transition: "all 0.2s", background: isActive ? "#C23D0C" : "rgba(255,255,255,0.70)", border: isActive ? "1px solid #743306" : "1px solid rgba(164,75,9,0.25)", color: isActive ? "#FAF6F0" : "#A44B09", boxShadow: isActive ? "0 4px 16px rgba(194,61,12,0.25)" : "none" }}>
                      {level.label}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Supplements */}
          {(dish.supplements || []).length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <p style={{ fontFamily: "var(--font-dm)", fontWeight: 500, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.16em", color: "#743306" }}>
                Add-ons & Extras <span style={{ color: "#DB9217", fontWeight: 300, textTransform: "none", letterSpacing: 0, fontSize: "10px" }}></span>
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {dish.supplements.map((supplement: any) => {
                  const qty = supplementQty[supplement.id] || 0;
                  return (
                    <div key={supplement.id} style={rowButton(qty > 0, "#C23D0C", "rgba(194,61,12,0.35)")}>
                      <span style={{ fontFamily: "var(--font-dm)", fontSize: "0.9rem", color: qty > 0 ? "#743306" : "#A44B09", fontWeight: qty > 0 ? 500 : 300 }}>{supplement.name}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexShrink: 0 }}>
                        <span style={{ fontFamily: "var(--font-dm)", fontSize: "0.875rem", fontWeight: 600, color: qty > 0 ? "#C23D0C" : "#DB9217" }}>+${supplement.price.toFixed(2)}</span>
                        <QtyControl qty={qty} color="#C23D0C" onInc={() => setQty(setSupplementQty, supplement.id, 1)} onDec={() => setQty(setSupplementQty, supplement.id, -1)} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Drinks */}
          {(dish.drinks || []).length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <p style={{ fontFamily: "var(--font-dm)", fontWeight: 500, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.16em", color: "#743306" }}>
                Add a Drink <span style={{ color: "#DB9217", fontWeight: 300, textTransform: "none", letterSpacing: 0, fontSize: "10px" }}>— choose quantity</span>
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {dish.drinks.map((drink: any) => {
                  const qty = drinkQty[drink.id] || 0;
                  return (
                    <div key={drink.id} style={rowButton(qty > 0, "#E85E00", "rgba(232,94,0,0.35)")}>
                      <span style={{ fontFamily: "var(--font-dm)", fontSize: "0.9rem", color: qty > 0 ? "#743306" : "#A44B09", fontWeight: qty > 0 ? 500 : 300 }}>{drink.name}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexShrink: 0 }}>
                        <span style={{ fontFamily: "var(--font-dm)", fontSize: "0.875rem", fontWeight: 600, color: qty > 0 ? "#E85E00" : "#DB9217" }}>+${drink.price.toFixed(2)}</span>
                        <QtyControl qty={qty} color="#E85E00" onInc={() => setQty(setDrinkQty, drink.id, 1)} onDec={() => setQty(setDrinkQty, drink.id, -1)} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Desserts */}
          {(dish.desserts || []).length > 0 && (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
              <p style={{ fontFamily: "var(--font-dm)", fontWeight: 500, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.16em", color: "#743306" }}>
                Add a Dessert <span style={{ color: "#DB9217", fontWeight: 300, textTransform: "none", letterSpacing: 0, fontSize: "10px" }}>— choose quantity</span>
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {dish.desserts.map((dessert: any) => {
                  const qty = dessertQty[dessert.id] || 0;
                  return (
                    <div key={dessert.id} style={rowButton(qty > 0, "#DB9217", "rgba(219,146,23,0.40)")}>
                      <span style={{ fontFamily: "var(--font-dm)", fontSize: "0.9rem", color: qty > 0 ? "#743306" : "#A44B09", fontWeight: qty > 0 ? 500 : 300 }}>{dessert.name}</span>
                      <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexShrink: 0 }}>
                        <span style={{ fontFamily: "var(--font-dm)", fontSize: "0.875rem", fontWeight: 600, color: qty > 0 ? "#DB9217" : "#DB9217" }}>+${dessert.price.toFixed(2)}</span>
                        <QtyControl qty={qty} color="#DB9217" onInc={() => setQty(setDessertQty, dessert.id, 1)} onDec={() => setQty(setDessertQty, dessert.id, -1)} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Order Summary */}
          <div style={{ position: "sticky", bottom: "1.5rem", background: "rgba(255,255,255,0.85)", backdropFilter: "blur(16px)", border: "1px solid rgba(219,146,23,0.35)", borderRadius: "20px", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "1rem", boxShadow: "0 8px 32px rgba(116,51,6,0.12)" }}>
            <p style={{ fontFamily: "var(--font-dm)", fontWeight: 500, fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.16em", color: "#A44B09" }}>Order Summary</p>

            <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span style={{ fontFamily: "var(--font-dm)", fontSize: "0.875rem", color: "#A44B09" }}>{dish.name}</span>
                <span style={{ fontFamily: "var(--font-dm)", fontSize: "0.875rem", color: "#743306" }}>${dish.price.toFixed(2)}</span>
              </div>
              {(dish.supplements || []).filter((s: any) => supplementQty[s.id] > 0).map((s: any) => (
                <div key={s.id} style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontFamily: "var(--font-dm)", fontSize: "0.8rem", color: "#A44B09" }}>+ {s.name} ×{supplementQty[s.id]}</span>
                  <span style={{ fontFamily: "var(--font-dm)", fontSize: "0.8rem", color: "#A44B09" }}>+${(s.price * supplementQty[s.id]).toFixed(2)}</span>
                </div>
              ))}
              {(dish.drinks || []).filter((d: any) => drinkQty[d.id] > 0).map((d: any) => (
                <div key={d.id} style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontFamily: "var(--font-dm)", fontSize: "0.8rem", color: "#A44B09" }}>+ {d.name} ×{drinkQty[d.id]}</span>
                  <span style={{ fontFamily: "var(--font-dm)", fontSize: "0.8rem", color: "#A44B09" }}>+${(d.price * drinkQty[d.id]).toFixed(2)}</span>
                </div>
              ))}
              {(dish.desserts || []).filter((d: any) => dessertQty[d.id] > 0).map((d: any) => (
                <div key={d.id} style={{ display: "flex", justifyContent: "space-between" }}>
                  <span style={{ fontFamily: "var(--font-dm)", fontSize: "0.8rem", color: "#A44B09" }}>+ {d.name} ×{dessertQty[d.id]}</span>
                  <span style={{ fontFamily: "var(--font-dm)", fontSize: "0.8rem", color: "#A44B09" }}>+${(d.price * dessertQty[d.id]).toFixed(2)}</span>
                </div>
              ))}
            </div>

            <div style={{ borderTop: "1px solid rgba(219,146,23,0.20)" }} />

            {/* Quantity plat */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontFamily: "var(--font-dm)", fontSize: "0.875rem", color: "#A44B09" }}>Quantity</span>
              <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.35rem 0.75rem", borderRadius: "100px", border: "1px solid rgba(194,61,12,0.22)", background: "rgba(255,255,255,0.60)" }}>
                <button onClick={() => setQuantity((q) => Math.max(1, q - 1))} style={{ width: "24px", height: "24px", borderRadius: "50%", background: "rgba(194,61,12,0.10)", border: "none", color: "#C23D0C", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Minus size={11} strokeWidth={2.5} />
                </button>
                <span style={{ fontFamily: "var(--font-dm)", fontWeight: 500, fontSize: "0.9rem", color: "#743306", minWidth: "20px", textAlign: "center" }}>{quantity}</span>
                <button onClick={() => setQuantity((q) => q + 1)} style={{ width: "24px", height: "24px", borderRadius: "50%", background: "rgba(194,61,12,0.10)", border: "none", color: "#C23D0C", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <Plus size={11} strokeWidth={2.5} />
                </button>
              </div>
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontFamily: "var(--font-dm)", fontWeight: 500, fontSize: "0.875rem", color: "#743306" }}>Total</span>
              <span style={{ fontFamily: "var(--font-playfair)", fontWeight: 700, fontSize: "1.5rem", color: "#C23D0C" }}>${totalPrice.toFixed(2)}</span>
            </div>

            <button
              onClick={handleAddToCart}
              style={{ width: "100%", padding: "1rem", borderRadius: "100px", background: "linear-gradient(135deg, #C23D0C 0%, #743306 100%)", border: "none", color: "#FAF6F0", fontFamily: "var(--font-dm)", fontWeight: 500, fontSize: "0.95rem", cursor: "pointer", boxShadow: "0 8px 28px rgba(194,61,12,0.30)", transition: "all 0.2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-1px)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
            >
              Add to order — ${totalPrice.toFixed(2)}
            </button>
          </div>

        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}