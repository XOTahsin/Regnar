# REGNAR — Frame Art

Premium framed posters and wall art. Static site (HTML/CSS/vanilla JS) + Supabase (database, auth, storage). Enquiry-based: customers contact REGNAR on WhatsApp; there is no online payment or fake checkout.

## Files
| Path | Purpose |
|---|---|
| `index.html`, `assets/css/store.css`, `assets/js/store.js` | Public storefront (English / Arabic) |
| `admin.html` → `/admin`, `assets/css/admin.css`, `assets/js/admin.js` | Private admin dashboard |
| `privacy.html`, `shipping.html` | Bilingual info pages (placeholders until policies are confirmed) |
| `config.js` | Browser-safe Supabase URL + **publishable** key, contact defaults |
| `supabase/schema.sql` | Complete backend: tables, RLS, storage bucket + policies, starter data. Idempotent |
| `vercel.json`, `robots.txt`, `manifest.webmanifest` | Hosting / SEO |

## Deploy (3 steps)
1. **Supabase** → SQL Editor → paste and run `supabase/schema.sql` (safe to re-run; never deletes data).
2. **Supabase** → Authentication → Users → *Add user* (email + password, auto-confirm). Then run in SQL Editor:
   ```sql
   insert into public.admin_users (user_id) select id from auth.users where email = 'YOUR_ADMIN_EMAIL' on conflict do nothing;
   ```
   Also turn **off** public sign-ups: Authentication → Sign In / Providers → disable "Allow new users to sign up".
3. **GitHub** → upload all files to the repo root (`XOTahsin/Regnar`, branch `main`). **Vercel** → Framework Preset *Other*, no build command, output directory `.`.

Then open `/admin`, sign in, add categories/designs and edit the storefront text. If you use a different Supabase project, edit `config.js` (publishable key only — never a service-role key).

## Admin
- **Products:** add / edit / delete, draft · published · out of stock · made to order, multiple sizes with individual AED prices, Arabic labels, finishes, main photo + gallery, featured, Top Rated, manual sales count, original price (auto discount %).
- **Categories:** create / edit / delete (products are kept), order with ↑ ↓, active in shop, show on homepage, optional photo.
- **Storefront:** all headings, ticker, announcement (EN/AR), WhatsApp number, Instagram, Facebook, optional hero photo, Latest Arrivals on/off and count. Empty fields fall back to defaults.

## Before launch
- Replace the temporary Bangladesh WhatsApp number (`8801410158834`) with the UAE business number in Admin → Storefront.
- Confirm real shipping / returns / privacy wording and edit `shipping.html` and `privacy.html`.
- Images: JPG/PNG/WEBP, max 12 MB per file, stored in the public `regnar-products` bucket; only admins can upload or delete.

## Fast image loading
- On upload, the admin converts each photo in the browser to a compressed WebP (max 1600 px, `*.o.webp`) plus a small preview (640 px, `*.t.webp`). Customers see the small preview on cards, categories and the home wall, and the full-quality version when they open a design.
- Images are cached for a year, fade in when ready, and the first ones load with priority.
- **Existing designs:** open Admin → Products → **Speed up existing photos** once. It makes compressed copies and points the designs at them. Original files stay in storage.
