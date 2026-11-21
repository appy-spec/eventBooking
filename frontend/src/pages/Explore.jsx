import { useMemo, useState, useEffect } from "react";
import {
  Search,
  SlidersHorizontal,
  MapPin,
  CalendarDays,
  X,
  ArrowUpRight,
} from "lucide-react";
import EventCard from "../components/EventCard";
import { motion } from "framer-motion";
import { getEvents } from "../services/api";

export default function Explore() {

  const [q, setQ] = useState("");
  const [category, setCategory] = useState("All");
  const [city, setCity] = useState("All locations");
  const [date, setDate] = useState("");
  const [sort, setSort] = useState("recommended");
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const cats = [
    "All",
    "Music",
    "Business",
    "Lifestyle",
    "Arts",
    "Sports",
    "Food",
  ];

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await getEvents();
        const eventData =
          response?.events ??
          response?.data?.events ??
          response?.data ??
          response;

        if (!Array.isArray(eventData)) {
          throw new Error("Invalid events response from server");
        }

        setEvents(eventData);
      } catch (err) {
        console.error("Error fetching events:", err);
        setError(
          err.response?.data?.message ||
          err.message ||
          "Unable to load events. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  const locations = useMemo(() => {
    return [
      "All locations",
      ...new Set(
        events
          .map((e) => e.city || e.location)
          .filter(Boolean)
      ),
    ];
  }, [events]);

  const filtered = useMemo(() => {
    return events
      .filter((e) => {
        const eventCity = e.city || e.location || "";
        const eventDate = e.date || e.event_date || "";
        const eventPrice = Number(e.price ?? e.ticket_price ?? 0);

        const matchesCategory =
          category === "All" || e.category === category;

        const matchesCity =
          city === "All locations" || eventCity === city;

        const matchesDate =
          !date ||
          (eventDate &&
            new Date(eventDate).toISOString().slice(0, 10) === date);

        const searchText = `
          ${e.title || ""}
          ${e.description || ""}
          ${e.location || ""}
          ${e.city || ""}
          ${e.category || ""}
        `.toLowerCase();

        const matchesSearch = searchText.includes(q.toLowerCase());

        return (
          matchesCategory &&
          matchesCity &&
          matchesDate &&
          matchesSearch
        );
      })
      .sort((a, b) => {
        const priceA = Number(a.price ?? a.ticket_price ?? 0);
        const priceB = Number(b.price ?? b.ticket_price ?? 0);

        if (sort === "price-low") {
          return priceA - priceB;
        }

        if (sort === "price-high") {
          return priceB - priceA;
        }

        if (sort === "date") {
          return (
            new Date(a.date || a.event_date) -
            new Date(b.date || b.event_date)
          );
        }

        return 0;
      });
  }, [events, q, category, city, date, sort]);

  const clearFilters = () => {
    setQ("");
    setCity("All locations");
    setDate("");
    setCategory("All");
    setSort("recommended");
  };

  return (

    <main className="min-h-screen">

      <section className="bg-ink px-5 pb-14 pt-16 text-white md:px-8 md:pt-20">
        <div className="mx-auto max-w-7xl">
          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 text-xs font-bold uppercase tracking-[.2em] text-lime"
          >
            Find your next experience
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.08 }}
            className="font-display text-5xl font-semibold tracking-[-.06em] md:text-7xl"
          >
            Go on. Get <span className="text-lime">out there.</span>
          </motion.h1>

          <p className="mt-5 max-w-xl text-sm leading-6 text-white/55 md:text-base">
            Discover the experiences, people and places you'll be talking about
            long after.
          </p>

          <div className="mt-10 grid gap-3 rounded-[20px] bg-white p-3 text-ink shadow-2xl md:grid-cols-[1.5fr_1fr_1fr_auto] md:p-2">

            <label className="flex items-center gap-3 rounded-xl px-3 py-3">
              <Search className="shrink-0 text-black/40" size={19} />
              <input
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search events, artists, experiences..."
                className="w-full bg-transparent text-sm outline-none placeholder:text-black/35"
              />
            </label>

            <label className="flex items-center gap-3 rounded-xl border-t border-black/5 px-3 py-3 md:border-l md:border-t-0">
              <MapPin className="shrink-0 text-black/40" size={18} />

              <select
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full bg-transparent text-sm outline-none"
              >
                {locations.map((location) => (
                  <option key={location} value={location}>
                    {location}
                  </option>
                ))}
              </select>
            </label>

            <label className="flex items-center gap-3 rounded-xl border-t border-black/5 px-3 py-3 md:border-l md:border-t-0">
              <CalendarDays className="shrink-0 text-black/40" size={18} />

              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-transparent text-sm outline-none"
              />
            </label>

            <button
              onClick={clearFilters}
              className="rounded-xl bg-lime px-6 py-3 text-sm font-bold transition hover:bg-ink hover:text-white"
            >
              Clear filters
            </button>

          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-5 py-12 md:px-8">

        <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-center">
          <div className="flex flex-wrap gap-2">
            {cats.map((c) => (
              <button
                key={c}
                onClick={() => setCategory(c)}
                className={`rounded-full px-4 py-2.5 text-xs font-bold transition ${
                  category === c
                    ? "bg-ink text-white"
                    : "bg-white text-black/55 hover:bg-black/5"
                }`}
              >
                {c}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2 text-sm">
            <SlidersHorizontal size={16} className="text-black/40" />

            <span className="text-black/45">Sort by</span>

            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="rounded-full border border-black/10 bg-transparent px-3 py-2 text-sm font-semibold outline-none"
            >
              <option value="recommended">Recommended</option>
              <option value="date">Date</option>
              <option value="price-low">Price: low to high</option>
              <option value="price-high">Price: high to low</option>
            </select>
          </div>

        </div>

        <div className="mb-6 flex items-center justify-between">

          <p className="text-sm font-semibold">
            {filtered.length} experiences{" "}
            <span className="font-normal text-black/40">
              to explore
            </span>
          </p>

          {(q || date || city !== "All locations" || category !== "All") && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1 text-xs font-semibold text-black/50"
            >
              Reset <X size={13} />
            </button>
          )}

        </div>

        {loading ? (
          <div className="py-20 text-center">
            <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-black/10 border-t-black" />
            <p className="mt-5 text-sm text-black/45">
              Loading amazing experiences...
            </p>
          </div>

        ) : error ? (

          <div className="rounded-[24px] bg-white py-20 text-center">
            <h3 className="font-display text-2xl font-bold">
              Something went wrong
            </h3>

            <p className="mt-2 text-sm text-red-500">
              {error}
            </p>

            <button
              onClick={() => window.location.reload()}
              className="mt-6 rounded-full bg-ink px-5 py-3 text-sm font-bold text-white"
            >
              Try again
            </button>
          </div>

        ) : filtered.length ? (

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((event, i) => (
              <EventCard
                key={event.id}
                event={event}
                index={i}
              />
            ))}
          </div>

        ) : (

          <div className="rounded-[24px] bg-white py-20 text-center">

            <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-paper">
              <Search />
            </div>

            <h3 className="mt-5 font-display text-2xl font-bold">
              No events found
            </h3>

            <p className="mt-2 text-sm text-black/45">
              Try another search or clear your filters.
            </p>

            <button
              onClick={clearFilters}
              className="mt-6 inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-bold text-white"
            >
              Show all events <ArrowUpRight size={15} />
            </button>

          </div>
        )}

      </section>

    </main>

  );
}
