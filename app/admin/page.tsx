"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Lock } from "lucide-react";

export default function AdminLogin() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (res.ok) {
        router.push("/admin/dashboard");
      } else {
        setError("Incorrect password. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ minHeight: "100vh", background: "#FAF6F0", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "2rem" }}>

      {/* Logo */}
      <a href="/" style={{ fontFamily: "var(--font-playfair)", fontWeight: 900, fontSize: "1.8rem", textDecoration: "none", whiteSpace: "nowrap", marginBottom: "2.5rem" }}>
        <span style={{ color: "#743306" }}>Nana-</span>
        <span style={{ color: "#C23D0C" }}>AfricanFood</span>
      </a>

      <div style={{
        width: "100%", maxWidth: "400px",
        background: "rgba(255,255,255,0.80)",
        backdropFilter: "blur(16px)",
        border: "1px solid rgba(219,146,23,0.30)",
        borderRadius: "24px",
        padding: "2.5rem",
        display: "flex", flexDirection: "column", gap: "1.5rem",
        boxShadow: "0 8px 40px rgba(116,51,6,0.12)",
      }}>

        {/* Header */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
          <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "rgba(194,61,12,0.10)", border: "1px solid rgba(194,61,12,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <Lock size={22} strokeWidth={1.5} style={{ color: "#C23D0C" }} />
          </div>
          <div style={{ textAlign: "center" }}>
            <h1 style={{ fontFamily: "var(--font-playfair)", fontWeight: 700, fontSize: "1.5rem", color: "#743306", marginBottom: "0.35rem" }}>
              Admin Access
            </h1>
            <p style={{ fontFamily: "var(--font-dm)", fontSize: "0.875rem", color: "#A44B09", fontWeight: 300 }}>
              NanaFood back office
            </p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <label style={{ fontFamily: "var(--font-dm)", fontSize: "11px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.14em", color: "#A44B09" }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              required
              style={{ width: "100%", padding: "0.85rem 1rem", borderRadius: "12px", background: "rgba(255,255,255,0.70)", border: "1px solid rgba(219,146,23,0.30)", color: "#743306", fontFamily: "var(--font-dm)", fontSize: "0.9rem", outline: "none", transition: "border-color 0.2s" }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(194,61,12,0.50)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(219,146,23,0.30)")}
            />
          </div>

          {error && (
            <p style={{ fontFamily: "var(--font-dm)", fontSize: "0.875rem", color: "#C23D0C", fontWeight: 400 }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            style={{ width: "100%", padding: "0.9rem", borderRadius: "100px", background: isLoading ? "rgba(194,61,12,0.50)" : "linear-gradient(135deg, #C23D0C 0%, #743306 100%)", border: "none", color: "#ECD8B6", fontFamily: "var(--font-dm)", fontWeight: 500, fontSize: "0.9rem", cursor: isLoading ? "not-allowed" : "pointer", boxShadow: isLoading ? "none" : "0 6px 20px rgba(194,61,12,0.25)", transition: "all 0.2s" }}
            onMouseEnter={(e) => { if (!isLoading) e.currentTarget.style.transform = "translateY(-1px)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
          >
            {isLoading ? "Signing in..." : "Sign in"}
          </button>
        </form>

        {/* Back link */}
        <a
          href="/"
          style={{ textAlign: "center", fontFamily: "var(--font-dm)", fontSize: "0.8rem", color: "#A44B09", textDecoration: "none", transition: "color 0.2s" }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "#743306")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "#A44B09")}
        >
          ← Back to website
        </a>
      </div>

      {/* Bottom pattern */}
      <div style={{ position: "fixed", inset: 0, pointerEvents: "none", opacity: 0.03, backgroundImage: "linear-gradient(#743306 1px, transparent 1px), linear-gradient(90deg, #743306 1px, transparent 1px)", backgroundSize: "60px 60px", zIndex: 0 }} />
    </div>
  );
}