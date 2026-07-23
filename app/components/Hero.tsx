"use client";

import { useState } from "react";
import { Search } from "lucide-react";

export default function Hero() {
  const [query, setQuery] = useState("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    const menuSection = document.getElementById("menu");
    if (menuSection) {
      menuSection.scrollIntoView({ behavior: "smooth" });
      window.dispatchEvent(new CustomEvent("nanafood:search", { detail: query.trim() }));
    }
  };

  return (
    <section className="hero-section" style={{ position: "relative", width: "100%", marginTop: "56px", aspectRatio: "1536 / 1024", overflow: "hidden", background: "#F5EDE0" }}>
      <div className="hero-background" style={{ position: "absolute", inset: 0, zIndex: 0, backgroundImage: "url('/nanabg.png')", backgroundSize: "cover", backgroundPosition: "right center", backgroundRepeat: "no-repeat" }} />

      <div className="hero-gradient" style={{ position: "absolute", inset: 0, zIndex: 1, background: "none" }} />

      <div className="hero-content" style={{ position: "absolute", inset: 0, zIndex: 2, width: "58%", maxWidth: "900px", padding: "0 0 0 4rem", display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "center" }}>
        <h1 style={{ fontFamily: "var(--font-playfair)", fontWeight: 900, lineHeight: 1.0, letterSpacing: "-0.02em", marginBottom: "3rem" }}>
          <span className="hero-title-line" style={{ display: "block", color: "#743306", fontSize: "clamp(2.5rem, 5vw, 5.5rem)" }}>Nana's</span>
          <span className="hero-title-line" style={{ display: "block", background: "linear-gradient(135deg, #C23D0C 0%, #E85E00 60%, #DB9217 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontSize: "clamp(3rem, 5.5vw, 6.5rem)", lineHeight: 0.95, whiteSpace: "nowrap" }}>African Foods</span>

        </h1>

        <div className="hero-stats" style={{ display: "flex", alignItems: "flex-end", gap: "3rem", marginBottom: "3rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
            <span className="hero-stat-value" style={{ fontFamily: "var(--font-playfair)", fontWeight: 700, fontSize: "clamp(3.5rem, 3vw, 4.5rem)", color: "#C23D0C", lineHeight: 1 }}>100%</span>
            <span className="hero-stat-label" style={{ fontFamily: "var(--font-dm)", fontSize: "clamp(10px, 0.6vw, 13px)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.20em", color: "#8C5A35" }}>African Ingredients</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
            <span className="hero-stat-value" style={{ fontFamily: "var(--font-playfair)", fontWeight: 700, fontSize: "clamp(2.5rem, 2.2vw, 3.2rem)", color: "#A44B09", lineHeight: 1 }}>10+</span>
            <span className="hero-stat-label" style={{ fontFamily: "var(--font-dm)", fontSize: "clamp(10px, 0.6vw, 13px)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.20em", color: "#8C5A35" }}>Signature Dishes</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
            <span className="hero-stat-value" style={{ fontFamily: "var(--font-playfair)", fontWeight: 700, fontSize: "clamp(2rem, 1.8vw, 2.6rem)", color: "#DB9217", lineHeight: 1, fontStyle: "italic" }}>Fresh</span>
            <span className="hero-stat-label" style={{ fontFamily: "var(--font-dm)", fontSize: "clamp(10px, 0.6vw, 13px)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.20em", color: "#8C5A35" }}>Made Daily</span>
          </div>
        </div>

        <form onSubmit={handleSearch} className="hero-search-form" style={{ width: "100%", maxWidth: "clamp(520px, 32vw, 700px)" }}>
          <div
            className="hero-search-shell"
            style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "clamp(0.7rem, 0.8vw, 0.95rem) clamp(0.7rem, 0.8vw, 0.95rem) clamp(0.7rem, 0.8vw, 0.95rem) clamp(1.5rem, 1.6vw, 1.9rem)", borderRadius: "100px", background: "rgba(255,255,255,0.95)", border: "1.5px solid rgba(194,61,12,0.18)", boxShadow: "0 12px 40px rgba(116,51,6,0.14)", transition: "all 0.2s" }}
            onFocusCapture={(e) => { e.currentTarget.style.borderColor = "rgba(194,61,12,0.50)"; e.currentTarget.style.boxShadow = "0 0 0 4px rgba(194,61,12,0.08), 0 12px 40px rgba(116,51,6,0.14)"; }}
            onBlurCapture={(e) => { e.currentTarget.style.borderColor = "rgba(194,61,12,0.18)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(116,51,6,0.14)"; }}
          >
            <Search size={17} strokeWidth={1.75} style={{ color: "#A44B09", flexShrink: 0 }} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search a dish, dessert, drink..."
              style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#1A0A00", fontFamily: "var(--font-dm)", fontSize: "clamp(0.9rem, 1vw, 1.15rem)", fontWeight: 300, minWidth: 0 }}
            />
            <button
              type="submit"
              className="hero-search-button"
              style={{ padding: "clamp(0.75rem, 0.9vw, 1rem) clamp(2rem, 2.2vw, 2.5rem)", borderRadius: "100px", background: "linear-gradient(135deg, #C23D0C 0%, #743306 100%)", border: "none", color: "#ECD8B6", fontFamily: "var(--font-dm)", fontWeight: 500, fontSize: "clamp(0.9rem, 1vw, 1.15rem)", cursor: "pointer", boxShadow: "0 4px 16px rgba(194,61,12,0.35)", transition: "transform 0.2s", flexShrink: 0, whiteSpace: "nowrap" }}
              onMouseEnter={(e) => (e.currentTarget.style.transform = "scale(1.03)")}
              onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
            >
              Search
            </button>
          </div>
        </form>
      </div>

      <div className="hero-bottom-fade" style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "150px", background: "linear-gradient(to top, #FAF6F0 0%, transparent 100%)", zIndex: 2, pointerEvents: "none" }} />
    </section>
  );
}
