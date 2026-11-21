import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../db.js";
import { auth } from "../middleware/auth.js";

const router = Router();

const tokenFor = (user) =>
    jwt.sign({ id: user.id, email: user.email, role: user.role },
        process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "1d" },
    );

router.post("/signup", async (req, res) => {
    try {
        const { name, email, password } = req.body || {};
        if (!name?.trim() || !email?.trim() || !password)
            return resS
                .status(400)
                .json({ message: "Name, email and password are required" });
        if (password.length < 8)
            return res
                .status(400)
                .json({ message: "Password must be at least 8 characters" });
        const [existing] = await pool.query("SELECT id FROM users WHERE email=?", [
            email.toLowerCase().trim(),
        ]);
        if (existing.length)
            return res.status(409).json({ message: "Email is already registered" });
        const hash = await bcrypt.hash(password, 12);
        const [result] = await pool.query(
            "INSERT INTO users(name,email,password_hash,role) VALUES(?,?,?,'user')", [name.trim(), email.toLowerCase().trim(), hash],
        );
        const user = {
            id: result.insertId,
            name,
            email: email.toLowerCase().trim(),
            role: "user",
        };
        res.status(201).json({ token: tokenFor(user), user });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Signup failed" });
    }
});

router.post("/login", async (req, res) => {
    try {
        const { email, password } = req.body || {};
        if (!email || !password)
            return res.status(400).json({ message: "Email and password required" });
        const [rows] = await pool.query(
            "SELECT id,name,email,password_hash,role FROM users WHERE email=?", [email.toLowerCase().trim()],
        );
        const user = rows[0];
        if (!user || !(await bcrypt.compare(password, user.password_hash)))
            return res.status(401).json({ message: "Invalid email or password" });
        const publicUser = {
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
        };
        res.json({ token: tokenFor(publicUser), user: publicUser });
    } catch (e) {
        console.error(e);
        res.status(500).json({ message: "Login failed" });
    }
});

router.get("/me", auth, async (req, res) => {
    const [rows] = await pool.query(
        "SELECT id,name,email,role,created_at FROM users WHERE id=?", [req.user.id],
    );
    if (!rows.length) return res.status(404).json({ message: "User not found" });
    res.json({ user: rows[0] });
});

export default router;