// import express from "express";
// import cors from "cors";
// import cookieParser from "cookie-parser";
// import dotenv from "dotenv";
// import { connectDB } from "./config/connectDB.js";
// import userRouter from "./routes/user.routes.js";
// import hotelRouter from "./routes/hotel.routes.js";
// import roomRouter from "./routes/room.routes.js";
// import bookingRouter from "./routes/booking.routes.js";

// import path from "path";
// import { fileURLToPath } from "url";
// dotenv.config();
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const app = express();

// //db connection
// connectDB();

// //middlleware
// app.use(express.json());
// app.use(cors({
//   origin: process.env.NODE_ENV === 'production' 
//     ? process.env.CLIENT_URL 
//     : 'http://localhost:5173',
//   credentials: true
// }));
// app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());

// //API endpoint
// app.get("/",(req,res)=> {
//     res.send("Hello world");
// })

// app.use("/images",express.static("uploads"));
// app.use("/api/user",userRouter);
// app.use("/api/hotel",hotelRouter);
// app.use("/api/room",roomRouter);
// app.use("/api/bookings",bookingRouter);

// mongoose
//   .connect(process.env.MONGO_URI)
//   .then(() => console.log("MongoDB connected"))
//   .catch((err) => console.log("MongoDB error:", err));

// // Serve frontend in production
// if (process.env.NODE_ENV === "production") {
//   const clientBuildPath = path.join(__dirname, "../client/dist");
//   app.use(express.static(clientBuildPath));
  
//   app.get("*", (req, res) => {
//     res.sendFile(path.join(clientBuildPath, "index.html"));
//   });
// }

// // For Vercel, export app instead of listening
// export default app;

// // For local development
// if (process.env.NODE_ENV !== "production") {
//   const PORT = process.env.PORT || 5000;
//   app.listen(PORT, () => {
//     console.log(`Server running on port ${PORT}`);
//   });
// }

// // const PORT = process.env.PORT || 5000;
// // app.listen(PORT, () => {
// //     console.log(`Server is running on port ${PORT}`);  
// // })

// import express from "express";
// import cors from "cors";
// import cookieParser from "cookie-parser";
// import dotenv from "dotenv";
// import { connectDB } from "./config/connectDB.js";
// import userRouter from "./routes/user.routes.js";
// import hotelRouter from "./routes/hotel.routes.js";
// import roomRouter from "./routes/room.routes.js";
// import bookingRouter from "./routes/booking.routes.js";

// import path from "path";
// import { fileURLToPath } from "url";

// dotenv.config();

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const app = express();

// // Database connection
// connectDB();

// // Middleware
// app.use(express.json());
// app.use(cors({
//   origin: process.env.CLIENT_URL || 'http://localhost:5173',
//   credentials: true
// }));
// app.use(express.urlencoded({ extended: true }));
// app.use(cookieParser());

// // Serve static files (images)
// app.use("/images", express.static(path.join(__dirname, "uploads")));

// // Health check endpoint
// app.get("/", (req, res) => {
//   res.json({ 
//     status: "ok", 
//     message: "Hotel Booking API is running",
//     timestamp: new Date().toISOString()
//   });
// });

// // API Routes
// app.use("/api/user", userRouter);
// app.use("/api/hotel", hotelRouter);
// app.use("/api/room", roomRouter);
// app.use("/api/bookings", bookingRouter);

// // Error handling middleware
// app.use((err, req, res, next) => {
//   console.error(err.stack);
//   res.status(500).json({ 
//     success: false, 
//     message: "Something went wrong!",
//     error: process.env.NODE_ENV === 'development' ? err.message : undefined
//   });
// });

// // 404 handler
// app.use((req, res) => {
//   res.status(404).json({ 
//     success: false, 
//     message: "Route not found" 
//   });
// });

// // Start server
// const PORT = process.env.PORT || 5000;
// app.listen(PORT, () => {
//   console.log(`Server is running on port ${PORT}`);
//   console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
// });

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import mongoose from "mongoose"; // ← THÊM DÒNG NÀY
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
app.use(express.json());
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));
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

// MongoDB Connection
mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => {
    console.error(" MongoDB connection error:", err);
    process.exit(1); // Exit if cannot connect to DB
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