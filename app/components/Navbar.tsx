"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/app/context/CartContext";
import { useSettings } from "@/app/context/SettingsContext";
import { ShoppingBag, MapPin, Menu, X } from "lucide-react";

export default function Navbar() {
  const { totalItems, isOpen: isCartOpen, openCart, closeCart } = useCart();
  const settings = useSettings();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const highlightIdx = settings.restaurantName.toLowerCase().indexOf("african foods");
  const before = highlightIdx >= 0 ? settings.restaurantName.slice(0, highlightIdx) : settings.restaurantName;
  const after = highlightIdx >= 0 ? settings.restaurantName.slice(highlightIdx) : "";
  const links = [
    { label: "Menu", href: "#menu" },
    { label: "Drinks", href: "#drinks" },
    { label: "Desserts", href: "#desserts" },
    { label: "Contact", href: "#contact" },
  ];

  const closeMenu = () => setIsMenuOpen(false);

  useEffect(() => {
    document.body.classList.toggle("public-nav-open", isMenuOpen);
    return () => document.body.classList.remove("public-nav-open");
  }, [isMenuOpen]);

  return (
    <>
      <header
        style={{
          position: "fixed", top: 0, left: 0, right: 0, zIndex: 80,
          backdropFilter: "blur(16px)",
          background: "rgba(116,51,6,0.95)",
          borderBottom: "1px solid rgba(219,146,23,0.25)",
          boxShadow: "0 2px 20px rgba(116,51,6,0.20)",
        }}
      >
        <div
          className="public-navbar-inner"
          style={{
            maxWidth: "1100px", margin: "0 auto", padding: "0 2rem",
            height: "56px", display: "flex", alignItems: "center",
            justifyContent: "space-between", gap: "1rem",
          }}
        >
          <a
            href="/"
            onClick={closeMenu}
            className="public-navbar-logo"
            style={{ fontFamily: "var(--font-playfair)", fontWeight: 900, fontSize: "1.1rem", textDecoration: "none", whiteSpace: "nowrap", display: "inline-block" }}
          >
            <span style={{ color: "#ECD8B6" }}>{before}</span>
            <span style={{ color: "#FFA309" }}>{after}</span>
          </a>

          <nav style={{ display: "flex", alignItems: "center", gap: "2.5rem" }} className="hidden-mobile">
            {links.map(({ label, href }) => (
              <a
                key={label}
                href={href}
                style={{ fontFamily: "var(--font-dm)", fontSize: "11px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.16em", color: "#F4A829", textDecoration: "none", transition: "color 0.2s", whiteSpace: "nowrap" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#ECD8B6")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#F4A829")}
              >
                {label}
              </a>
            ))}
          </nav>

          <div className="public-navbar-actions" style={{ display: "flex", alignItems: "center", gap: "1.25rem", flexShrink: 0 }}>
            <div className="hidden-mobile" style={{ display: "flex", alignItems: "center", gap: "0.4rem", color: "#ECD8B6", fontFamily: "var(--font-dm)", fontSize: "0.75rem", fontWeight: 500, whiteSpace: "nowrap" }}>
              <MapPin size={14} strokeWidth={2} />
              <span style={{ display: "inline-block" }}>{settings.address.split(",")[1]?.trim() || "Denver, CO"}</span>
            </div>

            <button
              onClick={() => {
                closeMenu();
                if (isCartOpen) {
                  closeCart();
                } else {
                  openCart();
                }
              }}
              style={{ position: "relative", width: "40px", height: "40px", borderRadius: "50%", background: "rgba(236,216,182,0.12)", border: "1px solid rgba(236,216,182,0.25)", color: "#ECD8B6", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.2s", flexShrink: 0 }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(236,216,182,0.22)"; e.currentTarget.style.borderColor = "rgba(236,216,182,0.45)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(236,216,182,0.12)"; e.currentTarget.style.borderColor = "rgba(236,216,182,0.25)"; }}
            >
              <ShoppingBag size={16} strokeWidth={1.5} />
              {totalItems > 0 && (
                <span style={{ position: "absolute", top: "-4px", right: "-4px", width: "18px", height: "18px", borderRadius: "50%", background: "#C23D0C", color: "#ECD8B6", fontSize: "10px", fontWeight: 700, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-dm)" }}>
                  {totalItems}
                </span>
              )}
            </button>

            <button
              type="button"
              className="public-navbar-menu-button"
              aria-expanded={isMenuOpen}
              aria-label={isMenuOpen ? "Close navigation menu" : "Open navigation menu"}
              onClick={() => setIsMenuOpen((prev) => !prev)}
              style={{ width: "40px", height: "40px", borderRadius: "50%", background: "rgba(236,216,182,0.12)", border: "1px solid rgba(236,216,182,0.25)", color: "#ECD8B6", cursor: "pointer", alignItems: "center", justifyContent: "center", transition: "all 0.2s", flexShrink: 0 }}
            >
              {isMenuOpen ? <X size={17} strokeWidth={1.8} /> : <Menu size={17} strokeWidth={1.8} />}
            </button>
          </div>
        </div>
      </header>

      {isMenuOpen && (
        <button
          type="button"
          className="public-navbar-overlay"
          aria-label="Close mobile menu"
          onClick={closeMenu}
        />
      )}

      <div className={`public-navbar-panel${isMenuOpen ? " is-open" : ""}`}>
          <div className="public-navbar-panel-inner">
          <div className="public-navbar-panel-links">
            {links.map(({ label, href }) => (
              <a key={label} href={href} onClick={closeMenu}>
                {label}
              </a>
            ))}
          </div>

          <button
            type="button"
            className="public-navbar-panel-cart"
            onClick={() => {
              closeMenu();
              openCart();
            }}
          >
            Open cart{totalItems > 0 ? ` (${totalItems})` : ""}
          </button>
        </div>
      </div>
    </>
  );
}
