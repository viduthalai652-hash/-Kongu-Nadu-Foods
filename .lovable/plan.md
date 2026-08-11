
The full spec covers three panels (customer web, admin dashboard, Android delivery APK), a backend, Supabase database, Google Maps navigation, subscriptions, inventory, analytics, and more. That's several weeks of work — far more than one turn. Android APKs also cannot be built in Lovable (web only).

I'll deliver this in phases and start Phase 1 now.

## Phase 1 (this turn) — Marketing Homepage

Brand-accurate, responsive, light-theme landing page using your uploaded assets.

Sections (in order):
1. Sticky nav with Kongu Nadu logo
2. Hero — full-width looping background video (your uploaded mp4), white gradient overlay, headline, Explore Products + Subscribe Now CTAs
3. Featured Products auto-slider (realistic imagery for batter, rice, millets)
4. About Kongu Nadu Fresh Foods
5. Product Categories (Batter, Traditional Rice, Millets, Grocery) — auto-rotating tabbed section
6. Subscription Plans (Weekly / Monthly, from your pricing image) — auto-slide + manual
7. Weekly Delivery Schedule (Mon–Sat batter table from your image, realistic photos per day)
8. Pricing Grid (Millets + Traditional Rice with MRP / offer / 500g, matching your Campo Offer sheet)
9. Fresh Manufacturing Process
10. How Subscription Works (5-step)
11. Testimonials slider (empty state until real reviews exist — no dummy content)
12. Business Stats (counter animation)
13. FAQ accordion
14. Contact
15. Footer

Design tokens (in src/styles.css):
- Fresh Green primary, Traditional Brown secondary, Warm Yellow accent, Natural Red CTA
- Cream/beige backgrounds, white cards, soft shadows, rounded corners
- Plus Jakarta Sans (headings) + Inter (body) via Google Fonts link in __root
- Outline icons only (lucide-react)

Assets:
- Logo → lovable-assets pointer from the uploaded avif
- Hero video → lovable-assets pointer from the uploaded mp4 (autoplay/mute/loop/playsInline)
- Product / process / delivery photography → curated realistic stock images via lovable-assets

Animations: AOS-style scroll reveal + embla-carousel autoplay (already in the stack). I'll skip Theatre.js/Hammer.js — overkill for this surface and heavy.

## Phase 2 — Backend + Auth (next turn, on your go-ahead)
Enable Lovable Cloud (Supabase), full schema (users, roles, customers, products, categories, subscriptions, delivery days, addresses, building images, delivery assignments, inventory, activity logs, etc.), RLS, storage buckets for product + building images, JWT via Supabase auth, roles table with `has_role()` security-definer.

## Phase 3 — Customer Portal
Register/login, product catalog, subscription wizard (plan → days → products → qty → building image upload → COD review → confirm), customer dashboard (active subscription, upcoming deliveries, pause/resume/skip/cancel).

## Phase 4 — Admin Dashboard
Dashboard widgets, customer/product/subscription/inventory/order/scheduling modules, manual delivery-executive assignment (no auto-assign, no mock data), reports, analytics.

## Phase 5 — Delivery Executive Web App
Mobile-first web app (installable PWA) — Android APK build is out of scope on Lovable, but a PWA gives the same install-to-home-screen experience. Login, today's deliveries, one-tap Google Maps navigation (using GOOGLE_API_KEY), call customer, status update, completed/pending views. Google Maps used only here — never on customer portal.

## Technical notes
- Stack stays TanStack Start + React + Tailwind v4 (already configured); no react-router-dom.
- Razorpay left as a stub payment provider interface so it can be swapped in later without structural changes.
- `GOOGLE_API_KEY` will be stored server-side and only referenced from Phase 5 executive routes.

Proceeding with Phase 1 now — reply "next" when you want Phase 2.
