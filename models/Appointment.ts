// import mongoose, { Schema, Document } from "mongoose";
// export interface IAppointment extends Document {
//   appointmentId: string;
//   doctor: mongoose.Types.ObjectId;
//   patient: mongoose.Types.ObjectId;
//   date: string;
//   time: string;
//   reason: string;
//   status: string;
//   notes?: string;
//   appointmentType: Enumerator;
// }
// const AppointmentSchema = new Schema<IAppointment>({
//   appointmentId: { type: String, unique: true },
//   doctor: { type: Schema.Types.ObjectId, ref: "Doctor", required: true },
//   patient: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
//   date: { type: String, required: true },
//   time: { type: String, required: true },
//   reason: { type: String },
//   status: { type: String, default: "Pending" },
//   notes: { type: String },
// });
// // ✅ Auto-generate appointmentId before saving
// AppointmentSchema.pre("save", async function (next) {
//   if (!this.appointmentId) {
//     const count = await mongoose.models.Appointment.countDocuments();
//     this.appointmentId = `A${(count + 1).toString().padStart(3, "0")}`;
//   }
//   next();
// });
// export default mongoose.model<IAppointment>(
//   "Appointment",
//   AppointmentSchema,
//   "appointments"
// );


import mongoose, { Schema, Document } from "mongoose";

export interface IAppointment extends Document {
  appointmentId: string;
  doctor: mongoose.Types.ObjectId;
  patient: mongoose.Types.ObjectId;
  date: string;
  time: string;
  reason: string;
  status: string;
  notes?: string;
  appointmentType: "Online" | "In-person"; // ✅ Add this
}

const AppointmentSchema = new Schema<IAppointment>({
  appointmentId: { type: String, unique: true },
  doctor: { type: Schema.Types.ObjectId, ref: "Doctor", required: true },
  patient: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
  date: { type: String, required: true },
  time: { type: String, required: true },
  reason: { type: String },
  status: { type: String, default: "Pending" },
  notes: { type: String },
  appointmentType: {
    type: String,
    enum: ["Online", "In-person"], // ✅ Define allowed values
    default: "In-person", // optional default
    required: true,
  },
});

// ✅ Auto-generate appointmentId before saving
AppointmentSchema.pre("save", async function (next) {
  if (!this.appointmentId) {
    const count = await mongoose.models.Appointment.countDocuments();
    this.appointmentId = `A${(count + 1).toString().padStart(3, "0")}`;
  }
  next();
});

export default mongoose.model<IAppointment>(
  "Appointment",
  AppointmentSchema,
  "appointments"
);
