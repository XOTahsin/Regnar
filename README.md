# REGNAR — Frame Art

Premium UAE-facing framed-art catalogue and WhatsApp enquiry storefront.

## Stack
- Responsive static storefront (HTML/CSS/ES modules)
- Supabase Auth, Postgres and Storage
- English / Arabic with RTL layout
- Vercel static deployment

## Repository structure
- `index.html` — customer storefront
- `admin.html` — private catalogue manager
- `config.js` — public Supabase URL/key, WhatsApp and social URLs
- `supabase/migrations/` — database schema and RLS policies
- `assets/` — brand artwork and static assets

## Contact configuration
The current WhatsApp number is a temporary Bangladesh test number: `+8801410158834`. Replace it with the UAE business number before launch. Social profiles are set to the REGNAR Instagram and Facebook pages.

## Security
Only the Supabase publishable key is used in browser code. Never add a service-role key, secret key, password or personal access token to this repository.
