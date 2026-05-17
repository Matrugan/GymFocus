import { supabase } from "../lib/supabase";

export function fetchBodyMeasurements(userId, limit = 60) {
  return supabase
    .from("body_measurements")
    .select("*")
    .eq("user_id", userId)
    .order("measured_at", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(limit);
}

export function upsertBodyMeasurement(record) {
  return supabase
    .from("body_measurements")
    .upsert(record, {
      onConflict: "user_id,measured_at",
    })
    .select()
    .single();
}

export function deleteBodyMeasurement(measurementId, userId) {
  return supabase
    .from("body_measurements")
    .delete()
    .eq("id", measurementId)
    .eq("user_id", userId);
}
