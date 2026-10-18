"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { Product, ProductVariant, CartItem } from "@/types";
import { api } from "@/lib/api";

interface CartContextType {
  items: CartItem[];
  addItem: (product: Product, variant: ProductVariant, quantity?: number) => void;
  updateQuantity: (variantId: number, quantity: number) => void;
  removeItem: (variantId: number) => void;
  clearCart: () => void;
  itemCount: number;
  subtotal: number;
  shippingFee: number;
  discountAmount: number;
  totalAmount: number;
  couponCode: string;
  couponError: string | null;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [couponCode, setCouponCode] = useState<string>("");
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [couponError, setCouponError] = useState<string | null>(null);

  // Charger le panier depuis localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("avelor_cart");
      if (saved) {
        setItems(JSON.parse(saved));
      }
    } catch {
      // Ignorer erreur de parsing
    }
  }, []);

  // Sauvegarder dans localStorage
  useEffect(() => {
    localStorage.setItem("avelor_cart", JSON.stringify(items));
  }, [items]);

  const addItem = (product: Product, variant: ProductVariant, quantity: number = 1) => {
    setItems((prev) => {
      const existingIndex = prev.findIndex((i) => i.variant.id === variant.id);
      if (existingIndex > -1) {
        const next = [...prev];
        const newQty = next[existingIndex].quantity + quantity;
        next[existingIndex] = {
          ...next[existingIndex],
          quantity: Math.min(newQty, variant.stock),
        };
        return next;
      }
      return [...prev, { product, variant, quantity: Math.min(quantity, variant.stock) }];
    });
  };

  const updateQuantity = (variantId: number, quantity: number) => {
    if (quantity <= 0) {
      removeItem(variantId);
      return;
    }
    setItems((prev) =>
      prev.map((item) => {
        if (item.variant.id === variantId) {
          return {
            ...item,
            quantity: Math.min(quantity, item.variant.stock),
          };
        }
        return item;
      })
    );
  };

  const removeItem = (variantId: number) => {
    setItems((prev) => prev.filter((item) => item.variant.id !== variantId));
  };

  const clearCart = () => {
    setItems([]);
    setCouponCode("");
    setDiscountAmount(0);
    setCouponError(null);
  };

  const subtotal = items.reduce((acc, item) => {
    const price = item.product.discount_price ? Number(item.product.discount_price) : Number(item.product.base_price);
    return acc + price * item.quantity;
  }, 0);

  // Frais de port : Gratuit au dessus de 500 MAD, sinon 40 MAD
  const shippingFee = subtotal > 0 && subtotal - discountAmount < 500 ? 40 : 0;
  const totalAmount = Math.max(0, subtotal - discountAmount + shippingFee);

  const applyCoupon = async (code: string): Promise<boolean> => {
    setCouponError(null);
    if (!code.trim()) return false;
    try {
      const res = await api.validateCoupon(code.trim(), subtotal);
      if (res.is_valid) {
        setCouponCode(res.code);
        setDiscountAmount(Number(res.calculated_discount));
        return true;
      } else {
        setCouponError(res.message);
        return false;
      }
    } catch (err: any) {
      setCouponError(err.message || "Erreur de validation du code");
      return false;
    }
  };

  const removeCoupon = () => {
    setCouponCode("");
    setDiscountAmount(0);
    setCouponError(null);
  };

  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        addItem,
        updateQuantity,
        removeItem,
        clearCart,
        itemCount,
        subtotal,
        shippingFee,
        discountAmount,
        totalAmount,
        couponCode,
        couponError,
        applyCoupon,
        removeCoupon,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
