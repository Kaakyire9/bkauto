import { getSupabaseServer } from '../lib/supabaseServer'

export function createServerActionClient(opts: { cookies: any }) {
  // return a server-side supabase client using the service role key
  const supabase = getSupabaseServer()
  if (!supabase) {
    throw new Error('Missing Supabase env vars for server client')
  }
  // supabase-js client already created with service role key in getSupabaseServer
  return supabase
}
