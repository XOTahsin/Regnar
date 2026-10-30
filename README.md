# REGNAR — Frame Art storefront

Responsive bilingual (English / Arabic) product catalogue for REGNAR. The first release uses AED pricing and WhatsApp enquiries; it does not collect payments or place orders online.

## Included
- `index.html` — customer storefront
- `admin.html` — private product/category manager
- `config.js` — browser-safe Supabase project URL and publishable key, WhatsApp and social links
- `supabase/migrations/202610300001_regnar_store.sql` — database schema and RLS policies
- `assets/regnar-logo.png` — transparent original REGNAR wordmark
- `privacy.html`, `shipping.html` — customer information pages

## Connected services
- GitHub: `XOTahsin/Regnar`
- Supabase: dedicated REGNAR project `dqmbdwhnifrdndtwrllt` (region `eu-west-2`)
- Storage bucket: `regnar-products`
- Instagram: `https://www.instagram.com/regnar.frame/`
- Facebook: `https://www.facebook.com/share/1JMjC66xXH/`

The initial database migration has been applied to the dedicated REGNAR Supabase project. Do not re-run the initial migration against that live project.

## First admin account setup
1. In Supabase Dashboard → Authentication → Users, create your administrator user with a strong password.
2. Copy that user's UUID.
3. In the REGNAR project's SQL Editor, run this one-time statement (replace the UUID):

   ```sql
   insert into public.admin_users (user_id)
   values ('YOUR_AUTH_USER_UUID');
   ```

4. Open `/admin` and sign in. Only users in `public.admin_users` can manage catalogue data and upload images.

## Add products
1. Open `/admin` and sign in.
2. Choose **Add design**. Enter its English name, optional Arabic name, description, category and base price in AED.
3. Add as many size rows as required, each with an optional Arabic label and its own AED price. Customers can also request a custom dimension.
4. Add available frame finishes, upload a main image and optional gallery images.
5. Save as Draft or Published. Only published products appear in the customer catalogue.

Images are stored in the public `regnar-products` bucket so customers can see product photography. Upload, update and delete access is restricted to authorised admins. Allowed formats: JPG, PNG and WEBP, max 12 MB per image. Original uploaded files are not cropped or overwritten by the website.

## Temporary contact setup
The website currently uses `+8801410158834` as a temporary Bangladesh WhatsApp test number. Replace it with REGNAR's UAE business number before launch. The user-provided Instagram and Facebook URLs are in `config.js`. Instagram and Facebook enquiry buttons open WhatsApp with a source-specific prefilled message.

## Vercel deployment
This is a static site with no build step. In Vercel, connect/import `XOTahsin/Regnar`, choose Framework Preset **Other**, leave Build Command empty and set Output Directory to `.`. A successful GitHub push triggers deployment only when the Vercel project is actually connected to this repository. Verify the deployment status and production domain in Vercel.

## Before public launch
- Create and authorise the admin user.
- Replace the temporary Bangladesh WhatsApp number with the real UAE number.
- Upload real product images, descriptions, sizes and confirmed AED prices; no fake demo products are seeded.
- Confirm delivery areas, shipping fees, fulfilment timelines and returns conditions before publishing promises.
- Add Arabic titles and descriptions for products that should be displayed in Arabic.
- Test Arabic RTL, product selection and WhatsApp enquiries on real phones and desktop browsers.
- Review the Privacy and Shipping pages and provide any missing legal/business details before accepting customer enquiries.

## Security
Only the Supabase publishable key belongs in browser-side configuration. Never add a service-role/secret key, database password or personal access token to this repository.
