import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Menu, X, Truck, Package, MapPin, Check } from "lucide-react";
import logo from "../assets/logo.png";
import packDosa from "../assets/pack-dosa-batter.png";
import packIdly from "../assets/pack-idly-batter.png";
import { PHOTOS } from "../lib/photos";
import { useReveal } from "../lib/animations";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — Kongu Nadu Fresh Foods" },
      { name: "description", content: "Our story, Campo pricing, how our batter is made, and where we deliver. Rooted in Kongu Nadu, delivered fresh." },
      { property: "og:title", content: "About Kongu Nadu Fresh Foods" },
      { property: "og:description", content: "Rooted in Kongu Nadu — stone-ground batter, heritage rice and pan-India delivery." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  useReveal();
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <AboutHero />
      <Story />
      <Manufacturing />
      <PricingSheet />
      <Coverage />
      <AboutFooter />
    </div>
  );
}

function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  return (
    <header className={`sticky top-0 z-50 transition-all ${scrolled ? "bg-background/85 backdrop-blur-md shadow-sm border-b border-border" : "bg-background/60 backdrop-blur"}`}>
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:py-4">
        <Link to="/" className="flex items-center">
          <img src={logo} alt="Kongu Nadu Fresh Foods" className="h-12 w-auto md:h-14" />
        </Link>
        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-foreground/80">
          <Link to="/" className="hover:text-brand-green">Home</Link>
          <a href="#made" className="hover:text-brand-green">How it's made</a>
          <a href="#offer" className="hover:text-brand-green">Campo offer</a>
          <a href="#coverage" className="hover:text-brand-green">Coverage</a>
        </nav>
        <div className="hidden lg:flex items-center gap-2">
          <Link to="/" hash="plans" className="btn-ripple px-5 py-2.5 rounded-full text-sm font-semibold bg-brand-red text-white shadow-sm hover:brightness-110 transition">
            Subscribe Now
          </Link>
        </div>
        <button className="lg:hidden p-2 -mr-2" onClick={() => setOpen((v) => !v)} aria-label="Toggle menu">
          {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>
      {open && (
        <div className="lg:hidden border-t border-border bg-background">
          <div className="mx-auto max-w-7xl px-4 py-3 flex flex-col gap-1">
            <Link to="/" onClick={() => setOpen(false)} className="py-2.5 text-sm font-medium">Home</Link>
            <a href="#made" onClick={() => setOpen(false)} className="py-2.5 text-sm font-medium">How it's made</a>
            <a href="#offer" onClick={() => setOpen(false)} className="py-2.5 text-sm font-medium">Campo offer</a>
            <a href="#coverage" onClick={() => setOpen(false)} className="py-2.5 text-sm font-medium">Coverage</a>
          </div>
        </div>
      )}
    </header>
  );
}

function AboutHero() {
  return (
    <section
      className="relative py-24 md:py-36"
      style={{ backgroundImage: `linear-gradient(rgba(20,50,30,0.55), rgba(20,50,30,0.65)), url(${PHOTOS.paddyField})`, backgroundSize: "cover", backgroundPosition: "center" }}
    >
      <div className="mx-auto max-w-4xl px-4 text-center text-white">
        <p className="text-xs font-bold tracking-[0.2em] text-brand-yellow">OUR STORY</p>
        <h1 className="mt-3 font-display font-extrabold text-4xl md:text-6xl">
          Rooted in Kongu Nadu.
        </h1>
        <p className="mt-5 text-white/85 text-lg max-w-2xl mx-auto">
          Grown by our farmers, ground in our kitchens, and delivered to your door — the way food used to be.
        </p>
      </div>
    </section>
  );
}

function Story() {
  return (
    <section className="py-20 md:py-28">
      <div className="mx-auto max-w-4xl px-4 reveal">
        <p className="text-foreground/80 text-lg leading-relaxed">
          Kongu Nadu Fresh Foods was born out of a simple frustration — that the batters, rices and
          millets our grandmothers relied on had been quietly replaced with preservative-laden
          shortcuts. We work directly with farmers across the Kongu belt, grind our batter on
          traditional stone wheels each morning, and get every pack to your door the same day.
        </p>
        <p className="mt-6 text-foreground/80 text-lg leading-relaxed">
          Nothing artificial goes into our packs. No preservatives, no bleaching, no shortcuts. Just
          real food, made the right way, at a fair price.
        </p>
      </div>
    </section>
  );
}

