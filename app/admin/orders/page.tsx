"use client";

import { useState, useEffect } from "react";
import { Search } from "lucide-react";

type Order = {
  id: string;
  orderNumber?: string;
  amount: number;
  items: string;
  phone?: string;
  address?: string;
  discount?: number;
  createdAt: string;
};

type Period = "today" | "week" | "month" | "year" | "all";

const periodLabels: Record<Period, string> = {
  today: "Today",
  week: "This Week",
  month: "This Month",
  year: "This Year",
  all: "All Time",
};

function filterByPeriod(orders: Order[], period: Period): Order[] {
  if (period === "all") return orders;
  const now = new Date();
  return orders.filter((o) => {
    const date = new Date(o.createdAt);
    if (period === "today") return date.toDateString() === now.toDateString();
    if (period === "week") {
      const weekAgo = new Date(now);
      weekAgo.setDate(now.getDate() - 7);
      return date >= weekAgo;
    }
    if (period === "month") return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    if (period === "year") return date.getFullYear() === now.getFullYear();
    return true;
  });
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function formatTime(dateStr: string) {
  return new Date(dateStr).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

export default function AdminOrders() {
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState<Period>("month");
  const [search, setSearch] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/orders");
        const data = await res.json();
        setAllOrders(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchOrders();
  }, []);

  const periodFiltered = filterByPeriod(allOrders, period);
  const filtered = search.trim()
    ? periodFiltered.filter((o) =>
        (o.orderNumber || o.id).toLowerCase().includes(search.toLowerCase()) ||
        o.items?.toLowerCase().includes(search.toLowerCase()) ||
        o.amount.toString().includes(search) ||
        o.address?.toLowerCase().includes(search.toLowerCase()) ||
        o.phone?.includes(search)
      )
    : periodFiltered;

  const totalRevenue = filtered.reduce((sum, o) => sum + Number(o.amount), 0);
  const totalDiscount = filtered.reduce((sum, o) => sum + Number(o.discount || 0), 0);

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "4rem 0" }}>
        <div style={{ width: "40px", height: "40px", borderRadius: "50%", border: "2px solid rgba(194,61,12,0.20)", borderTop: "2px solid #C23D0C", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2rem" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-playfair)", fontWeight: 700, fontSize: "1.8rem", color: "#743306", marginBottom: "0.35rem" }}>
            Orders
          </h1>
          <p style={{ fontFamily: "var(--font-dm)", fontSize: "0.875rem", color: "#A44B09", fontWeight: 300 }}>
            {filtered.length} orders · ${totalRevenue.toFixed(2)} total
            {totalDiscount > 0 && (
              <span style={{ color: "#C23D0C", marginLeft: "0.5rem", fontWeight: 600 }}>
                · -${totalDiscount.toFixed(2)} discounts applied
              </span>
            )}
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
          {(Object.keys(periodLabels) as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              style={{
                padding: "0.45rem 1rem", borderRadius: "100px", fontSize: "11px",
                fontFamily: "var(--font-dm)", fontWeight: 500, textTransform: "uppercase",
                letterSpacing: "0.12em", cursor: "pointer", transition: "all 0.2s",
                background: period === p ? "#C23D0C" : "rgba(255,255,255,0.55)",
                border: period === p ? "1px solid #743306" : "1px solid rgba(164,75,9,0.25)",
                color: period === p ? "#ECD8B6" : "#A44B09",
                boxShadow: period === p ? "0 4px 12px rgba(194,61,12,0.25)" : "none",
              }}
            >
              {periodLabels[p]}
            </button>
          ))}
        </div>
      </div>

      {/* Search */}
      <div
        style={{ display: "flex", alignItems: "center", gap: "0.75rem", padding: "0.75rem 1rem", borderRadius: "12px", background: "rgba(255,255,255,0.75)", backdropFilter: "blur(16px)", border: "1px solid rgba(219,146,23,0.30)", transition: "border-color 0.2s", boxShadow: "0 2px 8px rgba(116,51,6,0.06)" }}
        onFocusCapture={(e) => (e.currentTarget.style.borderColor = "rgba(194,61,12,0.50)")}
        onBlurCapture={(e) => (e.currentTarget.style.borderColor = "rgba(219,146,23,0.30)")}
      >
        <Search size={16} strokeWidth={1.75} style={{ color: "#DB9217", flexShrink: 0 }} />
        <input
          type="text"
          placeholder="Search by order ID, items, amount, address or phone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#743306", fontFamily: "var(--font-dm)", fontSize: "0.875rem", fontWeight: 300 }}
        />
        {search && (
          <button onClick={() => setSearch("")} style={{ background: "transparent", border: "none", color: "#A44B09", cursor: "pointer", fontSize: "1rem", lineHeight: 1, flexShrink: 0 }}>×</button>
        )}
      </div>

      {/* Orders list */}
      <div style={{ background: "rgba(255,255,255,0.75)", backdropFilter: "blur(16px)", border: "1px solid rgba(219,146,23,0.30)", borderRadius: "16px", overflow: "hidden", boxShadow: "0 4px 20px rgba(116,51,6,0.10)" }}>
        {filtered.length === 0 ? (
          <div style={{ padding: "4rem", textAlign: "center" }}>
            <p style={{ fontFamily: "var(--font-playfair)", fontWeight: 700, fontSize: "1.2rem", color: "rgba(164,75,9,0.4)", marginBottom: "0.5rem" }}>
              No orders found
            </p>
            <p style={{ fontFamily: "var(--font-dm)", fontSize: "0.875rem", color: "#A44B09", fontWeight: 300 }}>
              {allOrders.length === 0 ? "No orders yet — orders will appear here after customers checkout." : "Try adjusting your search or time filter."}
            </p>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column" }}>
            {filtered.map((order, i) => (
              <div key={order.id} style={{ borderBottom: i < filtered.length - 1 ? "1px solid rgba(219,146,23,0.15)" : "none" }}>

                {/* Main row */}
                <div
                  onClick={() => setExpandedId(expandedId === order.id ? null : order.id)}
                  style={{ display: "grid", gridTemplateColumns: "180px 1fr auto auto", alignItems: "center", gap: "1.5rem", padding: "1rem 1.5rem", cursor: "pointer", transition: "background 0.15s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(236,216,182,0.20)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <div>
                    <p style={{ fontFamily: "var(--font-dm)", fontWeight: 500, fontSize: "0.875rem", color: "#743306", marginBottom: "0.2rem" }}>
                      {formatDate(order.createdAt)}
                    </p>
                    <p style={{ fontFamily: "var(--font-dm)", fontSize: "0.75rem", color: "#DB9217", fontWeight: 300 }}>
                      {formatTime(order.createdAt)}
                    </p>
                  </div>

                  <p style={{ fontFamily: "var(--font-dm)", fontSize: "0.875rem", color: "#A44B09", fontWeight: 300, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {order.items}
                  </p>

                  <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.15rem" }}>
                    <span style={{ fontFamily: "var(--font-playfair)", fontWeight: 700, fontSize: "1.1rem", color: "#C23D0C", whiteSpace: "nowrap" }}>
                      ${Number(order.amount).toFixed(2)}
                    </span>
                    {order.discount && (
                      <span style={{ fontFamily: "var(--font-dm)", fontSize: "10px", fontWeight: 600, color: "#E85E00", whiteSpace: "nowrap" }}>
                        -${Number(order.discount).toFixed(2)} discount
                      </span>
                    )}
                  </div>

                  <div style={{ width: "28px", height: "28px", borderRadius: "50%", background: expandedId === order.id ? "rgba(194,61,12,0.12)" : "rgba(164,75,9,0.08)", border: expandedId === order.id ? "1px solid rgba(194,61,12,0.30)" : "1px solid rgba(219,146,23,0.25)", display: "flex", alignItems: "center", justifyContent: "center", color: expandedId === order.id ? "#C23D0C" : "#DB9217", transition: "all 0.2s", flexShrink: 0 }}>
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ transform: expandedId === order.id ? "rotate(180deg)" : "rotate(0deg)", transition: "transform 0.2s" }}>
                      <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                </div>

                {/* Expanded details */}
                {expandedId === order.id && (
                  <div style={{ padding: "1.25rem 1.5rem 1.5rem", borderTop: "1px solid rgba(219,146,23,0.15)", background: "rgba(236,216,182,0.15)", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1.5rem" }}>
                    <div>
                      <p style={{ fontFamily: "var(--font-dm)", fontSize: "10px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.14em", color: "#DB9217", marginBottom: "0.4rem" }}>Order ID</p>
                      <p style={{ fontFamily: "var(--font-dm)", fontSize: "0.8rem", color: "#743306", fontWeight: 400, wordBreak: "break-all" }}>{order.orderNumber || order.id}</p>
                    </div>

                    <div>
                      <p style={{ fontFamily: "var(--font-dm)", fontSize: "10px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.14em", color: "#DB9217", marginBottom: "0.4rem" }}>Discount Applied</p>
                      <p style={{ fontFamily: "var(--font-dm)", fontSize: "0.875rem", fontWeight: 600, color: order.discount ? "#E85E00" : "#A44B09" }}>
                        {order.discount ? `-$${Number(order.discount).toFixed(2)}` : "$0.00"}
                      </p>
                    </div>

                    <div>
                      <p style={{ fontFamily: "var(--font-dm)", fontSize: "10px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.14em", color: "#DB9217", marginBottom: "0.4rem" }}>Amount Breakdown</p>
                      <div style={{ display: "flex", flexDirection: "column", gap: "0.25rem" }}>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ fontFamily: "var(--font-dm)", fontSize: "0.8rem", color: "#A44B09" }}>Subtotal</span>
                          <span style={{ fontFamily: "var(--font-dm)", fontSize: "0.8rem", color: "#743306" }}>${(order.amount / 1.0881).toFixed(2)}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between" }}>
                          <span style={{ fontFamily: "var(--font-dm)", fontSize: "0.8rem", color: "#A44B09" }}>Tax (8.81%)</span>
                          <span style={{ fontFamily: "var(--font-dm)", fontSize: "0.8rem", color: "#A44B09" }}>${(order.amount - order.amount / 1.0881).toFixed(2)}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", paddingTop: "0.25rem", borderTop: "1px solid rgba(219,146,23,0.20)" }}>
                          <span style={{ fontFamily: "var(--font-dm)", fontSize: "0.875rem", fontWeight: 500, color: "#743306" }}>Total</span>
                          <span style={{ fontFamily: "var(--font-playfair)", fontSize: "1rem", fontWeight: 700, color: "#C23D0C" }}>${Number(order.amount).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    {order.address && (
                      <div>
                        <p style={{ fontFamily: "var(--font-dm)", fontSize: "10px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.14em", color: "#DB9217", marginBottom: "0.4rem" }}>Delivery Address</p>
                        <p style={{ fontFamily: "var(--font-dm)", fontSize: "0.875rem", color: "#743306", fontWeight: 300, lineHeight: 1.7 }}>{order.address}</p>
                      </div>
                    )}

                    {order.phone && (
                      <div>
                        <p style={{ fontFamily: "var(--font-dm)", fontSize: "10px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.14em", color: "#DB9217", marginBottom: "0.4rem" }}>Phone</p>
                        <p style={{ fontFamily: "var(--font-dm)", fontSize: "0.875rem", color: "#743306", fontWeight: 300 }}>{order.phone}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}

