# Min Max Log

Mobile-first PWA workout logger built with Next.js, TypeScript, Tailwind, shadcn-style UI primitives, Supabase, and Recharts.

## Setup

1. Install deps: `npm install`
2. Create `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Run migrations and seed:
   - `supabase db push`
   - `psql < supabase/seed.sql`
4. Start app: `npm run dev`

## Included UX refinements

- Exercise-level history preview under each row (Last + Best tonnage)
- Last Time modal with summary metrics and per-exercise status
- Debounced autosave with local draft persistence and background sync state labels
- Mobile-first logging cards with large numeric inputs and Enter-to-next-field flow
- Progress analytics with grouping controls, delta labels, stacked contribution chart, and overload trend
- Clickable body map with training index disclaimer
