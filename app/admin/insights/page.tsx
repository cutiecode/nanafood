"use client";

import { useState, useEffect } from "react";
import { AlertTriangle, TrendingDown, PackageX } from "lucide-react";

type Order = {
  id: string;
  orderNumber?: string;
  amount: number;
  items: string;
  createdAt: string;
  discount?: number;
  processed: boolean;
};

type Dish = {
  id: string;
  name: string;
  discountPercent?: number;
  category?: { id: string; label: string } | string;
};

const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

function categoryLabel(dish: Dish): string {
  if (!dish.category) return "Uncategorized";
  return typeof dish.category === "string" ? dish.category : dish.category.label;
}

function normalize(s: string) {
  return s.toLowerCase().trim();
}

function parseOrderItems(itemsStr: string): { name: string; qty: number }[] {
  if (!itemsStr) return [];
  return itemsStr
    .split(",")
    .map((seg) => seg.trim())
    .filter(Boolean)
    .map((seg) => {
      const match = seg.match(/^(.*)\sx(\d+)$/i);
      if (match) return { name: match[1].trim(), qty: parseInt(match[2], 10) || 1 };
      return { name: seg, qty: 1 };
    });
}

function countDishOrders(orders: Order[], dishName: string): number {
  const target = normalize(dishName);
  let count = 0;
  orders.forEach((o) => {
    parseOrderItems(o.items).forEach((it) => {
      const itemName = normalize(it.name);
      if (itemName === target || itemName.includes(target) || target.includes(itemName)) {
        count += it.qty;
      }
    });
  });
  return count;
}

function isWithinLastDays(dateStr: string, days: number) {
  const ms = days * 24 * 60 * 60 * 1000;
  return Date.now() - new Date(dateStr).getTime() < ms;
}

