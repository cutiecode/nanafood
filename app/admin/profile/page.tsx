"use client";

import { useState, useEffect } from "react";
import { Check, Eye, EyeOff, Instagram, Facebook } from "lucide-react";

type Settings = {
  restaurantName: string;
  email: string;
  phone: string;
  address: string;
  hours: string;
  taxRate: string;
  instagram: string;
  facebook: string;
  whatsapp: string;
  tiktok: string;
};

export default function AdminProfile() {
  const [settings, setSettings] = useState<Settings>({
    restaurantName: "Nana-AfricanFood",
    email: "hello@nanafood.com",
    phone: "+1 (720) 000-0000",
    address: "Denver, CO 80202",
    hours: "Mon–Sun · 11am – 10pm",
    taxRate: "8.81",
    instagram: "",
    facebook: "",
    whatsapp: "",
    tiktok: "",
  });
  const [isLoadingSettings, setIsLoadingSettings] = useState(true);
  const [restaurantSuccess, setRestaurantSuccess] = useState(false);
  const [restaurantError, setRestaurantError] = useState("");
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  const [passwordForm, setPasswordForm] = useState({ current: "", newPassword: "", confirm: "" });
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [passwordError, setPasswordError] = useState("");
  const [isLoadingPassword, setIsLoadingPassword] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await fetch("/api/settings");
        const data = await res.json();
        setSettings({ ...data, taxRate: String(data.taxRate) });
      } catch (error) {
        console.error("Failed to fetch settings:", error);
      } finally {
        setIsLoadingSettings(false);
      }
    };
    fetchSettings();
  }, []);

  const handleRestaurantSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setRestaurantError("");
    if (parseFloat(settings.taxRate) < 0 || isNaN(parseFloat(settings.taxRate))) {
      setRestaurantError("Tax rate can't be negative.");
      return;
    }
    setIsSavingSettings(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...settings, taxRate: parseFloat(settings.taxRate) }),
      });
      if (!res.ok) {
        setRestaurantError("Failed to save settings.");
        return;
      }
      setRestaurantSuccess(true);
      setTimeout(() => setRestaurantSuccess(false), 4000);
    } catch {
      setRestaurantError("Something went wrong.");
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError("");
    if (passwordForm.newPassword !== passwordForm.confirm) {
      setPasswordError("New passwords do not match.");
      return;
    }
    if (passwordForm.newPassword.length < 8) {
      setPasswordError("Password must be at least 8 characters.");
      return;
    }
    setIsLoadingPassword(true);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: passwordForm.current }),
      });
      if (!res.ok) {
        setPasswordError("Current password is incorrect.");
        return;
      }
      setPasswordSuccess(true);
      setPasswordForm({ current: "", newPassword: "", confirm: "" });
      setTimeout(() => setPasswordSuccess(false), 4000);
    } catch {
      setPasswordError("Something went wrong. Please try again.");
    } finally {
      setIsLoadingPassword(false);
    }
  };

  const inputStyle = {
    width: "100%", padding: "0.75rem 1rem", borderRadius: "10px",
    background: "rgba(255,255,255,0.70)", border: "1px solid rgba(219,146,23,0.30)",
    color: "#743306", fontFamily: "var(--font-dm)", fontSize: "0.875rem",
    outline: "none", transition: "border-color 0.2s",
  };

  const labelStyle = {
    fontFamily: "var(--font-dm)", fontSize: "10px", fontWeight: 500,
    textTransform: "uppercase" as const, letterSpacing: "0.14em",
    color: "#A44B09", marginBottom: "0.4rem", display: "block",
  };

  const cardStyle = {
    background: "rgba(255,255,255,0.75)", backdropFilter: "blur(16px)" as const,
    border: "1px solid rgba(219,146,23,0.30)", borderRadius: "16px",
    padding: "1.75rem", display: "flex", flexDirection: "column" as const,
    gap: "1.25rem", boxShadow: "0 4px 20px rgba(116,51,6,0.08)",
  };

  const logoHighlightIdx = settings.restaurantName.toLowerCase().indexOf("african foods");
  const logoName = logoHighlightIdx >= 0 ? settings.restaurantName.slice(0, logoHighlightIdx) : settings.restaurantName;
  const logoSuffix = logoHighlightIdx >= 0 ? settings.restaurantName.slice(logoHighlightIdx) : "";

  if (isLoadingSettings) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "4rem 0" }}>
        <div style={{ width: "40px", height: "40px", borderRadius: "50%", border: "2px solid rgba(194,61,12,0.20)", borderTop: "2px solid #C23D0C", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem", maxWidth: "700px", margin: "0 auto" }}>

      {/* Header */}
      <div className="admin-page-head">
        <h1 className="admin-page-title" style={{ fontFamily: "var(--font-playfair)", fontWeight: 700, fontSize: "1.8rem", color: "#743306", marginBottom: "0.35rem" }}>
          Profile & Settings
        </h1>
        <p className="admin-page-subtitle" style={{ fontFamily: "var(--font-dm)", fontSize: "0.875rem", color: "#A44B09", fontWeight: 300 }}>
          Manage your restaurant info and admin credentials.
        </p>
      </div>

      {/* Logo preview */}
      <div className="admin-form-card admin-logo-preview" style={{ ...cardStyle, padding: "1.25rem 1.75rem", flexDirection: "row", alignItems: "center", gap: "1rem" }}>
        <p style={{ fontFamily: "var(--font-dm)", fontSize: "10px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.14em", color: "#A44B09", flexShrink: 0 }}>
          Logo Preview
        </p>
        <div style={{ fontFamily: "var(--font-playfair)", fontWeight: 900, fontSize: "1.5rem", letterSpacing: "-0.01em" }}>
          <span style={{ color: "#ECD8B6" }}>{logoName}</span>
          <span style={{ color: "#FFA309" }}>{logoSuffix}</span>
        </div>
        <p className="admin-logo-preview-note" style={{ fontFamily: "var(--font-dm)", fontSize: "0.78rem", color: "#DB9217", fontWeight: 300, marginLeft: "auto" }}>
          Updates live across the admin panel
        </p>
      </div>

      {/* Restaurant info */}
      <div className="admin-form-card" style={cardStyle}>
        <div>
          <h2 className="admin-card-title" style={{ fontFamily: "var(--font-playfair)", fontWeight: 700, fontSize: "1.2rem", color: "#743306", marginBottom: "0.25rem" }}>
            Restaurant Information
          </h2>
          <p style={{ fontFamily: "var(--font-dm)", fontSize: "0.8rem", color: "#A44B09", fontWeight: 300 }}>
            This info is displayed on your website and receipts.
          </p>
        </div>

        <form onSubmit={handleRestaurantSave} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div className="admin-form-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
            <div style={{ gridColumn: "1 / -1" }}>
              <label style={labelStyle}>Restaurant Name</label>
              <input
                style={inputStyle}
                value={settings.restaurantName}
                onChange={(e) => setSettings((p) => ({ ...p, restaurantName: e.target.value }))}
                placeholder="e.g. Nana-AfricanFood"
                onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(194,61,12,0.50)")}
                onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(219,146,23,0.30)")}
              />
              <p style={{ fontFamily: "var(--font-dm)", fontSize: "10px", color: "#DB9217", marginTop: "0.3rem" }}>
                Le texte avant le tiret sera en beige, le texte après en orange.
              </p>
            </div>
            <div>
              <label style={labelStyle}>Contact Email</label>
              <input style={inputStyle} type="email" value={settings.email} onChange={(e) => setSettings((p) => ({ ...p, email: e.target.value }))} onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(194,61,12,0.50)")} onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(219,146,23,0.30)")} />
            </div>
            <div>
              <label style={labelStyle}>Phone</label>
              <input style={inputStyle} value={settings.phone} onChange={(e) => setSettings((p) => ({ ...p, phone: e.target.value }))} onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(194,61,12,0.50)")} onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(219,146,23,0.30)")} />
            </div>
            <div>
              <label style={labelStyle}>Address</label>
              <input style={inputStyle} value={settings.address} onChange={(e) => setSettings((p) => ({ ...p, address: e.target.value }))} onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(194,61,12,0.50)")} onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(219,146,23,0.30)")} />
            </div>
            <div>
              <label style={labelStyle}>Opening Hours</label>
              <input style={inputStyle} value={settings.hours} onChange={(e) => setSettings((p) => ({ ...p, hours: e.target.value }))} onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(194,61,12,0.50)")} onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(219,146,23,0.30)")} />
            </div>
            <div>
              <label style={labelStyle}>
                Tax Rate (%)
                <span style={{ color: "#DB9217", fontWeight: 300, textTransform: "none", letterSpacing: 0, marginLeft: "0.5rem", fontSize: "10px" }}>Denver default: 8.81%</span>
              </label>
              <input style={{ ...inputStyle, appearance: "none" }} type="number" step="0.01" min="0" value={settings.taxRate} onChange={(e) => setSettings((p) => ({ ...p, taxRate: e.target.value }))} onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(194,61,12,0.50)")} onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(219,146,23,0.30)")} />
            </div>
          </div>

          {/* Social media */}
          <div style={{ paddingTop: "0.75rem", borderTop: "1px solid rgba(219,146,23,0.20)" }}>
            <p style={{ fontFamily: "var(--font-dm)", fontSize: "10px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.14em", color: "#A44B09", marginBottom: "0.75rem" }}>
              Social Media Links
            </p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
              <div>
                <label style={labelStyle}>Instagram</label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "#DB9217", fontSize: "0.8rem", fontFamily: "var(--font-dm)" }}>instagram.com/</span>
                  <input style={{ ...inputStyle, paddingLeft: "8.5rem" }} value={settings.instagram} onChange={(e) => setSettings((p) => ({ ...p, instagram: e.target.value }))} placeholder="yourhandle" onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(194,61,12,0.50)")} onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(219,146,23,0.30)")} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>Facebook</label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "#DB9217", fontSize: "0.8rem", fontFamily: "var(--font-dm)" }}>facebook.com/</span>
                  <input style={{ ...inputStyle, paddingLeft: "8rem" }} value={settings.facebook} onChange={(e) => setSettings((p) => ({ ...p, facebook: e.target.value }))} placeholder="yourpage" onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(194,61,12,0.50)")} onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(219,146,23,0.30)")} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>WhatsApp</label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "#DB9217", fontSize: "0.8rem", fontFamily: "var(--font-dm)" }}>+</span>
                  <input style={{ ...inputStyle, paddingLeft: "1.75rem" }} value={settings.whatsapp} onChange={(e) => setSettings((p) => ({ ...p, whatsapp: e.target.value }))} placeholder="1 720 000 0000" onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(194,61,12,0.50)")} onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(219,146,23,0.30)")} />
                </div>
              </div>
              <div>
                <label style={labelStyle}>TikTok</label>
                <div style={{ position: "relative" }}>
                  <span style={{ position: "absolute", left: "0.875rem", top: "50%", transform: "translateY(-50%)", color: "#DB9217", fontSize: "0.8rem", fontFamily: "var(--font-dm)" }}>tiktok.com/@</span>
                  <input style={{ ...inputStyle, paddingLeft: "7.5rem" }} value={settings.tiktok} onChange={(e) => setSettings((p) => ({ ...p, tiktok: e.target.value }))} placeholder="yourhandle" onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(194,61,12,0.50)")} onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(219,146,23,0.30)")} />
                </div>
              </div>
            </div>
          </div>

          {restaurantError && (
            <p style={{ fontFamily: "var(--font-dm)", fontSize: "0.875rem", color: "#C23D0C" }}>{restaurantError}</p>
          )}

          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "1rem" }}>
            {restaurantSuccess && (
              <span style={{ fontFamily: "var(--font-dm)", fontSize: "0.875rem", color: "#743306", display: "flex", alignItems: "center", gap: "0.4rem", fontWeight: 500 }}>
                <Check size={14} strokeWidth={2} />
                Saved successfully
              </span>
            )}
            <button
              type="submit"
              disabled={isSavingSettings}
              style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1.5rem", borderRadius: "100px", background: isSavingSettings ? "rgba(194,61,12,0.5)" : "linear-gradient(135deg, #C23D0C 0%, #743306 100%)", border: "none", color: "#ECD8B6", fontFamily: "var(--font-dm)", fontWeight: 500, fontSize: "0.875rem", cursor: isSavingSettings ? "not-allowed" : "pointer", boxShadow: "0 4px 16px rgba(194,61,12,0.30)", transition: "all 0.2s" }}
              onMouseEnter={(e) => { if (!isSavingSettings) e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
            >
              <Check size={15} strokeWidth={2} />
              {isSavingSettings ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>

      {/* Change password */}
      <div className="admin-form-card" style={cardStyle}>
        <div>
          <h2 className="admin-card-title" style={{ fontFamily: "var(--font-playfair)", fontWeight: 700, fontSize: "1.2rem", color: "#743306", marginBottom: "0.25rem" }}>
            Change Password
          </h2>
          <p style={{ fontFamily: "var(--font-dm)", fontSize: "0.8rem", color: "#A44B09", fontWeight: 300 }}>
            Update your admin access password.
          </p>
        </div>

        <form onSubmit={handlePasswordChange} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {[
            { label: "Current Password", key: "current", show: showCurrent, setShow: setShowCurrent },
            { label: "New Password", key: "newPassword", show: showNew, setShow: setShowNew, placeholder: "Min. 8 characters" },
            { label: "Confirm New Password", key: "confirm", show: showConfirm, setShow: setShowConfirm, placeholder: "Repeat new password" },
          ].map(({ label, key, show, setShow, placeholder }) => (
            <div key={key}>
              <label style={labelStyle}>{label}</label>
              <div style={{ position: "relative" }}>
                <input
                  style={{ ...inputStyle, paddingRight: "3rem" }}
                  type={show ? "text" : "password"}
                  value={passwordForm[key as keyof typeof passwordForm]}
                  onChange={(e) => setPasswordForm((p) => ({ ...p, [key]: e.target.value }))}
                  placeholder={placeholder || "Enter password"}
                  onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(194,61,12,0.50)")}
                  onBlur={(e) => (e.currentTarget.style.borderColor = "rgba(219,146,23,0.30)")}
                />
                <button type="button" onClick={() => setShow((v) => !v)} style={{ position: "absolute", right: "0.75rem", top: "50%", transform: "translateY(-50%)", background: "transparent", border: "none", color: "#A44B09", cursor: "pointer", display: "flex", alignItems: "center" }}>
                  {show ? <EyeOff size={16} strokeWidth={1.75} /> : <Eye size={16} strokeWidth={1.75} />}
                </button>
              </div>
            </div>
          ))}

          {passwordError && (
            <p style={{ fontFamily: "var(--font-dm)", fontSize: "0.875rem", color: "#C23D0C" }}>{passwordError}</p>
          )}

          <div style={{ display: "flex", alignItems: "center", justifyContent: "flex-end", gap: "1rem" }}>
            {passwordSuccess && (
              <span style={{ fontFamily: "var(--font-dm)", fontSize: "0.875rem", color: "#743306", display: "flex", alignItems: "center", gap: "0.4rem", fontWeight: 500 }}>
                <Check size={14} strokeWidth={2} />
                Password updated
              </span>
            )}
            <button
              type="submit"
              disabled={isLoadingPassword}
              style={{ display: "flex", alignItems: "center", gap: "0.5rem", padding: "0.75rem 1.5rem", borderRadius: "100px", background: isLoadingPassword ? "rgba(194,61,12,0.5)" : "linear-gradient(135deg, #C23D0C 0%, #743306 100%)", border: "none", color: "#ECD8B6", fontFamily: "var(--font-dm)", fontWeight: 500, fontSize: "0.875rem", cursor: isLoadingPassword ? "not-allowed" : "pointer", boxShadow: "0 4px 16px rgba(194,61,12,0.30)", transition: "all 0.2s" }}
              onMouseEnter={(e) => { if (!isLoadingPassword) e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; }}
            >
              {isLoadingPassword ? "Verifying..." : "Update Password"}
            </button>
          </div>
        </form>
      </div>

      {/* Danger zone */}
      <div className="admin-form-card" style={{ ...cardStyle, border: "1px solid rgba(194,61,12,0.25)" }}>
        <div>
          <h2 className="admin-card-title" style={{ fontFamily: "var(--font-playfair)", fontWeight: 700, fontSize: "1.2rem", color: "#C23D0C", marginBottom: "0.25rem" }}>
            Danger Zone
          </h2>
          <p style={{ fontFamily: "var(--font-dm)", fontSize: "0.8rem", color: "#A44B09", fontWeight: 300 }}>
            These actions are irreversible. Proceed with caution.
          </p>
        </div>
        <div className="admin-danger-row" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "1rem", borderRadius: "10px", background: "rgba(194,61,12,0.05)", border: "1px solid rgba(194,61,12,0.15)" }}>
          <div>
            <p style={{ fontFamily: "var(--font-dm)", fontWeight: 500, fontSize: "0.875rem", color: "#743306", marginBottom: "0.2rem" }}>
              Clear all orders
            </p>
            <p style={{ fontFamily: "var(--font-dm)", fontSize: "0.8rem", color: "#A44B09", fontWeight: 300 }}>
              Permanently delete all order history.
            </p>
          </div>
          <button
            style={{ padding: "0.6rem 1.25rem", borderRadius: "100px", background: "transparent", border: "1px solid rgba(194,61,12,0.35)", color: "#C23D0C", fontFamily: "var(--font-dm)", fontSize: "0.8rem", fontWeight: 500, cursor: "pointer", transition: "all 0.2s", flexShrink: 0 }}
            onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(194,61,12,0.10)"; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
          >
            Clear Orders
          </button>
        </div>
      </div>

    </div>
  );
}