import dotenv from "dotenv";
dotenv.config();
import bcrypt from "bcryptjs";
import { pool } from "../src/db.js";

try {
    const email = (
        process.env.ADMIN_EMAIL || "admin@eventora.demo"
    ).toLowerCase();
    const password = process.env.ADMIN_PASSWORD || "change_admin_password";
    const hash = await bcrypt.hash(password, 12);
    await pool.query(
        "INSERT INTO users(name,email,password_hash,role) VALUES(?,?,?,'admin') ON DUPLICATE KEY UPDATE role='admin',password_hash=VALUES(password_hash)", [process.env.ADMIN_NAME || "Eventora Admin", email, hash],
    );
    console.log(
        `Admin seed/upgrade complete for ${email}. Set ADMIN_PASSWORD in .env before running.`,
    );
} catch (e) {
    console.error(e);
    process.exitCode = 1;
} finally {
    await pool.end();
}