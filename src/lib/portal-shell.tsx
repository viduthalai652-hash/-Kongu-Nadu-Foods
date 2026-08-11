import { Link, useRouter } from "@tanstack/react-router";
import { LogOut, LayoutDashboard, PackagePlus, ShieldCheck, Truck, User as UserIcon, Bell } from "lucide-react";
import { useSession, useRoles, signOut } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import logo from "../assets/logo.png";
import { useEffect, useRef, useState, type ReactNode } from "react";

type Notif = { id: string; title: string; detail: string; when: string };

function useAdminNotifs(enabled: boolean) {
  return useQuery({
    queryKey: ["admin-notifs"],
    enabled,
    refetchInterval: 15000,
    queryFn: async (): Promise<Notif[]> => {
      const { data: subs } = await supabase
        .from("subscriptions")
        .select("id, created_at, status, plan, time_slot, addresses(line1, city, pincode)")
        .eq("status", "active")
        .order("created_at", { ascending: false });
      const rows = (subs ?? []) as any[];
      if (rows.length === 0) return [];
      const { data: assigns } = await supabase
        .from("delivery_assignments")
        .select("subscription_id")
        .in("subscription_id", rows.map(r => r.id));
      const assigned = new Set((assigns ?? []).map((a: any) => a.subscription_id));
      return rows
        .filter(r => !assigned.has(r.id))
        .map(r => ({
          id: r.id,
          title: `New ${r.plan} subscription — needs assignment`,
          detail: `${r.addresses?.line1 ?? "Address pending"}, ${r.addresses?.city ?? ""} ${r.addresses?.pincode ?? ""}`.trim(),
          when: new Date(r.created_at).toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }),
        }));
    },
  });
}

function useDeliveryNotifs(userId: string | undefined) {
  const today = new Date().toISOString().slice(0, 10);
  return useQuery({
    queryKey: ["deliv-notifs", userId],
    enabled: !!userId,
    refetchInterval: 15000,
    queryFn: async (): Promise<Notif[]> => {
      const { data } = await supabase
        .from("delivery_assignments")
        .select("id, delivery_date, status, subscriptions(time_slot, addresses(line1, city, pincode))")
        .eq("executive_id", userId!)
        .gte("delivery_date", today)
        .in("status", ["pending", "out_for_delivery"])
        .order("delivery_date");
      return ((data ?? []) as any[]).map(a => ({
        id: a.id,
        title: a.delivery_date === today ? "Delivery scheduled today" : "Upcoming delivery assigned",
        detail: `${a.subscriptions?.addresses?.line1 ?? "—"}, ${a.subscriptions?.addresses?.pincode ?? ""}`,
        when: `${a.delivery_date} · ${a.subscriptions?.time_slot ?? "4-7 PM"}`,
      }));
    },
  });
}

function useClientNotifs(userId: string | undefined) {
  const today = new Date().toISOString().slice(0, 10);
  return useQuery({
    queryKey: ["client-notifs", userId],
    enabled: !!userId,
    refetchInterval: 15000,
    queryFn: async (): Promise<Notif[]> => {
      const { data } = await supabase
        .from("delivery_assignments")
        .select("id, delivery_date, status, subscriptions(user_id, time_slot, status)")
        .gte("delivery_date", today)
        .order("delivery_date")
        .limit(20);
      return ((data ?? []) as any[])
        .filter(a => a.subscriptions?.user_id === userId && a.subscriptions?.status !== "cancelled")
        .map(a => ({
          id: a.id,
          title: a.delivery_date === today ? "Your delivery is scheduled today" : "Upcoming delivery",
          detail: `Status: ${String(a.status).replace("_", " ")}`,
          when: `${a.delivery_date} · ${a.subscriptions?.time_slot ?? "4-7 PM"}`,
        }));
    },
  });
}

