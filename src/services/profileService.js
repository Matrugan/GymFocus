import { supabase } from "../lib/supabase";

export function fetchProfileById(userId) {
  return supabase.from("profiles").select("*").eq("id", userId).single();
}

export function fetchProfileByUsername(username) {
  return supabase
    .from("profiles")
    .select("*")
    .eq("username", username)
    .single();
}

export function updateProfileStats(userId, updates) {
  return supabase.from("profiles").update(updates).eq("id", userId);
}
