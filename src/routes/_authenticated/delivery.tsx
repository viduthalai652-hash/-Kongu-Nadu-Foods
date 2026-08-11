import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PortalShell } from "@/lib/portal-shell";
import { useSession, useRoles } from "@/lib/auth";
import { MapPin, Phone, Navigation, Check, X, ImageIcon, PackageCheck, Clock, Wallet } from "lucide-react";
import BG from "@/assets/delivery.jpg";

// Central pickup/warehouse — 10°56'09.6"N 77°00'23.5"E
const PICKUP = { lat: 10.936, lng: 77.006528, label: "Kongu Nadu Central Kitchen" };
import { useEffect, useState } from "react";
import { toast } from "sonner";

// Delivery operations follow India time regardless of the device timezone.
function deliveryClock(timestamp: number) {
  const ist = new Date(timestamp + 330 * 60 * 1000);
  return {
    day: ist.toISOString().slice(0, 10),
    hour: ist.getUTCHours(),
  };
}

// Ticking clock so the panel rolls over to the new day and unlocks at 4 PM without a reload.
function useNow() {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 30000);
    return () => clearInterval(t);
  }, []);
  return now;
}

export const Route = createFileRoute("/_authenticated/delivery")({
  head: () => ({ meta: [{ title: "Delivery — Kongu Nadu" }, { name: "description", content: "Today's deliveries for delivery executives." }] }),
  component: Delivery,
});

function Delivery() {
  const { user } = useSession();
  const { has, loading } = useRoles(user);
  if (loading) return <PortalShell title="Deliveries" bgImage={BG}><p>Loading...</p></PortalShell>;
  if (!has("delivery")) return <PortalShell title="Deliveries" bgImage={BG}>
    <div className="bg-background border border-border rounded-2xl p-8 text-center">
      <p className="text-lg font-semibold mb-2">Delivery access required</p>
      <p className="text-sm text-muted-foreground">Ask an admin to add the <code>delivery</code> role to your account.</p>
    </div>
  </PortalShell>;
  if (!user) return null;
  return <DeliveryInner userId={user.id} />;
}

