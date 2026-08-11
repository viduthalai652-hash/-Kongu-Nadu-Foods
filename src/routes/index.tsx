import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";
import {
  Leaf,
  Truck,
  ShieldCheck,
  Clock,
  Menu,
  X,
  ChevronLeft,
  ChevronRight,
  Check,
  Sprout,
  Wheat,
  Package,
  Factory,
  MapPin,
  CalendarDays,
  Repeat,
} from "lucide-react";
import { useSession } from "@/lib/auth";

import logo from "../assets/logo.png";
import heroVideo from "../assets/hero.mp4";
import aboutImage from "../assets/about-kongu-nadu.png";
import packDosa from "../assets/pack-dosa-batter.png";
import packIdly from "../assets/pack-idly-batter.png";
import heritageRice from "../assets/heritage-rice.jpg";
import { PHOTOS } from "../lib/photos";
import { useReveal } from "../lib/animations";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kongu Nadu Fresh Foods — Batter Subscription & Traditional Rice" },
      {
        name: "description",
        content:
          "Monthly and weekly fresh batter subscriptions delivered 4–7 PM across Coimbatore, plus heritage traditional rice shipped pan-India.",
      },
      { property: "og:title", content: "Kongu Nadu Fresh Foods — Batter Subscription & Traditional Rice" },
      {
        property: "og:description",
        content:
          "Monthly and weekly fresh batter subscriptions delivered 4–7 PM across Coimbatore, plus heritage traditional rice shipped pan-India.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Home,
});

function Home() {
  useReveal();
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Nav />
      <Hero />
      {/* <About /> */}
      <BatterSection />
      <Plans />
      <WhatWeOffer />
      <RiceSection />
      <Footer />
    </div>
  );
}

