import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PortalShell, money } from "@/lib/portal-shell";
import { useSession, useRoles } from "@/lib/auth";
import WeeklyImg from "@/assets/Cholam_batter.jpg";
import MonthlyImg from "@/assets/plain-batter.jpg";
import { Check, ChevronRight, Upload, Loader2, CreditCard, Clock } from "lucide-react";
import { LocationPicker } from "@/lib/location-picker";

export const Route = createFileRoute("/_authenticated/subscribe")({
  head: () => ({ meta: [{ title: "Start subscription — Kongu Nadu" }, { name: "description", content: "Pick your plan, weekday products and delivery location." }] }),
  component: WizardGate,
});

export const TIME_SLOT = "4-7 PM";

// Mon(1) … Sat(6) — Sunday is our weekly holiday, no deliveries.
export const WEEK_PLAN: { dow: number; label: string; special: string }[] = [
  { dow: 1, label: "Monday", special: "Karuppu Kavuni Batter" },
  { dow: 2, label: "Tuesday", special: "Kambu Batter" },
  { dow: 3, label: "Wednesday", special: "Mappillai Samba Batter" },
  { dow: 4, label: "Thursday", special: "Ragi Batter" },
  { dow: 5, label: "Friday", special: "Karittuyanam Batter" },
  { dow: 6, label: "Saturday", special: "Cholam Batter" },
];
const PLAIN = "Plain Batter";

function WizardGate() {
  const { user } = useSession();
  const { has, loading } = useRoles(user);
  const nav = useNavigate();
  useEffect(() => {
    if (loading) return;
    if (has("admin")) nav({ to: "/admin", replace: true });
    else if (has("delivery")) nav({ to: "/delivery", replace: true });
  }, [loading, has, nav]);
  if (loading) return <PortalShell title="Start subscription"><p className="text-muted-foreground">Loading…</p></PortalShell>;
  if (has("admin") || has("delivery")) return <PortalShell title="Start subscription"><div className="bg-background border border-border rounded-2xl p-8 text-center"><p className="text-lg font-semibold mb-2">Subscriptions are for customers only</p><p className="text-sm text-muted-foreground">Sign in with a customer account to start a subscription.</p></div></PortalShell>;
  return <Wizard />;
}

type Choice = "none" | "special" | "plain" | "both";