/* ---------------- HOW IT'S MADE — vertical timeline ---------------- */
function Manufacturing() {
  const steps = [
    ["Sourcing", "Grains sourced directly from Kongu Nadu farmers, cleaned & hand-sorted before entering our kitchens.", PHOTOS.farmerHands],
    ["Soaking", "Traditional overnight soaking in filtered water — no shortcuts, no additives, no bleaching agents.", PHOTOS.soaking],
    ["Stone grinding", "Slow stone-ground on granite wheels at low RPM to preserve nutrients, texture and natural fermentation.", PHOTOS.grinding],
    ["Sealed packaging", "Vacuum-sealed in food-grade pouches with the same-day batch stamp and best-before date.", PHOTOS.packaging],
    ["Doorstep delivery", "Loaded onto insulated vans and delivered to your door the same evening — Monday to Saturday, 4 PM to 7 PM. No Sunday deliveries.", PHOTOS.delivery],
  ] as const;
  return (
    <section id="made" className="py-20 md:py-28 bg-cream-dark/40">
      <div className="mx-auto max-w-5xl px-4">
        <div className="reveal text-center max-w-2xl mx-auto mb-16">
          <p className="text-xs font-bold tracking-[0.2em] text-brand-green">HOW IT'S MADE</p>
          <h2 className="mt-2 font-display font-extrabold text-3xl md:text-5xl text-brand-green-dark">
            From farm to your doorstep in 5 steps
          </h2>
          <p className="mt-4 text-muted-foreground">
            A single continuous process — every batch traced from grain to grinder to pouch to your kitchen.
          </p>
        </div>

        <div className="relative">
          {/* vertical spine */}
          <div className="hidden md:block absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-brand-green/20" aria-hidden />

          <div className="space-y-10 md:space-y-14">
            {steps.map(([t, d, img], i) => (
              <div key={t} className="reveal relative">
                {/* number badge on spine */}
                <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 -top-2 h-12 w-12 rounded-full bg-brand-green text-white items-center justify-center font-extrabold text-lg shadow-lg ring-4 ring-cream-dark/40 z-10">
                  {i + 1}
                </div>

                <div className="rounded-3xl bg-white border border-border shadow-sm overflow-hidden md:mt-6">
                  <div className="grid md:grid-cols-5">
                    <div className="md:col-span-2 h-56 md:h-72">
                      <img src={img} alt={t} loading="lazy" className="h-full w-full object-cover" />
                    </div>
                    <div className="md:col-span-3 p-6 md:p-10 flex flex-col justify-center">
                      <div className="flex items-center gap-3 md:hidden mb-3">
                        <span className="h-9 w-9 rounded-full bg-brand-green text-white grid place-items-center font-extrabold text-sm">{i + 1}</span>
                        <span className="text-xs font-bold tracking-widest text-brand-green">STEP {String(i + 1).padStart(2, "0")}</span>
                      </div>
                      <span className="hidden md:inline text-xs font-bold tracking-widest text-brand-green">STEP {String(i + 1).padStart(2, "0")}</span>
                      <h3 className="mt-1 font-display font-extrabold text-2xl md:text-3xl text-brand-green-dark">{t}</h3>
                      <p className="mt-3 text-foreground/75 text-base md:text-lg leading-relaxed">{d}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- CAMPO OFFER (read-only mirror of admin catalogue) ---------------- */
type PriceRow = readonly [string, number, number, number];


function PriceTable({ title, rows, accent }: { title: string; rows: readonly (readonly [string, number, number, number])[]; accent: string }) {
  return (
    <div className="reveal rounded-3xl bg-white border border-border shadow-sm overflow-hidden">
      <div className={`px-5 py-4 flex items-center justify-between ${accent}`}>
        <h3 className="font-display font-extrabold text-lg text-white">{title}</h3>
        <span className="text-[10px] font-bold text-white bg-white/20 px-2 py-1 rounded-full">10% OFF ON MRP</span>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-xs uppercase tracking-wider text-muted-foreground bg-cream-dark/50">
            <tr>
              <th className="text-left px-4 py-3">Product</th>
              <th className="text-right px-3 py-3">MRP 1kg</th>
              <th className="text-right px-3 py-3">Offer 1kg</th>
              <th className="text-right px-4 py-3">500g</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(([n, mrp, off, half]) => (
              <tr key={n} className="border-t border-border/60 hover:bg-cream-dark/30 transition">
                <td className="px-4 py-3 font-medium text-foreground/85">{n}</td>
                <td className="px-3 py-3 text-right text-muted-foreground line-through">₹{mrp}</td>
                <td className="px-3 py-3 text-right text-brand-red font-bold">₹{off}</td>
                <td className="px-4 py-3 text-right text-foreground/80">₹{half}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function useCatalogue() {
  return useQuery({
    queryKey: ["public-catalogue"],
    refetchInterval: 30000,
    queryFn: async () => {
      const { data } = await supabase
        .from("products")
        .select("name, mrp_paise, price_paise, is_active, categories(slug)")
        .eq("is_active", true)
        .order("name");
      const rows = (data ?? []) as any[];
      const pick = (slug: string): PriceRow[] =>
        rows
          .filter(r => r.categories?.slug === slug)
          .map(r => [
            r.name,
            Math.round((r.mrp_paise ?? 0) / 100),
            Math.round((r.price_paise ?? 0) / 100),
            Math.round((r.price_paise ?? 0) / 200),
          ] as PriceRow);
      return { millets: pick("millets"), rice: pick("rice") };
    },
  });
}

function PricingSheet() {
  const { data } = useCatalogue();
  return (
    <section id="offer" className="py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-4">
        <div className="reveal text-center max-w-2xl mx-auto">
          <span className="inline-flex items-center gap-2 rounded-full bg-brand-red text-white text-xs font-bold px-3 py-1.5">
            CAMPO OFFER · 10% OFF
          </span>
          <h2 className="mt-4 font-display font-extrabold text-3xl md:text-5xl text-brand-green-dark">
            Millets & traditional rice pricing
          </h2>
          <p className="mt-3 text-muted-foreground">Farmer-first prices. Available in 500g and 1kg packs. Delivered pan-India.</p>
        </div>
        <div className="mt-12 grid lg:grid-cols-2 gap-6">
          <PriceTable title="Millets" rows={data?.millets ?? []} accent="bg-gradient-to-r from-brand-green to-brand-green-dark" />
          <PriceTable title="Traditional Rices" rows={data?.rice ?? []} accent="bg-gradient-to-r from-brand-brown to-[oklch(0.35_0.07_50)]" />
        </div>
      </div>
    </section>
  );

}

/* ---------------- COVERAGE ---------------- */
function Coverage() {
  return (
    <section
      id="coverage"
      className="relative py-20 md:py-28"
      style={{ backgroundImage: `linear-gradient(rgba(245,240,225,0.92), rgba(245,240,225,0.92)), url(${PHOTOS.map})`, backgroundSize: "cover", backgroundPosition: "center" }}
    >
      <div className="mx-auto max-w-7xl px-4">
        <div className="reveal text-center max-w-2xl mx-auto">
          <p className="text-xs font-bold tracking-[0.2em] text-brand-green">DELIVERY COVERAGE</p>
          <h2 className="mt-2 font-display font-extrabold text-3xl md:text-5xl text-brand-green-dark">
            Local batter · Pan-India rice & grocery
          </h2>
        </div>
        <div className="mt-12 grid md:grid-cols-2 gap-6">
          <div className="reveal rounded-3xl bg-white border border-border p-8 shadow-sm">
            <div className="h-12 w-12 rounded-2xl bg-brand-green/10 grid place-items-center text-brand-green">
              <Truck className="h-6 w-6" />
            </div>
            <h3 className="mt-5 font-display font-extrabold text-2xl text-brand-green-dark">Fresh batter — local delivery</h3>
            {/* <div className="mt-5 grid grid-cols-2 gap-3">
              <img src={packDosa} alt="Kongunadu idly dosa batter pouch" loading="lazy" className="h-36 w-full object-contain rounded-2xl bg-cream p-3" />
              <img src={packIdly} alt="Kongunadu idly batter pouch" loading="lazy" className="h-36 w-full object-contain rounded-2xl bg-cream p-3" />
            </div> */}
            <p className="mt-4 text-muted-foreground">
              Ground the same morning and delivered to your door <strong className="text-foreground">Monday to Saturday, 4 PM – 7 PM</strong>.
              Sundays are our weekly holiday. Free doorstep delivery on every subscription.
            </p>
            <ul className="mt-6 grid grid-cols-2 gap-2 text-sm">
              {["Coimbatore"].map((c) => (
                <li key={c} className="flex items-center gap-2"><MapPin className="h-4 w-4 text-brand-green" />{c}</li>
              ))}
            </ul>
          </div>

          <div className="reveal rounded-3xl bg-white border border-border p-8 shadow-sm">
            <div className="h-12 w-12 rounded-2xl bg-brand-brown/10 grid place-items-center text-brand-brown">
              <Package className="h-6 w-6" />
            </div>
            <h3 className="mt-5 font-display font-extrabold text-2xl text-brand-green-dark">Rice & grocery — pan-India</h3>
            <p className="mt-3 text-muted-foreground">
              Heritage traditional rice and millets shipped anywhere in India via trusted courier partners,
              with pincode validation and transparent shipping charges.
            </p>
            <ul className="mt-6 grid grid-cols-2 gap-2 text-sm">
              {["Pincode validation", "3–7 day delivery", "COD available", "Transparent shipping"].map((c) => (
                <li key={c} className="flex items-center gap-2"><Check className="h-4 w-4 text-brand-green" />{c}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

function AboutFooter() {
  return (
    <footer className="border-t border-border bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 flex flex-wrap items-center justify-between gap-4 text-xs text-muted-foreground">
        <div className="flex items-center gap-3">
          <img src={logo} alt="Kongu Nadu Fresh Foods" className="h-10 w-auto" />
          <span>© {new Date().getFullYear()} Kongu Nadu Fresh Foods.</span>
        </div>
        <Link to="/" hash="plans" className="text-brand-green font-semibold hover:text-brand-green-dark">Subscribe now →</Link>
      </div>
    </footer>
  );
}
