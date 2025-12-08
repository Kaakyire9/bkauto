import { createServerActionClient } from './serverActionsHelper'
import { cookies } from 'next/headers'
import Hero from '../components/Hero'
import HowItWorks from '../components/HowItWorks'
import Footer from '../components/Footer'

export default async function Page() {
  // Try to create server client; if env vars are missing (e.g. during build/prerender)
  // fall back and skip server calls so the build doesn't fail.
  let supa: any = null
  try {
    supa = createServerActionClient({ cookies })
  } catch (err) {
    supa = null
  }

  // Example read: fetch from a demo table 'notes' if it exists
  let notes: any[] = []
  if (supa) {
    try {
      const { data } = await supa.from('notes').select('*').limit(5)
      notes = data ?? []
    } catch (e) {
      // ignore if table doesn't exist or query fails
      notes = []
    }
  }

  return (
    <div>
      <Hero />

      <HowItWorks />

      <Footer />
    </div>
  )
}
