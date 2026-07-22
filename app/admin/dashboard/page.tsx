"use client";

import { useState, useEffect } from "react";
import { ShoppingBag, DollarSign, TrendingUp, CalendarDays } from "lucide-react";

type Order = {
  id: string;
  orderNumber?: string;
  amount: number;
  items: string;
  createdAt: string;
  discount?: number;
};

type Period = "today" | "week" | "month" | "year";

const periodLabels: Record<Period, string> = {
  today: "Today",
  week: "This Week",
  month: "This Month",
  year: "This Year",
};

function filterByPeriod(orders: Order[], period: Period): Order[] {
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

function truncate(str: string, max: number) {
  return str.length > max ? str.slice(0, max) + "..." : str;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

export default function AdminDashboard() {
  const [period, setPeriod] = useState<Period>("month");
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const filtered = filterByPeriod(allOrders, period);
  const totalRevenue = filtered.reduce((sum, o) => sum + Number(o.amount), 0);
  const totalDiscount = filtered.reduce((sum, o) => sum + Number(o.discount || 0), 0);
  const todayOrders = filterByPeriod(allOrders, "today");
  const todayRevenue = todayOrders.reduce((sum, o) => sum + Number(o.amount), 0);

  const stats = [
    { label: "Revenue", value: `$${totalRevenue.toFixed(2)}`, icon: DollarSign, color: "#C23D0C", bg: "rgba(194,61,12,0.12)", sub: periodLabels[period] },
    { label: "Orders", value: filtered.length, icon: ShoppingBag, color: "#E85E00", bg: "rgba(232,94,0,0.12)", sub: periodLabels[period] },
    { label: "Today's Revenue", value: `$${todayRevenue.toFixed(2)}`, icon: TrendingUp, color: "#DB9217", bg: "rgba(219,146,23,0.12)", sub: "Live" },
    { label: "Today's Orders", value: todayOrders.length, icon: CalendarDays, color: "#A44B09", bg: "rgba(164,75,9,0.12)", sub: "Live" },
  ];

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

      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-playfair)", fontWeight: 700, fontSize: "1.8rem", color: "#743306", marginBottom: "0.35rem" }}>
            Dashboard
          </h1>
          <p style={{ fontFamily: "var(--font-dm)", fontSize: "0.875rem", color: "#A44B09", fontWeight: 300 }}>
            Welcome back — here's what's happening at NanaFood.
            {totalDiscount > 0 && (
              <span style={{ color: "#C23D0C", marginLeft: "0.5rem", fontWeight: 600 }}>
                · -${totalDiscount.toFixed(2)} in discounts this period
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

      {/* Stats */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
        {stats.map(({ label, value, icon: Icon, color, bg, sub }) => (
          <div
            key={label}
            style={{ background: "rgba(255,255,255,0.75)", backdropFilter: "blur(16px)", border: "1px solid rgba(219,146,23,0.30)", borderRadius: "16px", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.75rem", boxShadow: "0 4px 20px rgba(116,51,6,0.10)" }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <p style={{ fontFamily: "var(--font-dm)", fontSize: "10px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.14em", color: "#A44B09" }}>
                {label}
              </p>
              <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon size={15} strokeWidth={1.75} style={{ color }} />
              </div>
            </div>
            <p style={{ fontFamily: "var(--font-playfair)", fontWeight: 700, fontSize: "1.8rem", color: "#743306", lineHeight: 1 }}>
              {value}
            </p>
            <p style={{ fontFamily: "var(--font-dm)", fontSize: "11px", color: "#DB9217", fontWeight: 300 }}>
              {sub}
            </p>
          </div>
        ))}
      </div>

      {/* Recent orders */}
      <div style={{ background: "rgba(255,255,255,0.75)", backdropFilter: "blur(16px)", border: "1px solid rgba(219,146,23,0.30)", borderRadius: "16px", overflow: "hidden", boxShadow: "0 4px 20px rgba(116,51,6,0.10)" }}>
        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid rgba(219,146,23,0.20)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 style={{ fontFamily: "var(--font-playfair)", fontWeight: 700, fontSize: "1.1rem", color: "#743306" }}>
            Recent Orders
          </h2>
          <a href="/admin/orders" style={{ fontFamily: "var(--font-dm)", fontSize: "0.8rem", color: "#C23D0C", textDecoration: "none", fontWeight: 500 }}>
            View all
          </a>
        </div>

        {filtered.length === 0 ? (
          <div style={{ padding: "3rem", textAlign: "center" }}>
            <p style={{ fontFamily: "var(--font-dm)", fontSize: "0.875rem", color: "#A44B09" }}>
              No orders for this period.
            </p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(219,146,23,0.20)", background: "rgba(236,216,182,0.25)" }}>
                  {["Order ID", "Items", "Discount", "Amount", "Date"].map((h) => (
                    <th key={h} style={{ padding: "0.75rem 1.5rem", textAlign: "left", fontFamily: "var(--font-dm)", fontSize: "10px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.14em", color: "#A44B09", whiteSpace: "nowrap" }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 8).map((order, i) => (
                  <tr
                    key={order.id}
                    style={{ borderBottom: i < Math.min(filtered.length, 8) - 1 ? "1px solid rgba(219,146,23,0.12)" : "none", transition: "background 0.15s" }}
                    onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(236,216,182,0.20)")}
                    onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                  >
                    <td style={{ padding: "1rem 1.5rem", fontFamily: "var(--font-dm)", fontSize: "0.78rem", color: "#DB9217", whiteSpace: "nowrap" }}>
                      {order.orderNumber || `${order.id.slice(0, 20)}...`}
                    </td>
                    <td style={{ padding: "1rem 1.5rem", fontFamily: "var(--font-dm)", fontSize: "0.875rem", color: "#743306", maxWidth: "240px" }}>
                      {truncate(order.items, 40)}
                    </td>
                    <td style={{ padding: "1rem 1.5rem" }}>
                      {order.discount ? (
                        <span style={{ fontFamily: "var(--font-dm)", fontSize: "0.8rem", fontWeight: 600, color: "#C23D0C" }}>
                          -${Number(order.discount).toFixed(2)}
                        </span>
                      ) : (
                        <span style={{ color: "#DB9217", fontFamily: "var(--font-dm)", fontSize: "0.875rem" }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: "1rem 1.5rem", fontFamily: "var(--font-playfair)", fontSize: "1rem", color: "#C23D0C", fontWeight: 700, whiteSpace: "nowrap" }}>
                      ${Number(order.amount).toFixed(2)}
                    </td>
                    <td style={{ padding: "1rem 1.5rem", fontFamily: "var(--font-dm)", fontSize: "0.8rem", color: "#A44B09", whiteSpace: "nowrap" }}>
                      {formatDate(order.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}