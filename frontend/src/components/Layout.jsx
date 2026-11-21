import { Link, NavLink, useNavigate } from "react-router-dom";
import {
  ArrowUpRight,
  Ticket,
  Menu,
  X,
  UserRound,
  LogOut,
  LayoutDashboard,
} from "lucide-react";
import { useState } from "react";
export function Header() {
  const [open, setOpen] = useState(false);
  const user = JSON.parse(localStorage.getItem("eventoraUser") || "null");
  const navigate = useNavigate();
  const logout = () => {
    localStorage.removeItem("eventoraUser");
    navigate("/");
    setOpen(false);
  };
  return (
    <header className="sticky top-0 z-50 border-b border-black/5 bg-paper/90 backdrop-blur-xl">
      <div className="mx-auto flex h-[76px] max-w-7xl items-center justify-between px-5 md:px-8">
        <Link to="/" className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-ink text-lime">
            <Ticket size={19} />
          </span>
          <span className="font-display text-[22px] font-bold tracking-tight">
            eventora<span className="text-lime">.</span>
          </span>
        </Link>
        <nav className="hidden items-center gap-9 text-sm font-semibold md:flex">
          <NavLink
            to="/explore"
            className={({ isActive }) =>
              isActive ? "text-black" : "text-black/55 hover:text-black"
            }
          >
            Explore events
          </NavLink>
          <a href="/#how" className="text-black/55 hover:text-black">
            How it works
          </a>
          <a href="/#about" className="text-black/55 hover:text-black">
            About
          </a>
        </nav>
        <div className="hidden items-center gap-3 md:flex">
          {user ? (
            <>
              <Link
                to={user.role === "admin" ? "/admin" : "/account"}
                className="flex items-center gap-2 rounded-full border border-black/10 px-4 py-2.5 text-sm font-semibold"
              >
                <UserRound size={16} />
                {user.name?.split(" ")[0] || "Account"}
              </Link>
              <button
                onClick={logout}
                className="rounded-full p-2 text-black/55 hover:bg-black/5"
                title="Sign out"
              >
                <LogOut size={17} />
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="px-3 py-2 text-sm font-semibold">
                Log in
              </Link>
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-bold text-white transition hover:bg-black/75"
              >
                Get started <ArrowUpRight size={16} />
              </Link>
            </>
          )}
        </div>
        <button
          onClick={() => setOpen(!open)}
          className="rounded-xl p-2 md:hidden"
        >
          {open ? <X /> : <Menu />}
        </button>
      </div>
      {open && (
        <div className="border-t border-black/10 bg-paper px-5 py-5 md:hidden">
          <div className="flex flex-col gap-4 text-sm font-semibold">
            <Link onClick={() => setOpen(false)} to="/explore">
              Explore events
            </Link>
            <a onClick={() => setOpen(false)} href="/#how">
              How it works
            </a>
            <Link
              onClick={() => setOpen(false)}
              to={user ? "/account" : "/login"}
            >
              {user ? "My account" : "Log in"}
            </Link>
            <Link
              onClick={() => setOpen(false)}
              to="/signup"
              className="rounded-full bg-ink px-4 py-3 text-center text-white"
            >
              Create account
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
export function Footer() {
  return (
    <footer className="bg-ink px-5 py-12 text-white md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col justify-between gap-8 border-b border-white/15 pb-10 md:flex-row md:items-end">
          <div>
            <Link to="/" className="font-display text-3xl font-bold">
              eventora<span className="text-lime">.</span>
            </Link>
            <p className="mt-3 max-w-sm text-sm leading-6 text-white/55">
              Good plans start here. Discover experiences, meet your people and
              make the moment yours.
            </p>
          </div>
          <Link
            to="/explore"
            className="inline-flex w-fit items-center gap-2 rounded-full bg-lime px-5 py-3 text-sm font-bold text-ink"
          >
            Find your next event <ArrowUpRight size={17} />
          </Link>
        </div>
        <div className="flex flex-col justify-between gap-3 pt-6 text-xs text-white/40 sm:flex-row">
          <span>© 2026 Eventora. Made for the moments that matter.</span>
          <span>Discover · Experience · Remember</span>
          <span>By Rahul Patel</span>
        </div>
      </div>
    </footer>
  );
}
export function Shell({ children }) {
  return (
    <>
      <Header />
      {children}
      <Footer />
    </>
  );
}