function DeliveryInner({ userId }: { userId: string }) {
  const qc = useQueryClient();
  const now = useNow();
  const { day: today, hour } = deliveryClock(now);
  const afterSlotStart = hour >= 16;
  const { data: jobs } = useQuery({
    queryKey: ["deliv-jobs", userId, today],
    refetchInterval: 15000,
    queryFn: async () => {
      const { data: rows, error } = await supabase.from("delivery_assignments")
        .select("*, subscriptions(*, addresses(*), subscription_items(quantity, day_of_week, products(name)))")
        .eq("executive_id", userId)
        .order("delivery_date").order("sequence");
      if (error) { console.error("deliv-jobs", error); return []; }
      // Hide jobs whose parent subscription has ended or been cancelled.
      const active = (rows ?? []).filter((r: any) => {
        const s = r.subscriptions;
        if (!s) return false;
        if (s.status === "cancelled" || s.status === "completed") return false;
        if (s.end_date && s.end_date < today) return false;
        return true;
      });
      const uids = Array.from(new Set(active.map((r: any) => r.subscriptions?.user_id).filter(Boolean)));
      let profMap = new Map<string, any>();
      if (uids.length) {
        const { data: profs } = await supabase.from("profiles").select("id,full_name,email,phone").in("id", uids);
        profMap = new Map((profs ?? []).map((p: any) => [p.id, p]));
      }
      return active
        .filter((r: any) => r.delivery_date >= today || (r.status !== "delivered" && r.status !== "failed" && r.status !== "skipped"))
        .map((r: any) => ({ ...r, subscriptions: r.subscriptions ? { ...r.subscriptions, profiles: profMap.get(r.subscriptions.user_id) ?? null } : null }));
    },
  });

  const { data: wallet } = useQuery({
    queryKey: ["deliv-wallet", userId],
    queryFn: async () => (await supabase.from("profiles").select("wallet_paise").eq("id", userId).maybeSingle()).data?.wallet_paise ?? 0,
  });

  async function update(id: string, status: "delivered"|"failed"|"out_for_delivery") {
    const prev = (jobs ?? []).find((j: any) => j.id === id);
    if (status === "delivered" && prev?.otp_code) {
      const code = window.prompt("Enter the 4-digit OTP provided by the customer:");
      if (code !== prev.otp_code) {
        toast.error("Incorrect OTP", { description: "The OTP entered does not match the customer's OTP." });
        return;
      }
    }
    await supabase.from("delivery_assignments").update({ status }).eq("id", id);
    // Credit ₹50 to the executive's wallet the first time a job is marked delivered.
    if (status === "delivered" && prev?.status !== "delivered") {
      const { data: p } = await supabase.from("profiles").select("wallet_paise").eq("id", userId).maybeSingle();
      const next = (p?.wallet_paise ?? 0) + 5000;
      const { error } = await supabase.from("profiles").update({ wallet_paise: next }).eq("id", userId);
      if (!error) toast.success("Delivery completed — ₹50 credited to your wallet");
      qc.invalidateQueries({ queryKey: ["deliv-wallet", userId] });
    }
    qc.invalidateQueries({ queryKey: ["deliv-jobs", userId] });
  }

  const allJobs = (jobs ?? []) as any[];
  const todayJobs = allJobs.filter((j:any) => j.delivery_date === today);
  const upcoming = allJobs.filter((j:any) => j.delivery_date > today);
  const pending = allJobs.filter((j:any) => j.status !== "delivered" && j.status !== "failed");
  const done = todayJobs.filter((j:any) => j.status === "delivered" || j.status === "failed");
  const ongoing = allJobs.filter((j:any) => j.delivery_date <= today && j.status !== "delivered" && j.status !== "failed");
  const completed = allJobs.filter((j:any) => j.status === "delivered");
  const progressPct = allJobs.length ? Math.round((completed.length / allJobs.length) * 100) : 0;

  return (
    <PortalShell bgImage={BG} title={`Deliveries — ${today}`}>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <DStat icon={PackageCheck} label="Assigned orders" value={allJobs.length} />
        <DStat icon={Check} label="Completed" value={completed.length} />
        <DStat icon={Clock} label="Pending" value={pending.length} />
        <DStat icon={Wallet} label="Wallet credited" value={`₹${((wallet ?? 0) / 100).toFixed(0)}`} accent />
      </div>

      <div className="mt-4 bg-background border border-border rounded-2xl p-4">
        <div className="flex items-center justify-between text-sm font-semibold">
          <span>Delivery status</span>
          <span className="text-brand-green">{completed.length} / {allJobs.length}</span>
        </div>
        <div className="mt-2 h-3 rounded-full bg-cream-dark overflow-hidden">
          <div className="h-full bg-brand-green transition-all" style={{ width: `${progressPct}%` }} />
        </div>
        <p className="mt-1 text-xs text-muted-foreground">{allJobs.length === 0 ? "No deliveries assigned." : completed.length === allJobs.length ? "All deliveries completed 🎉" : `${allJobs.length - completed.length} more to go.`}</p>
      </div>

      {allJobs.length === 0 && <div className="mt-6 bg-background rounded-2xl border border-border p-10 text-center text-muted-foreground">No deliveries assigned yet. New assignments appear here automatically.</div>}

      {(ongoing.length > 0 || done.length > 0) && (
        <section className="mt-8 space-y-3">
          <h2 className="text-sm font-bold text-muted-foreground uppercase">Ongoing deliveries ({ongoing.length})</h2>
          {ongoing.map((j:any) => <Job key={j.id} j={j} onUpdate={update} canComplete={j.delivery_date <= today && afterSlotStart} />)}
        </section>
      )}


      {done.length > 0 && (
        <section className="mt-8 space-y-3">
          <h2 className="text-sm font-bold text-muted-foreground uppercase">Today · Completed ({done.length})</h2>
          {done.map((j:any) => <Job key={j.id} j={j} onUpdate={update} isToday canComplete={afterSlotStart} />)}
        </section>
      )}

      {upcoming.length > 0 && (
        <section className="mt-8 space-y-3">
          <h2 className="text-sm font-bold text-muted-foreground uppercase">Upcoming ({upcoming.length})</h2>
          {upcoming.map((j:any) => (
            <div key={j.id}>
              <p className="text-xs font-semibold text-brand-brown mb-1">{j.delivery_date}</p>
              <Job j={j} onUpdate={update} />
            </div>
          ))}
        </section>
      )}
    </PortalShell>
  );
}

function DStat({ icon: Icon, label, value, accent }: any) {
  return (
    <div className={`rounded-2xl border p-4 ${accent ? "bg-brand-green/10 border-brand-green/30" : "bg-background border-border"}`}>
      <div className="flex items-center gap-2 text-muted-foreground text-[11px] font-semibold uppercase"><Icon className="h-4 w-4 text-brand-green" />{label}</div>
      <p className="mt-1.5 text-2xl font-extrabold text-brand-brown">{value}</p>
    </div>
  );
}


