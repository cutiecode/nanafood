"use client";

import { useState, useEffect, useRef } from "react";
import DishCard from "./DishCard";
import { useCart } from "@/app/context/CartContext";
import { X } from "lucide-react";

type Supplement = { id: string; name: string; price: number };
type Drink = { id: string; name: string; price: number; imageUrl?: string | null };
type Dessert = { id: string; name: string; price: number; imageUrl?: string | null };

type Dish = {
  id: string;
  name: string;
  description: string;
  longDescription: string;
  price: number;
  originalPrice?: number;
  discountPercent?: number;
  imageUrl?: string;
  popular: boolean;
  spiceable: boolean;
  feeds: number;
  category: { id: string; label: string };
  supplements: Supplement[];
  drinks: Drink[];
};

type Category = { id: string; label: string };

export default function MenuSection() {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [drinks, setDrinks] = useState<Drink[]>([]);
  const [desserts, setDesserts] = useState<Dessert[]>([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const shuffledRef = useRef<Dish[]>([]);
  const { addItem, openCart } = useCart();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [menuRes, catRes, drinkRes, dessertRes] = await Promise.all([
          fetch("/api/menu"), fetch("/api/categories"), fetch("/api/drinks"), fetch("/api/desserts"),
        ]);
        const [menuData, catData, drinkData, dessertData] = await Promise.all([
          menuRes.json(), catRes.json(), drinkRes.json(), dessertRes.json(),
        ]);
        const dishesData = Array.isArray(menuData) ? menuData : [];
        const popular = dishesData.filter((d: Dish) => d.popular);
        const nonPopular = dishesData.filter((d: Dish) => !d.popular).sort(() => Math.random() - 0.5);
        shuffledRef.current = [...popular, ...nonPopular];
        setDishes(dishesData);
        setCategories(Array.isArray(catData) ? catData : []);
        setDrinks(Array.isArray(drinkData) ? drinkData : []);
        setDesserts(Array.isArray(dessertData) ? dessertData : []);
      } catch (error) {
        console.error("Failed to fetch menu:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    const handleSearch = (e: Event) => {
      const query = (e as CustomEvent).detail as string;
      setActiveCategory("all");
      setSearchQuery(query);
    };
    window.addEventListener("nanafood:search", handleSearch);
    return () => window.removeEventListener("nanafood:search", handleSearch);
  }, []);

  // Plats filtrés selon recherche
  const searchedDishes = searchQuery
    ? dishes.filter((dish) =>
        dish.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dish.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        dish.category?.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : null;

  // Catégories qui ont des résultats dans la recherche
  const matchedCategoryIds = searchedDishes
    ? [...new Set(searchedDishes.map((d) => d.category?.id))]
    : null;

  const matchedCategories = matchedCategoryIds
    ? categories.filter((c) => matchedCategoryIds.includes(c.id))
    : categories;

  // Filtres affichés — seulement les catégories avec résultats si recherche active
  const filterCategories = searchQuery
    ? [
        ...(matchedCategories.length > 1 ? [{ id: "all", label: "All Dishes" }] : []),
        ...matchedCategories.map((c) => ({ id: c.id, label: c.label })),
      ]
    : [
        { id: "all", label: "All Dishes" },
        ...categories.map((c) => ({ id: c.id, label: c.label })),
      ];

  // Auto-select la catégorie si 1 seul résultat dans 1 catégorie
  useEffect(() => {
    if (searchQuery && matchedCategoryIds && matchedCategoryIds.length === 1) {
      setActiveCategory(matchedCategoryIds[0]);
    } else if (searchQuery && matchedCategoryIds && matchedCategoryIds.length > 1) {
      setActiveCategory("all");
    }
  }, [searchQuery, matchedCategoryIds?.join(",")]);

  const filtered = (() => {
    if (!searchQuery && activeCategory === "all") return shuffledRef.current;

    const base = searchedDishes || dishes;
    const result = base.filter((dish) => {
      const matchCategory = activeCategory === "all" || dish.category?.id === activeCategory;
      return matchCategory;
    });
    return result;
  })();

  const filteredDrinks = drinks.filter((drink) =>
    !searchQuery || drink.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredDesserts = desserts.filter((dessert) =>
    !searchQuery || dessert.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const hasNoResults = filtered.length === 0 && filteredDrinks.length === 0 && filteredDesserts.length === 0;

  const handleAddSimpleItem = (item: Drink | Dessert, type: "drink" | "dessert") => {
    const fakeDish = {
      id: item.id, name: item.name,
      description: type === "drink" ? "Drink" : "Dessert",
      longDescription: "", price: item.price, popular: false, spiceable: false, feeds: 1,
      category: { id: type, label: type === "drink" ? "Drinks" : "Desserts" },
      supplements: [], drinks: [],
    };
    addItem(fakeDish as any, []);
    openCart();
  };

  const clearSearch = () => {
    setSearchQuery("");
    setActiveCategory("all");
  };

  return (
    <section id="menu" className="w-full py-24" style={{ background: "#FAF6F0", paddingBottom: "6rem" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "0 2rem" }}>

        {/* Header */}
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <span style={{ display: "block", fontFamily: "var(--font-dm)", fontSize: "11px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.18em", color: "#C23D0C", marginBottom: "0.75rem" }}>
            Our Menu
          </span>
          <h2 style={{ fontFamily: "var(--font-playfair)", fontWeight: 700, fontSize: "clamp(2rem, 5vw, 3.2rem)", color: "#743306", lineHeight: 1.15, marginBottom: "1rem" }}>
            Crafted with{" "}
            <span style={{ background: "linear-gradient(135deg, #C23D0C 0%, #E85E00 50%, #DB9217 100%)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>tradition.</span>
          </h2>
          <p style={{ fontFamily: "var(--font-dm)", fontWeight: 300, fontSize: "0.95rem", color: "#A44B09", maxWidth: "420px", margin: "0 auto", lineHeight: 1.8 }}>
            Every dish tells a story rooted in West African kitchens, made fresh daily in Denver.
          </p>
        </div>

        {/* Search active banner */}
        {searchQuery && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0.75rem 1.25rem", borderRadius: "12px", background: "rgba(194,61,12,0.06)", border: "1px solid rgba(194,61,12,0.18)", marginBottom: "2rem" }}>
            <p style={{ fontFamily: "var(--font-dm)", fontSize: "0.875rem", color: "#A44B09" }}>
              Results for <strong style={{ color: "#743306" }}>"{searchQuery}"</strong> — {filtered.length + filteredDrinks.length + filteredDesserts.length} found
            </p>
            <button
              onClick={clearSearch}
              style={{ display: "flex", alignItems: "center", gap: "0.4rem", background: "transparent", border: "none", color: "#C23D0C", cursor: "pointer", fontFamily: "var(--font-dm)", fontSize: "0.8rem", fontWeight: 500 }}
            >
              <X size={14} strokeWidth={2} />
              Clear
            </button>
          </div>
        )}

        {/* Filters */}
        <div style={{ width: "100%", overflowX: "auto", WebkitOverflowScrolling: "touch", scrollbarWidth: "none", marginBottom: "3.5rem", paddingBottom: "0.25rem" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem", width: "max-content", minWidth: "100%", padding: "0 0.25rem" }}>
            {filterCategories.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setActiveCategory(cat.id)}
                  style={{
                    padding: "0.5rem 1.25rem", borderRadius: "100px", fontSize: "11px",
                    fontFamily: "var(--font-dm)", fontWeight: 500, textTransform: "uppercase",
                    letterSpacing: "0.12em", cursor: "pointer", transition: "all 0.2s",
                    background: isActive ? "#C23D0C" : "rgba(255,255,255,0.60)",
                    border: isActive ? "1px solid #743306" : "1px solid rgba(164,75,9,0.25)",
                    color: isActive ? "#ECD8B6" : "#A44B09",
                    boxShadow: isActive ? "0 4px 16px rgba(194,61,12,0.28)" : "none",
                    whiteSpace: "nowrap", flexShrink: 0,
                  }}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Loading */}
        {isLoading && (
          <div style={{ display: "flex", justifyContent: "center", padding: "4rem 0" }}>
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "50%", border: "2px solid rgba(194,61,12,0.20)", borderTop: "2px solid #C23D0C", animation: "spin 0.8s linear infinite" }} />
              <p style={{ fontFamily: "var(--font-dm)", fontSize: "0.875rem", color: "#A44B09" }}>Loading menu...</p>
            </div>
          </div>
        )}

        {!isLoading && (
          <>
            {/* No results */}
            {hasNoResults && (
              <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "6rem 0", gap: "1rem" }}>
                <p style={{ fontFamily: "var(--font-playfair)", fontWeight: 700, fontSize: "1.5rem", color: "rgba(194,61,12,0.35)" }}>
                  {searchQuery ? "No results found" : "No dishes yet"}
                </p>
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    style={{ padding: "0.6rem 1.5rem", borderRadius: "100px", background: "#C23D0C", border: "none", color: "#ECD8B6", fontFamily: "var(--font-dm)", fontSize: "0.875rem", cursor: "pointer" }}
                  >
                    Back to menu
                  </button>
                )}
              </div>
            )}

            {/* Dishes grid */}
            {filtered.length > 0 && (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
                {filtered.map((dish) => (
                  <DishCard key={dish.id} dish={dish as any} />
                ))}
              </div>
            )}

            {/* Drinks section */}
            {filteredDrinks.length > 0 && (
              <div style={{ marginTop: "5rem" }}>
                <div style={{ marginBottom: "2rem" }}>
                  <span style={{ display: "block", fontFamily: "var(--font-dm)", fontSize: "11px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.18em", color: "#C23D0C", marginBottom: "0.5rem" }}>Drinks</span>
                  <h3 style={{ fontFamily: "var(--font-playfair)", fontWeight: 700, fontSize: "1.8rem", color: "#743306" }}>Refreshing beverages</h3>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1rem" }}>
                  {filteredDrinks.map((drink) => (
                    <div key={drink.id} style={{ background: "rgba(255,255,255,0.75)", backdropFilter: "blur(12px)", border: "1px solid rgba(219,146,23,0.30)", borderRadius: "14px", overflow: "hidden", cursor: "pointer", transition: "all 0.2s", boxShadow: "0 2px 12px rgba(116,51,6,0.06)" }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(194,61,12,0.45)"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(116,51,6,0.15)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(219,146,23,0.30)"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(116,51,6,0.06)"; }}
                      onClick={() => handleAddSimpleItem(drink, "drink")}
                    >
                      {drink.imageUrl && (
                        <div style={{ width: "100%", height: "140px", overflow: "hidden" }}>
                          <img src={drink.imageUrl} alt={drink.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                        </div>
                      )}
                      <div style={{ padding: "1rem 1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
                        <div>
                          <p style={{ fontFamily: "var(--font-playfair)", fontWeight: 700, fontSize: "1rem", color: "#743306", marginBottom: "0.2rem" }}>{drink.name}</p>
                          <p style={{ fontFamily: "var(--font-dm)", fontSize: "0.8rem", color: "#A44B09", fontWeight: 300 }}>Add to order</p>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.4rem", flexShrink: 0 }}>
                          <span style={{ fontFamily: "var(--font-playfair)", fontWeight: 700, fontSize: "1.1rem", color: "#C23D0C" }}>${Number(drink.price).toFixed(2)}</span>
                          <span style={{ fontFamily: "var(--font-dm)", fontSize: "10px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.1em", color: "#C23D0C", background: "rgba(194,61,12,0.08)", border: "1px solid rgba(194,61,12,0.20)", padding: "0.15rem 0.5rem", borderRadius: "100px" }}>+ Add</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Desserts section */}
            {filteredDesserts.length > 0 && (
              <div style={{ marginTop: "3.5rem", marginBottom: "4rem" }}>
                <div style={{ marginBottom: "2rem" }}>
                  <span style={{ display: "block", fontFamily: "var(--font-dm)", fontSize: "11px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.18em", color: "#DB9217", marginBottom: "0.5rem" }}>Desserts</span>
                  <h3 style={{ fontFamily: "var(--font-playfair)", fontWeight: 700, fontSize: "1.8rem", color: "#743306" }}>Sweet endings</h3>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "1rem" }}>
                  {filteredDesserts.map((dessert) => (
                    <div key={dessert.id} style={{ background: "rgba(255,255,255,0.75)", backdropFilter: "blur(12px)", border: "1px solid rgba(219,146,23,0.30)", borderRadius: "14px", overflow: "hidden", cursor: "pointer", transition: "all 0.2s", boxShadow: "0 2px 12px rgba(116,51,6,0.06)" }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "rgba(219,146,23,0.55)"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "0 12px 32px rgba(116,51,6,0.15)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "rgba(219,146,23,0.30)"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "0 2px 12px rgba(116,51,6,0.06)"; }}
                      onClick={() => handleAddSimpleItem(dessert, "dessert")}
                    >
                      {dessert.imageUrl && (
                        <div style={{ width: "100%", height: "140px", overflow: "hidden" }}>
                          <img src={dessert.imageUrl} alt={dessert.name} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
                        </div>
                      )}
                      <div style={{ padding: "1rem 1.25rem", display: "flex", alignItems: "center", justifyContent: "space-between", gap: "1rem" }}>
                        <div>
                          <p style={{ fontFamily: "var(--font-playfair)", fontWeight: 700, fontSize: "1rem", color: "#743306", marginBottom: "0.2rem" }}>{dessert.name}</p>
                          <p style={{ fontFamily: "var(--font-dm)", fontSize: "0.8rem", color: "#A44B09", fontWeight: 300 }}>Add to order</p>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.4rem", flexShrink: 0 }}>
                          <span style={{ fontFamily: "var(--font-playfair)", fontWeight: 700, fontSize: "1.1rem", color: "#DB9217" }}>${Number(dessert.price).toFixed(2)}</span>
                          <span style={{ fontFamily: "var(--font-dm)", fontSize: "10px", fontWeight: 500, textTransform: "uppercase", letterSpacing: "0.1em", color: "#DB9217", background: "rgba(219,146,23,0.08)", border: "1px solid rgba(219,146,23,0.25)", padding: "0.15rem 0.5rem", borderRadius: "100px" }}>+ Add</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        ::-webkit-scrollbar { display: none; }
      `}</style>
    </section>
  );
}