import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import loginRoutes from "./routes/LoginRoutes";
import patientRoutes from "./routes/PatientRoutes";
import doctorRoutes from "./routes/DoctorRoutes";
import appointmentRoutes from "./routes/AppointmentRoutes";
import prescriptionRoutes from "./routes/PrescriptionRoutes";
import testRoutes from "./routes/LabRoutes"
import express from "express";
dotenv.config();
const app = express();
const allowedOrigins = [
  "http://localhost:5173",
  "https://front-health.vercel.app",
];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: "GET,POST,PUT,PATCH,DELETE",
    credentials: true,
  })
);
app.use(express.json());
mongoose.connect(
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/healthcare"
);
app.use("/auth", loginRoutes);
app.use("/patient", patientRoutes);
app.use("/doctor", doctorRoutes);
app.use("/appointment", appointmentRoutes);
app.use("/prescription", prescriptionRoutes);
app.use("/labtests", testRoutes);
app.get("/", (req, res) => {
  res.send("Backend health is working!");
});
const PORT = process.env.PORT;
app.listen(PORT, () => {
  console.log(`Server is live on port ${PORT}`);
});
export default app;
