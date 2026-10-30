# REGNAR — Frame Art storefront

Responsive bilingual (English / Arabic) product catalogue for REGNAR. The first release uses AED pricing and WhatsApp enquiries; it does not collect customer payments or place orders online.

## Included
- `index.html` — customer storefront with text-led animated hero/categories, a Latest Arrivals section and full product catalogue
- `admin.html` — private product, multi-image gallery, category photography, promotions, manual sales display and homepage content manager
- `config.js` — browser-safe Supabase project URL/publishable key and initial contact defaults
- `supabase/migrations/202610300001_regnar_store.sql` — initial database schema and row-level security
- `supabase/migrations/202610310001_storefront_controls.sql` — category homepage visibility and bilingual storefront settings
- `supabase/migrations/202610310002_product_gallery_promotions.sql` — optional category images, Top Rated flag and manual sales-count fields
- `assets/regnar-logo.png` — transparent original REGNAR wordmark
- `privacy.html`, `shipping.html` — bilingual customer information pages

## Connected services
- GitHub: `XOTahsin/Regnar`
- Supabase: dedicated REGNAR project `dqmbdwhnifrdndtwrllt` (region `eu-west-2`)
- Storage bucket: `regnar-products`
- Instagram: REGNAR profile
- Facebook: REGNAR page

The initial database migration and the storefront-controls and product-promotion schemas have been applied to the dedicated REGNAR Supabase project. The storefront-controls SQL was executed against the live project and the migration file is committed for version control; do not re-run it against the already migrated project.

## First admin account setup
1. In Supabase Dashboard → Authentication → Users, create an administrator user.
2. Copy that user's UUID.
3. In the REGNAR project's SQL Editor, run the one-time statement below if the account has not already been authorised:

   ```sql
   insert into public.admin_users (user_id)
   values ('YOUR_AUTH_USER_UUID');
   ```

4. Open `/admin` and sign in. Only users in `public.admin_users` can manage products, categories, images and storefront settings.

## Category management
Open Admin → Categories. Add a category with English and optional Arabic names, set its slug and display order, and choose whether it is active in shop filters and visible on the homepage. Optionally upload a JPG, PNG or WEBP category photograph; without one the storefront keeps the text-led category card. Existing categories can be edited and reordered. Deleting a category does not delete its products: PostgreSQL sets the affected products' `category_id` to NULL so they remain in the catalogue as uncategorised items.

## Storefront controls
Open Admin → Storefront to edit English and Arabic versions of the announcement, hero headline and description, animated ticker statements, categories section, collection section, brand story, custom-frame section and contact section. The same panel controls the WhatsApp number, Instagram/Facebook links, visibility of Latest Arrivals and how many new designs are shown.

The hero is text-only by default. An optional brand photo can be uploaded from Admin → Storefront; only that image will appear in the hero. No stock or third-party interior photos are used in the homepage design. Product pictures shown in Latest Arrivals and the catalogue come from your own product uploads.

## Add products
1. Open `/admin` and sign in.
2. Choose **Add design**. Enter the English name, optional Arabic name, description, category and base price in AED.
3. Add any number of size rows, each with an optional Arabic label and its own AED price. Customers can also request a custom dimension.
4. Add available frame finishes, upload a main image and multiple gallery images. Remove unwanted gallery images in the editor before saving. Customers can switch between all uploaded angles in the product detail view, and gallery thumbnails are revealed on hover over product cards on desktop.
5. Set an optional original price above the current price to show an automatic discount amount, mark a design as Top Rated, and enter a manually maintained sales count. Save as Draft or Published. Only non-draft products appear publicly. New products are ordered by `created_at`, newest first, and appear in Latest Arrivals while that section is enabled.

Images are stored in the public `regnar-products` bucket so customers can see product photography. Upload, update and delete access is restricted to authorised admins. Allowed formats: JPG, PNG and WEBP, maximum 12 MB per image. Original uploaded files are not cropped or overwritten by the website.

## Temporary contact setup
The site currently uses `+8801410158834` as a temporary Bangladesh WhatsApp test number. Replace it with the UAE business number before launch. The number and social links can now be changed from Admin → Storefront.

## Deployment
This is a static site with no build step. Vercel uses Framework Preset **Other**, no Build Command and Output Directory `.`. A GitHub push deploys when the Vercel project is connected to this repository.

## Before public launch
- Replace the temporary Bangladesh WhatsApp number with REGNAR's UAE business number.
- Upload real product images, descriptions, sizes and confirmed AED prices.
- Confirm delivery areas, shipping fees, fulfilment timelines and returns conditions before publishing promises.
- Add Arabic titles and descriptions for products that should be displayed in Arabic.
- Test both languages and product/WhatsApp enquiry flows on real phones and desktop browsers.
- Supabase Auth currently reports that leaked-password protection is disabled; enable this in the Auth password-security settings before production.

## Security
Only the Supabase publishable key belongs in browser-side configuration. Never add a service-role/secret key, database password or personal access token to this repository.
