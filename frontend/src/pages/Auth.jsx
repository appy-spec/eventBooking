import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpRight,
  Ticket,
  Mail,
  Lock,
  User,
  Eye,
  EyeOff,
  ShieldCheck,
} from "lucide-react";
import { motion } from "framer-motion";
import { login as loginApi, signup as signupApi } from "../services/api";

export default function Auth({ mode = "login" }) {

  const signup = mode === "signup";
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const location = useLocation();

  const submit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.email || !form.password || (signup && !form.name)) {
      setError("Please complete all fields.");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    try {
      const result = signup
        ? await signupApi(form.name, form.email, form.password)
        : await loginApi(form.email, form.password);
        
      localStorage.setItem("eventoraToken", result.token);
      localStorage.setItem("eventoraUser", JSON.stringify(result.user));

      const redirectTo = location.state?.from;

      navigate(
        redirectTo ||
          (result.user.role === "admin" ? "/admin" : "/account"),
        { replace: true }
      );

    } catch (err) {
      setError(err.message || "Authentication failed. Please try again.");
    }
  };

  return (

    <main className="grid min-h-[calc(100vh-0px)] lg:grid-cols-2">
      <section className="relative hidden overflow-hidden bg-ink text-white lg:block">
        <img
          src="https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1300&q=85"
          className="absolute inset-0 h-full w-full object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/35 to-ink/20" />
        <div className="relative flex h-full min-h-[680px] flex-col justify-between p-12 xl:p-16">
          <Link
            to="/"
            className="flex items-center gap-2 font-display text-2xl font-bold"
          >
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-lime text-ink">
              <Ticket size={19} />
            </span>
            eventora<span className="text-lime">.</span>
          </Link>
          <div className="max-w-lg">
            <p className="text-xs font-bold uppercase tracking-[.2em] text-lime">
              Find your people. Feel the moment.
            </p>
            <h2 className="mt-5 font-display text-6xl font-semibold leading-[.98] tracking-[-.06em]">
              The best stories start when you{" "}
              <span className="text-lime">show up.</span>
            </h2>
            <p className="mt-6 max-w-sm text-sm leading-7 text-white/55">
              Your next favourite memory is closer than you think. Let’s find
              it.
            </p>
          </div>
          <p className="text-xs text-white/35">
            © 2026 Eventora · Discover more, together.
          </p>
        </div>
      </section>
      <section className="flex items-center justify-center px-5 py-16">
        <div className="w-full max-w-md">
          <Link
            to="/"
            className="mb-12 inline-flex items-center gap-2 text-xs font-semibold text-black/45 lg:hidden"
          >
            <ArrowLeft size={15} /> Back to home
          </Link>
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="mb-7 grid h-12 w-12 place-items-center rounded-2xl bg-lime">
              <Ticket size={22} />
            </div>
            <p className="text-xs font-bold uppercase tracking-[.18em] text-black/40">
              {signup ? "Join the community" : "Welcome back"}
            </p>
            <h1 className="mt-2 font-display text-4xl font-bold tracking-[-.05em]">
              {signup ? "Create your account." : "Good to see you."}
            </h1>
            <p className="mt-3 text-sm text-black/45">
              {signup
                ? "Make an account and start collecting moments."
                : "Log in to manage your bookings and tickets."}
            </p>
            <form onSubmit={submit} className="mt-9 space-y-5">
              {signup && (
                <label className="block">
                  <span className="mb-2 block text-xs font-bold">
                    Full name
                  </span>
                  <span className="flex items-center gap-3 rounded-xl border border-black/10 px-4 py-3.5">
                    <User size={17} className="text-black/35" />
                    <input
                      value={form.name}
                      onChange={(e) =>
                        setForm({ ...form, name: e.target.value })
                      }
                      placeholder="Your name"
                      className="w-full bg-transparent text-sm outline-none"
                    />
                  </span>
                </label>
              )}
              <label className="block">
                <span className="mb-2 block text-xs font-bold">
                  Email address
                </span>
                <span className="flex items-center gap-3 rounded-xl border border-black/10 px-4 py-3.5">
                  <Mail size={17} className="text-black/35" />
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    placeholder="you@example.com"
                    className="w-full bg-transparent text-sm outline-none"
                  />
                </span>
              </label>
              <label className="block">
                <span className="mb-2 block text-xs font-bold">Password</span>
                <span className="flex items-center gap-3 rounded-xl border border-black/10 px-4 py-3.5">
                  <Lock size={17} className="text-black/35" />
                  <input
                    type={show ? "text" : "password"}
                    value={form.password}
                    onChange={(e) =>
                      setForm({ ...form, password: e.target.value })
                    }
                    placeholder="At least 8 characters"
                    className="w-full bg-transparent text-sm outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShow(!show)}
                    className="text-black/35"
                  >
                    {show ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </span>
              </label>
              {error && (
                <p className="rounded-xl bg-red-50 px-4 py-3 text-xs font-medium text-red-600">
                  {error}
                </p>
              )}
              <button className="flex w-full items-center justify-center gap-2 rounded-full bg-ink py-4 text-sm font-bold text-white transition hover:bg-black/75">
                {signup ? "Create account" : "Log in"}{" "}
                <ArrowUpRight size={17} />
              </button>
            </form>
            <div className="my-7 flex items-center gap-3 text-[10px] font-semibold uppercase tracking-wider text-black/25">
              <span className="h-px flex-1 bg-black/10" />
              Secure account access
              <span className="h-px flex-1 bg-black/10" />
            </div>
            <p className="text-center text-sm text-black/50">
              {signup ? "Already have an account?" : "New to Eventora?"}{" "}
              <Link
                to={signup ? "/login" : "/signup"}
                className="font-bold text-black underline underline-offset-4"
              >
                {signup ? "Log in" : "Create an account"}
              </Link>
            </p>
            <p className="mt-8 flex items-center justify-center gap-2 text-[10px] text-black/30">
              <ShieldCheck size={14} /> Your information stays private and
              secure
            </p>
            {!signup && (
              <p className="mt-4 text-center text-[10px] text-black/35">
                Demo admin: admin@eventora.demo · password: admin123
              </p>
            )}
          </motion.div>
        </div>
      </section>
    </main>

  );
}
