import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://mufbahcitcaizyvdyxlq.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im11ZmJhaGNpdGNhaXp5dmR5eGxxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODU3ODI3MDAsImV4cCI6MjEwMTM1ODcwMH0.WiZ3VpHUBT4yhUJXsWA05T3Z56g2MYuHjIS6HgykjFo";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
  },
});

/**
 * Déclenche l'authentification OAuth (Google ou autre)
 * Redirige vers le portail OAuth puis retourne sur /auth/callback
 */
export async function signInWithProvider(provider: "google" | "github") {
  const origin = typeof window !== "undefined" ? window.location.origin : "http://localhost:3000";
  const redirectTo = `${origin}/auth/callback`;

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo,
      queryParams: {
        access_type: "offline",
        prompt: "consent",
      },
    },
  });

  if (error) {
    throw error;
  }

  return data;
}

export async function signOutSupabase() {
  await supabase.auth.signOut();
}
