/* Browser-safe REGNAR settings. Never add a Supabase secret/service-role key here. */
window.REGNAR_CONFIG = Object.freeze({
  supabaseUrl: "https://dqmbdwhnifrdndtwrllt.supabase.co",
  supabasePublishableKey: "sb_publishable_QVUbYZzpbZuSDSG76cGFBA_MsvUhe0N",
  whatsappNumber: "8801410158834",
  instagramUrl: "https://www.instagram.com/regnar.frame?mdxt=dG1heTY4bDFtdTZk",
  facebookUrl: "https://www.facebook.com/share/1JMjC66xXH/",
  currency: "AED",
  storageBucket: "regnar-products",
  /* ---- shop extras (edit freely) ---- */
  deliveryReady: "2–4 days",  /* ready-to-ship designs */
  deliveryMade: "7–10 days",  /* made-to-order / custom */
  deliveryReadyAr: "٢–٤ أيام",
  deliveryMadeAr: "٧–١٠ أيام",
  /* offers (bundle / free delivery) are set in Admin → Storefront → Offers */
  /* standard sizes added with one click in the product editor */
  defaultSizes: [
    { label_en: "12 × 16", label_ar: "", price_aed: 159 },
    { label_en: "16 × 24", label_ar: "", price_aed: 219 },
    { label_en: "18 × 24", label_ar: "", price_aed: 249 },
    { label_en: "20 × 30", label_ar: "", price_aed: 299 },
    { label_en: "24 × 32", label_ar: "", price_aed: 349 },
    { label_en: "30 × 40", label_ar: "", price_aed: 449 }
  ],
  /* limited editions: { "<product id>": piecesLeft } */
  limited: {},
  /* customer photos: [{ url: "https://...jpg", name: "Sara, Dubai", caption: "Living room" }] */
  customerPhotos: []
});