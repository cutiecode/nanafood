"use client";

import React from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

type ActivityPoint = { label: string; orders: number; revenue: number };
type ComparisonPoint = { label: string; current: number; previous: number };
type ActivityMetric = "orders" | "revenue";

export default function ChartsClient({
  activityData,
  activityMetric,
  comparisonData,
  render = "both",
}: {
  activityData: ActivityPoint[];
  activityMetric: ActivityMetric;
  comparisonData: ComparisonPoint[];
  render?: "activity" | "comparison" | "both";
}) {
  return (
    <>
      {(render === "activity" || render === "both") && (
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
      )}

      {(render === "comparison" || render === "both") && (
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
      )}
    </>
  );
}
