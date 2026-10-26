"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { Product } from "@/types";
import { useToast } from "@/context/ToastContext";

interface WishlistContextType {
  items: Product[];
  addItem: (product: Product) => void;
  removeItem: (productId: number) => void;
  toggleItem: (product: Product) => void;
  isWishlisted: (productId: number) => boolean;
  count: number;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<Product[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    try {
      const saved = localStorage.getItem("avelor_wishlist");
      if (saved) setItems(JSON.parse(saved));
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("avelor_wishlist", JSON.stringify(items));
  }, [items]);

  const addItem = useCallback((product: Product) => {
    setItems((prev) => {
      if (prev.find((p) => p.id === product.id)) return prev;
      return [...prev, product];
    });
    toast("Ajouté à la wishlist", { type: "wishlist", subMessage: product.name_fr });
  }, [toast]);

  const removeItem = useCallback((productId: number) => {
    let removedItem: Product | undefined;
    setItems((prev) => {
      removedItem = prev.find((p) => p.id === productId);
      return prev.filter((p) => p.id !== productId);
    });
    if (removedItem) {
      toast("Retiré de la wishlist", { type: "info", subMessage: (removedItem as Product).name_fr });
    }
  }, [toast]);

  const toggleItem = useCallback((product: Product) => {
    let wasRemoved = false;
    setItems((prev) => {
      if (prev.find((p) => p.id === product.id)) {
        wasRemoved = true;
        return prev.filter((p) => p.id !== product.id);
      }
      return [...prev, product];
    });

    if (wasRemoved) {
      toast("Retiré de la wishlist", { type: "info", subMessage: product.name_fr });
    } else {
      toast("Ajouté à la wishlist", { type: "wishlist", subMessage: product.name_fr });
    }
  }, [toast]);

  const isWishlisted = useCallback(
    (productId: number) => items.some((p) => p.id === productId),
    [items]
  );

  const count = items.length;

  return (
    <WishlistContext.Provider value={{ items, addItem, removeItem, toggleItem, isWishlisted, count }}>
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (!context) throw new Error("useWishlist must be used within a WishlistProvider");
  return context;
}

