"use client";

import { useState, useEffect } from "react";
import { ShoppingBag, Sparkles, TrendingUp, Clock } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

type Order = {
  id: string;
  orderNumber?: string;
  amount: number;
  items: string;
  createdAt: string;
  discount?: number;
  processed: boolean;
};

function getOrderStatus(order: Order): "new" | "pending" | "processed" {
  if (order.processed) return "processed";
  const ageMs = Date.now() - new Date(order.createdAt).getTime();
  return ageMs < 24 * 60 * 60 * 1000 ? "new" : "pending";
}

type Period = "today" | "month" | "year";

const periodLabels: Record<Period, string> = {
  today: "Today",
  month: "This Month",
  year: "This Year",
};

function filterByPeriod(orders: Order[], period: Period): Order[] {
  const now = new Date();
  return orders.filter((o) => {
    const date = new Date(o.createdAt);
    if (period === "today") return date.toDateString() === now.toDateString();
    if (period === "month") return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    if (period === "year") return date.getFullYear() === now.getFullYear();
    return true;
  });
}

function formatFullDate(date: Date) {
  return date.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", year: "numeric" });
}

function formatCompactCurrency(amount: number) {
  if (amount >= 1_000_000) return `$${(amount / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
  if (amount >= 1_000) return `$${(amount / 1_000).toFixed(1).replace(/\.0$/, "")}K`;
  return `$${amount.toFixed(2)}`;
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

type ActivityMetric = "orders" | "revenue";
type ActivityPoint = { label: string; orders: number; revenue: number };

function buildActivityData(orders: Order[], period: Period): ActivityPoint[] {
  const now = new Date();

  if (period === "today") {
    const buckets: ActivityPoint[] = Array.from({ length: 24 }, (_, h) => ({ label: `${h}h`, orders: 0, revenue: 0 }));
    orders.forEach((o) => {
      const h = new Date(o.createdAt).getHours();
      buckets[h].orders += 1;
      buckets[h].revenue += Number(o.amount);
    });
    return buckets;
  }

  if (period === "month") {
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const buckets: ActivityPoint[] = Array.from({ length: daysInMonth }, (_, i) => ({ label: String(i + 1), orders: 0, revenue: 0 }));
    orders.forEach((o) => {
      const day = new Date(o.createdAt).getDate();
      buckets[day - 1].orders += 1;
      buckets[day - 1].revenue += Number(o.amount);
    });
    return buckets;
  }

  const buckets: ActivityPoint[] = monthNames.map((label) => ({ label, orders: 0, revenue: 0 }));
  orders.forEach((o) => {
    const m = new Date(o.createdAt).getMonth();
    buckets[m].orders += 1;
    buckets[m].revenue += Number(o.amount);
  });
  return buckets;
}

type ComparisonRange = "14d" | "3m" | "6m";
type ComparisonPoint = { label: string; current: number; previous: number };

const comparisonRangeLabels: Record<ComparisonRange, string> = {
  "14d": "14 days",
  "3m": "3 months",
  "6m": "6 months",
};

function buildComparisonData(orders: Order[], range: ComparisonRange): ComparisonPoint[] {
  const now = new Date();
  const dayMs = 24 * 60 * 60 * 1000;

  if (range === "14d") {
    const labels = Array.from({ length: 14 }, (_, i) => (i === 13 ? "Today" : `D-${13 - i}`));
    const current = Array(14).fill(0);
    const previous = Array(14).fill(0);
    orders.forEach((o) => {
      const daysAgo = Math.floor((now.getTime() - new Date(o.createdAt).getTime()) / dayMs);
      if (daysAgo >= 0 && daysAgo < 14) current[13 - daysAgo] += Number(o.amount);
      else if (daysAgo >= 14 && daysAgo < 28) previous[13 - (daysAgo - 14)] += Number(o.amount);
    });
    return labels.map((label, i) => ({ label, current: current[i], previous: previous[i] }));
  }

  if (range === "3m") {
    const labels = Array.from({ length: 12 }, (_, i) => `W${i + 1}`);
    const current = Array(12).fill(0);
    const previous = Array(12).fill(0);
    orders.forEach((o) => {
      const daysAgo = Math.floor((now.getTime() - new Date(o.createdAt).getTime()) / dayMs);
      const weeksAgo = Math.floor(daysAgo / 7);
      if (weeksAgo >= 0 && weeksAgo < 12) current[11 - weeksAgo] += Number(o.amount);
      else if (weeksAgo >= 12 && weeksAgo < 24) previous[11 - (weeksAgo - 12)] += Number(o.amount);
    });
    return labels.map((label, i) => ({ label, current: current[i], previous: previous[i] }));
  }

  const labels: string[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    labels.push(monthNames[d.getMonth()]);
  }
  const current = Array(6).fill(0);
  const previous = Array(6).fill(0);
  orders.forEach((o) => {
    const d = new Date(o.createdAt);
    const monthsAgo = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
    if (monthsAgo >= 0 && monthsAgo < 6) current[5 - monthsAgo] += Number(o.amount);
    else if (monthsAgo >= 6 && monthsAgo < 12) previous[5 - (monthsAgo - 6)] += Number(o.amount);
  });
  return labels.map((label, i) => ({ label, current: current[i], previous: previous[i] }));
}

export default function AdminDashboard() {
  const [period, setPeriod] = useState<Period>("month");
  const [allOrders, setAllOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activityMetric, setActivityMetric] = useState<ActivityMetric>("orders");
  const [comparisonRange, setComparisonRange] = useState<ComparisonRange>("14d");

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
  const newCount = filtered.filter((o) => getOrderStatus(o) === "new").length;
  const pendingCount = filtered.filter((o) => getOrderStatus(o) === "pending").length;

  const activityData = buildActivityData(filtered, period);
  const comparisonData = buildComparisonData(allOrders, comparisonRange);
  const comparisonCurrentTotal = comparisonData.reduce((sum, p) => sum + p.current, 0);
  const comparisonPreviousTotal = comparisonData.reduce((sum, p) => sum + p.previous, 0);
  const comparisonChangePct = comparisonPreviousTotal > 0
    ? ((comparisonCurrentTotal - comparisonPreviousTotal) / comparisonPreviousTotal) * 100
    : (comparisonCurrentTotal > 0 ? 100 : 0);

  const stats = [
    { label: "New Orders", value: newCount, icon: Sparkles, color: "#C23D0C", bg: "rgba(194,61,12,0.12)", sub: periodLabels[period] },
    { label: "Orders", value: filtered.length, icon: ShoppingBag, color: "#E85E00", bg: "rgba(232,94,0,0.12)", sub: periodLabels[period] },
    { label: "Revenue", value: formatCompactCurrency(totalRevenue), icon: TrendingUp, color: "#DB9217", bg: "rgba(219,146,23,0.12)", sub: periodLabels[period] },
    { label: "Pending Orders", value: pendingCount, icon: Clock, color: "#A44B09", bg: "rgba(164,75,9,0.12)", sub: periodLabels[period] },
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

      <div className="admin-page-head" style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", flexWrap: "wrap", gap: "1rem" }}>
        <div>
          <p className="admin-today-date" style={{ fontFamily: "var(--font-playfair)", fontWeight: 700, fontSize: "2.4rem", color: "#C23D0C", lineHeight: 1.1, marginBottom: "0.5rem" }}>
            {formatFullDate(new Date())}
          </p>
          <h1 className="admin-page-title" style={{ fontFamily: "var(--font-playfair)", fontWeight: 700, fontSize: "1.8rem", color: "#743306", marginBottom: "0.35rem" }}>
            Dashboard
          </h1>
          <p className="admin-page-subtitle" style={{ fontFamily: "var(--font-dm)", fontSize: "0.875rem", color: "#A44B09", fontWeight: 300 }}>
            Welcome back — here's what's happening at NanaFood.
            {totalDiscount > 0 && (
              <span style={{ color: "#C23D0C", marginLeft: "0.5rem", fontWeight: 600 }}>
                · -${totalDiscount.toFixed(2)} in discounts this period
              </span>
            )}
          </p>
        </div>
        <div className="admin-filter-row" style={{ display: "flex", gap: "0.4rem", flexWrap: "wrap" }}>
          {(Object.keys(periodLabels) as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className="admin-filter-pill"
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
      <div className="admin-stats-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "1rem" }}>
        {stats.map(({ label, value, icon: Icon, color, bg, sub }) => (
          <div
            key={label}
            className="admin-stat-card"
            style={{ background: "rgba(255,255,255,0.75)", backdropFilter: "blur(16px)", border: "1px solid rgba(219,146,23,0.30)", borderRadius: "16px", padding: "1.5rem", display: "flex", flexDirection: "column", gap: "0.75rem", boxShadow: "0 4px 20px rgba(116,51,6,0.10)" }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <p className="admin-stat-label" style={{ fontFamily: "var(--font-dm)", fontSize: "10px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.14em", color: "#A44B09" }}>
                {label}
              </p>
              <div className="admin-stat-icon" style={{ width: "32px", height: "32px", borderRadius: "8px", background: bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <Icon size={15} strokeWidth={1.75} style={{ color }} />
              </div>
            </div>
            <p className="admin-stat-value" style={{ fontFamily: "var(--font-playfair)", fontWeight: 700, fontSize: "1.8rem", color: "#743306", lineHeight: 1 }}>
              {value}
            </p>
            <p className="admin-stat-sub" style={{ fontFamily: "var(--font-dm)", fontSize: "11px", color: "#DB9217", fontWeight: 300 }}>
              {sub}
            </p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="admin-charts-grid" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "1.5rem" }}>

        {/* Chart 1 — Order Activity */}
        <div style={{ background: "rgba(255,255,255,0.75)", backdropFilter: "blur(16px)", border: "1px solid rgba(219,146,23,0.30)", borderRadius: "16px", padding: "1.5rem", boxShadow: "0 4px 20px rgba(116,51,6,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem", marginBottom: "1rem" }}>
            <h2 className="admin-card-title" style={{ fontFamily: "var(--font-playfair)", fontWeight: 700, fontSize: "1.1rem", color: "#743306" }}>
              Order Activity
            </h2>
            <div style={{ display: "flex", gap: "0.35rem" }}>
              {(["orders", "revenue"] as ActivityMetric[]).map((m) => (
                <button
                  key={m}
                  onClick={() => setActivityMetric(m)}
                  style={{
                    padding: "0.35rem 0.85rem", borderRadius: "100px", fontSize: "10px",
                    fontFamily: "var(--font-dm)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.1em", cursor: "pointer",
                    background: activityMetric === m ? "#743306" : "rgba(255,255,255,0.6)",
                    border: activityMetric === m ? "1px solid #743306" : "1px solid rgba(164,75,9,0.25)",
                    color: activityMetric === m ? "#ECD8B6" : "#A44B09",
                  }}
                >
                  {m === "orders" ? "Orders" : "Revenue"}
                </button>
              ))}
            </div>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={activityData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(164,75,9,0.15)" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fontFamily: "var(--font-dm)", fill: "#A44B09" }} axisLine={{ stroke: "rgba(164,75,9,0.25)" }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fontFamily: "var(--font-dm)", fill: "#A44B09" }} axisLine={false} tickLine={false} allowDecimals={false} />
              <Tooltip
                formatter={(value) => activityMetric === "revenue" ? [`$${Number(value).toFixed(2)}`, "Revenue"] : [Number(value), "Orders"]}
                contentStyle={{ background: "#FFFFFF", border: "1px solid rgba(219,146,23,0.30)", borderRadius: "8px", fontFamily: "var(--font-dm)", fontSize: "0.8rem" }}
              />
              <Line type="monotone" dataKey={activityMetric} stroke="#C23D0C" strokeWidth={2.5} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Chart 2 — Period Comparison */}
        <div style={{ background: "rgba(255,255,255,0.75)", backdropFilter: "blur(16px)", border: "1px solid rgba(219,146,23,0.30)", borderRadius: "16px", padding: "1.5rem", boxShadow: "0 4px 20px rgba(116,51,6,0.08)" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "0.75rem", marginBottom: "0.75rem" }}>
            <h2 className="admin-card-title" style={{ fontFamily: "var(--font-playfair)", fontWeight: 700, fontSize: "1.1rem", color: "#743306" }}>
              Period Comparison
            </h2>
            <div style={{ display: "flex", gap: "0.35rem" }}>
              {(Object.keys(comparisonRangeLabels) as ComparisonRange[]).map((r) => (
                <button
                  key={r}
                  onClick={() => setComparisonRange(r)}
                  style={{
                    padding: "0.35rem 0.85rem", borderRadius: "100px", fontSize: "10px",
                    fontFamily: "var(--font-dm)", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.1em", cursor: "pointer",
                    background: comparisonRange === r ? "#743306" : "rgba(255,255,255,0.6)",
                    border: comparisonRange === r ? "1px solid #743306" : "1px solid rgba(164,75,9,0.25)",
                    color: comparisonRange === r ? "#ECD8B6" : "#A44B09",
                  }}
                >
                  {comparisonRangeLabels[r]}
                </button>
              ))}
            </div>
          </div>

          <div style={{ marginBottom: "0.75rem" }}>
            <span style={{
              display: "inline-flex", alignItems: "center", gap: "0.35rem",
              fontFamily: "var(--font-dm)", fontSize: "0.8rem", fontWeight: 600,
              color: comparisonChangePct >= 0 ? "#166534" : "#C23D0C",
            }}>
              {comparisonChangePct >= 0 ? "↑" : "↓"} {comparisonChangePct >= 0 ? "+" : ""}{comparisonChangePct.toFixed(1)}% vs previous period
            </span>
          </div>

          <ResponsiveContainer width="100%" height={220}>
            <LineChart data={comparisonData} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(164,75,9,0.15)" />
              <XAxis dataKey="label" tick={{ fontSize: 11, fontFamily: "var(--font-dm)", fill: "#A44B09" }} axisLine={{ stroke: "rgba(164,75,9,0.25)" }} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fontFamily: "var(--font-dm)", fill: "#A44B09" }} axisLine={false} tickLine={false} />
              <Tooltip
                formatter={(value) => [`$${Number(value).toFixed(2)}`, ""]}
                contentStyle={{ background: "#FFFFFF", border: "1px solid rgba(219,146,23,0.30)", borderRadius: "8px", fontFamily: "var(--font-dm)", fontSize: "0.8rem" }}
              />
              <Legend
                wrapperStyle={{ fontFamily: "var(--font-dm)", fontSize: "0.75rem" }}
                formatter={(value) => (value === "current" ? "Current" : "Previous")}
              />
              <Line type="monotone" dataKey="current" name="current" stroke="#C23D0C" strokeWidth={2.5} dot={false} />
              <Line type="monotone" dataKey="previous" name="previous" stroke="#9A9585" strokeWidth={2} strokeDasharray="5 4" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent orders */}
      <div style={{ background: "rgba(255,255,255,0.75)", backdropFilter: "blur(16px)", border: "1px solid rgba(219,146,23,0.30)", borderRadius: "16px", overflow: "hidden", boxShadow: "0 4px 20px rgba(116,51,6,0.10)" }}>
        <div className="admin-card-head" style={{ padding: "1.25rem 1.5rem", borderBottom: "1px solid rgba(219,146,23,0.20)", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <h2 className="admin-card-title" style={{ fontFamily: "var(--font-playfair)", fontWeight: 700, fontSize: "1.1rem", color: "#743306" }}>
            Recent Orders
          </h2>
          <a href="/admin/orders" style={{ fontFamily: "var(--font-dm)", fontSize: "0.8rem", color: "#C23D0C", textDecoration: "none", fontWeight: 500 }}>
            View all
          </a>
        </div>

        {filtered.length === 0 ? (
          <div className="admin-recent-body" style={{ width: "100%", boxSizing: "border-box", height: "200px", display: "flex", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
            <p style={{ fontFamily: "var(--font-dm)", fontSize: "0.875rem", color: "#A44B09" }}>
              No orders for this period.
            </p>
          </div>
        ) : (
          <div className="admin-recent-body" style={{ width: "100%", boxSizing: "border-box", height: "200px", overflowY: "auto" }}>
            {filtered.slice(0, 8).map((order, i) => {
              const isNew = Date.now() - new Date(order.createdAt).getTime() < 60 * 60 * 1000;
              return (
                <div
                  key={order.id}
                  style={{ padding: "0.75rem 1.5rem", borderBottom: i < Math.min(filtered.length, 8) - 1 ? "1px solid rgba(219,146,23,0.15)" : "none", transition: "background 0.15s" }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "rgba(236,216,182,0.20)")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
                >
                  <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "1rem" }}>
                    <span style={{ fontFamily: "var(--font-dm)", fontSize: "0.85rem", color: "#743306", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }}>
                      {order.items && order.items.length > 32 ? order.items.slice(0, 32) + "..." : order.items}
                    </span>
                    <span style={{ display: "flex", alignItems: "center", gap: "0.4rem", flexShrink: 0 }}>
                      {isNew && (
                        <span style={{ fontFamily: "var(--font-dm)", fontSize: "9px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.08em", color: "#ECD8B6", background: "#C23D0C", padding: "0.15rem 0.45rem", borderRadius: "100px" }}>
                          New
                        </span>
                      )}
                      <span style={{ fontFamily: "var(--font-dm)", fontSize: "0.75rem", color: "#A44B09", whiteSpace: "nowrap" }}>
                        {formatDate(order.createdAt)}
                      </span>
                    </span>
                  </div>
                  <span style={{ fontFamily: "var(--font-playfair)", fontSize: "1rem", color: "#C23D0C", fontWeight: 700 }}>
                    ${Number(order.amount).toFixed(2)}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}