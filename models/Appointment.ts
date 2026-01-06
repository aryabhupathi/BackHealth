import mongoose, { Schema, Document } from "mongoose";
import { generateId } from "../utils/NewId";
export interface IAppointment extends Document {
  appointmentId: string;
  doctor: mongoose.Types.ObjectId;
  patient: mongoose.Types.ObjectId;
  date: string;
  time: string;
  reason?: string;
  status: "Pending" | "Completed" | "Cancelled";
  appointmentType: "Online" | "In-person";
}
const AppointmentSchema = new Schema(
  {
    appointmentId: { type: String, unique: true },
    doctor: { type: Schema.Types.ObjectId, ref: "Doctor", required: true },
    patient: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
    date: { type: String, required: true },
    time: { type: String, required: true },
    reason: String,
    status: {
      type: String,
      enum: ["Pending", "Completed", "Cancelled"],
      default: "Pending",
    },
    appointmentType: {
      type: String,
      enum: ["Online", "In-person"],
      default: "In-person",
    },
  },
  { timestamps: true }
);
AppointmentSchema.pre("save", async function (next) {
  if (!this.appointmentId) {
    this.appointmentId = await generateId({
      key: "appointment",
      prefix: "A",
    });
  }
  next();
});
export default mongoose.model<IAppointment>(
  "Appointment",
  AppointmentSchema,
  "appointments"
);
