import { Router } from "express";
import { pool } from "../db.js";
import { auth } from "../middleware/auth.js";

const router = Router();

router.post("/", auth, async (req, res) => {
    const {
        code,
        eventId,
        ticket,
        name,
        email,
        mobile,
        quantity,
    } = req.body || {};

    const qty = Number(quantity);

    if (
        !eventId ||
        !ticket?.trim() ||
        !name?.trim() ||
        !email?.trim() ||
        !mobile?.trim() ||
        !Number.isInteger(qty) ||
        qty < 1 ||
        qty > 10
    ) {
        return res.status(400).json({
            message: "Event details are required",
        });
    }

    const conn = await pool.getConnection();

    try {
        await conn.beginTransaction();

        const [events] = await conn.query(
            "SELECT * FROM events WHERE id=? FOR UPDATE",
            [eventId]
        );

        if (!events.length) {
            await conn.rollback();
            return res.status(404).json({
                message: "Event not found",
            });
        }

        const event = events[0];

        if (new Date(event.date) < new Date()) {
            await conn.rollback();
            return res.status(400).json({
                message: "Event has already passed",
            });
        }

        if (event.available_seats < qty) {
            await conn.rollback();
            return res.status(409).json({
                message: "Not enough seats available",
                available_seats: event.available_seats,
            });
        }

        const [storedTicket] = await conn.query(
            "SELECT * FROM event_tickets WHERE event_id=? AND name=? FOR UPDATE",
            [eventId, ticket]
        );

        if (!storedTicket.length) {
            await conn.rollback();
            return res.status(404).json({
                message: "Ticket type not found",
            });
        }
        
        const total = storedTicket[0].price * qty;
        
        await conn.query(
            "UPDATE events SET available_seats = available_seats - ? WHERE id = ?",
            [qty, eventId]
        );

        const [result] = await conn.query(
            `INSERT INTO bookings
            (booking_code, user_id, event_id, ticket_type, name, email, mobile, quantity, total_amount, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'confirmed')`,
            [
                code,
                req.user.id,
                eventId,
                ticket.trim(),
                name.trim(),
                email.trim(),
                mobile.trim(),
                qty,
                total,
            ]
        );

        await conn.commit();

        res.status(201).json({
            message: "Booking successful",
            booking: {
                id: result.insertId,
                booking_code: code,
                user_id: req.user.id,
                event_id: eventId,
                ticket_type: ticket,
                name: name.trim(),
                email: email.trim(),
                mobile: mobile.trim(),
                quantity: qty,
                total_amount: total,
                status: "confirmed",
            },
        });

    } catch (e) {
        await conn.rollback();
        console.error(e);

        res.status(500).json({
            message: "Booking failed",
        });

    } finally {
        conn.release();
    }
});

router.get("/mine", auth, async(req, res) => {
    try {
        const [rows] = await pool.query(
            "SELECT b.*,e.title event_title,e.location event_location,e.date event_date,e.img event_img FROM bookings b JOIN events e ON e.id=b.event_id WHERE b.user_id=? ORDER BY b.booking_date DESC", [req.user.id],
        );
        res.json({ bookings: rows });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Unable to retrieve bookings" });
    }
});

router.get("/admin/all", auth, async(req, res) => {
    if (req.user.role !== "admin"){
        return res.status(403).json({ message: "Access denied" });
    }
    
    try{
        const [rows] = await pool.query(
            "SELECT b.*,e.title event_title,e.location event_location,e.date event_date,e.img event_img,u.name user_name,u.email user_email FROM bookings b JOIN events e ON e.id=b.event_id JOIN users u ON u.id=b.user_id ORDER BY b.booking_date DESC",
        );
        res.json({ bookings: rows });
    }
    catch (e) {
        console.error(e);
        res.status(500).json({ message: "Unable to retrieve bookings" });
    }
});

router.get("/:id", auth, async(req, res) => {
    try {
        const [rows] = await pool.query(
            "SELECT b.*,e.title event_title,e.location event_location,e.date event_date FROM bookings b JOIN events e ON e.id=b.event_id WHERE b.id=? AND (b.user_id=? OR ?='admin')", [req.params.id, req.user.id, req.user.role],
        );
        if (!rows.length)
            return res.status(404).json({ message: "Booking not found" });
        res.json({ booking: rows[0] });
    } catch (e) {
        res.status(500).json({ message: "Unable to retrieve booking" });
    }
});

export default router;