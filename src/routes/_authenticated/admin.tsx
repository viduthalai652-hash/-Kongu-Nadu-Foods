import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { PortalShell, money } from "@/lib/portal-shell";
import { useSession, useRoles } from "@/lib/auth";
import { Users, Package, TrendingUp, UserPlus, Loader2, AlertCircle, Clock, Download, Plus, Pencil, Trash2, BarChart3, Truck } from "lucide-react";
import { useState } from "react";


import BG from "@/assets/manufacturing.jpg";
import FarmImg from "@/assets/farm.jpg";
import MilletsImg from "@/assets/millets.jpg";
import DeliveryImg from "@/assets/delivery.jpg";
import GroceryImg from "@/assets/grocery.jpg";

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({ meta: [{ title: "Admin — Kongu Nadu" }, { name: "description", content: "Admin panel." }] }),
  component: Admin,
});

function Admin() {
  const { user } = useSession();
  const { has, loading } = useRoles(user);
  if (loading) return <PortalShell title="Admin" bgImage={BG}><p>Loading...</p></PortalShell>;
  if (!has("admin")) return <PortalShell title="Admin" bgImage={BG}>
    <div className="bg-background border border-border rounded-2xl p-8 text-center">
      <p className="text-lg font-semibold mb-2">Admin access required</p>
      <p className="text-sm text-muted-foreground">Ask an administrator to grant you the <code>admin</code> role.</p>
    </div>
  </PortalShell>;
  return <AdminInner />;
}

