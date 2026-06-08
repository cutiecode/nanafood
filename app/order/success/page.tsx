"use client";

import { useRouter } from "next/navigation";
import { CheckCircle } from "lucide-react";
import { useSettings } from "@/app/context/SettingsContext";

export default function OrderSuccess() {
  const router = useRouter();
  const settings = useSettings();

  const nameParts = settings.restaurantName.split("-");
  const before = nameParts[0] + (nameParts.length > 1 ? "-" : "");
  const after = nameParts.slice(1).join("-");

  return (
    <div style={{ minHeight: "100vh", background: "#FAF6F0", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem" }}>

      {/* Logo */}
      <a href="/" style={{ fontFamily: "var(--font-playfair)", fontWeight: 900, fontSize: "1.6rem", textDecoration: "none", whiteSpace: "nowrap", marginBottom: "2.5rem" }}>
        <span style={{ color: "#743306" }}>{before}</span>
        <span style={{ color: "#C23D0C" }}>{after}</span>
      </a>

      <div style={{
        maxWidth: "480px", width: "100%",
        background: "rgba(255,255,255,0.80)",
        backdropFilter: "blur(16px)",
        border: "1px solid rgba(219,146,23,0.30)",
        borderRadius: "24px",
        padding: "3rem 2.5rem",
        display: "flex", flexDirection: "column", alignItems: "center",
        gap: "1.5rem", textAlign: "center",
        boxShadow: "0 8px 40px rgba(116,51,6,0.12)",
      }}>

        {/* Icon */}
        <div style={{ width: "72px", height: "72px", borderRadius: "50%", background: "rgba(116,51,6,0.08)", border: "1px solid rgba(219,146,23,0.30)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <CheckCircle size={32} strokeWidth={1.5} style={{ color: "#743306" }} />
        </div>

        <div>
          <h1 style={{ fontFamily: "var(--font-playfair)", fontWeight: 700, fontSize: "2rem", color: "#743306", marginBottom: "0.75rem", lineHeight: 1.2 }}>
            Order confirmed!
          </h1>
          <p style={{ fontFamily: "var(--font-dm)", fontWeight: 300, fontSize: "0.95rem", color: "#A44B09", lineHeight: 1.8 }}>
            Thank you for your order. We're preparing your food and will deliver it fresh to your door.
          </p>
        </div>

        {/* Info box */}
        <div style={{ width: "100%", padding: "1rem", borderRadius: "12px", background: "rgba(194,61,12,0.06)", border: "1px solid rgba(194,61,12,0.18)" }}>
          <p style={{ fontFamily: "var(--font-dm)", fontSize: "0.875rem", color: "#C23D0C", fontWeight: 500 }}>
            A confirmation email will be sent to you shortly.
          </p>
        </div>

        {/* Hours */}
        {settings.hours && (
          <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#22c55e", display: "inline-block", flexShrink: 0 }} />
            <p style={{ fontFamily: "var(--font-dm)", fontSize: "0.8rem", color: "#A44B09", fontWeight: 300 }}>
              {settings.hours}
            </p>
          </div>
        )}

        {/* CTA */}
        <button
          onClick={() => router.push("/")}
          style={{ width: "100%", padding: "1rem", borderRadius: "100px", background: "linear-gradient(135deg, #C23D0C 0%, #743306 100%)", border: "none", color: "#ECD8B6", fontFamily: "var(--font-dm)", fontWeight: 500, fontSize: "0.95rem", cursor: "pointer", boxShadow: "0 8px 28px rgba(194,61,12,0.25)", transition: "all 0.2s" }}
          onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-1px)")}
          onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}
        >
          Back to menu
        </button>

        {/* Contact */}
        {settings.phone && (
          <p style={{ fontFamily: "var(--font-dm)", fontSize: "0.78rem", color: "#DB9217", fontWeight: 300 }}>
            Questions? Call us at {settings.phone}
          </p>
        )}

      </div>
    </div>
  );
}