import mongoose, { Schema, Document, Types } from "mongoose";
export interface IWorkingHour {
  day: string;
  startTime: string;
  endTime: string;
  isAvailable?: boolean;
}
export interface IConsultationFee {
  inPerson?: number;
  online?: number;
  currency?: string;
}
export interface IDoctor extends Document {
  fullName: string;
  department: string;
  specialization: string[];
  experience?: number;
  qualification?: string;
  languagesSpoken?: string[];
  about?: string;
  contact?: {
    phone?: string;
    email?: string;
  };
  consultationFee?: IConsultationFee;
  workingHours?: IWorkingHour[];
  licenseNumber?: string;
  accountStatus?: "pending" | "active" | "suspended";
}
export interface IDoctor extends Document {
  doctorId: string;
  fullName: string;
  email: string;
  department: string;
  specialization: string[];
  licenseNumber?: string;
  contact?: {
    phone?: string;
    email?: string;
  };
  workingHours?: IWorkingHour[];
  consultationFee?: IConsultationFee;
  accountStatus?: "pending" | "active" | "suspended";
  
    userId?: Types.ObjectId;
}
const doctorSchema = new Schema<IDoctor>(
  {
    doctorId: {
      type: String,
      unique: true,
    },
    fullName: { type: String, required: true },
    department: { type: String, required: true },
    specialization: [{ type: String, required: true }],
    licenseNumber: { type: String, unique: true },
    experience: { type: Number },
    email: { type: String, required: true, unique: true, lowercase: true },
    contact: {
      phone: String,
      email: { type: String, lowercase: true },
    },
    workingHours: [
      {
        day: { type: String, required: true },
        startTime: { type: String, required: true },
        endTime: { type: String, required: true },
        isAvailable: { type: Boolean, default: true },
      },
    ],
    consultationFee: {
      inPerson: { type: Number, default: 0 },
      online: { type: Number, default: 0 },
      currency: { type: String, default: "INR" },
    },
    accountStatus: {
      type: String,
      enum: ["pending", "active", "suspended"],
      default: "pending",
    },
     userId: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);
export default mongoose.model<IDoctor>("Doctor", doctorSchema, "doctors");
