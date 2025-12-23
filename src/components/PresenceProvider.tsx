"use client"
import { useEffect } from 'react'
import { supabase } from '../lib/supabaseClient'

// Lightweight presence heartbeat for the logged-in user.
// Mount this once near the top of your app (e.g. in layout or root dashboard).
export default function PresenceProvider() {
  useEffect(() => {
    let interval: NodeJS.Timeout | undefined

    const startHeartbeat = async () => {
      console.log('[presence-provider] starting heartbeat')
      const { data: sessionData } = await supabase.auth.getSession()
      const userId = sessionData?.session?.user?.id
      if (!userId) {
        console.log('[presence-provider] no authenticated user; skipping')
        return
      }

      console.log('[presence-provider] authenticated user', { userId })

      const beat = async () => {
        const nowIso = new Date().toISOString()
        console.log('[presence-provider] heartbeat upsert', { userId, last_seen_at: nowIso })
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
          console.warn('[presence-provider] heartbeat failed', error)
        } else {
          console.log('[presence-provider] heartbeat success', { userId, last_seen_at: nowIso })
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
