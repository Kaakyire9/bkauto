import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!url || !key) {
    return NextResponse.json({ ok: false, message: 'Supabase not configured' }, { status: 500 })
  }

  const supa = createClient(url, key)

  // sample: return Supabase version or a simple pong
  return NextResponse.json({ ok: true, message: 'hello from API route' })
}
