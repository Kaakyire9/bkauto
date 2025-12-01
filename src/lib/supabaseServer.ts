import { createClient, SupabaseClient } from '@supabase/supabase-js'

let _supabaseServer: SupabaseClient | null = null

/**
 * Return a memoized Supabase server client, or `null` if required env vars are missing.
 * This avoids throwing during build/prerender when environment variables are not available.
 */
export function getSupabaseServer(): SupabaseClient | null {
  if (_supabaseServer) return _supabaseServer

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) return null

  _supabaseServer = createClient(url, key)
  return _supabaseServer
}
