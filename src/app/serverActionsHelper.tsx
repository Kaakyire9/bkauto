import { createClient } from '@supabase/supabase-js'

export function createServerActionClient(opts: { cookies: any }) {
  // This helper uses the service role key on the server — keep it secret in env
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) {
    throw new Error('Missing Supabase env vars for server client')
  }
  return createClient(url, key, {
    auth: { persistSession: false }
  })
}
