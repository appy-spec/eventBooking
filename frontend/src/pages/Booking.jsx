import { useEffect, useState } from "react";
import {
  Link,
  useNavigate,
  useLocation,
  useParams,
  useSearchParams,
} from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Lock,
  Ticket,
  User,
  Mail,
  Phone,
  Minus,
  Plus,
  CalendarDays,
  MapPin,
  Download,
  Home,
} from "lucide-react";
import { formatDate } from "../utils/formatDate";
import { getEvent, getToken } from "../services/api";
import { QRCodeSVG } from "qrcode.react";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "framer-motion";
import { createBooking } from "../services/api";

export function Booking() {
  const { id } = useParams();
  const [params] = useSearchParams();
  const initial = Number(params.get("ticket") || 0);
  const navigate = useNavigate();
  const location = useLocation();
  const draftKey = `eventoraBookingDraft-${id}`;

  const savedDraft = (() => {
    try {
      return JSON.parse(sessionStorage.getItem(draftKey) || "null");
    } catch {
      return null;
    }
  })();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ticket, setTicket] = useState(savedDraft?.ticket ?? initial);
  const [qty, setQty] = useState(savedDraft?.qty ?? 1);
  const [step, setStep] = useState(savedDraft?.step === 2 ? 2 : 1);
  const [form, setForm] = useState(
    savedDraft?.form || { name: "", email: "", mobile: "" },
  );
  const [errors, setErrors] = useState({});
  const [booking, setBooking] = useState(null);

  const chosen = event?.tickets[ticket];
  const total = chosen ? chosen.price * qty : 0;
  const user = JSON.parse(localStorage.getItem("eventoraUser") || "null");

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const response = await getEvent(id);
        const data = response.event || response;

        const tickets = (data.tickets || []).map((t) => ({
          ...t,
          price: Number(t.price),
        }));

        setEvent({
          ...data,
          image: data.img,
          available: data.available_seats,
          total: data.total_seats,
          price: Number(data.price),
          tickets,
        });

        const restoredTicket =
          Number.isInteger(savedDraft?.ticket) &&
          savedDraft.ticket >= 0 &&
          savedDraft.ticket < tickets.length
            ? savedDraft.ticket
            : initial >= 0 && initial < tickets.length
              ? initial
              : 0;

        setTicket(restoredTicket);

        if (savedDraft) {
          sessionStorage.removeItem(draftKey);
        }
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
    return <div className="p-24 text-center">Loading booking...</div>;
  }

  if (!event || !event.tickets.length) {
    return (
      <div className="p-24 text-center">
        Event not found <Link to="/explore">Explore</Link>
      </div>
    );
  }

  const update = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Please enter your name";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Enter a valid email";
    if (!/^[6-9]\d{9}$/.test(form.mobile))
      e.mobile = "Enter a valid 10-digit mobile number";

    setErrors(e);
    return !Object.keys(e).length;
  };

  const confirm = async () => {
    if (!validate()) return;

    const data = {
      code: `EV-${Date.now().toString().slice(-8)}`,
      userId: user?.id || null,
      eventId: event.id,
      eventTitle: event.title,
      ticket: chosen.name,
      quantity: qty,
      total,
      name: form.name,
      email: form.email,
      mobile: form.mobile,
      date: event.date,
      location: event.location,
      createdAt: new Date().toISOString(),
    };
    
    await createBooking(data);
    // const old = JSON.parse(localStorage.getItem("eventoraBookings") || "[]");
    // localStorage.setItem("eventoraBookings", JSON.stringify([data, ...old]));
    setBooking(data);
    setStep(3);

    confetti({
      particleCount: 130,
      spread: 75,
      origin: { y: 0.65 },
      colors: ["#d6ff4f", "#101010", "#ffffff"],
    });
  };

  const handleConfirmBooking = () => {
    if (!validate()) return;

    const token = getToken();

    if (!token) {
      sessionStorage.setItem(
        draftKey,
        JSON.stringify({ ticket, qty, step, form }),
      );

      navigate("/login", {
        state: {
          from: location.pathname + location.search,
        },
      });

      return;
    }

    confirm();
  };

  const download = () => {
    const svg = document.getElementById("booking-qr");
    if (!svg) return;

    const blob = new Blob([new XMLSerializer().serializeToString(svg)], {
      type: "image/svg+xml",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${booking.code}-ticket.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="min-h-screen px-5 py-12 md:px-8">
      <div className="mx-auto max-w-5xl">
        <Link
          to={`/event/${event.id}`}
          className="inline-flex items-center gap-2 text-sm font-semibold text-black/45"
        >
          <ArrowLeft size={16} /> Back to event
        </Link>

        <div className="mt-8 flex flex-wrap items-center justify-between gap-5">
          <div>
            <p className="text-xs font-bold uppercase tracking-[.18em] text-black/40">
              Your next great plan
            </p>
            <h1 className="mt-2 font-display text-4xl font-bold tracking-[-.05em]">
              {step === 3 ? "You’re on the list." : "Complete your booking."}
            </h1>
          </div>

          {step !== 3 && (
            <div className="flex items-center gap-2 text-xs font-bold">
              <span
                className={`grid h-8 w-8 place-items-center rounded-full ${step >= 1 ? "bg-ink text-white" : "bg-white"}`}
              >
                1
              </span>
              <span className="h-px w-8 bg-black/15" />
              <span
                className={`grid h-8 w-8 place-items-center rounded-full ${step >= 2 ? "bg-ink text-white" : "bg-white text-black/40"}`}
              >
                2
              </span>
            </div>
          )}
        </div>

        <AnimatePresence mode="wait">
          {step === 3 && booking ? (
            <motion.div
              key="success"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-10 grid gap-6 md:grid-cols-[1fr_300px]"
            >
              <div className="rounded-[28px] bg-ink p-8 text-white md:p-10">
                <div className="grid h-14 w-14 place-items-center rounded-full bg-lime text-ink">
                  <Check size={28} />
                </div>

                <p className="mt-7 text-xs font-bold uppercase tracking-[.18em] text-lime">
                  Booking confirmed
                </p>

                <h2 className="mt-2 font-display text-4xl font-bold">
                  It’s happening!
                </h2>

                <p className="mt-3 max-w-md text-sm leading-6 text-white/55">
                  Your spot is saved. We’ve prepared your digital ticket with
                  all the details you need.
                </p>

                <div className="mt-8 rounded-2xl bg-white/10 p-5">
                  <p className="text-[10px] font-bold uppercase tracking-[.15em] text-white/45">
                    Booking reference
                  </p>

                  <p className="mt-2 font-display text-2xl font-bold tracking-wider">
                    {booking.code}
                  </p>

                  <div className="mt-5 grid grid-cols-2 gap-4 border-t border-white/15 pt-5">
                    <div>
                      <p className="text-[10px] text-white/40">TICKET</p>
                      <p className="mt-1 text-sm font-semibold">
                        {booking.ticket} × {booking.quantity}
                      </p>
                    </div>

                    <div>
                      <p className="text-[10px] text-white/40">TOTAL PAID</p>
                      <p className="mt-1 text-sm font-semibold">
                        ₹{booking.total.toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-7 flex flex-wrap gap-3">
                  <button
                    onClick={download}
                    className="inline-flex items-center gap-2 rounded-full bg-lime px-5 py-3 text-sm font-bold text-ink"
                  >
                    <Download size={16} /> Download QR ticket
                  </button>

                  <Link
                    to="/account"
                    className="inline-flex items-center gap-2 rounded-full border border-white/20 px-5 py-3 text-sm font-bold"
                  >
                    <Ticket size={16} /> My bookings
                  </Link>
                </div>
              </div>

              <div className="flex flex-col items-center justify-center rounded-[28px] bg-white p-7 text-center">
                <div className="rounded-2xl bg-white p-3">
                  <QRCodeSVG
                    id="booking-qr"
                    value={JSON.stringify(booking)}
                    size={190}
                    level="H"
                    includeMargin
                  />
                </div>

                <p className="mt-5 font-display text-lg font-bold">
                  Your entry pass
                </p>

                <p className="mt-1 text-xs text-black/45">
                  Show this QR code at the venue
                </p>

                <p className="mt-4 text-[10px] font-bold uppercase tracking-widest text-black/30">
                  {booking.code}
                </p>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={step}
              initial={{ opacity: 0, x: 15 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -15 }}
              className="mt-10 grid gap-6 lg:grid-cols-[1fr_340px]"
            >
              <div className="rounded-[26px] bg-white p-6 md:p-9">
                {step === 1 ? (
                  <>
                    <p className="text-xs font-bold uppercase tracking-[.16em] text-black/35">
                      Step 1 of 2
                    </p>

                    <h2 className="mt-2 font-display text-2xl font-bold">
                      Choose your tickets
                    </h2>

                    <p className="mt-2 text-sm text-black/45">
                      Select the ticket type and number of people.
                    </p>

                    <div className="mt-7 space-y-3">
                      {event.tickets.map((t, i) => (
                        <button
                          key={t.name}
                          onClick={() => setTicket(i)}
                          className={`w-full rounded-2xl border p-4 text-left ${ticket === i ? "border-ink bg-paper" : "border-black/10"}`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-bold">{t.name}</p>
                              <p className="mt-1 text-xs text-black/45">
                                {t.detail}
                              </p>
                            </div>

                            <div className="text-right">
                              <p className="font-display text-xl font-bold">
                                ₹{t.price.toLocaleString("en-IN")}
                              </p>

                              <div
                                className={`ml-auto mt-2 h-4 w-4 rounded-full border-2 ${ticket === i ? "border-ink bg-ink ring-2 ring-lime ring-offset-2" : "border-black/20"}`}
                              />
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>

                    <div className="mt-7 flex items-center justify-between rounded-2xl bg-paper p-4">
                      <div>
                        <p className="font-bold">Number of tickets</p>
                        <p className="mt-1 text-xs text-black/45">
                          Maximum 8 tickets per booking
                        </p>
                      </div>

                      <div className="flex items-center gap-4">
                        <button
                          disabled={qty <= 1}
                          onClick={() => setQty((q) => q - 1)}
                          className="grid h-9 w-9 place-items-center rounded-full border border-black/15 disabled:opacity-30"
                        >
                          <Minus size={15} />
                        </button>

                        <span className="w-4 text-center font-bold">{qty}</span>

                        <button
                          disabled={qty >= 8}
                          onClick={() => setQty((q) => q + 1)}
                          className="grid h-9 w-9 place-items-center rounded-full bg-ink text-white disabled:opacity-30"
                        >
                          <Plus size={15} />
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={() => setStep(2)}
                      className="mt-7 flex w-full items-center justify-center gap-2 rounded-full bg-ink py-4 text-sm font-bold text-white"
                    >
                      Continue to details <ArrowRight size={17} />
                    </button>
                  </>
                ) : (
                  <>
                    <p className="text-xs font-bold uppercase tracking-[.16em] text-black/35">
                      Step 2 of 2
                    </p>

                    <h2 className="mt-2 font-display text-2xl font-bold">
                      Who’s attending?
                    </h2>

                    <p className="mt-2 text-sm text-black/45">
                      We’ll use these details for your digital ticket.
                    </p>

                    <div className="mt-8 space-y-5">
                      {[
                        {
                          key: "name",
                          label: "Full name",
                          icon: User,
                          placeholder: "Enter your full name",
                          type: "text",
                        },
                        {
                          key: "email",
                          label: "Email address",
                          icon: Mail,
                          placeholder: "you@example.com",
                          type: "email",
                        },
                        {
                          key: "mobile",
                          label: "Mobile number",
                          icon: Phone,
                          placeholder: "10-digit mobile number",
                          type: "tel",
                        },
                      ].map((f) => (
                        <label key={f.key} className="block">
                          <span className="mb-2 block text-xs font-bold">
                            {f.label}
                          </span>

                          <span className="flex items-center gap-3 rounded-xl border border-black/10 px-4 py-3.5 focus-within:border-black">
                            <f.icon size={17} className="text-black/35" />

                            <input
                              type={f.type}
                              value={form[f.key]}
                              onChange={(e) => update(f.key, e.target.value)}
                              placeholder={f.placeholder}
                              className="w-full bg-transparent text-sm outline-none"
                            />
                          </span>

                          {errors[f.key] && (
                            <span className="mt-1 block text-xs text-red-500">
                              {errors[f.key]}
                            </span>
                          )}
                        </label>
                      ))}
                    </div>

                    <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row">
                      <button
                        onClick={() => setStep(1)}
                        className="rounded-full border border-black/15 px-6 py-4 text-sm font-bold"
                      >
                        Back
                      </button>

                      <button
                        onClick={handleConfirmBooking}
                        className="flex flex-1 items-center justify-center gap-2 rounded-full bg-ink py-4 text-sm font-bold text-white"
                      >
                        Confirm booking · ₹{total.toLocaleString("en-IN")}{" "}
                        <Lock size={15} />
                      </button>
                    </div>

                    <p className="mt-4 text-center text-[10px] text-black/35">
                      Demo frontend: payment is not processed in this stage.
                    </p>
                  </>
                )}
              </div>

              <aside className="h-fit rounded-[26px] bg-white p-6">
                <p className="text-xs font-bold uppercase tracking-[.16em] text-black/35">
                  Order summary
                </p>

                <img
                  src={event.image}
                  alt=""
                  className="mt-5 h-36 w-full rounded-xl object-cover"
                />

                <h3 className="mt-4 font-display text-xl font-bold">
                  {event.title}
                </h3>

                <div className="mt-3 space-y-2 text-xs text-black/50">
                  <p className="flex items-center gap-2">
                    <CalendarDays size={14} />
                    {formatDate(event.date)}
                  </p>

                  <p className="flex items-center gap-2">
                    <MapPin size={14} />
                    {event.location}
                  </p>
                </div>

                <div className="mt-5 border-t border-black/10 pt-4">
                  <div className="flex justify-between text-sm">
                    <span className="text-black/50">
                      {chosen.name} × {qty}
                    </span>

                    <span className="font-semibold">
                      ₹{total.toLocaleString("en-IN")}
                    </span>
                  </div>

                  <div className="mt-4 flex justify-between border-t border-black/10 pt-4">
                    <span className="font-bold">Total</span>

                    <span className="font-display text-2xl font-bold">
                      ₹{total.toLocaleString("en-IN")}
                    </span>
                  </div>
                </div>

                <p className="mt-5 flex items-center gap-2 text-[10px] text-black/40">
                  <Lock size={13} /> Your details are kept secure
                </p>
              </aside>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
