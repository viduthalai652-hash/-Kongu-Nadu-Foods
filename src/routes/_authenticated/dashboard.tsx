import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { PortalShell, money } from "@/lib/portal-shell";
import { useSession, useRoles } from "@/lib/auth";
import { useCart } from "@/lib/cart";
import { CalendarDays, MapPin, Package, PlusCircle, Wallet, Truck, IndianRupee, CalendarClock, Lock, ShoppingCart, Plus, Minus, Trash2 } from "lucide-react";
import BG from "@/assets/grocery.jpg";
import DeliveryImg from "@/assets/delivery.jpg";
import FarmImg from "@/assets/farm.jpg";
import GroceryImg from "@/assets/manufacturing.jpg";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — Kongu Nadu" }, { name: "description", content: "Wallet, today's deliveries and upcoming batter subscription orders." }] }),
  component: Dashboard,
});

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function Dashboard() {
  const { user } = useSession();
  const { has, loading: rolesLoading } = useRoles(user);
  const nav = useNavigate();
  useEffect(() => {
    if (rolesLoading) return;
    if (has("admin")) nav({ to: "/admin", replace: true });
    else if (has("delivery")) nav({ to: "/delivery", replace: true });
  }, [rolesLoading, has, nav]);
  return <DashboardInner userId={user?.id} />;
}

