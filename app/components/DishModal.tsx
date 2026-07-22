"use client";

import { useState } from "react";
import { X, Plus, Minus } from "lucide-react";
import { Dish, Supplement } from "@/app/data/menu";
import { useCart } from "@/app/context/CartContext";

type Props = {
  dish: Dish;
  isOpen: boolean;
  onClose: () => void;
};

export default function DishModal({ dish, isOpen, onClose }: Props) {
  const { addItem } = useCart();
  const [selectedSupplements, setSelectedSupplements] = useState<Supplement[]>([]);
  const [quantity, setQuantity] = useState(1);

  if (!isOpen) return null;

  const toggleSupplement = (supplement: Supplement) => {
    setSelectedSupplements((prev) =>
      prev.find((s) => s.id === supplement.id)
        ? prev.filter((s) => s.id !== supplement.id)
        : [...prev, supplement]
    );
  };

  const supplementsTotal = selectedSupplements.reduce((sum, s) => sum + s.price, 0);
  const unitPrice = dish.price + supplementsTotal;
  const totalPrice = unitPrice * quantity;

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addItem(dish, selectedSupplements);
    }
    setSelectedSupplements([]);
    setQuantity(1);
    onClose();
  };

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-6"
        style={{ background: "rgba(0,0,0,0.75)", backdropFilter: "blur(10px)" }}
        onClick={onClose}
      >
        {/* Modal */}
        <div
          className="relative w-full md:max-w-lg max-h-[92vh] overflow-y-auto rounded-t-3xl md:rounded-2xl"
          style={{
            background: "#111109",
            border: "1px solid rgba(232,99,26,0.15)",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Image area */}
          <div
            className="relative w-full h-48 md:h-56 overflow-hidden rounded-t-3xl md:rounded-t-2xl"
            style={{
              background: "linear-gradient(135deg, #1A1710 0%, #201D12 100%)",
            }}
          >
            <div
              className="absolute inset-0 opacity-[0.04]"
              style={{
                backgroundImage: "radial-gradient(circle, #F5F0E8 1px, transparent 1px)",
                backgroundSize: "20px 20px",
              }}
            />
            <div
              className="absolute inset-0"
              style={{
                background: "radial-gradient(ellipse at center, rgba(232,99,26,0.10) 0%, transparent 70%)",
              }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span
                className="font-playfair font-bold text-center px-8"
                style={{
                  fontSize: "1.7rem",
                  color: "rgba(232,99,26,0.4)",
                }}
              >
                {dish.name}
              </span>
            </div>

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-9 h-9 flex items-center justify-center rounded-full cursor-pointer transition-all duration-200"
              style={{
                background: "rgba(10,10,8,0.7)",
                border: "1px solid rgba(255,255,255,0.10)",
                color: "#F5F0E8",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "rgba(232,99,26,0.2)";
                e.currentTarget.style.borderColor = "rgba(232,99,26,0.4)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "rgba(10,10,8,0.7)";
                e.currentTarget.style.borderColor = "rgba(255,255,255,0.10)";
              }}
            >
              <X size={15} strokeWidth={2} />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 flex flex-col gap-6">

            {/* Title + price */}
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  className="font-playfair font-bold leading-tight mb-2"
                  style={{ fontSize: "clamp(1.3rem, 3vw, 1.6rem)", color: "#F5F0E8" }}
                >
                  {dish.name}
                </h2>
                <p
                  className="font-dm font-light leading-relaxed"
                  style={{ fontSize: "0.875rem", color: "#9A9585" }}
                >
                  {dish.description}
                </p>
              </div>
              <span
                className="font-playfair font-bold shrink-0"
                style={{ fontSize: "1.4rem", color: "#E8631A" }}
              >
                ${dish.price.toFixed(2)}
              </span>
            </div>

            {/* Supplements */}
            {dish.supplements.length > 0 && (
              <div>
                <p
                  className="font-dm font-medium uppercase tracking-widest mb-3"
                  style={{ fontSize: "10px", color: "#9A9585" }}
                >
                  Add-ons & Extras
                </p>
                <div className="flex flex-col gap-2">
                  {dish.supplements.map((supplement) => {
                    const isSelected = !!selectedSupplements.find(
                      (s) => s.id === supplement.id
                    );
                    return (
                      <button
                        key={supplement.id}
                        onClick={() => toggleSupplement(supplement)}
                        className="flex items-center justify-between w-full px-4 py-3 rounded-xl text-left transition-all duration-200 cursor-pointer"
                        style={{
                          background: isSelected
                            ? "rgba(232,99,26,0.12)"
                            : "rgba(255,255,255,0.03)",
                          border: isSelected
                            ? "1px solid rgba(232,99,26,0.40)"
                            : "1px solid rgba(255,255,255,0.07)",
                        }}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className="w-4 h-4 rounded-sm flex items-center justify-center shrink-0 transition-all duration-200"
                            style={{
                              background: isSelected ? "#E8631A" : "transparent",
                              border: isSelected
                                ? "1px solid #E8631A"
                                : "1px solid rgba(255,255,255,0.2)",
                            }}
                          >
                            {isSelected && (
                              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                                <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                            )}
                          </div>
                          <span
                            className="font-dm font-medium"
                            style={{
                              fontSize: "0.875rem",
                              color: isSelected ? "#F5F0E8" : "#9A9585",
                            }}
                          >
                            {supplement.name}
                          </span>
                        </div>
                        <span
                          className="font-dm font-medium shrink-0"
                          style={{
                            fontSize: "0.875rem",
                            color: isSelected ? "#E8631A" : "#9A9585",
                          }}
                        >
                          +${supplement.price.toFixed(2)}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Quantity + Add to cart */}
            <div
              className="flex items-center justify-between gap-4 pt-4"
              style={{ borderTop: "1px solid rgba(232,99,26,0.10)" }}
            >
              {/* Quantity */}
              <div
                className="flex items-center gap-3 px-3 py-2 rounded-full"
                style={{ border: "1px solid rgba(232,99,26,0.18)" }}
              >
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="w-7 h-7 flex items-center justify-center rounded-full transition-all duration-200 cursor-pointer"
                  style={{
                    background: "rgba(232,99,26,0.10)",
                    border: "none",
                    color: "#F5883A",
                  }}
                >
                  <Minus size={13} strokeWidth={2} />
                </button>
                <span
                  className="font-dm font-medium w-5 text-center"
                  style={{ color: "#F5F0E8" }}
                >
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity((q) => q + 1)}
                  className="w-7 h-7 flex items-center justify-center rounded-full transition-all duration-200 cursor-pointer"
                  style={{
                    background: "rgba(232,99,26,0.10)",
                    border: "none",
                    color: "#F5883A",
                  }}
                >
                  <Plus size={13} strokeWidth={2} />
                </button>
              </div>

              {/* Add to cart */}
              <button
                onClick={handleAddToCart}
                className="flex-1 flex items-center justify-between px-5 py-3 rounded-full font-dm font-medium text-white text-sm transition-all duration-200 cursor-pointer hover:-translate-y-0.5"
                style={{
                  background: "linear-gradient(135deg, #E8631A 0%, #C44D0A 100%)",
                  boxShadow: "0 6px 24px rgba(232,99,26,0.30)",
                  border: "none",
                }}
              >
                <span>Add to order</span>
                <span className="font-bold">${totalPrice.toFixed(2)}</span>
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}