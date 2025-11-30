# bkauto-next (Next.js 14 + TypeScript + Tailwind + Supabase)

Quick starter scaffold with:

- Next.js 14 App Router (in `src/app`)
- TypeScript
- TailwindCSS
- Supabase (client + server examples)

Setup

1. Install dependencies (PowerShell):

```powershell
cd c:/Projects/bkauto
npm install
```

2. Create a `.env.local` with these variables (get values from your Supabase project):

```
NEXT_PUBLIC_SUPABASE_URL=your-public-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

3. Run dev server:

```powershell
npm run dev
```

Files of interest:

- `src/app/layout.tsx` - layout and global CSS import
- `src/app/page.tsx` - demo page with Server Action
- `src/app/api/hello/route.ts` - example Next.js API route
- `src/lib/supabaseClient.ts` - browser/client Supabase helper
- `src/lib/supabaseServer.ts` - server-side Supabase helper (uses service role key placeholder)