function isThisMonth(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

const cardStyle = {
  background: "rgba(255,255,255,0.75)", backdropFilter: "blur(16px)" as const,
  border: "1px solid rgba(219,146,23,0.30)", borderRadius: "16px",
  padding: "1.5rem", boxShadow: "0 4px 20px rgba(116,51,6,0.08)",
  display: "flex", flexDirection: "column" as const, gap: "0.75rem",
};

const cardLabelStyle = {
  fontFamily: "var(--font-dm)", fontSize: "10px", fontWeight: 500,
  textTransform: "uppercase" as const, letterSpacing: "0.14em", color: "#A44B09",
};

export default function AdminInsights() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [ordersRes, menuRes] = await Promise.all([fetch("/api/orders"), fetch("/api/menu")]);
        const [ordersData, menuData] = await Promise.all([ordersRes.json(), menuRes.json()]);
        setOrders(Array.isArray(ordersData) ? ordersData : []);
        setDishes(Array.isArray(menuData) ? menuData : []);
      } catch (error) {
        console.error("Failed to fetch insights data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", padding: "4rem 0" }}>
        <div style={{ width: "40px", height: "40px", borderRadius: "50%", border: "2px solid rgba(194,61,12,0.20)", borderTop: "2px solid #C23D0C", animation: "spin 0.8s linear infinite" }} />
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  const ordersThisMonth = orders.filter((o) => isThisMonth(o.createdAt));
  const ordersLast7 = orders.filter((o) => isWithinLastDays(o.createdAt, 7));
  const ordersLast14 = orders.filter((o) => isWithinLastDays(o.createdAt, 14));
  const ordersPrev7 = ordersLast14.filter((o) => !isWithinLastDays(o.createdAt, 7));

  // ─── Product Performance ───
  const dishCounts = dishes.map((d) => ({ dish: d, count: countDishOrders(orders, d.name) }));
  const totalDishOrders = dishCounts.reduce((sum, d) => sum + d.count, 0);
  const topDishes = [...dishCounts].sort((a, b) => b.count - a.count).slice(0, 3);

  const dishCountsThisMonth = dishes.map((d) => ({ dish: d, count: countDishOrders(ordersThisMonth, d.name) }));
  const neverOrderedThisMonth = dishCountsThisMonth.filter((d) => d.count === 0).map((d) => d.dish);
  const discountedLowVolume = dishCountsThisMonth.filter(
    (d) => (d.dish.discountPercent || 0) > 0 && d.count < 2
  );

  // ─── Customer Behavior ───
  const hourCounts = Array(24).fill(0);
  orders.forEach((o) => { hourCounts[new Date(o.createdAt).getHours()] += 1; });
  const peakHour = hourCounts.indexOf(Math.max(...hourCounts));
  const hasOrderData = orders.length > 0;

  const dayTotals = Array(7).fill(0);
  const dayOccurrences = Array(7).fill(0);
  if (orders.length > 0) {
    const oldestOrder = orders.reduce((min, o) => (new Date(o.createdAt) < new Date(min.createdAt) ? o : min), orders[0]);
    const start = new Date(oldestOrder.createdAt);
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(0, 0, 0, 0);
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      dayOccurrences[d.getDay()] += 1;
    }
    orders.forEach((o) => { dayTotals[new Date(o.createdAt).getDay()] += 1; });
  }
  const dayAverages = dayTotals.map((total, i) => (dayOccurrences[i] > 0 ? total / dayOccurrences[i] : 0));
  const bestDayIndex = dayAverages.indexOf(Math.max(...dayAverages));

  const avgBasket = ordersThisMonth.length > 0
    ? ordersThisMonth.reduce((sum, o) => sum + Number(o.amount), 0) / ordersThisMonth.length
    : 0;

  // ─── Alerts ───
  const revenueLast7 = ordersLast7.reduce((sum, o) => sum + Number(o.amount), 0);
  const revenuePrev7 = ordersPrev7.reduce((sum, o) => sum + Number(o.amount), 0);
  const revenueDownPct = revenuePrev7 > 0 ? ((revenuePrev7 - revenueLast7) / revenuePrev7) * 100 : 0;
  const showRevenueDownAlert = revenuePrev7 > 0 && revenueLast7 < revenuePrev7;

  const categories = [...new Set(dishes.map((d) => categoryLabel(d)))];
  const inactiveCategories = categories.filter((cat) => {
    const dishesInCat = dishes.filter((d) => categoryLabel(d) === cat);
    return !ordersLast7.some((o) =>
      parseOrderItems(o.items).some((it) =>
        dishesInCat.some((d) => normalize(d.name) === normalize(it.name) || normalize(it.name).includes(normalize(d.name)))
      )
    );
  });

  const dishCountsThisWeek = dishes.map((d) => ({ dish: d, count: countDishOrders(ordersLast7, d.name) }));
  const topDishThisWeek = [...dishCountsThisWeek].sort((a, b) => b.count - a.count)[0];
  const topDishLastWeekCount = topDishThisWeek ? countDishOrders(ordersPrev7, topDishThisWeek.dish.name) : 0;
  const showTrendingDownAlert = !!topDishThisWeek && topDishThisWeek.count > 0 && topDishThisWeek.count < topDishLastWeekCount;

  const alerts = [
    showRevenueDownAlert && {
      icon: TrendingDown,
      text: `Revenue is down ${revenueDownPct.toFixed(0)}% vs last week`,
    },
    inactiveCategories.length > 0 && {
      icon: PackageX,
      text: `No orders in ${inactiveCategories[0]} for 7 days`,
    },
    showTrendingDownAlert && {
      icon: AlertTriangle,
      text: `${topDishThisWeek!.dish.name} had ${topDishLastWeekCount} orders last week, only ${topDishThisWeek!.count} this week`,
    },
  ].filter(Boolean) as { icon: typeof TrendingDown; text: string }[];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "2.5rem" }}>

      <div>
        <h1 className="admin-page-title" style={{ fontFamily: "var(--font-playfair)", fontWeight: 700, fontSize: "1.8rem", color: "#743306", marginBottom: "0.35rem" }}>
          Insights
        </h1>
        <p className="admin-page-subtitle" style={{ fontFamily: "var(--font-dm)", fontSize: "0.875rem", color: "#A44B09", fontWeight: 300 }}>
          What's happening in your data, at a glance.
        </p>
      </div>

      {/* Section 1 — Product Performance */}
      <div>
        <h2 style={{ fontFamily: "var(--font-playfair)", fontWeight: 700, fontSize: "1.2rem", color: "#743306", marginBottom: "1rem" }}>
          Product Performance
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.25rem" }}>

          <div style={cardStyle}>
            <p style={cardLabelStyle}>Top Dishes</p>
            {topDishes.length === 0 ? (
              <p style={{ fontFamily: "var(--font-dm)", fontSize: "0.85rem", color: "#A44B09" }}>No orders yet.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.6rem" }}>
                {topDishes.map(({ dish, count }, i) => (
                  <div key={dish.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem" }}>
                    <span style={{ fontFamily: "var(--font-dm)", fontSize: "0.85rem", color: "#743306" }}>
                      {i + 1}. {dish.name}
                    </span>
                    <span style={{ fontFamily: "var(--font-playfair)", fontWeight: 700, color: "#C23D0C", fontSize: "0.9rem", whiteSpace: "nowrap" }}>
                      {count} · {totalDishOrders > 0 ? Math.round((count / totalDishOrders) * 100) : 0}%
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={cardStyle}>
            <p style={cardLabelStyle}>Never Ordered This Month</p>
            {neverOrderedThisMonth.length === 0 ? (
              <p style={{ fontFamily: "var(--font-dm)", fontSize: "0.85rem", color: "#A44B09" }}>Every dish has been ordered this month.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxHeight: "160px", overflowY: "auto" }}>
                {neverOrderedThisMonth.map((dish) => (
                  <div key={dish.id} style={{ display: "flex", flexDirection: "column" }}>
                    <span style={{ fontFamily: "var(--font-dm)", fontSize: "0.85rem", color: "#743306" }}>{dish.name}</span>
                    <span style={{ fontFamily: "var(--font-dm)", fontSize: "0.75rem", color: "#DB9217" }}>{categoryLabel(dish)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={cardStyle}>
            <p style={cardLabelStyle}>Discounted But Low Volume</p>
            {discountedLowVolume.length === 0 ? (
              <p style={{ fontFamily: "var(--font-dm)", fontSize: "0.85rem", color: "#A44B09" }}>No underperforming discounts this month.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", maxHeight: "160px", overflowY: "auto" }}>
                {discountedLowVolume.map(({ dish, count }) => (
                  <div key={dish.id} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "0.75rem" }}>
                    <span style={{ fontFamily: "var(--font-dm)", fontSize: "0.85rem", color: "#743306" }}>{dish.name}</span>
                    <span style={{ fontFamily: "var(--font-dm)", fontSize: "0.75rem", color: "#C23D0C" }}>-{dish.discountPercent}% · {count} order{count !== 1 ? "s" : ""}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Section 2 — Customer Behavior */}
      <div>
        <h2 style={{ fontFamily: "var(--font-playfair)", fontWeight: 700, fontSize: "1.2rem", color: "#743306", marginBottom: "1rem" }}>
          Customer Behavior
        </h2>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.25rem" }}>

          <div style={cardStyle}>
            <p style={cardLabelStyle}>Peak Hour</p>
            <p style={{ fontFamily: "var(--font-dm)", fontSize: "0.9rem", color: "#743306" }}>
              {hasOrderData ? `Most orders between ${peakHour}h and ${(peakHour + 1) % 24}h` : "Not enough data yet."}
            </p>
          </div>

          <div style={cardStyle}>
            <p style={cardLabelStyle}>Best Day</p>
            <p style={{ fontFamily: "var(--font-dm)", fontSize: "0.9rem", color: "#743306" }}>
              {hasOrderData
                ? <>{dayNames[bestDayIndex]} is your best day — <span style={{ fontFamily: "var(--font-playfair)", fontWeight: 700, color: "#C23D0C" }}>{dayAverages[bestDayIndex].toFixed(1)}</span> orders on average</>
                : "Not enough data yet."}
            </p>
          </div>

          <div style={cardStyle}>
            <p style={cardLabelStyle}>Average Basket</p>
            <p style={{ fontFamily: "var(--font-dm)", fontSize: "0.9rem", color: "#743306" }}>
              <span style={{ fontFamily: "var(--font-playfair)", fontWeight: 700, color: "#C23D0C", fontSize: "1.1rem" }}>${avgBasket.toFixed(2)}</span> average per order this month
            </p>
          </div>
        </div>
      </div>

      {/* Section 3 — Alerts */}
      {alerts.length > 0 && (
        <div>
          <h2 style={{ fontFamily: "var(--font-playfair)", fontWeight: 700, fontSize: "1.2rem", color: "#743306", marginBottom: "1rem" }}>
            Alerts
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "1.25rem" }}>
            {alerts.map(({ icon: Icon, text }, i) => (
              <div key={i} style={{ ...cardStyle, flexDirection: "row" as const, alignItems: "center", gap: "0.85rem", borderLeft: "3px solid #C23D0C" }}>
                <div style={{ width: "36px", height: "36px", borderRadius: "8px", background: "rgba(194,61,12,0.10)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon size={17} strokeWidth={1.75} style={{ color: "#C23D0C" }} />
                </div>
                <p style={{ fontFamily: "var(--font-dm)", fontSize: "0.85rem", color: "#743306", fontWeight: 500 }}>{text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