function Job({ j, onUpdate, canComplete = false }: any) {
  const canAct = canComplete;
  const s = j.subscriptions;
  const a = s?.addresses;
  const dow = new Date(j.delivery_date).getDay();
  const items = (s?.subscription_items ?? []).filter((it:any) => it.day_of_week === dow);
  const dest = a?.lat && a?.lng
    ? `${a.lat},${a.lng}`
    : encodeURIComponent([a?.line1,a?.line2,a?.city,a?.pincode].filter(Boolean).join(", "));
  // Real-time turn-by-turn navigation from the central kitchen to the customer.
  const navUrl = `https://www.google.com/maps/dir/?api=1&origin=${PICKUP.lat},${PICKUP.lng}&destination=${dest}&travelmode=driving&dir_action=navigate`;
  const [buildingUrl, setBuildingUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!a?.building_image_url) return;
    supabase.storage.from("building-images").createSignedUrl(a.building_image_url, 3600).then(({ data }) => setBuildingUrl(data?.signedUrl ?? null));
  }, [a?.building_image_url]);

  const isDone = j.status === "delivered" || j.status === "failed";

  return (
    <div className={`bg-background border-2 rounded-2xl p-4 ${isDone ? "border-brand-green/40 opacity-70" : "border-border"}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-bold text-lg">{s?.profiles?.full_name}</p>
          <p className="text-sm flex items-start gap-1.5 text-muted-foreground"><MapPin className="h-4 w-4 mt-0.5 shrink-0" />{a?.line1}, {a?.line2}, {a?.city} - {a?.pincode}{a?.landmark ? ` (near ${a.landmark})` : ""}</p>
          <p className="text-xs mt-1"><span className="font-semibold">Slot:</span> {s?.time_slot}</p>
        </div>
        <span className="px-2 py-1 rounded-full text-xs font-semibold bg-cream-dark uppercase whitespace-nowrap">{j.status.replace("_"," ")}</span>
      </div>

      {items.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {items.map((it:any, i:number) => <span key={i} className="px-2 py-1 rounded-full text-xs bg-brand-green/10 text-brand-green font-semibold">{it.quantity}× {it.products?.name}</span>)}
        </div>
      )}

      {buildingUrl && (
        <a href={buildingUrl} target="_blank" rel="noreferrer" className="mt-3 flex items-center gap-2 text-sm text-brand-green font-semibold">
          <ImageIcon className="h-4 w-4" />View building photo
        </a>
      )}

      <div className="mt-4 grid grid-cols-2 gap-2">
        {!isDone && j.status !== "out_for_delivery" && (
          <a
            href={navUrl}
            target="_blank"
            rel="noreferrer"
            onClick={() => onUpdate(j.id, "out_for_delivery")}
            className="col-span-2 inline-flex items-center justify-center gap-2 h-11 rounded-full bg-brand-brown text-white font-semibold text-sm px-3"
          >
            <PackageCheck className="h-4 w-4" />Picked up · Navigate from kitchen
          </a>
        )}
        <a href={navUrl} target="_blank" rel="noreferrer" className="col-span-2 inline-flex items-center justify-center gap-2 h-11 rounded-full bg-brand-green text-white font-semibold text-sm px-3">
          <Navigation className="h-4 w-4" />Live navigate to customer
        </a>
        {s?.profiles?.phone && (
          <a href={`tel:${s.profiles.phone}`} className={`inline-flex items-center justify-center gap-2 h-11 rounded-full border border-border font-semibold text-sm px-3 ${isDone ? "col-span-2" : ""}`}>
            <Phone className="h-4 w-4" />Call
          </a>
        )}
        {!isDone && (
          <>
            <button disabled={!canAct} title={canAct ? "" : "Enabled from 4:00 PM IST"} onClick={() => onUpdate(j.id, "delivered")} className={`inline-flex items-center justify-center gap-2 h-11 rounded-full bg-brand-red text-white font-semibold text-sm px-3 disabled:opacity-40 disabled:cursor-not-allowed ${!s?.profiles?.phone ? "col-span-2" : ""}`}>
              <Check className="h-4 w-4" />Delivered
            </button>
            <button disabled={!canAct} title={canAct ? "" : "Enabled from 4:00 PM IST"} onClick={() => onUpdate(j.id, "failed")} className="col-span-2 inline-flex items-center justify-center gap-2 h-10 rounded-full text-brand-red border border-brand-red/40 font-semibold text-sm px-3 disabled:opacity-40 disabled:cursor-not-allowed">
              <X className="h-4 w-4" />Mark failed
            </button>
          </>
        )}

      </div>
    </div>
  );
}
