import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import mongoose from "mongoose"; 
import userRouter from "./routes/user.routes.js";
import hotelRouter from "./routes/hotel.routes.js";
import roomRouter from "./routes/room.routes.js";
import bookingRouter from "./routes/booking.routes.js";

import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
const allowedOrigins = [
  "http://localhost:5173",
  "https://hotel-booking-frontend-nine-psi.vercel.app",
  "https://hotel-booking-frontend-thangpthes-projects.vercel.app",
  "https://hotel-booking-frontend-lyaetguox-thangpthes-projects.vercel.app"
];

app.use(cors({
    origin: function (origin, callback) {
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            console.log(" Blocked by CORS:", origin);
            callback(null, false);
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cookie"],
    exposedHeaders: ["Set-Cookie"]
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());



// Serve static files (images)
app.use("/images", express.static(path.join(__dirname, "uploads")));

// Health check endpoint
app.get("/", (req, res) => {
  res.json({ 
    status: "ok", 
    message: "Hotel Booking API is running",
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use("/api/user", userRouter);
app.use("/api/hotel", hotelRouter);
app.use("/api/room", roomRouter);
app.use("/api/bookings", bookingRouter);

const MONGO_URI = process.env.MONGO_URI || "mongodb+srv://thethang:thethang@cluster0.xtel9fw.mongodb.net/hotel-booking";

console.log("🔍 MONGO_URI exists:", !!process.env.MONGO_URI);
console.log("🔍 Using URI:", MONGO_URI ? "Connected" : "Missing");

// MongoDB Connection
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("✅ MongoDB connected successfully"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
  });

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    success: false, 
    message: "Something went wrong!",
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ 
    success: false, 
    message: "Route not found" 
  });
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});

console.log("--- DEBUG ENV VARIABLES ---");
console.log("PORT:", process.env.PORT);
console.log("MONGO_URI:", process.env.MONGO_URI ? "Đã nhận" : "KHÔNG CÓ");
console.log("JWT_SECRET:", process.env.JWT_SECRET ? "Đã nhận" : "KHÔNG CÓ (Lỗi tại đây)");
console.log("---------------------------");