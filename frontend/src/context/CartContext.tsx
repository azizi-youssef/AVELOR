"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Product, ProductVariant, CartItem } from "@/types";
import { api } from "@/lib/api";
import { useToast } from "@/context/ToastContext";

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
  isCartOpen: boolean;
  setIsCartOpen: React.Dispatch<React.SetStateAction<boolean>>;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const { toast } = useToast();
  const [couponCode, setCouponCode] = useState<string>("");
  const [discountAmount, setDiscountAmount] = useState<number>(0);
  const [couponError, setCouponError] = useState<string | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);

  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);
  const toggleCart = useCallback(() => setIsCartOpen((prev) => !prev), []);

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
    const isExisting = items.some((i) => i.variant.id === variant.id);
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

    toast(isExisting ? "Panier mis à jour" : "Ajouté au panier", {
      type: "success",
      subMessage: product.name_fr,
    });
    setIsCartOpen(true);
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
    const item = items.find((i) => i.variant.id === variantId);
    if (item) {
      toast("Retiré du panier", { type: "info", subMessage: item.product.name_fr });
    }
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
        toast("Code promo appliqué !", {
          type: "success",
          subMessage: `−${res.calculated_discount} MAD`,
        });
        return true;
      } else {
        setCouponError(res.message);
        toast(res.message || "Code invalide", { type: "error" });
        return false;
      }
    } catch (err: any) {
      setCouponError(err.message || "Erreur de validation du code");
      toast("Erreur lors de la validation du code", { type: "error" });
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
        isCartOpen,
        setIsCartOpen,
        openCart,
        closeCart,
        toggleCart,
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
