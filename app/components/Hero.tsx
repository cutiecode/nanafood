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
    <section className="hero-section" style={{ position: "relative", height: "100vh", minHeight: "100svh", width: "100%", display: "flex", alignItems: "center", overflow: "hidden", background: "#F5EDE0" }}>
      <div className="hero-background" style={{ position: "absolute", inset: 0, zIndex: 0, backgroundImage: "url('/nanabg.png')", backgroundSize: "cover", backgroundPosition: "right center", backgroundRepeat: "no-repeat" }} />

      <div className="hero-gradient" style={{ position: "absolute", inset: 0, zIndex: 1, background: "linear-gradient(90deg, rgba(245,237,224,1) 0%, rgba(245,237,224,0.97) 28%, rgba(245,237,224,0.7) 48%, rgba(245,237,224,0.1) 65%, transparent 100%)" }} />

      <div className="hero-content" style={{ position: "relative", zIndex: 2, width: "55%", maxWidth: "760px", padding: "0 0 0 6vw", display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "center", height: "100%" }}>
        <h1 style={{ fontFamily: "var(--font-playfair)", fontWeight: 900, lineHeight: 1.0, letterSpacing: "-0.02em", marginBottom: "3rem" }}>
          <span style={{ display: "block", color: "#1A0A00", fontSize: "clamp(2.5rem, 5vw, 5.5rem)" }}>The Taste of</span>
          <span style={{ display: "block", background: "linear-gradient(135deg, #C23D0C 0%, #E85E00 60%, #DB9217 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", fontSize: "clamp(3rem, 6.5vw, 7.5rem)", lineHeight: 0.95 }}>West Africa</span>
          <span style={{ display: "block", color: "#1A0A00", fontSize: "clamp(2.5rem, 5vw, 5.5rem)" }}>in Denver.</span>
        </h1>

        <div className="hero-stats" style={{ display: "flex", alignItems: "flex-end", gap: "3rem", marginBottom: "3rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
            <span style={{ fontFamily: "var(--font-playfair)", fontWeight: 700, fontSize: "3.5rem", color: "#C23D0C", lineHeight: 1 }}>100%</span>
            <span style={{ fontFamily: "var(--font-dm)", fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.20em", color: "#8C5A35" }}>African Ingredients</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
            <span style={{ fontFamily: "var(--font-playfair)", fontWeight: 700, fontSize: "2.5rem", color: "#A44B09", lineHeight: 1 }}>10+</span>
            <span style={{ fontFamily: "var(--font-dm)", fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.20em", color: "#8C5A35" }}>Signature Dishes</span>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.3rem" }}>
            <span style={{ fontFamily: "var(--font-playfair)", fontWeight: 700, fontSize: "2rem", color: "#DB9217", lineHeight: 1, fontStyle: "italic" }}>Fresh</span>
            <span style={{ fontFamily: "var(--font-dm)", fontSize: "10px", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.20em", color: "#8C5A35" }}>Made Daily</span>
          </div>
        </div>

        <form onSubmit={handleSearch} className="hero-search-form" style={{ width: "100%", maxWidth: "520px" }}>
          <div
            className="hero-search-shell"
            style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.7rem 0.7rem 0.7rem 1.5rem", borderRadius: "100px", background: "rgba(255,255,255,0.95)", border: "1.5px solid rgba(194,61,12,0.18)", boxShadow: "0 12px 40px rgba(116,51,6,0.14)", transition: "all 0.2s" }}
            onFocusCapture={(e) => { e.currentTarget.style.borderColor = "rgba(194,61,12,0.50)"; e.currentTarget.style.boxShadow = "0 0 0 4px rgba(194,61,12,0.08), 0 12px 40px rgba(116,51,6,0.14)"; }}
            onBlurCapture={(e) => { e.currentTarget.style.borderColor = "rgba(194,61,12,0.18)"; e.currentTarget.style.boxShadow = "0 12px 40px rgba(116,51,6,0.14)"; }}
          >
            <Search size={17} strokeWidth={1.75} style={{ color: "#A44B09", flexShrink: 0 }} />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search a dish, dessert, drink..."
              style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#1A0A00", fontFamily: "var(--font-dm)", fontSize: "0.9rem", fontWeight: 300, minWidth: 0 }}
            />
            <button
              type="submit"
              className="hero-search-button"
              style={{ padding: "0.75rem 2rem", borderRadius: "100px", background: "linear-gradient(135deg, #C23D0C 0%, #743306 100%)", border: "none", color: "#ECD8B6", fontFamily: "var(--font-dm)", fontWeight: 500, fontSize: "0.9rem", cursor: "pointer", boxShadow: "0 4px 16px rgba(194,61,12,0.35)", transition: "transform 0.2s", flexShrink: 0, whiteSpace: "nowrap" }}
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