function AdminInner() {
  const qc = useQueryClient();
  const [tab, setTab] = useState<"overview"|"subs"|"products"|"executives"|"assign"|"reports">("overview");

  const { data: stats } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: async () => {
      const [subs, prods, profs] = await Promise.all([
        supabase.from("subscriptions").select("id,total_paise,status"),
        supabase.from("products").select("id"),
        supabase.from("profiles").select("id"),
      ]);
      const active = (subs.data ?? []).filter((s:any) => s.status === "active");
      return {
        totalSubs: subs.data?.length ?? 0,
        active: active.length,
        revenue: active.reduce((s:number, x:any) => s + (x.total_paise ?? 0), 0),
        products: prods.data?.length ?? 0,
        customers: profs.data?.length ?? 0,
      };
    },
  });

  const { data: subs } = useQuery({
    queryKey: ["admin-subs"],
    queryFn: async () => {
      const { data: rows, error } = await supabase.from("subscriptions")
        .select("*, addresses(*), subscription_items(quantity, day_of_week, products(name,unit,price_paise))")
        .order("created_at", { ascending: false }).limit(200);
      if (error) { console.error(error); return []; }
      const uids = Array.from(new Set((rows ?? []).map((r: any) => r.user_id)));
      let profMap = new Map<string, any>();
      if (uids.length) {
        const { data: profs } = await supabase.from("profiles").select("id,full_name,email,phone").in("id", uids);
        profMap = new Map((profs ?? []).map((p: any) => [p.id, p]));
      }
      return (rows ?? []).map((r: any) => ({ ...r, profiles: profMap.get(r.user_id) ?? null }));
    },
  });

  const { data: products } = useQuery({
    queryKey: ["admin-products"],
    queryFn: async () => (await supabase.from("products").select("*, categories(name)").order("name")).data ?? [],
  });

  const { data: executives, refetch: refetchExecs } = useQuery({
    queryKey: ["deliv-execs"],
    queryFn: async () => {
      const { data: roles } = await supabase.from("user_roles").select("user_id").eq("role","delivery");
      const ids = (roles ?? []).map((r:any) => r.user_id);
      if (ids.length === 0) return [];
      const { data: profs } = await supabase.from("profiles").select("id,full_name,email,phone,service_pincodes").in("id", ids);
      return profs ?? [];
    },
  });

  const { data: allAssignments } = useQuery({
    queryKey: ["admin-all-assignments"],
    refetchInterval: 15000,
    queryFn: async () => (await supabase.from("delivery_assignments").select("subscription_id,delivery_date,executive_id,status")).data ?? [],
  });

  const { data: categoriesList } = useQuery({
    queryKey: ["admin-categories"],
    queryFn: async () => (await supabase.from("categories").select("*").order("sort_order")).data ?? [],
  });

  // Operational dataset used for today's orders + reports.
  const { data: ops } = useQuery({
    queryKey: ["admin-ops"],
    refetchInterval: 30000,
    queryFn: async () => {
      const from = new Date(); from.setDate(from.getDate() - 180);
      const to = new Date(); to.setDate(to.getDate() + 365);
      const { data } = await supabase.from("delivery_assignments")
        .select("*, subscriptions(user_id, time_slot, addresses(line1,city,pincode), subscription_items(quantity, day_of_week, products(name, categories(slug,name))))")
        .gte("delivery_date", from.toISOString().slice(0, 10))
        .lte("delivery_date", to.toISOString().slice(0, 10))
        .order("delivery_date");

      const rows = data ?? [];
      const haveKey = new Set(rows.map((r: any) => `${r.subscription_id}|${r.delivery_date}`));

      // Include ordered-but-not-yet-assigned subscription days so reports reflect real orders.
      const { data: subsRaw } = await supabase.from("subscriptions")
        .select("id,user_id,time_slot,status,start_date,end_date, addresses(line1,city,pincode), subscription_items(quantity, day_of_week, products(name, categories(slug,name)))")
        .neq("status", "cancelled");
      const virtual: any[] = [];
      for (const s of subsRaw ?? []) {
        const days = new Set<number>(((s as any).subscription_items ?? []).map((it: any) => it.day_of_week));
        if (!days.size) continue;
        const start = new Date(Math.max(new Date((s as any).start_date).getTime(), from.getTime()));
        const end = new Date(Math.min(new Date((s as any).end_date).getTime(), to.getTime()));
        for (const d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
          if (!days.has(d.getDay())) continue;
          const date = d.toISOString().slice(0, 10);
          if (haveKey.has(`${(s as any).id}|${date}`)) continue;
          virtual.push({
            id: `virtual-${(s as any).id}-${date}`,
            subscription_id: (s as any).id,
            delivery_date: date,
            executive_id: null,
            status: "pending",
            subscriptions: s,
          });
        }
      }
      return [...rows, ...virtual];
    },
  });


  async function toggleProduct(id: string, is_active: boolean) {
    await supabase.from("products").update({ is_active: !is_active }).eq("id", id);
    qc.invalidateQueries({ queryKey: ["admin-products"] });
  }


  async function bulkAssign(sub: any, execId: string) {
    const days = new Set<number>((sub.subscription_items ?? []).map((it: any) => it.day_of_week));
    if (days.size === 0) { alert("This subscription has no scheduled items."); return; }
    const start = new Date(Math.max(new Date(sub.start_date).getTime(), Date.now()));
    start.setHours(0,0,0,0);
    const end = new Date(sub.end_date);
    const rows: any[] = [];
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      if (days.has(d.getDay())) {
        const otp_code = Math.floor(1000 + Math.random() * 9000).toString();
        rows.push({ subscription_id: sub.id, delivery_date: d.toISOString().slice(0,10), executive_id: execId, status: "pending", otp_code });
      }
    }
    if (rows.length === 0) { alert("No upcoming delivery dates for this subscription."); return; }
    const { error } = await supabase.from("delivery_assignments").upsert(rows, { onConflict: "subscription_id,delivery_date" });
    if (error) alert(error.message);
    else {
      alert(`Assigned ${rows.length} deliveries to executive.`);
      qc.invalidateQueries({ queryKey: ["admin-all-assignments"] });
      qc.invalidateQueries({ queryKey: ["admin-unassigned-count"] });
    }
  }

  const assignedSubIds = new Set((allAssignments ?? []).map((a: any) => a.subscription_id));
  const unassigned = (subs ?? []).filter((s: any) => s.status === "active" && !assignedSubIds.has(s.id));

  return (
    <PortalShell title="Admin dashboard" bgImage={BG}>
      <div className="flex gap-2 mb-6 overflow-x-auto">
        {[["overview","Overview"],["subs","Subscriptions"],["assign","Assign delivery"],["executives","Executives"],["products","Products"],["reports","Reports & analytics"]].map(([k,l]) => (
          <button key={k} onClick={() => setTab(k as any)} className={`px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap ${tab===k ? "bg-brand-red text-white" : "bg-background border border-border"}`}>
            {l}{k === "assign" && unassigned.length > 0 && <span className="ml-1.5 min-w-5 h-5 px-1.5 inline-flex items-center justify-center rounded-full bg-brand-red text-white text-[10px] font-bold">{unassigned.length}</span>}
          </button>
        ))}
      </div>

      {tab === "overview" && stats && (
        <>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <Stat icon={Users} label="Customers" value={stats.customers} image={FarmImg} />
            <Stat icon={Package} label="Products" value={stats.products} image={MilletsImg} />
            <Stat icon={TrendingUp} label="Subscriptions" value={stats.totalSubs} image={DeliveryImg} />
            <Stat icon={TrendingUp} label="Active" value={stats.active} image={BG} />
            <Stat icon={TrendingUp} label="Active revenue" value={money(stats.revenue)} image={GroceryImg} />
          </div>

          <div className="grid lg:grid-cols-2 gap-6 items-start">
            <ProductionPlan ops={ops ?? []} />
            <TodaysOrders ops={ops ?? []} />
          </div>

          <div className="mt-8">
            <div className="flex items-center gap-2 mb-3">
              <AlertCircle className={`h-5 w-5 ${unassigned.length > 0 ? "text-brand-red" : "text-brand-green"}`} />
              <h2 className="text-lg font-bold text-brand-brown">Unassigned subscriptions ({unassigned.length})</h2>
            </div>
            {unassigned.length === 0 ? (
              <div className="bg-background border border-border rounded-2xl p-6 text-sm text-muted-foreground">All active subscriptions have deliveries assigned. 🎉</div>
            ) : (
              <div className="space-y-2">
                {unassigned.map((s: any) => (
                  <div key={s.id} className="bg-background border-2 border-brand-red/40 rounded-2xl p-4 flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="font-bold">{s.profiles?.full_name ?? "—"} <span className="text-xs font-normal text-muted-foreground">({s.profiles?.phone ?? s.profiles?.email})</span></p>
                      <p className="text-xs text-muted-foreground mt-0.5">{s.addresses?.line1}, {s.addresses?.city} — <span className="font-mono">{s.addresses?.pincode}</span></p>
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1"><Clock className="h-3 w-3" />Ordered {new Date(s.created_at).toLocaleString()} · {s.plan} · {money(s.total_paise)}</p>
                    </div>
                    <button onClick={() => setTab("assign")} className="px-4 py-2 rounded-full bg-brand-red text-white text-xs font-semibold whitespace-nowrap">Assign now →</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}


      {tab === "subs" && (
        <div className="bg-background rounded-2xl border border-border overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-cream text-left"><tr><th className="p-3">Customer</th><th className="p-3">Plan</th><th className="p-3">Status</th><th className="p-3">Total</th><th className="p-3">Pincode</th><th className="p-3">Address</th><th className="p-3">Items by day</th></tr></thead>
            <tbody>{(subs ?? []).map((s:any) => {
              const days = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];
              const byDay: Record<number, any[]> = {};
              (s.subscription_items ?? []).forEach((it:any) => { (byDay[it.day_of_week] ||= []).push(it); });
              return (
                <tr key={s.id} className="border-t border-border align-top">
                  <td className="p-3"><p className="font-semibold">{s.profiles?.full_name ?? "—"}</p><p className="text-xs text-muted-foreground">{s.profiles?.email}</p><p className="text-xs text-muted-foreground">{s.profiles?.phone}</p></td>
                  <td className="p-3 capitalize">{s.plan}</td>
                  <td className="p-3"><span className="px-2 py-0.5 rounded-full text-xs bg-cream-dark">{s.status}</span></td>
                  <td className="p-3 font-semibold">{money(s.total_paise)}</td>
                  <td className="p-3 font-mono">{s.addresses?.pincode}</td>
                  <td className="p-3 text-xs">{s.addresses?.line1}, {s.addresses?.city}</td>
                  <td className="p-3 text-xs">
                    {Object.keys(byDay).length === 0 ? <span className="text-muted-foreground">—</span> :
                      Object.entries(byDay).map(([d, items]) => (
                        <div key={d} className="mb-1"><span className="font-semibold">{days[Number(d)]}:</span> {items.map((it:any) => `${it.quantity}× ${it.products?.name}`).join(", ")}</div>
                      ))
                    }
                  </td>
                </tr>
              );
            })}{(!subs || subs.length === 0) && <tr><td colSpan={7} className="p-6 text-center text-muted-foreground">No subscriptions yet.</td></tr>}</tbody>
          </table>
        </div>
      )}

      {tab === "assign" && <AssignTab subs={subs ?? []} executives={executives ?? []} assignments={allAssignments ?? []} onBulkAssign={bulkAssign} />}

      {tab === "executives" && <ExecutivesTab executives={executives ?? []} onChanged={() => { refetchExecs(); }} />}

      {tab === "products" && <ProductsTab products={products ?? []} categories={categoriesList ?? []} onToggle={toggleProduct} onChanged={() => qc.invalidateQueries({ queryKey: ["admin-products"] })} />}

      {tab === "reports" && <ReportsTab ops={ops ?? []} executives={executives ?? []} />}
    </PortalShell>
  );
}

/* ---------------- TODAY'S ORDERS ---------------- */
function todayItems(a: any) {
  const dow = new Date(a.delivery_date).getDay();
  return (a.subscriptions?.subscription_items ?? []).filter((it: any) => it.day_of_week === dow);
}

function TodaysOrders({ ops }: { ops: any[] }) {
  const today = new Date().toISOString().slice(0, 10);
  const rows = ops.filter(a => a.delivery_date === today);
  return (
    <div className="mt-8">
      <div className="flex items-center gap-2 mb-3">
        <Truck className="h-5 w-5 text-brand-green" />
        <h2 className="text-lg font-bold text-brand-brown">Today's orders ({rows.length})</h2>
      </div>
      <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-cream-dark/30 text-left text-brand-brown uppercase tracking-wider text-xs"><tr><th className="p-4">Address</th><th className="p-4">Pincode</th><th className="p-4">Items</th><th className="p-4">Slot</th><th className="p-4">Status</th></tr></thead>
          <tbody>
            {rows.map((a: any) => (
              <tr key={a.id} className="border-t border-border align-top">
                <td className="p-3 text-xs">{a.subscriptions?.addresses?.line1}, {a.subscriptions?.addresses?.city}</td>
                <td className="p-3 font-mono text-xs">{a.subscriptions?.addresses?.pincode}</td>
                <td className="p-3 text-xs">{todayItems(a).map((it: any, i: number) => <div key={i}>{it.quantity} L × {it.products?.name}</div>)}</td>
                <td className="p-3 text-xs">{a.subscriptions?.time_slot}</td>
                <td className="p-3"><span className="px-2 py-0.5 rounded-full text-xs bg-cream-dark capitalize">{a.status.replace("_", " ")}</span></td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">No deliveries scheduled today.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ProductionPlan({ ops }: { ops: any[] }) {
  const today = new Date().toISOString().slice(0, 10);
  const prod = productionFor(ops, today);
  const rows = Array.from(prod.entries()).sort((a, b) => b[1].litres - a[1].litres);
  const totalL = Array.from(prod.values()).reduce((s, v) => s + v.litres, 0);

  return (
    <div className="mt-8">
      <div className="flex items-center gap-2 mb-3">
        <Package className="h-5 w-5 text-brand-green" />
        <h2 className="text-lg font-bold text-brand-brown">Today's Production Plan</h2>
      </div>
      <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-cream-dark/30 text-left text-brand-brown uppercase tracking-wider text-xs"><tr><th className="p-4">Product</th><th className="p-4">Orders</th><th className="p-4">Quantity</th></tr></thead>
          <tbody>
            {rows.map(([name, v], i) => (
              <tr key={i} className="border-t border-border">
                <td className="p-3 font-semibold">{name}</td>
                <td className="p-3">{v.subs.size}</td>
                <td className="p-3 font-bold text-brand-green">{v.litres} L</td>
              </tr>
            ))}
            {rows.length === 0 && <tr><td colSpan={3} className="p-6 text-center text-muted-foreground">No production required today.</td></tr>}
            {rows.length > 0 && <tr className="border-t-2 border-border font-bold bg-cream-dark/50"><td colSpan={2} className="p-3 text-right">Total:</td><td className="p-3 text-brand-green">{totalL} L</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------------- PRODUCTS CRUD ---------------- */
const emptyProduct = { id: "", name: "", category_id: "", unit: "1 litre", mrp_paise: 0, price_paise: 0, stock: 0, description: "", is_active: true };

function ProductsTab({ products, categories, onToggle, onChanged }: any) {
  const [form, setForm] = useState<any>(emptyProduct);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const editing = !!form.id;

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr(null);
    const payload = {
      name: form.name, category_id: form.category_id || null, unit: form.unit, description: form.description || null,
      mrp_paise: Math.round(Number(form.mrp_paise) * 100), price_paise: Math.round(Number(form.price_paise) * 100),
      stock: Number(form.stock) || 0, is_active: form.is_active,
    };
    const { error } = editing
      ? await supabase.from("products").update(payload).eq("id", form.id)
      : await supabase.from("products").insert(payload);
    setBusy(false);
    if (error) { setErr(error.message); return; }
    setForm(emptyProduct); onChanged();
  }

  async function remove(id: string, name: string) {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    const { error } = await supabase.from("products").delete().eq("id", id);
    if (error) alert(`${error.message}\n\nTip: products used in existing subscriptions can be hidden instead of deleted.`);
    else onChanged();
  }

  return (
    <div className="grid lg:grid-cols-[380px_1fr] gap-6 items-start">
      <form onSubmit={save} className="bg-background rounded-2xl border border-border p-5 space-y-3">
        <div className="flex items-center gap-2 font-semibold">
          {editing ? <Pencil className="h-5 w-5 text-brand-green" /> : <Plus className="h-5 w-5 text-brand-green" />}
          {editing ? "Edit product" : "Add product"}
        </div>
        <input required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="Product name" className="w-full h-11 px-4 rounded-lg border border-border" />
        <select value={form.category_id ?? ""} onChange={e => setForm({ ...form, category_id: e.target.value })} className="w-full h-11 px-3 rounded-lg border border-border">
          <option value="">Select category…</option>
          {categories.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} placeholder="Unit (1 litre / 1 kg)" className="w-full h-11 px-4 rounded-lg border border-border" />
        <div className="grid grid-cols-3 gap-2">
          <input type="number" min={0} step="0.01" value={form.mrp_paise} onChange={e => setForm({ ...form, mrp_paise: e.target.value })} placeholder="MRP ₹" className="h-11 px-3 rounded-lg border border-border" />
          <input type="number" min={0} step="0.01" value={form.price_paise} onChange={e => setForm({ ...form, price_paise: e.target.value })} placeholder="Price ₹" className="h-11 px-3 rounded-lg border border-border" />
          <input type="number" min={0} value={form.stock} onChange={e => setForm({ ...form, stock: e.target.value })} placeholder="Stock" className="h-11 px-3 rounded-lg border border-border" />
        </div>
        <textarea value={form.description ?? ""} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Description (optional)" className="w-full p-3 rounded-lg border border-border text-sm" rows={2} />
        <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} className="h-4 w-4 accent-brand-green" />Active (visible to customers)</label>
        {err && <p className="text-sm text-brand-red">{err}</p>}
        <div className="flex gap-2">
          <button disabled={busy} className="flex-1 h-11 rounded-full bg-brand-red text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}{editing ? "Save changes" : "Add product"}
          </button>
          {editing && <button type="button" onClick={() => setForm(emptyProduct)} className="px-4 h-11 rounded-full border border-border text-sm font-semibold">Cancel</button>}
        </div>
      </form>

      <div className="bg-background rounded-2xl border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-cream text-left"><tr><th className="p-3">Product</th><th className="p-3">Category</th><th className="p-3">Unit</th><th className="p-3">MRP</th><th className="p-3">Price</th><th className="p-3">Stock</th><th className="p-3">Status</th><th className="p-3"></th></tr></thead>
          <tbody>{products.map((p: any) => (
            <tr key={p.id} className="border-t border-border">
              <td className="p-3 font-semibold">{p.name}</td>
              <td className="p-3">{p.categories?.name}</td>
              <td className="p-3">{p.unit}</td>
              <td className="p-3 line-through text-muted-foreground">{money(p.mrp_paise)}</td>
              <td className="p-3 font-bold text-brand-green">{money(p.price_paise)}</td>
              <td className="p-3">{p.stock}</td>
              <td className="p-3"><button onClick={() => onToggle(p.id, p.is_active)} className={`px-3 py-1 rounded-full text-xs ${p.is_active ? "bg-brand-green/10 text-brand-green" : "bg-brand-red/10 text-brand-red"}`}>{p.is_active ? "Active" : "Hidden"}</button></td>
              <td className="p-3">
                <div className="flex gap-1">
                  <button title="Edit" onClick={() => setForm({ ...p, mrp_paise: p.mrp_paise / 100, price_paise: p.price_paise / 100, category_id: p.category_id ?? "" })} className="p-2 rounded-lg hover:bg-cream-dark"><Pencil className="h-4 w-4" /></button>
                  <button title="Delete" onClick={() => remove(p.id, p.name)} className="p-2 rounded-lg hover:bg-brand-red/10 text-brand-red"><Trash2 className="h-4 w-4" /></button>
                </div>
              </td>
            </tr>
          ))}
          {products.length === 0 && <tr><td colSpan={8} className="p-6 text-center text-muted-foreground">No products yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ---------------- REPORTS & ANALYTICS ---------------- */
function downloadCsv(filename: string, rows: (string | number)[][]) {
  const csv = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
  const url = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
  const a = document.createElement("a");
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

const DAY_NAMES = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

// Production aggregation for one date: product -> { subs, lines, litres }
function productionFor(ops: any[], date: string) {
  const map = new Map<string, { subs: Set<string>; lines: number; litres: number }>();
  ops.filter(a => a.delivery_date === date).forEach(a =>
    todayItems(a).forEach((it: any) => {
      const k = it.products?.name ?? "—";
      const cur = map.get(k) ?? { subs: new Set<string>(), lines: 0, litres: 0 };
      cur.subs.add(a.subscription_id);
      cur.lines += 1;
      cur.litres += it.quantity ?? 0;
      map.set(k, cur);
    }),
  );
  return map;
}

function ReportsTab({ ops, executives }: { ops: any[]; executives: any[] }) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const dayOps = ops.filter(a => a.delivery_date === date);

  const nextDate = (() => { const d = new Date(date); d.setDate(d.getDate() + 1); return d.toISOString().slice(0, 10); })();
  const todayProd = productionFor(ops, date);
  const nextProd = productionFor(ops, nextDate);

  const dayLabel = DAY_NAMES[new Date(date).getDay()];
  const nextDayLabel = DAY_NAMES[new Date(nextDate).getDay()];

  const productionRows = Array.from(todayProd.entries())
    .sort((a, b) => b[1].litres - a[1].litres)
    .map(([name, v]) => [name, dayLabel, v.subs.size, v.lines, `${v.litres} L`]);

  const totalTodayL = Array.from(todayProd.values()).reduce((s, v) => s + v.litres, 0);
  const totalNextL = Array.from(nextProd.values()).reduce((s, v) => s + v.litres, 0);

  const combinedNames = Array.from(new Set([...todayProd.keys(), ...nextProd.keys()]));
  const dailyVsNext = combinedNames.map(n => [n, `${todayProd.get(n)?.litres ?? 0} L`, `${nextProd.get(n)?.litres ?? 0} L`]);

  // ----- Delivery report: what each executive is actually handling -----
  const assignedAll = ops.filter(a => a.executive_id && !String(a.id).startsWith("virtual-"));
  const execInfo = (id: string) => executives.find((e: any) => e.id === id);
  const execName = (id: string | null) => {
    if (!id) return "Unassigned";
    const e = execInfo(id);
    return e?.full_name ?? e?.email ?? id.slice(0, 8);
  };

  const workload = new Map<string, { total: number; delivered: number; pending: number; today: number; upcoming: number }>();
  const todayStr = new Date().toISOString().slice(0, 10);
  assignedAll.forEach(a => {
    const k = a.executive_id as string;
    const cur = workload.get(k) ?? { total: 0, delivered: 0, pending: 0, today: 0, upcoming: 0 };
    cur.total += 1;
    if (a.status === "delivered") cur.delivered += 1;
    else cur.pending += 1;
    if (a.delivery_date === todayStr) cur.today += 1;
    if (a.delivery_date > todayStr) cur.upcoming += 1;
    workload.set(k, cur);
  });
  const workloadRows = Array.from(workload.entries()).map(([id, v]) => {
    const e = execInfo(id);
    return [execName(id), (e?.service_pincodes ?? []).join(", ") || "—", v.today, v.upcoming, v.delivered, v.pending, v.total];
  });

  const dayAssignments = dayOps
    .slice()
    .sort((a, b) => (a.executive_id ? 0 : 1) - (b.executive_id ? 0 : 1))
    .map(a => [
      execName(a.executive_id),
      `${a.subscriptions?.addresses?.line1 ?? "—"}, ${a.subscriptions?.addresses?.city ?? ""}`,
      a.subscriptions?.addresses?.pincode ?? "—",
      todayItems(a).map((it: any) => `${it.quantity} L ${it.products?.name}`).join(", ") || "—",
      a.subscriptions?.time_slot ?? "4-7 PM",
      String(a.status).replace("_", " "),
    ]);

  const byPin = new Map<string, number>();
  dayOps.forEach(a => { const pin = a.subscriptions?.addresses?.pincode ?? "—"; byPin.set(pin, (byPin.get(pin) ?? 0) + 1); });

  // Orders received per day
  const perDay = new Map<string, number>();
  ops.forEach(a => perDay.set(a.delivery_date, (perDay.get(a.delivery_date) ?? 0) + 1));
  const perDayRows = Array.from(perDay.entries()).sort((a, b) => (a[0] < b[0] ? 1 : -1));

  // Product-wise order count: product x weekday -> subscription orders / total orders / litres
  const perProduct = new Map<string, { day: string; subs: Set<string>; lines: number; litres: number }>();
  ops.forEach(a => {
    const day = DAY_NAMES[new Date(a.delivery_date).getDay()];
    todayItems(a).forEach((it: any) => {
      const name = it.products?.name ?? "—";
      const k = `${name}||${day}`;
      const cur = perProduct.get(k) ?? { day, subs: new Set<string>(), lines: 0, litres: 0 };
      cur.subs.add(a.subscription_id);
      cur.lines += 1;
      cur.litres += it.quantity ?? 0;
      perProduct.set(k, cur);
    });
  });
  const perProductRows = Array.from(perProduct.entries())
    .sort((a, b) => b[1].litres - a[1].litres)
    .map(([k, v]) => [k.split("||")[0], v.day, v.subs.size, v.lines, `${v.litres} L`]);


  return (
    <div className="space-y-6">
      <div className="bg-background rounded-2xl border border-border p-4 flex flex-wrap items-center gap-3">
        <BarChart3 className="h-5 w-5 text-brand-green" />
        <span className="text-sm font-semibold">Report date</span>
        <input type="date" value={date} onChange={e => setDate(e.target.value)} className="h-10 px-3 rounded-lg border border-border text-sm" />
        <span className="text-xs text-muted-foreground">{dayOps.length} deliveries on this date · {assignedAll.length} assigned jobs in total</span>
      </div>

      <Card
        title="Production report (kitchen)"
        onDownload={() => downloadCsv(`production-${date}.csv`, [["Product", "Day", "Subscription orders", "Total orders", "Daily litres of production"], ...productionRows])}
      >
        <div className="grid sm:grid-cols-2 gap-3 mb-4">
          <MiniStat label={`Daily production — ${dayLabel} ${date}`} value={`${totalTodayL} L`} />
          <MiniStat label={`Next day production — ${nextDayLabel} ${nextDate}`} value={`${totalNextL} L`} />
        </div>
        <SimpleTable
          head={["Product", "Day", "Subscription orders", "Total orders", "Daily litres of production"]}
          rows={productionRows}
          empty="Nothing to produce for this date."
        />
        <p className="text-xs font-bold uppercase text-muted-foreground mt-5 mb-2">Daily vs next-day litres (per product)</p>
        <SimpleTable head={["Product", `${dayLabel} (${date})`, `${nextDayLabel} (${nextDate})`]} rows={dailyVsNext} empty="No production planned for these two days." />
      </Card>

      <Card
        title="Delivery report (logistics)"
        onDownload={() => downloadCsv(`delivery-${date}.csv`, [
          ["Executive", "Service pincodes", "Today", "Upcoming", "Delivered", "Pending", "Total assigned"], ...workloadRows, [],
          ["Executive", "Address", "Pincode", "Items", "Slot", "Status"], ...dayAssignments,
        ])}
      >
        <p className="text-xs font-bold uppercase text-muted-foreground mb-2">Currently handled by each delivery executive</p>
        <SimpleTable
          head={["Executive", "Service pincodes", "Today", "Upcoming", "Delivered", "Pending", "Total assigned"]}
          rows={workloadRows}
          empty="No deliveries assigned to any executive yet."
        />
        <p className="text-xs font-bold uppercase text-muted-foreground mt-5 mb-2">Assigned deliveries on {date}</p>
        <SimpleTable head={["Executive", "Address", "Pincode", "Items", "Slot", "Status"]} rows={dayAssignments} empty="No deliveries scheduled for this date." />
        <p className="text-xs font-bold uppercase text-muted-foreground mt-5 mb-2">Cluster-wise orders</p>
        <SimpleTable head={["Pincode", "Orders"]} rows={Array.from(byPin.entries())} empty="No clusters for this date." />
      </Card>

      <Card title="Orders received per day" onDownload={() => downloadCsv("orders-per-day.csv", [["Date", "Orders"], ...perDayRows])}>
        <SimpleTable head={["Date", "Orders"]} rows={perDayRows} empty="No orders in this window." />
      </Card>

      <Card title="Product-wise order count" onDownload={() => downloadCsv("product-wise-orders.csv", [["Product", "Day", "Subscription orders", "Total orders", "Daily litres of production"], ...perProductRows])}>
        <SimpleTable head={["Product", "Day", "Subscription orders", "Total orders", "Daily litres of production"]} rows={perProductRows} empty="No product data yet." />
      </Card>
    </div>
  );
}


function Card({ title, onDownload, children }: any) {
  return (
    <div className="bg-background rounded-2xl border border-border p-5">
      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
        <h3 className="font-bold text-brand-brown">{title}</h3>
        <button onClick={onDownload} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-brand-green text-white text-xs font-semibold"><Download className="h-4 w-4" />Download CSV</button>
      </div>
      {children}
    </div>
  );
}
function MiniStat({ label, value }: any) {
  return <div className="rounded-xl bg-cream p-4"><p className="text-xs text-muted-foreground">{label}</p><p className="text-xl font-extrabold text-brand-brown mt-1">{value}</p></div>;
}
function SimpleTable({ head, rows, empty }: { head: string[]; rows: any[][]; empty: string }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-cream text-left"><tr>{head.map(h => <th key={h} className="p-2.5 text-xs uppercase text-muted-foreground">{h}</th>)}</tr></thead>
        <tbody>
          {rows.map((r, i) => <tr key={i} className="border-t border-border">{r.map((c, j) => <td key={j} className="p-2.5">{c}</td>)}</tr>)}
          {rows.length === 0 && <tr><td colSpan={head.length} className="p-5 text-center text-muted-foreground text-xs">{empty}</td></tr>}
        </tbody>
      </table>
    </div>
  );
}


function AssignTab({ subs, executives, assignments, onBulkAssign }: any) {
  const active = subs.filter((s:any) => s.status === "active");
  const byId = new Map<string, any[]>();
  (assignments ?? []).forEach((a: any) => {
    const arr = byId.get(a.subscription_id) ?? [];
    arr.push(a); byId.set(a.subscription_id, arr);
  });
  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Pick a delivery executive whose service pincodes cover the customer's pincode. Assigning creates delivery jobs for every scheduled day between today and the subscription end date — the executive sees them instantly on their dashboard.</p>
      {executives.length === 0 && <p className="text-sm text-brand-red">No delivery executives yet. Create one in the Executives tab.</p>}
      <div className="bg-background rounded-2xl border border-border overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-cream text-left"><tr><th className="p-3">Customer</th><th className="p-3">Pincode</th><th className="p-3">Period</th><th className="p-3">Current status</th><th className="p-3">Assign to</th></tr></thead>
          <tbody>{active.map((s:any) => {
            const pin = s.addresses?.pincode ?? "";
            const matches = executives.filter((e:any) => (e.service_pincodes ?? []).includes(pin));
            const existing = byId.get(s.id) ?? [];
            const currentExec = existing[0]?.executive_id;
            const currentExecProfile = executives.find((e:any) => e.id === currentExec);
            return (
              <tr key={s.id} className="border-t border-border align-top">
                <td className="p-3">
                  <p className="font-semibold">{s.profiles?.full_name ?? "—"}</p>
                  <p className="text-xs text-muted-foreground">{s.profiles?.phone ?? s.profiles?.email}</p>
                  <p className="text-xs text-muted-foreground mt-1">{s.addresses?.line1}, {s.addresses?.city}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">Ordered {new Date(s.created_at).toLocaleString()}</p>
                </td>
                <td className="p-3 font-mono">{pin}</td>
                <td className="p-3 text-xs">{s.start_date}<br/>→ {s.end_date}</td>
                <td className="p-3 text-xs">
                  {existing.length === 0
                    ? <span className="text-brand-red font-semibold">Unassigned</span>
                    : <><span className="text-brand-green font-semibold">{existing.length} deliveries</span><br/><span className="text-muted-foreground">to {currentExecProfile?.full_name ?? currentExecProfile?.email ?? "…"}</span></>}
                </td>
                <td className="p-3">
                  {matches.length === 0 ? (
                    <span className="text-xs text-brand-red">No executive covers {pin}</span>
                  ) : (
                    <select value={currentExec ?? ""} onChange={e => e.target.value && onBulkAssign(s, e.target.value)} className="border border-border rounded px-2 py-1 min-w-[220px]">
                      <option value="">Select executive…</option>
                      {matches.map((e:any) => <option key={e.id} value={e.id}>{e.full_name ?? e.email} — {e.phone ?? "no phone"}</option>)}
                    </select>
                  )}
                </td>
              </tr>
            );
          })}{active.length === 0 && <tr><td colSpan={5} className="p-6 text-center text-muted-foreground">No active subscriptions.</td></tr>}</tbody>
        </table>
      </div>
    </div>
  );
}


function ExecutivesTab({ executives, onChanged }: { executives: any[]; onChanged: () => void }) {
  const [form, setForm] = useState({ email: "", password: "", name: "", phone: "", pincodes: "" });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  async function createExec(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true); setErr(null); setOk(null);
    try {
      const pins = form.pincodes.split(",").map(p => p.trim()).filter(Boolean);
      // Use a throw-away Supabase client so signUp doesn't replace the admin's session.
      const { createClient } = await import("@supabase/supabase-js");
      const tmp = createClient(
        import.meta.env.VITE_SUPABASE_URL as string,
        import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string,
        { auth: { persistSession: false, autoRefreshToken: false, storage: undefined as any } }
      );
      const { data, error } = await tmp.auth.signUp({
        email: form.email,
        password: form.password,
        options: { data: { full_name: form.name, phone: form.phone } },
      });
      if (error) throw error;
      const uid = data.user?.id;
      if (!uid) throw new Error("Could not create user");
      // Grant delivery role + update profile with pincodes/phone/name (as the still-signed-in admin).
      await supabase.from("user_roles").insert({ user_id: uid, role: "delivery" as any });
      await supabase.from("profiles").update({ full_name: form.name, phone: form.phone, service_pincodes: pins }).eq("id", uid);
      setOk(`Executive ${form.email} created for pincodes: ${pins.join(", ") || "(none)"}`);
      setForm({ email: "", password: "", name: "", phone: "", pincodes: "" });
      onChanged();
    } catch (e: any) { setErr(e.message ?? "Failed"); }
    finally { setBusy(false); }
  }

  async function savePincodes(id: string, csv: string) {
    const pins = csv.split(",").map(p => p.trim()).filter(Boolean);
    const { error } = await supabase.from("profiles").update({ service_pincodes: pins }).eq("id", id);
    if (error) alert(error.message); else onChanged();
  }

  return (
    <div className="grid lg:grid-cols-2 gap-6">
      <form onSubmit={createExec} className="bg-background rounded-2xl border border-border p-5 space-y-3">
        <div className="flex items-center gap-2 font-semibold"><UserPlus className="h-5 w-5 text-brand-green" />Create delivery executive</div>
        <input required value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="Full name" className="w-full h-11 px-4 rounded-lg border border-border" />
        <input required type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="Email" className="w-full h-11 px-4 rounded-lg border border-border" />
        <input required minLength={6} type="password" value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="Password (min 6)" className="w-full h-11 px-4 rounded-lg border border-border" />
        <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} placeholder="Phone" className="w-full h-11 px-4 rounded-lg border border-border" />
        <input required value={form.pincodes} onChange={e => setForm({...form, pincodes: e.target.value})} placeholder="Service pincodes (comma separated, e.g. 638001, 638002)" className="w-full h-11 px-4 rounded-lg border border-border" />
        {err && <p className="text-sm text-brand-red">{err}</p>}
        {ok && <p className="text-sm text-brand-green">{ok}</p>}
        <button disabled={busy} className="w-full h-11 rounded-full bg-brand-red text-white font-semibold flex items-center justify-center gap-2 disabled:opacity-50">
          {busy && <Loader2 className="h-4 w-4 animate-spin" />}Create executive
        </button>
        <p className="text-xs text-muted-foreground">Note: the executive may need to confirm their email before signing in, depending on Auth settings.</p>
      </form>

      <div className="bg-background rounded-2xl border border-border p-5">
        <p className="font-semibold mb-3">Current executives ({executives.length})</p>
        <div className="space-y-3">
          {executives.map((e:any) => (
            <div key={e.id} className="border border-border rounded-xl p-3">
              <p className="font-semibold text-sm">{e.full_name ?? e.email}</p>
              <p className="text-xs text-muted-foreground">{e.email} · {e.phone ?? "no phone"}</p>
              <div className="mt-2 flex gap-2">
                <input defaultValue={(e.service_pincodes ?? []).join(", ")} placeholder="Pincodes (comma separated)" className="flex-1 h-9 px-3 rounded border border-border text-xs" id={`pin-${e.id}`} />
                <button onClick={() => {
                  const v = (document.getElementById(`pin-${e.id}`) as HTMLInputElement).value;
                  savePincodes(e.id, v);
                }} className="px-3 h-9 rounded bg-brand-green text-white text-xs font-semibold">Save</button>
              </div>
            </div>
          ))}
          {executives.length === 0 && <p className="text-sm text-muted-foreground">No executives yet.</p>}
        </div>
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value, image }: any) {
  return (
    <div className="relative overflow-hidden bg-white border border-border rounded-2xl p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="relative z-10 w-2/3">
        <Icon className="h-6 w-6 text-brand-green mb-3" />
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{label}</p>
        <p className="mt-1 text-3xl font-extrabold text-brand-brown tracking-tight">{value}</p>
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
