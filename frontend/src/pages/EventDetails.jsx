import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  ArrowUpRight,
  CalendarDays,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  Minus,
  Plus,
  Ticket,
  Share2,
} from "lucide-react";
import { getEvent } from "../services/api";
import { motion } from "framer-motion";

export default function EventDetails() {

  const { id } = useParams();
  const [event, setEvent] = useState(null);
  const [ticket, setTicket] = useState(0);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await getEvent(id);
        setEvent(response.event || response);
      } catch (error) {
        console.error("Error fetching event:", error);
        setEvent(null);
      } finally {
        setLoading(false);
      }
    };

    fetchEvent();
  }, [id]);

  if (loading) {
    return (
      <main className="flex min-h-[calc(100vh-80px)] items-center justify-center px-5">
        <div className="flex flex-col items-center text-center">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-black/10 border-t-ink" />

          <h1 className="mt-6 font-display text-2xl font-bold">
            Loading event details...
          </h1>

          <p className="mt-2 text-sm text-black/45">
            Please wait while we fetch the event information.
          </p>
        </div>
      </main>
    );
  }

  if (!event) {
    return (
      <div className="mx-auto max-w-4xl px-5 py-32 text-center">
        <h1 className="font-display text-3xl">Event not found</h1>
        <Link to="/explore" className="mt-5 inline-block underline">
          Back to explore
        </Link>
      </div>
    );
  }

  const selected = event.tickets[ticket];

  return (
    <main className="pb-20">
      <div className="mx-auto max-w-7xl px-5 pt-7 md:px-8">
        <Link
          to="/explore"
          className="inline-flex items-center gap-2 text-sm font-semibold text-black/50 hover:text-black"
        >
          <ArrowLeft size={16} /> Back to explore
        </Link>
      </div>
      <div className="mx-auto mt-6 max-w-7xl px-5 md:px-8">
        <div className="relative h-[360px] overflow-hidden rounded-[28px] bg-ink md:h-[520px]">
          <img
            src={event.img}
            alt={event.title}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
          <div className="absolute bottom-7 left-6 right-6 text-white md:bottom-10 md:left-10">
            <span className="rounded-full bg-lime px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-ink">
              {event.category}
            </span>
            <h1 className="mt-4 max-w-3xl font-display text-4xl font-semibold tracking-[-.05em] md:text-6xl">
              {event.title}
            </h1>
            <p className="mt-3 text-sm text-white/70">
              Presented by {event.host}
            </p>
          </div>
        </div>
        <div className="mt-10 grid gap-12 lg:grid-cols-[1fr_390px]">
          <div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                {
                  icon: CalendarDays,
                  label: "DATE",
                  value: new Date(event.date).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  }),
                },
                { icon: Clock, label: "TIME", value: event.time },
                { icon: MapPin, label: "LOCATION", value: event.location },
                {
                  icon: Users,
                  label: "AVAILABILITY",
                  value: `${event.available_seats} spots left`,
                },
              ].map((x) => (
                <div key={x.label} className="rounded-2xl bg-white p-4">
                  <x.icon size={18} className="text-black/45" />
                  <p className="mt-4 text-[9px] font-bold tracking-[.15em] text-black/35">
                    {x.label}
                  </p>
                  <p className="mt-1 text-sm font-bold leading-5">{x.value}</p>
                </div>
              ))}
            </div>
            <section className="mt-12">
              <p className="text-xs font-bold uppercase tracking-[.18em] text-black/35">
                About this event
              </p>
              <h2 className="mt-3 font-display text-3xl font-bold tracking-tight">
                The experience
              </h2>
              <p className="mt-5 max-w-3xl text-[15px] leading-8 text-black/60">
                {event.long}
              </p>
              <p className="mt-4 max-w-3xl text-[15px] leading-8 text-black/60">
                {event.description}
              </p>
            </section>
            <section className="mt-12">
              <h2 className="font-display text-2xl font-bold">
                Your ticket includes
              </h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {event.includes.map((x) => (
                  <div
                    key={x}
                    className="flex items-center gap-3 text-sm text-black/65"
                  >
                    <CheckCircle2
                      size={17}
                      className="shrink-0 text-green-600"
                    />
                    {x}
                  </div>
                ))}
              </div>
            </section>
            <section className="mt-12">
              <h2 className="font-display text-2xl font-bold">
                Where it happens
              </h2>
              <div className="mt-5 flex min-h-36 items-center justify-between rounded-2xl bg-[#e8e8df] p-6">
                <div>
                  <MapPin size={22} />
                  <p className="mt-3 font-bold">{event.location}</p>
                  <p className="mt-1 text-xs text-black/45">
                    {event.city}, India
                  </p>
                </div>
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-3 text-xs font-bold"
                >
                  Open map <ArrowUpRight size={15} />
                </a>
              </div>
            </section>
          </div>
          <aside className="h-fit rounded-[24px] bg-white p-6 shadow-soft lg:sticky lg:top-28">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold uppercase tracking-[.16em] text-black/40">
                Choose your ticket
              </p>
              <span className="rounded-full bg-lime/60 px-3 py-1 text-[10px] font-bold">
                {event.available_seats} left
              </span>
            </div>
            <div className="mt-5 space-y-3">
              {event.tickets.map((t, i) => (
                <button
                  key={t.name}
                  onClick={() => setTicket(i)}
                  className={`w-full rounded-2xl border p-4 text-left transition ${ticket === i ? "border-ink bg-paper" : "border-black/10 hover:border-black/30"}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-display font-bold">{t.name}</span>
                    <span className="font-display text-xl font-bold">
                      ₹{t.price.toLocaleString("en-IN")}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-black/45">{t.detail}</p>
                  <div
                    className={`mt-3 h-4 w-4 rounded-full border-2 ${ticket === i ? "border-ink bg-ink ring-2 ring-lime ring-offset-2" : "border-black/25"}`}
                  />
                </button>
              ))}
            </div>
            <div className="mt-6 flex items-center justify-between border-t border-black/10 pt-5">
              <span className="text-sm text-black/50">Price per ticket</span>
              <span className="font-display text-2xl font-bold">
                ₹{selected.price.toLocaleString("en-IN")}
              </span>
            </div>
            <button
              onClick={() => navigate(`/book/${event.id}?ticket=${ticket}`)}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-ink py-4 text-sm font-bold text-white transition hover:bg-black/75"
            >
              Book this event <ArrowUpRight size={17} />
            </button>
            <p className="mt-4 text-center text-[10px] text-black/35">
              Secure booking · Digital ticket · Instant confirmation
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}
