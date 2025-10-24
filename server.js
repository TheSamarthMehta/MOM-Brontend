import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { connectDB } from "./src/config/db.js";
import authRoutes from "./src/routes/authRoutes.js";
import staffRoutes from "./src/routes/staffRoutes.js";
import meetingTypeRoutes from "./src/routes/meetingTypeRoutes.js";
import meetingRoutes from "./src/routes/meetingRoutes.js";
import meetingMemberRoutes from "./src/routes/meetingMemberRoutes.js";
import meetingDocumentRoutes from "./src/routes/meetingDocumentRoutes.js";
import dashboardRoutes from "./src/routes/dashboardRoutes.js";
import uploadRoutes from "./src/routes/uploadRoutes.js";

dotenv.config();

const app = express();

// Minimal middleware
app.use(cors());
app.use(express.json());

// Health check route
app.get("/", (req, res) => {
  res.send("Backend server is running and connected to DB.");
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/staff", staffRoutes);
app.use("/api/meeting-types", meetingTypeRoutes);
app.use("/api/meetings", meetingRoutes);
app.use("/api/meeting-members", meetingMemberRoutes);
app.use("/api/meeting-documents", meetingDocumentRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/upload", uploadRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  res
    .status(err.status || 500)
    .json({ success: false, message: err.message || "Internal Server Error" });
});

// Ensure DB is connected before starting server
await connectDB();

const PORT = process.env.PORT || 8800;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
