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

function isRecoverableMeasurementUpsertError(error) {
  const message = [
    error?.message,
    error?.details,
    error?.hint,
    error?.code,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();

  return (
    message.includes("no unique or exclusion constraint") ||
    message.includes("there is no unique") ||
    message.includes("on conflict") ||
    message.includes("schema cache") ||
    message.includes("could not find")
  );
}

async function findBodyMeasurementByDate(userId, measuredAt) {
  return supabase
    .from("body_measurements")
    .select("*")
    .eq("user_id", userId)
    .eq("measured_at", measuredAt)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
}

export async function upsertBodyMeasurement(record) {
  const upsertResult = await supabase
    .from("body_measurements")
    .upsert(record, {
      onConflict: "user_id,measured_at",
    })
    .select()
    .single();

  if (
    !upsertResult.error ||
    !isRecoverableMeasurementUpsertError(upsertResult.error)
  ) {
    return upsertResult;
  }

  const existingResult = await findBodyMeasurementByDate(
    record.user_id,
    record.measured_at,
  );

  if (existingResult.error) {
    return upsertResult;
  }

  if (existingResult.data?.id) {
    return supabase
      .from("body_measurements")
      .update(record)
      .eq("id", existingResult.data.id)
      .eq("user_id", record.user_id)
      .select()
      .single();
  }

  return supabase.from("body_measurements").insert([record]).select().single();
}

export function deleteBodyMeasurement(measurementId, userId) {
  return supabase
    .from("body_measurements")
    .delete()
    .eq("id", measurementId)
    .eq("user_id", userId);
}
