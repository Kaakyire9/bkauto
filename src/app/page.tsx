import { createServerActionClient } from './serverActionsHelper'
import { cookies } from 'next/headers'
import Hero from '../components/Hero'

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

      <div className="px-6 py-10 container mx-auto">
        <h1 className="text-2xl font-semibold mb-4">bkauto-next starter</h1>
        <p className="mb-6">This is a minimal Next.js 14 app with Tailwind and Supabase helpers.</p>

        <section className="mb-6">
          <h2 className="text-lg font-medium">Sample notes (from Supabase)</h2>
          <ul className="list-disc ml-6 mt-2">
            {notes.length === 0 ? <li className="text-sm text-gray-500">No notes found (or table missing)</li> : null}
            {notes.map((n: any) => (
              <li key={n.id}>{n.title ?? JSON.stringify(n)}</li>
            ))}
          </ul>
        </section>

        <section>
          <h2 className="text-lg font-medium mb-2">Create note (Server Action)</h2>
          <form action={async (formData: FormData) => {
            'use server'
            const title = formData.get('title')?.toString() ?? ''
            if (!title) return
            try {
              const supaAction = createServerActionClient({ cookies })
              await supaAction.from('notes').insert({ title })
            } catch (err) {
              // fail silently if Supabase not configured in this environment
            }
          }} className="flex gap-2">
            <input name="title" placeholder="Note title" className="border px-3 py-2 rounded flex-1" />
            <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Create</button>
          </form>
        </section>
      </div>
    </div>
  )
}
