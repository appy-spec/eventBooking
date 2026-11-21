
import dotenv from "dotenv";
dotenv.config();

import { pool } from "../src/db.js";
import { events } from "../data/events.js";

let connection;

try {
    connection = await pool.getConnection();
    await connection.beginTransaction();
        
    for (const ev of events) {
        const id = Number(String(ev.id).replace(/^e/, ""));

        const [found] = await connection.query(
            "SELECT id FROM events WHERE id = ?",
            [id]
        );

        const vals = [
            ev.title,
            ev.category,
            ev.description,
            ev.location,
            ev.city || null,
            new Date(ev.date),
            ev.time,
            ev.total,
            ev.available,
            ev.price,
            ev.image || null,
            ev.tag || null,
            ev.host || null,
            ev.long || null,
        ];

        if (found.length) {
            await connection.query(
                `UPDATE events
                SET title=?, category=?, description=?, location=?,
                    city=?, date=?, time=?, total_seats=?, available_seats=?,
                    price=?, img=?, tag=?, host=?, long_description=?
                WHERE id=?`,
                [...vals, id]
            );
        } else {
            await connection.query(
                `INSERT INTO events
                (id, title, category, description, location, city, date, time,
                total_seats, available_seats, price, img, tag, host, long_description)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [id, ...vals]
            );
        }
    }

    for (const ev of events) {
        const eventId = Number(String(ev.id).replace(/^e/, ""));

        for (const ticket of ev.tickets) {
            const [found] = await connection.query(
                `SELECT id FROM event_tickets
                 WHERE event_id=? AND name=?`,
                [eventId, ticket.name]
            );

            const vals = [
                ticket.name,
                ticket.price,
                ticket.detail,
            ];

            if (found.length) {
                await connection.query(
                    `UPDATE event_tickets
                     SET name=?, price=?, detail=?
                     WHERE id=?`,
                    [...vals, found[0].id]
                );
            } else {
                await connection.query(
                    `INSERT INTO event_tickets
                     (event_id, name, price, detail)
                     VALUES (?, ?, ?, ?)`,
                    [eventId, ...vals]
                );
            }
        }
    }

    for (const ev of events) {
        const eventId = Number(String(ev.id).replace(/^e/, ""));

        for (const item of ev.includes) {
            const [found] = await connection.query(
                `SELECT id FROM event_includes
                 WHERE event_id=? AND item=?`,
                [eventId, item]
            );

            if (found.length) {
                await connection.query(
                    `UPDATE event_includes
                     SET item=?
                     WHERE id=?`,
                    [item, found[0].id]
                );
            } else {
                await connection.query(
                    `INSERT INTO event_includes (event_id, item)
                     VALUES (?, ?)`,
                    [eventId, item]
                );
            }
        }
    }

    await connection.commit();

    console.log("Events, tickets and includes seeded successfully!");
    console.log(`Total events: ${events.length}`);

} catch (e) {
    if (connection) {
        await connection.rollback();
    }

    console.error("Seeding failed:", e);
    process.exitCode = 1;

} finally {
    if (connection) {
        connection.release();
    }

    await pool.end();
}