/* ---------------- NAV ---------------- */
function Nav() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { session } = useSession();
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  const links = [
    ["Plans", "#plans"],
    ["Batter", "#batter"],
    ["What we offer", "#offer"],
    ["Traditional rice", "#rice"],
  ];
  return (
    <header
      className={`sticky top-0 z-50 transition-all ${
        scrolled
          ? "bg-background/95 backdrop-blur-md shadow-sm border-b border-border"
          : "bg-background border-b border-border/60"
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 md:py-4">
        <a href="#top" className="flex items-center">
          <img src={logo} alt="Kongu Nadu Fresh Foods" className="h-12 w-auto md:h-14" />
        </a>
        <nav className="hidden lg:flex items-center gap-7 text-sm font-medium text-foreground/80">
          {links.map(([l, h]) => (
            <a key={l} href={h} className="hover:text-brand-green transition-colors">
              {l}
            </a>
          ))}
          <Link to="/about" className="hover:text-brand-green transition-colors">
            About
          </Link>
        </nav>
        <div className="hidden lg:flex items-center gap-2">
          {session ? (
            <Link
              to="/dashboard"
              className="px-4 py-2 rounded-full text-sm font-semibold text-brand-brown hover:bg-cream-dark transition"
            >
              My account
            </Link>
          ) : (
            <Link
              to="/auth"
              className="px-4 py-2 rounded-full text-sm font-semibold text-brand-brown hover:bg-cream-dark transition"
            >
              Sign in
            </Link>
          )}
          <Link
            to={session ? "/subscribe" : "/auth"}
            search={session ? undefined : ({ redirect: "/subscribe" } as any)}
            className="btn-ripple px-5 py-2.5 rounded-full text-sm font-semibold bg-brand-red text-white shadow-sm hover:shadow-md hover:brightness-110 transition"
          >
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
            {links.map(([l, h]) => (
              <a
                key={l}
                href={h}
                onClick={() => setOpen(false)}
                className="py-2.5 text-sm font-medium hover:text-brand-green"
              >
                {l}
              </a>
            ))}
            <Link
              to="/about"
              onClick={() => setOpen(false)}
              className="py-2.5 text-sm font-medium hover:text-brand-green"
            >
              About
            </Link>
            {session ? (
              <Link
                to="/dashboard"
                onClick={() => setOpen(false)}
                className="py-2.5 text-sm font-medium hover:text-brand-green"
              >
                My account
              </Link>
            ) : (
              <Link
                to="/auth"
                onClick={() => setOpen(false)}
                className="py-2.5 text-sm font-medium hover:text-brand-green"
              >
                Sign in
              </Link>
            )}
            <Link
              to={session ? "/subscribe" : "/auth"}
              onClick={() => setOpen(false)}
              className="mt-2 text-center py-3 rounded-full font-semibold bg-brand-red text-white"
            >
              Subscribe Now
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

/* ---------------- HERO ---------------- */
function Hero() {
  return (
    <section id="top" className="relative overflow-hidden bg-cream">
      <div className="absolute inset-0 z-0 pointer-events-none">
        <video
          key="hero-video"
          className="absolute inset-0 h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          poster={PHOTOS.paddyField}
        >
          <source src={heroVideo} type="video/mp4" />
        </video>
        <div
          className="absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.35) 40%, rgba(0,0,0,0.05) 75%, transparent 100%)",
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 pt-[100px] pb-20 md:pb-28">
        <div className="max-w-3xl mx-auto text-center">
          <span className="reveal inline-flex items-center gap-2 rounded-full bg-white/95 px-3 py-1.5 text-xs font-semibold text-brand-green shadow-sm border border-brand-green/20">
            <Leaf className="h-3.5 w-3.5" /> Pure tradition • Pure nutrition
          </span>
          <h1 className="reveal mt-5 font-display font-extrabold text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.05] text-white drop-shadow-[0_2px_12px_rgba(0,0,0,0.55)]">
            Healthy breakfast, <span className="text-brand-yellow">every day.</span>
          </h1>
          <p className="reveal mt-5 text-base md:text-lg text-white/95 max-w-xl mx-auto drop-shadow-[0_1px_8px_rgba(0,0,0,0.6)]">
            Stone-ground batter on subscription — delivered every evening between 4 PM and 7 PM across Coimbatore — plus
            heritage traditional rice shipped across India.
          </p>
          <div className="reveal mt-8 flex flex-wrap items-center justify-center gap-3">
            <a
              href="#plans"
              className="btn-ripple inline-flex items-center gap-2 rounded-full bg-brand-red px-6 py-3.5 text-sm md:text-base font-semibold text-white shadow-md hover:shadow-lg hover:brightness-110 transition"
            >
              Subscribe Now
            </a>
            <a
              href="#rice"
              className="btn-ripple inline-flex items-center gap-2 rounded-full bg-white/95 border border-brand-green/30 px-6 py-3.5 text-sm md:text-base font-semibold text-brand-green hover:bg-white transition"
            >
              Shop traditional rice
            </a>
          </div>
          <div className="reveal mt-8 grid grid-cols-2 sm:grid-cols-3 gap-3 max-w-xl mx-auto">
            {[
              [Sprout, "Stone Ground"],
              [Truck, "Free Delivery"],
              [Clock, "4 PM – 7 PM Slot"],
            ].map(([Icon, label], i) => (
              <div
                key={i}
                className="flex items-center gap-2 rounded-xl bg-white/90 px-3 py-2.5 border border-white shadow-sm backdrop-blur-sm"
              >
                <Icon className="h-4 w-4 text-brand-green shrink-0" />
                <span className="text-xs font-semibold text-foreground/80">{label as string}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- ABOUT ---------------- */
function About() {
  return (
    <section className="py-20 md:py-28 bg-cream-dark/40">
      <div className="mx-auto max-w-7xl px-4 grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
        <div className="reveal relative">
          <div className="aspect-[4/3] rounded-3xl overflow-hidden shadow-lg">
            <img
              src={aboutImage}
              alt="Traditional Kongu Nadu breakfast with idly, dosa and heritage rice"
              loading="lazy"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
        <div className="reveal">
          <p className="text-xs font-bold tracking-[0.2em] text-brand-green">ABOUT KONGU NADU</p>
          <h2 className="mt-2 font-display font-extrabold text-3xl md:text-5xl text-brand-green-dark leading-tight">
            Tradition in every bite.
          </h2>
          <p className="mt-5 text-foreground/75 text-lg leading-relaxed">
            Rooted in the fertile plains of Kongu Nadu, we bring back the wholesome batters, heritage rice and millets
            our grandmothers grew up with — stone-ground each morning, packed without preservatives, and delivered to
            your doorstep.
          </p>
          <div className="mt-8 grid sm:grid-cols-2 gap-4">
            {[
              [CalendarDays, "Monday to Saturday delivery", "No deliveries on Sundays — our weekly holiday."],
              [Clock, "Evening slot 4 PM – 7 PM", "Ground in the morning, at your door the same evening."],
              [Factory, "Stone-ground fresh", "No chemicals, no preservatives, ever."],
              [Package, "Food-grade packaging", "Sealed 1 litre pouches for freshness."],
            ].map(([Icon, t, d], i) => (
              <div key={i} className="flex gap-3 rounded-2xl bg-white p-4 border border-border shadow-sm">
                <Icon className="h-5 w-5 text-brand-green shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-sm">{t as string}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{d as string}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8">
            <Link
              to="/about"
              className="inline-flex items-center gap-2 text-brand-green font-semibold hover:text-brand-green-dark"
            >
              Read our full story →
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- SUBSCRIPTION PLANS ---------------- */
const plans = [
  {
    name: "Weekly Plan",
    tag: "Flexible",
    days: "6 Days (Mon–Sat)",
    price: 1008,
    unit: "week",
    features: [
      "No long-term commitment",
      "Modify quantities easily",
      "Free doorstep delivery",
    ],
  },
  {
    name: "Monthly Plan",
    tag: "Best Value",
    days: "24 Days (Mon–Sat)",
    price: 4032,
    unit: "month",
    features: [
      "Set once and forget",
      "Most cost-effective",
      "Free doorstep delivery",
    ],
    featured: true,
  },
];



function Plans() {
  const { session } = useSession();
  const planTo = session ? "/subscribe" : "/auth";
  const planSearch = session ? undefined : ({ redirect: "/subscribe" } as any);
  return (
    <section
      id="plans"
      className="relative py-20 md:py-28"
      style={{
        backgroundImage: `linear-gradient(rgba(245,240,225,0.9), rgba(245,240,225,0.9)), url(${PHOTOS.wheat})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="mx-auto max-w-7xl px-4">
        <div className="reveal text-center max-w-2xl mx-auto">
          <p className="text-xs font-bold tracking-[0.2em] text-brand-green">SUBSCRIPTION PLANS</p>
          <h2 className="mt-2 font-display font-extrabold text-3xl md:text-5xl text-brand-green-dark">
            Choose the plan that suits you best
          </h2>
          <p className="mt-3 text-muted-foreground">
            Batter subscriptions delivered 4 PM – 7 PM. Pause, skip or cancel anytime.
          </p>
        </div>
        <div className="mt-12 grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {plans.map((p) => {
            const on = !!p.featured;
            return (
              <div
                key={p.name}
                className={`rounded-3xl p-8 md:p-10 border transition-all ${
                  on
                    ? "bg-gradient-to-br from-brand-green to-brand-green-dark text-white border-brand-green-dark shadow-xl md:scale-[1.02]"
                    : "bg-white border-border shadow-sm hover:shadow-md"
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className={`font-display font-extrabold text-2xl ${on ? "text-white" : "text-brand-green-dark"}`}>
                    {p.name}
                  </h3>
                  <span
                    className={`text-xs font-bold px-3 py-1.5 rounded-full ${
                      on ? "bg-brand-yellow text-brand-green-dark" : "bg-brand-yellow/25 text-brand-brown"
                    }`}
                  >
                    {p.tag}
                  </span>
                </div>
                <p className={`mt-1 text-sm ${on ? "text-white/80" : "text-muted-foreground"}`}>{p.days}</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span
                    className={`font-display font-extrabold text-5xl ${on ? "text-white" : "text-brand-green-dark"}`}
                  >
                    ₹{p.price.toLocaleString("en-IN")}
                  </span>
                  <span className={on ? "text-white/70" : "text-muted-foreground"}>/ {p.unit}</span>
                </div>
                <p className={`text-xs mt-1 ${on ? "text-white/70" : "text-muted-foreground"}`}>Including GST</p>
                <ul className="mt-6 space-y-2.5">
                  {p.features.map((f) => (
                    <li key={f} className="flex items-start gap-2.5">
                      <Check className={`h-4 w-4 mt-0.5 shrink-0 ${on ? "text-brand-yellow" : "text-brand-green"}`} />
                      <span className={`text-sm ${on ? "text-white/90" : "text-foreground/80"}`}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  to={planTo}
                  search={planSearch}
                  className={`btn-ripple mt-8 inline-flex w-full items-center justify-center rounded-full py-3 text-sm font-bold transition ${
                    on
                      ? "bg-brand-red text-white hover:brightness-110"
                      : "bg-brand-green/10 text-brand-green hover:bg-brand-green hover:text-white"
                  }`}
                >
                  Start this plan
                </Link>
              </div>
            );
          })}
        </div>


      </div>
    </section>
  );
}

/* ---------------- BATTER SECTION (subscription delivery) ---------------- */
const featured = [
  { name: "Karuppu Kavuni", tag: "Black Rice", image: PHOTOS.kavuniBatter },
  { name: "Ragi Batter", tag: "Iron Rich", image: PHOTOS.ragiBatter },
  { name: "Kambu Batter", tag: "Pearl Millet", image: PHOTOS.kambuBatter },
  { name: "Mappillai Samba", tag: "Red Rice", image: PHOTOS.mappillaiBatter },
  { name: "Karittuyanam", tag: "Wellness Rice", image: PHOTOS.karittuyanamBatter },
  { name: "Cholam Batter", tag: "Sorghum", image: PHOTOS.cholamBatter },
  { name: "Plain Batter", tag: "Classic", image: PHOTOS.plainBatter },
];

const week = [
  { day: "Mon", item: "Karuppu Kavuni", image: PHOTOS.kavuniBatter },
  { day: "Tue", item: "Kambu", image: PHOTOS.kambuBatter },
  { day: "Wed", item: "Mappillai Samba", image: PHOTOS.mappillaiBatter },
  { day: "Thu", item: "Ragi", image: PHOTOS.ragiBatter },
  { day: "Fri", item: "Karittuyanam", image: PHOTOS.karittuyanamBatter },
  { day: "Sat", item: "Cholam", image: PHOTOS.cholamBatter },
];

function BatterSection() {
  const [emblaRef, api] = useEmblaCarousel({ loop: true, align: "start", slidesToScroll: 2, containScroll: false }, [
    Autoplay({ delay: 3600, stopOnInteraction: false, stopOnMouseEnter: true }),
  ]);
  return (
    <section id="batter" className="py-20 md:py-28 bg-background">
      <div className="mx-auto max-w-7xl px-4">
        <div className="reveal text-center max-w-3xl mx-auto">
          <p className="text-xs font-bold tracking-[0.2em] text-brand-green">BATTER · SUBSCRIPTION DELIVERY</p>
          <h2 className="mt-2 font-display font-extrabold text-3xl md:text-5xl text-brand-green-dark">
            Fresh batter, delivered every evening
          </h2>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
            <span className="inline-flex items-center gap-2 rounded-full bg-brand-red text-white px-4 py-2 text-sm font-bold shadow-sm">
              <MapPin className="h-4 w-4" /> Delivery Available Only in Coimbatore
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-brand-green/10 text-brand-green px-4 py-2 text-sm font-bold border border-brand-green/25">
              <Repeat className="h-4 w-4" /> Monthly Subscription Service
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-brand-yellow/25 text-brand-brown px-4 py-2 text-sm font-bold">
              <Clock className="h-4 w-4" /> 4 PM – 7 PM · No Sunday delivery
            </span>
          </div>
        </div>

        {/* product carousel */}
        <div className="mt-12 flex items-end justify-between gap-4 mb-6">
          <h3 className="font-display font-extrabold text-2xl md:text-3xl text-brand-green-dark">
            Our batter varieties
          </h3>
          <div className="hidden md:flex gap-2">
            <button
              onClick={() => api?.scrollPrev()}
              aria-label="Previous"
              className="h-11 w-11 rounded-full border border-border bg-white hover:bg-cream-dark grid place-items-center transition"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => api?.scrollNext()}
              aria-label="Next"
              className="h-11 w-11 rounded-full bg-brand-green text-white hover:bg-brand-green-dark grid place-items-center transition"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>
        <div className="overflow-hidden reveal" ref={emblaRef}>
          <div className="flex">
            {featured.map((p) => (
              <div key={p.name} className="min-w-0 shrink-0 grow-0 basis-[80%] sm:basis-[48%] lg:basis-[30%] pr-5">
                <div className="group rounded-3xl bg-white shadow-sm border border-border overflow-hidden hover:shadow-lg transition h-full">
                  <div className="aspect-square overflow-hidden bg-cream-dark">
                    <img
                      src={p.image}
                      alt={p.name}
                      loading="lazy"
                      className="h-full w-full object-cover group-hover:scale-105 transition duration-500"
                    />
                  </div>
                  <div className="p-5">
                    <h3 className="font-display font-bold text-lg text-brand-green-dark">{p.name}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{p.tag}</p>
                    <div className="mt-4 flex items-center justify-between">
                      <span className="text-brand-red font-bold text-lg">
                        ₹84<span className="text-sm text-muted-foreground font-medium"> / litre</span>
                      </span>
                      <span className="text-xs font-semibold text-brand-green bg-brand-green/10 px-2.5 py-1 rounded-full">
                        Subscribe
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* weekly schedule */}
        <div className="reveal mt-16 text-center max-w-2xl mx-auto">
          <h3 className="font-display font-extrabold text-2xl md:text-3xl text-brand-green-dark">
            Your week, day by day
          </h3>
          <p className="mt-3 text-muted-foreground">
            Each day you can choose the day's speciality batter, Plain Batter, or both — in 1, 2 or 3 litre packs.
          </p>
        </div>
        <div className="mt-8 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {week.map((w) => (
            <div
              key={w.day}
              className="reveal group rounded-3xl bg-white border border-border shadow-sm overflow-hidden hover:shadow-lg transition"
            >
              <div className="aspect-square overflow-hidden">
                <img
                  src={w.image}
                  alt={`${w.item} batter`}
                  loading="lazy"
                  className="h-full w-full object-cover group-hover:scale-105 transition duration-500"
                />
              </div>
              <div className="p-4">
                <p className="text-[10px] font-bold tracking-[0.2em] text-brand-red">{w.day.toUpperCase()}</p>
                <p className="mt-1 font-display font-bold text-brand-green-dark">{w.item}</p>
                <p className="text-xs text-muted-foreground mt-1">or Plain Batter · or both</p>
                <p className="mt-2 text-sm font-bold text-brand-green">
                  ₹168 <span className="text-xs text-muted-foreground font-medium">/ day (combo)</span>
                </p>
              </div>
            </div>
          ))}
        </div>
        <div className="reveal mt-8 flex flex-wrap items-center justify-center gap-3 rounded-2xl bg-brand-green/8 border border-brand-green/20 p-5 max-w-3xl mx-auto">
          <span className="text-sm font-semibold text-brand-green-dark">Weekly total (Mon–Sat)</span>
          <span className="text-2xl font-extrabold text-brand-red">₹1,008</span>
          <span className="text-xs text-muted-foreground">Including GST • Free delivery • Sunday holiday</span>
        </div>
      </div>
    </section>
  );
}

/* ---------------- WHAT WE OFFER (auto tab rotator) ---------------- */
const categories = [
  {
    key: "batter",
    label: "Fresh Batter",
    icon: Sprout,
    image: packIdly,
    heading: "Stone-ground fresh batter",
    body: "Plain, ragi, kambu, cholam and heritage-rice batters ground fresh each morning and delivered the same evening — subscription only, Coimbatore only.",
    bullets: ["Ground fresh daily", "Zero preservatives", "Evening 4 PM – 7 PM slot"],
  },
  {
    key: "rice",
    label: "Traditional Rice",
    icon: Wheat,
    image: PHOTOS.rice,
    heading: "Heritage traditional rices",
    body: "Karuppu Kavuni, Mappillai Samba, Kattuyanam, Kichili Samba, Poongar and more — sourced directly from Kongu Nadu farmers and shipped pan-India.",
    bullets: ["12+ heritage varieties", "Pan-India courier shipping", "500g & 1kg packs"],
  },
  {
    key: "millets",
    label: "Millets",
    icon: Leaf,
    image: PHOTOS.millets,
    heading: "The wholesome millet family",
    body: "Varagu, Samai, Thinai, Kambu, Cholam and Ragi — nutrient-dense grains for a healthier every day, at fair farmer-first prices.",
    bullets: ["11 millet varieties", "Cleaned & hand-sorted", "Pan-India delivery"],
  },
  {
    key: "grocery",
    label: "Grocery & Oils",
    icon: Package,
    image: PHOTOS.grocery,
    heading: "Traditional grocery essentials",
    body: "Cold-pressed oils, stone-ground flours, homemade pickles and traditional products — everything your pantry needs.",
    bullets: ["Cold-pressed oils", "Homemade pickles", "Traditional flours"],
  },
];

function WhatWeOffer() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setActive((i) => (i + 1) % categories.length), 4200);
    return () => clearInterval(id);
  }, [paused]);
  const cat = categories[active];
  return (
    <section
      id="offer"
      className="relative py-20 md:py-28"
      style={{
        backgroundImage: `linear-gradient(rgba(250,247,238,0.94), rgba(250,247,238,0.94)), url(${PHOTOS.leaves})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="mx-auto max-w-7xl px-4">
        <div className="reveal text-center max-w-2xl mx-auto">
          <p className="text-xs font-bold tracking-[0.2em] text-brand-green">WHAT WE OFFER</p>
          <h2 className="mt-2 font-display font-extrabold text-3xl md:text-5xl text-brand-green-dark">
            Four categories, one promise
          </h2>
          <p className="mt-3 text-muted-foreground">Pure, traditional & delivered fresh.</p>
        </div>

        <div
          className="reveal mt-10 rounded-3xl overflow-hidden bg-white border border-border shadow-sm"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 border-b border-border">
            {categories.map((c, i) => {
              const Icon = c.icon;
              const on = i === active;
              return (
                <button
                  key={c.key}
                  onClick={() => setActive(i)}
                  className={`relative px-4 py-4 md:py-5 flex items-center justify-center gap-2 text-sm md:text-base font-semibold transition ${
                    on ? "text-white" : "text-foreground/70 hover:text-brand-green"
                  }`}
                >
                  {on && <span className="absolute inset-0 bg-gradient-to-br from-brand-green to-brand-green-dark" />}
                  <Icon className="relative h-4 w-4 md:h-5 md:w-5" />
                  <span className="relative">{c.label}</span>
                </button>
              );
            })}
          </div>
          <div className="grid md:grid-cols-2 items-stretch">
            <div className="aspect-[4/3] overflow-hidden bg-cream-dark">
              <img
                key={cat.image}
                src={cat.image}
                alt={cat.heading}
                loading="lazy"
                className={`h-full w-full animate-in fade-in duration-500 ${cat.key === "batter" ? "object-contain p-8" : "object-cover"}`}
              />
            </div>
            <div className="p-8 md:p-12 flex flex-col justify-center">
              <h3 className="font-display font-extrabold text-2xl md:text-3xl text-brand-green-dark">{cat.heading}</h3>
              <p className="mt-4 text-foreground/70 leading-relaxed">{cat.body}</p>
              <ul className="mt-6 space-y-3">
                {cat.bullets.map((b) => (
                  <li key={b} className="flex items-center gap-3">
                    <span className="h-6 w-6 rounded-full bg-brand-green/15 text-brand-green grid place-items-center shrink-0">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    <span className="text-sm font-medium">{b}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex gap-2">
                {categories.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActive(i)}
                    aria-label={`Show category ${i + 1}`}
                    className={`h-1.5 rounded-full transition-all ${i === active ? "w-8 bg-brand-green" : "w-4 bg-border"}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- TRADITIONAL RICE SECTION ---------------- */
const riceProducts: [string, number, number][] = [
  ["Karuppu Kavuni", 296, 266],
  ["Mappillai Samba", 112, 101],
  ["Kattuyanam", 166, 149],
  ["Kichili Samba", 154, 139],
  ["Poongar", 140, 126],
  ["Thooyamalli", 150, 135],
  ["Karunguruvai", 158, 142],
  ["Rathasali", 204, 184],
  ["Kullakar", 144, 130],
  ["Red Rice", 98, 88],
  ["Iluppaipoo Samba", 210, 189],
  ["Moongil Arisi", 674, 607],
];

function RiceSection() {
  return (
    <section id="rice" className="py-20 md:py-28 bg-cream-dark/40">
      <div className="mx-auto max-w-7xl px-4">
        <div className="reveal grid lg:grid-cols-2 gap-10 items-stretch">
          <div className="relative rounded-3xl overflow-hidden shadow-lg min-h-[300px] lg:min-h-0">
            <img
              src={heritageRice}
              alt="Heritage traditional rice varieties from Kongu Nadu"
              loading="lazy"
              width={1280}
              height={810}
              className="lg:absolute lg:inset-0 h-full w-full object-cover"
            />
          </div>

          <div className="flex flex-col items-start justify-start h-full">
            <p className="text-xs font-bold tracking-[0.2em] text-brand-green">TRADITIONAL RICE</p>
            <h2 className="mt-2 font-display font-extrabold text-3xl md:text-5xl text-brand-green-dark">
              Heritage rice, shipped pan-India
            </h2>
            <p className="mt-4 text-foreground/75 text-lg leading-relaxed">
              Buy our traditional rice varieties as one-off purchases — no subscription needed. Available in 500 g and 1
              kg packs with 10% off MRP under the Campo offer.
            </p>
            <div className="mt-6 mb-0 flex flex-wrap gap-3">
              <Link
                to="/about"
                hash="offer"
                className="btn-ripple inline-flex items-center gap-2 rounded-full bg-brand-red px-6 py-3 text-sm font-semibold text-white"
              >
                View full price list
              </Link>
              <a
                href="#offer"
                className="inline-flex items-center gap-2 rounded-full border border-brand-green/30 px-6 py-3 text-sm font-semibold text-brand-green bg-white"
              >
                Explore categories
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ---------------- FOOTER ---------------- */
function Footer() {
  return (
    <footer className="border-t border-border bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 grid md:grid-cols-4 gap-8">
        <div className="md:col-span-2">
          <img src={logo} alt="Kongu Nadu Fresh Foods" className="h-14 w-auto" />
          <p className="mt-4 text-sm text-muted-foreground max-w-sm">
            Pure tradition, pure nutrition — batter delivered Monday to Saturday, 4 PM – 7 PM across Coimbatore.
          </p>
          <div className="mt-4 flex gap-3">
            <img
              src={packIdly}
              alt="Kongunadu idly batter pack"
              loading="lazy"
              className="h-20 w-auto object-contain"
            />
            <img
              src={packDosa}
              alt="Kongunadu idly dosa batter pack"
              loading="lazy"
              className="h-20 w-auto object-contain"
            />
          </div>
        </div>
        <div>
          <p className="font-semibold text-brand-green-dark mb-3">Shop</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <a href="#batter" className="hover:text-brand-green">
                Fresh batter
              </a>
            </li>
            <li>
              <a href="#rice" className="hover:text-brand-green">
                Traditional rice
              </a>
            </li>
            <li>
              <a href="#offer" className="hover:text-brand-green">
                Millets
              </a>
            </li>
            <li>
              <a href="#offer" className="hover:text-brand-green">
                Grocery & oils
              </a>
            </li>
          </ul>
        </div>
        <div>
          <p className="font-semibold text-brand-green-dark mb-3">Company</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <Link to="/about" className="hover:text-brand-green">
                About us
              </Link>
            </li>
            <li>
              <Link to="/about" hash="offer" className="hover:text-brand-green">
                Campo offer
              </Link>
            </li>
            <li>
              <Link to="/about" hash="made" className="hover:text-brand-green">
                How it's made
              </Link>
            </li>
            <li>
              <Link to="/about" hash="coverage" className="hover:text-brand-green">
                Delivery coverage
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border">
        <div className="mx-auto max-w-7xl px-4 py-5 flex flex-wrap items-center justify-between gap-3 text-xs text-muted-foreground">
          <p>© {new Date().getFullYear()} Kongu Nadu Fresh Foods. All rights reserved.</p>
          <p>Made with 🌱 in Kongu Nadu, Tamil Nadu.</p>
        </div>
      </div>
    </footer>
  );
}