function Wizard() {
  const nav = useNavigate();
  const { user } = useSession();
  const [step, setStep] = useState(0);
  const [plan, setPlan] = useState<"weekly" | "monthly">("weekly");
  const [choices, setChoices] = useState<Record<number, { choice: Choice; litres: number }>>(
    Object.fromEntries(WEEK_PLAN.map(d => [d.dow, { choice: "both" as Choice, litres: 1 }]))
  );
  const [addr, setAddr] = useState({ label: "Home", city: "Coimbatore", pincode: "", landmark: "", phone: "", line1: "", lat: "", lng: "" });
  const [buildingFile, setBuildingFile] = useState<File | null>(null);
  const [existingAddressId, setExistingAddressId] = useState<string | null>(null);
  const [showAddrPrompt, setShowAddrPrompt] = useState(false);
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const { data: products } = useQuery({
    queryKey: ["batter-products"],
    queryFn: async () => {
      const { data } = await supabase.from("products").select("*, categories(slug,name)").eq("is_active", true).order("name");
      return data ?? [];
    },
  });

  const { data: myAddresses } = useQuery({
    queryKey: ["my-addresses", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("addresses").select("*").eq("user_id", user!.id).order("created_at", { ascending: false }).limit(2);
      return data ?? [];
    },
  });

  const { data: profile } = useQuery({
    queryKey: ["my-profile", user?.id],
    enabled: !!user,
    queryFn: async () => (await supabase.from("profiles").select("*").eq("id", user!.id).maybeSingle()).data,
  });

  useEffect(() => { if (profile?.phone && !addr.phone) setAddr(a => ({ ...a, phone: profile.phone! })); }, [profile]);

  useEffect(() => {
    if (step === 2 && (myAddresses?.length ?? 0) > 0 && !existingAddressId && !addr.lat) setShowAddrPrompt(true);
  }, [step, myAddresses, existingAddressId, addr.lat]);

  const byName = new Map((products ?? []).map((p: any) => [p.name, p]));

  function dayItems(dow: number) {
    const day = WEEK_PLAN.find(d => d.dow === dow)!;
    const c = choices[dow];
    if (!c || c.choice === "none") return [] as { product: any; qty: number }[];
    const list: { product: any; qty: number }[] = [];
    if (c.choice === "special" || c.choice === "both") { const p = byName.get(day.special); if (p) list.push({ product: p, qty: c.litres }); }
    if (c.choice === "plain" || c.choice === "both") { const p = byName.get(PLAIN); if (p) list.push({ product: p, qty: c.litres }); }
    return list;
  }
  const dayTotal = (dow: number) => dayItems(dow).reduce((s, i) => s + i.product.price_paise * i.qty, 0);
  const cycles = plan === "weekly" ? 1 : 4;
  const total = WEEK_PLAN.reduce((s, d) => s + dayTotal(d.dow), 0) * cycles;

  function onPin(v: { lat: number; lng: number; address?: string; pincode?: string; city?: string }) {
    setAddr(a => ({
      ...a,
      lat: String(v.lat),
      lng: String(v.lng),
      line1: v.address || a.line1 || `Pinned location ${v.lat.toFixed(5)}, ${v.lng.toFixed(5)}`,
      pincode: v.pincode || a.pincode,
      city: v.city || a.city,
    }));
  }

  async function mockPay() {
    setPaying(true);
    await new Promise(r => setTimeout(r, 1200));
    setPaying(false); setPaid(true);
  }

  async function submit() {
    if (!user) return;
    setBusy(true); setErr(null);
    try {
      if (addr.phone) await supabase.from("profiles").update({ phone: addr.phone }).eq("id", user.id);

      let addressId: string;
      if (existingAddressId) {
        addressId = existingAddressId;
      } else {
        let buildingUrl: string | null = null;
        if (buildingFile) {
          const path = `${user.id}/${Date.now()}-${buildingFile.name}`;
          const { error: upErr } = await supabase.storage.from("building-images").upload(path, buildingFile);
          if (upErr) throw upErr;
          buildingUrl = path;
        }
        const { data: a, error: aerr } = await supabase.from("addresses").insert({
          user_id: user.id, label: addr.label, line1: addr.line1, line2: null, city: addr.city, pincode: addr.pincode,
          landmark: [addr.landmark, addr.phone ? `Ph: ${addr.phone}` : null].filter(Boolean).join(" · "),
          lat: addr.lat ? Number(addr.lat) : null, lng: addr.lng ? Number(addr.lng) : null,
          building_image_url: buildingUrl,
        }).select("id").single();
        if (aerr) throw aerr;
        addressId = a!.id;
      }

      // New customers: deliveries start the next day after registration & payment.
      const start = new Date(); start.setDate(start.getDate() + 1);
      const end = new Date(start); end.setDate(end.getDate() + (plan === "weekly" ? 6 : 27));
      const { data: sub, error: serr } = await supabase.from("subscriptions").insert({
        user_id: user.id, address_id: addressId, plan, time_slot: TIME_SLOT,
        start_date: start.toISOString().slice(0, 10), end_date: end.toISOString().slice(0, 10),
        status: "active", total_paise: total,
      }).select("id").single();
      if (serr) throw serr;

      const items: any[] = [];
      for (const d of WEEK_PLAN)
        for (const it of dayItems(d.dow))
          items.push({ subscription_id: sub!.id, day_of_week: d.dow, product_id: it.product.id, quantity: it.qty });
      if (items.length) {
        const { error: ierr } = await supabase.from("subscription_items").insert(items);
        if (ierr) throw ierr;
      }
      nav({ to: "/dashboard" });
    } catch (e: any) { setErr(e.message ?? "Failed to save"); }
    finally { setBusy(false); }
  }

  const steps = ["Plan", "Weekly products", "Location", "Payment"];
  const canNext = step === 0 ? true
    : step === 1 ? WEEK_PLAN.some(d => dayItems(d.dow).length > 0)
    : step === 2 ? (!!existingAddressId || (!!addr.lat && !!addr.lng)) && !!addr.phone
    : true;

  return (
    <PortalShell title="Start your subscription">
      <div className="flex items-center gap-2 mb-6 overflow-x-auto">
        {steps.map((s, i) => (
          <div key={s} className={`flex items-center gap-2 whitespace-nowrap ${i === step ? "text-brand-red" : i < step ? "text-brand-green" : "text-muted-foreground"}`}>
            <div className={`h-8 w-8 rounded-full flex items-center justify-center text-sm font-bold border-2 ${i === step ? "border-brand-red bg-brand-red text-white" : i < step ? "border-brand-green bg-brand-green text-white" : "border-border"}`}>
              {i < step ? <Check className="h-4 w-4" /> : i + 1}
            </div>
            <span className="text-sm font-semibold">{s}</span>
            {i < steps.length - 1 && <ChevronRight className="h-4 w-4" />}
          </div>
        ))}
      </div>

      <div className="bg-background rounded-2xl border border-border p-4 sm:p-6">
        {step === 0 && (
          <div className="grid md:grid-cols-2 gap-4">
            {(["weekly", "monthly"] as const).map(p => (
              <button key={p} onClick={() => setPlan(p)} className={`relative overflow-hidden text-left p-6 rounded-xl border-2 transition ${plan === p ? "border-brand-red bg-brand-red/5" : "border-border hover:border-brand-red/50"}`}>
                <div className="relative z-10 w-2/3">
                  <p className="text-xs uppercase font-bold text-brand-green">{p === "weekly" ? "1 week (Mon–Sat)" : "1 month (24 days)"}</p>
                  <p className="text-2xl font-bold mt-1 capitalize">{p} Plan</p>
                  <p className="text-sm text-muted-foreground mt-2">{p === "weekly" ? "Flexible — perfect for short-term needs and easy quantity changes." : "Recurring, consistent supply and the best value for regular customers."}</p>
                </div>
                <div 
                  className="absolute right-0 top-0 bottom-0 w-1/2 bg-cover bg-center opacity-90"
                  style={{ 
                    backgroundImage: `url(${p === "weekly" ? WeeklyImg : MonthlyImg})`,
                    clipPath: 'polygon(25% 0, 100% 0, 100% 100%, 0 100%)'
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-background via-background/20 to-transparent"></div>
                </div>
              </button>
            ))}
            <div className="md:col-span-2 rounded-xl bg-cream border border-border p-4 flex items-start gap-3">
              <Clock className="h-5 w-5 text-brand-green mt-0.5" />
              <div>
                <p className="text-sm font-semibold">Preferred delivery time: 4:00 PM – 7:00 PM</p>
                <p className="text-xs text-muted-foreground mt-0.5">This is our only delivery window. No deliveries on Sundays.</p>
              </div>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">For each weekday choose the day's speciality batter, Plain Batter, or both — then the quantity in litres. Sunday is a holiday.</p>
            {WEEK_PLAN.map(d => {
              const c = choices[d.dow];
              const opts: { key: Choice; label: string }[] = [
                { key: "special", label: d.special.replace(" Batter", "") },
                { key: "plain", label: "Plain Batter" },
                { key: "both", label: `${d.special.replace(" Batter", "")} + Plain` },
                { key: "none", label: "Skip this day" },
              ];
              return (
                <div key={d.dow} className="border border-border rounded-xl p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-bold text-brand-brown">{d.label}</p>
                    <p className="text-sm font-semibold">{money(dayTotal(d.dow))} <span className="text-xs font-normal text-muted-foreground">/ day</span></p>
                  </div>
                  <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {opts.map(o => (
                      <button key={o.key} onClick={() => setChoices(p => ({ ...p, [d.dow]: { ...p[d.dow], choice: o.key } }))}
                        className={`px-3 py-2 rounded-lg text-xs sm:text-sm font-semibold border-2 transition ${c.choice === o.key ? "border-brand-green bg-brand-green/10 text-brand-green" : "border-border hover:border-brand-green/40"}`}>
                        {o.label}
                      </button>
                    ))}
                  </div>
                  {c.choice !== "none" && (
                    <div className="mt-3 flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-muted-foreground">Quantity per batter:</span>
                      {[1, 2, 3, 4, 5].map(l => (
                        <button key={l} onClick={() => setChoices(p => ({ ...p, [d.dow]: { ...p[d.dow], litres: l } }))}
                          className={`h-9 px-3 rounded-full text-sm font-semibold ${c.litres === l ? "bg-brand-green text-white" : "bg-cream border border-border"}`}>
                          {l} L
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {step === 2 && (
          <div className="grid gap-4 max-w-2xl">
            {existingAddressId ? (() => {
              const saved = (myAddresses ?? []).find((a: any) => a.id === existingAddressId);
              return (
                <div className="rounded-xl border border-brand-green/40 bg-brand-green/5 p-4">
                  <p className="text-xs font-bold text-brand-green uppercase">Using saved location</p>
                  <p className="mt-1 font-semibold text-sm">{saved?.label} — {saved?.line1}{saved?.pincode ? `, ${saved.pincode}` : ""}</p>
                  {saved?.lat && <p className="text-[11px] font-mono text-muted-foreground mt-1">📍 {Number(saved.lat).toFixed(5)}, {Number(saved.lng).toFixed(5)}</p>}
                  <button type="button" onClick={() => { setExistingAddressId(null); setShowAddrPrompt(false); }} className="mt-3 text-sm font-semibold text-brand-red hover:underline">
                    Pin a new location
                  </button>
                </div>
              );
            })() : (
              <>
                {(myAddresses?.length ?? 0) > 0 && (
                  <button type="button" onClick={() => setShowAddrPrompt(true)} className="self-start text-sm font-semibold text-brand-green hover:underline">
                    ← Choose one of my saved locations ({myAddresses!.length})
                  </button>
                )}

                <LocationPicker
                  value={{ lat: addr.lat ? Number(addr.lat) : null, lng: addr.lng ? Number(addr.lng) : null }}
                  onChange={onPin}
                />

                <div className="grid sm:grid-cols-2 gap-3">
                  <input value={addr.label} onChange={e => setAddr(a => ({ ...a, label: e.target.value }))} placeholder="Label (Home / Office)" className="h-11 px-4 rounded-lg border border-border" />
                  <input value={addr.landmark} onChange={e => setAddr(a => ({ ...a, landmark: e.target.value }))} placeholder="Nearby landmark" className="h-11 px-4 rounded-lg border border-border" />
                </div>

                <div>
                  <p className="text-sm font-semibold mb-1">Building identification photo</p>
                  <p className="text-xs text-muted-foreground mb-2">Helps our delivery team spot your door faster.</p>
                  <label className="flex items-center gap-3 p-4 rounded-lg border-2 border-dashed border-border cursor-pointer hover:bg-cream">
                    <Upload className="h-5 w-5 text-brand-green" />
                    <span className="text-sm">{buildingFile ? buildingFile.name : "Upload photo (JPG/PNG)"}</span>
                    <input type="file" accept="image/*" className="hidden" onChange={e => setBuildingFile(e.target.files?.[0] ?? null)} />
                  </label>
                </div>
              </>
            )}

            <div>
              <label className="text-sm font-semibold">Contact phone number *</label>
              <input value={addr.phone} onChange={e => setAddr(a => ({ ...a, phone: e.target.value }))} inputMode="tel" placeholder="10-digit mobile number" className="mt-1 w-full h-12 px-4 rounded-lg border border-border" />
              <p className="text-xs text-muted-foreground mt-1">Our delivery executive will call this number if they can't find your door.</p>
            </div>
          </div>
        )}

        {showAddrPrompt && (myAddresses?.length ?? 0) > 0 && (
          <div className="fixed inset-0 z-50 bg-black/50 grid place-items-center p-4" onClick={() => setShowAddrPrompt(false)}>
            <div className="bg-background rounded-2xl border border-border p-6 max-w-md w-full" onClick={e => e.stopPropagation()}>
              <h3 className="text-lg font-bold">Delivery location</h3>
              <p className="text-sm text-muted-foreground mt-1">Reuse one of your recent locations, or pin a new one for this subscription.</p>
              <div className="mt-4 space-y-2 max-h-64 overflow-y-auto">
                {(myAddresses ?? []).map((a: any) => (
                  <button key={a.id} onClick={() => { setExistingAddressId(a.id); setShowAddrPrompt(false); }} className="w-full text-left p-3 rounded-lg border border-border hover:border-brand-green hover:bg-brand-green/5 transition">
                    <p className="text-xs font-bold text-brand-green uppercase">{a.label}</p>
                    <p className="text-sm mt-0.5">{a.line1}, {a.city} - {a.pincode}</p>
                  </button>
                ))}
              </div>
              <div className="mt-5 flex gap-2 justify-end">
                <button onClick={() => { setExistingAddressId(null); setShowAddrPrompt(false); }} className="px-4 py-2 rounded-full border border-border text-sm font-semibold">Pin a new location</button>
              </div>
            </div>
          </div>
        )}

        {step === 3 && (
          <div className="space-y-4">
            <div className="grid sm:grid-cols-3 gap-4">
              <div className="bg-cream rounded-xl p-4"><p className="text-xs text-muted-foreground">Plan</p><p className="text-lg font-bold capitalize">{plan}</p></div>
              <div className="bg-cream rounded-xl p-4"><p className="text-xs text-muted-foreground">Delivery time</p><p className="text-lg font-bold">4 – 7 PM</p></div>
              <div className="bg-cream rounded-xl p-4"><p className="text-xs text-muted-foreground">Total</p><p className="text-lg font-bold text-brand-red">{money(total)}</p></div>
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-2">
              {WEEK_PLAN.map(d => {
                const items = dayItems(d.dow);
                return items.length ? (
                  <div key={d.dow} className="bg-cream rounded-xl p-3 text-sm">
                    <p className="font-bold text-brand-brown">{d.label}</p>
                    {items.map((i, k) => <p key={k} className="text-xs">{i.qty} L × {i.product.name}</p>)}
                  </div>
                ) : null;
              })}
            </div>
            <div className="rounded-xl border-2 border-dashed border-border p-5">
              <p className="text-sm font-semibold flex items-center gap-2"><CreditCard className="h-4 w-4 text-brand-green" />Payment</p>
              <p className="text-xs text-muted-foreground mt-1">Razorpay integration coming soon — this is a mock payment for now.</p>
              {paid ? (
                <p className="mt-3 text-sm font-bold text-brand-green flex items-center gap-2"><Check className="h-4 w-4" />Payment successful (mock)</p>
              ) : (
                <button onClick={mockPay} disabled={paying} className="mt-3 px-5 py-2.5 rounded-full bg-brand-brown text-white text-sm font-semibold inline-flex items-center gap-2 disabled:opacity-50">
                  {paying && <Loader2 className="h-4 w-4 animate-spin" />}Pay {money(total)} (mock)
                </button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Your first delivery arrives tomorrow between 4 PM and 7 PM.</p>
            {err && <p className="text-sm text-brand-red">{err}</p>}
          </div>
        )}

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-border pt-4">
          <button disabled={step === 0} onClick={() => setStep(step - 1)} className="px-5 py-2.5 rounded-full border border-border disabled:opacity-40">Back</button>
          <p className="text-sm text-muted-foreground">Total: <span className="font-bold text-brand-brown">{money(total)}</span></p>
          {step < 3 ? (
            <button disabled={!canNext} onClick={() => setStep(step + 1)} className="px-6 py-2.5 rounded-full bg-brand-red text-white font-semibold disabled:opacity-40">Next</button>
          ) : (
            <button disabled={busy || !paid} onClick={submit} className="px-6 py-2.5 rounded-full bg-brand-green text-white font-semibold disabled:opacity-40 flex items-center gap-2">
              {busy && <Loader2 className="h-4 w-4 animate-spin" />}Confirm subscription
            </button>
          )}
        </div>
      </div>
    </PortalShell>
  );
}
