"use client";

import { useState } from "react";
import { useSettings } from "@/app/context/SettingsContext";

export default function Footer() {
  const settings = useSettings();
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  const highlightIdx = settings.restaurantName.toLowerCase().indexOf("african foods");
  const before = highlightIdx >= 0 ? settings.restaurantName.slice(0, highlightIdx) : settings.restaurantName;
  const after = highlightIdx >= 0 ? settings.restaurantName.slice(highlightIdx) : "";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !message) return;
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, message }),
      });
      if (res.ok) {
        setSent(true);
        setEmail("");
        setMessage("");
        setTimeout(() => setSent(false), 5000);
      }
    } catch (error) {
      console.error("Failed to send:", error);
    }
  };

  const socialLinks = [
    { key: "instagram", label: "Instagram", url: settings.instagram ? `https://instagram.com/${settings.instagram}` : null, icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>) },
    { key: "facebook", label: "Facebook", url: settings.facebook ? `https://facebook.com/${settings.facebook}` : null, icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>) },
    { key: "whatsapp", label: "WhatsApp", url: settings.whatsapp ? `https://wa.me/${settings.whatsapp.replace(/[\s+\-()]/g, "")}` : null, icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>) },
    { key: "tiktok", label: "TikTok", url: settings.tiktok ? `https://tiktok.com/@${settings.tiktok}` : null, icon: (<svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.78 1.52V6.75a4.85 4.85 0 01-1.01-.06z"/></svg>) },
  ].filter((s) => s.url);

  const inputStyle = {
    width: "100%", padding: "0.65rem 1rem", borderRadius: "10px",
    background: "rgba(255,255,255,0.70)", border: "1px solid rgba(219,146,23,0.30)",
    color: "#743306", fontFamily: "var(--font-dm)", fontSize: "0.875rem",
    fontWeight: 300, outline: "none", transition: "border-color 0.2s",
  };

  return (
    <footer id="contact" className="site-footer" style={{ background: "#743306", borderTop: "1px solid rgba(219,146,23,0.25)", marginTop: "3rem" }}>
      <div className="footer-inner" style={{ maxWidth: "1300px", margin: "0 auto", padding: "3.5rem 3rem 2rem" }}>

        {/* Top grid — 4 colonnes compactes */}
        <div className="site-footer-grid" style={{ display: "grid", gridTemplateColumns: "1.5fr 1fr 1.2fr", gap: "2.5rem", marginBottom: "2.5rem", alignItems: "start" }}>

          {/* Brand */}
<div className="footer-brand-col" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
  <a href="/" style={{ fontFamily: "var(--font-playfair)", fontWeight: 900, fontSize: "1.3rem", textDecoration: "none", whiteSpace: "nowrap", display: "inline-block" }}>
    <span style={{ color: "#ECD8B6" }}>{before}</span>
    <span style={{ color: "#FFA309" }}>{after}</span>
  </a>
  <p className="footer-brand-text" style={{ fontFamily: "var(--font-dm)", fontWeight: 300, fontSize: "0.8rem", color: "rgba(236,216,182,0.70)", lineHeight: 1.8, maxWidth: "200px" }}>
    Authentic West African cuisine, crafted with love in Denver, CO.
  </p>
  {socialLinks.length > 0 && (
    <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
      {socialLinks.map(({ key, label, url, icon }) => (
        <a key={key} href={url!} target="_blank" rel="noopener noreferrer" title={label}
          style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "32px", height: "32px", borderRadius: "50%", background: "rgba(236,216,182,0.12)", border: "1px solid rgba(236,216,182,0.25)", color: "#ECD8B6", textDecoration: "none", transition: "all 0.2s" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(236,216,182,0.25)"; e.currentTarget.style.transform = "translateY(-2px)"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "rgba(236,216,182,0.12)"; e.currentTarget.style.transform = "translateY(0)"; }}
        >
          {icon}
        </a>
      ))}
    </div>
  )}
  <span className="footer-hours-badge" style={{ display: "inline-flex", alignItems: "center", gap: "0.4rem", background: "rgba(236,216,182,0.10)", border: "1px solid rgba(236,216,182,0.20)", color: "#ECD8B6", fontFamily: "var(--font-dm)", fontSize: "0.7rem", fontWeight: 500, padding: "0.35rem 0.75rem", borderRadius: "100px", width: "fit-content" }}>
    <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: "#22c55e", display: "inline-block", flexShrink: 0 }} />
    {settings.hours}
  </span>
</div>

{/* Contact */}
<div className="footer-contact-col" style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
  <p className="footer-col-label" style={{ fontFamily: "var(--font-dm)", fontWeight: 600, fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.16em", color: "#FFA309", marginBottom: "0.25rem" }}>Contact</p>
  {[settings.address, settings.email, settings.phone].map((line) => (
    <p key={line} className="footer-contact-text" style={{ fontFamily: "var(--font-dm)", fontSize: "0.82rem", color: "rgba(236,216,182,0.65)", fontWeight: 300, lineHeight: 1.5 }}>{line}</p>
  ))}
</div>

{/* Message form */}
<div className="footer-message-col" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
  <p className="footer-col-label" style={{ fontFamily: "var(--font-dm)", fontWeight: 600, fontSize: "10px", textTransform: "uppercase", letterSpacing: "0.16em", color: "#FFA309", marginBottom: "0.1rem" }}>Message</p>
  {sent ? (
    <div style={{ padding: "0.875rem", borderRadius: "10px", background: "rgba(34,197,94,0.12)", border: "1px solid rgba(34,197,94,0.30)", color: "#22c55e", fontFamily: "var(--font-dm)", fontSize: "0.82rem", fontWeight: 500, textAlign: "center" }}>
      Sent — we'll be in touch!
    </div>
  ) : (
    <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
      <input type="email" placeholder="Your email" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(194,61,12,0.55)")} onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(219,146,23,0.30)")} />
      <textarea placeholder="Your message..." rows={6} value={message} onChange={(e) => setMessage(e.target.value)} style={{ ...inputStyle, resize: "vertical", minHeight: "120px" }} onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(194,61,12,0.55)")} onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(219,146,23,0.30)")} />
      <button type="submit" style={{ width: "100%", padding: "0.7rem", borderRadius: "100px", background: "linear-gradient(135deg, #C23D0C 0%, #A44B09 100%)", border: "none", color: "#ECD8B6", fontFamily: "var(--font-dm)", fontWeight: 500, fontSize: "0.82rem", cursor: "pointer", transition: "all 0.2s", boxShadow: "0 4px 12px rgba(194,61,12,0.25)" }} onMouseEnter={(e) => (e.currentTarget.style.transform = "translateY(-1px)")} onMouseLeave={(e) => (e.currentTarget.style.transform = "translateY(0)")}>
        Send Message
      </button>
    </form>
  )}
</div>

        </div>

        {/* Bottom bar */}
        <div className="site-footer-bottom" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", paddingTop: "1.25rem", borderTop: "1px solid rgba(236,216,182,0.12)", flexWrap: "wrap", gap: "0.5rem" }}>
          <p className="footer-bottom-text" style={{ fontFamily: "var(--font-dm)", fontSize: "0.75rem", color: "rgba(236,216,182,0.40)", fontWeight: 300 }}>
            © {new Date().getFullYear()} {settings.restaurantName}. All rights reserved.
          </p>
          <p className="footer-bottom-text" style={{ fontFamily: "var(--font-dm)", fontSize: "0.75rem", color: "rgba(236,216,182,0.40)", fontWeight: 300 }}>
            Made by NaLabs
          </p>
        </div>

      </div>
    </footer>
  );
}