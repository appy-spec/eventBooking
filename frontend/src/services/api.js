const BASE = (
    import.meta.env.VITE_API_URL || "http://localhost:5000").replace(
    /\/$/,
    "",
);

export function getToken() {
    return localStorage.getItem("eventoraToken");
}

export async function api(path, { method = "GET", body } = {}) {
    
    const headers = { "Content-Type": "application/json" };
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
    const res = await fetch(`${BASE}${path}`, {
        method,
        headers,
        body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok)
        throw new Error(data.message || `Request failed (${res.status})`);
    return data;
}

export const login = (email, password) =>
    api("/auth/login", { method: "POST", body: { email, password } });

export const signup = (name, email, password) =>
    api("/auth/signup", { method: "POST", body: { name, email, password } });

export function logout() {
    localStorage.removeItem("eventoraToken");
    localStorage.removeItem("eventoraUser");
}

export const getEvents = (params = {}) => {
    const query = new URLSearchParams(
        Object.entries(params).filter(([, v]) => v),
    );
    return api(`/events${query.toString() ? `?${query}` : ""}`);
};

export const getEvent = (id) => api(`/events/${id}`);

export const createBooking = (payload) =>
  api("/bookings", { method: "POST", body: payload });

export const myBookings = () => api("/bookings/mine");

export const getAllBookings = () => api("/bookings/admin/all");

export const createEvent = (payload) =>
  api("/events", { method: "POST", body: payload });

export const updateEvent = (id, payload) =>
  api(`/events/${id}`, { method: "PUT", body: payload });

export const deleteEvent = (id) =>
  api(`/events/${id}`, { method: "DELETE" });