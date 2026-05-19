# DRIP. Store (`drip-store`)

Next.js storefront for the DRIP. monorepo. See the **[root README](../README.md)** for how to run the API and store together.

## Environment

Copy `.env.example` to **`.env.local`** (Next.js convention):

| Variable | Scope | Purpose |
|----------|--------|---------|
| `NEXT_PUBLIC_API_URL` | Client | Express API base URL (default `http://localhost:5000`) |
| `NEXT_PUBLIC_SUPABASE_URL` | Client | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client | Supabase anon (public) key |

Auth uses `@supabase/ssr` (browser + middleware + server). Protected routes (`/account`, `/checkout`, `/admin`) redirect to `/auth/login` when there is no session. The **admin role** is still enforced by the API; the UI only requires a logged-in user for `/admin`.

## Images

`next.config.ts` allows `images.unsplash.com` and **`res.cloudinary.com`** for `next/image`. Product/banner URLs returned by the API should use Cloudinary (or Unsplash for placeholders).

## Scripts

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).
