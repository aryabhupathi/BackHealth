// import mongoose, { Schema, Document } from "mongoose";
// import { generateId } from "../utils/NewId";
// export interface IAppointment extends Document {
//   appointmentId: string;
//   doctor: mongoose.Types.ObjectId;
//   patient: mongoose.Types.ObjectId;
//   date: Date;
//   time: string;
//   reason?: string;
//   status: "Pending" | "Completed" | "Cancelled" | "Approved";
//   appointmentType: "Online" | "In-person";
// }
// const AppointmentSchema = new Schema(
//   {
//     appointmentId: { type: String, unique: true },
//     doctor: { type: Schema.Types.ObjectId, ref: "Doctor", required: true },
//     patient: { type: Schema.Types.ObjectId, ref: "Patient", required: true },
//     date: { type: Date, required: true },
//     time: { type: String, required: true },
//     reason: String,
//     status: {
//       type: String,
//       enum: ["Pending", "Approved", "Completed", "Cancelled"],
//       default: "Pending",
//     },
//     appointmentType: {
//       type: String,
//       enum: ["Online", "In-person"],
//       default: "In-person",
//     },
//   },
//   { timestamps: true },
// );
// AppointmentSchema.pre("save", async function (next) {
//   if (!this.appointmentId) {
//     this.appointmentId = await generateId({
//       key: "appointment",
//       prefix: "A",
//     });
//   }
//   next();
// });
// export default mongoose.model<IAppointment>(
//   "Appointment",
//   AppointmentSchema,
//   "appointments",
// );


import mongoose, { Schema, Document } from "mongoose";
import { generateId } from "../utils/NewId";

export interface IAppointment extends Document {
  appointmentId: string;
  doctor: mongoose.Types.ObjectId;
  patient: mongoose.Types.ObjectId;

  date: Date;
  time: string;
  reason?: string;

  // Appointment lifecycle
  status: "Pending" | "Approved" | "Completed" | "Cancelled";

  // Mode
  appointmentType: "Online" | "In-person";

  // 💳 Payment-related fields
  paymentStatus:
    | "NOT_REQUIRED"
    | "PENDING"
    | "PAID"
    | "PARTIALLY_PAID"
    | "REFUNDED";

  totalFee: number;
  paidAmount: number;

  paymentRequired: boolean;

  clinicPaymentPolicy?: "PAY_AT_CLINIC" | "BOOKING_FEE" | "FULL_PREPAID";
}

const AppointmentSchema = new Schema(
  {
    appointmentId: { type: String, unique: true },

    doctor: {
      type: Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },

    patient: {
      type: Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
    },

    date: { type: Date, required: true },
    time: { type: String, required: true },
    reason: String,

    status: {
      type: String,
      enum: ["Pending", "Approved", "Completed", "Cancelled"],
      default: "Pending",
    },

    appointmentType: {
      type: String,
      enum: ["Online", "In-person"],
      default: "In-person",
    },

    // 💳 Payment fields
    paymentStatus: {
      type: String,
      enum: ["NOT_REQUIRED", "PENDING", "PAID", "PARTIALLY_PAID", "REFUNDED"],
      default: "PENDING",
    },

    totalFee: {
      type: Number,
      required: true,
    },

    paidAmount: {
      type: Number,
      default: 0,
    },

    paymentRequired: {
      type: Boolean,
      default: false,
    },

    clinicPaymentPolicy: {
      type: String,
      enum: ["PAY_AT_CLINIC", "BOOKING_FEE", "FULL_PREPAID"],
    },
  },
  { timestamps: true },
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
  "appointments",
);
