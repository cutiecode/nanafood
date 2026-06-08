"use client";

import { useState } from "react";
import { X, Minus, Plus, ShoppingBag, Trash2 } from "lucide-react";
import { useCart } from "@/app/context/CartContext";
import { useSettings } from "@/app/context/SettingsContext";

export default function CartSidebar() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, totalPrice, totalItems, clearCart } = useCart();
  const settings = useSettings();
  const taxRate = settings.taxRate / 100;
  const taxMultiplier = 1 + taxRate;
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert("Something went wrong. Please try again.");
      }
    } catch (error) {
      console.error("Checkout error:", error);
      alert("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {isOpen && (
        <div onClick={closeCart} style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(116,51,6,0.45)", backdropFilter: "blur(6px)" }} />
      )}

      <div className="cart-sidebar-panel" style={{
        position: "fixed", top: 0, right: 0, height: "100dvh", zIndex: 51,
        width: "min(480px, 100vw)",
        background: "#FDF6EC",
        borderLeft: "1px solid rgba(219,146,23,0.30)",
        boxShadow: "-8px 0 40px rgba(116,51,6,0.15)",
        transform: isOpen ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.35s cubic-bezier(0.32, 0.72, 0, 1)",
        display: "flex", flexDirection: "column",
      }}>
        <div className="cart-sidebar-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1.5rem 1.75rem", borderBottom: "1px solid rgba(219,146,23,0.20)", flexShrink: 0, background: "#743306" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <ShoppingBag size={18} strokeWidth={1.5} style={{ color: "#ECD8B6", flexShrink: 0 }} />
            <span style={{ fontFamily: "var(--font-playfair)", fontWeight: 700, fontSize: "1.25rem", color: "#ECD8B6" }}>
              Your Order
            </span>
            {totalItems > 0 && (
              <span style={{ background: "#C23D0C", color: "#ECD8B6", width: "22px", height: "22px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: 700, fontFamily: "var(--font-dm)", flexShrink: 0 }}>
                {totalItems}
              </span>
            )}
          </div>
          <button
            onClick={closeCart}
            style={{ width: "36px", height: "36px", borderRadius: "50%", background: "rgba(236,216,182,0.15)", border: "1px solid rgba(236,216,182,0.25)", color: "#ECD8B6", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s", flexShrink: 0 }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(236,216,182,0.25)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(236,216,182,0.15)"; }}
          >
            <X size={15} strokeWidth={2} />
          </button>
        </div>

        {items.length === 0 && (
          <div className="cart-sidebar-empty" style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "1.25rem", padding: "2rem" }}>
            <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "rgba(194,61,12,0.08)", border: "1px solid rgba(194,61,12,0.20)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <ShoppingBag size={24} strokeWidth={1.25} style={{ color: "#C23D0C" }} />
            </div>
            <div style={{ textAlign: "center" }}>
              <p style={{ fontFamily: "var(--font-playfair)", fontWeight: 700, fontSize: "1.15rem", color: "#743306", marginBottom: "0.4rem" }}>Your cart is empty</p>
              <p style={{ fontFamily: "var(--font-dm)", fontSize: "0.875rem", color: "#A44B09", fontWeight: 300 }}>Add dishes from the menu to get started</p>
            </div>
            <button
              onClick={() => {
                closeCart();
                const menuSection = document.getElementById("menu");
                if (menuSection) {
                  menuSection.scrollIntoView({ behavior: "smooth" });
                } else {
                  window.location.href = "/#menu";
                }
              }}
              style={{ padding: "0.6rem 1.5rem", borderRadius: "100px", background: "rgba(194,61,12,0.08)", border: "1px solid rgba(194,61,12,0.22)", color: "#C23D0C", fontFamily: "var(--font-dm)", fontSize: "0.875rem", fontWeight: 500, cursor: "pointer" }}
            >
              Browse the menu
            </button>
          </div>
        )}

        {items.length > 0 && (
          <div className="cart-sidebar-list" style={{ flex: 1, overflowY: "auto", padding: "1.25rem 1.75rem", display: "flex", flexDirection: "column", gap: "1rem" }}>
            {items.map((item) => (
              <div key={item.id} className="cart-sidebar-item" style={{ background: "rgba(255,255,255,0.80)", backdropFilter: "blur(12px)", border: "1px solid rgba(219,146,23,0.25)", borderRadius: "14px", padding: "1rem 1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem", boxShadow: "0 2px 8px rgba(116,51,6,0.06)" }}>
                <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "0.75rem" }}>
                  <p style={{ fontFamily: "var(--font-playfair)", fontWeight: 700, fontSize: "1rem", color: "#743306", lineHeight: 1.3 }}>
                    {item.dish.name}
                  </p>
                  <button
                    onClick={() => removeItem(item.id)}
                    style={{ width: "28px", height: "28px", borderRadius: "50%", background: "transparent", border: "1px solid rgba(194,61,12,0.20)", color: "#A44B09", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, transition: "all 0.2s" }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(194,61,12,0.45)"; e.currentTarget.style.color = "#C23D0C"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(194,61,12,0.20)"; e.currentTarget.style.color = "#A44B09"; }}
                  >
                    <Trash2 size={12} strokeWidth={1.75} />
                  </button>
                </div>

                {item.selectedSupplements.length > 0 && (
                  <p style={{ fontFamily: "var(--font-dm)", fontSize: "0.78rem", color: "#A44B09", fontWeight: 300, lineHeight: 1.5 }}>
                    {item.selectedSupplements.map((s) => s.name).join(" - ")}
                  </p>
                )}

                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "0.6rem", borderTop: "1px solid rgba(219,146,23,0.15)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.6rem", padding: "0.3rem 0.6rem", borderRadius: "100px", border: "1px solid rgba(194,61,12,0.20)" }}>
                    <button onClick={() => updateQuantity(item.id, item.quantity - 1)} style={{ width: "22px", height: "22px", borderRadius: "50%", background: "rgba(194,61,12,0.10)", border: "none", color: "#C23D0C", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Minus size={10} strokeWidth={2.5} />
                    </button>
                    <span style={{ fontFamily: "var(--font-dm)", fontWeight: 500, fontSize: "0.875rem", color: "#743306", minWidth: "16px", textAlign: "center" }}>
                      {item.quantity}
                    </span>
                    <button onClick={() => updateQuantity(item.id, item.quantity + 1)} style={{ width: "22px", height: "22px", borderRadius: "50%", background: "rgba(194,61,12,0.10)", border: "none", color: "#C23D0C", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <Plus size={10} strokeWidth={2.5} />
                    </button>
                  </div>
                  <span style={{ fontFamily: "var(--font-playfair)", fontWeight: 700, fontSize: "1.1rem", color: "#C23D0C" }}>
                    ${(item.totalPrice * item.quantity).toFixed(2)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {items.length > 0 && (
          <div className="cart-sidebar-footer" style={{ padding: "1.25rem 1.75rem calc(2rem + env(safe-area-inset-bottom))", borderTop: "1px solid rgba(219,146,23,0.20)", display: "flex", flexDirection: "column", gap: "0.75rem", flexShrink: 0, background: "rgba(255,255,255,0.50)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontFamily: "var(--font-dm)", fontSize: "0.875rem", color: "#A44B09" }}>Subtotal</span>
              <span style={{ fontFamily: "var(--font-dm)", fontSize: "0.875rem", color: "#743306" }}>${totalPrice.toFixed(2)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: "1rem" }}>
              <span style={{ fontFamily: "var(--font-dm)", fontSize: "0.875rem", color: "#A44B09" }}>
                Tax ({settings.taxRate}% - {settings.address.split(",")[1]?.trim() || "Denver, CO"})
              </span>
              <span style={{ fontFamily: "var(--font-dm)", fontSize: "0.875rem", color: "#A44B09" }}>
                ${(totalPrice * taxRate).toFixed(2)}
              </span>
            </div>
            <div style={{ borderTop: "1px solid rgba(219,146,23,0.20)" }} />
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontFamily: "var(--font-dm)", fontWeight: 500, fontSize: "0.95rem", color: "#743306" }}>Total</span>
              <span style={{ fontFamily: "var(--font-playfair)", fontWeight: 700, fontSize: "1.4rem", color: "#743306" }}>
                ${(totalPrice * taxMultiplier).toFixed(2)}
              </span>
            </div>
            <button
              onClick={handleCheckout}
              disabled={isLoading}
              style={{ width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem 1.5rem", borderRadius: "100px", background: isLoading ? "rgba(194,61,12,0.5)" : "linear-gradient(135deg, #C23D0C 0%, #743306 100%)", border: "none", color: "#ECD8B6", fontFamily: "var(--font-dm)", fontWeight: 500, fontSize: "0.95rem", cursor: isLoading ? "not-allowed" : "pointer", boxShadow: isLoading ? "none" : "0 8px 28px rgba(194,61,12,0.30)", transition: "all 0.2s", opacity: isLoading ? 0.7 : 1, marginTop: "0.25rem" }}
              onMouseEnter={(e) => { if (!isLoading) e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <span>{isLoading ? "Redirecting to payment..." : "Proceed to Checkout"}</span>
              {!isLoading && <span style={{ fontWeight: 700 }}>${(totalPrice * taxMultiplier).toFixed(2)}</span>}
            </button>
            <button
              onClick={clearCart}
              style={{ background: "transparent", border: "none", color: "#A44B09", fontFamily: "var(--font-dm)", fontSize: "0.8rem", cursor: "pointer", textAlign: "center", transition: "color 0.2s" }}
              onMouseEnter={(e) => (e.currentTarget.style.color = "#743306")}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#A44B09")}
            >
              Clear cart
            </button>
          </div>
        )}
      </div>
    </>
  );
}
