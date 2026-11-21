import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { pool } from "./db.js";
import authRoutes from "./routes/auth.js";
import eventRoutes from "./routes/events.js";
import bookingRoutes from "./routes/bookings.js";

const app = express();
app.use(helmet());
app.use(cors({ 
    origin: [process.env.CLIENT_ORIGIN || "http://localhost:5173" ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));
app.use(express.json({ limit: "1mb" }));
app.use(
    rateLimit({
        windowMs: 15 * 60 * 1000,
        limit: 250,
        standardHeaders: true,
        legacyHeaders: false,
    }),
);

app.get("/health", async(_req, res) => {
    try {
        await pool.query("SELECT 1");
        res.json({ status: "ok", database: "connected" });
    } catch {
        res.status(503).json({ status: "error", database: "unavailable" });
    }
});
app.use("/auth", authRoutes);
app.use("/events", eventRoutes);
app.use("/bookings", bookingRoutes);
app.use((req, res) => res.status(404).json({ message: "Route not found" }));
app.use((err, _req, res, _next) => {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
});

const port = Number(process.env.PORT || 5000);
app.listen(port, () =>
    console.log(`Eventora API listening at http://localhost:${port}`),
);