function NotificationBell({ items, to }: { items: Notif[]; to: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function onDoc(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-label="Notifications"
        aria-expanded={open}
        className="relative p-2 rounded-lg hover:bg-cream-dark"
      >
        <Bell className="h-5 w-5 text-brand-brown" />
        <span className="absolute -top-0.5 -right-0.5"><Badge count={items.length} /></span>
      </button>
      {open && (
        <div className="absolute right-0 mt-2 w-80 max-w-[90vw] rounded-2xl border border-border bg-background shadow-lg z-50 overflow-hidden">
          <div className="px-4 py-3 border-b border-border flex items-center justify-between">
            <span className="text-sm font-semibold text-brand-brown">Notifications</span>
            <span className="text-xs text-muted-foreground">{items.length}</span>
          </div>
          <div className="max-h-80 overflow-y-auto divide-y divide-border">
            {items.length === 0 ? (
              <p className="px-4 py-6 text-sm text-muted-foreground text-center">You're all caught up.</p>
            ) : items.slice(0, 15).map(n => (
              <Link key={n.id} to={to as any} onClick={() => setOpen(false)} className="block px-4 py-3 hover:bg-cream-dark">
                <p className="text-sm font-medium text-foreground">{n.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.detail}</p>
                <p className="text-[11px] text-brand-green mt-1">{n.when}</p>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function AdminBadge() {
  const { data } = useAdminNotifs(true);
  return <Badge count={data?.length ?? 0} />;
}

function DeliveryBadge({ userId }: { userId: string }) {
  const { data } = useDeliveryNotifs(userId);
  return <Badge count={data?.length ?? 0} />;
}

function Badge({ count }: { count: number }) {
  if (!count) return null;
  return (
    <span className="ml-1 min-w-5 h-5 px-1.5 rounded-full bg-brand-red text-white text-[10px] font-bold flex items-center justify-center">
      {count > 99 ? "99+" : count}
    </span>
  );
}


export function PortalShell({ children, title, bgImage }: { children: ReactNode; title: string; bgImage?: string }) {
  const { user } = useSession();
  const { has } = useRoles(user);
  const router = useRouter();
  async function logout() { await signOut(); router.navigate({ to: "/", replace: true }); }

  const isStaff = has("admin") || has("delivery");
  const links = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, show: !isStaff, badge: null as ReactNode },
    { to: "/subscribe", label: "New subscription", icon: PackagePlus, show: !isStaff, badge: null as ReactNode },
    { to: "/admin", label: "Admin", icon: ShieldCheck, show: has("admin"), badge: <AdminBadge /> },
    { to: "/delivery", label: "Delivery", icon: Truck, show: has("delivery"), badge: user ? <DeliveryBadge userId={user.id} /> : null },
  ];

  const isAdmin = has("admin");
  const isDelivery = !isAdmin && has("delivery");
  const isClient = !isStaff;
  const adminNotifs = useAdminNotifs(isAdmin);
  const deliveryNotifs = useDeliveryNotifs(isDelivery ? user?.id : undefined);
  const clientNotifs = useClientNotifs(isClient ? user?.id : undefined);
  const notifItems = isAdmin ? adminNotifs.data ?? [] : isDelivery ? deliveryNotifs.data ?? [] : clientNotifs.data ?? [];
  const notifTarget = isAdmin ? "/admin" : isDelivery ? "/delivery" : "/dashboard";

  const shellStyle = bgImage
    ? { backgroundImage: `linear-gradient(rgba(250,247,238,0.92), rgba(250,247,238,0.94)), url(${bgImage})`, backgroundSize: "cover", backgroundAttachment: "fixed" as const, backgroundPosition: "center" }
    : undefined;

  return (
    <div className="min-h-screen bg-cream" style={shellStyle}>

      <header className="bg-background border-b border-border sticky top-0 z-40">
        <div className="mx-auto max-w-7xl px-4 h-16 flex items-center justify-between gap-4">
          <Link to="/" className="flex items-center gap-2"><img src={logo} alt="Kongu Nadu" className="h-10" /></Link>
          <nav className="hidden md:flex items-center gap-1">
            {links.filter(l => l.show).map(l => (
              <Link key={l.to} to={l.to as any} className="px-3 py-2 rounded-lg text-sm font-medium hover:bg-cream-dark flex items-center gap-2" activeProps={{ className: "bg-brand-green/10 text-brand-green" }}>
                <l.icon className="h-4 w-4" />{l.label}{l.badge}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <NotificationBell items={notifItems} to={notifTarget} />

            <span className="hidden sm:flex items-center gap-2 text-sm text-muted-foreground"><UserIcon className="h-4 w-4" />{user?.email}</span>
            <button onClick={logout} className="p-2 rounded-lg hover:bg-cream-dark" title="Sign out"><LogOut className="h-4 w-4" /></button>
          </div>
        </div>
        <nav className="md:hidden border-t border-border overflow-x-auto">
          <div className="flex gap-1 px-2 py-2">
            {links.filter(l => l.show).map(l => (
              <Link key={l.to} to={l.to as any} className="px-3 py-1.5 rounded-lg text-xs font-medium hover:bg-cream-dark flex items-center gap-1.5 whitespace-nowrap" activeProps={{ className: "bg-brand-green/10 text-brand-green" }}>
                <l.icon className="h-3.5 w-3.5" />{l.label}{l.badge}
              </Link>
            ))}
          </div>
        </nav>
      </header>
      <main className="mx-auto max-w-7xl px-4 py-6 md:py-10">
        <h1 className="text-2xl md:text-3xl font-bold text-brand-brown mb-6">{title}</h1>
        {children}
      </main>
    </div>
  );
}

export function money(paise: number) { return `₹${(paise / 100).toFixed(0)}`; }
