import { createFileRoute, useNavigate, useSearch, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@/lib/auth";
import { ArrowLeft } from "lucide-react";
import logo from "../assets/logo.png";
import authBg from "../assets/about-kongu-nadu.png";


export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Kongu Nadu Fresh Foods" },
      { name: "description", content: "Sign in or create an account to start your Kongu Nadu subscription." },
      { property: "og:title", content: "Sign in — Kongu Nadu Fresh Foods" },
      { property: "og:description", content: "Sign in to manage your subscription." },
    ],
  }),
  validateSearch: (s: Record<string, unknown>) => ({ redirect: (s.redirect as string) || "/dashboard" }),
  component: AuthPage,
});

function AuthPage() {
  const { session } = useSession();
  const nav = useNavigate();
  const { redirect } = useSearch({ from: "/auth" });
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => { if (session) nav({ to: redirect as any, replace: true }); }, [session]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null); setBusy(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email, password,
          options: { emailRedirectTo: window.location.origin, data: { full_name: name, phone } },
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (e: any) { setErr(e.message ?? "Something went wrong"); }
    finally { setBusy(false); }
  }


  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-16 relative"
      style={{
        backgroundImage: `linear-gradient(rgba(20,30,20,0.55), rgba(20,30,20,0.7)), url(${authBg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <Link to="/" className="absolute top-6 left-6 flex items-center gap-2 rounded-full bg-white/90 backdrop-blur px-4 py-2 text-sm font-semibold text-brand-brown shadow hover:bg-white transition">
        <ArrowLeft className="h-4 w-4" /> Back to home
      </Link>
      <div className="w-full max-w-md bg-background rounded-3xl shadow-2xl border border-border p-8">
        <div className="flex justify-center mb-6"><img src={logo} alt="Kongu Nadu" className="h-14" /></div>

        <h1 className="text-2xl font-bold text-center text-brand-brown mb-1">
          {mode === "signup" ? "Create your account" : "Welcome back"}
        </h1>
        <p className="text-center text-sm text-muted-foreground mb-6">
          {mode === "signup" ? "Start your fresh subscription today" : "Sign in to manage your subscription"}
        </p>


        <form onSubmit={submit} className="space-y-3">
          {mode === "signup" && (<>
            <input value={name} onChange={e => setName(e.target.value)} required placeholder="Full name" className="w-full h-11 px-4 rounded-lg border border-border bg-background" />
            <input value={phone} onChange={e => setPhone(e.target.value)} required placeholder="Phone (10 digits)" className="w-full h-11 px-4 rounded-lg border border-border bg-background" />
          </>)}
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="Email" className="w-full h-11 px-4 rounded-lg border border-border bg-background" />
          <input type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} placeholder="Password (min 6 chars)" className="w-full h-11 px-4 rounded-lg border border-border bg-background" />
          {err && <p className="text-sm text-brand-red">{err}</p>}
          <button disabled={busy} className="w-full h-11 rounded-full bg-brand-red text-white font-semibold hover:brightness-110 disabled:opacity-60">
            {busy ? "Please wait..." : mode === "signup" ? "Create account" : "Sign in"}
          </button>
        </form>

        <p className="text-center text-sm text-muted-foreground mt-6">
          {mode === "signup" ? "Already have an account?" : "New to Kongu Nadu?"}{" "}
          <button className="text-brand-green font-semibold" onClick={() => setMode(mode === "signup" ? "signin" : "signup")}>
            {mode === "signup" ? "Sign in" : "Create account"}
          </button>
        </p>
      </div>
    </div>
  );
}
