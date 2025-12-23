"use client"
import { useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

// Lightweight presence heartbeat for the logged-in user.
// Mount this once near the top of your app (e.g. in layout or root dashboard).
export default function PresenceProvider() {
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined

    const startHeartbeat = async () => {
      const { data: sessionData } = await supabase.auth.getSession()
      const userId = sessionData?.session?.user?.id
      if (!userId) {
        return
      }

      const beat = async () => {
        const nowIso = new Date().toISOString()
        const { error } = await supabase
          .from('user_presence')
          .upsert(
            {
              user_id: userId,
              last_seen_at: nowIso
            },
            { onConflict: 'user_id' }
          )

        if (error) {
          console.warn('Presence heartbeat failed', error)
        }
      }

      // Send one immediately, then every 30s
      await beat()
      interval = setInterval(beat, 30_000)
    }

    startHeartbeat()

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [])

  return null
}
