import { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Plus,
  Search,
  Pencil,
  Trash2,
  Ticket,
  CalendarDays,
  Users,
  IndianRupee,
  X,
  LogOut,
  LayoutDashboard,
  MapPin,
  Save,
} from "lucide-react";
import { formatDate } from "../utils/formatDate";
import {
  getEvent,
  getEvents,
  getAllBookings,
  logout,
  updateEvent,
  createEvent,
  deleteEvent,
} from "../services/api";

const blank = {
  title: "",
  category: "Music",
  date: "2026-12-20T18:00",
  time: "6:00 PM onwards",
  location: "Mahalaxmi Racecourse, Mumbai",
  city: "Mumbai",
  price: 999,
  available: 100,
  total: 300,
  tag: "New",
  image:
    "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1400&q=85",
  description: "A memorable live experience.",
  host: "Eventora",
  long_description: "Join us for a special event experience.",
  includes: ["Event access", "Live experience", "Digital event pass"],
  tickets: [{ name: "General", price: 999, detail: "General access" }],
};

export default function Admin() {
  const user = JSON.parse(localStorage.getItem("eventoraUser") || "null");
  const navigate = useNavigate();

  const [items, setItems] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(blank);
  const [ticketModal, setTicketModal] = useState(false);
  const [includeModal, setIncludeModal] = useState(false);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    const fetchAdminData = async () => {
      try {
        const [eventsResponse, bookingsResponse] =
          await Promise.all([getEvents(), getAllBookings()]);

        const eventRows = Array.isArray(eventsResponse)
          ? eventsResponse
          : eventsResponse.events ||
            eventsResponse.data?.events ||
            [];

        const bookingRows = Array.isArray(bookingsResponse)
          ? bookingsResponse
          : bookingsResponse.bookings ||
            bookingsResponse.data?.bookings ||
            [];

        const formattedEvents = eventRows.map((event) => ({
          ...event,
          image: event.image || event.img,
          available: Number(
            event.available ?? event.available_seats ?? 0
          ),
          total: Number(
            event.total ?? event.total_seats ?? 0
          ),
          price: Number(event.price || 0),
        }));

        const formattedBookings = bookingRows.map((booking) => ({
          ...booking,
          quantity: Number(booking.quantity || 0),
          total_amount: Number(booking.total_amount || 0),
        }));

        setItems(formattedEvents);
        setBookings(formattedBookings);
      } catch (error) {
        console.error("Error fetching admin data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  const visible = useMemo(
    () =>
      items.filter((e) =>
        e.title?.toLowerCase().includes(query.toLowerCase())
      ),
    [items, query]
  );

  if (!user || user.role !== "admin") {
    return (
      <div className="px-5 py-32 text-center">
        <h1 className="font-display text-3xl font-bold">
          Admin access required
        </h1>
        <button
          onClick={() => navigate("/login")}
          className="mt-5 rounded-full bg-ink px-5 py-3 text-sm font-bold text-white"
        >
          Log in as admin
        </button>
      </div>
    );
  }

  const persist = (next) => {
    setItems(next);
    localStorage.setItem("eventoraEvents", JSON.stringify(next));
  };

  const openNew = () => {
    setEditing(null);
    setForm(blank);
    setModal(true);
  };

  const openEdit = async (e) => {
    try {
      const data = await getEvent(e.id);
      const event = data.event || data;

      setEditing(event.id);

      setForm({
        ...event,

        date: event.date ? String(event.date).slice(0, 16) : "",
        image: event.img || event.image || "",
        total: event.total_seats ?? event.total ?? 0,
        available: event.available_seats ?? event.available ?? 0,

        tickets: Array.isArray(event.tickets)
          ? event.tickets.map((ticket) => ({
              name: ticket.name || "",
              price: ticket.price ?? "",
              detail: ticket.detail || "",
            }))
          : [],

        includes: Array.isArray(event.includes)
          ? event.includes
          : [],
      });

      setModal(true);
    } catch (error) {
      console.error("Unable to fetch event details:", error);
      alert(error.message || "Unable to load event details");
    }
  };

  const addTicket = () => {
    setForm((prev) => ({
      ...prev,
      tickets: [
        ...(prev.tickets || []),
        { name: "", price: "", detail: "" },
      ],
    }));
  };

  const updateTicket = (index, field, value) => {
    setForm((prev) => ({
      ...prev,
      tickets: (prev.tickets || []).map((ticket, i) =>
        i === index ? { ...ticket, [field]: value } : ticket
      ),
    }));
  };

  const removeTicket = (index) => {
    setForm((prev) => ({
      ...prev,
      tickets: (prev.tickets || []).filter((_, i) => i !== index),
    }));
  };

  const addInclude = () => {
    setForm((prev) => ({
      ...prev,
      includes: [...(prev.includes || []), ""],
    }));
  };

  const updateInclude = (index, value) => {
    setForm((prev) => ({
      ...prev,
      includes: (prev.includes || []).map((item, i) =>
        i === index ? value : item
      ),
    }));
  };

  const removeInclude = (index) => {
    setForm((prev) => ({
      ...prev,
      includes: (prev.includes || []).filter((_, i) => i !== index),
    }));
  };

  const save = async (e) => {
    e.preventDefault();

    const value = {
      ...form,
      price: Number(form.price),
      available: Number(form.available),
      total: Number(form.total),

      tickets: (form.tickets || [])
        .filter((ticket) => ticket.name?.trim())
        .map((ticket) => ({
          ...ticket,
          price: Number(ticket.price),
        })),

      includes: (form.includes || []).filter((item) => item.trim()),
    };

    try {
      setSaving(true);

      if (editing) {
        await updateEvent(editing, value);
      } else {
        await createEvent(value);
      }

      const response = await getEvents();
      const eventRows = Array.isArray(response)
        ? response
        : response.events || response.data?.events || [];

      setItems(
        eventRows.map((event) => ({
          ...event,
          image: event.image || event.img,
          available: Number(event.available ?? event.available_seats ?? 0),
          total: Number(event.total ?? event.total_seats ?? 0),
          price: Number(event.price || 0),
        }))
      );

      setModal(false);
    } catch (error) {
      console.error("Error saving event:", error);
      alert(error.message || "Unable to save event");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id) => {
    if (!confirm("Delete this event? This cannot be undone.")) {
      return;
    }

    try {
      setDeleting(id);

      await deleteEvent(id);
      persist(items.filter((x) => x.id !== id));
      alert("Event deleted successfully");
    } catch (error) {
      console.error("Event deletion error:", error);
      alert(error.message || "Unable to delete event");
    } finally {
      setDeleting(null);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#efefe9] px-5 py-32 text-center">
        <p className="text-sm font-semibold text-black/50">
          Loading admin dashboard...
        </p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-[#efefe9] px-5 py-10 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-xl bg-ink text-lime">
              <LayoutDashboard />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[.17em] text-black/40">
                Eventora control room
              </p>
              <h1 className="font-display text-2xl font-bold">
                Admin dashboard
              </h1>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-full border border-black/15 px-4 py-2.5 text-xs font-bold"
          >
            <LogOut size={14} /> Sign out
          </button>
        </div>

        <div className="mt-9 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              label: "Total events",
              value: items.length,
              icon: CalendarDays,
            },
            {
              label: "Total bookings",
              value: bookings.length,
              icon: Ticket,
            },
            {
              label: "Tickets booked",
              value: bookings.reduce(
                (a, b) => a + b.quantity,
                0
              ),
              icon: Users,
            },
            {
              label: "Booking revenue",
              value: `₹${bookings
                .reduce((a, b) => a + b.total_amount, 0)
                .toLocaleString("en-IN")}`,
              icon: IndianRupee,
            },
          ].map((s) => (
            <div
              key={s.label}
              className="rounded-2xl bg-white p-5"
            >
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold text-black/45">
                  {s.label}
                </p>
                <s.icon size={18} className="text-black/35" />
              </div>
              <p className="mt-4 font-display text-3xl font-bold">
                {s.value}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-10 rounded-[24px] bg-white p-5 md:p-7">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-display text-2xl font-bold">
                Manage events
              </h2>
              <p className="mt-1 text-xs text-black/40">
                Create, update and remove event listings.
              </p>
            </div>

            <button
              onClick={openNew}
              className="flex items-center justify-center gap-2 rounded-full bg-ink px-5 py-3 text-xs font-bold text-white"
            >
              <Plus size={16} /> Add event
            </button>
          </div>

          <div className="mt-6 flex items-center gap-3 rounded-xl bg-paper px-4 py-3">
            <Search size={17} className="text-black/40" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search events..."
              className="w-full bg-transparent text-sm outline-none"
            />
          </div>

          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[680px] text-left">
              <thead>
                <tr className="border-b border-black/10 text-[10px] uppercase tracking-wider text-black/35">
                  <th className="pb-3">Event</th>
                  <th className="pb-3">Date</th>
                  <th className="pb-3">Price</th>
                  <th className="pb-3">Availability</th>
                  <th className="pb-3 text-right">Actions</th>
                </tr>
              </thead>

              <tbody>
                {visible.map((e) => (
                  <tr key={e.id} className="border-b border-black/5">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={e.image}
                          alt={e.title}
                          className="h-12 w-14 rounded-lg object-cover"
                        />
                        <div>
                          <p className="text-sm font-bold">
                            {e.title}
                          </p>
                          <p className="mt-1 text-[10px] text-black/40">
                            {e.category} · {e.location}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 text-xs text-black/55">
                      {formatDate(e.date)}
                    </td>

                    <td className="py-4 text-sm font-bold">
                      ₹{Number(e.price).toLocaleString("en-IN")}
                    </td>

                    <td className="py-4 text-xs text-black/55">
                      {e.available} / {e.total}
                    </td>

                    <td className="py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => openEdit(e)}
                          className="grid h-9 w-9 place-items-center rounded-full bg-paper hover:bg-lime"
                          title="Edit"
                        >
                          <Pencil size={15} />
                        </button>

                        <button
                          onClick={() => remove(e.id)}
                          disabled={deleting === e.id}
                          className="grid h-9 w-9 place-items-center rounded-full bg-paper text-red-500 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
                          title="Delete"
                        >
                          {deleting === e.id ? (
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-red-500 border-t-transparent" />
                          ) : (
                            <Trash2 size={15} />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {!visible.length && (
              <p className="py-10 text-center text-sm text-black/40">
                No matching events.
              </p>
            )}
          </div>
        </div>

        <div className="mt-8 rounded-2xl bg-ink p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-lime">
                Recent activity
              </p>
              <h3 className="mt-2 font-display text-xl font-bold">
                Latest bookings
              </h3>
            </div>
            <Ticket className="text-white/30" />
          </div>

          {bookings.length ? (
            <div className="mt-5 space-y-3">
              {bookings.slice(0, 5).map((b) => (
                <div
                  key={b.id}
                  className="flex flex-wrap justify-between gap-2 border-t border-white/10 pt-3 text-sm"
                >
                  <span className="font-semibold">
                    {b.name}{" "}
                    <span className="font-normal text-white/45">
                      · {b.event_title}
                    </span>
                  </span>

                  <span className="text-lime">
                    ₹{b.total_amount.toLocaleString("en-IN")}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-white/45">
              No bookings have been made yet.
            </p>
          )}
        </div>
      </div>

      {modal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center overflow-y-auto bg-black/60 px-4 py-8">
          <div className="my-auto w-full max-w-2xl rounded-[24px] bg-paper p-6 md:p-max-h-[calc(100vh-4rem)] overflow-y-auto8 ">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold uppercase tracking-widest text-black/40">
                  Event management
                </p>
                <h2 className="mt-1 font-display text-2xl font-bold">
                  {editing ? "Edit event" : "Create an event"}
                </h2>
              </div>

              <button
                onClick={() => setModal(false)}
                className="rounded-full bg-white p-2"
              >
                <X size={18} />
              </button>
            </div>

            <form
              onSubmit={save}
              className="mt-6 grid gap-4 sm:grid-cols-2"
            >
              {[
                { k: "title", label: "Event title", type: "text" },
                { k: "category", label: "Category", type: "select" },
                { k: "date", label: "Date & time", type: "datetime-local" },
                { k: "time", label: "Display time", type: "text" },
                { k: "location", label: "Venue / location", type: "text" },
                { k: "city", label: "City", type: "text" },
                { k: "price", label: "Starting price (₹)", type: "number" },
                { k: "available", label: "Available seats", type: "number" },
                { k: "total", label: "Total seats", type: "number" },
                { k: "tag", label: "Badge", type: "text" },
                { k: "image", label: "Image URL", type: "url" },
                { k: "host", label: "Organizer", type: "text" },
              ].map((f) => (
                <label key={f.k} className="block">
                  <span className="mb-1.5 block text-[11px] font-bold">
                    {f.label}
                  </span>

                  {f.type === "select" ? (
                    <select
                      value={form[f.k]}
                      onChange={(e) =>
                        setForm({ ...form, [f.k]: e.target.value })
                      }
                      className="w-full rounded-xl border border-black/10 bg-white px-3 py-3 text-sm outline-none"
                    >
                      {[
                        "Music",
                        "Business",
                        "Lifestyle",
                        "Arts",
                        "Sports",
                        "Food",
                      ].map((c) => (
                        <option key={c}>{c}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      required
                      value={form[f.k] ?? ""}
                      type={f.type}
                      onChange={(e) =>
                        setForm({ ...form, [f.k]: e.target.value })
                      }
                      className="w-full rounded-xl border border-black/10 bg-white px-3 py-3 text-sm outline-none"
                    />
                  )}
                </label>
              ))}

              <label className="sm:col-span-2">
                <span className="mb-1.5 block text-[11px] font-bold">
                  Short description
                </span>
                <textarea
                  required
                  rows="2"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  className="w-full rounded-xl border border-black/10 bg-white px-3 py-3 text-sm outline-none"
                />
              </label>

              <label className="sm:col-span-2">
                <span className="mb-1.5 block text-[11px] font-bold">
                  Full description
                </span>
                <textarea
                  rows="3"
                  value={form.long_description}
                  onChange={(e) =>
                    setForm({ ...form, long_description: e.target.value })
                  }
                  className="w-full rounded-xl border border-black/10 bg-white px-3 py-3 text-sm outline-none"
                />
              </label>

              {/* Manage Tickets */}
              <div className="sm:col-span-2">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[11px] font-bold">
                    Ticket Categories
                  </span>
                  <span className="text-xs text-black/40">
                    {form.tickets?.length || 0} tickets added
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setTicketModal(true)}
                  className="w-full rounded-xl border border-black/10 bg-white px-4 py-4 text-left text-sm font-bold hover:bg-black/5"
                >
                  <Ticket size={16} className="mr-2 inline" />
                  Manage Tickets
                  <span className="float-right text-black/40">→</span>
                </button>
              </div>

              {/* Manage Includes */}
              <div className="sm:col-span-2">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-[11px] font-bold">
                    What's Included
                  </span>
                  <span className="text-xs text-black/40">
                    {form.includes?.length || 0} items added
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIncludeModal(true)}
                  className="w-full rounded-xl border border-black/10 bg-white px-4 py-4 text-left text-sm font-bold hover:bg-black/5"
                >
                  <Plus size={16} className="mr-2 inline" />
                  Manage Includes
                  <span className="float-right text-black/40">→</span>
                </button>
              </div>

              <button
                type="submit"
                disabled={saving}
                className="sm:col-span-2 flex items-center justify-center gap-2 rounded-full bg-ink py-4 text-sm font-bold text-white disabled:cursor-not-allowed disabled:opacity-60"
              >
                {saving ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    {editing ? "Saving changes..." : "Creating event..."}
                  </>
                ) : (
                  <>
                    <Save size={16} />{" "}
                    {editing ? "Save changes" : "Create event"}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Tickets Modal */}
      {ticketModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-[#efefe9] p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">Manage Tickets</h2>
                <p className="text-xs text-black/50">
                  Add ticket types for {form.title || "this event"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setTicketModal(false)}
                className="rounded-full bg-white p-2"
              >
                <X size={18} />
              </button>
            </div>

            <div className="max-h-[55vh] space-y-3 overflow-y-auto">
              {(form.tickets || []).map((ticket, index) => (
                <div
                  key={index}
                  className="rounded-xl border border-black/10 bg-white p-4"
                >
                  <div className="mb-3 flex items-center justify-between">
                    <span className="text-xs font-bold">
                      Ticket {index + 1}
                    </span>
                    <button
                      type="button"
                      onClick={() => removeTicket(index)}
                      className="text-xs font-bold text-red-500"
                    >
                      Remove
                    </button>
                  </div>

                  <div className="space-y-3">
                    <input
                      placeholder="Ticket name (General, VIP)"
                      value={ticket.name}
                      onChange={(e) =>
                        updateTicket(index, "name", e.target.value)
                      }
                      className="w-full rounded-xl border border-black/10 px-3 py-3 text-sm outline-none"
                    />
                    <input
                      type="number"
                      min="0"
                      placeholder="Ticket price (₹)"
                      value={ticket.price}
                      onChange={(e) =>
                        updateTicket(index, "price", e.target.value)
                      }
                      className="w-full rounded-xl border border-black/10 px-3 py-3 text-sm outline-none"
                    />
                    <textarea
                      rows="2"
                      placeholder="Ticket description"
                      value={ticket.detail || ""}
                      onChange={(e) =>
                        updateTicket(index, "detail", e.target.value)
                      }
                      className="w-full rounded-xl border border-black/10 px-3 py-3 text-sm outline-none"
                    />
                  </div>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addTicket}
              className="mt-4 w-full rounded-xl border border-dashed border-black/30 py-3 text-sm font-bold"
            >
              + Add another ticket
            </button>
            <button
              type="button"
              onClick={() => setTicketModal(false)}
              className="mt-4 w-full rounded-full bg-ink py-3 text-sm font-bold text-white"
            >
              Save Tickets
            </button>
          </div>
        </div>
      )}

      {/* Includes Modal */}
      {includeModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
          <div className="w-full max-w-lg rounded-2xl bg-[#efefe9] p-6">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold">Manage Includes</h2>
                <p className="text-xs text-black/50">
                  Add benefits for {form.title || "this event"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIncludeModal(false)}
                className="rounded-full bg-white p-2"
              >
                <X size={18} />
              </button>
            </div>

            <div className="max-h-[55vh] space-y-3 overflow-y-auto">
              {(form.includes || []).map((item, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    value={item}
                    placeholder="Example: Event access"
                    onChange={(e) =>
                      updateInclude(index, e.target.value)
                    }
                    className="w-full rounded-xl border border-black/10 bg-white px-3 py-3 text-sm outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => removeInclude(index)}
                    className="rounded-xl border border-black/10 bg-white px-4 text-red-500"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>

            <button
              type="button"
              onClick={addInclude}
              className="mt-4 w-full rounded-xl border border-dashed border-black/30 py-3 text-sm font-bold"
            >
              + Add another item
            </button>
            <button
              type="button"
              onClick={() => setIncludeModal(false)}
              className="mt-4 w-full rounded-full bg-ink py-3 text-sm font-bold text-white"
            >
              Save Includes
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
