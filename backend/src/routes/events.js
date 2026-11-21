import { Router } from "express";
import { pool } from "../db.js";
import { auth, adminOnly } from "../middleware/auth.js";

const router = Router();
const fields = [
  "title",
  "description",
  "location",
  "date",
  "total_seats",
  "price",
  "img",
];

function validate(body, partial = false) {
  const missing = fields.filter(
    (k) => body[k] === undefined || body[k] === null || body[k] === "",
  );
  if (!partial && missing.length)
    return `Missing fields: ${missing.join(", ")}`;
  if (
    body.total_seats !== undefined &&
    (!Number.isInteger(Number(body.total_seats)) ||
      Number(body.total_seats) < 1)
  )
    return "total_seats must be a positive integer";
  if (body.price !== undefined && Number(body.price) < 0)
    return "price must be non-negative";
  return null;
}

router.get("/", async (req, res) => {
  try {
    const { q, location, date } = req.query;
    let sql = "SELECT * FROM events WHERE date >= NOW()";
    const args = [];
    if (q) {
      sql += " AND (title LIKE ? OR description LIKE ?)";
      args.push(`%${q}%`, `%${q}%`);
    }
    if (location) {
      sql += " AND location LIKE ?";
      args.push(`%${location}%`);
    }
    if (date) {
      sql += " AND DATE(date)=?";
      args.push(date);
    }
    sql += " ORDER BY date ASC";
    const [rows] = await pool.query(sql, args);
    res.json({ events: rows });
  } catch (e) {
    console.error(e);
    res.status(500).json({ message: "Unable to load events" });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const eventId = req.params.id;

    const [rows] = await pool.query(
      "SELECT * FROM events WHERE id = ?",
      [eventId]
    );

    if (!rows.length) {
      return res.status(404).json({ message: "Event not found" });
    }

    const [tickets] = await pool.query(
      "SELECT name, price, detail FROM event_tickets WHERE event_id = ?",
      [eventId]
    );

    const [includes] = await pool.query(
      "SELECT item FROM event_includes WHERE event_id = ?",
      [eventId]
    );

    const event = {
      ...rows[0],
      tickets,
      includes: includes.map((item) => item.item),
    };

    res.json({ event });

  } catch (e) {
    console.error("Error fetching event:", e);
    res.status(500).json({ message: "Unable to load event" });
  }
});

