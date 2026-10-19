"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { User } from "@/types";
import { api } from "@/lib/api";
import { signInWithProvider, signOutSupabase } from "@/lib/supabase";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  loginWithOAuth: (provider: "google" | "github") => Promise<void>;
  setAuthSession: (token: string, user: User) => void;
  updateProfile: (data: { first_name?: string; last_name?: string; phone?: string; password?: string; avatar_url?: string | null }) => Promise<User>;
  logout: () => void;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem("avelor_token");
    if (savedToken) {
      setToken(savedToken);
      api.getMe()
        .then((userData) => {
          setUser(userData);
        })
        .catch(() => {
          localStorage.removeItem("avelor_token");
          setToken(null);
          setUser(null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setIsLoading(false);
    }
  }, []);

  const setAuthSession = (newToken: string, newUser: User) => {
    localStorage.setItem("avelor_token", newToken);
    setToken(newToken);
    setUser(newUser);
  };

  const login = async (email: string, password: string) => {
    const res = await api.login({ email, password });
    setAuthSession(res.access_token, res.user);
  };

  const register = async (data: any) => {
    const res = await api.register(data);
    setAuthSession(res.access_token, res.user);
  };

  const loginWithOAuth = async (provider: "google" | "github") => {
    await signInWithProvider(provider);
  };

  const updateProfile = async (data: { first_name?: string; last_name?: string; phone?: string; password?: string; avatar_url?: string | null }) => {
    const updated = await api.updateMe(data);
    setUser(updated);
    return updated;
  };

  const logout = () => {
    localStorage.removeItem("avelor_token");
    setToken(null);
    setUser(null);
    signOutSupabase().catch(() => {});
  };

  const isAdmin = user?.role === "ADMIN" || user?.role === "CATALOG_MANAGER" || user?.role === "ORDER_MANAGER";

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isLoading,
        login,
        register,
        loginWithOAuth,
        setAuthSession,
        updateProfile,
        logout,
        isAdmin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
