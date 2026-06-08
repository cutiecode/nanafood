"use client";

import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, UtensilsCrossed, ShoppingBag, LogOut, Tag, GlassWater, UserCircle, Menu, X } from "lucide-react";
import { useSettings } from "@/app/context/SettingsContext";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (pathname === "/admin") return <>{children}</>;

  const handleLogout = async () => {
    await fetch("/api/admin/auth", { method: "DELETE" });
    router.push("/admin");
  };

  const navItems = [
    { label: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard },
    { label: "Categories & Menu", href: "/admin/menu", icon: UtensilsCrossed },
    { label: "Drinks & Desserts", href: "/admin/addons", icon: GlassWater },
    { label: "Orders", href: "/admin/orders", icon: ShoppingBag },
    { label: "Profile", href: "/admin/profile", icon: UserCircle },
  ];

  const SidebarContent = () => {
    const settings = useSettings();
    const nameParts = settings.restaurantName.split("-");
    const before = nameParts[0] + (nameParts.length > 1 ? "-" : "");
    const after = nameParts.slice(1).join("-");

    return (
      <div style={{ display: "flex", flexDirection: "column", height: "100%", padding: "2rem 1.25rem" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "0.35rem" }}>
          <a href="/" style={{ fontFamily: "var(--font-playfair)", fontWeight: 900, fontSize: "clamp(1rem, 2.5vw, 1.4rem)", textDecoration: "none", whiteSpace: "nowrap", display: "inline-block" }}>
            <span style={{ color: "#ECD8B6" }}>{before}</span>
            <span style={{ color: "#FFA309" }}>{after}</span>
          </a>
                    <button onClick={() => setSidebarOpen(false)} style={{ display: "none", background: "transparent", border: "none", color: "#F4A829", cursor: "pointer", padding: "0.25rem" }} className="sidebar-close">
            <X size={20} strokeWidth={1.75} />
          </button>
        </div>
        <p style={{ fontFamily: "var(--font-dm)", fontSize: "10px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.16em", color: "#F4A829", marginBottom: "2.5rem" }}>
          Admin Panel
        </p>

        <nav style={{ display: "flex", flexDirection: "column", gap: "0.35rem", flex: 1 }}>
          {navItems.map(({ label, href, icon: Icon }) => {
            const isActive = pathname.startsWith(href);
            return (
              <a
                key={href}
                href={href}
                onClick={() => setSidebarOpen(false)}
                style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 1rem", borderRadius: "10px", textDecoration: "none", transition: "all 0.2s", background: isActive ? "rgba(236,216,182,0.15)" : "transparent", border: isActive ? "1px solid rgba(236,216,182,0.30)" : "1px solid transparent", color: isActive ? "#ECD8B6" : "#F4A829" }}
                onMouseEnter={(e) => { if (!isActive) { e.currentTarget.style.background = "rgba(236,216,182,0.08)"; e.currentTarget.style.color = "#ECD8B6"; } }}
                onMouseLeave={(e) => { if (!isActive) { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#F4A829"; } }}
              >
                <Icon size={16} strokeWidth={1.75} />
                <span style={{ fontFamily: "var(--font-dm)", fontSize: "0.875rem", fontWeight: isActive ? 600 : 400 }}>{label}</span>
              </a>
            );
          })}
        </nav>

        <a
          href="/" target="_blank"
          style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 1rem", borderRadius: "10px", textDecoration: "none", transition: "all 0.2s", background: "transparent", border: "1px solid rgba(236,216,182,0.25)", color: "#FFA309", marginBottom: "0.5rem", fontFamily: "var(--font-dm)", fontSize: "0.875rem" }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(236,216,182,0.08)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <Tag size={16} strokeWidth={1.75} />
          View website
        </a>

        <button
          onClick={handleLogout}
          style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 1rem", borderRadius: "10px", background: "transparent", border: "1px solid transparent", color: "#F4A829", cursor: "pointer", transition: "all 0.2s", fontFamily: "var(--font-dm)", fontSize: "0.875rem", width: "100%", textAlign: "left" }}
          onMouseEnter={(e) => { e.currentTarget.style.background = "rgba(194,61,12,0.15)"; e.currentTarget.style.borderColor = "rgba(194,61,12,0.30)"; e.currentTarget.style.color = "#ECD8B6"; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "transparent"; e.currentTarget.style.color = "#F4A829"; }}
        >
          <LogOut size={16} strokeWidth={1.75} />
          Sign out
        </button>
      </div>
    );
  };

  return (
    <>
      <style>{`
        @media (max-width: 768px) {
          .admin-sidebar-desktop { display: none !important; }
          .admin-main { margin-left: 0 !important; }
          .admin-topbar { display: flex !important; }
          .sidebar-close { display: flex !important; }
        }
        @media (min-width: 769px) {
          .admin-sidebar-mobile-overlay { display: none !important; }
          .admin-topbar { display: none !important; }
        }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#FAF6F0", display: "flex" }}>

        <aside className="admin-sidebar-desktop" style={{ width: "240px", flexShrink: 0, background: "#743306", borderRight: "1px solid #A44B09", position: "fixed", top: 0, left: 0, height: "100vh" }}>
          <SidebarContent />
        </aside>

        {sidebarOpen && (
          <div className="admin-sidebar-mobile-overlay" style={{ position: "fixed", inset: 0, zIndex: 99 }}>
            <div onClick={() => setSidebarOpen(false)} style={{ position: "absolute", inset: 0, background: "rgba(116,51,6,0.5)", backdropFilter: "blur(4px)" }} />
            <aside style={{ position: "absolute", top: 0, left: 0, height: "100vh", width: "260px", background: "#743306", borderRight: "1px solid #A44B09", zIndex: 1 }}>
              <SidebarContent />
            </aside>
          </div>
        )}

        <div
          className="admin-topbar"
          style={{ display: "none", position: "fixed", top: 0, left: 0, right: 0, zIndex: 50, height: "60px", background: "rgba(116,51,6,0.95)", borderBottom: "1px solid #A44B09", backdropFilter: "blur(12px)", alignItems: "center", justifyContent: "space-between", padding: "0 1.25rem" }}
        >
          <button onClick={() => setSidebarOpen(true)} style={{ background: "transparent", border: "none", color: "#ECD8B6", cursor: "pointer", display: "flex", alignItems: "center", padding: "0.25rem" }}>
            <Menu size={22} strokeWidth={1.75} />
          </button>
          <span style={{ fontFamily: "var(--font-playfair)", fontWeight: 900, fontSize: "1.3rem", color: "#ECD8B6" }}>
            Nana<span style={{ color: "#FFA309" }}>Food</span>
          </span>
          <div style={{ width: "32px" }} />
        </div>

        <main className="admin-main" style={{ flex: 1, marginLeft: "240px", minHeight: "100vh", paddingTop: "2.5rem" }}>
          <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 2rem" }}>
            <div className="admin-topbar" style={{ display: "none", height: "60px", marginBottom: "1rem" }} />
            {children}
          </div>
        </main>

      </div>
    </>
  );
}