router.post("/", auth, adminOnly, async (req, res) => {

  const b = {
    ...req.body,
    total_seats: req.body.total ?? req.body.total_seats,
    available_seats: req.body.available ?? req.body.available_seats,
    img: req.body.image || req.body.img || null,
  };
  const error = validate(b || {});
  if (error) return res.status(400).json({ message: error });

  const connection = await pool.getConnection();

  try {
    const b = req.body;
    await connection.beginTransaction();
    
    const [result] = await connection.query(
      `INSERT INTO events
      (
        title,
        category,
        description,
        location,
        city,
        date,
        time,
        total_seats,
        available_seats,
        price,
        img,
        tag,
        host,
        long_description
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        b.title,
        b.category,
        b.description,
        b.location,
        b.city || null,
        b.date,
        b.time,
        Number(b.total ?? b.total_seats),
        Number(b.available ?? b.available_seats),
        Number(b.price),
        b.img || b.image || null,
        b.tag || null,
        b.host || null,
        b.long || b.long_description || null,
      ]
    );

    const eventId = result.insertId;

    if (Array.isArray(b.tickets) && b.tickets.length > 0) {
      for (const ticket of b.tickets) {
        await connection.query(
          `INSERT INTO event_tickets
          (event_id, name, price, detail)
          VALUES (?, ?, ?, ?)`,
          [
            eventId,
            ticket.name,
            Number(ticket.price),
            ticket.detail || null,
          ]
        );
      }
    }

    if (Array.isArray(b.includes) && b.includes.length > 0) {
      for (const item of b.includes) {
        await connection.query(
          `INSERT INTO event_includes
          (event_id, item)
          VALUES (?, ?)`,
          [eventId, item]
        );
      }
    }

    const [[event]] = await connection.query(
      "SELECT * FROM events WHERE id = ?",
      [eventId]
    );

    const [tickets] = await connection.query(
      "SELECT * FROM event_tickets WHERE event_id = ?",
      [eventId]
    );

    const [includes] = await connection.query(
      "SELECT * FROM event_includes WHERE event_id = ?",
      [eventId]
    );

    await connection.commit();

    res.status(201).json({
      message: "Event created successfully",
      event: {
        ...event,
        tickets,
        includes: includes.map((item) => item.item),
      },
    });

    console.log("Event created successfully");

  } catch (e) {
    await connection.rollback();

    console.error("Event creation error:", e);

    res.status(500).json({
      message: "Event creation failed",
    });

  } finally {
    connection.release();
  }
});

router.put("/:id", auth, adminOnly, async (req, res) => {
  const body = req.body || {};

  // Map frontend field names to database field names
  const b = {
    ...body,
    total_seats: body.total ?? body.total_seats,
    available_seats: body.available ?? body.available_seats,
    img: body.image ?? body.img,
    long_description: body.long_description ?? body.long,
  };

  const error = validate(b, true);
  if (error) {
    return res.status(400).json({ message: error });
  }

  let connection;

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Get existing event and lock it during the update
    const [old] = await connection.query(
      "SELECT * FROM events WHERE id = ? FOR UPDATE",
      [req.params.id]
    );

    if (!old.length) {
      await connection.rollback();
      return res.status(404).json({ message: "Event not found" });
    }

    const existing = old[0];

    // Preserve already-booked seats
    const total = Number(
      b.total_seats ?? existing.total_seats
    );

    const booked =
      Number(existing.total_seats) -
      Number(existing.available_seats);

    if (!Number.isFinite(total) || total < 0) {
      await connection.rollback();
      return res.status(400).json({
        message: "Invalid total seats",
      });
    }

    if (total < booked) {
      await connection.rollback();
      return res.status(400).json({
        message: "Total seats cannot be less than already booked seats",
      });
    }

    const update = {
      ...existing,
      ...b,
      total_seats: total,
      available_seats: total - booked,
      city: b.city ?? existing.city,
      tag: b.tag ?? existing.tag,
      host: b.host ?? existing.host,
      long_description:
        b.long_description ?? existing.long_description,
      img: b.img ?? existing.img,
      time: b.time ?? existing.time,
      category: b.category ?? existing.category,
    };

    // 1. Update all event details
    await connection.query(
      `UPDATE events SET
        title = ?,
        category = ?,
        description = ?,
        location = ?,
        city = ?,
        date = ?,
        time = ?,
        total_seats = ?,
        available_seats = ?,
        price = ?,
        img = ?,
        tag = ?,
        host = ?,
        long_description = ?
      WHERE id = ?`,
      [
        update.title,
        update.category,
        update.description,
        update.location,
        update.city,
        update.date,
        update.time,
        update.total_seats,
        update.available_seats,
        update.price,
        update.img,
        update.tag,
        update.host,
        update.long_description,
        req.params.id,
      ]
    );

    // 2. Update ticket categories if provided
    if (Array.isArray(body.tickets)) {
      await connection.query(
        "DELETE FROM event_tickets WHERE event_id = ?",
        [req.params.id]
      );

      for (const ticket of body.tickets) {
        if (!ticket.name?.trim()) continue;

        await connection.query(
          `INSERT INTO event_tickets
            (event_id, name, price, detail)
           VALUES (?, ?, ?, ?)`,
          [
            req.params.id,
            ticket.name.trim(),
            Number(ticket.price),
            ticket.detail || "",
          ]
        );
      }
    }

    // 3. Update included items if provided
    if (Array.isArray(body.includes)) {
      await connection.query(
        "DELETE FROM event_includes WHERE event_id = ?",
        [req.params.id]
      );

      for (const item of body.includes) {
        if (!item?.trim()) continue;

        await connection.query(
          `INSERT INTO event_includes (event_id, item)
           VALUES (?, ?)`,
          [req.params.id, item.trim()]
        );
      }
    }

    // 4. Fetch updated event
    const [rows] = await connection.query(
      "SELECT * FROM events WHERE id = ?",
      [req.params.id]
    );

    const [tickets] = await connection.query(
      "SELECT * FROM event_tickets WHERE event_id = ?",
      [req.params.id]
    );

    const [includes] = await connection.query(
      "SELECT item FROM event_includes WHERE event_id = ?",
      [req.params.id]
    );

    await connection.commit();

    res.json({
      message: "Event updated successfully",
      event: {
        ...rows[0],
        tickets,
        includes: includes.map((item) => item.item),
      },
    });
  } catch (e) {
    if (connection) {
      await connection.rollback();
    }

    console.error("Event update error:", e);

    res.status(500).json({
      message: "Event update failed",
    });
  } finally {
    if (connection) {
      connection.release();
    }
  }
});

router.delete("/:id", auth, adminOnly, async (req, res) => {
  let connection;

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    // Check whether event exists
    const [events] = await connection.query(
      "SELECT id FROM events WHERE id = ? FOR UPDATE",
      [req.params.id]
    );

    if (!events.length) {
      await connection.rollback();
      return res.status(404).json({
        message: "Event not found",
      });
    }

    // Delete related ticket categories
    await connection.query(
      "DELETE FROM event_tickets WHERE event_id = ?",
      [req.params.id]
    );

    // Delete related includes
    await connection.query(
      "DELETE FROM event_includes WHERE event_id = ?",
      [req.params.id]
    );

    // Delete event
    const [result] = await connection.query(
      "DELETE FROM events WHERE id = ?",
      [req.params.id]
    );

    if (!result.affectedRows) {
      await connection.rollback();
      return res.status(404).json({
        message: "Event not found",
      });
    }

    await connection.commit();

    res.json({
      message: "Event, tickets and includes deleted successfully",
    });

  } catch (e) {
    if (connection) {
      await connection.rollback();
    }

    if (e.code === "ER_ROW_IS_REFERENCED_2") {
      return res.status(409).json({
        message: "Cannot delete an event with booking history",
      });
    }

    console.error("Event deletion error:", e);

    res.status(500).json({
      message: "Event deletion failed",
    });

  } finally {
    if (connection) {
      connection.release();
    }
  }
});

export default router;
