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

export function checkUsernameAvailability(username) {
  return supabase
    .from("profiles")
    .select("id")
    .eq("username", username)
    .maybeSingle();
}

export function updateProfileStats(userId, updates) {
  return supabase.from("profiles").update(updates).eq("id", userId);
}

export function updateProfile(userId, updates) {
  return supabase.from("profiles").update(updates).eq("id", userId);
}

export async function uploadProfileImage({ bucket, file, path }) {
  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(path, file, {
      cacheControl: "3600",
      contentType: file.type,
      upsert: true,
    });

  if (uploadError) {
    return { data: null, error: uploadError };
  }

  const { data } = supabase.storage.from(bucket).getPublicUrl(path);

  return {
    data: data?.publicUrl ? `${data.publicUrl}?v=${Date.now()}` : null,
    error: null,
  };
}
