import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  ArrowDown,
  ArrowUpRight,
  Play,
  Sparkles,
  Ticket,
  Compass,
  ShieldCheck,
  CalendarCheck,
} from "lucide-react";
import { useRef, useState, useEffect } from "react";
import EventCard from "../components/EventCard";
import { getEvents } from "../services/api";

export default function Home() {

  const hero = useRef(null);
  const [events, setEvents] = useState([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const response = await getEvents();
        setEvents(response.events || response);
      } catch (error) {
        console.error("Error fetching events:", error);
      }
    };

    fetchEvents();
  }, []);

  const { scrollYProgress } = useScroll({
    target: hero,
    offset: ["start start", "end start"],
  });

  const y = useTransform(scrollYProgress, [0, 1], [0, 120]);

  return (

    <main>
      <section
        ref={hero}
        className="relative isolate min-h-[690px] overflow-hidden bg-ink text-white md:min-h-[760px]"
      >
        <motion.div style={{ y }} className="absolute inset-0 -z-20">
          <img
            src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=2200&q=90"
            className="h-full w-full object-cover opacity-45"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-ink via-ink/75 to-ink/10" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-ink/20" />
        </motion.div>
        <div className="grain absolute inset-0 -z-10 opacity-20" />
        <div className="mx-auto flex min-h-[690px] max-w-7xl flex-col justify-center px-5 pb-20 pt-20 md:min-h-[760px] md:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-3xl"
          >
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-[11px] font-bold uppercase tracking-[.18em] text-lime backdrop-blur">
              <Sparkles size={14} /> Your next story starts here
            </div>
            <h1 className="font-display text-[clamp(3.6rem,8.7vw,7.8rem)] font-semibold leading-[.91] tracking-[-.075em]">
              Make room
              <br />
              for <span className="text-lime">the moment.</span>
            </h1>
            <p className="mt-8 max-w-lg text-base leading-7 text-white/65 md:text-lg">
              From electric nights to ideas that move you. Find the experiences
              worth stepping out for.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link
                to="/explore"
                className="group inline-flex items-center gap-3 rounded-full bg-lime px-7 py-4 text-sm font-bold text-ink transition hover:bg-white"
              >
                Explore events{" "}
                <ArrowUpRight
                  size={18}
                  className="transition group-hover:translate-x-1 group-hover:-translate-y-1"
                />
              </Link>
              <a
                href="#how"
                className="inline-flex items-center gap-2 rounded-full border border-white/25 px-6 py-4 text-sm font-semibold text-white/85 transition hover:bg-white/10"
              >
                <Play size={14} fill="currentColor" /> How it works
              </a>
            </div>
          </motion.div>
          <div className="mt-20 flex items-end justify-between border-t border-white/20 pt-5">
            <div className="flex gap-10">
              <div>
                <p className="font-display text-2xl font-bold">6+</p>
                <p className="mt-1 text-[10px] uppercase tracking-[.16em] text-white/45">
                  Curated events
                </p>
              </div>
              <div>
                <p className="font-display text-2xl font-bold">One</p>
                <p className="mt-1 text-[10px] uppercase tracking-[.16em] text-white/45">
                  Place to discover
                </p>
              </div>
            </div>
            <a
              href="#featured"
              className="hidden items-center gap-2 text-xs font-semibold text-white/60 md:flex"
            >
              Scroll to explore <ArrowDown size={15} />
            </a>
          </div>
        </div>
        <div className="absolute bottom-28 right-[8%] hidden h-44 w-44 rotate-12 rounded-full border border-lime/40 md:block">
          <div className="absolute inset-3 rounded-full border border-white/15" />
          <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 text-center font-display text-sm font-semibold leading-5 text-lime">
            GO OUT.
            <br />
            FEEL MORE.
          </span>
        </div>
      </section>
      <section id="featured" className="mx-auto max-w-7xl px-5 py-24 md:px-8">
        <div className="mb-10 flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-[.2em] text-black/40">
              The good stuff
            </p>
            <h2 className="font-display text-4xl font-semibold tracking-[-.05em] md:text-5xl">
              Plans worth <span className="text-black/35">making.</span>
            </h2>
          </div>
          <Link
            to="/explore"
            className="inline-flex w-fit items-center gap-2 border-b border-black pb-2 text-sm font-bold"
          >
            See all events <ArrowUpRight size={16} />
          </Link>
        </div>
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {events.slice(0, 3).map((event, i) => (
            <EventCard key={event.id} event={event} index={i} />
          ))}
        </div>
      </section>
      <section id="how" className="bg-lime px-5 py-20 md:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="max-w-2xl">
            <p className="mb-3 text-xs font-bold uppercase tracking-[.2em] text-black/50">
              No fuss. Just good times.
            </p>
            <h2 className="font-display text-4xl font-semibold tracking-[-.05em] md:text-5xl">
              Three steps to
              <br />
              your next <span className="text-black/40">favourite memory.</span>
            </h2>
          </div>
          <div className="mt-14 grid gap-10 md:grid-cols-3">
            {[
              {
                n: "01",
                icon: Compass,
                title: "Find your thing",
                desc: "Explore handpicked experiences and filter by what, when and where.",
              },
              {
                n: "02",
                icon: Ticket,
                title: "Save your spot",
                desc: "Choose your ticket, add your details and book in a few simple steps.",
              },
              {
                n: "03",
                icon: CalendarCheck,
                title: "Show up & shine",
                desc: "Get your digital ticket and enjoy the moment. We’ll handle the details.",
              },
            ].map((x) => (
              <div key={x.n} className="border-t border-black/20 pt-5">
                <div className="flex items-center justify-between">
                  <span className="font-display text-sm font-bold">{x.n}</span>
                  <x.icon size={22} />
                </div>
                <h3 className="mt-9 font-display text-2xl font-bold">
                  {x.title}
                </h3>
                <p className="mt-3 max-w-xs text-sm leading-6 text-black/60">
                  {x.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section
        id="about"
        className="mx-auto grid max-w-7xl gap-10 px-5 py-24 md:grid-cols-2 md:items-center md:px-8"
      >
        <div className="relative min-h-[390px] overflow-hidden rounded-[28px] bg-ink">
          <img
            src="https://images.unsplash.com/photo-1523580494863-6f3031224c94?auto=format&fit=crop&w=1100&q=85"
            alt="People enjoying an event"
            className="absolute inset-0 h-full w-full object-cover opacity-75"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/80 to-transparent" />
          <div className="absolute bottom-7 left-7 text-white">
            <p className="text-xs font-bold uppercase tracking-[.18em] text-lime">
              Good people. Great energy.
            </p>
            <p className="mt-2 font-display text-3xl font-semibold">
              Be where it happens.
            </p>
          </div>
        </div>
        <div className="md:pl-8">
          <p className="mb-3 text-xs font-bold uppercase tracking-[.2em] text-black/40">
            A little about us
          </p>
          <h2 className="font-display text-4xl font-semibold leading-[1.05] tracking-[-.05em] md:text-5xl">
            Life happens
            <br />
            when you <span className="text-black/35">show up.</span>
          </h2>
          <p className="mt-6 max-w-lg text-[15px] leading-7 text-black/55">
            Eventora makes discovering and booking experiences feel as good as
            being there. Less time figuring out plans, more time making memories
            that stick.
          </p>
          <div className="mt-8 flex items-center gap-3 text-sm font-semibold">
            <ShieldCheck className="text-black/50" size={19} /> Simple, seamless
            event booking
          </div>
          <Link
            to="/explore"
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-ink px-6 py-4 text-sm font-bold text-white"
          >
            Find your next event <ArrowUpRight size={17} />
          </Link>
        </div>
      </section>
    </main>
    
  );
}