function DashboardInner({ userId }: { userId?: string }) {
  const qc = useQueryClient();
  const today = new Date().toISOString().slice(0, 10);
  const isSaturday = new Date().getDay() === 6;

  const { data: profile } = useQuery({
    queryKey: ["profile-wallet", userId],
    enabled: !!userId,
    queryFn: async () => (await supabase.from("profiles").select("wallet_paise, full_name, phone").eq("id", userId!).maybeSingle()).data,
  });

  const { data: subs, isLoading } = useQuery({
    queryKey: ["my-subs"],
    refetchInterval: 60000,
    queryFn: async () => {
      const { data, error } = await supabase.from("subscriptions").select("*, addresses(*), subscription_items(*, products(name,unit,price_paise))").order("created_at", { ascending: false });
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: assignments } = useQuery({
    queryKey: ["my-assignments"],
    refetchInterval: 60000,
    queryFn: async () => {
      const { data } = await supabase.from("delivery_assignments").select("*, subscriptions(plan, time_slot)").gte("delivery_date", today).order("delivery_date").limit(60);
      return data ?? [];
    },
  });

  const activeSubs = (subs ?? []).filter((s: any) => s.status !== "cancelled" && s.status !== "completed" && (!s.end_date || s.end_date >= today));
  const totalSpent = (subs ?? []).reduce((s: number, x: any) => s + (x.total_paise ?? 0), 0);

  const todays = (assignments ?? []).filter((a: any) => a.delivery_date === today);
  const upcoming = (assignments ?? []).filter((a: any) => a.delivery_date > today);
  // Next week = the Mon–Sat window starting after the coming Sunday.
  const nextMonday = (() => { const d = new Date(); const diff = (8 - d.getDay()) % 7 || 7; d.setDate(d.getDate() + diff); return d; })();
  const nextSunday = new Date(nextMonday); nextSunday.setDate(nextSunday.getDate() + 6);
  const nextWeek = (assignments ?? []).filter((a: any) => {
    const d = new Date(a.delivery_date);
    return d >= nextMonday && d <= nextSunday;
  });

  async function updateStatus(id: string, status: "paused" | "active" | "cancelled") {
    const { error } = await supabase.from("subscriptions").update({ status }).eq("id", id);
    if (error) { toast.error("Could not update the subscription", { description: error.message }); return; }
    if (status === "cancelled") {
      // Pull the remaining jobs off the delivery executive's panel.
      await supabase
        .from("delivery_assignments")
        .update({ status: "skipped" })
        .eq("subscription_id", id)
        .gte("delivery_date", today)
        .in("status", ["pending", "out_for_delivery"]);
      toast.success("Subscription cancelled", { description: "Upcoming deliveries have been removed from the delivery executive's panel." });
    } else {
      toast.success(status === "paused" ? "Subscription paused" : "Subscription resumed");
    }
    qc.invalidateQueries();
  }

  const cartContext = useCart();
  const navigate = useNavigate();

  return (
    <PortalShell bgImage={BG} title={`Welcome${profile?.full_name ? `, ${profile.full_name}` : ""}`}>
      <div className="grid sm:grid-cols-3 gap-3">
        <Stat icon={Truck} label="Today's orders" value={todays.length} image={DeliveryImg} />
        <Stat icon={CalendarClock} label="Upcoming deliveries" value={upcoming.length} image={FarmImg} />
        <Stat icon={IndianRupee} label="Total spent till date" value={money(totalSpent)} image={GroceryImg} />
      </div>

      {cartContext && cartContext.items.length > 0 && (
        <div className="mt-8">
          <Panel title="Your Cart" icon={ShoppingCart}>
            <div className="p-4 space-y-4">
              {cartContext.items.map((item) => (
                <div key={item.id} className="flex items-center gap-4 border border-border p-3 rounded-xl bg-white shadow-sm">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-16 h-16 rounded-lg object-cover" />
                  ) : (
                    <div className="w-16 h-16 rounded-lg bg-cream-dark flex items-center justify-center text-muted-foreground"><Package className="h-6 w-6" /></div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-brand-green-dark truncate">{item.name}</p>
                    <p className="text-sm font-semibold text-brand-red">{money(item.price_paise)}</p>
                  </div>
                  <div className="flex items-center gap-2 border border-border rounded-lg bg-cream">
                    <button onClick={() => cartContext.updateQuantity(item.id, -1)} className="p-1.5 hover:text-brand-red transition"><Minus className="h-4 w-4" /></button>
                    <span className="w-4 text-center text-sm font-bold">{item.quantity}</span>
                    <button onClick={() => cartContext.updateQuantity(item.id, 1)} className="p-1.5 hover:text-brand-green transition"><Plus className="h-4 w-4" /></button>
                  </div>
                  <button onClick={() => cartContext.removeFromCart(item.id)} className="p-2 text-muted-foreground hover:text-brand-red transition">
                    <Trash2 className="h-5 w-5" />
                  </button>
                </div>
              ))}
              <div className="flex items-center justify-between pt-4 border-t border-border">
                <div>
                  <p className="text-sm text-muted-foreground">Subtotal</p>
                  <p className="text-2xl font-extrabold text-brand-brown">{money(cartContext.totalPaise)}</p>
                </div>
                <button onClick={() => navigate({ to: "/checkout" } as any)} className="btn-ripple px-6 py-3 rounded-full bg-brand-red text-white font-bold hover:brightness-110 shadow-md">
                  Proceed to Checkout
                </button>
              </div>
            </div>
          </Panel>
        </div>
      )}

      <div className="mt-8 grid lg:grid-cols-2 gap-4">
        <Panel title="Today's deliveries" icon={Truck}>
          {todays.length === 0 ? <Empty text="No delivery scheduled for today." /> : todays.map((a: any) => (
            <Row key={a.id} left={a.subscriptions?.time_slot ?? "4-7 PM"} right={
              <div className="text-right leading-tight">
                <span className="capitalize">{a.status.replace("_", " ")}</span>
                {a.otp_code && <div className="text-xs font-mono font-bold mt-1 text-brand-red">OTP: {a.otp_code}</div>}
              </div>
            } />
          ))}
        </Panel>
        <Panel title="Next week's deliveries" icon={CalendarDays}>
          {nextWeek.length === 0 ? <Empty text="Nothing scheduled for next week yet." /> : nextWeek.map((a: any) => (
            <Row key={a.id} left={`${DAYS[new Date(a.delivery_date).getDay()]} · ${a.delivery_date}`} right={a.status.replace("_", " ")} />
          ))}
        </Panel>
      </div>

      <div className={`mt-8 rounded-2xl border p-4 flex items-start gap-3 ${isSaturday ? "border-brand-green/40 bg-brand-green/5" : "border-border bg-cream"}`}>
        <Lock className={`h-5 w-5 mt-0.5 ${isSaturday ? "text-brand-green" : "text-brand-brown"}`} />
        <div>
          <p className="text-sm font-semibold">{isSaturday ? "Editing is open today" : "Subscription editing is locked"}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            You can change your weekly products only on <strong>Saturday</strong>, for the following week. If you don't edit on Saturday, the previous week's products repeat automatically.
          </p>
        </div>
      </div>

      <h2 className="mt-10 mb-3 text-lg font-semibold text-brand-brown">Your subscriptions</h2>
      {isLoading ? <p className="text-muted-foreground">Loading...</p> : activeSubs.length === 0 ? (
        <div className="bg-background rounded-2xl border border-border p-10 text-center">
          <Package className="h-12 w-12 mx-auto text-brand-green mb-3" />
          <h2 className="text-xl font-semibold mb-2">No subscription yet</h2>
          <p className="text-muted-foreground mb-5">Start with a weekly or monthly plan. Your first delivery arrives tomorrow, 4 PM – 7 PM.</p>
          <Link to="/subscribe" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-brand-red text-white font-semibold"><PlusCircle className="h-4 w-4" />Start subscription</Link>
        </div>
      ) : (
        <div className="grid gap-4">
          {activeSubs.map((s: any) => (
            <div key={s.id} className="bg-background rounded-2xl border border-border p-5 sm:p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="px-2 py-0.5 rounded-full text-xs font-bold uppercase bg-brand-green/10 text-brand-green">{s.plan}</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${s.status === "active" ? "bg-brand-green/10 text-brand-green" : s.status === "paused" ? "bg-brand-yellow/20 text-brand-brown" : "bg-brand-red/10 text-brand-red"}`}>{s.status}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">Runs {s.start_date} → {s.end_date} · {s.time_slot}</p>
                  <p className="mt-2 text-sm flex items-start gap-1.5"><MapPin className="h-4 w-4 mt-0.5 text-brand-red" /><span>{s.addresses?.line1}, {s.addresses?.city} - {s.addresses?.pincode}</span></p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-brand-brown">{money(s.total_paise)}</p>
                  <p className="text-xs text-muted-foreground">Total</p>
                </div>
              </div>
              <div className="mt-4 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 text-xs">
                {DAYS.map((d, i) => {
                  const items = s.subscription_items?.filter((it: any) => it.day_of_week === i) ?? [];
                  return items.length ? (
                    <div key={i} className="bg-cream rounded-lg p-2">
                      <p className="font-bold text-brand-brown mb-1">{d}</p>
                      {items.map((it: any) => <p key={it.id} className="truncate">{it.quantity} L × {it.products?.name}</p>)}
                    </div>
                  ) : null;
                })}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {isSaturday ? (
                  <Link to="/subscribe" className="px-4 py-2 rounded-full text-sm font-semibold bg-brand-brown text-white">Edit next week's products</Link>
                ) : (
                  <span className="px-4 py-2 rounded-full text-sm font-semibold bg-cream-dark text-muted-foreground">Editable on Saturday only</span>
                )}

                {s.status === "active" && <button onClick={() => updateStatus(s.id, "paused")} className="px-4 py-2 rounded-full text-sm border border-border hover:bg-cream-dark">Pause</button>}
                {s.status === "paused" && <button onClick={() => updateStatus(s.id, "active")} className="px-4 py-2 rounded-full text-sm bg-brand-green text-white">Resume</button>}
                {s.status !== "cancelled" && <button onClick={() => confirm("Cancel this subscription?") && updateStatus(s.id, "cancelled")} className="px-4 py-2 rounded-full text-sm text-brand-red hover:bg-brand-red/10">Cancel</button>}
              </div>
            </div>
          ))}
          <Link to="/subscribe" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-brand-red text-white font-semibold w-fit"><PlusCircle className="h-4 w-4" />Add another subscription</Link>
        </div>
      )}
    </PortalShell>
  );
}

function Stat({ icon: Icon, label, value, image }: any) {
  return (
    <div className="relative overflow-hidden rounded-2xl border p-5 shadow-sm transition-shadow hover:shadow-md bg-white border-border">
      <div className="relative z-10 w-2/3">
        <div className="flex items-center gap-2 text-muted-foreground text-xs font-bold tracking-wider uppercase"><Icon className="h-4 w-4 text-brand-green" />{label}</div>
        <p className="mt-3 text-3xl font-extrabold text-brand-brown tracking-tight">{value}</p>
      </div>
      {image && (
        <div 
          className="absolute right-0 top-0 bottom-0 w-1/2 bg-cover bg-center"
          style={{ 
            backgroundImage: `url(${image})`,
            clipPath: 'polygon(25% 0, 100% 0, 100% 100%, 0 100%)'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-r from-white via-white/20 to-transparent"></div>
        </div>
      )}
    </div>
  );
}
function Panel({ title, icon: Icon, children }: any) {
  return (
    <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
      <div className="px-5 py-4 bg-cream-dark/30 border-b border-border flex items-center gap-2"><Icon className="h-5 w-5 text-brand-green" /><h3 className="font-bold text-brand-brown">{title}</h3></div>
      <div className="divide-y divide-border">{children}</div>
    </div>
  );
}
function Row({ left, right }: { left: React.ReactNode; right: React.ReactNode }) {
  return <div className="px-4 py-3 flex items-center justify-between text-sm"><span>{left}</span><span className="text-muted-foreground">{right}</span></div>;
}
function Empty({ text }: { text: string }) {
  return <p className="px-4 py-6 text-sm text-muted-foreground text-center">{text}</p>;
}
