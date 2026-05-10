import { createClient } from "@supabase/supabase-js"

const supabaseUrl = "https://zpvjlwdddkurqugublxt.supabase.co"
const supabaseAnonKey = "sb_publishable_94slfhiVrx74l06aZKg6jg_ySNPVpCW"

export const supabase = createClient(
  supabaseUrl,
  supabaseAnonKey
)