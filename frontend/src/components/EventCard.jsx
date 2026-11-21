import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowUpRight, MapPin, CalendarDays } from "lucide-react";
import { formatDate } from "../utils/formatDate";

export default function EventCard({ event, index = 0 }) {
  const left = event.available_seats;

  return (

    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.12 }}
      transition={{ duration: 0.45, delay: index * 0.06 }}
      className="group overflow-hidden rounded-[22px] bg-white shadow-[0_3px_18px_rgba(0,0,0,.035)] transition duration-300 hover:-translate-y-1 hover:shadow-soft"
    >
      <Link to={`/event/${event.id}`} className="block">
        <div className="relative h-56 overflow-hidden bg-stone-200">
          <img
            src={event.img}
            alt={event.title}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
          />
          <div className="absolute left-4 top-4 rounded-full bg-white/90 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider backdrop-blur">
            {event.category}
          </div>
          <div className="absolute bottom-4 left-4 rounded-full bg-ink/75 px-3 py-1.5 text-[11px] font-semibold text-white backdrop-blur">
            {event.tag}
          </div>
          <div className="absolute bottom-4 right-4 rounded-full bg-lime px-3 py-1.5 text-[11px] font-bold text-ink">
            ₹{event.price.toLocaleString("en-IN")} onwards
          </div>
        </div>
        <div className="p-5">
          <div className="mb-3 flex items-center gap-2 text-xs font-semibold text-black/45">
            <CalendarDays size={14} />
            {formatDate(event.date)}
            <span className="mx-1 h-1 w-1 rounded-full bg-black/25" />
            {event.time}
          </div>
          <h3 className="font-display text-[21px] font-bold tracking-tight">
            {event.title}
          </h3>
          <p className="mt-2 line-clamp-2 min-h-[44px] text-sm leading-[1.6] text-black/55">
            {event.description}
          </p>
          <div className="mt-4 flex items-center justify-between border-t border-black/5 pt-4">
            <span className="flex items-center gap-1.5 text-xs font-medium text-black/50">
              <MapPin size={14} />
              {event.location}
            </span>
            <span className="grid h-9 w-9 place-items-center rounded-full bg-paper transition group-hover:bg-lime">
              <ArrowUpRight size={17} />
            </span>
          </div>
          <div className="mt-4 h-1 overflow-hidden rounded-full bg-black/5">
            <div
              className="h-full rounded-full bg-lime"
              style={{
                width: `${Math.max(4, 100 - (left / event.total_seats) * 100)}%`,
              }}
            />
          </div>
          <p className="mt-2 text-[10px] font-semibold uppercase tracking-wider text-black/35">
            {left} seats available
          </p>
        </div>
      </Link>
    </motion.article>

  );
}
