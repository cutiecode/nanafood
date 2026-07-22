"use client";

import { useRouter } from "next/navigation";
import { Star } from "lucide-react";

type Dish = {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  imageUrl?: string;
  popular: boolean;
  feeds: number;
  category: { id: string; label: string } | string;
};

type Props = { dish: Dish };

export default function DishCard({ dish }: Props) {
  const router = useRouter();

  const categoryLabel =
    typeof dish.category === "string"
      ? dish.category
      : dish.category?.label || "West African";

  return (
    <div
      className="dish-card"
      style={{
        background: "rgba(255,255,255,0.80)",
        backdropFilter: "blur(16px)",
        border: "1px solid rgba(219,146,23,0.30)",
        borderRadius: "16px",
        overflow: "hidden",
        cursor: "pointer",
        transition: "all 0.3s",
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 2px 12px rgba(116,51,6,0.06)",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "rgba(194,61,12,0.45)";
        e.currentTarget.style.boxShadow = "0 20px 48px rgba(116,51,6,0.18)";
        e.currentTarget.style.transform = "translateY(-4px)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "rgba(219,146,23,0.30)";
        e.currentTarget.style.boxShadow = "0 2px 12px rgba(116,51,6,0.06)";
        e.currentTarget.style.transform = "translateY(0)";
      }}
      onClick={() => router.push(`/menu/${dish.id}`)}
    >
      <div
        className="dish-card-image"
        style={{
          width: "100%", height: "160px",
          background: "linear-gradient(135deg, #F5EFE6 0%, #EDE4D6 100%)",
          position: "relative", display: "flex",
          alignItems: "center", justifyContent: "center", overflow: "hidden",
        }}
      >
        {dish.imageUrl ? (
          <img
            src={dish.imageUrl}
            alt={dish.name}
            style={{ width: "100%", height: "100%", objectFit: "cover", position: "absolute", inset: 0 }}
          />
        ) : (
          <>
            <div style={{ position: "absolute", inset: 0, backgroundImage: "radial-gradient(circle, #743306 1px, transparent 1px)", backgroundSize: "20px 20px", opacity: 0.04 }} />
            <div style={{ position: "absolute", inset: 0, background: "radial-gradient(ellipse at center, rgba(194,61,12,0.10) 0%, transparent 70%)" }} />
            <span style={{ fontFamily: "var(--font-playfair)", fontWeight: 700, fontSize: "1.15rem", color: "rgba(194,61,12,0.35)", textAlign: "center", padding: "0 1.5rem", position: "relative", zIndex: 1 }}>
              {dish.name}
            </span>
          </>
        )}

        {dish.popular && (
          <div className="dish-card-popular-badge" style={{ position: "absolute", top: "12px", left: "12px", zIndex: 2, display: "flex", filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.45))" }}>
            <Star size={16} color="#FFA309" fill="#FFA309" strokeWidth={0} />
          </div>
        )}

        <div className="dish-card-badge" style={{ position: "absolute", top: "12px", right: "12px", background: "rgba(236,216,182,0.85)", border: "1px solid rgba(219,146,23,0.35)", color: "#743306", fontSize: "10px", fontWeight: 500, fontFamily: "var(--font-dm)", padding: "0.2rem 0.65rem", borderRadius: "100px", textTransform: "uppercase", letterSpacing: "0.1em", zIndex: 2 }}>
          {categoryLabel}
        </div>
      </div>

      <div className="dish-card-body" style={{ padding: "1.25rem", display: "flex", flexDirection: "column", gap: "0.75rem", flex: 1 }}>
        <div>
          <h3 style={{ fontFamily: "var(--font-playfair)", fontWeight: 700, fontSize: "1.1rem", color: "#743306", marginBottom: "0.4rem", lineHeight: 1.3 }}>
            {dish.name}
          </h3>
          <p style={{ fontFamily: "var(--font-dm)", fontWeight: 300, fontSize: "0.82rem", color: "#A44B09", lineHeight: 1.6, display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
            {dish.description}
          </p>
        </div>

        <div className="dish-card-price-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "0.75rem", borderTop: "1px solid rgba(219,146,23,0.20)" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.15rem" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}>
              <span className="dish-card-price" style={{ fontFamily: "var(--font-playfair)", fontWeight: 700, fontSize: "1.2rem", color: "#C23D0C" }}>
                ${dish.price.toFixed(2)}
              </span>
              {dish.originalPrice && (
                <span className="dish-card-price-original" style={{ fontFamily: "var(--font-dm)", fontSize: "0.8rem", color: "#DB9217", textDecoration: "line-through", fontWeight: 300 }}>
                  ${dish.originalPrice.toFixed(2)}
                </span>
              )}
            </div>
          </div>
          <span className="dish-card-cta" style={{ fontFamily: "var(--font-dm)", fontSize: "11px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.12em", color: "#C23D0C", background: "rgba(194,61,12,0.08)", border: "1px solid rgba(194,61,12,0.22)", padding: "0.35rem 0.9rem", borderRadius: "100px" }}>
            View dish
          </span>
        </div>
      </div>
    </div>
  );
}
