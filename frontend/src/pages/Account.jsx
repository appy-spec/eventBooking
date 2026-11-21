import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Ticket,
  CalendarDays,
  MapPin,
  ArrowUpRight,
  LogOut,
  UserRound,
  Clock,
} from "lucide-react";
import { logout, myBookings } from "../services/api";
import { formatDate } from "../utils/formatDate";

export default function Account() {

  const user = JSON.parse(localStorage.getItem("eventoraUser") || "null");
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {

    if (!user) {
      navigate("/login");
      return;
    }

    const fetchBookings = async () => {
      try {
        const response = await myBookings();
        const bookingsData = response.bookings || [];
        setBookings(bookingsData);
      } catch (error) {
        console.error("Failed to fetch bookings:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, []);

  if (!user) {
    return null;
  }

  return (
    
    <main className="min-h-[75vh] px-5 py-14 md:px-8">
      <div className="mx-auto max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.18em] text-black/40">
              Your Eventora
            </p>
            <h1 className="mt-2 font-display text-4xl font-bold tracking-[-.05em]">
              Hey, {user.name.split(" ")[0]}.
            </h1>
            <p className="mt-2 text-sm text-black/45">
              All your plans, in one place.
            </p>
          </div>
          <button
            onClick={() => {
              logout();
              navigate("/");
            }}
            className="inline-flex items-center gap-2 rounded-full border border-black/10 px-4 py-3 text-xs font-bold"
          >
            <LogOut size={15} /> Sign out
          </button>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl bg-ink p-6 text-white">
            <Ticket className="text-lime" />
            <p className="mt-5 font-display text-3xl font-bold">
              {bookings.length}
            </p>
            <p className="mt-1 text-xs text-white/50">Bookings made</p>
          </div>
          <div className="rounded-2xl bg-white p-6">
            <CalendarDays className="text-black/45" />
            <p className="mt-5 font-display text-3xl font-bold">
              {bookings.reduce((a, b) => a + Number(b.quantity), 0)}
            </p>
            <p className="mt-1 text-xs text-black/45">Tickets reserved</p>
          </div>
          <div className="rounded-2xl bg-white p-6">
            <UserRound className="text-black/45" />
            <p className="mt-5 truncate text-lg font-bold">{user.email}</p>
            <p className="mt-1 text-xs text-black/45">Account email</p>
          </div>
        </div>
        <div className="mt-12 flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold">Your bookings</h2>
          <Link
            to="/explore"
            className="text-xs font-bold underline underline-offset-4"
          >
            Explore more
          </Link>
        </div>

        {loading ? (
          <div className="mt-5 rounded-[24px] bg-white px-6 py-16 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-black/10 border-t-black"></div>
            <p className="mt-4 text-sm text-black/45">
              Loading your bookings...
            </p>
          </div>
        ) : bookings.length ? (
          <div className="mt-5 space-y-4">
            {bookings.map((b) => (
              <div
                key={b.id}
                className="flex flex-col gap-5 rounded-2xl bg-white p-5 sm:flex-row sm:items-center"
              >
                <div className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-lime">
                  <Ticket size={23} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-xl font-bold">
                    {b.event_title}
                  </p>
                  <p className="mt-1 text-xs text-black/45">
                    {b.ticket_type} · {b.quantity} ticket(s) · {b.booking_code}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-4 text-xs text-black/45">
                    <span className="flex items-center gap-1">
                      <CalendarDays size={13} />
                      {formatDate(b.event_date)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin size={13} />
                      {b.event_location}
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between gap-4 sm:flex-col sm:items-end">
                  <span className="font-display text-xl font-bold">
                    ₹{Number(b.total_amount).toLocaleString("en-IN")}
                  </span>
                  <span className="rounded-full bg-green-50 px-3 py-1.5 text-[10px] font-bold text-green-700">
                    {b.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="mt-5 rounded-[24px] bg-white px-6 py-16 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-paper">
              <Ticket />
            </div>
            <h3 className="mt-5 font-display text-2xl font-bold">
              No bookings yet
            </h3>
            <p className="mt-2 text-sm text-black/45">
              Your next great experience is waiting.
            </p>
            <Link
              to="/explore"
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-bold text-white"
            >
              Explore events <ArrowUpRight size={16} />
            </Link>
          </div>
        )}
      </div>
    </main>
    
  );
}
